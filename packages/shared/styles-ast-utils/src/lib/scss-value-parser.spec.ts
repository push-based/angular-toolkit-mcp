import { describe, expect, it } from 'vitest';

import { parseScssContent, ScssPropertyEntry } from './scss-value-parser.js';

// ---------------------------------------------------------------------------
// Unit Tests
// ---------------------------------------------------------------------------

describe('SCSS Value Parser', () => {
  describe('basic property-value extraction', () => {
    it('should extract property, value, selector, and line number', async () => {
      const scss = `.button {
  color: red;
  padding: 8px;
}`;
      const result = await parseScssContent(scss, 'test.scss');

      expect(result.entries).toHaveLength(2);
      expect(result.entries[0]).toMatchObject({
        property: 'color',
        value: 'red',
        selector: '.button',
      });
      expect(result.entries[0].line).toBe(2);
      expect(result.entries[1]).toMatchObject({
        property: 'padding',
        value: '8px',
        selector: '.button',
        line: 3,
      });
    });
  });

  describe('nested selectors', () => {
    it('should produce correct selector path for nested rules', async () => {
      const scss = `.card {
  .header {
    font-size: 16px;
  }
}`;
      const result = await parseScssContent(scss, 'test.scss');

      expect(result.entries).toHaveLength(1);
      expect(result.entries[0]).toMatchObject({
        property: 'font-size',
        value: '16px',
        selector: '.card .header',
      });
    });

    it('should handle deeply nested selectors', async () => {
      const scss = `.wrapper {
  .card {
    .title {
      color: blue;
    }
  }
}`;
      const result = await parseScssContent(scss, 'test.scss');

      expect(result.entries).toHaveLength(1);
      expect(result.entries[0]).toMatchObject({
        selector: '.wrapper .card .title',
        property: 'color',
        value: 'blue',
      });
    });
  });

  describe('::ng-deep blocks', () => {
    it('should handle ::ng-deep in selector path', async () => {
      const scss = `:host {
  ::ng-deep {
    .inner {
      margin: 4px;
    }
  }
}`;
      const result = await parseScssContent(scss, 'test.scss');

      expect(result.entries).toHaveLength(1);
      expect(result.entries[0]).toMatchObject({
        property: 'margin',
        value: '4px',
        selector: ':host ::ng-deep .inner',
      });
    });
  });

  describe(':host context selectors', () => {
    it('should handle :host as top-level selector', async () => {
      const scss = `:host {
  display: block;
}`;
      const result = await parseScssContent(scss, 'test.scss');

      expect(result.entries).toHaveLength(1);
      expect(result.entries[0]).toMatchObject({
        property: 'display',
        value: 'block',
        selector: ':host',
      });
    });

    it('should handle :host with nested children', async () => {
      const scss = `:host {
  .content {
    padding: 12px;
  }
}`;
      const result = await parseScssContent(scss, 'test.scss');

      expect(result.entries).toHaveLength(1);
      expect(result.entries[0]).toMatchObject({
        selector: ':host .content',
        property: 'padding',
        value: '12px',
      });
    });
  });

  describe('classification: declaration', () => {
    it('should classify property starting with componentTokenPrefix as declaration', async () => {
      const scss = `:host {
  --ds-button-bg: #ff0000;
}`;
      const result = await parseScssContent(scss, 'test.scss');

      expect(result.entries).toHaveLength(1);
      expect(result.entries[0].classification).toBe('declaration');
    });
  });

  describe('classification: consumption', () => {
    it('should classify value containing var(--*) as consumption', async () => {
      const scss = `.button {
  background: var(--semantic-color-primary);
}`;
      const result = await parseScssContent(scss, 'test.scss');

      expect(result.entries).toHaveLength(1);
      expect(result.entries[0].classification).toBe('consumption');
    });
  });

  describe('classification: plain', () => {
    it('should classify regular properties as plain', async () => {
      const scss = `.button {
  color: red;
  padding: 8px;
}`;
      const result = await parseScssContent(scss, 'test.scss');

      expect(result.entries).toHaveLength(2);
      expect(result.entries[0].classification).toBe('plain');
      expect(result.entries[1].classification).toBe('plain');
    });
  });

  describe('configurable componentTokenPrefix', () => {
    it('should use custom prefix for declaration classification', async () => {
      const scss = `:host {
  --custom-button-bg: #ff0000;
  --ds-button-bg: #00ff00;
}`;
      const result = await parseScssContent(scss, 'test.scss', {
        componentTokenPrefix: '--custom-',
      });

      const customEntry = result.entries.find(
        (e) => e.property === '--custom-button-bg',
      );
      const dsEntry = result.entries.find(
        (e) => e.property === '--ds-button-bg',
      );

      expect(customEntry?.classification).toBe('declaration');
      expect(dsEntry?.classification).not.toBe('declaration');
    });
  });

  describe('query methods', () => {
    it('getBySelector returns entries for a specific selector', async () => {
      const scss = `.a { color: red; }
.b { color: blue; }`;
      const result = await parseScssContent(scss, 'test.scss');

      const aEntries = result.getBySelector('.a');
      expect(aEntries).toHaveLength(1);
      expect(aEntries[0].value).toBe('red');
    });

    it('getDeclarations returns only declaration entries', async () => {
      const scss = `:host {
  --ds-btn-bg: #fff;
  color: var(--ds-btn-bg);
  padding: 8px;
}`;
      const result = await parseScssContent(scss, 'test.scss');

      const declarations = result.getDeclarations();
      expect(declarations).toHaveLength(1);
      expect(declarations[0].property).toBe('--ds-btn-bg');
    });

    it('getConsumptions returns only consumption entries', async () => {
      const scss = `:host {
  --ds-btn-bg: #fff;
  color: var(--ds-btn-bg);
  padding: 8px;
}`;
      const result = await parseScssContent(scss, 'test.scss');

      const consumptions = result.getConsumptions();
      expect(consumptions).toHaveLength(1);
      expect(consumptions[0].property).toBe('color');
    });
  });
});

// ---------------------------------------------------------------------------
// Property-Based Tests (parameterised)
// ---------------------------------------------------------------------------

/**
 * **Validates: Requirements 8.1**
 * Property 18: SCSS property extraction round-trip
 *
 * For any SCSS content with known selectors and property-value declarations,
 * parseScssContent SHALL return entries containing every original property-value
 * pair with the correct selector and line number.
 */
describe('Property 18: SCSS property extraction round-trip', () => {
  const testCases = [
    {
      label: 'single selector with multiple properties',
      scss: `.button {\n  color: red;\n  padding: 8px;\n}`,
      expected: [
        { selector: '.button', property: 'color', value: 'red', line: 2 },
        { selector: '.button', property: 'padding', value: '8px', line: 3 },
      ],
    },
    {
      label: 'nested selectors',
      scss: `.card {\n  .title {\n    font-weight: bold;\n  }\n}`,
      expected: [
        {
          selector: '.card .title',
          property: 'font-weight',
          value: 'bold',
          line: 3,
        },
      ],
    },
    {
      label: ':host with nested child',
      scss: `:host {\n  display: block;\n  .inner {\n    margin: 0;\n  }\n}`,
      expected: [
        { selector: ':host', property: 'display', value: 'block', line: 2 },
        {
          selector: ':host .inner',
          property: 'margin',
          value: '0',
          line: 4,
        },
      ],
    },
    {
      label: '::ng-deep with nested selector',
      scss: `:host {\n  ::ng-deep {\n    .deep-child {\n      color: green;\n    }\n  }\n}`,
      expected: [
        {
          selector: ':host ::ng-deep .deep-child',
          property: 'color',
          value: 'green',
          line: 4,
        },
      ],
    },
    {
      label: 'token declarations and consumptions mixed',
      scss: `:host {\n  --ds-btn-bg: #ff0000;\n  background: var(--ds-btn-bg);\n  padding: 8px;\n}`,
      expected: [
        {
          selector: ':host',
          property: '--ds-btn-bg',
          value: '#ff0000',
          line: 2,
        },
        {
          selector: ':host',
          property: 'background',
          value: 'var(--ds-btn-bg)',
          line: 3,
        },
        { selector: ':host', property: 'padding', value: '8px', line: 4 },
      ],
    },
    {
      label: 'multiple top-level selectors',
      scss: `.a {\n  color: red;\n}\n.b {\n  color: blue;\n}`,
      expected: [
        { selector: '.a', property: 'color', value: 'red', line: 2 },
        { selector: '.b', property: 'color', value: 'blue', line: 5 },
      ],
    },
  ];

  it.each(testCases)(
    'round-trips all entries: $label',
    async ({ scss, expected }) => {
      const result = await parseScssContent(scss, 'test.scss');

      expect(result.entries).toHaveLength(expected.length);
      for (let i = 0; i < expected.length; i++) {
        expect(result.entries[i]).toMatchObject(expected[i]);
      }
    },
  );
});

/**
 * **Validates: Requirements 9.1, 9.3**
 * Property 19: Token declaration classification by configurable prefix
 *
 * For any CSS property name and any componentTokenPrefix, the SCSS Value Parser
 * SHALL classify the property as 'declaration' if and only if the property name
 * starts with the configured prefix.
 */
describe('Property 19: Token declaration classification by configurable prefix', () => {
  const testCases = [
    {
      label: 'default prefix --ds- matches --ds-button-bg',
      prefix: '--ds-',
      property: '--ds-button-bg',
      value: '#ff0000',
      expectedClassification: 'declaration' as const,
    },
    {
      label: 'default prefix --ds- does not match --semantic-color',
      prefix: '--ds-',
      property: '--semantic-color',
      value: '#ff0000',
      expectedClassification: 'plain' as const,
    },
    {
      label: 'custom prefix --app- matches --app-header-bg',
      prefix: '--app-',
      property: '--app-header-bg',
      value: 'blue',
      expectedClassification: 'declaration' as const,
    },
    {
      label: 'custom prefix --app- does not match --ds-button-bg',
      prefix: '--app-',
      property: '--ds-button-bg',
      value: 'red',
      expectedClassification: 'plain' as const,
    },
    {
      label: 'prefix --comp- matches --comp-card-radius',
      prefix: '--comp-',
      property: '--comp-card-radius',
      value: '4px',
      expectedClassification: 'declaration' as const,
    },
    {
      label: 'empty-ish prefix -- matches any custom property',
      prefix: '--',
      property: '--anything',
      value: '10px',
      expectedClassification: 'declaration' as const,
    },
  ];

  it.each(testCases)(
    '$label',
    async ({ prefix, property, value, expectedClassification }) => {
      const scss = `:host {\n  ${property}: ${value};\n}`;
      const result = await parseScssContent(scss, 'test.scss', {
        componentTokenPrefix: prefix,
      });

      expect(result.entries).toHaveLength(1);
      expect(result.entries[0].classification).toBe(expectedClassification);
    },
  );
});

/**
 * **Validates: Requirements 9.2**
 * Property 20: Token consumption classification by var() reference
 *
 * For any CSS value string, the SCSS Value Parser SHALL classify the entry as
 * 'consumption' if and only if the value contains a var(--*) reference.
 */
describe('Property 20: Token consumption classification by var() reference', () => {
  const testCases = [
    {
      label: 'simple var() reference',
      value: 'var(--semantic-color-primary)',
      expectedClassification: 'consumption' as const,
    },
    {
      label: 'var() with fallback',
      value: 'var(--color-primary, #000)',
      expectedClassification: 'consumption' as const,
    },
    {
      label: 'var() embedded in calc()',
      value: 'calc(var(--spacing-md) * 2)',
      expectedClassification: 'consumption' as const,
    },
    {
      label: 'plain hex color',
      value: '#ff0000',
      expectedClassification: 'plain' as const,
    },
    {
      label: 'plain pixel value',
      value: '16px',
      expectedClassification: 'plain' as const,
    },
    {
      label: 'plain keyword',
      value: 'block',
      expectedClassification: 'plain' as const,
    },
    {
      label: 'plain rgba value',
      value: 'rgba(0, 0, 0, 0.5)',
      expectedClassification: 'plain' as const,
    },
    {
      label: 'multiple var() references',
      value: 'var(--a) var(--b)',
      expectedClassification: 'consumption' as const,
    },
  ];

  it.each(testCases)(
    '$label → $expectedClassification',
    async ({ value, expectedClassification }) => {
      // Use a regular property name so it won't be classified as 'declaration'
      const scss = `.test {\n  color: ${value};\n}`;
      const result = await parseScssContent(scss, 'test.scss');

      expect(result.entries).toHaveLength(1);
      expect(result.entries[0].classification).toBe(expectedClassification);
    },
  );
});
