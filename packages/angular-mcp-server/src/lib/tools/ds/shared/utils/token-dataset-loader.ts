import * as fs from 'node:fs';
import * as path from 'node:path';

import { globToRegex, walkDirectorySync } from '@push-based/utils';
import { parseCssCustomProperties } from '@push-based/styles-ast-utils';
import type { TokensConfig } from '../../../../validation/angular-mcp-server-options.schema.js';
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
    const patternDisplay = Array.isArray(tokens.filePattern)
      ? tokens.filePattern.join(', ')
      : tokens.filePattern;
    return createEmptyTokenDataset(
      `No files matched pattern '${patternDisplay}' in '${generatedStylesRoot}'`,
    );
  }

  // Determine effective scope strategy
  const strategy = resolveScopeStrategy(tokens.scopeStrategy);

  // Parse and build tokens
  const allTokens: TokenEntry[] = [];

  for (const filePath of files) {
    const scope = computeScope(strategy, filePath, absRoot);
    const properties = await parseCssCustomProperties(filePath, {
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
 * Discovers files matching one or more glob patterns under the given root.
 */
function discoverFiles(
  absRoot: string,
  filePattern: string | string[],
): string[] {
  const allFiles = walkDirectorySync(absRoot);
  const patterns = Array.isArray(filePattern) ? filePattern : [filePattern];
  const regexes = patterns.map(globToRegex);
  return allFiles
    .filter((f) => {
      const rel = path.relative(absRoot, f).replace(/\\/g, '/');
      return regexes.some((re) => re.test(rel));
    })
    .sort();
}

// ---------------------------------------------------------------------------
// Directory Strategy
// ---------------------------------------------------------------------------

type EffectiveStrategy = 'flat' | 'brand-theme';

function resolveScopeStrategy(
  configured: TokensConfig['scopeStrategy'],
): EffectiveStrategy {
  return configured;
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
