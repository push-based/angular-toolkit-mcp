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
 * 2. `::ng-deep` in selector
 * 3. `:root[data-theme` in selector
 * 4. `:host` in selector
 * 5. Class selector (`.className`) in selector
 * 6. Fallback: `unknown` (bare element selectors, `:root` without data-theme, etc.)
 */
export function detectMechanism(entry: ScssPropertyEntry): OverrideMechanism {
  const selector = entry.selector;
  if (entry.important) return 'important';
  if (selector.includes('::ng-deep')) return 'ng-deep';
  if (selector.includes(':root[data-theme')) return 'root-theme';
  if (selector.includes(':host')) return 'host';
  // Class selector: has a dot-prefixed class but not :host or ::ng-deep
  if (/\.\w/.test(selector)) return 'class-selector';
  return 'unknown';
}

// ---------------------------------------------------------------------------
// Override classification
// ---------------------------------------------------------------------------

/**
 * Classifies a token override by intent.
 *
 * Classification priority:
 * 1. `important-override` — value contains `!important`
 * 2. `deep-override` — selector uses `::ng-deep`
 * 3. `legitimate` — original token has a theme scope, or selector is `:root[data-theme`
 * 4. `component-override` — selector uses `:host`
 * 5. `inline-override` — selector uses a class selector
 * 6. `scope-violation` — fallback for unrecognised patterns
 */
export function classifyOverride(
  entry: ScssPropertyEntry,
  originalToken: TokenEntry | undefined,
): OverrideClassification {
  if (entry.important) return 'important-override';
  if (entry.selector.includes('::ng-deep')) return 'deep-override';

  // Legitimate: override in a theme file (scope has theme key)
  if (originalToken?.scope?.theme) return 'legitimate';

  if (entry.selector.includes(':root[data-theme')) return 'legitimate';
  if (entry.selector.includes(':host')) return 'component-override';
  if (/\.\w/.test(entry.selector)) return 'inline-override';

  return 'scope-violation';
}
