import { createHandler, BaseHandlerOptions } from '../shared/utils/handler-helpers.js';
import {
  createProjectAnalysisSchema,
  COMMON_ANNOTATIONS,
} from '../shared/models/schema-helpers.js';
import {
  analyzeProjectCoverage,
} from '../shared/violation-analysis/coverage-analyzer.js';
import { formatViolations } from '../shared/violation-analysis/formatters.js';
import { loadAndValidateDsComponentsFile } from '../../../validation/ds-components-file-loader.validation.js';

interface ReportAllViolationsOptions extends BaseHandlerOptions {
  directory: string;
  groupBy?: 'file' | 'folder';
}

export const reportAllViolationsSchema = {
  name: 'report-all-violations',
  description:
    'Report all deprecated DS CSS usage for every component defined in the config file within a directory.',
  inputSchema: createProjectAnalysisSchema({
    groupBy: {
      type: 'string',
      enum: ['file', 'folder'],
      description: 'How to group the results',
      default: 'file',
    },
  }),
  annotations: {
    title: 'Report All Violations',
    ...COMMON_ANNOTATIONS.readOnly,
  },
};


// Reuse centralized loader+validator for DS components config

export const reportAllViolationsHandler = createHandler<
  ReportAllViolationsOptions,
  string[]
>(
  reportAllViolationsSchema.name,
  async (params, { cwd, deprecatedCssClassesPath }) => {
    const groupBy = params.groupBy || 'file';
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
    if (!raw) return [];

    // Reuse the existing minimal formatter so output format matches report-violations
    // and respect groupBy option.
    const formattedContent = formatViolations(raw, params.directory, {
      groupBy: groupBy === 'file' ? 'file' : 'folder',
    });

    // Extract text items to string[]
    const lines = formattedContent.map((item: { type?: string; text?: string } | string) => {
      if (typeof item === 'string') return item;
      if (item && typeof item.text === 'string') return item.text;
      return String(item);
    });

    return lines;
  },
  (result) => result,
);

export const reportAllViolationsTools = [
  {
    schema: reportAllViolationsSchema,
    handler: reportAllViolationsHandler,
  },
];
