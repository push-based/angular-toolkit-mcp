import {
  createHandler,
  BaseHandlerOptions,
} from '../shared/utils/handler-helpers.js';
import {
  createViolationReportingSchema,
  COMMON_ANNOTATIONS,
} from '../shared/models/schema-helpers.js';
import { analyzeViolationsBase } from '../shared/violation-analysis/base-analyzer.js';
import { groupIssuesByFile, filterFailedAudits } from '../shared/violation-analysis/formatters.js';
import { BaseViolationResult } from '../shared/violation-analysis/types.js';
import { ComponentViolationReport, ViolationEntry } from './models/types.js';

interface ReportViolationsOptions extends BaseHandlerOptions {
  directory: string;
  componentName: string;
  groupBy?: 'file' | 'folder';
}

export const reportViolationsSchema = {
  name: 'report-violations',
  description: `Report deprecated DS CSS usage in a directory with configurable grouping format.`,
  inputSchema: createViolationReportingSchema(),
  annotations: {
    title: 'Report Violations',
    ...COMMON_ANNOTATIONS.readOnly,
  },
};

/**
 * Extracts deprecated class from violation message
 */
function parseViolationMessage(message: string): string {
  // Clean up HTML tags
  const cleanMessage = message.replace(/<code>/g, '`').replace(/<\/code>/g, '`');
  
  // Extract deprecated class - look for patterns like "class `offer-badge`" or "class `btn, btn-primary`"
  const classMatch = cleanMessage.match(/class `([^`]+)`/);
  return classMatch ? classMatch[1] : 'unknown';
}

export const reportViolationsHandler = createHandler<
  ReportViolationsOptions,
  ComponentViolationReport
>(
  reportViolationsSchema.name,
  async (params) => {
    const result = await analyzeViolationsBase<BaseViolationResult>(params);
    const failedAudits = filterFailedAudits(result);

    if (failedAudits.length === 0) {
      return {
        component: params.componentName,
        violations: [],
      };
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

    return {
      component: params.componentName,
      violations,
    };
  },
  (result) => {
    if (result.violations.length === 0) {
      return [`No violations found for component: ${result.component}`];
    }

    const message = [
      `Found violations for component: ${result.component}`,
      'Use this output to identify:',
      '  - Which files contain violations',
      '  - The specific line numbers where violations occur',
      '  - What is being used that violates the rules (violation field)',
      '',
      'Violation Report:',
      '',
      JSON.stringify(result, null, 2),
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
