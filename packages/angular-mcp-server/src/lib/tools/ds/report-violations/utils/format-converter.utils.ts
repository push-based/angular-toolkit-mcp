import type {
  AllViolationsReport,
  AllViolationsReportByFile,
  FileViolationReport,
} from '../models/types.js';

/**
 * Detect the format of the violations report
 */
export function detectReportFormat(
  data: any,
): 'file' | 'component' | 'unknown' {
  if (data.files && Array.isArray(data.files)) {
    return 'file';
  }
  if (data.components && Array.isArray(data.components)) {
    return 'component';
  }
  return 'unknown';
}

/**
 * Convert component-grouped report to file-grouped format
 */
export function convertComponentToFileFormat(
  report: AllViolationsReport,
): AllViolationsReportByFile {
  const fileMap = new Map<string, FileViolationReport['components']>();

  report.components.forEach((componentReport) => {
    componentReport.violations.forEach((violation) => {
      if (!fileMap.has(violation.file)) {
        fileMap.set(violation.file, []);
      }

      fileMap.get(violation.file)!.push({
        component: componentReport.component,
        lines: violation.lines,
        violation: violation.violation,
        replacement: violation.replacement,
      });
    });
  });

  const files: FileViolationReport[] = Array.from(
    fileMap.entries(),
    ([file, components]) => ({ file, components }),
  ).sort((a, b) => a.file.localeCompare(b.file));

  return { files };
}
