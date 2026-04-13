import * as path from 'node:path';

import { parseScssValues } from '@push-based/styles-ast-utils';

import type { TokenDataset } from '../../shared/utils/token-dataset.js';
import { detectMechanism, classifyOverride } from './override-classifier.js';
import { detectViewEncapsulationNone } from './encapsulation-detector.js';
import type { OverrideItem, OverridesResult } from '../models/types.js';

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

export interface OverridesModeOptions {
  tokenDataset: TokenDataset | null;
  componentPrefix: string;
  semanticPrefix: string | null;
  cwd: string;
  workspaceRoot: string;
}

// ---------------------------------------------------------------------------
// Main pipeline
// ---------------------------------------------------------------------------

/**
 * Runs the **overrides** mode pipeline.
 *
 * For every style file:
 * 1. Detect `ViewEncapsulation.None` components.
 * 2. Parse with `parseScssValues` to get classified entries.
 * 3. Iterate declarations (token overrides) and consumptions (`!important`).
 * 4. Detect the override mechanism for each entry.
 * 5. Optionally classify the override when `tokenDataset` is available.
 *
 * When `tokenDataset` is unavailable (zero-config mode), `classification`
 * and `originalValue` are omitted from the output.
 */
export async function runOverridesMode(
  styleFiles: string[],
  options: OverridesModeOptions,
): Promise<OverridesResult> {
  const items: OverrideItem[] = [];
  const mechanismCounts: Record<string, number> = {};
  const classificationCounts: Record<string, number> = {};

  // Detect ViewEncapsulation.None components
  const encapsulationNoneFiles = await detectViewEncapsulationNone(styleFiles);

  for (const filePath of styleFiles) {
    const parsed = await parseScssValues(filePath, {
      componentTokenPrefix: options.componentPrefix,
    });
    const declarations = parsed.getDeclarations();
    const relPath = path.relative(options.cwd, filePath);

    // Check if this file's component has ViewEncapsulation.None
    const isEncapsulationNone = encapsulationNoneFiles.has(filePath);

    // --- Token declarations = overrides in consumer files ---
    for (const entry of declarations) {
      const mechanism = detectMechanism(entry, isEncapsulationNone);
      mechanismCounts[mechanism] = (mechanismCounts[mechanism] ?? 0) + 1;

      const item: OverrideItem = {
        file: relPath,
        line: entry.line,
        token: entry.property,
        newValue: entry.value,
        mechanism,
      };

      // Add originalValue and classification when token dataset is available
      if (options.tokenDataset) {
        const original = options.tokenDataset.getByName(entry.property);
        if (original) {
          item.originalValue = original.value;
        }
        const classification = classifyOverride(
          entry,
          original,
          isEncapsulationNone,
        );
        item.classification = classification;
        classificationCounts[classification] =
          (classificationCounts[classification] ?? 0) + 1;
      }

      items.push(item);
    }

    // --- Consumptions with !important ---
    const consumptions = parsed.getConsumptions();
    for (const entry of consumptions) {
      if (entry.value.includes('!important')) {
        const mechanism = 'important' as const;
        mechanismCounts[mechanism] = (mechanismCounts[mechanism] ?? 0) + 1;

        items.push({
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
  }

  return {
    items,
    byMechanism: mechanismCounts,
    ...(Object.keys(classificationCounts).length > 0 && {
      byClassification: classificationCounts,
    }),
  };
}
