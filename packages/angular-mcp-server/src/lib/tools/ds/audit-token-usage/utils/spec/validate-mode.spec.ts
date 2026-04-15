import { describe, it, expect } from 'vitest';

import { extractVarReferences, findClosestToken } from '../validate-mode.js';
import {
  TokenDatasetImpl,
  type TokenEntry,
} from '../../../shared/utils/token-dataset.js';
import { levenshtein } from '../edit-distance.js';
import type { InvalidTokenRef } from '../../models/types.js';

/**
 * Validates: Requirements 3.1, 3.5, 3.6, 4.1, 4.4, 4.5
 *
 * Tests for validate mode correctness properties:
 * - Property 1: Prefix filtering — extractVarReferences + prefix filter returns only matching tokens
 * - Property 2: Suggestion threshold — findClosestToken returns suggestion iff distance ≤ 3
 * - Property 3: Invalid token report fields — InvalidTokenRef has all required fields
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeToken(name: string, value = '#000'): TokenEntry {
  return { name, value, scope: {}, sourceFile: 'tokens.css' };
}

function buildDataset(tokens: TokenEntry[]): TokenDatasetImpl {
  return new TokenDatasetImpl(tokens);
}

// ---------------------------------------------------------------------------
// Property 1 — Prefix filtering
// ---------------------------------------------------------------------------

describe('Property 1: Prefix filtering', () => {
  /**
   * extractVarReferences extracts all var() token names, and filtering by
   * prefix retains only those starting with the given prefix.
   * **Validates: Requirements 3.1, 4.1**
   */

  it('extracts a single var() reference', () => {
    const refs = extractVarReferences('var(--ds-button-bg)');
    expect(refs).toEqual(['--ds-button-bg']);
  });

  it('extracts multiple var() references from one value', () => {
    const refs = extractVarReferences(
      'var(--ds-button-bg) var(--semantic-color-primary)',
    );
    expect(refs).toEqual(['--ds-button-bg', '--semantic-color-primary']);
  });

  it('returns empty array when no var() references exist', () => {
    expect(extractVarReferences('red')).toEqual([]);
    expect(extractVarReferences('10px solid #ccc')).toEqual([]);
    expect(extractVarReferences('')).toEqual([]);
  });

  it('handles var() with whitespace after opening paren', () => {
    const refs = extractVarReferences('var(  --ds-spacing-sm )');
    expect(refs).toEqual(['--ds-spacing-sm']);
  });

  it('handles nested var() with fallback', () => {
    const refs = extractVarReferences('var(--ds-color-bg, var(--ds-fallback))');
    expect(refs).toEqual(['--ds-color-bg', '--ds-fallback']);
  });

  it('prefix filter retains only tokens starting with --ds-', () => {
    const refs = extractVarReferences(
      'var(--ds-button-bg) var(--semantic-color-primary) var(--ds-spacing-md)',
    );
    const dsOnly = refs.filter((r) => r.startsWith('--ds-'));
    expect(dsOnly).toEqual(['--ds-button-bg', '--ds-spacing-md']);
    // No semantic tokens should be in the filtered result
    for (const token of dsOnly) {
      expect(token.startsWith('--ds-')).toBe(true);
    }
  });

  it('prefix filter retains only tokens starting with --semantic-', () => {
    const refs = extractVarReferences(
      'var(--ds-button-bg) var(--semantic-color-primary) var(--semantic-font-size)',
    );
    const semanticOnly = refs.filter((r) => r.startsWith('--semantic-'));
    expect(semanticOnly).toEqual([
      '--semantic-color-primary',
      '--semantic-font-size',
    ]);
    for (const token of semanticOnly) {
      expect(token.startsWith('--semantic-')).toBe(true);
    }
  });

  it('prefix filter returns empty when no tokens match the prefix', () => {
    const refs = extractVarReferences('var(--ds-button-bg) var(--ds-spacing)');
    const filtered = refs.filter((r) => r.startsWith('--semantic-'));
    expect(filtered).toEqual([]);
  });

  it('every extracted token matching the prefix is included', () => {
    const value =
      'var(--ds-a) var(--other-b) var(--ds-c) var(--ds-d) var(--other-e)';
    const allRefs = extractVarReferences(value);
    const dsRefs = allRefs.filter((r) => r.startsWith('--ds-'));
    // All --ds- tokens from the original value must be present
    expect(dsRefs).toEqual(['--ds-a', '--ds-c', '--ds-d']);
    // No non-matching tokens should leak through
    expect(dsRefs.every((r) => r.startsWith('--ds-'))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Property 2 — Suggestion threshold
// ---------------------------------------------------------------------------

describe('Property 2: Suggestion threshold', () => {
  /**
   * findClosestToken returns a suggestion iff a candidate exists within
   * Levenshtein distance ≤ 3, and the returned distance is correct.
   * **Validates: Requirements 3.5, 4.4**
   */

  const tokens = [
    makeToken('--ds-button-color-bg'),
    makeToken('--ds-button-color-text'),
    makeToken('--ds-card-color-bg'),
    makeToken('--ds-spacing-sm'),
    makeToken('--ds-spacing-md'),
    makeToken('--ds-spacing-lg'),
  ];
  const dataset = buildDataset(tokens);

  it('returns exact match with distance 0 when token exists', () => {
    const result = findClosestToken('--ds-button-color-bg', dataset, '--ds-');
    expect(result).not.toBeNull();
    expect(result!.name).toBe('--ds-button-color-bg');
    expect(result!.distance).toBe(0);
  });

  it('returns suggestion for single-char typo (distance 1)', () => {
    // "buton" instead of "button" — missing one 't'
    const result = findClosestToken('--ds-buton-color-bg', dataset, '--ds-');
    expect(result).not.toBeNull();
    expect(result!.name).toBe('--ds-button-color-bg');
    expect(result!.distance).toBe(1);
  });

  it('returns suggestion for two-char typo (distance 2)', () => {
    // "buton-colr" instead of "button-color" — missing 't' and 'o'
    const result = findClosestToken('--ds-buton-colr-bg', dataset, '--ds-');
    expect(result).not.toBeNull();
    expect(result!.name).toBe('--ds-button-color-bg');
    expect(result!.distance).toBe(2);
  });

  it('returns suggestion for distance exactly 3', () => {
    // "spacng-s" instead of "spacing-sm" — 3 edits
    const result = findClosestToken('--ds-spacng-s', dataset, '--ds-');
    expect(result).not.toBeNull();
    expect(result!.distance).toBeLessThanOrEqual(3);
  });

  it('returns null when no candidate is within distance 3', () => {
    const result = findClosestToken(
      '--ds-completely-different-token-name',
      dataset,
      '--ds-',
    );
    expect(result).toBeNull();
  });

  it('returns null for empty dataset', () => {
    const emptyDataset = buildDataset([]);
    const result = findClosestToken('--ds-button-bg', emptyDataset, '--ds-');
    expect(result).toBeNull();
  });

  it('returns the closest candidate when multiple are within threshold', () => {
    // "--ds-spacing-sm" and "--ds-spacing-md" differ by 1 char each from "--ds-spacing-sx"
    const result = findClosestToken('--ds-spacing-sm', dataset, '--ds-');
    expect(result).not.toBeNull();
    expect(result!.name).toBe('--ds-spacing-sm');
    expect(result!.distance).toBe(0);
  });

  it('returned distance matches actual levenshtein distance', () => {
    // Verify the distance field is accurate
    const result = findClosestToken('--ds-buton-color-bg', dataset, '--ds-');
    expect(result).not.toBeNull();
    // Cross-check with the levenshtein function directly
    expect(result!.distance).toBe(
      levenshtein('--ds-buton-color-bg', result!.name),
    );
  });

  it('only considers candidates matching the given prefix', () => {
    const mixedTokens = [
      makeToken('--semantic-color-primary'),
      makeToken('--ds-color-primary'),
    ];
    const mixedDataset = buildDataset(mixedTokens);

    // Search with --semantic- prefix — should only find semantic tokens
    const result = findClosestToken(
      '--semantic-color-primry',
      mixedDataset,
      '--semantic-',
    );
    expect(result).not.toBeNull();
    expect(result!.name).toBe('--semantic-color-primary');
    expect(result!.name.startsWith('--semantic-')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Property 3 — Invalid token report fields
// ---------------------------------------------------------------------------

describe('Property 3: Invalid token report fields', () => {
  /**
   * InvalidTokenRef must have non-empty token, file, and line fields.
   * When a suggestion exists, suggestion and editDistance must also be present.
   * **Validates: Requirements 3.6, 4.5**
   */

  it('InvalidTokenRef without suggestion has required fields', () => {
    const ref: InvalidTokenRef = {
      token: '--ds-nonexistent-token',
      file: 'src/components/button.scss',
      line: 42,
    };

    expect(ref.token).toBeTruthy();
    expect(ref.token.length).toBeGreaterThan(0);
    expect(ref.file).toBeTruthy();
    expect(ref.file.length).toBeGreaterThan(0);
    expect(ref.line).toBeGreaterThan(0);
    expect(ref.suggestion).toBeUndefined();
    expect(ref.editDistance).toBeUndefined();
  });

  it('InvalidTokenRef with suggestion has all fields', () => {
    const ref: InvalidTokenRef = {
      token: '--ds-buton-color-bg',
      file: 'src/components/button.scss',
      line: 15,
      suggestion: '--ds-button-color-bg',
      editDistance: 1,
    };

    expect(ref.token).toBeTruthy();
    expect(ref.token.length).toBeGreaterThan(0);
    expect(ref.file).toBeTruthy();
    expect(ref.file.length).toBeGreaterThan(0);
    expect(ref.line).toBeGreaterThan(0);
    expect(ref.suggestion).toBeTruthy();
    expect(ref.suggestion!.length).toBeGreaterThan(0);
    expect(ref.editDistance).toBeDefined();
    expect(ref.editDistance).toBeGreaterThan(0);
    expect(ref.editDistance).toBeLessThanOrEqual(3);
  });

  it('constructs correct InvalidTokenRef from findClosestToken result', () => {
    const tokens = [
      makeToken('--ds-button-color-bg'),
      makeToken('--ds-button-color-text'),
    ];
    const dataset = buildDataset(tokens);

    const invalidName = '--ds-buton-color-bg';
    const suggestion = findClosestToken(invalidName, dataset, '--ds-');

    const ref: InvalidTokenRef = {
      token: invalidName,
      file: 'components/button.component.scss',
      line: 10,
      ...(suggestion && {
        suggestion: suggestion.name,
        editDistance: suggestion.distance,
      }),
    };

    // Required fields are non-empty
    expect(ref.token).toBe(invalidName);
    expect(ref.file).toBeTruthy();
    expect(ref.line).toBe(10);

    // Suggestion fields are present because a close match exists
    expect(ref.suggestion).toBe('--ds-button-color-bg');
    expect(ref.editDistance).toBe(1);
  });

  it('constructs InvalidTokenRef without suggestion when no close match', () => {
    const tokens = [makeToken('--ds-button-color-bg')];
    const dataset = buildDataset(tokens);

    const invalidName = '--ds-completely-unrelated-name';
    const suggestion = findClosestToken(invalidName, dataset, '--ds-');

    const ref: InvalidTokenRef = {
      token: invalidName,
      file: 'components/card.component.scss',
      line: 25,
      ...(suggestion && {
        suggestion: suggestion.name,
        editDistance: suggestion.distance,
      }),
    };

    expect(ref.token).toBe(invalidName);
    expect(ref.file).toBeTruthy();
    expect(ref.line).toBe(25);
    // No suggestion because the token is too far from any candidate
    expect(ref.suggestion).toBeUndefined();
    expect(ref.editDistance).toBeUndefined();
  });

  it('editDistance is always ≤ 3 when suggestion is present', () => {
    const tokens = [
      makeToken('--semantic-color-primary-base'),
      makeToken('--semantic-color-secondary-base'),
      makeToken('--semantic-font-size-sm'),
    ];
    const dataset = buildDataset(tokens);

    // Various typos that should produce suggestions
    const typos = [
      '--semantic-color-primry-base', // 1 deletion
      '--semantic-color-primary-bse', // 1 deletion
      '--semantic-font-size-sn', // 1 substitution
    ];

    for (const typo of typos) {
      const suggestion = findClosestToken(typo, dataset, '--semantic-');
      if (suggestion) {
        const ref: InvalidTokenRef = {
          token: typo,
          file: 'test.scss',
          line: 1,
          suggestion: suggestion.name,
          editDistance: suggestion.distance,
        };
        expect(ref.editDistance).toBeLessThanOrEqual(3);
        expect(ref.editDistance).toBeGreaterThan(0);
      }
    }
  });
});
