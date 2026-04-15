import { join } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';

import { globToRegex } from '@push-based/utils';

import {
  createHandler,
  type HandlerContext,
} from '../shared/utils/handler-helpers.js';
import { resolveCrossPlatformPath } from '../shared/utils/cross-platform-path.js';
import { DEFAULT_OUTPUT_BASE } from '../shared/constants.js';
import { loadTokenDataset } from '../shared/utils/token-dataset-loader.js';
import type { TokenDataset } from '../shared/utils/token-dataset.js';
import { findStyleFiles } from '../project/utils/styles-report-helpers.js';

import { auditTokenUsageSchema } from './models/schema.js';
import type {
  AuditMode,
  AuditTokenUsageOptions,
  AuditTokenUsageResult,
  AuditSummary,
  ValidateResult,
  OverridesResult,
} from './models/types.js';
import { runValidateMode } from './utils/validate-mode.js';
import { runOverridesMode } from './utils/overrides-mode.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const AUDIT_OUTPUT_SUBDIR = 'audit-token-usage';

// ---------------------------------------------------------------------------
// Exported helpers
// ---------------------------------------------------------------------------

/**
 * Derives all distinct token prefixes from the dataset.
 * Extracts the leading `--segment-` from every token name and deduplicates.
 *
 * Example: dataset with `--semantic-color-primary` and `--ds-button-color-bg`
 * returns `['--semantic-', '--ds-']`.
 *
 * Falls back to `['--semantic-']` if the dataset is empty or no names match.
 */
export function deriveTokenPrefixes(dataset: TokenDataset): string[] {
  const prefixes = new Set<string>();
  for (const token of dataset.tokens) {
    const match = token.name.match(/^(--[\w]+-)/);
    if (match) prefixes.add(match[1]);
  }
  return prefixes.size > 0 ? [...prefixes] : ['--semantic-'];
}

/**
 * Resolves the active audit modes from the user-provided `modes` parameter.
 * Default (`undefined` or `'all'`) → both modes.
 */
export function resolveActiveModes(
  modes: AuditTokenUsageOptions['modes'],
): AuditMode[] {
  if (!modes || modes === 'all') {
    return ['validate', 'overrides'];
  }
  return modes;
}

/**
 * Builds the `AuditSummary` from optional validate / overrides results.
 */
export function buildSummary(
  validateResult: ValidateResult | undefined,
  overridesResult: OverridesResult | undefined,
): AuditSummary {
  const validateIssues = validateResult
    ? validateResult.semantic.invalid.length
    : 0;
  const overridesIssues = overridesResult ? overridesResult.items.length : 0;

  const byMode: AuditSummary['byMode'] = {};
  if (validateResult !== undefined) byMode.validate = validateIssues;
  if (overridesResult !== undefined) byMode.overrides = overridesIssues;

  return {
    totalIssues: validateIssues + overridesIssues,
    byMode,
  };
}

// ---------------------------------------------------------------------------
// Exclude-pattern filtering
// ---------------------------------------------------------------------------

function applyExcludePatterns(
  files: string[],
  patterns: string | string[] | undefined,
): string[] {
  if (!patterns) return files;
  const normalized = Array.isArray(patterns) ? patterns : [patterns];
  if (normalized.length === 0) return files;
  const regexes = normalized.map((p) => globToRegex(p.replace(/\\/g, '/')));
  return files.filter(
    (f) => !regexes.some((re) => re.test(f.replace(/\\/g, '/'))),
  );
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

function generateFilename(directory: string): string {
  const sanitised = directory
    .replace(/^\.?[/\\]+/, '') // strip leading ./ or /
    .replace(/[/\\]/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${sanitised}-audit.json`;
}

async function persistResult(
  result: AuditTokenUsageResult,
  directory: string,
  cwd: string,
): Promise<void> {
  const outputDir = join(cwd, DEFAULT_OUTPUT_BASE, AUDIT_OUTPUT_SUBDIR);
  const filename = generateFilename(directory);
  const filePath = join(outputDir, filename);
  await mkdir(outputDir, { recursive: true });
  await writeFile(filePath, JSON.stringify(result, null, 2), 'utf-8');
}

// ---------------------------------------------------------------------------
// Format result (pretty-printer)
// ---------------------------------------------------------------------------

/**
 * Formats the audit result into human-readable `string[]` lines.
 */
export function formatAuditResult(result: AuditTokenUsageResult): string[] {
  const lines: string[] = [];
  const DIVIDER = '────────────────────────────────────────';

  // ── Summary ──
  const parts: string[] = [];
  if (result.summary.byMode.validate !== undefined) {
    parts.push(`${result.summary.byMode.validate} invalid token(s)`);
  }
  if (result.summary.byMode.overrides !== undefined) {
    parts.push(`${result.summary.byMode.overrides} override(s)`);
  }
  lines.push(
    `📊 Audit summary: ${result.summary.totalIssues} issue(s) — ${parts.join(', ')}`,
  );

  // ── Diagnostics ──
  if (result.diagnostics.length > 0) {
    lines.push('');
    lines.push(DIVIDER);
    lines.push('⚠️  Diagnostics');
    lines.push(DIVIDER);
    for (const diag of result.diagnostics) {
      lines.push(`  ⚠ ${diag}`);
    }
  }

  // ── Invalid tokens (validate mode) ──
  if (result.validate) {
    const { semantic } = result.validate;

    if (semantic.invalid.length > 0) {
      lines.push('');
      lines.push(DIVIDER);
      lines.push(`❌ Invalid semantic tokens (${semantic.invalid.length})`);
      lines.push(DIVIDER);
      for (const ref of semantic.invalid) {
        let entry = `  ${ref.token}  ${ref.file}:${ref.line}`;
        if (ref.suggestion) {
          entry += `  → did you mean "${ref.suggestion}"? (distance ${ref.editDistance})`;
        } else {
          entry += `  [not found]`;
        }
        lines.push(entry);
      }
    }

    if (result.validate.brandWarnings?.length) {
      lines.push('');
      lines.push(DIVIDER);
      lines.push(
        `🏷️  Brand-specific warnings (${result.validate.brandWarnings.length})`,
      );
      lines.push(DIVIDER);
      for (const w of result.validate.brandWarnings) {
        lines.push(
          `  ${w.token}  ${w.file}:${w.line}  available in: ${w.availableBrands.join(', ')}`,
        );
      }
    }
  }

  // ── Overrides ──
  if (result.overrides && result.overrides.items.length > 0) {
    lines.push('');
    lines.push(DIVIDER);
    lines.push(`🔧 Token overrides (${result.overrides.items.length})`);
    lines.push(DIVIDER);
    for (const item of result.overrides.items) {
      let entry = `  ${item.token}  ${item.file}:${item.line}  [${item.mechanism}]`;
      if (item.classification) {
        entry += `  (${item.classification})`;
      }
      if (item.newValue) {
        const truncated =
          item.newValue.length > 60
            ? item.newValue.slice(0, 57) + '...'
            : item.newValue;
        entry += `  → ${truncated}`;
      }
      lines.push(entry);
    }

    lines.push('');
    lines.push('  Mechanism breakdown:');
    for (const [mechanism, count] of Object.entries(
      result.overrides.byMechanism,
    )) {
      lines.push(`    ${mechanism}: ${count}`);
    }

    if (result.overrides.byClassification) {
      lines.push('');
      lines.push(`  Classification breakdown:`);
      for (const [classification, count] of Object.entries(
        result.overrides.byClassification,
      )) {
        lines.push(`    ${classification}: ${count}`);
      }
    }
  }

  return lines;
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

async function handleAuditTokenUsage(
  params: AuditTokenUsageOptions,
  context: HandlerContext,
): Promise<AuditTokenUsageResult> {
  // 1. Resolve active modes (default: both)
  const activeModes = resolveActiveModes(params.modes);

  // 2. Discover style files
  const absDir = resolveCrossPlatformPath(context.cwd, params.directory);
  let styleFiles = await findStyleFiles(absDir);
  styleFiles = applyExcludePatterns(styleFiles, params.excludePatterns);

  // 3. Resolve token prefix: explicit param > config > null
  const configuredPrefix =
    params.tokenPrefix ?? context.tokensConfig?.propertyPrefix ?? null;

  // 4. Load token dataset (if generatedStylesRoot available)
  const tokenDataset =
    context.generatedStylesRoot && context.tokensConfig
      ? await loadTokenDataset({
          generatedStylesRoot: context.generatedStylesRoot,
          workspaceRoot: context.workspaceRoot,
          tokens: context.tokensConfig,
        })
      : null;

  const diagnostics: string[] = [];
  let validateResult: ValidateResult | undefined;
  let overridesResult: OverridesResult | undefined;

  // Resolve tokenPrefixes for validate mode: explicit config takes priority,
  // otherwise derive all distinct prefixes from the dataset (e.g. ['--semantic-', '--ds-']).
  const tokenPrefixes: string[] | null =
    configuredPrefix != null
      ? [configuredPrefix]
      : tokenDataset && !tokenDataset.isEmpty
        ? deriveTokenPrefixes(tokenDataset)
        : null;

  // Single-prefix string for overrides mode (dataset-based lookup handles multi-prefix there).
  const tokenPrefix = configuredPrefix;

  // 5. Run validate mode
  if (activeModes.includes('validate')) {
    if (!tokenDataset) {
      diagnostics.push(
        'validate mode skipped: generatedStylesRoot is not configured',
      );
    } else if (tokenDataset.isEmpty) {
      diagnostics.push(
        tokenDataset.diagnostics[0] ??
          'validate mode skipped: token dataset is empty',
      );
    } else {
      validateResult = await runValidateMode(styleFiles, tokenDataset, {
        tokenPrefixes,
        brandName: params.brandName,
        componentName: params.componentName,
        cwd: context.cwd,
      });
    }
  }

  // 6. Run overrides mode
  if (activeModes.includes('overrides')) {
    if (!tokenDataset) {
      diagnostics.push(
        'overrides mode running in detection-only mode (no token dataset for classification)',
      );
    }
    overridesResult = await runOverridesMode(styleFiles, {
      tokenDataset,
      tokenPrefix,
      cwd: context.cwd,
    });
  }

  // 7. Check if all active modes were effectively skipped or empty
  const validateSkippedOrEmpty =
    !activeModes.includes('validate') || !validateResult;
  const overridesSkippedOrEmpty =
    !activeModes.includes('overrides') ||
    !overridesResult ||
    overridesResult.items.length === 0;

  if (
    validateSkippedOrEmpty &&
    overridesSkippedOrEmpty &&
    diagnostics.length > 0
  ) {
    diagnostics.push(
      'Neither mode produced results. Configure generatedStylesRoot and tokensConfig for full audit capabilities.',
    );
  }

  // 8. Build summary and assemble result
  const summary = buildSummary(validateResult, overridesResult);

  const result: AuditTokenUsageResult = {
    ...(validateResult && { validate: validateResult }),
    ...(overridesResult && { overrides: overridesResult }),
    summary,
    diagnostics,
  };

  // 9. Persist if requested
  if (params.saveAsFile) {
    await persistResult(result, params.directory, context.cwd);
  }

  return result;
}

// ---------------------------------------------------------------------------
// Tool wiring
// ---------------------------------------------------------------------------

export const auditTokenUsageHandler = createHandler<
  AuditTokenUsageOptions,
  AuditTokenUsageResult
>(auditTokenUsageSchema.name, handleAuditTokenUsage, formatAuditResult);

export const auditTokenUsageTools = [
  { schema: auditTokenUsageSchema, handler: auditTokenUsageHandler },
];
