/* eslint-disable prefer-const */
import { describe, it, expect } from 'vitest';

import type { Difference } from 'microdiff';
import {
  consolidateAndPruneRemoveOperations,
  consolidateAndPruneRemoveOperationsWithDeduplication,
  isChildPath,
  groupChangesByDomainAndType,
  generateDiffSummary,
} from '../utils/diff-utils.js';

function makeRemove(path: (string | number)[]): Difference {
  return { type: 'REMOVE', path, oldValue: 'dummy' } as any;
}

function makeAdd(path: (string | number)[], value: any): Difference {
  return { type: 'ADD', path, value } as any;
}

describe('diff-utils', () => {
  describe('isChildPath', () => {
    it('identifies descendant paths correctly', () => {
      expect(isChildPath(['a', 'b', 'c'], ['a', 'b'])).toBe(true);
      expect(isChildPath(['a', 'b'], ['a', 'b', 'c'])).toBe(false);
      expect(isChildPath(['x'], ['x'])).toBe(false);
    });
  });

  describe('consolidateAndPruneRemoveOperations', () => {
    it('consolidates CSS rule removals and prunes redundant child removals', () => {
      const diff: Difference[] = [
        makeRemove(['styles', 'rules', 'div']),
        makeRemove(['styles', 'rules', 'span']),
        makeRemove(['dom', 'elements', 0, 'attributes']),
        makeRemove(['dom', 'elements']),
        makeAdd(['meta', 'name'], 'Foo'),
      ];

      const processed = consolidateAndPruneRemoveOperations(diff);

      expect(processed).toEqual(
        expect.arrayContaining([expect.objectContaining({ type: 'ADD' })]),
      );

      expect(processed).toContainEqual({
        type: 'REMOVE',
        path: ['styles', 'rules'],
        oldValue: ['div', 'span'],
      } as any);

      expect(
        processed.filter((c) => JSON.stringify(c.path).includes('dom')),
      ).toHaveLength(1);
      expect(processed).toContainEqual(makeRemove(['dom', 'elements']));
    });
  });

  describe('consolidateAndPruneRemoveOperationsWithDeduplication', () => {
    it('deduplicates DOM paths into dictionary', () => {
      const LONG_PATH = 'div#root > span.foo > button.bar';

      const diff: Difference[] = [
        {
          type: 'CHANGE',
          path: ['dom', 'elementPath'],
          oldValue: LONG_PATH,
          value: `${LONG_PATH} > svg.icon`,
        } as any,
      ];

      const { processedResult, domPathDict } =
        consolidateAndPruneRemoveOperationsWithDeduplication(diff);

      const refObj = { $domPath: 0 };
      expect((processedResult[0] as any).oldValue).toEqual(refObj);

      expect(domPathDict.paths).toEqual([LONG_PATH, `${LONG_PATH} > svg.icon`]);
      expect(domPathDict.stats.uniquePaths).toBe(2);
    });
  });

  describe('groupChangesByDomainAndType / generateDiffSummary', () => {
    it('groups changes and summarizes stats', () => {
      const diff: Difference[] = [
        makeAdd(['meta', 'name'], 'Foo'),
        makeRemove(['styles', 'rules', 'div']),
      ];

      const grouped = groupChangesByDomainAndType(diff);

      expect(grouped).toHaveProperty('meta');
      expect(grouped.meta).toHaveProperty('ADD');
      expect(grouped.meta.ADD).toHaveLength(1);
      expect(grouped).toHaveProperty('styles');

      const summary = generateDiffSummary(diff, grouped);

      expect(summary.totalChanges).toBe(2);
      expect(summary.changeTypes.ADD).toBe(1);
      expect(summary.changeTypes.REMOVE).toBe(1);
      expect(summary.changesByDomain.meta.ADD).toBe(1);
    });
  });
});
