import {
  BaseViolationOptions,
  BaseViolationResult,
  BaseViolationIssue,
  BaseViolationAudit,
} from '../../shared/violation-analysis/types.js';

export interface ReportViolationsOptions extends BaseViolationOptions {
  groupBy?: 'file' | 'folder';
}

export type ViolationResult = BaseViolationResult;
export type ViolationIssue = BaseViolationIssue;
export type ViolationAudit = BaseViolationAudit;

// File-specific types (when groupBy: 'file')
export interface FileViolation {
  fileName: string;
  message: string;
  lines: number[];
}

export interface FileViolationGroup {
  message: string;
  lines: number[];
}

export interface FileViolationGroups {
  [fileName: string]: FileViolationGroup;
}

// Folder-specific types (when groupBy: 'folder')
export interface FolderViolationSummary {
  violations: number;
  files: string[];
}

export interface FolderViolationGroups {
  [folderPath: string]: FolderViolationSummary;
}
