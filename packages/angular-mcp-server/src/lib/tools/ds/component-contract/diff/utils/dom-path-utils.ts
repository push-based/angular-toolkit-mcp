import type { DomPathDictionary } from '../../shared/models/types.js';

/**
 * Creates a new DOM path dictionary
 */
export function createDomPathDictionary(): DomPathDictionary {
  return {
    paths: [],
    lookup: new Map<string, number>(),
    stats: {
      totalPaths: 0,
      uniquePaths: 0,
      duplicateReferences: 0,
      bytesBeforeDeduplication: 0,
      bytesAfterDeduplication: 0,
    },
  };
}

/**
 * Detects if a string is a DOM path based on Angular component patterns
 */
export function isDomPath(str: string): boolean {
  return (
    typeof str === 'string' &&
    str.length > 20 &&
    str.includes(' > ') &&
    (str.includes('.') || str.includes('#')) &&
    /^[a-zA-Z]/.test(str)
  );
}

/**
 * Validates that a string is specifically a DOM path and not just any CSS selector
 */
export function isValidDomPath(str: string): boolean {
  return (
    isDomPath(str) &&
    !str.includes('@media') &&
    !str.includes('{') &&
    !str.includes('}') &&
    str.split(' > ').length > 2
  );
}

/**
 * Adds a DOM path to the dictionary and returns its reference
 */
export function addDomPath(
  dict: DomPathDictionary,
  path: string,
): { $domPath: number } {
  dict.stats.totalPaths++;
  dict.stats.bytesBeforeDeduplication += path.length;

  if (dict.lookup.has(path)) {
    dict.stats.duplicateReferences++;
    dict.stats.bytesAfterDeduplication += 12;
    return { $domPath: dict.lookup.get(path)! };
  }

  const index = dict.paths.length;
  dict.paths.push(path);
  dict.lookup.set(path, index);
  dict.stats.uniquePaths++;
  dict.stats.bytesAfterDeduplication += 12;

  return { $domPath: index };
}

/**
 * Processes a value and replaces DOM paths with references
 */
export function processDomPaths(value: any, dict: DomPathDictionary): any {
  if (typeof value === 'string') {
    if (isValidDomPath(value)) {
      return addDomPath(dict, value);
    }
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => processDomPaths(item, dict));
  }

  if (value && typeof value === 'object') {
    const processed: any = {};
    for (const [key, val] of Object.entries(value)) {
      processed[key] = processDomPaths(val, dict);
    }
    return processed;
  }

  return value;
}
