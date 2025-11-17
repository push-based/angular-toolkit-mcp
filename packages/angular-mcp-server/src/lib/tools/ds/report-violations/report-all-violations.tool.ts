import {
  BaseHandlerOptions,
  createHandler,
} from '../shared/utils/handler-helpers.js';
import {
  COMMON_ANNOTATIONS,
  createProjectAnalysisSchema,
} from '../shared/models/schema-helpers.js';
import {
  analyzeProjectCoverage,
  extractComponentName,
} from '../shared/violation-analysis/coverage-analyzer.js';
import {
  filterFailedAudits,
  groupIssuesByFile,
} from '../shared/violation-analysis/formatters.js';
import { loadAndValidateDsComponentsFile } from '../../../validation/ds-components-file-loader.validation.js';
import { 
  AllViolationsReport, 
  ComponentViolationReport, 
  ViolationEntry,
  AllViolationsReportByFile,
  FileViolationReport,
  ComponentViolationInFile
} from './models/types.js';

interface ReportAllViolationsOptions extends BaseHandlerOptions {
  directory: string;
  groupBy?: 'component' | 'file';
}

export const reportAllViolationsSchema = {
  name: 'report-all-violations',
  description:
    'Scan a directory for deprecated design system CSS classes defined in the config at `deprecatedCssClassesPath`, and output a usage report',
  inputSchema: createProjectAnalysisSchema({
    groupBy: {
      type: 'string',
      enum: ['component', 'file'],
      description: 'How to group the results: "component" groups by design system component, "file" groups by file path',
      default: 'component',
    },
  }),
  annotations: {
    title: 'Report All Violations',
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

export const reportAllViolationsHandler = createHandler<
  ReportAllViolationsOptions,
  AllViolationsReport | AllViolationsReportByFile
>(
  reportAllViolationsSchema.name,
  async (params, { cwd, deprecatedCssClassesPath }) => {
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
    if (!raw) {
      return params.groupBy === 'file' ? { files: [] } : { components: [] };
    }

    const failedAudits = filterFailedAudits(raw);
    if (failedAudits.length === 0) {
      return params.groupBy === 'file' ? { files: [] } : { components: [] };
    }

    // Group by component (default behavior)
    if (params.groupBy !== 'file') {
      const components: ComponentViolationReport[] = [];

      for (const audit of failedAudits) {
        const componentName = extractComponentName(audit.title);
        const violations: ViolationEntry[] = [];

        const fileGroups = groupIssuesByFile(
          audit.details?.issues ?? [],
          params.directory,
        );

        for (const [fileName, { lines: fileLines, message }] of Object.entries(
          fileGroups,
        )) {
          const sorted =
            fileLines.length > 1
              ? [...fileLines].sort((a, b) => a - b)
              : fileLines;

          const { violation, replacement } = parseViolationMessage(message);

          violations.push({
            file: fileName,
            lines: sorted,
            violation,
            replacement,
          });
        }

        components.push({
          component: componentName,
          violations,
        });
      }

      return { components };
    }

    // Group by file
    const fileMap = new Map<string, ComponentViolationInFile[]>();

    for (const audit of failedAudits) {
      const componentName = extractComponentName(audit.title);

      const fileGroups = groupIssuesByFile(
        audit.details?.issues ?? [],
        params.directory,
      );

      for (const [fileName, { lines: fileLines, message }] of Object.entries(
        fileGroups,
      )) {
        const sorted =
          fileLines.length > 1
            ? [...fileLines].sort((a, b) => a - b)
            : fileLines;

        const { violation, replacement } = parseViolationMessage(message);

        if (!fileMap.has(fileName)) {
          fileMap.set(fileName, []);
        }

        const fileComponents = fileMap.get(fileName);
        if (fileComponents) {
          fileComponents.push({
            component: componentName,
            lines: sorted,
            violation,
            replacement,
          });
        }
      }
    }

    const files: FileViolationReport[] = Array.from(fileMap.entries())
      .map(([file, components]) => ({ file, components }))
      .sort((a, b) => a.file.localeCompare(b.file));

    return { files };
  },
  (result) => {
    // Return structured JSON for token efficiency
    return [JSON.stringify(result, null, 2)];
  },
);

export const reportAllViolationsTools = [
  {
    schema: reportAllViolationsSchema,
    handler: reportAllViolationsHandler,
  },
];
