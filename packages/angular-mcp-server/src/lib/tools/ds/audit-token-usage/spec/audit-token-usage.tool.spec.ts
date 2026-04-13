import { describe, it, expect } from 'vitest';

import {
  resolveActiveModes,
  buildSummary,
  formatAuditResult,
} from '../audit-token-usage.tool.js';
import type {
  AuditMode,
  AuditTokenUsageResult,
  ValidateResult,
  OverridesResult,
} from '../models/types.js';

/**
 * Validates: Requirements 11.1, 11.4
 *
 * Tests for output correctness properties:
 * - Property 6 — Output structure: result contains keys for active modes only, plus summary and diagnostics always present
 * - Property 7 — Summary counts: summary.totalIssues equals sum of invalid tokens + override items, and byMode breakdown matches
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeValidateResult(
  semanticInvalidCount: number,
  componentInvalidCount: number,
): ValidateResult {
  return {
    semantic: {
      valid: [],
      invalid: Array.from({ length: semanticInvalidCount }, (_, i) => ({
        token: `--semantic-invalid-${i}`,
        file: `file-${i}.scss`,
        line: i + 1,
      })),
    },
    component: {
      valid: [],
      invalid: Array.from({ length: componentInvalidCount }, (_, i) => ({
        token: `--ds-invalid-${i}`,
        file: `file-${i}.scss`,
        line: i + 1,
      })),
    },
  };
}

function makeOverridesResult(itemCount: number): OverridesResult {
  return {
    items: Array.from({ length: itemCount }, (_, i) => ({
      file: `override-${i}.scss`,
      line: i + 1,
      token: `--ds-override-${i}`,
      newValue: 'red',
      mechanism: 'host' as const,
    })),
    byMechanism: itemCount > 0 ? { host: itemCount } : {},
  };
}

function assembleResult(
  activeModes: AuditMode[],
  validateResult?: ValidateResult,
  overridesResult?: OverridesResult,
  diagnostics: string[] = [],
): AuditTokenUsageResult {
  const summary = buildSummary(validateResult, overridesResult);
  return {
    ...(activeModes.includes('validate') &&
      validateResult && { validate: validateResult }),
    ...(activeModes.includes('overrides') &&
      overridesResult && { overrides: overridesResult }),
    summary,
    diagnostics,
  };
}

// ---------------------------------------------------------------------------
// resolveActiveModes
// ---------------------------------------------------------------------------

describe('resolveActiveModes', () => {
  it('returns both modes for undefined input', () => {
    expect(resolveActiveModes(undefined)).toEqual(['validate', 'overrides']);
  });

  it('returns both modes for "all" input', () => {
    expect(resolveActiveModes('all')).toEqual(['validate', 'overrides']);
  });

  it('returns only validate when given ["validate"]', () => {
    expect(resolveActiveModes(['validate'])).toEqual(['validate']);
  });

  it('returns only overrides when given ["overrides"]', () => {
    expect(resolveActiveModes(['overrides'])).toEqual(['overrides']);
  });

  it('returns both modes when given ["validate", "overrides"]', () => {
    expect(resolveActiveModes(['validate', 'overrides'])).toEqual([
      'validate',
      'overrides',
    ]);
  });
});

// ---------------------------------------------------------------------------
// Property 6 — Output structure matches active modes
// ---------------------------------------------------------------------------

describe('Property 6: Output structure matches active modes', () => {
  /**
   * For any combination of active modes, the AuditTokenUsageResult must
   * contain a key for each active mode and must not contain a key for
   * inactive modes. The summary and diagnostics keys must always be present.
   * **Validates: Requirements 11.1**
   */

  it('both modes active: result has validate, overrides, summary, diagnostics', () => {
    const result = assembleResult(
      ['validate', 'overrides'],
      makeValidateResult(1, 0),
      makeOverridesResult(2),
    );

    expect(result).toHaveProperty('validate');
    expect(result).toHaveProperty('overrides');
    expect(result).toHaveProperty('summary');
    expect(result).toHaveProperty('diagnostics');
  });

  it('only validate active: result has validate but not overrides', () => {
    const result = assembleResult(
      ['validate'],
      makeValidateResult(2, 1),
      undefined,
    );

    expect(result).toHaveProperty('validate');
    expect(result).not.toHaveProperty('overrides');
    expect(result).toHaveProperty('summary');
    expect(result).toHaveProperty('diagnostics');
  });

  it('only overrides active: result has overrides but not validate', () => {
    const result = assembleResult(
      ['overrides'],
      undefined,
      makeOverridesResult(3),
    );

    expect(result).not.toHaveProperty('validate');
    expect(result).toHaveProperty('overrides');
    expect(result).toHaveProperty('summary');
    expect(result).toHaveProperty('diagnostics');
  });

  it('summary is always present even with zero issues', () => {
    const result = assembleResult(
      ['validate', 'overrides'],
      makeValidateResult(0, 0),
      makeOverridesResult(0),
    );

    expect(result).toHaveProperty('summary');
    expect(result.summary).toHaveProperty('totalIssues');
    expect(result.summary).toHaveProperty('byMode');
  });

  it('diagnostics is always present and is an array', () => {
    const result = assembleResult(
      ['validate'],
      makeValidateResult(0, 0),
      undefined,
      ['validate mode skipped: token dataset is empty'],
    );

    expect(result).toHaveProperty('diagnostics');
    expect(Array.isArray(result.diagnostics)).toBe(true);
  });

  it('diagnostics is an empty array when no diagnostics exist', () => {
    const result = assembleResult(
      ['validate', 'overrides'],
      makeValidateResult(1, 0),
      makeOverridesResult(1),
    );

    expect(result.diagnostics).toEqual([]);
  });

  it('summary.byMode contains only keys for active modes with results', () => {
    // Only validate active
    const validateOnly = assembleResult(
      ['validate'],
      makeValidateResult(2, 1),
      undefined,
    );
    expect(validateOnly.summary.byMode).toHaveProperty('validate');
    expect(validateOnly.summary.byMode).not.toHaveProperty('overrides');

    // Only overrides active
    const overridesOnly = assembleResult(
      ['overrides'],
      undefined,
      makeOverridesResult(3),
    );
    expect(overridesOnly.summary.byMode).not.toHaveProperty('validate');
    expect(overridesOnly.summary.byMode).toHaveProperty('overrides');

    // Both active
    const both = assembleResult(
      ['validate', 'overrides'],
      makeValidateResult(1, 1),
      makeOverridesResult(2),
    );
    expect(both.summary.byMode).toHaveProperty('validate');
    expect(both.summary.byMode).toHaveProperty('overrides');
  });
});

// ---------------------------------------------------------------------------
// Property 7 — Summary counts match actual issues
// ---------------------------------------------------------------------------

describe('Property 7: Summary counts match actual issues', () => {
  /**
   * summary.totalIssues must equal the sum of validate.semantic.invalid.length +
   * validate.component.invalid.length (when validate is present) plus
   * overrides.items.length (when overrides is present).
   * summary.byMode.validate must equal the count of invalid tokens, and
   * summary.byMode.overrides must equal the count of override items.
   * **Validates: Requirements 11.4**
   */

  it('totalIssues equals invalid tokens + override items (both modes)', () => {
    const validateResult = makeValidateResult(3, 2); // 5 invalid tokens
    const overridesResult = makeOverridesResult(4); // 4 overrides
    const summary = buildSummary(validateResult, overridesResult);

    const expectedValidateIssues =
      validateResult.semantic.invalid.length +
      validateResult.component.invalid.length;
    const expectedOverridesIssues = overridesResult.items.length;

    expect(summary.totalIssues).toBe(
      expectedValidateIssues + expectedOverridesIssues,
    );
    expect(summary.totalIssues).toBe(9);
  });

  it('byMode.validate equals semantic.invalid + component.invalid count', () => {
    const validateResult = makeValidateResult(4, 3); // 7 invalid tokens
    const summary = buildSummary(validateResult, undefined);

    expect(summary.byMode.validate).toBe(
      validateResult.semantic.invalid.length +
        validateResult.component.invalid.length,
    );
    expect(summary.byMode.validate).toBe(7);
  });

  it('byMode.overrides equals overrides.items.length', () => {
    const overridesResult = makeOverridesResult(5);
    const summary = buildSummary(undefined, overridesResult);

    expect(summary.byMode.overrides).toBe(overridesResult.items.length);
    expect(summary.byMode.overrides).toBe(5);
  });

  it('totalIssues is 0 when both modes have zero issues', () => {
    const summary = buildSummary(
      makeValidateResult(0, 0),
      makeOverridesResult(0),
    );

    expect(summary.totalIssues).toBe(0);
    expect(summary.byMode.validate).toBe(0);
    expect(summary.byMode.overrides).toBe(0);
  });

  it('totalIssues counts only validate issues when overrides is undefined', () => {
    const validateResult = makeValidateResult(2, 3);
    const summary = buildSummary(validateResult, undefined);

    expect(summary.totalIssues).toBe(5);
    expect(summary.byMode.validate).toBe(5);
    expect(summary.byMode.overrides).toBeUndefined();
  });

  it('totalIssues counts only overrides issues when validate is undefined', () => {
    const overridesResult = makeOverridesResult(7);
    const summary = buildSummary(undefined, overridesResult);

    expect(summary.totalIssues).toBe(7);
    expect(summary.byMode.validate).toBeUndefined();
    expect(summary.byMode.overrides).toBe(7);
  });

  it('totalIssues is 0 when both results are undefined', () => {
    const summary = buildSummary(undefined, undefined);

    expect(summary.totalIssues).toBe(0);
    expect(summary.byMode.validate).toBeUndefined();
    expect(summary.byMode.overrides).toBeUndefined();
  });

  it('byMode breakdown sums to totalIssues', () => {
    const validateResult = makeValidateResult(6, 2); // 8 invalid
    const overridesResult = makeOverridesResult(3); // 3 overrides
    const summary = buildSummary(validateResult, overridesResult);

    const byModeSum =
      (summary.byMode.validate ?? 0) + (summary.byMode.overrides ?? 0);
    expect(byModeSum).toBe(summary.totalIssues);
  });

  it('handles large counts correctly', () => {
    const validateResult = makeValidateResult(50, 30); // 80 invalid
    const overridesResult = makeOverridesResult(100); // 100 overrides
    const summary = buildSummary(validateResult, overridesResult);

    expect(summary.totalIssues).toBe(180);
    expect(summary.byMode.validate).toBe(80);
    expect(summary.byMode.overrides).toBe(100);
  });
});

// ---------------------------------------------------------------------------
// formatAuditResult — supplementary tests
// ---------------------------------------------------------------------------

describe('formatAuditResult', () => {
  it('includes summary line with total issues', () => {
    const result = assembleResult(
      ['validate', 'overrides'],
      makeValidateResult(2, 1),
      makeOverridesResult(3),
    );
    const lines = formatAuditResult(result);

    expect(lines[0]).toContain('Audit summary:');
    expect(lines[0]).toContain('6 issue(s)');
  });

  it('includes invalid token count in summary line', () => {
    const result = assembleResult(
      ['validate'],
      makeValidateResult(3, 0),
      undefined,
    );
    const lines = formatAuditResult(result);

    expect(lines[0]).toContain('3 invalid token(s)');
  });

  it('includes override count in summary line', () => {
    const result = assembleResult(
      ['overrides'],
      undefined,
      makeOverridesResult(5),
    );
    const lines = formatAuditResult(result);

    expect(lines[0]).toContain('5 override(s)');
  });

  it('includes diagnostics with warning prefix', () => {
    const result = assembleResult(['validate'], undefined, undefined, [
      'validate mode skipped: generatedStylesRoot is not configured',
    ]);
    const lines = formatAuditResult(result);

    const diagLine = lines.find(
      (l) => l.includes('⚠') && l.includes('generatedStylesRoot'),
    );
    expect(diagLine).toBeDefined();
    expect(diagLine).toContain('generatedStylesRoot');
  });

  it('returns array of strings', () => {
    const result = assembleResult(
      ['validate', 'overrides'],
      makeValidateResult(1, 1),
      makeOverridesResult(1),
    );
    const lines = formatAuditResult(result);

    expect(Array.isArray(lines)).toBe(true);
    for (const line of lines) {
      expect(typeof line).toBe('string');
    }
  });
});
