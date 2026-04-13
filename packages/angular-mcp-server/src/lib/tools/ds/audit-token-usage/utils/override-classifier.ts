import type { ScssPropertyEntry } from '@push-based/styles-ast-utils';

import type { TokenEntry } from '../../shared/utils/token-dataset.js';
import type {
  OverrideMechanism,
  OverrideClassification,
} from '../models/types.js';

// ---------------------------------------------------------------------------
// Mechanism detection
// ---------------------------------------------------------------------------

/**
 * Determines the CSS mechanism used for a token override.
 *
 * Priority order (first match wins):
 * 1. `!important` in value
 * 2. `ViewEncapsulation.None` on the component
 * 3. `::ng-deep` in selector
 * 4. `:root[data-theme` in selector
 * 5. `:host` in selector
 * 6. Class selector (`.className`) in selector
 * 7. Fallback: `host`
 */
export function detectMechanism(
  entry: ScssPropertyEntry,
  isEncapsulationNone: boolean,
): OverrideMechanism {
  const selector = entry.selector;
  if (entry.value.includes('!important')) return 'important';
  if (isEncapsulationNone) return 'encapsulation-none';
  if (selector.includes('::ng-deep')) return 'ng-deep';
  if (selector.includes(':root[data-theme')) return 'root-theme';
  if (selector.includes(':host')) return 'host';
  // Class selector: has a dot-prefixed class but not :host or ::ng-deep
  if (/\.\w/.test(selector)) return 'class-selector';
  return 'host'; // fallback for :root or bare selectors
}

// ---------------------------------------------------------------------------
// Override classification
// ---------------------------------------------------------------------------

/**
 * Classifies a token override by intent.
 *
 * Classification priority:
 * 1. `encapsulation-none` — component uses `ViewEncapsulation.None`
 * 2. `important-override` — value contains `!important`
 * 3. `deep-override` — selector uses `::ng-deep`
 * 4. `legitimate` — original token has a theme scope, or selector is `:root[data-theme`
 * 5. `component-override` — selector uses `:host`
 * 6. `inline-override` — selector uses a class selector
 * 7. `scope-violation` — fallback for unrecognised patterns
 */
export function classifyOverride(
  entry: ScssPropertyEntry,
  originalToken: TokenEntry | undefined,
  isEncapsulationNone: boolean,
): OverrideClassification {
  if (isEncapsulationNone) return 'encapsulation-none';
  if (entry.value.includes('!important')) return 'important-override';
  if (entry.selector.includes('::ng-deep')) return 'deep-override';

  // Legitimate: override in a theme file (scope has theme key)
  if (originalToken?.scope?.theme) return 'legitimate';

  if (entry.selector.includes(':root[data-theme')) return 'legitimate';
  if (entry.selector.includes(':host')) return 'component-override';
  if (/\.\w/.test(entry.selector)) return 'inline-override';

  return 'scope-violation';
}
