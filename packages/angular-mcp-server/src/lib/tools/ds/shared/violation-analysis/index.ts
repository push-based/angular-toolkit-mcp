/**
 * Shared violation analysis utilities
 *
 * This module provides shared functionality for analyzing design system violations
 * across different reporting formats (file and folder-based).
 */

// Core analysis
export { analyzeViolationsBase } from './base-analyzer.js';

// Coverage analysis
export {
  analyzeProjectCoverage,
  validateReportInput,
  executeCoveragePlugin,
  extractComponentName,
  formatCoverageResult,
} from './coverage-analyzer.js';

// Formatting utilities
export {
  filterFailedAudits,
  createNoViolationsContent,
  extractIssuesFromAudits,
  hasViolations,
  normalizeFilePath,
  normalizeMessage,
  groupIssuesByFile,
  extractUniqueFilePaths,
  clearPathCache,
  formatViolations,
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
