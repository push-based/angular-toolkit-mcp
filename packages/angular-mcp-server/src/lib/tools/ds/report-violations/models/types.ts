import type { BaseHandlerOptions } from '../../shared/utils/handler-helpers.js';

// ============================================================================
// report-violations types
// ============================================================================

export interface ReportViolationsOptions extends BaseHandlerOptions {
  directory: string;
  componentName: string;
  groupBy?: 'file' | 'folder';
  saveAsFile?: boolean;
}

export interface ViolationEntry {
  file: string;
  lines: number[];
  violation: string;
}

export interface ComponentViolationReport {
  component: string;
  violations: ViolationEntry[];
  rootPath: string;
}

export interface ViolationFileOutput {
  message: string;
  filePath: string;
  stats?: {
    components: number;
    files: number;
    lines: number;
  };
}

export type ReportViolationsResult =
  | ComponentViolationReport
  | ViolationFileOutput;

// ============================================================================
// report-all-violations types
// ============================================================================

export interface ReportAllViolationsOptions extends BaseHandlerOptions {
  directory: string;
  groupBy?: 'component' | 'file';
  saveAsFile?: boolean;
}

export interface AllViolationsEntry {
  file: string;
  lines: number[];
  violation: string;
  replacement: string;
}

export interface AllViolationsComponentReport {
  component: string;
  violations: AllViolationsEntry[];
}

export interface AllViolationsReport {
  components: AllViolationsComponentReport[];
  rootPath: string;
}

export interface ComponentViolationInFile {
  component: string;
  lines: number[];
  violation: string;
  replacement: string;
}

export interface FileViolationReport {
  file: string;
  components: ComponentViolationInFile[];
}

export interface AllViolationsReportByFile {
  files: FileViolationReport[];
  rootPath: string;
}

export interface ProcessedViolation {
  component: string;
  fileName: string;
  lines: number[];
  violation: string;
  replacement: string;
}

export type ReportAllViolationsResult =
  | AllViolationsReport
  | AllViolationsReportByFile
  | ViolationFileOutput;

// ============================================================================
// group-violations types
// ============================================================================

export interface GroupViolationsOptions extends BaseHandlerOptions {
  fileName: string;
  minGroups?: number;
  maxGroups?: number;
  variance?: number;
}

export interface GroupViolationsReport {
  metadata: {
    generatedAt: string;
    inputFile: string;
    rootPath: string;
    totalFiles: number;
    totalViolations: number;
    groupCount: number;
    targetPerGroup: number;
    acceptableRange: { min: number; max: number };
    variance: number;
  };
  groups: Array<{
    id: number;
    name: string;
    rootPath: string;
    directories: string[];
    files: Array<{
      file: string;
      violations: number;
      components: FileViolationReport['components'];
    }>;
    statistics: {
      fileCount: number;
      violationCount: number;
    };
    componentDistribution: Record<string, number>;
  }>;
  validation: {
    totalViolations: number;
    totalFiles: number;
    uniqueFiles: number;
    pathExclusivity: boolean;
    balanced: boolean;
  };
}

export type GroupViolationsResult = GroupViolationsReport & {
  outputDir: string;
};
