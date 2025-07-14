import type { Difference } from 'microdiff';
import type { DomPathDictionary } from '../../shared/models/types.js';
import { createDomPathDictionary, processDomPaths } from './dom-path-utils.js';

/**
 * Enhanced version of consolidateAndPruneRemoveOperations with DOM path deduplication
 */
export function consolidateAndPruneRemoveOperationsWithDeduplication(
  diffResult: Difference[],
): {
  processedResult: Difference[];
  domPathDict: DomPathDictionary;
} {
  const consolidatedResult = consolidateAndPruneRemoveOperations(diffResult);

  const domPathDict = createDomPathDictionary(),
    processedResult = consolidatedResult.map((c) =>
      processDomPaths(c, domPathDict),
    );

  return {
    processedResult,
    domPathDict,
  };
}

/**
 * Consolidates REMOVE operations for CSS rules in styles section and
 * prunes redundant child REMOVE operations from a microdiff result.
 */
export function consolidateAndPruneRemoveOperations(
  diffResult: Difference[],
): Difference[] {
  const { removeOperations, nonRemoveOperations } = diffResult.reduce(
    (acc, change) => {
      (change.type === 'REMOVE'
        ? acc.removeOperations
        : acc.nonRemoveOperations
      ).push(change);
      return acc;
    },
    {
      removeOperations: [] as Difference[],
      nonRemoveOperations: [] as Difference[],
    },
  );

  if (removeOperations.length === 0) {
    return diffResult;
  }

  const cssRuleRemoves = new Map<string, Difference[]>();
  const otherRemoves: Difference[] = [];

  const isCssRuleRemove = (d: Difference) =>
    d.type === 'REMOVE' &&
    d.path.length === 3 &&
    d.path[0] === 'styles' &&
    d.path[1] === 'rules' &&
    typeof d.path[2] === 'string';

  for (const remove of removeOperations) {
    if (isCssRuleRemove(remove)) {
      const key = 'styles.rules';
      const group = cssRuleRemoves.get(key) ?? [];
      group.push(remove);
      cssRuleRemoves.set(key, group);
    } else {
      otherRemoves.push(remove);
    }
  }

  const consolidatedCssRuleChanges: Difference[] = [
    ...[...cssRuleRemoves.values()].flatMap((removes) =>
      removes.length > 1
        ? [
            {
              type: 'REMOVE',
              path: ['styles', 'rules'],
              oldValue: removes.map((r) => r.path[2]),
            } as Difference,
          ]
        : removes,
    ),
  ];

  otherRemoves.sort((a, b) => a.path.length - b.path.length);

  const prunedOtherRemoves: Difference[] = [];

  for (const currentRemove of otherRemoves) {
    let isRedundant = false;

    for (const existingRemove of prunedOtherRemoves) {
      if (isChildPath(currentRemove.path, existingRemove.path)) {
        isRedundant = true;
        break;
      }
    }

    if (!isRedundant) {
      prunedOtherRemoves.push(currentRemove);
    }
  }

  return [
    ...nonRemoveOperations,
    ...consolidatedCssRuleChanges,
    ...prunedOtherRemoves,
  ];
}

/**
 * Checks if childPath is a descendant of parentPath.
 * For example, ['a', 'b', 'c'] is a child of ['a', 'b']
 */
export function isChildPath(
  childPath: (string | number)[],
  parentPath: (string | number)[],
): boolean {
  return (
    childPath.length > parentPath.length &&
    parentPath.every((seg, i) => childPath[i] === seg)
  );
}

/**
 * Groups diff changes by domain first, then by type within each domain.
 * Removes the domain from the path since it's captured in the grouping structure.
 */
export function groupChangesByDomainAndType(
  changes: Difference[],
): Record<string, Record<string, any[]>> {
  return changes.reduce(
    (acc: Record<string, Record<string, any[]>>, change: Difference) => {
      const { type, path, ...changeWithoutTypeAndPath } = change;
      const domain = path[0] as string;
      if (!acc[domain]) acc[domain] = {};
      if (!acc[domain][type]) acc[domain][type] = [];
      acc[domain][type].push({
        ...changeWithoutTypeAndPath,
        path: path.slice(1),
      });
      return acc;
    },
    {} as Record<string, Record<string, any[]>>,
  );
}

/**
 * Generates a comprehensive summary of diff changes including totals and breakdowns by type and domain.
 */
export function generateDiffSummary(
  processedResult: Difference[],
  groupedChanges: Record<string, Record<string, any[]>>,
): {
  totalChanges: number;
  changeTypes: Record<string, number>;
  changesByDomain: Record<string, Record<string, number>>;
} {
  return {
    totalChanges: processedResult.length,
    changeTypes: processedResult.reduce(
      (acc: Record<string, number>, change: Difference) => {
        acc[change.type] = (acc[change.type] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ),
    changesByDomain: Object.entries(groupedChanges).reduce(
      (acc: Record<string, Record<string, number>>, [domain, types]) => {
        acc[domain] = Object.entries(types).reduce(
          (domainAcc: Record<string, number>, [type, changes]) => {
            domainAcc[type] = changes.length;
            return domainAcc;
          },
          {} as Record<string, number>,
        );
        return acc;
      },
      {} as Record<string, Record<string, number>>,
    ),
  };
}
