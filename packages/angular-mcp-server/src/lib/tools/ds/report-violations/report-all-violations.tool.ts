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
import type { BaseViolationAudit } from '../shared/violation-analysis/types.js';
import { loadAndValidateDsComponentsFile } from '../../../validation/ds-components-file-loader.validation.js';
import { 
  AllViolationsReport,
  AllViolationsComponentReport,
  AllViolationsEntry,
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
 * Performance optimized with caching to avoid repeated regex operations
 */
const messageParsingCache = new Map<string, { violation: string; replacement: string }>();

function parseViolationMessage(message: string): { violation: string; replacement: string } {
  // Check cache first
  const cached = messageParsingCache.get(message);
  if (cached) {
    return cached;
  }

  // Clean up HTML tags
  const cleanMessage = message.replace(/<code>/g, '`').replace(/<\/code>/g, '`');
  
  // Extract deprecated class - look for patterns like "class `offer-badge`" or "class `btn, btn-primary`"
  const classMatch = cleanMessage.match(/class `([^`]+)`/);
  const violation = classMatch ? classMatch[1] : 'unknown';
  
  // Extract replacement component - look for "Use `ComponentName`"
  const replacementMatch = cleanMessage.match(/Use `([^`]+)`/);
  const replacement = replacementMatch ? replacementMatch[1] : 'unknown';
  
  const result = { violation, replacement };
  messageParsingCache.set(message, result);
  return result;
}

/**
 * Processed violation data structure used internally for both grouping modes
 */
interface ProcessedViolation {
  component: string;
  fileName: string;
  lines: number[];
  violation: string;
  replacement: string;
}

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
      const { violation, replacement } = parseViolationMessage(message);

      processed.push({
        component: componentName,
        fileName,
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
    const failedAudits = raw ? filterFailedAudits(raw) : [];

    // Early exit for empty results
    if (failedAudits.length === 0) {
      return params.groupBy === 'file' ? { files: [] } : { components: [] };
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

      return { components };
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

    return { files };
  },
  (result) => {
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
