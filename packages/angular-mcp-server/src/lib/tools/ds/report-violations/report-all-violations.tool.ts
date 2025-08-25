import {
  BaseHandlerOptions,
  createHandler,
} from '../shared/utils/handler-helpers.js';
import {
  COMMON_ANNOTATIONS,
  createProjectAnalysisSchema,
} from '../shared/models/schema-helpers.js';
import { analyzeProjectCoverage } from '../shared/violation-analysis/coverage-analyzer.js';
import { formatViolations } from '../shared/violation-analysis/formatters.js';
import { loadAndValidateDsComponentsFile } from '../../../validation/ds-components-file-loader.validation.js';

interface ReportAllViolationsOptions extends BaseHandlerOptions {
  directory: string;
  groupBy?: 'file' | 'folder';
}

export const reportAllViolationsSchema = {
  name: 'report-all-violations',
  description:
    'Scan a directory for deprecated design system CSS classes defined in the config at `deprecatedCssClassesPath`, and output a usage report',
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

    const formattedContent = formatViolations(raw, params.directory, {
      groupBy: groupBy === 'file' ? 'file' : 'folder',
    });

    return formattedContent.map(
      (item: { type?: string; text?: string } | string) => {
        if (typeof item === 'string') return item;
        if (item && typeof item.text === 'string') return item.text;
        return String(item);
      },
    );
  },
  (result) => result,
);

export const reportAllViolationsTools = [
  {
    schema: reportAllViolationsSchema,
    handler: reportAllViolationsHandler,
  },
];
