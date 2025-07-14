/* eslint-disable prefer-const */
import { describe, it, expect } from 'vitest';

import {
  createDomPathDictionary,
  isDomPath,
  isValidDomPath,
  addDomPath,
  processDomPaths,
} from '../utils/dom-path-utils.js';

const SAMPLE_PATH = 'div#root > span.foo > button.bar';

describe('dom-path-utils', () => {
  describe('isDomPath / isValidDomPath', () => {
    it('detects DOM-like selector strings correctly', () => {
      expect(isDomPath(SAMPLE_PATH)).toBe(true);
      expect(isValidDomPath(SAMPLE_PATH)).toBe(true);

      expect(isDomPath('div')).toBe(false);
      expect(isDomPath('div.foo')).toBe(false);
      const mediaPath = `${SAMPLE_PATH} @media`;
      expect(isDomPath(mediaPath)).toBe(true);
      expect(isValidDomPath(mediaPath)).toBe(false);
    });
  });

  describe('addDomPath & createDomPathDictionary', () => {
    it('adds new paths and deduplicates existing ones', () => {
      const dict = createDomPathDictionary();

      const ref1 = addDomPath(dict, SAMPLE_PATH);
      expect(ref1).toEqual({ $domPath: 0 });
      expect(dict.paths[0]).toBe(SAMPLE_PATH);
      expect(dict.stats.totalPaths).toBe(1);
      expect(dict.stats.uniquePaths).toBe(1);
      expect(dict.stats.duplicateReferences).toBe(0);

      const ref2 = addDomPath(dict, SAMPLE_PATH);
      expect(ref2).toEqual({ $domPath: 0 });
      expect(dict.stats.totalPaths).toBe(2);
      expect(dict.stats.uniquePaths).toBe(1);
      expect(dict.stats.duplicateReferences).toBe(1);
    });
  });

  describe('processDomPaths', () => {
    it('recursively replaces DOM path strings with references', () => {
      const dict = createDomPathDictionary();

      const input = {
        pathA: SAMPLE_PATH,
        nested: ['no-dom-path', SAMPLE_PATH, { deeper: SAMPLE_PATH }],
      };

      const processed = processDomPaths(input, dict);

      expect(processed.pathA).toEqual({ $domPath: 0 });
      expect(processed.nested[1]).toEqual({ $domPath: 0 });
      expect(processed.nested[2].deeper).toEqual({ $domPath: 0 });

      expect(dict.paths).toEqual([SAMPLE_PATH]);
      expect(dict.stats.uniquePaths).toBe(1);
    });
  });
});
