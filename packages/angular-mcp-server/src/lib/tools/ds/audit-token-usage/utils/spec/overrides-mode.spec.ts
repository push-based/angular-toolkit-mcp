import { describe, it, expect } from 'vitest';

import { detectMechanism, classifyOverride } from '../override-classifier.js';
import type { ScssPropertyEntry } from '@push-based/styles-ast-utils';
import type { TokenEntry } from '../../../shared/utils/token-dataset.js';
import type { OverrideMechanism, OverrideItem } from '../../models/types.js';

/**
 * Validates: Requirements 6.1, 6.3, 7.1–7.5
 *
 * Tests for overrides mode correctness properties:
 * - Property 4: Declaration completeness — every declaration entry maps to an override item
 * - Property 5: Mechanism determinism — detectMechanism returns expected mechanism per priority rules
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const VALID_MECHANISMS: OverrideMechanism[] = [
  'host',
  'ng-deep',
  'class-selector',
  'root-theme',
  'important',
  'unknown',
];

function makeEntry(
  overrides: Partial<ScssPropertyEntry> = {},
): ScssPropertyEntry {
  return {
    property: '--ds-button-color-bg',
    value: 'red',
    line: 10,
    selector: ':host',
    classification: 'declaration',
    important: false,
    ...overrides,
  };
}

function makeTokenEntry(
  name: string,
  value = '#000',
  scope: Record<string, string> = {},
): TokenEntry {
  return { name, value, scope, sourceFile: 'tokens.css' };
}

/**
 * Simulates the overrides-mode pipeline mapping for a single declaration entry.
 * This mirrors the core logic in `runOverridesMode` without file I/O.
 */
function buildOverrideItem(
  entry: ScssPropertyEntry,
  relPath: string,
): OverrideItem {
  const mechanism = detectMechanism(entry);
  return {
    file: relPath,
    line: entry.line,
    token: entry.property,
    newValue: entry.value,
    mechanism,
  };
}

// ---------------------------------------------------------------------------
// Property 4 — Declaration completeness
// ---------------------------------------------------------------------------

describe('Property 4: Declaration completeness', () => {
  /**
   * Every ScssPropertyEntry with classification === 'declaration' must appear
   * in overrides.items with correct token, newValue, file, line, and valid mechanism.
   * **Validates: Requirements 6.1, 6.3**
   */

  it('maps a single declaration entry to an override item with correct fields', () => {
    const entry = makeEntry({
      property: '--ds-card-color-bg',
      value: 'blue',
      line: 42,
      selector: ':host',
      classification: 'declaration',
    });

    const item = buildOverrideItem(entry, 'src/card.component.scss');

    expect(item.token).toBe(entry.property);
    expect(item.newValue).toBe(entry.value);
    expect(item.file).toBe('src/card.component.scss');
    expect(item.line).toBe(entry.line);
    expect(VALID_MECHANISMS).toContain(item.mechanism);
  });

  it('maps multiple declaration entries preserving each entry fields', () => {
    const entries: ScssPropertyEntry[] = [
      makeEntry({
        property: '--ds-button-color-bg',
        value: 'red',
        line: 5,
        selector: ':host',
      }),
      makeEntry({
        property: '--ds-button-color-text',
        value: 'white',
        line: 12,
        selector: '::ng-deep .inner',
      }),
      makeEntry({
        property: '--ds-card-border-radius',
        value: '8px',
        line: 30,
        selector: '.card-wrapper',
      }),
    ];

    const items = entries.map((e) =>
      buildOverrideItem(e, 'components/button.scss'),
    );

    expect(items).toHaveLength(entries.length);
    for (let i = 0; i < entries.length; i++) {
      expect(items[i].token).toBe(entries[i].property);
      expect(items[i].newValue).toBe(entries[i].value);
      expect(items[i].line).toBe(entries[i].line);
      expect(items[i].file).toBe('components/button.scss');
      expect(VALID_MECHANISMS).toContain(items[i].mechanism);
    }
  });

  it('override item has a valid mechanism string for every declaration', () => {
    const selectors = [
      ':host',
      '::ng-deep .child',
      '.my-class',
      ':root[data-theme="dark"]',
      ':host .nested',
      'div',
    ];

    for (const selector of selectors) {
      const entry = makeEntry({ selector, classification: 'declaration' });
      const item = buildOverrideItem(entry, 'test.scss');
      expect(VALID_MECHANISMS).toContain(item.mechanism);
    }
  });

  it('preserves token property name exactly as-is', () => {
    const tokenNames = [
      '--ds-button-enabled-color-bg',
      '--ds-card-border-width',
      '--semantic-color-primary-base',
    ];

    for (const tokenName of tokenNames) {
      const entry = makeEntry({ property: tokenName });
      const item = buildOverrideItem(entry, 'file.scss');
      expect(item.token).toBe(tokenName);
    }
  });

  it('preserves newValue exactly as-is including complex values', () => {
    const values = [
      'red',
      '#ff0000',
      'var(--semantic-color-primary)',
      'rgba(0, 0, 0, 0.5)',
      '1px solid var(--ds-border-color)',
    ];

    for (const value of values) {
      const entry = makeEntry({ value });
      const item = buildOverrideItem(entry, 'file.scss');
      expect(item.newValue).toBe(value);
    }
  });

  it('preserves line number exactly', () => {
    const lines = [1, 10, 100, 999];

    for (const line of lines) {
      const entry = makeEntry({ line });
      const item = buildOverrideItem(entry, 'file.scss');
      expect(item.line).toBe(line);
    }
  });
});

// ---------------------------------------------------------------------------
// Property 5 — Mechanism determinism
// ---------------------------------------------------------------------------

describe('Property 5: Mechanism determinism', () => {
  /**
   * detectMechanism returns expected mechanism for each selector/value
   * combination following priority rules, and same inputs always produce
   * same output.
   *
   * **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5**
   */

  // --- Priority 1: !important ---
  describe('!important (highest priority)', () => {
    it('returns "important" when entry has !important', () => {
      const entry = makeEntry({ important: true, selector: ':host' });
      expect(detectMechanism(entry)).toBe('important');
    });

    it('!important takes priority over ::ng-deep', () => {
      const entry = makeEntry({
        important: true,
        selector: '::ng-deep .child',
      });
      expect(detectMechanism(entry)).toBe('important');
    });

    it('!important takes priority over :root[data-theme]', () => {
      const entry = makeEntry({
        important: true,
        selector: ':root[data-theme="dark"]',
      });
      expect(detectMechanism(entry)).toBe('important');
    });

    it('!important takes priority over class selector', () => {
      const entry = makeEntry({
        important: true,
        selector: '.my-class',
      });
      expect(detectMechanism(entry)).toBe('important');
    });
  });

  // --- Priority 2: ::ng-deep ---
  describe('::ng-deep (priority 2)', () => {
    it('returns "ng-deep" when selector contains ::ng-deep', () => {
      const entry = makeEntry({ value: 'red', selector: '::ng-deep .child' });
      expect(detectMechanism(entry)).toBe('ng-deep');
    });

    it('returns "ng-deep" for ::ng-deep with :host prefix', () => {
      const entry = makeEntry({
        value: 'red',
        selector: ':host ::ng-deep .inner',
      });
      expect(detectMechanism(entry)).toBe('ng-deep');
    });
  });

  // --- Priority 3: :root[data-theme] ---
  describe(':root[data-theme] (priority 3)', () => {
    it('returns "root-theme" when selector contains :root[data-theme', () => {
      const entry = makeEntry({
        value: 'red',
        selector: ':root[data-theme="dark"]',
      });
      expect(detectMechanism(entry)).toBe('root-theme');
    });

    it('returns "root-theme" for :root[data-theme without closing bracket', () => {
      const entry = makeEntry({ value: 'red', selector: ':root[data-theme' });
      expect(detectMechanism(entry)).toBe('root-theme');
    });
  });

  // --- Priority 4: :host ---
  describe(':host (priority 4)', () => {
    it('returns "host" when selector contains :host', () => {
      const entry = makeEntry({ value: 'red', selector: ':host' });
      expect(detectMechanism(entry)).toBe('host');
    });

    it('returns "host" for :host with context selector', () => {
      const entry = makeEntry({ value: 'red', selector: ':host(.active)' });
      expect(detectMechanism(entry)).toBe('host');
    });

    it('returns "host" for :host-context', () => {
      const entry = makeEntry({
        value: 'red',
        selector: ':host-context(.theme-dark)',
      });
      expect(detectMechanism(entry)).toBe('host');
    });
  });

  // --- Priority 5: class-selector ---
  describe('class-selector (priority 5)', () => {
    it('returns "class-selector" for a simple class selector', () => {
      const entry = makeEntry({ value: 'red', selector: '.my-class' });
      expect(detectMechanism(entry)).toBe('class-selector');
    });

    it('returns "class-selector" for compound class selector', () => {
      const entry = makeEntry({ value: 'red', selector: '.wrapper .inner' });
      expect(detectMechanism(entry)).toBe('class-selector');
    });

    it('returns "class-selector" for element.class selector', () => {
      const entry = makeEntry({ value: 'red', selector: 'div.container' });
      expect(detectMechanism(entry)).toBe('class-selector');
    });
  });

  // --- Fallback: unknown ---
  describe('fallback to unknown', () => {
    it('returns "unknown" for bare element selector', () => {
      const entry = makeEntry({ value: 'red', selector: 'div' });
      expect(detectMechanism(entry)).toBe('unknown');
    });

    it('returns "unknown" for empty selector', () => {
      const entry = makeEntry({ value: 'red', selector: '' });
      expect(detectMechanism(entry)).toBe('unknown');
    });

    it('returns "unknown" for :root without data-theme', () => {
      const entry = makeEntry({ value: 'red', selector: ':root' });
      expect(detectMechanism(entry)).toBe('unknown');
    });
  });

  // --- Determinism ---
  describe('determinism', () => {
    it('same inputs always produce the same output', () => {
      const testCases: ScssPropertyEntry[] = [
        makeEntry({ important: true, selector: ':host' }),
        makeEntry({ value: 'red', selector: '::ng-deep .child' }),
        makeEntry({ value: 'red', selector: ':root[data-theme="dark"]' }),
        makeEntry({ value: 'red', selector: ':host' }),
        makeEntry({ value: 'red', selector: '.my-class' }),
        makeEntry({ value: 'red', selector: 'div' }),
      ];

      for (const entry of testCases) {
        const result1 = detectMechanism(entry);
        const result2 = detectMechanism(entry);
        const result3 = detectMechanism(entry);
        expect(result1).toBe(result2);
        expect(result2).toBe(result3);
      }
    });

    it('returns consistent results across all 5 mechanism types', () => {
      const cases: Array<{
        entry: ScssPropertyEntry;
        expected: OverrideMechanism;
      }> = [
        {
          entry: makeEntry({ important: true, selector: ':host' }),
          expected: 'important',
        },
        {
          entry: makeEntry({ value: 'red', selector: '::ng-deep .child' }),
          expected: 'ng-deep',
        },
        {
          entry: makeEntry({
            value: 'red',
            selector: ':root[data-theme="dark"]',
          }),
          expected: 'root-theme',
        },
        {
          entry: makeEntry({ value: 'red', selector: ':host' }),
          expected: 'host',
        },
        {
          entry: makeEntry({ value: 'red', selector: '.wrapper' }),
          expected: 'class-selector',
        },
      ];

      for (const { entry, expected } of cases) {
        expect(detectMechanism(entry)).toBe(expected);
      }
    });
  });
});

// ---------------------------------------------------------------------------
// classifyOverride — supplementary tests
// ---------------------------------------------------------------------------

describe('classifyOverride', () => {
  it('returns "important-override" when entry has !important', () => {
    const entry = makeEntry({ important: true, selector: ':host' });
    expect(classifyOverride(entry, undefined)).toBe('important-override');
  });

  it('returns "deep-override" when selector contains ::ng-deep', () => {
    const entry = makeEntry({ value: 'red', selector: '::ng-deep .child' });
    expect(classifyOverride(entry, undefined)).toBe('deep-override');
  });

  it('returns "legitimate" when original token has theme scope', () => {
    const entry = makeEntry({ value: 'red', selector: ':host' });
    const original = makeTokenEntry('--ds-button-bg', '#000', {
      theme: 'dark',
    });
    expect(classifyOverride(entry, original)).toBe('legitimate');
  });

  it('returns "legitimate" when selector contains :root[data-theme', () => {
    const entry = makeEntry({
      value: 'red',
      selector: ':root[data-theme="dark"]',
    });
    expect(classifyOverride(entry, undefined)).toBe('legitimate');
  });

  it('returns "component-override" when selector contains :host', () => {
    const entry = makeEntry({ value: 'red', selector: ':host' });
    expect(classifyOverride(entry, undefined)).toBe('component-override');
  });

  it('returns "inline-override" when selector is a class selector', () => {
    const entry = makeEntry({ value: 'red', selector: '.my-class' });
    expect(classifyOverride(entry, undefined)).toBe('inline-override');
  });

  it('returns "scope-violation" as fallback', () => {
    const entry = makeEntry({ value: 'red', selector: 'div' });
    expect(classifyOverride(entry, undefined)).toBe('scope-violation');
  });
});

// ---------------------------------------------------------------------------
// runOverridesMode pipeline tests
// ---------------------------------------------------------------------------

import { runOverridesMode } from '../overrides-mode.js';
import * as path from 'node:path';
import * as os from 'node:os';
import * as fs from 'node:fs';
import { TokenDatasetImpl } from '../../../shared/utils/token-dataset.js';

function makeTempScss(content: string): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'overrides-test-'));
  const file = path.join(dir, 'test.scss');
  fs.writeFileSync(file, content, 'utf-8');
  return file;
}

describe('runOverridesMode pipeline', () => {
  const cwd = process.cwd();

  // --- Declaration detection ---

  it('detects a token declaration override via :host selector', async () => {
    const file = makeTempScss(':host { --ds-button-color-bg: red; }');
    const result = await runOverridesMode([file], {
      tokenDataset: null,
      tokenPrefix: '--ds-',
      cwd,
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].token).toBe('--ds-button-color-bg');
    expect(result.items[0].newValue).toBe('red');
    expect(result.items[0].mechanism).toBe('host');
    expect(result.items[0].file).toBe(path.relative(cwd, file));
  });

  it('detects a token declaration override via ::ng-deep selector', async () => {
    const file = makeTempScss('::ng-deep .inner { --ds-card-color-bg: blue; }');
    const result = await runOverridesMode([file], {
      tokenDataset: null,
      tokenPrefix: '--ds-',
      cwd,
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].mechanism).toBe('ng-deep');
  });

  // --- matchesPrefix logic ---

  it('skips declarations that do not match tokenPrefix when no dataset', async () => {
    const file = makeTempScss(':host { --other-token: red; }');
    const result = await runOverridesMode([file], {
      tokenDataset: null,
      tokenPrefix: '--ds-',
      cwd,
    });

    expect(result.items).toHaveLength(0);
  });

  it('detects declarations matched via dataset lookup when tokenPrefix is null', async () => {
    const dataset = new TokenDatasetImpl([
      {
        name: '--ds-button-color-bg',
        value: '#000',
        scope: {},
        sourceFile: 'tokens.css',
      },
    ]);
    const file = makeTempScss(':host { --ds-button-color-bg: red; }');
    const result = await runOverridesMode([file], {
      tokenDataset: dataset,
      tokenPrefix: null,
      cwd,
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].token).toBe('--ds-button-color-bg');
  });

  it('skips declarations not in dataset when tokenPrefix is null', async () => {
    const dataset = new TokenDatasetImpl([
      {
        name: '--ds-button-color-bg',
        value: '#000',
        scope: {},
        sourceFile: 'tokens.css',
      },
    ]);
    const file = makeTempScss(':host { --ds-unknown-token: red; }');
    const result = await runOverridesMode([file], {
      tokenDataset: dataset,
      tokenPrefix: null,
      cwd,
    });

    expect(result.items).toHaveLength(0);
  });

  // --- !important consumption path ---

  it('detects !important on a token consumption', async () => {
    const file = makeTempScss(
      '.foo { color: var(--ds-button-color-text) !important; }',
    );
    const result = await runOverridesMode([file], {
      tokenDataset: null,
      tokenPrefix: '--ds-',
      cwd,
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].mechanism).toBe('important');
    // PostCSS strips !important from value into decl.important — value is clean
    expect(result.items[0].newValue).toBe('var(--ds-button-color-text)');
  });

  it('skips !important consumption when tokenPrefix is null', async () => {
    const file = makeTempScss(
      '.foo { color: var(--ds-button-color-text) !important; }',
    );
    const result = await runOverridesMode([file], {
      tokenDataset: null,
      tokenPrefix: null,
      cwd,
    });

    // No prefix and no dataset — !important consumption path requires prefix match
    expect(result.items).toHaveLength(0);
  });

  // --- byClassification aggregation ---

  it('populates byClassification when dataset is available', async () => {
    const dataset = new TokenDatasetImpl([
      {
        name: '--ds-button-color-bg',
        value: '#000',
        scope: {},
        sourceFile: 'tokens.css',
      },
    ]);
    const file = makeTempScss(':host { --ds-button-color-bg: red; }');
    const result = await runOverridesMode([file], {
      tokenDataset: dataset,
      tokenPrefix: '--ds-',
      cwd,
    });

    expect(result.byClassification).toBeDefined();
    expect(Object.keys(result.byClassification!).length).toBeGreaterThan(0);
  });

  it('omits byClassification when no dataset is available', async () => {
    const file = makeTempScss(':host { --ds-button-color-bg: red; }');
    const result = await runOverridesMode([file], {
      tokenDataset: null,
      tokenPrefix: '--ds-',
      cwd,
    });

    expect(result.byClassification).toBeUndefined();
  });

  // --- Zero-config mode ---

  it('returns empty result when both tokenDataset and tokenPrefix are null', async () => {
    const file = makeTempScss(':host { --ds-button-color-bg: red; }');
    const result = await runOverridesMode([file], {
      tokenDataset: null,
      tokenPrefix: null,
      cwd,
    });

    expect(result.items).toHaveLength(0);
    expect(result.byMechanism).toEqual({});
    expect(result.byClassification).toBeUndefined();
  });

  // --- byMechanism aggregation ---

  it('counts mechanisms correctly across multiple overrides', async () => {
    const file = makeTempScss(`
      :host { --ds-button-color-bg: red; }
      :host { --ds-button-color-text: blue; }
      ::ng-deep .inner { --ds-card-color-bg: green; }
    `);
    const result = await runOverridesMode([file], {
      tokenDataset: null,
      tokenPrefix: '--ds-',
      cwd,
    });

    expect(result.byMechanism['host']).toBe(2);
    expect(result.byMechanism['ng-deep']).toBe(1);
  });

  // --- originalValue from dataset ---

  it('includes originalValue when token exists in dataset', async () => {
    const dataset = new TokenDatasetImpl([
      {
        name: '--ds-button-color-bg',
        value: 'var(--semantic-color-primary)',
        scope: {},
        sourceFile: 'tokens.css',
      },
    ]);
    const file = makeTempScss(':host { --ds-button-color-bg: red; }');
    const result = await runOverridesMode([file], {
      tokenDataset: dataset,
      tokenPrefix: '--ds-',
      cwd,
    });

    expect(result.items[0].originalValue).toBe('var(--semantic-color-primary)');
  });
});
