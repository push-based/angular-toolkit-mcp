import * as path from 'node:path';

import { parseScssValues } from '@push-based/styles-ast-utils';

import type { TokenDataset } from '../../shared/utils/token-dataset.js';
import { detectMechanism, classifyOverride } from './override-classifier.js';
import type { OverrideItem, OverridesResult } from '../models/types.js';

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

export interface OverridesModeOptions {
  tokenDataset: TokenDataset | null;
  tokenPrefix: string | null;
  cwd: string;
}

// ---------------------------------------------------------------------------
// Main pipeline
// ---------------------------------------------------------------------------

/**
 * Runs the **overrides** mode pipeline.
 *
 * For every style file:
 * 1. Parse with `parseScssValues` to get classified entries.
 * 2. Iterate declarations (token overrides) and consumptions.
 * 3. Detect the override mechanism.
 * 4. Optionally classify the override when `tokenDataset` is available.
 *
 * When `tokenDataset` is unavailable (zero-config mode), `classification`
 * and `originalValue` are omitted from the output.
 */
export async function runOverridesMode(
  styleFiles: string[],
  options: OverridesModeOptions,
): Promise<OverridesResult> {
  const overrideItems: OverrideItem[] = [];
  const mechanismCounts: Record<string, number> = {};
  const classificationCounts: Record<string, number> = {};

  for (const filePath of styleFiles) {
    const parsed = await parseScssValues(filePath);
    const declarations = parsed.getDeclarations();
    const consumptions = parsed.getConsumptions();
    const relPath = path.relative(options.cwd, filePath);

    // --- Token declarations ---
    for (const entry of declarations) {
      const isKnownToken = options.tokenDataset
        ? options.tokenDataset.getByName(entry.property) !== undefined
        : false;

      const matchesPrefix =
        isKnownToken ||
        (options.tokenPrefix != null &&
          entry.property.startsWith(options.tokenPrefix));

      if (!matchesPrefix) continue;

      const mechanism = detectMechanism(entry);
      mechanismCounts[mechanism] = (mechanismCounts[mechanism] ?? 0) + 1;

      const item: OverrideItem = {
        file: relPath,
        line: entry.line,
        token: entry.property,
        newValue: entry.value,
        mechanism,
      };

      if (options.tokenDataset) {
        const original = options.tokenDataset.getByName(entry.property);
        if (original) {
          item.originalValue = original.value;
        }
        const classification = classifyOverride(entry, original);
        item.classification = classification;
        classificationCounts[classification] =
          (classificationCounts[classification] ?? 0) + 1;
      }

      overrideItems.push(item);
    }

    // --- Token consumptions — detect !important only ---
    for (const entry of consumptions) {
      if (!entry.important) continue;

      const tokenMatch = entry.value.match(/var\(\s*(--[\w-]+)/);
      if (!tokenMatch) continue;

      const tokenName = tokenMatch[1];
      if (
        options.tokenPrefix == null ||
        !tokenName.startsWith(options.tokenPrefix)
      )
        continue;

      const mechanism = 'important' as const;
      mechanismCounts[mechanism] = (mechanismCounts[mechanism] ?? 0) + 1;

      overrideItems.push({
        file: relPath,
        line: entry.line,
        token: entry.property,
        newValue: entry.value,
        mechanism,
        ...(options.tokenDataset && {
          classification: 'important-override' as const,
        }),
      });

      if (options.tokenDataset) {
        classificationCounts['important-override'] =
          (classificationCounts['important-override'] ?? 0) + 1;
      }
    }
  }

  return {
    items: overrideItems,
    byMechanism: mechanismCounts,
    ...(Object.keys(classificationCounts).length > 0 && {
      byClassification: classificationCounts,
    }),
  };
}
