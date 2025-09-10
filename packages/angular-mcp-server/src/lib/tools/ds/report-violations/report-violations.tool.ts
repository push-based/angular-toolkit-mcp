import {
  createHandler,
  BaseHandlerOptions,
  RESULT_FORMATTERS,
} from '../shared/utils/handler-helpers.js';
import { validateAndNormalizeComponentName } from '../shared/utils/component-validation.js';
import {
  createViolationReportingSchema,
  COMMON_ANNOTATIONS,
} from '../shared/models/schema-helpers.js';
import { analyzeViolationsBase } from '../shared/violation-analysis/base-analyzer.js';
import { formatViolations } from '../shared/violation-analysis/formatters.js';
import { ViolationResult } from './models/types.js';

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

export const reportViolationsHandler = createHandler<
  ReportViolationsOptions,
  string[]
>(
  reportViolationsSchema.name,
  async (params) => {
    // Default to 'file' grouping if not specified
    const groupBy = params.groupBy || 'file';

    // Normalize component name at handler entry point
    const normalizedParams = {
      ...params,
      componentName: validateAndNormalizeComponentName(params.componentName),
    };

    const result =
      await analyzeViolationsBase<ViolationResult>(normalizedParams);

    const formattedContent = formatViolations(result, params.directory, {
      groupBy,
    });

    // Extract text content from the formatted violations
    const violationLines = formattedContent.map((item) => {
      if (item.type === 'text') {
        return item.text;
      }
      return String(item);
    });

    return violationLines;
  },
  (result) => RESULT_FORMATTERS.list(result, 'Design System Violations:'),
);

export const reportViolationsTools = [
  {
    schema: reportViolationsSchema,
    handler: reportViolationsHandler,
  },
];
