import {
  createHandler,
  BaseHandlerOptions,
  RESULT_FORMATTERS,
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
 * Extracts deprecated class and replacement from violation message
 */
function parseViolationMessage(message: string): { violation: string; replacement: string } {
  // Clean up HTML tags
  const cleanMessage = message.replace(/<code>/g, '`').replace(/<\/code>/g, '`');
  
  // Extract deprecated class - look for patterns like "class `offer-badge`" or "class `btn, btn-primary`"
  const classMatch = cleanMessage.match(/class `([^`]+)`/);
  const violation = classMatch ? classMatch[1] : 'unknown';
  
  // Extract replacement component - look for "Use `ComponentName`"
  const replacementMatch = cleanMessage.match(/Use `([^`]+)`/);
  const replacement = replacementMatch ? replacementMatch[1] : 'unknown';
  
  return { violation, replacement };
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
        const { violation, replacement } = parseViolationMessage(message);
        
        violations.push({
          file: fileName,
          lines: lines.sort((a, b) => a - b),
          violation,
          replacement,
        });
      }
    }

    return {
      component: params.componentName,
      violations,
    };
  },
  (result) => RESULT_FORMATTERS.json(result),
);

export const reportViolationsTools = [
  {
    schema: reportViolationsSchema,
    handler: reportViolationsHandler,
  },
];
