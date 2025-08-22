import { SourceFileLocation } from '@code-pushup/models';

export interface DependencyInfo {
  path: string;
  type: DependencyInfoType;
  resolved: boolean;
  resolvedPath?: string;
  componentName?: string;
  sourceFile?: string;
  source?: SourceFileLocation;
}

export interface FileInfo {
  type: string;
  size: number;
  dependencies: DependencyInfo[];
  lastModified: number;
  componentName?: string;
  isAngularComponent?: boolean;
  source?: string; // Optional - not stored in optimized version to save memory
}

export type ComponentUsageGraphResult = Record<string, FileInfo>;

export interface BuildComponentUsageGraphOptions {
  cwd: string;
  directory: string;
  workspaceRoot?: string;
}

export interface ComponentMetadata {
  className: string;
}

export interface ComponentGroup {
  componentFile?: [string, FileInfo];
  relatedFiles: [string, FileInfo][];
  hasReverseDeps: boolean;
}

export type DependencyInfoType =
  | 'import'
  | 'require'
  | 'dynamic-import'
  | 'css-import'
  | 'asset'
  | 'external'
  | 'reverse-dependency';

export type FileExtension =
  | '.ts'
  | '.js'
  | '.jsx'
  | '.tsx'
  | '.css'
  | '.scss'
  | '.sass'
  | '.less'
  | '.html';

export type FileType =
  | 'typescript'
  | 'typescript-react'
  | 'javascript'
  | 'javascript-react'
  | 'css'
  | 'scss'
  | 'sass'
  | 'less'
  | 'template';

// Legacy aliases for backward compatibility
export type DependencyGraphResult = ComponentUsageGraphResult;
export type BuildDependencyGraphOptions = BuildComponentUsageGraphOptions;
