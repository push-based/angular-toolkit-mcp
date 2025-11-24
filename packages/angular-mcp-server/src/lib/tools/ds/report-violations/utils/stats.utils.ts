import type { ViolationEntry, AllViolationsComponentReport, FileViolationReport } from '../models/types.js';

export interface ViolationStats {
  components: number;
  files: number;
  lines: number;
}

/**
 * Calculate statistics for single component violations
 */
export function calculateSingleComponentStats(
  violations: ViolationEntry[],
): ViolationStats {
  const uniqueFiles = new Set(violations.map(v => v.file)).size;
  const totalLines = violations.reduce((sum, v) => sum + v.lines.length, 0);
  
  return {
    components: 1,
    files: uniqueFiles,
    lines: totalLines,
  };
}

/**
 * Calculate statistics for component-grouped violations
 */
export function calculateComponentGroupedStats(
  components: AllViolationsComponentReport[],
): ViolationStats {
  const uniqueComponents = components.length;
  const uniqueFiles = new Set(
    components.flatMap(c => c.violations.map(v => v.file))
  ).size;
  const totalLines = components.reduce(
    (sum, c) => sum + c.violations.reduce((s, v) => s + v.lines.length, 0),
    0
  );
  
  return {
    components: uniqueComponents,
    files: uniqueFiles,
    lines: totalLines,
  };
}

/**
 * Calculate statistics for file-grouped violations
 */
export function calculateFileGroupedStats(
  files: FileViolationReport[],
): ViolationStats {
  const uniqueComponents = new Set(
    files.flatMap(f => f.components.map(c => c.component))
  ).size;
  const uniqueFiles = files.length;
  const totalLines = files.reduce(
    (sum, f) => sum + f.components.reduce((s, c) => s + c.lines.length, 0),
    0
  );
  
  return {
    components: uniqueComponents,
    files: uniqueFiles,
    lines: totalLines,
  };
}
