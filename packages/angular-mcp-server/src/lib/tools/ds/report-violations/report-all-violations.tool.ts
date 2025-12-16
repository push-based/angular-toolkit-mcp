import { createHandler } from '../shared/utils/handler-helpers.js';
import { normalizeAbsolutePathToRelative } from '../shared/utils/cross-platform-path.js';
import { DEFAULT_OUTPUT_BASE, OUTPUT_SUBDIRS } from '../shared/constants.js';
import {
  analyzeProjectCoverage,
  extractComponentName,
} from '../shared/violation-analysis/coverage-analyzer.js';
import {
  filterFailedAudits,
  groupIssuesByFile,
} from '../shared/violation-analysis/formatters.js';
import type { BaseViolationAudit } from '../shared/violation-analysis/types.js';
import { loadAndValidateDsComponentsFile } from '../../../validation/ds-components-file-loader.validation.js';
import {
  AllViolationsComponentReport,
  AllViolationsEntry,
  FileViolationReport,
  ComponentViolationInFile,
  ReportAllViolationsOptions,
  ReportAllViolationsResult,
  ProcessedViolation,
} from './models/types.js';
import { reportAllViolationsSchema } from './models/schema.js';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import {
  generateFilename,
  parseViolationMessageWithReplacement,
  calculateComponentGroupedStats,
  calculateFileGroupedStats,
} from './utils/index.js';

export { reportAllViolationsSchema };

/**
 * Processes all failed audits into a unified structure
 * This eliminates code duplication between component and file grouping modes
 */
function processAudits(
  failedAudits: BaseViolationAudit[],
  directory: string,
): ProcessedViolation[] {
  const processed: ProcessedViolation[] = [];

  for (const audit of failedAudits) {
    const componentName = extractComponentName(audit.title);
    const fileGroups = groupIssuesByFile(
      audit.details?.issues ?? [],
      directory,
    );

    for (const [fileName, { lines: fileLines, message }] of Object.entries(
      fileGroups,
    )) {
      // Lines are already sorted by groupIssuesByFile, so we can use them directly
      const { violation, replacement } =
        parseViolationMessageWithReplacement(message);

      processed.push({
        component: componentName,
        fileName: fileName,
        lines: fileLines, // Already sorted
        violation,
        replacement,
      });
    }
  }

  return processed;
}

export const reportAllViolationsHandler = createHandler<
  ReportAllViolationsOptions,
  ReportAllViolationsResult
>(
  reportAllViolationsSchema.name,
  async (params, { cwd, workspaceRoot, deprecatedCssClassesPath }) => {
    if (!deprecatedCssClassesPath) {
      throw new Error(
        'Missing ds.deprecatedCssClassesPath. Provide --ds.deprecatedCssClassesPath in mcp.json file.',
      );
    }

    const dsComponents = await loadAndValidateDsComponentsFile(
      cwd,
      deprecatedCssClassesPath || '',
    );

    const coverageResult = await analyzeProjectCoverage({
      cwd,
      returnRawData: true,
      directory: params.directory,
      dsComponents,
    });

    const raw = coverageResult.rawData?.rawPluginResult;
    const failedAudits = raw ? filterFailedAudits(raw) : [];

    // Early exit for empty results
    if (failedAudits.length === 0) {
      const report =
        params.groupBy === 'file'
          ? { files: [], rootPath: params.directory }
          : { components: [], rootPath: params.directory };

      if (params.saveAsFile) {
        const outputDir = join(
          cwd,
          DEFAULT_OUTPUT_BASE,
          OUTPUT_SUBDIRS.VIOLATIONS_REPORT,
        );
        const filename = generateFilename(params.directory);
        const filePath = join(outputDir, filename);
        await mkdir(outputDir, { recursive: true });
        await writeFile(filePath, JSON.stringify(report, null, 2), 'utf-8');
        return {
          message: 'Violations report saved',
          filePath: normalizeAbsolutePathToRelative(filePath, workspaceRoot),
          stats: {
            components: 0,
            files: 0,
            lines: 0,
          },
        };
      }

      return report;
    }

    // Process all audits into unified structure (eliminates code duplication)
    const processed = processAudits(failedAudits, params.directory);

    // Group by component (default behavior)
    if (params.groupBy !== 'file') {
      const componentMap = new Map<string, AllViolationsEntry[]>();

      for (const item of processed) {
        if (!componentMap.has(item.component)) {
          componentMap.set(item.component, []);
        }

        const violations = componentMap.get(item.component);
        if (violations) {
          violations.push({
            file: item.fileName,
            lines: item.lines,
            violation: item.violation,
            replacement: item.replacement,
          });
        }
      }

      const components: AllViolationsComponentReport[] = Array.from(
        componentMap.entries(),
        ([component, violations]) => ({ component, violations }),
      );

      const report = { components, rootPath: params.directory };

      if (params.saveAsFile) {
        const outputDir = join(
          cwd,
          DEFAULT_OUTPUT_BASE,
          OUTPUT_SUBDIRS.VIOLATIONS_REPORT,
        );
        const filename = generateFilename(params.directory);
        const filePath = join(outputDir, filename);
        await mkdir(outputDir, { recursive: true });
        await writeFile(filePath, JSON.stringify(report, null, 2), 'utf-8');

        const stats = calculateComponentGroupedStats(components);

        return {
          message: 'Violations report saved',
          filePath: normalizeAbsolutePathToRelative(filePath, workspaceRoot),
          stats,
        };
      }

      return report;
    }

    // Group by file
    const fileMap = new Map<string, ComponentViolationInFile[]>();

    for (const item of processed) {
      if (!fileMap.has(item.fileName)) {
        fileMap.set(item.fileName, []);
      }

      const components = fileMap.get(item.fileName);
      if (components) {
        components.push({
          component: item.component,
          lines: item.lines,
          violation: item.violation,
          replacement: item.replacement,
        });
      }
    }

    // Optimized conversion: build array directly and sort once
    const files: FileViolationReport[] = Array.from(
      fileMap.entries(),
      ([file, components]) => ({ file, components }),
    ).sort((a, b) => a.file.localeCompare(b.file));

    const report = { files, rootPath: params.directory };

    if (params.saveAsFile) {
      const outputDir = join(
        cwd,
        DEFAULT_OUTPUT_BASE,
        OUTPUT_SUBDIRS.VIOLATIONS_REPORT,
      );
      const filename = generateFilename(params.directory);
      const filePath = join(outputDir, filename);
      await mkdir(outputDir, { recursive: true });
      await writeFile(filePath, JSON.stringify(report, null, 2), 'utf-8');

      const stats = calculateFileGroupedStats(files);

      return {
        message: 'Violations report saved',
        filePath: normalizeAbsolutePathToRelative(filePath, workspaceRoot),
        stats,
      };
    }

    return report;
  },
  (result) => {
    // Check if this is a file output response
    if ('message' in result && 'filePath' in result) {
      const stats = 'stats' in result && result.stats ? result.stats : null;
      const statsMessage = stats
        ? ` (${stats.components} components, ${stats.files} files, ${stats.lines} lines)`
        : '';
      return [`Violations report saved to ${result.filePath}${statsMessage}`];
    }

    const isFileGrouping = 'files' in result;
    const isEmpty = isFileGrouping
      ? result.files.length === 0
      : result.components.length === 0;

    if (isEmpty) {
      return ['No violations found in the specified directory.'];
    }

    const groupingType = isFileGrouping ? 'file' : 'component';
    const message = [
      `Found violations grouped by ${groupingType}.`,
      'Use this output to identify:',
      '  - Which files contain violations',
      '  - The specific line numbers where violations occur',
      '  - What is being used that violates the rules (violation field)',
      '  - What should be used instead (replacement field)',
      '',
      'Violation Report:',
      JSON.stringify(result, null, 2),
    ];

    return message;
  },
);

export const reportAllViolationsTools = [
  {
    schema: reportAllViolationsSchema,
    handler: reportAllViolationsHandler,
  },
];
