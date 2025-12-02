import type { FileViolationReport } from '../models/types.js';

export interface ViolationStats {
  components: number;
  files: number;
  lines: number;
}

export interface EnrichedFile extends FileViolationReport {
  violations: number;
  directory: string;
  subdirectory: string;
}

export interface DirectorySummary {
  directory: string;
  files: EnrichedFile[];
  fileCount: number;
  violations: number;
}

export interface WorkGroup {
  id: number;
  name: string;
  directories: string[];
  files: EnrichedFile[];
  violations: number;
  componentDistribution: Record<string, number>;
}

export interface ReportGroup {
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
}

export interface GroupForMarkdown {
  name: string;
  statistics: {
    fileCount: number;
    violationCount: number;
  };
  componentDistribution: Record<string, number>;
  files: Array<{
    file: string;
    violations: number;
    components: FileViolationReport['components'];
  }>;
}
