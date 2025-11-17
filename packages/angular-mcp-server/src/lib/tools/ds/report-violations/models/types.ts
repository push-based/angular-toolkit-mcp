// Types for report-violations (single component, no replacement field needed)
export interface ViolationEntry {
  file: string;
  lines: number[];
  violation: string;
}

export interface ComponentViolationReport {
  component: string;
  violations: ViolationEntry[];
}

// Types for report-all-violations (multiple components, replacement field needed)
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
}

// File-grouped output types for report-all-violations
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
