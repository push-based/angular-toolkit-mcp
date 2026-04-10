import { describe, it, expect } from 'vitest';

import {
  TokenDatasetImpl,
  createEmptyTokenDataset,
  type TokenEntry,
} from '../token-dataset.js';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

/** Builds a TokenEntry with sensible defaults. */
function entry(
  overrides: Partial<TokenEntry> & Pick<TokenEntry, 'name' | 'value'>,
): TokenEntry {
  return {
    scope: {},
    sourceFile: 'tokens.css',
    ...overrides,
  };
}

/** Rich fixture set covering various categories, scopes, and values. */
const FIXTURES: TokenEntry[] = [
  // Color tokens — flat scope
  entry({
    name: '--semantic-color-primary',
    value: '#86b521',
    category: 'color',
    sourceFile: 'semantic.css',
  }),
  entry({
    name: '--semantic-color-secondary',
    value: '#3366cc',
    category: 'color',
    sourceFile: 'semantic.css',
  }),
  entry({
    name: '--semantic-color-error',
    value: '#ff0000',
    category: 'color',
    sourceFile: 'semantic.css',
  }),

  // Spacing tokens — flat scope
  entry({
    name: '--semantic-spacing-sm',
    value: '4px',
    category: 'spacing',
    sourceFile: 'semantic.css',
  }),
  entry({
    name: '--semantic-spacing-md',
    value: '8px',
    category: 'spacing',
    sourceFile: 'semantic.css',
  }),
  entry({
    name: '--semantic-spacing-lg',
    value: '16px',
    category: 'spacing',
    sourceFile: 'semantic.css',
  }),

  // Radius tokens — flat scope
  entry({
    name: '--semantic-radius-sm',
    value: '2px',
    category: 'radius',
    sourceFile: 'semantic.css',
  }),

  // Uncategorised token
  entry({ name: '--misc-token', value: '42', sourceFile: 'semantic.css' }),

  // Tokens with var() references
  entry({
    name: '--ds-button-bg',
    value: 'var(--semantic-color-primary)',
    category: 'color',
    sourceFile: 'components.css',
  }),

  // Tokens with brand scope
  entry({
    name: '--semantic-color-primary',
    value: '#ff9900',
    category: 'color',
    scope: { brand: 'acme' },
    sourceFile: 'acme/semantic.css',
  }),
  entry({
    name: '--semantic-color-secondary',
    value: '#009900',
    category: 'color',
    scope: { brand: 'acme' },
    sourceFile: 'acme/semantic.css',
  }),

  // Tokens with brand + theme scope
  entry({
    name: '--semantic-color-primary',
    value: '#111111',
    category: 'color',
    scope: { brand: 'acme', theme: 'dark' },
    sourceFile: 'acme/dark/semantic.css',
  }),
  entry({
    name: '--semantic-spacing-sm',
    value: '6px',
    category: 'spacing',
    scope: { brand: 'acme', theme: 'dark' },
    sourceFile: 'acme/dark/semantic.css',
  }),

  // Duplicate value across scopes (for reverse lookup testing)
  entry({
    name: '--semantic-opacity-low',
    value: '0.5',
    category: 'opacity',
    sourceFile: 'semantic.css',
  }),
  entry({
    name: '--semantic-opacity-low',
    value: '0.5',
    category: 'opacity',
    scope: { brand: 'acme' },
    sourceFile: 'acme/semantic.css',
  }),
];

function buildDataset(tokens: TokenEntry[] = FIXTURES): TokenDatasetImpl {
  return new TokenDatasetImpl(tokens);
}

// ---------------------------------------------------------------------------
// Unit Tests — getByName
// ---------------------------------------------------------------------------

describe('TokenDatasetImpl — getByName', () => {
  const ds = buildDataset();

  it('returns the token for an exact name match (last-write wins for duplicates)', () => {
    const result = ds.getByName('--semantic-color-primary');
    expect(result).toBeDefined();
    expect(result!.name).toBe('--semantic-color-primary');
  });

  it('returns undefined for a name not in the dataset', () => {
    expect(ds.getByName('--nonexistent-token')).toBeUndefined();
  });

  it('returns the unique token when name is unique', () => {
    const result = ds.getByName('--semantic-radius-sm');
    expect(result).toBeDefined();
    expect(result!.value).toBe('2px');
    expect(result!.category).toBe('radius');
  });
});

// ---------------------------------------------------------------------------
// Unit Tests — getByPrefix
// ---------------------------------------------------------------------------

describe('TokenDatasetImpl — getByPrefix', () => {
  const ds = buildDataset();

  it('returns all tokens whose name starts with the prefix', () => {
    const result = ds.getByPrefix('--semantic-color');
    // 3 flat + 2 acme + 1 acme/dark = 6
    expect(result.length).toBe(6);
    for (const t of result) {
      expect(t.name.startsWith('--semantic-color')).toBe(true);
    }
  });

  it('returns empty array when no tokens match the prefix', () => {
    expect(ds.getByPrefix('--nonexistent-')).toEqual([]);
  });

  it('returns all tokens when prefix is --', () => {
    const result = ds.getByPrefix('--');
    expect(result.length).toBe(FIXTURES.length);
  });
});

// ---------------------------------------------------------------------------
// Unit Tests — getByValue
// ---------------------------------------------------------------------------

describe('TokenDatasetImpl — getByValue', () => {
  const ds = buildDataset();

  it('returns all tokens with the given value', () => {
    const result = ds.getByValue('0.5');
    expect(result.length).toBe(2);
    for (const t of result) {
      expect(t.value).toBe('0.5');
    }
  });

  it('returns empty array for a value not in the dataset', () => {
    expect(ds.getByValue('nonexistent-value')).toEqual([]);
  });

  it('finds tokens with var() reference values', () => {
    const result = ds.getByValue('var(--semantic-color-primary)');
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('--ds-button-bg');
  });
});

// ---------------------------------------------------------------------------
// Unit Tests — getByCategory
// ---------------------------------------------------------------------------

describe('TokenDatasetImpl — getByCategory', () => {
  const ds = buildDataset();

  it('returns all tokens in the given category', () => {
    const result = ds.getByCategory('color');
    // 3 flat + 1 ds-button-bg + 2 acme + 1 acme/dark = 7
    expect(result.length).toBe(7);
    for (const t of result) {
      expect(t.category).toBe('color');
    }
  });

  it('returns empty array for a category not in the dataset', () => {
    expect(ds.getByCategory('nonexistent')).toEqual([]);
  });

  it('does not include uncategorised tokens', () => {
    const result = ds.getByCategory('color');
    expect(result.find((t) => t.name === '--misc-token')).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Unit Tests — getByScope
// ---------------------------------------------------------------------------

describe('TokenDatasetImpl — getByScope', () => {
  const ds = buildDataset();

  it('returns tokens matching a single scope key-value pair', () => {
    const result = ds.getByScope({ brand: 'acme' });
    // 2 acme color + 1 acme opacity + 2 acme/dark = 5
    expect(result.length).toBe(5);
    for (const t of result) {
      expect(t.scope.brand).toBe('acme');
    }
  });

  it('returns tokens matching multiple scope key-value pairs (intersection)', () => {
    const result = ds.getByScope({ brand: 'acme', theme: 'dark' });
    expect(result.length).toBe(2);
    for (const t of result) {
      expect(t.scope.brand).toBe('acme');
      expect(t.scope.theme).toBe('dark');
    }
  });

  it('returns all tokens when scope is empty', () => {
    const result = ds.getByScope({});
    expect(result.length).toBe(FIXTURES.length);
  });

  it('returns empty array when scope key does not exist', () => {
    expect(ds.getByScope({ variant: 'unknown' })).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Unit Tests — getByValueInScope
// ---------------------------------------------------------------------------

describe('TokenDatasetImpl — getByValueInScope', () => {
  const ds = buildDataset();

  it('returns only tokens matching both value and scope', () => {
    const result = ds.getByValueInScope('0.5', { brand: 'acme' });
    expect(result.length).toBe(1);
    expect(result[0].scope.brand).toBe('acme');
    expect(result[0].value).toBe('0.5');
  });

  it('returns empty when value matches but scope does not', () => {
    expect(ds.getByValueInScope('0.5', { brand: 'nonexistent' })).toEqual([]);
  });

  it('returns empty when scope matches but value does not', () => {
    expect(ds.getByValueInScope('nonexistent', { brand: 'acme' })).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Unit Tests — getByCategoryInScope
// ---------------------------------------------------------------------------

describe('TokenDatasetImpl — getByCategoryInScope', () => {
  const ds = buildDataset();

  it('returns only tokens matching both category and scope', () => {
    const result = ds.getByCategoryInScope('color', {
      brand: 'acme',
      theme: 'dark',
    });
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('--semantic-color-primary');
    expect(result[0].scope.brand).toBe('acme');
    expect(result[0].scope.theme).toBe('dark');
  });

  it('returns empty when category matches but scope does not', () => {
    expect(ds.getByCategoryInScope('color', { brand: 'nonexistent' })).toEqual(
      [],
    );
  });

  it('returns empty when scope matches but category does not', () => {
    expect(ds.getByCategoryInScope('nonexistent', { brand: 'acme' })).toEqual(
      [],
    );
  });
});

// ---------------------------------------------------------------------------
// Unit Tests — isEmpty
// ---------------------------------------------------------------------------

describe('TokenDatasetImpl — isEmpty', () => {
  it('is true for an empty dataset', () => {
    const ds = new TokenDatasetImpl([]);
    expect(ds.isEmpty).toBe(true);
  });

  it('is false for a dataset with tokens', () => {
    const ds = buildDataset();
    expect(ds.isEmpty).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Unit Tests — result shape
// ---------------------------------------------------------------------------

describe('TokenDatasetImpl — result shape', () => {
  const ds = buildDataset();

  it('getByName result contains all required fields', () => {
    const result = ds.getByName('--semantic-color-error');
    expect(result).toBeDefined();
    expect(result).toHaveProperty('name');
    expect(result).toHaveProperty('value');
    expect(result).toHaveProperty('scope');
    expect(result).toHaveProperty('sourceFile');
    // category is either a string or undefined
    expect(
      result!.category === undefined || typeof result!.category === 'string',
    ).toBe(true);
  });

  it('getByPrefix results contain all required fields', () => {
    const results = ds.getByPrefix('--semantic-spacing');
    expect(results.length).toBeGreaterThan(0);
    for (const r of results) {
      expect(r).toHaveProperty('name');
      expect(r).toHaveProperty('value');
      expect(r).toHaveProperty('scope');
      expect(r).toHaveProperty('sourceFile');
    }
  });

  it('uncategorised token has category as undefined', () => {
    const result = ds.getByName('--misc-token');
    expect(result).toBeDefined();
    expect(result!.category).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Unit Tests — createEmptyTokenDataset
// ---------------------------------------------------------------------------

describe('createEmptyTokenDataset', () => {
  it('returns an empty dataset', () => {
    const ds = createEmptyTokenDataset();
    expect(ds.isEmpty).toBe(true);
    expect(ds.tokens).toHaveLength(0);
    expect(ds.diagnostics).toHaveLength(0);
  });

  it('includes diagnostic message when provided', () => {
    const ds = createEmptyTokenDataset('No files found');
    expect(ds.isEmpty).toBe(true);
    expect(ds.diagnostics).toEqual(['No files found']);
  });

  it('query methods return empty results', () => {
    const ds = createEmptyTokenDataset();
    expect(ds.getByName('--anything')).toBeUndefined();
    expect(ds.getByPrefix('--')).toEqual([]);
    expect(ds.getByValue('any')).toEqual([]);
    expect(ds.getByCategory('color')).toEqual([]);
    expect(ds.getByScope({})).toEqual([]);
    expect(ds.getByValueInScope('v', {})).toEqual([]);
    expect(ds.getByCategoryInScope('c', {})).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Unit Tests — diagnostics
// ---------------------------------------------------------------------------

describe('TokenDatasetImpl — diagnostics', () => {
  it('stores diagnostics passed at construction', () => {
    const ds = new TokenDatasetImpl([], ['warning 1', 'warning 2']);
    expect(ds.diagnostics).toEqual(['warning 1', 'warning 2']);
  });

  it('defaults to empty diagnostics', () => {
    const ds = new TokenDatasetImpl([]);
    expect(ds.diagnostics).toEqual([]);
  });
});

// ===========================================================================
// Property-Based Tests (parameterised)
// ===========================================================================

/**
 * **Validates: Requirements 7.1**
 * Property 11: Token dataset exact name lookup
 *
 * For any token present in a TokenDataset, calling getByName with that token's
 * exact name SHALL return that token. Calling getByName with a name not in the
 * dataset SHALL return undefined.
 */
describe('Property 11: Token dataset exact name lookup', () => {
  const uniqueTokens: TokenEntry[] = [
    entry({ name: '--color-red', value: '#f00', category: 'color' }),
    entry({ name: '--color-blue', value: '#00f', category: 'color' }),
    entry({ name: '--spacing-xs', value: '2px', category: 'spacing' }),
    entry({ name: '--radius-lg', value: '16px', category: 'radius' }),
    entry({ name: '--opacity-half', value: '0.5', category: 'opacity' }),
    entry({ name: '--z-index-100', value: '100' }),
    entry({ name: '--font-size-base', value: '16px', category: 'typography' }),
    entry({
      name: '--ds-button-bg',
      value: 'var(--color-red)',
      category: 'color',
    }),
  ];

  const ds = new TokenDatasetImpl(uniqueTokens);

  const presentCases = uniqueTokens.map((t) => ({
    label: t.name,
    name: t.name,
    expectedValue: t.value,
  }));

  it.each(presentCases)(
    'getByName($name) returns the token',
    ({ name, expectedValue }) => {
      const result = ds.getByName(name);
      expect(result).toBeDefined();
      expect(result!.name).toBe(name);
      expect(result!.value).toBe(expectedValue);
    },
  );

  const absentCases = [
    { label: 'completely unknown', name: '--unknown-token' },
    { label: 'partial match', name: '--color' },
    { label: 'empty string', name: '' },
    { label: 'similar but different', name: '--color-red-dark' },
    { label: 'prefix only', name: '--ds-' },
  ];

  it.each(absentCases)(
    'getByName($name) returns undefined for absent name: $label',
    ({ name }) => {
      expect(ds.getByName(name)).toBeUndefined();
    },
  );
});

/**
 * **Validates: Requirements 7.2**
 * Property 12: Token dataset prefix lookup completeness
 *
 * For any prefix string and any TokenDataset, getByPrefix(prefix) SHALL return
 * exactly the set of tokens whose name starts with that prefix — no more, no less.
 */
describe('Property 12: Token dataset prefix lookup completeness', () => {
  const tokens: TokenEntry[] = [
    entry({ name: '--semantic-color-primary', value: '#f00' }),
    entry({ name: '--semantic-color-secondary', value: '#0f0' }),
    entry({ name: '--semantic-spacing-sm', value: '4px' }),
    entry({ name: '--semantic-spacing-md', value: '8px' }),
    entry({ name: '--ds-button-bg', value: 'var(--x)' }),
    entry({ name: '--ds-card-padding', value: '16px' }),
    entry({ name: '--other', value: '1' }),
  ];

  const ds = new TokenDatasetImpl(tokens);

  const prefixCases = [
    { prefix: '--semantic-color', expectedCount: 2 },
    { prefix: '--semantic-spacing', expectedCount: 2 },
    { prefix: '--semantic-', expectedCount: 4 },
    { prefix: '--ds-', expectedCount: 2 },
    { prefix: '--', expectedCount: 7 },
    { prefix: '--other', expectedCount: 1 },
    { prefix: '--nonexistent', expectedCount: 0 },
    { prefix: '', expectedCount: 7 },
  ];

  it.each(prefixCases)(
    'getByPrefix("$prefix") returns exactly $expectedCount tokens',
    ({ prefix, expectedCount }) => {
      const result = ds.getByPrefix(prefix);
      expect(result.length).toBe(expectedCount);
      // Every result must start with the prefix
      for (const t of result) {
        expect(t.name.startsWith(prefix)).toBe(true);
      }
      // Every token in the dataset that starts with the prefix must be in the result
      const expected = tokens.filter((t) => t.name.startsWith(prefix));
      expect(result.length).toBe(expected.length);
    },
  );
});

/**
 * **Validates: Requirements 7.3**
 * Property 13: Token dataset reverse value lookup
 *
 * For any value string and any TokenDataset, getByValue(value) SHALL return
 * exactly the set of tokens whose resolved value equals that string.
 */
describe('Property 13: Token dataset reverse value lookup', () => {
  const tokens: TokenEntry[] = [
    entry({ name: '--a', value: '#ff0000' }),
    entry({ name: '--b', value: '#ff0000' }),
    entry({ name: '--c', value: '#00ff00' }),
    entry({ name: '--d', value: '4px' }),
    entry({ name: '--e', value: 'var(--a)' }),
    entry({ name: '--f', value: 'var(--a)' }),
    entry({ name: '--g', value: 'unique-value' }),
  ];

  const ds = new TokenDatasetImpl(tokens);

  const valueCases = [
    { value: '#ff0000', expectedNames: ['--a', '--b'] },
    { value: '#00ff00', expectedNames: ['--c'] },
    { value: '4px', expectedNames: ['--d'] },
    { value: 'var(--a)', expectedNames: ['--e', '--f'] },
    { value: 'unique-value', expectedNames: ['--g'] },
    { value: 'not-in-dataset', expectedNames: [] },
  ];

  it.each(valueCases)(
    'getByValue("$value") returns tokens: $expectedNames',
    ({ value, expectedNames }) => {
      const result = ds.getByValue(value);
      expect(result.length).toBe(expectedNames.length);
      const resultNames = result.map((t) => t.name).sort();
      expect(resultNames).toEqual([...expectedNames].sort());
      // Every result must have the queried value
      for (const t of result) {
        expect(t.value).toBe(value);
      }
    },
  );
});

/**
 * **Validates: Requirements 7.4**
 * Property 14: Token dataset category lookup
 *
 * For any category string and any TokenDataset, getByCategory(category) SHALL
 * return exactly the set of tokens assigned to that category.
 */
describe('Property 14: Token dataset category lookup', () => {
  const tokens: TokenEntry[] = [
    entry({ name: '--c1', value: '#f00', category: 'color' }),
    entry({ name: '--c2', value: '#0f0', category: 'color' }),
    entry({ name: '--c3', value: '#00f', category: 'color' }),
    entry({ name: '--s1', value: '4px', category: 'spacing' }),
    entry({ name: '--s2', value: '8px', category: 'spacing' }),
    entry({ name: '--r1', value: '2px', category: 'radius' }),
    entry({ name: '--u1', value: '42' }), // uncategorised
    entry({ name: '--u2', value: '99' }), // uncategorised
  ];

  const ds = new TokenDatasetImpl(tokens);

  const categoryCases = [
    { category: 'color', expectedCount: 3 },
    { category: 'spacing', expectedCount: 2 },
    { category: 'radius', expectedCount: 1 },
    { category: 'nonexistent', expectedCount: 0 },
  ];

  it.each(categoryCases)(
    'getByCategory("$category") returns $expectedCount tokens',
    ({ category, expectedCount }) => {
      const result = ds.getByCategory(category);
      expect(result.length).toBe(expectedCount);
      for (const t of result) {
        expect(t.category).toBe(category);
      }
    },
  );

  it('uncategorised tokens are not returned by any category query', () => {
    const allCategorised = [
      ...ds.getByCategory('color'),
      ...ds.getByCategory('spacing'),
      ...ds.getByCategory('radius'),
    ];
    const uncategorised = tokens.filter((t) => t.category == null);
    for (const u of uncategorised) {
      expect(allCategorised.find((t) => t.name === u.name)).toBeUndefined();
    }
  });
});

/**
 * **Validates: Requirements 7.5**
 * Property 15: Token dataset query results contain all required fields
 *
 * For any query method on TokenDataset that returns results, each result SHALL
 * contain name, value, category (or undefined), and scope fields.
 */
describe('Property 15: Token dataset query results contain all required fields', () => {
  const tokens: TokenEntry[] = [
    entry({
      name: '--a',
      value: '#f00',
      category: 'color',
      scope: { brand: 'x' },
      sourceFile: 'a.css',
    }),
    entry({
      name: '--b',
      value: '4px',
      category: 'spacing',
      scope: {},
      sourceFile: 'b.css',
    }),
    entry({ name: '--c', value: '1', scope: {}, sourceFile: 'c.css' }), // no category
  ];

  const ds = new TokenDatasetImpl(tokens);

  function assertShape(t: Record<string, unknown>): void {
    expect(t).toHaveProperty('name');
    expect(t).toHaveProperty('value');
    expect(t).toHaveProperty('scope');
    expect(t).toHaveProperty('sourceFile');
    // category is either a string or undefined (key may or may not be present)
    expect(t.category === undefined || typeof t.category === 'string').toBe(
      true,
    );
    expect(typeof t.name).toBe('string');
    expect(typeof t.value).toBe('string');
    expect(typeof t.scope).toBe('object');
  }

  const queryCases = [
    { label: 'getByName', fn: () => [ds.getByName('--a')].filter(Boolean) },
    { label: 'getByPrefix', fn: () => ds.getByPrefix('--') },
    { label: 'getByValue', fn: () => ds.getByValue('#f00') },
    { label: 'getByCategory', fn: () => ds.getByCategory('color') },
    { label: 'getByScope', fn: () => ds.getByScope({ brand: 'x' }) },
    {
      label: 'getByValueInScope',
      fn: () => ds.getByValueInScope('#f00', { brand: 'x' }),
    },
    {
      label: 'getByCategoryInScope',
      fn: () => ds.getByCategoryInScope('color', { brand: 'x' }),
    },
  ];

  it.each(queryCases)(
    '$label results contain all required fields',
    ({ fn }) => {
      const results = fn();
      expect(results.length).toBeGreaterThan(0);
      for (const r of results) {
        assertShape(r as unknown as Record<string, unknown>);
      }
    },
  );
});

/**
 * **Validates: Requirements 7.6**
 * Property 16: Token dataset scope lookup
 *
 * For any scope key-value pair and any TokenDataset, getByScope({ key: value })
 * SHALL return exactly the set of tokens whose scope contains that key with that
 * value. When multiple key-value pairs are provided, only tokens matching all
 * pairs SHALL be returned.
 */
describe('Property 16: Token dataset scope lookup', () => {
  const tokens: TokenEntry[] = [
    entry({ name: '--t1', value: 'v1', scope: {} }),
    entry({ name: '--t2', value: 'v2', scope: { brand: 'acme' } }),
    entry({
      name: '--t3',
      value: 'v3',
      scope: { brand: 'acme', theme: 'dark' },
    }),
    entry({
      name: '--t4',
      value: 'v4',
      scope: { brand: 'acme', theme: 'light' },
    }),
    entry({ name: '--t5', value: 'v5', scope: { brand: 'beta' } }),
    entry({
      name: '--t6',
      value: 'v6',
      scope: { brand: 'beta', theme: 'dark' },
    }),
  ];

  const ds = new TokenDatasetImpl(tokens);

  const scopeCases: Array<{
    label: string;
    scope: Record<string, string>;
    expectedNames: string[];
  }> = [
    {
      label: 'single key: brand=acme',
      scope: { brand: 'acme' },
      expectedNames: ['--t2', '--t3', '--t4'],
    },
    {
      label: 'single key: brand=beta',
      scope: { brand: 'beta' },
      expectedNames: ['--t5', '--t6'],
    },
    {
      label: 'single key: theme=dark',
      scope: { theme: 'dark' },
      expectedNames: ['--t3', '--t6'],
    },
    {
      label: 'multiple keys: brand=acme, theme=dark',
      scope: { brand: 'acme', theme: 'dark' },
      expectedNames: ['--t3'],
    },
    {
      label: 'multiple keys: brand=acme, theme=light',
      scope: { brand: 'acme', theme: 'light' },
      expectedNames: ['--t4'],
    },
    {
      label: 'empty scope returns all tokens',
      scope: {},
      expectedNames: ['--t1', '--t2', '--t3', '--t4', '--t5', '--t6'],
    },
    {
      label: 'non-matching scope key',
      scope: { variant: 'unknown' },
      expectedNames: [],
    },
    {
      label: 'non-matching scope value',
      scope: { brand: 'nonexistent' },
      expectedNames: [],
    },
  ];

  it.each(scopeCases)(
    'getByScope($label) returns $expectedNames',
    ({ scope, expectedNames }) => {
      const result = ds.getByScope(scope);
      const resultNames = result.map((t) => t.name).sort();
      expect(resultNames).toEqual([...expectedNames].sort());
    },
  );
});

/**
 * **Validates: Requirements 7.7**
 * Property 17: Token dataset scope-filtered value lookup
 *
 * For any value string, any scope filter, and any TokenDataset,
 * getByValueInScope(value, scope) SHALL return exactly the subset of
 * getByValue(value) results whose scope also matches all provided key-value pairs.
 */
describe('Property 17: Token dataset scope-filtered value lookup', () => {
  const tokens: TokenEntry[] = [
    entry({ name: '--a1', value: '#f00', scope: {} }),
    entry({ name: '--a2', value: '#f00', scope: { brand: 'acme' } }),
    entry({
      name: '--a3',
      value: '#f00',
      scope: { brand: 'acme', theme: 'dark' },
    }),
    entry({ name: '--a4', value: '#f00', scope: { brand: 'beta' } }),
    entry({ name: '--b1', value: '#0f0', scope: { brand: 'acme' } }),
    entry({ name: '--b2', value: '#0f0', scope: { brand: 'beta' } }),
  ];

  const ds = new TokenDatasetImpl(tokens);

  const cases: Array<{
    label: string;
    value: string;
    scope: Record<string, string>;
    expectedNames: string[];
  }> = [
    {
      label: 'value=#f00, scope={brand:acme}',
      value: '#f00',
      scope: { brand: 'acme' },
      expectedNames: ['--a2', '--a3'],
    },
    {
      label: 'value=#f00, scope={brand:acme, theme:dark}',
      value: '#f00',
      scope: { brand: 'acme', theme: 'dark' },
      expectedNames: ['--a3'],
    },
    {
      label: 'value=#f00, scope={brand:beta}',
      value: '#f00',
      scope: { brand: 'beta' },
      expectedNames: ['--a4'],
    },
    {
      label: 'value=#0f0, scope={brand:acme}',
      value: '#0f0',
      scope: { brand: 'acme' },
      expectedNames: ['--b1'],
    },
    {
      label: 'value=#f00, scope={brand:nonexistent}',
      value: '#f00',
      scope: { brand: 'nonexistent' },
      expectedNames: [],
    },
    {
      label: 'value=nonexistent, scope={brand:acme}',
      value: 'nonexistent',
      scope: { brand: 'acme' },
      expectedNames: [],
    },
  ];

  it.each(cases)(
    'getByValueInScope($label) returns correct subset',
    ({ value, scope, expectedNames }) => {
      const result = ds.getByValueInScope(value, scope);
      const resultNames = result.map((t) => t.name).sort();
      expect(resultNames).toEqual([...expectedNames].sort());

      // Verify the property: result is the intersection of getByValue and getByScope
      const byVal = ds.getByValue(value);
      const byScope = new Set(ds.getByScope(scope));
      const expected = byVal.filter((t) => byScope.has(t));
      expect(result.length).toBe(expected.length);
    },
  );
});
