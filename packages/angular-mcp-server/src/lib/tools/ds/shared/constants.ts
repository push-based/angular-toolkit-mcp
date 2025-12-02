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
