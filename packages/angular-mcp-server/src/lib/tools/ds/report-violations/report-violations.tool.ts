import { createHandler } from '../shared/utils/handler-helpers.js';
import { toWorkspaceRelativePath } from '../shared/utils/path-helpers.js';
import { analyzeViolationsBase } from '../shared/violation-analysis/base-analyzer.js';
import {
  groupIssuesByFile,
  filterFailedAudits,
} from '../shared/violation-analysis/formatters.js';
import { BaseViolationResult } from '../shared/violation-analysis/types.js';
import {
  ComponentViolationReport,
  ViolationEntry,
  ReportViolationsOptions,
  ReportViolationsResult,
} from './models/types.js';
import { reportViolationsSchema } from './models/schema.js';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import {
  generateFilename,
  parseViolationMessage,
  calculateSingleComponentStats,
} from './utils/index.js';

export { reportViolationsSchema };

export const reportViolationsHandler = createHandler<
  ReportViolationsOptions,
  ReportViolationsResult
>(
  reportViolationsSchema.name,
  async (params, { cwd, workspaceRoot }) => {
    const result = await analyzeViolationsBase<BaseViolationResult>(params);
    const failedAudits = filterFailedAudits(result);

    if (failedAudits.length === 0) {
      const report = {
        component: params.componentName,
        violations: [],
      };

      if (params.saveAsFile) {
        const outputDir = join(
          cwd,
          'tmp',
          '.angular-toolkit-mcp',
          'violations-report',
          params.componentName,
        );
        const filename = generateFilename(params.directory);
        const filePath = join(outputDir, filename);
        await mkdir(outputDir, { recursive: true });
        await writeFile(filePath, JSON.stringify(report, null, 2), 'utf-8');
        return {
          message: 'Violations report saved',
          filePath: toWorkspaceRelativePath(filePath, workspaceRoot),
          stats: {
            components: 1,
            files: 0,
            lines: 0,
          },
        };
      }

      return report;
    }

    const violations: ViolationEntry[] = [];

    // Process all issues from all audits
    for (const audit of failedAudits) {
      const fileGroups = groupIssuesByFile(
        audit.details?.issues ?? [],
        params.directory,
      );

      for (const [fileName, { lines, message }] of Object.entries(fileGroups)) {
        const violation = parseViolationMessage(message);

        violations.push({
          file: fileName,
          lines: lines.sort((a, b) => a - b),
          violation,
        });
      }
    }

    const report = {
      component: params.componentName,
      violations,
    };

    if (params.saveAsFile) {
      const outputDir = join(
        cwd,
        'tmp',
        '.angular-toolkit-mcp',
        'violations-report',
        params.componentName,
      );
      const filename = generateFilename(params.directory);
      const filePath = join(outputDir, filename);
      await mkdir(outputDir, { recursive: true });
      await writeFile(filePath, JSON.stringify(report, null, 2), 'utf-8');
      
      const stats = calculateSingleComponentStats(violations);
      
      return {
        message: 'Violations report saved',
        filePath: toWorkspaceRelativePath(filePath, workspaceRoot),
        stats,
      };
    }

    return report;
  },
  (result) => {
    // Check if this is a file output response
    if ('message' in result && 'filePath' in result) {
      const stats = 'stats' in result ? result.stats : null;
      const statsMessage = stats 
        ? ` (${stats.components} component, ${stats.files} files, ${stats.lines} lines)`
        : '';
      return [`Violations report saved to ${result.filePath}${statsMessage}`];
    }

    const report = result as ComponentViolationReport;
    if (report.violations.length === 0) {
      return [`No violations found for component: ${report.component}`];
    }

    const message = [
      `Found violations for component: ${report.component}`,
      'Use this output to identify:',
      '  - Which files contain violations',
      '  - The specific line numbers where violations occur',
      '  - What is being used that violates the rules (violation field)',
      '',
      'Violation Report:',
      '',
      JSON.stringify(report, null, 2),
    ];

    return [message.join('\n')];
  },
);

export const reportViolationsTools = [
  {
    schema: reportViolationsSchema,
    handler: reportViolationsHandler,
  },
];
