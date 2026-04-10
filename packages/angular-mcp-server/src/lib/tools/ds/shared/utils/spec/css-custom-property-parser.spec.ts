import { describe, it, expect } from 'vitest';
import * as path from 'node:path';

import {
  extractCustomPropertiesFromContent,
  parseCssCustomProperties,
} from '../css-custom-property-parser.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Wraps declarations in a :root block for realistic CSS content. */
function cssRoot(declarations: string): string {
  return `:root {\n${declarations}\n}`;
}

// ---------------------------------------------------------------------------
// Unit Tests — extractCustomPropertiesFromContent
// ---------------------------------------------------------------------------

describe('extractCustomPropertiesFromContent', () => {
  it('extracts basic --name: value; pairs', () => {
    const css = cssRoot(`
      --color-primary: #ff0000;
      --spacing-sm: 4px;
    `);
    const result = extractCustomPropertiesFromContent(css);

    expect(result.get('--color-primary')).toBe('#ff0000');
    expect(result.get('--spacing-sm')).toBe('4px');
    expect(result.size).toBe(2);
  });

  it('extracts multi-line declarations', () => {
    const css = cssRoot(`
      --gradient-bg: linear-gradient(
        to right,
        #ff0000,
        #00ff00
      );
      --simple: blue;
    `);
    const result = extractCustomPropertiesFromContent(css);

    // The regex captures everything up to the semicolon
    expect(result.has('--gradient-bg')).toBe(true);
    expect(result.get('--simple')).toBe('blue');
  });

  it('strips comments and does not extract properties inside comments', () => {
    const css = cssRoot(`
      /* --commented-out: should-not-appear; */
      --real-prop: visible;
      /* 
        --multi-line-comment: also-hidden;
        --another-hidden: nope;
      */
      --another-real: yes;
    `);
    const result = extractCustomPropertiesFromContent(css);

    expect(result.has('--commented-out')).toBe(false);
    expect(result.has('--multi-line-comment')).toBe(false);
    expect(result.has('--another-hidden')).toBe(false);
    expect(result.get('--real-prop')).toBe('visible');
    expect(result.get('--another-real')).toBe('yes');
    expect(result.size).toBe(2);
  });

  it('preserves var() references in values', () => {
    const css = cssRoot(`
      --color-primary: #86b521;
      --button-bg: var(--color-primary);
      --button-border: var(--color-primary, #000);
    `);
    const result = extractCustomPropertiesFromContent(css);

    expect(result.get('--button-bg')).toBe('var(--color-primary)');
    expect(result.get('--button-border')).toBe('var(--color-primary, #000)');
  });

  it('returns empty Map for empty content', () => {
    const result = extractCustomPropertiesFromContent('');
    expect(result.size).toBe(0);
  });

  it('returns empty Map for content with no custom properties', () => {
    const css = `body { color: red; font-size: 16px; }`;
    const result = extractCustomPropertiesFromContent(css);
    expect(result.size).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Unit Tests — parseCssCustomProperties (file-based)
// ---------------------------------------------------------------------------

describe('parseCssCustomProperties', () => {
  it('returns empty Map for non-existent file', () => {
    const result = parseCssCustomProperties(
      path.join(__dirname, 'this-file-does-not-exist.css'),
    );
    expect(result).toBeInstanceOf(Map);
    expect(result.size).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Unit Tests — propertyPrefix filtering
// ---------------------------------------------------------------------------

describe('extractCustomPropertiesFromContent — propertyPrefix filtering', () => {
  const css = cssRoot(`
    --semantic-color-primary: #ff0000;
    --semantic-color-secondary: #00ff00;
    --semantic-spacing-sm: 4px;
    --ds-button-bg: var(--semantic-color-primary);
    --other-prop: 10px;
  `);

  it('returns all properties when propertyPrefix is null', () => {
    const result = extractCustomPropertiesFromContent(css, {
      propertyPrefix: null,
    });
    expect(result.size).toBe(5);
  });

  it('returns all properties when propertyPrefix is undefined', () => {
    const result = extractCustomPropertiesFromContent(css);
    expect(result.size).toBe(5);
  });

  it('filters by prefix --semantic-color', () => {
    const result = extractCustomPropertiesFromContent(css, {
      propertyPrefix: '--semantic-color',
    });
    expect(result.size).toBe(2);
    expect(result.has('--semantic-color-primary')).toBe(true);
    expect(result.has('--semantic-color-secondary')).toBe(true);
  });

  it('filters by prefix --ds-', () => {
    const result = extractCustomPropertiesFromContent(css, {
      propertyPrefix: '--ds-',
    });
    expect(result.size).toBe(1);
    expect(result.has('--ds-button-bg')).toBe(true);
  });

  it('returns empty Map when no properties match prefix', () => {
    const result = extractCustomPropertiesFromContent(css, {
      propertyPrefix: '--nonexistent-',
    });
    expect(result.size).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Property-Based Tests (parameterised)
// ---------------------------------------------------------------------------

/**
 * **Validates: Requirements 3.1, 3.5**
 * Property 4: CSS custom property parsing round-trip
 *
 * For any set of valid CSS custom property declarations, embedding them in a
 * CSS :root block and parsing with extractCustomPropertiesFromContent SHALL
 * produce a Map containing every original name-value pair.
 */
describe('Property 4: CSS custom property parsing round-trip', () => {
  const testCases = [
    {
      label: 'simple color tokens',
      properties: [
        ['--color-red', '#ff0000'],
        ['--color-green', '#00ff00'],
        ['--color-blue', '#0000ff'],
      ] as [string, string][],
    },
    {
      label: 'spacing tokens with various units',
      properties: [
        ['--spacing-xs', '2px'],
        ['--spacing-sm', '0.25rem'],
        ['--spacing-md', '1em'],
        ['--spacing-lg', '24px'],
      ] as [string, string][],
    },
    {
      label: 'tokens with var() references',
      properties: [
        ['--base-color', '#86b521'],
        ['--button-bg', 'var(--base-color)'],
        ['--button-border', 'var(--base-color, #000)'],
      ] as [string, string][],
    },
    {
      label: 'tokens with complex values',
      properties: [
        ['--font-family', 'Arial, Helvetica, sans-serif'],
        ['--shadow', '0 2px 4px rgba(0, 0, 0, 0.1)'],
        ['--transition', 'all 0.3s ease-in-out'],
      ] as [string, string][],
    },
    {
      label: 'single token',
      properties: [['--only-one', '42px']] as [string, string][],
    },
    {
      label: 'tokens with hyphens and numbers in names',
      properties: [
        ['--z-index-100', '100'],
        ['--line-height-1-5', '1.5'],
        ['--border-radius-2xl', '16px'],
      ] as [string, string][],
    },
  ];

  it.each(testCases)(
    'round-trips all properties: $label',
    ({ properties }) => {
      const declarations = properties
        .map(([name, value]) => `  ${name}: ${value};`)
        .join('\n');
      const css = cssRoot(declarations);

      const result = extractCustomPropertiesFromContent(css);

      for (const [name, value] of properties) {
        expect(result.get(name)).toBe(value);
      }
      expect(result.size).toBe(properties.length);
    },
  );
});

/**
 * **Validates: Requirements 3.4**
 * Property 5: CSS parser ignores comments
 *
 * For any CSS content where custom property patterns appear only inside
 * comments, extractCustomPropertiesFromContent SHALL return an empty Map.
 */
describe('Property 5: CSS parser ignores comments', () => {
  const commentOnlyCases = [
    {
      label: 'single-line comment with property',
      css: `/* --hidden: value; */`,
    },
    {
      label: 'multi-line comment with multiple properties',
      css: `/*\n  --hidden-a: red;\n  --hidden-b: blue;\n*/`,
    },
    {
      label: 'multiple separate comments',
      css: `/* --a: 1; */\n/* --b: 2; */\n/* --c: 3; */`,
    },
    {
      label: 'comment inside :root block',
      css: `:root {\n  /* --inside-root: hidden; */\n}`,
    },
    {
      label: 'nested-looking comment',
      css: `/* :root { --nested: val; } */`,
    },
    {
      label: 'comment with var() reference',
      css: `/* --ref: var(--other); */`,
    },
    {
      label: 'empty comment',
      css: `/* */`,
    },
  ];

  it.each(commentOnlyCases)(
    'returns empty Map: $label',
    ({ css }) => {
      const result = extractCustomPropertiesFromContent(css);
      expect(result.size).toBe(0);
    },
  );

  // Also verify that real properties adjacent to comments ARE extracted
  it('extracts real properties while ignoring commented ones', () => {
    const css = `
      /* --hidden: nope; */
      :root {
        --visible: yes;
        /* --also-hidden: nope; */
        --also-visible: yes;
      }
    `;
    const result = extractCustomPropertiesFromContent(css);
    expect(result.size).toBe(2);
    expect(result.has('--visible')).toBe(true);
    expect(result.has('--also-visible')).toBe(true);
    expect(result.has('--hidden')).toBe(false);
    expect(result.has('--also-hidden')).toBe(false);
  });
});

/**
 * **Validates: Requirements 4.5, 4.6**
 * Property 6: Property prefix filtering
 *
 * For any set of custom properties and any non-null propertyPrefix, only
 * properties whose name starts with the given prefix SHALL be included.
 * When propertyPrefix is null, all properties SHALL be included.
 */
describe('Property 6: Property prefix filtering', () => {
  const allProperties: [string, string][] = [
    ['--semantic-color-primary', '#ff0000'],
    ['--semantic-color-secondary', '#00ff00'],
    ['--semantic-spacing-sm', '4px'],
    ['--semantic-spacing-md', '8px'],
    ['--semantic-radius-sm', '2px'],
    ['--ds-button-bg', 'var(--semantic-color-primary)'],
    ['--ds-card-padding', '16px'],
    ['--other-misc', '1'],
  ];

  const declarations = allProperties
    .map(([name, value]) => `  ${name}: ${value};`)
    .join('\n');
  const css = cssRoot(declarations);

  const prefixCases = [
    {
      label: 'prefix --semantic-color matches 2 tokens',
      prefix: '--semantic-color',
      expectedCount: 2,
      expectedNames: ['--semantic-color-primary', '--semantic-color-secondary'],
    },
    {
      label: 'prefix --semantic-spacing matches 2 tokens',
      prefix: '--semantic-spacing',
      expectedCount: 2,
      expectedNames: ['--semantic-spacing-sm', '--semantic-spacing-md'],
    },
    {
      label: 'prefix --semantic- matches 5 tokens',
      prefix: '--semantic-',
      expectedCount: 5,
      expectedNames: [
        '--semantic-color-primary',
        '--semantic-color-secondary',
        '--semantic-spacing-sm',
        '--semantic-spacing-md',
        '--semantic-radius-sm',
      ],
    },
    {
      label: 'prefix --ds- matches 2 tokens',
      prefix: '--ds-',
      expectedCount: 2,
      expectedNames: ['--ds-button-bg', '--ds-card-padding'],
    },
    {
      label: 'prefix --nonexistent- matches 0 tokens',
      prefix: '--nonexistent-',
      expectedCount: 0,
      expectedNames: [],
    },
  ];

  it.each(prefixCases)(
    '$label',
    ({ prefix, expectedCount, expectedNames }) => {
      const result = extractCustomPropertiesFromContent(css, {
        propertyPrefix: prefix,
      });
      expect(result.size).toBe(expectedCount);
      for (const name of expectedNames) {
        expect(result.has(name)).toBe(true);
      }
    },
  );

  it('null prefix includes all properties', () => {
    const result = extractCustomPropertiesFromContent(css, {
      propertyPrefix: null,
    });
    expect(result.size).toBe(allProperties.length);
    for (const [name] of allProperties) {
      expect(result.has(name)).toBe(true);
    }
  });

  it('undefined options includes all properties', () => {
    const result = extractCustomPropertiesFromContent(css);
    expect(result.size).toBe(allProperties.length);
  });
});
