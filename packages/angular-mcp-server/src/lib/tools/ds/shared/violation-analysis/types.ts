/**
 * Shared types for violation analysis across file and folder reporting modules
 */

export interface BaseViolationOptions {
  cwd?: string;
  directory: string;
  componentName: string;
  deprecatedCssClassesPath?: string;
}

export interface BaseViolationIssue {
  message: string;
  source?: {
    file: string;
    position?: {
      startLine: number;
    };
  };
}

export interface BaseViolationAudit {
  details?: {
    issues?: BaseViolationIssue[];
  };
  title: string;
  score: number;
}

export interface BaseViolationResult {
  audits: BaseViolationAudit[];
  [key: string]: unknown;
}

// Coverage analysis types (moved from project/utils/coverage-helpers.ts)
export interface ReportCoverageParams {
  cwd?: string;
  returnRawData?: boolean;
  outputFormat?: 'text';
  directory: string;
  dsComponents: DsComponent[];
}

export interface DsComponent {
  componentName: string;
  deprecatedCssClasses: string[];
}

export interface FormattedCoverageResult {
  textOutput: string;
  rawData?: {
    rawPluginResult: BaseViolationResult;
    pluginOptions: any;
  };
}

// Shared file grouping types (consolidated from different modules)
export interface FileGroup {
  message: string;
  lines: number[];
}

export interface FileGroups {
  [fileName: string]: FileGroup;
}

// Performance-optimized path cache
export interface PathCache {
  [key: string]: string;
}
