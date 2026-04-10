import * as fs from 'node:fs';
import * as path from 'node:path';

import type { TokensConfig } from '../../../../validation/angular-mcp-server-options.schema.js';
import { parseCssCustomProperties } from './css-custom-property-parser.js';
import {
  type TokenEntry,
  type TokenScope,
  type TokenDataset,
  TokenDatasetImpl,
  createEmptyTokenDataset,
} from './token-dataset.js';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface TokenDatasetLoaderOptions {
  generatedStylesRoot: string;
  workspaceRoot: string;
  tokens: TokensConfig;
}

/**
 * Discovers token files, parses them, categorises tokens, and returns
 * an immutable queryable TokenDataset.
 */
export async function loadTokenDataset(
  options: TokenDatasetLoaderOptions,
): Promise<TokenDataset> {
  const { generatedStylesRoot, workspaceRoot, tokens } = options;

  const absRoot = path.resolve(workspaceRoot, generatedStylesRoot);

  // Guard: root must exist and be a directory
  if (!isReadableDirectory(absRoot)) {
    return createEmptyTokenDataset(
      `generatedStylesRoot '${generatedStylesRoot}' does not exist or is not a readable directory`,
    );
  }

  // Discover files
  const files = discoverFiles(absRoot, tokens.filePattern);

  if (files.length === 0) {
    return createEmptyTokenDataset(
      `No files matched pattern '${tokens.filePattern}' in '${generatedStylesRoot}'`,
    );
  }

  // Determine effective directory strategy
  const strategy = resolveDirectoryStrategy(
    tokens.directoryStrategy,
    files,
    absRoot,
  );

  // Parse and build tokens
  const allTokens: TokenEntry[] = [];

  for (const filePath of files) {
    const scope = computeScope(strategy, filePath, absRoot);
    const properties = parseCssCustomProperties(filePath, {
      propertyPrefix: tokens.propertyPrefix,
    });

    for (const [name, value] of properties) {
      const category = categoriseToken(
        name,
        value,
        tokens.categoryInference,
        tokens.categoryPrefixMap,
      );

      allTokens.push({
        name,
        value,
        category,
        scope,
        sourceFile: path.relative(workspaceRoot, filePath),
      });
    }
  }

  return new TokenDatasetImpl(allTokens);
}

// Re-export for convenience
export { createEmptyTokenDataset } from './token-dataset.js';

// ---------------------------------------------------------------------------
// File Discovery
// ---------------------------------------------------------------------------

/**
 * Discovers files matching a glob-like pattern under the given root.
 * Supports `**` for recursive directory matching and `*` for single-segment wildcards.
 * Uses synchronous fs operations consistent with existing codebase patterns.
 */
function discoverFiles(absRoot: string, filePattern: string): string[] {
  const allFiles = walkDirectory(absRoot);
  const matcher = createGlobMatcher(filePattern);
  return allFiles.filter((f) => matcher(path.relative(absRoot, f))).sort();
}

/**
 * Recursively walks a directory and returns all file paths.
 */
function walkDirectory(dir: string): string[] {
  const results: string[] = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...walkDirectory(fullPath));
      } else if (entry.isFile()) {
        results.push(fullPath);
      }
    }
  } catch {
    // Silently skip unreadable directories
  }
  return results;
}

/**
 * Creates a matcher function from a glob-like pattern.
 * Converts glob syntax to a RegExp:
 *  - `**` matches any number of path segments (including zero)
 *  - `*` matches any characters within a single path segment
 *  - `.` and other regex specials are escaped
 */
function createGlobMatcher(pattern: string): (filePath: string) => boolean {
  // Normalise to forward slashes
  const normalised = pattern.replace(/\\/g, '/');

  // Build regex from glob pattern
  let regexStr = '';
  let i = 0;
  while (i < normalised.length) {
    if (normalised[i] === '*' && normalised[i + 1] === '*') {
      // ** matches any path segments
      regexStr += '.*';
      i += 2;
      // Skip trailing slash after **
      if (normalised[i] === '/') i++;
    } else if (normalised[i] === '*') {
      // * matches anything except path separator
      regexStr += '[^/]*';
      i++;
    } else if ('.+?^${}()|[]\\'.includes(normalised[i])) {
      // Escape regex special characters
      regexStr += '\\' + normalised[i];
      i++;
    } else {
      regexStr += normalised[i];
      i++;
    }
  }

  const regex = new RegExp(`^${regexStr}$`);
  return (filePath: string) => regex.test(filePath.replace(/\\/g, '/'));
}

// ---------------------------------------------------------------------------
// Directory Strategy
// ---------------------------------------------------------------------------

type EffectiveStrategy = 'flat' | 'brand-theme';

function resolveDirectoryStrategy(
  configured: TokensConfig['directoryStrategy'],
  files: string[],
  absRoot: string,
): EffectiveStrategy {
  if (configured === 'flat') return 'flat';
  if (configured === 'brand-theme') return 'brand-theme';

  // auto: infer from max directory depth
  const maxDepth = computeMaxDepth(files, absRoot);
  return maxDepth >= 2 ? 'brand-theme' : 'flat';
}

function computeMaxDepth(files: string[], absRoot: string): number {
  let max = 0;
  for (const filePath of files) {
    const rel = path.relative(absRoot, path.dirname(filePath));
    if (rel === '' || rel === '.') continue;
    const depth = rel.split(path.sep).length;
    if (depth > max) max = depth;
  }
  return max;
}

function computeScope(
  strategy: EffectiveStrategy,
  filePath: string,
  absRoot: string,
): TokenScope {
  if (strategy === 'flat') return {};

  // brand-theme: parse path segments relative to root
  const rel = path.relative(absRoot, path.dirname(filePath));
  if (rel === '' || rel === '.') return {};

  const segments = rel.split(path.sep);
  const scope: TokenScope = {};

  const scopeKeys = ['brand', 'theme'];
  for (let i = 0; i < Math.min(segments.length, scopeKeys.length); i++) {
    scope[scopeKeys[i]] = segments[i];
  }

  return scope;
}

// ---------------------------------------------------------------------------
// Categorisation
// ---------------------------------------------------------------------------

function categoriseToken(
  name: string,
  value: string,
  inference: TokensConfig['categoryInference'],
  prefixMap: Record<string, string>,
): string | undefined {
  switch (inference) {
    case 'by-prefix':
      return categoriseByPrefix(name, prefixMap);
    case 'by-value':
      return categoriseByValue(value);
    case 'none':
      return undefined;
  }
}

/**
 * Longest prefix match from categoryPrefixMap.
 * The map is { category: prefix }, e.g. { color: '--semantic-color' }.
 * We find the entry whose prefix is the longest match for the token name.
 */
function categoriseByPrefix(
  name: string,
  prefixMap: Record<string, string>,
): string | undefined {
  let bestCategory: string | undefined;
  let bestLength = 0;

  for (const [category, prefix] of Object.entries(prefixMap)) {
    if (name.startsWith(prefix) && prefix.length > bestLength) {
      bestCategory = category;
      bestLength = prefix.length;
    }
  }

  return bestCategory;
}

/** Value-pattern regexes for category inference */
const VALUE_CATEGORY_PATTERNS: Array<{ pattern: RegExp; category: string }> = [
  // Colors: hex, rgb, rgba, hsl, hsla
  { pattern: /^#([0-9a-fA-F]{3,8})$/, category: 'color' },
  { pattern: /^rgba?\s*\(/, category: 'color' },
  { pattern: /^hsla?\s*\(/, category: 'color' },
  // Spacing: px, rem, em values
  { pattern: /^-?[\d.]+px$/, category: 'spacing' },
  { pattern: /^-?[\d.]+rem$/, category: 'spacing' },
  { pattern: /^-?[\d.]+em$/, category: 'spacing' },
  // Opacity: percentage
  { pattern: /^[\d.]+%$/, category: 'opacity' },
];

function categoriseByValue(value: string): string | undefined {
  const trimmed = value.trim();
  for (const { pattern, category } of VALUE_CATEGORY_PATTERNS) {
    if (pattern.test(trimmed)) {
      return category;
    }
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isReadableDirectory(absPath: string): boolean {
  try {
    const stat = fs.statSync(absPath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}
