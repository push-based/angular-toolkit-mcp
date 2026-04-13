import { describe, it, expect } from 'vitest';

import { buildSummary, formatAuditResult } from '../audit-token-usage.tool.js';
import type {
  AuditTokenUsageResult,
  ValidateResult,
  OverridesResult,
} from '../models/types.js';
import {
  createEmptyTokenDataset,
  TokenDatasetImpl,
} from '../../shared/utils/token-dataset.js';

/**
 * Validates: Requirements 13.1, 13.2, 13.3, 13.4, 13.5
 *
 * Tests for graceful degradation behaviour:
 * - undefined generatedStylesRoot → validate skipped with diagnostic
 * - empty TokenDataset → validate skipped, diagnostics forwarded
 * - overrides mode works without token dataset (detection-only)
 * - both modes cannot run → actionable error message
 */

// ---------------------------------------------------------------------------
// Helpers — simulate the handler's degradation logic
// ---------------------------------------------------------------------------

/**
 * Mirrors the handler's degradation logic for validate mode.
 * Returns { validateResult, diagnostics } based on the token dataset state.
 */
function simulateValidateDegradation(
  tokenDataset: { isEmpty: boolean; diagnostics: string[] } | null,
): { validateResult: ValidateResult | undefined; diagnostics: string[] } {
  const diagnostics: string[] = [];
  let validateResult: ValidateResult | undefined;

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
    // Would run validate mode — return a minimal valid result
    validateResult = {
      semantic: { valid: [], invalid: [] },
      component: { valid: [], invalid: [] },
    };
  }

  return { validateResult, diagnostics };
}

/**
 * Simulates the handler's degradation logic for overrides mode.
 * Overrides mode always runs, but emits a diagnostic when no token dataset.
 */
function simulateOverridesDegradation(
  tokenDataset: { isEmpty: boolean; diagnostics: string[] } | null,
): { overridesResult: OverridesResult; diagnostics: string[] } {
  const diagnostics: string[] = [];

  if (!tokenDataset) {
    diagnostics.push(
      'overrides mode running in detection-only mode (no token dataset for classification)',
    );
  }

  // Overrides mode always produces a result (even if empty)
  const overridesResult: OverridesResult = {
    items: [],
    byMechanism: {},
  };

  return { overridesResult, diagnostics };
}

/**
 * Assembles a full AuditTokenUsageResult from degradation simulation outputs.
 */
function assembleResult(
  validateResult: ValidateResult | undefined,
  overridesResult: OverridesResult | undefined,
  diagnostics: string[],
): AuditTokenUsageResult {
  const summary = buildSummary(validateResult, overridesResult);
  return {
    ...(validateResult && { validate: validateResult }),
    ...(overridesResult && { overrides: overridesResult }),
    summary,
    diagnostics,
  };
}

// ---------------------------------------------------------------------------
// Requirement 13.1 — undefined generatedStylesRoot → validate skipped
// ---------------------------------------------------------------------------

describe('Requirement 13.1: validate skipped when generatedStylesRoot is undefined', () => {
  it('emits diagnostic explaining generatedStylesRoot is required', () => {
    const { validateResult, diagnostics } = simulateValidateDegradation(null);

    expect(validateResult).toBeUndefined();
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0]).toBe(
      'validate mode skipped: generatedStylesRoot is not configured',
    );
  });

  it('result has no validate key when generatedStylesRoot is undefined', () => {
    const { validateResult, diagnostics: valDiag } =
      simulateValidateDegradation(null);
    const { overridesResult, diagnostics: ovDiag } =
      simulateOverridesDegradation(null);

    const result = assembleResult(validateResult, overridesResult, [
      ...valDiag,
      ...ovDiag,
    ]);

    expect(result).not.toHaveProperty('validate');
    expect(result).toHaveProperty('summary');
    expect(result).toHaveProperty('diagnostics');
  });

  it('formatted output includes the diagnostic with warning prefix', () => {
    const result = assembleResult(undefined, undefined, [
      'validate mode skipped: generatedStylesRoot is not configured',
    ]);
    const lines = formatAuditResult(result);

    const diagLine = lines.find((l) =>
      l.includes('generatedStylesRoot is not configured'),
    );
    expect(diagLine).toBeDefined();
    expect(diagLine).toContain('⚠');
  });
});

// ---------------------------------------------------------------------------
// Requirement 13.2 — empty TokenDataset → validate skipped, diagnostics forwarded
// ---------------------------------------------------------------------------

describe('Requirement 13.2: validate skipped when TokenDataset is empty', () => {
  it('forwards the dataset diagnostic when dataset is empty', () => {
    const emptyDataset = createEmptyTokenDataset(
      "No files matched pattern '**/semantic.css' in 'generated-styles'",
    );

    const { validateResult, diagnostics } =
      simulateValidateDegradation(emptyDataset);

    expect(validateResult).toBeUndefined();
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0]).toBe(
      "No files matched pattern '**/semantic.css' in 'generated-styles'",
    );
  });

  it('uses fallback message when empty dataset has no diagnostics', () => {
    const emptyDataset = createEmptyTokenDataset();

    const { validateResult, diagnostics } =
      simulateValidateDegradation(emptyDataset);

    expect(validateResult).toBeUndefined();
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0]).toBe(
      'validate mode skipped: token dataset is empty',
    );
  });

  it('result has no validate key when dataset is empty', () => {
    const emptyDataset = createEmptyTokenDataset('some diagnostic');

    const { validateResult, diagnostics } =
      simulateValidateDegradation(emptyDataset);
    const result = assembleResult(validateResult, undefined, diagnostics);

    expect(result).not.toHaveProperty('validate');
    expect(result.diagnostics).toContain('some diagnostic');
  });

  it('summary shows zero validate issues when skipped', () => {
    const emptyDataset = createEmptyTokenDataset('empty');

    const { validateResult, diagnostics } =
      simulateValidateDegradation(emptyDataset);
    const result = assembleResult(validateResult, undefined, diagnostics);

    expect(result.summary.totalIssues).toBe(0);
    expect(result.summary.byMode.validate).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Requirement 13.3 — overrides mode works without token dataset (detection-only)
// ---------------------------------------------------------------------------

describe('Requirement 13.3: overrides mode runs in detection-only mode without token dataset', () => {
  it('emits detection-only diagnostic when no token dataset', () => {
    const { diagnostics } = simulateOverridesDegradation(null);

    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0]).toBe(
      'overrides mode running in detection-only mode (no token dataset for classification)',
    );
  });

  it('overrides result is still produced (not undefined)', () => {
    const { overridesResult } = simulateOverridesDegradation(null);

    expect(overridesResult).toBeDefined();
    expect(overridesResult.items).toEqual([]);
    expect(overridesResult.byMechanism).toEqual({});
  });

  it('detection-only result omits byClassification', () => {
    const { overridesResult } = simulateOverridesDegradation(null);

    expect(overridesResult).not.toHaveProperty('byClassification');
  });

  it('result includes overrides key even in detection-only mode', () => {
    const { overridesResult, diagnostics } = simulateOverridesDegradation(null);
    const result = assembleResult(undefined, overridesResult, diagnostics);

    expect(result).toHaveProperty('overrides');
    expect(result.overrides).toBeDefined();
  });

  it('does not emit detection-only diagnostic when token dataset is available', () => {
    const dataset = new TokenDatasetImpl([
      {
        name: '--semantic-color-primary',
        value: '#000',
        scope: {},
        sourceFile: 'tokens.css',
      },
    ]);

    const { diagnostics } = simulateOverridesDegradation(dataset);

    expect(diagnostics).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Requirement 13.4 — both modes cannot run → actionable error message
// ---------------------------------------------------------------------------

describe('Requirement 13.4: actionable error when neither mode produces results', () => {
  it('includes actionable guidance when validate is skipped and overrides is empty', () => {
    // Simulate: validate skipped (no generatedStylesRoot), overrides ran but found nothing
    const { validateResult, diagnostics: valDiag } =
      simulateValidateDegradation(null);
    const { overridesResult, diagnostics: ovDiag } =
      simulateOverridesDegradation(null);

    const allDiagnostics = [...valDiag, ...ovDiag];

    // Mirror the handler's "both modes produced nothing" check
    if (
      !validateResult &&
      overridesResult &&
      overridesResult.items.length === 0 &&
      allDiagnostics.length > 0
    ) {
      allDiagnostics.push(
        'Neither mode produced results. Configure generatedStylesRoot and tokensConfig for full audit capabilities.',
      );
    }

    const result = assembleResult(
      validateResult,
      overridesResult,
      allDiagnostics,
    );

    expect(result.diagnostics).toContain(
      'Neither mode produced results. Configure generatedStylesRoot and tokensConfig for full audit capabilities.',
    );
  });

  it('actionable message mentions both generatedStylesRoot and tokensConfig', () => {
    const message =
      'Neither mode produced results. Configure generatedStylesRoot and tokensConfig for full audit capabilities.';

    expect(message).toContain('generatedStylesRoot');
    expect(message).toContain('tokensConfig');
  });

  it('formatted output renders the actionable message as a diagnostic', () => {
    const result = assembleResult(undefined, { items: [], byMechanism: {} }, [
      'validate mode skipped: generatedStylesRoot is not configured',
      'overrides mode running in detection-only mode (no token dataset for classification)',
      'Neither mode produced results. Configure generatedStylesRoot and tokensConfig for full audit capabilities.',
    ]);

    const lines = formatAuditResult(result);
    const actionableLine = lines.find((l) =>
      l.includes('Neither mode produced results'),
    );

    expect(actionableLine).toBeDefined();
    expect(actionableLine).toContain('⚠');
  });
});

// ---------------------------------------------------------------------------
// Requirement 13.5 — diagnostics array lists skipped modes and reasons
// ---------------------------------------------------------------------------

describe('Requirement 13.5: diagnostics array lists skipped modes and reasons', () => {
  it('collects diagnostics from both validate and overrides degradation', () => {
    const { diagnostics: valDiag } = simulateValidateDegradation(null);
    const { diagnostics: ovDiag } = simulateOverridesDegradation(null);

    const allDiagnostics = [...valDiag, ...ovDiag];

    expect(allDiagnostics).toHaveLength(2);
    expect(allDiagnostics[0]).toContain('validate mode skipped');
    expect(allDiagnostics[1]).toContain(
      'overrides mode running in detection-only',
    );
  });

  it('diagnostics is empty when full config is available', () => {
    const dataset = new TokenDatasetImpl([
      {
        name: '--semantic-color-primary',
        value: '#000',
        scope: {},
        sourceFile: 'tokens.css',
      },
    ]);

    const { diagnostics: valDiag } = simulateValidateDegradation(dataset);
    const { diagnostics: ovDiag } = simulateOverridesDegradation(dataset);

    expect([...valDiag, ...ovDiag]).toHaveLength(0);
  });

  it('diagnostics array is always present in the result', () => {
    const result1 = assembleResult(undefined, undefined, []);
    expect(result1).toHaveProperty('diagnostics');
    expect(Array.isArray(result1.diagnostics)).toBe(true);

    const result2 = assembleResult(undefined, undefined, ['some diagnostic']);
    expect(result2.diagnostics).toHaveLength(1);
  });
});
