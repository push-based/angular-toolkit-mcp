import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

import { loadTokenDataset } from '../token-dataset-loader.js';
import { TokensConfigSchema } from '../../../../../validation/angular-mcp-server-options.schema.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns default TokensConfig from the Zod schema. */
function defaultTokensConfig() {
  return TokensConfigSchema.parse({});
}

/** Creates a CSS file with custom property declarations inside :root. */
function writeCssFile(filePath: string, declarations: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `:root {\n${declarations}\n}\n`, 'utf-8');
}

// ---------------------------------------------------------------------------
// Temp directory management
// ---------------------------------------------------------------------------

let tmpRoot: string;

beforeAll(() => {
  tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'token-loader-test-'));
});

afterAll(() => {
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

/** Creates a unique sub-directory under tmpRoot for each test scenario. */
function makeTempDir(name: string): string {
  const dir = path.join(tmpRoot, name);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

// ---------------------------------------------------------------------------
// Unit Tests — empty / absent scenarios
// ---------------------------------------------------------------------------

describe('loadTokenDataset — empty dataset when generatedStylesRoot is absent', () => {
  it('returns empty dataset when generatedStylesRoot does not exist', async () => {
    const ds = await loadTokenDataset({
      generatedStylesRoot: 'nonexistent-path-that-does-not-exist',
      workspaceRoot: tmpRoot,
      tokens: defaultTokensConfig(),
    });

    expect(ds.isEmpty).toBe(true);
    expect(ds.diagnostics.length).toBeGreaterThan(0);
    expect(ds.diagnostics[0]).toContain('does not exist');
  });
});

describe('loadTokenDataset — empty dataset with diagnostic when glob matches zero files', () => {
  it('returns empty dataset with diagnostic when no files match the pattern', async () => {
    const stylesDir = makeTempDir('empty-glob');
    // Create a directory but no matching files
    fs.writeFileSync(path.join(stylesDir, 'unrelated.txt'), 'not css');

    const ds = await loadTokenDataset({
      generatedStylesRoot: path.relative(tmpRoot, stylesDir),
      workspaceRoot: tmpRoot,
      tokens: { ...defaultTokensConfig(), filePattern: '**/semantic.css' },
    });

    expect(ds.isEmpty).toBe(true);
    expect(ds.diagnostics.length).toBeGreaterThan(0);
    expect(ds.diagnostics[0]).toContain('No files matched');
  });
});

// ---------------------------------------------------------------------------
// Unit Tests — flat directory strategy
// ---------------------------------------------------------------------------

describe('loadTokenDataset — flat directory strategy', () => {
  it('produces empty scope for all tokens', async () => {
    const stylesDir = makeTempDir('flat-strategy');
    writeCssFile(
      path.join(stylesDir, 'semantic.css'),
      `  --semantic-color-primary: #ff0000;\n  --semantic-spacing-sm: 4px;`,
    );

    const ds = await loadTokenDataset({
      generatedStylesRoot: path.relative(tmpRoot, stylesDir),
      workspaceRoot: tmpRoot,
      tokens: { ...defaultTokensConfig(), directoryStrategy: 'flat' },
    });

    expect(ds.isEmpty).toBe(false);
    expect(ds.tokens.length).toBe(2);
    for (const token of ds.tokens) {
      expect(token.scope).toEqual({});
    }
  });
});

// ---------------------------------------------------------------------------
// Unit Tests — brand-theme directory strategy
// ---------------------------------------------------------------------------

describe('loadTokenDataset — brand-theme directory strategy', () => {
  it('assigns correct scope from path segments', async () => {
    const stylesDir = makeTempDir('brand-theme-strategy');
    writeCssFile(
      path.join(stylesDir, 'acme', 'dark', 'semantic.css'),
      `  --semantic-color-primary: #111111;`,
    );
    writeCssFile(
      path.join(stylesDir, 'acme', 'light', 'semantic.css'),
      `  --semantic-color-primary: #ffffff;`,
    );
    writeCssFile(
      path.join(stylesDir, 'beta', 'dark', 'semantic.css'),
      `  --semantic-color-primary: #222222;`,
    );

    const ds = await loadTokenDataset({
      generatedStylesRoot: path.relative(tmpRoot, stylesDir),
      workspaceRoot: tmpRoot,
      tokens: { ...defaultTokensConfig(), directoryStrategy: 'brand-theme' },
    });

    expect(ds.isEmpty).toBe(false);
    expect(ds.tokens.length).toBe(3);

    const acmeDark = ds.tokens.find((t) => t.value === '#111111');
    expect(acmeDark).toBeDefined();
    expect(acmeDark!.scope).toEqual({ brand: 'acme', theme: 'dark' });

    const acmeLight = ds.tokens.find((t) => t.value === '#ffffff');
    expect(acmeLight).toBeDefined();
    expect(acmeLight!.scope).toEqual({ brand: 'acme', theme: 'light' });

    const betaDark = ds.tokens.find((t) => t.value === '#222222');
    expect(betaDark).toBeDefined();
    expect(betaDark!.scope).toEqual({ brand: 'beta', theme: 'dark' });
  });

  it('assigns only brand when file is one level deep', async () => {
    const stylesDir = makeTempDir('brand-only');
    writeCssFile(
      path.join(stylesDir, 'acme', 'semantic.css'),
      `  --semantic-color-primary: #aaa;`,
    );

    const ds = await loadTokenDataset({
      generatedStylesRoot: path.relative(tmpRoot, stylesDir),
      workspaceRoot: tmpRoot,
      tokens: { ...defaultTokensConfig(), directoryStrategy: 'brand-theme' },
    });

    expect(ds.tokens.length).toBe(1);
    expect(ds.tokens[0].scope).toEqual({ brand: 'acme' });
  });
});

// ---------------------------------------------------------------------------
// Unit Tests — auto directory strategy
// ---------------------------------------------------------------------------

describe('loadTokenDataset — auto directory strategy', () => {
  it('infers flat when files are at root level (depth < 2)', async () => {
    const stylesDir = makeTempDir('auto-flat');
    writeCssFile(
      path.join(stylesDir, 'semantic.css'),
      `  --semantic-color-primary: #ff0000;`,
    );

    const ds = await loadTokenDataset({
      generatedStylesRoot: path.relative(tmpRoot, stylesDir),
      workspaceRoot: tmpRoot,
      tokens: { ...defaultTokensConfig(), directoryStrategy: 'auto' },
    });

    expect(ds.isEmpty).toBe(false);
    for (const token of ds.tokens) {
      expect(token.scope).toEqual({});
    }
  });

  it('infers brand-theme when files are at depth >= 2', async () => {
    const stylesDir = makeTempDir('auto-brand-theme');
    writeCssFile(
      path.join(stylesDir, 'acme', 'dark', 'semantic.css'),
      `  --semantic-color-primary: #111111;`,
    );

    const ds = await loadTokenDataset({
      generatedStylesRoot: path.relative(tmpRoot, stylesDir),
      workspaceRoot: tmpRoot,
      tokens: { ...defaultTokensConfig(), directoryStrategy: 'auto' },
    });

    expect(ds.isEmpty).toBe(false);
    expect(ds.tokens[0].scope).toEqual({ brand: 'acme', theme: 'dark' });
  });
});

// ---------------------------------------------------------------------------
// Unit Tests — by-prefix categorisation
// ---------------------------------------------------------------------------

describe('loadTokenDataset — by-prefix categorisation', () => {
  it('assigns categories using default categoryPrefixMap', async () => {
    const stylesDir = makeTempDir('by-prefix-default');
    writeCssFile(
      path.join(stylesDir, 'semantic.css'),
      [
        '  --semantic-color-primary: #ff0000;',
        '  --semantic-spacing-sm: 4px;',
        '  --semantic-radius-md: 8px;',
        '  --semantic-typography-body: 16px;',
        '  --semantic-size-lg: 24px;',
        '  --semantic-opacity-half: 0.5;',
        '  --unknown-token: 42;',
      ].join('\n'),
    );

    const ds = await loadTokenDataset({
      generatedStylesRoot: path.relative(tmpRoot, stylesDir),
      workspaceRoot: tmpRoot,
      tokens: { ...defaultTokensConfig(), categoryInference: 'by-prefix' },
    });

    expect(ds.tokens.find((t) => t.name === '--semantic-color-primary')?.category).toBe('color');
    expect(ds.tokens.find((t) => t.name === '--semantic-spacing-sm')?.category).toBe('spacing');
    expect(ds.tokens.find((t) => t.name === '--semantic-radius-md')?.category).toBe('radius');
    expect(ds.tokens.find((t) => t.name === '--semantic-typography-body')?.category).toBe('typography');
    expect(ds.tokens.find((t) => t.name === '--semantic-size-lg')?.category).toBe('size');
    expect(ds.tokens.find((t) => t.name === '--semantic-opacity-half')?.category).toBe('opacity');
    expect(ds.tokens.find((t) => t.name === '--unknown-token')?.category).toBeUndefined();
  });

  it('assigns categories using custom categoryPrefixMap', async () => {
    const stylesDir = makeTempDir('by-prefix-custom');
    writeCssFile(
      path.join(stylesDir, 'semantic.css'),
      [
        '  --brand-color-primary: #ff0000;',
        '  --brand-space-sm: 4px;',
        '  --semantic-color-primary: #00ff00;',
      ].join('\n'),
    );

    const ds = await loadTokenDataset({
      generatedStylesRoot: path.relative(tmpRoot, stylesDir),
      workspaceRoot: tmpRoot,
      tokens: {
        ...defaultTokensConfig(),
        categoryInference: 'by-prefix',
        categoryPrefixMap: {
          color: '--brand-color',
          spacing: '--brand-space',
        },
      },
    });

    expect(ds.tokens.find((t) => t.name === '--brand-color-primary')?.category).toBe('color');
    expect(ds.tokens.find((t) => t.name === '--brand-space-sm')?.category).toBe('spacing');
    // --semantic-color-primary doesn't match custom map
    expect(ds.tokens.find((t) => t.name === '--semantic-color-primary')?.category).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Unit Tests — by-value categorisation
// ---------------------------------------------------------------------------

describe('loadTokenDataset — by-value categorisation', () => {
  it('infers categories from resolved values', async () => {
    const stylesDir = makeTempDir('by-value');
    writeCssFile(
      path.join(stylesDir, 'semantic.css'),
      [
        '  --token-hex: #ff0000;',
        '  --token-hex-short: #f00;',
        '  --token-rgb: rgb(255, 0, 0);',
        '  --token-rgba: rgba(255, 0, 0, 0.5);',
        '  --token-hsl: hsl(120, 100%, 50%);',
        '  --token-hsla: hsla(120, 100%, 50%, 0.5);',
        '  --token-px: 16px;',
        '  --token-rem: 1.5rem;',
        '  --token-em: 2em;',
        '  --token-percent: 50%;',
        '  --token-plain: some-value;',
      ].join('\n'),
    );

    const ds = await loadTokenDataset({
      generatedStylesRoot: path.relative(tmpRoot, stylesDir),
      workspaceRoot: tmpRoot,
      tokens: { ...defaultTokensConfig(), categoryInference: 'by-value' },
    });

    expect(ds.tokens.find((t) => t.name === '--token-hex')?.category).toBe('color');
    expect(ds.tokens.find((t) => t.name === '--token-hex-short')?.category).toBe('color');
    expect(ds.tokens.find((t) => t.name === '--token-rgb')?.category).toBe('color');
    expect(ds.tokens.find((t) => t.name === '--token-rgba')?.category).toBe('color');
    expect(ds.tokens.find((t) => t.name === '--token-hsl')?.category).toBe('color');
    expect(ds.tokens.find((t) => t.name === '--token-hsla')?.category).toBe('color');
    expect(ds.tokens.find((t) => t.name === '--token-px')?.category).toBe('spacing');
    expect(ds.tokens.find((t) => t.name === '--token-rem')?.category).toBe('spacing');
    expect(ds.tokens.find((t) => t.name === '--token-em')?.category).toBe('spacing');
    expect(ds.tokens.find((t) => t.name === '--token-percent')?.category).toBe('opacity');
    expect(ds.tokens.find((t) => t.name === '--token-plain')?.category).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Unit Tests — none categorisation
// ---------------------------------------------------------------------------

describe('loadTokenDataset — none categorisation', () => {
  it('leaves all tokens uncategorised', async () => {
    const stylesDir = makeTempDir('none-cat');
    writeCssFile(
      path.join(stylesDir, 'semantic.css'),
      [
        '  --semantic-color-primary: #ff0000;',
        '  --semantic-spacing-sm: 4px;',
      ].join('\n'),
    );

    const ds = await loadTokenDataset({
      generatedStylesRoot: path.relative(tmpRoot, stylesDir),
      workspaceRoot: tmpRoot,
      tokens: { ...defaultTokensConfig(), categoryInference: 'none' },
    });

    expect(ds.isEmpty).toBe(false);
    for (const token of ds.tokens) {
      expect(token.category).toBeUndefined();
    }
  });
});

// ---------------------------------------------------------------------------
// Unit Tests — propertyPrefix filtering
// ---------------------------------------------------------------------------

describe('loadTokenDataset — propertyPrefix filtering', () => {
  it('includes only properties matching the prefix', async () => {
    const stylesDir = makeTempDir('prefix-filter');
    writeCssFile(
      path.join(stylesDir, 'semantic.css'),
      [
        '  --semantic-color-primary: #ff0000;',
        '  --semantic-spacing-sm: 4px;',
        '  --ds-button-bg: var(--semantic-color-primary);',
        '  --other-prop: 10px;',
      ].join('\n'),
    );

    const ds = await loadTokenDataset({
      generatedStylesRoot: path.relative(tmpRoot, stylesDir),
      workspaceRoot: tmpRoot,
      tokens: { ...defaultTokensConfig(), propertyPrefix: '--semantic-' },
    });

    expect(ds.tokens.length).toBe(2);
    for (const token of ds.tokens) {
      expect(token.name.startsWith('--semantic-')).toBe(true);
    }
  });

  it('includes all properties when propertyPrefix is null', async () => {
    const stylesDir = makeTempDir('prefix-null');
    writeCssFile(
      path.join(stylesDir, 'semantic.css'),
      [
        '  --semantic-color-primary: #ff0000;',
        '  --ds-button-bg: var(--semantic-color-primary);',
        '  --other-prop: 10px;',
      ].join('\n'),
    );

    const ds = await loadTokenDataset({
      generatedStylesRoot: path.relative(tmpRoot, stylesDir),
      workspaceRoot: tmpRoot,
      tokens: { ...defaultTokensConfig(), propertyPrefix: null },
    });

    expect(ds.tokens.length).toBe(3);
  });
});


// ===========================================================================
// Property-Based Tests (parameterised)
// ===========================================================================

/**
 * **Validates: Requirements 5.1**
 * Property 7: Flat directory strategy produces scopeless tokens
 *
 * For any set of token files discovered under generatedStylesRoot with
 * directoryStrategy set to 'flat', all tokens in the resulting dataset
 * SHALL have an empty scope (no brand, no theme).
 */
describe('Property 7: Flat directory strategy produces scopeless tokens', () => {
  const cases = [
    {
      label: 'single file at root',
      setup: (dir: string) => {
        writeCssFile(path.join(dir, 'semantic.css'), '  --a: #f00;');
      },
    },
    {
      label: 'multiple files at root',
      setup: (dir: string) => {
        writeCssFile(path.join(dir, 'semantic.css'), '  --a: #f00;\n  --b: 4px;');
        writeCssFile(path.join(dir, 'other.css'), '  --c: 8px;');
      },
      filePattern: '**/*.css',
    },
    {
      label: 'files in nested directories (still flat strategy)',
      setup: (dir: string) => {
        writeCssFile(path.join(dir, 'brand', 'theme', 'semantic.css'), '  --a: #f00;');
        writeCssFile(path.join(dir, 'semantic.css'), '  --b: 4px;');
      },
    },
    {
      label: 'file with many tokens',
      setup: (dir: string) => {
        const declarations = Array.from({ length: 10 }, (_, i) => `  --token-${i}: value-${i};`).join('\n');
        writeCssFile(path.join(dir, 'semantic.css'), declarations);
      },
    },
  ];

  it.each(cases)(
    'all tokens have empty scope: $label',
    async ({ setup, filePattern }) => {
      const stylesDir = makeTempDir(`p7-${cases.indexOf(cases.find((c) => c.setup === setup)!)}`);
      setup(stylesDir);

      const ds = await loadTokenDataset({
        generatedStylesRoot: path.relative(tmpRoot, stylesDir),
        workspaceRoot: tmpRoot,
        tokens: {
          ...defaultTokensConfig(),
          directoryStrategy: 'flat',
          filePattern: filePattern ?? '**/semantic.css',
        },
      });

      expect(ds.isEmpty).toBe(false);
      for (const token of ds.tokens) {
        expect(token.scope).toEqual({});
      }
    },
  );
});

/**
 * **Validates: Requirements 5.2, 5.4**
 * Property 8: Brand-theme directory strategy assigns correct scope
 *
 * For any token file at path {generatedStylesRoot}/{segment1}/{segment2}/...
 * with directoryStrategy set to 'brand-theme', the resulting tokens SHALL have
 * scope keys mapped from the path segments (first → brand, second → theme).
 */
describe('Property 8: Brand-theme directory strategy assigns correct scope', () => {
  const cases = [
    {
      label: 'brand/theme/file → { brand, theme }',
      pathSegments: ['acme', 'dark'],
      expectedScope: { brand: 'acme', theme: 'dark' },
    },
    {
      label: 'brand-only/file → { brand }',
      pathSegments: ['beta'],
      expectedScope: { brand: 'beta' },
    },
    {
      label: 'different brand/theme combo',
      pathSegments: ['gamma', 'light'],
      expectedScope: { brand: 'gamma', theme: 'light' },
    },
    {
      label: 'root-level file → empty scope',
      pathSegments: [],
      expectedScope: {},
    },
  ];

  it.each(cases)(
    '$label',
    async ({ pathSegments, expectedScope }) => {
      const stylesDir = makeTempDir(`p8-${pathSegments.join('-') || 'root'}`);
      const filePath = path.join(stylesDir, ...pathSegments, 'semantic.css');
      writeCssFile(filePath, '  --token-a: #ff0000;');

      const ds = await loadTokenDataset({
        generatedStylesRoot: path.relative(tmpRoot, stylesDir),
        workspaceRoot: tmpRoot,
        tokens: { ...defaultTokensConfig(), directoryStrategy: 'brand-theme' },
      });

      expect(ds.isEmpty).toBe(false);
      expect(ds.tokens[0].scope).toEqual(expectedScope);
    },
  );
});

/**
 * **Validates: Requirements 6.1, 6.4**
 * Property 9: Category assignment by prefix
 *
 * For any token name and any categoryPrefixMap, when categoryInference is
 * 'by-prefix', the token SHALL be assigned the category whose prefix is the
 * longest matching prefix of the token name. If no prefix matches, the token
 * SHALL be uncategorised.
 */
describe('Property 9: Category assignment by prefix', () => {
  const prefixMap = {
    color: '--semantic-color',
    spacing: '--semantic-spacing',
    'color-primary': '--semantic-color-primary',
  };

  const cases = [
    {
      label: 'exact prefix match → color',
      tokenName: '--semantic-color-secondary',
      expectedCategory: 'color',
    },
    {
      label: 'longest prefix wins → color-primary',
      tokenName: '--semantic-color-primary-dark',
      expectedCategory: 'color-primary',
    },
    {
      label: 'spacing prefix match',
      tokenName: '--semantic-spacing-sm',
      expectedCategory: 'spacing',
    },
    {
      label: 'no prefix match → uncategorised',
      tokenName: '--unknown-token',
      expectedCategory: undefined,
    },
    {
      label: 'partial match not enough → uncategorised',
      tokenName: '--semantic-radius-sm',
      expectedCategory: undefined,
    },
  ];

  it.each(cases)(
    '$label: $tokenName → $expectedCategory',
    async ({ tokenName, expectedCategory }) => {
      const stylesDir = makeTempDir(`p9-${tokenName.replace(/--/g, '')}`);
      writeCssFile(
        path.join(stylesDir, 'semantic.css'),
        `  ${tokenName}: some-value;`,
      );

      const ds = await loadTokenDataset({
        generatedStylesRoot: path.relative(tmpRoot, stylesDir),
        workspaceRoot: tmpRoot,
        tokens: {
          ...defaultTokensConfig(),
          categoryInference: 'by-prefix',
          categoryPrefixMap: prefixMap,
        },
      });

      expect(ds.tokens.length).toBe(1);
      expect(ds.tokens[0].category).toBe(expectedCategory);
    },
  );
});

/**
 * **Validates: Requirements 6.2**
 * Property 10: Category inference by value
 *
 * For any resolved token value, when categoryInference is 'by-value', the token
 * SHALL be assigned a category matching the value pattern (hex/rgb/hsl → color,
 * px/rem/em → spacing, percentage → opacity). Values not matching any pattern
 * SHALL be uncategorised.
 */
describe('Property 10: Category inference by value', () => {
  const cases = [
    { label: 'hex 6-digit → color', value: '#ff0000', expectedCategory: 'color' },
    { label: 'hex 3-digit → color', value: '#f00', expectedCategory: 'color' },
    { label: 'hex 8-digit → color', value: '#ff000080', expectedCategory: 'color' },
    { label: 'rgb() → color', value: 'rgb(255, 0, 0)', expectedCategory: 'color' },
    { label: 'rgba() → color', value: 'rgba(255, 0, 0, 0.5)', expectedCategory: 'color' },
    { label: 'hsl() → color', value: 'hsl(120, 100%, 50%)', expectedCategory: 'color' },
    { label: 'hsla() → color', value: 'hsla(120, 100%, 50%, 0.5)', expectedCategory: 'color' },
    { label: 'px → spacing', value: '16px', expectedCategory: 'spacing' },
    { label: 'negative px → spacing', value: '-4px', expectedCategory: 'spacing' },
    { label: 'rem → spacing', value: '1.5rem', expectedCategory: 'spacing' },
    { label: 'em → spacing', value: '2em', expectedCategory: 'spacing' },
    { label: 'percentage → opacity', value: '50%', expectedCategory: 'opacity' },
    { label: 'plain string → uncategorised', value: 'some-value', expectedCategory: undefined },
    { label: 'number without unit → uncategorised', value: '42', expectedCategory: undefined },
    { label: 'var() reference → uncategorised', value: 'var(--other)', expectedCategory: undefined },
  ];

  it.each(cases)(
    '$label: "$value" → $expectedCategory',
    async ({ value, expectedCategory }) => {
      const safeName = value.replace(/[^a-zA-Z0-9]/g, '-').slice(0, 30);
      const stylesDir = makeTempDir(`p10-${safeName}`);
      writeCssFile(
        path.join(stylesDir, 'semantic.css'),
        `  --test-token: ${value};`,
      );

      const ds = await loadTokenDataset({
        generatedStylesRoot: path.relative(tmpRoot, stylesDir),
        workspaceRoot: tmpRoot,
        tokens: { ...defaultTokensConfig(), categoryInference: 'by-value' },
      });

      expect(ds.tokens.length).toBe(1);
      expect(ds.tokens[0].category).toBe(expectedCategory);
    },
  );
});
