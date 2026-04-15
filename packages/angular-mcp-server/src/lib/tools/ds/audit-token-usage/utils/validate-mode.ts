import * as path from 'node:path';

import { parseScssValues } from '@push-based/styles-ast-utils';

import type { TokenDataset } from '../../shared/utils/token-dataset.js';
import { levenshtein } from './edit-distance.js';
import type {
  ValidTokenRef,
  InvalidTokenRef,
  BrandSpecificWarning,
  ValidateResult,
} from '../models/types.js';

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

export interface ValidateModeOptions {
  tokenPrefixes: string[] | null;
  brandName?: string;
  componentName?: string;
  cwd: string;
}

// ---------------------------------------------------------------------------
// Public helpers (exported for independent testing)
// ---------------------------------------------------------------------------

/**
 * Extracts CSS custom property names from `var()` expressions.
 *
 * Example: `"var(--ds-button-bg) var(--semantic-color-primary)"` →
 *          `["--ds-button-bg", "--semantic-color-primary"]`
 */
export function extractVarReferences(value: string): string[] {
  const matches = value.matchAll(/var\(\s*(--[\w-]+)/g);
  return [...matches].map((m) => m[1]);
}

/**
 * Finds the closest token name within Levenshtein distance ≤ 3.
 * Returns `null` when no candidate is close enough.
 * Short-circuits immediately on an exact match (distance 0).
 */
export function findClosestToken(
  name: string,
  dataset: TokenDataset,
  prefix: string,
): { name: string; distance: number } | null {
  const candidates = dataset.getByPrefix(prefix);
  let best: { name: string; distance: number } | null = null;

  for (const candidate of candidates) {
    const dist = levenshtein(name, candidate.name);
    if (dist === 0) return { name: candidate.name, distance: 0 };
    if (dist <= 3 && (best === null || dist < best.distance)) {
      best = { name: candidate.name, distance: dist };
    }
  }

  return best;
}

// ---------------------------------------------------------------------------
// Brand-specific check helper
// ---------------------------------------------------------------------------

function checkBrandSpecific(
  tokenName: string,
  tokenDataset: TokenDataset,
  brandName: string,
  relPath: string,
  line: number,
  brandWarnings: BrandSpecificWarning[],
): void {
  // Find all entries for this exact token name across every scope
  const allEntries = tokenDataset.tokens.filter((t) => t.name === tokenName);
  if (allEntries.length === 0) return;

  // A token is "universal" if at least one entry has no brand scope
  const hasUniversalEntry = allEntries.some((t) => !t.scope['brand']);
  if (hasUniversalEntry) return; // available everywhere — no warning needed

  // Token only exists under specific brand scopes — collect which brands
  const brandsWithToken = [
    ...new Set(
      allEntries
        .map((t) => t.scope['brand'])
        .filter((b): b is string => b != null),
    ),
  ];

  if (brandsWithToken.length > 0) {
    brandWarnings.push({
      token: tokenName,
      file: relPath,
      line,
      availableBrands: brandsWithToken,
    });
  }
}

// ---------------------------------------------------------------------------
// Main pipeline
// ---------------------------------------------------------------------------

/**
 * Runs the **validate** mode pipeline.
 *
 * For every style file:
 * 1. Parse with `parseScssValues` to get classified entries.
 * 2. Iterate consumptions and extract `var()` references.
 * 3. For each reference, check if it starts with any of the configured prefixes.
 * 4. Validate each matching reference against the `TokenDataset`.
 * 5. Compute typo suggestions via Levenshtein distance (threshold ≤ 3).
 * 6. Optionally check brand-specific token availability.
 *
 * When `tokenPrefixes` is null, all var() references found in the dataset are validated.
 */
export async function runValidateMode(
  styleFiles: string[],
  tokenDataset: TokenDataset,
  options: ValidateModeOptions,
): Promise<ValidateResult> {
  const semanticValid: ValidTokenRef[] = [];
  const semanticInvalid: InvalidTokenRef[] = [];
  const brandWarnings: BrandSpecificWarning[] = [];

  for (const filePath of styleFiles) {
    const parsed = await parseScssValues(filePath);
    const consumptions = parsed.getConsumptions();

    for (const entry of consumptions) {
      const tokenNames = extractVarReferences(entry.value);
      const relPath = path.relative(options.cwd, filePath);

      for (const tokenName of tokenNames) {
        // Determine which prefix this token matches, if any
        const matchedPrefix = options.tokenPrefixes
          ? options.tokenPrefixes.find((p) => tokenName.startsWith(p))
          : tokenDataset.getByName(tokenName) !== undefined
            ? ''
            : undefined;

        if (matchedPrefix === undefined) continue;

        const existing = tokenDataset.getByName(tokenName);

        if (existing) {
          semanticValid.push({
            token: tokenName,
            file: relPath,
            line: entry.line,
          });

          // Brand-specific check
          if (options.brandName) {
            checkBrandSpecific(
              tokenName,
              tokenDataset,
              options.brandName,
              relPath,
              entry.line,
              brandWarnings,
            );
          }
        } else {
          // Use the matched prefix for scoped candidate search; fall back to full scan
          const searchPrefix =
            matchedPrefix || tokenName.match(/^(--[\w]+-)/)?.[1] || '--';
          const suggestion = findClosestToken(
            tokenName,
            tokenDataset,
            searchPrefix,
          );
          semanticInvalid.push({
            token: tokenName,
            file: relPath,
            line: entry.line,
            ...(suggestion && {
              suggestion: suggestion.name,
              editDistance: suggestion.distance,
            }),
          });
        }
      }
    }
  }

  return {
    semantic: { valid: semanticValid, invalid: semanticInvalid },
    ...(brandWarnings.length > 0 && { brandWarnings }),
  };
}
