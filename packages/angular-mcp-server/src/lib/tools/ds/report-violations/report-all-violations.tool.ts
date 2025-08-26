import {
  BaseHandlerOptions,
  createHandler,
} from '../shared/utils/handler-helpers.js';
import {
  COMMON_ANNOTATIONS,
  createProjectAnalysisSchema,
} from '../shared/models/schema-helpers.js';
import { analyzeProjectCoverage, extractComponentName } from '../shared/violation-analysis/coverage-analyzer.js';
import { formatViolations, filterFailedAudits, groupIssuesByFile } from '../shared/violation-analysis/formatters.js';
import { loadAndValidateDsComponentsFile } from '../../../validation/ds-components-file-loader.validation.js';
import { RESULT_FORMATTERS } from '../shared/utils/handler-helpers.js';

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

    const failedAudits = filterFailedAudits(raw);
    if (failedAudits.length === 0) return ['No violations found.'];

    if (groupBy === 'file') {
      const lines: string[] = [];
      for (const audit of failedAudits) {
        extractComponentName(audit.title);
        const fileGroups = groupIssuesByFile(audit.details?.issues ?? [], params.directory);
        for (const [fileName, { lines: fileLines, message }] of Object.entries(fileGroups)) {
          const sorted = fileLines.length > 1 ? [...fileLines].sort((a, b) => a - b) : fileLines;
          const lineInfo = sorted.length > 1 ? `lines ${sorted.join(', ')}` : `line ${sorted[0]}`;
          lines.push(`${fileName} (${lineInfo}): ${message}`);
        }
      }
      return lines;
    }

    const formattedContent = formatViolations(raw, params.directory, { groupBy: 'folder' });
    return formattedContent.map((item: { type?: string; text?: string } | string) =>
      typeof item === 'string' ? item : item?.text ?? String(item),
    );
  },
  (result) => RESULT_FORMATTERS.list(result, 'Design System Violations:'),
);

export const reportAllViolationsTools = [
  {
    schema: reportAllViolationsSchema,
    handler: reportAllViolationsHandler,
  },
];
