import { join, basename } from 'node:path';

/**
 * Default output directory for all generated files.
 * Used as the base path for contracts, violations reports, and work groups.
 */
export const DEFAULT_OUTPUT_BASE = 'tmp/.angular-toolkit-mcp';

/**
 * Subdirectory paths relative to DEFAULT_OUTPUT_BASE
 */
export const OUTPUT_SUBDIRS = {
  CONTRACTS: 'contracts',
  CONTRACT_DIFFS: 'contracts/diffs',
  VIOLATIONS_REPORT: 'violations-report',
  VIOLATION_GROUPS: 'violation-groups',
} as const;

export function resolveDefaultSaveLocation(
  saveLocation: string | undefined,
  subdir: string,
  sourceFile: string,
  suffix: string,
  stripExtension = '.ts',
): string {
  if (saveLocation) {
    return saveLocation;
  }
  return join(
    DEFAULT_OUTPUT_BASE,
    subdir,
    `${basename(sourceFile, stripExtension)}${suffix}`,
  );
}
