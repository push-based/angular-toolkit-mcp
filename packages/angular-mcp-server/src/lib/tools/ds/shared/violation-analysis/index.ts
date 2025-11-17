/**
 * Shared violation analysis utilities
 *
 * This module provides shared functionality for analyzing design system violations
 * across different reporting formats.
 */

// Core analysis
export { analyzeViolationsBase } from './base-analyzer.js';

// Coverage analysis
export {
  analyzeProjectCoverage,
  extractComponentName,
} from './coverage-analyzer.js';

// Formatting utilities
export {
  filterFailedAudits,
  normalizeFilePath,
  groupIssuesByFile,
} from './formatters.js';

// Types
export type {
  BaseViolationOptions,
  BaseViolationResult,
  BaseViolationAudit,
  BaseViolationIssue,
  ReportCoverageParams,
  DsComponent,
  FormattedCoverageResult,
  FileGroup,
  FileGroups,
  PathCache,
} from './types.js';
