import type {
  AllViolationsReport,
  AllViolationsReportByFile,
  ComponentViolationReport,
  FileViolationReport,
} from '../models/types.js';

/**
 * Detect the format of the violations report
 */
export function detectReportFormat(
  data: any,
): 'file' | 'component' | 'single-component' | 'unknown' {
  if (data.files && Array.isArray(data.files)) {
    return 'file';
  }
  if (data.components && Array.isArray(data.components)) {
    return 'component';
  }
  if (data.component && data.violations && Array.isArray(data.violations)) {
    return 'single-component';
  }
  return 'unknown';
}

/**
 * Convert single-component report to multi-component format
 */
export function convertSingleComponentToComponentFormat(
  report: ComponentViolationReport,
): AllViolationsReport {
  return {
    components: [
      {
        component: report.component,
        violations: report.violations.map((v) => ({
          ...v,
          replacement: report.component,
        })),
      },
    ],
    rootPath: report.rootPath,
  };
}

/**
 * Convert component-grouped report to file-grouped format
 */
export function convertComponentToFileFormat(
  report: AllViolationsReport,
): AllViolationsReportByFile {
  const fileMap = report.components.reduce((map, componentReport) => {
    return componentReport.violations.reduce((m, violation) => {
      const existing = m.get(violation.file) ?? [];
      existing.push({
        component: componentReport.component,
        lines: violation.lines,
        violation: violation.violation,
        replacement: violation.replacement,
      });
      m.set(violation.file, existing);
      return m;
    }, map);
  }, new Map<string, FileViolationReport['components']>());

  const files: FileViolationReport[] = Array.from(
    fileMap.entries(),
    ([file, components]) => ({ file, components }),
  ).sort((a, b) => a.file.localeCompare(b.file));

  return { files, rootPath: report.rootPath };
}
