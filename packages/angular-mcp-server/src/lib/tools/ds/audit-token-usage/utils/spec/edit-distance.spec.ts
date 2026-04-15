import { describe, it, expect } from 'vitest';
import { levenshtein } from '../edit-distance.js';

/**
 * Validates: Requirements 16.1, 16.2, 16.3
 *
 * Tests for edit-distance correctness properties:
 * - Property 8: Identity — levenshtein(a, b) === 0 iff a === b
 * - Property 9: Symmetry — levenshtein(a, b) === levenshtein(b, a)
 * - Property 10: Empty string base case — levenshtein(a, '') === a.length
 */

describe('levenshtein – edit-distance', () => {
  /**
   * Property 8 — Identity:
   * levenshtein(a, b) === 0 if and only if a === b
   * **Validates: Requirements 16.1**
   */
  describe('Property 8: Identity', () => {
    it('returns 0 for two empty strings', () => {
      expect(levenshtein('', '')).toBe(0);
    });

    it('returns 0 for identical single-char strings', () => {
      expect(levenshtein('a', 'a')).toBe(0);
    });

    it('returns 0 for identical multi-char strings', () => {
      expect(levenshtein('hello', 'hello')).toBe(0);
    });

    it('returns 0 for identical token-like strings', () => {
      expect(levenshtein('--ds-button-color-bg', '--ds-button-color-bg')).toBe(
        0,
      );
    });

    it('returns non-zero for different strings', () => {
      expect(levenshtein('a', 'b')).not.toBe(0);
    });

    it('returns non-zero for strings differing by one char', () => {
      expect(levenshtein('cat', 'car')).not.toBe(0);
    });

    it('returns non-zero for empty vs non-empty', () => {
      expect(levenshtein('', 'a')).not.toBe(0);
    });
  });

  /**
   * Property 9 — Symmetry:
   * levenshtein(a, b) === levenshtein(b, a)
   * **Validates: Requirements 16.2**
   */
  describe('Property 9: Symmetry', () => {
    const pairs: [string, string][] = [
      ['', ''],
      ['', 'abc'],
      ['a', 'b'],
      ['kitten', 'sitting'],
      ['--ds-button-bg', '--ds-button-color-bg'],
      ['abc', 'xyz'],
      ['flaw', 'lawn'],
    ];

    for (const [a, b] of pairs) {
      it(`levenshtein('${a}', '${b}') === levenshtein('${b}', '${a}')`, () => {
        expect(levenshtein(a, b)).toBe(levenshtein(b, a));
      });
    }
  });

  /**
   * Property 10 — Empty string base case:
   * levenshtein(a, '') === a.length and levenshtein('', a) === a.length
   * **Validates: Requirements 16.3**
   */
  describe('Property 10: Empty string base case', () => {
    const strings = ['', 'a', 'ab', 'hello', '--ds-button-enabled-color-bg'];

    for (const s of strings) {
      it(`levenshtein('${s}', '') === ${s.length}`, () => {
        expect(levenshtein(s, '')).toBe(s.length);
      });

      it(`levenshtein('', '${s}') === ${s.length}`, () => {
        expect(levenshtein('', s)).toBe(s.length);
      });
    }
  });

  /**
   * Known distances — example-based verification
   */
  describe('Known distances', () => {
    it('kitten → sitting = 3', () => {
      expect(levenshtein('kitten', 'sitting')).toBe(3);
    });

    it('single insertion: abc → abcd = 1', () => {
      expect(levenshtein('abc', 'abcd')).toBe(1);
    });

    it('single deletion: abcd → abc = 1', () => {
      expect(levenshtein('abcd', 'abc')).toBe(1);
    });

    it('single substitution: abc → aXc = 1', () => {
      expect(levenshtein('abc', 'aXc')).toBe(1);
    });

    it('completely different strings: abc → xyz = 3', () => {
      expect(levenshtein('abc', 'xyz')).toBe(3);
    });

    it('token typo: --ds-buton-bg → --ds-button-bg = 1', () => {
      expect(levenshtein('--ds-buton-bg', '--ds-button-bg')).toBe(1);
    });
  });
});
