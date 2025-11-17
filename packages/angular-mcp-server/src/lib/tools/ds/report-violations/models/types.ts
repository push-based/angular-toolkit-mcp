// JSON output types
export interface ViolationEntry {
  file: string;
  lines: number[];
  violation: string;
  replacement: string;
}

export interface ComponentViolationReport {
  component: string;
  violations: ViolationEntry[];
}

export interface AllViolationsReport {
  components: ComponentViolationReport[];
}

// File-grouped output types
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
}
