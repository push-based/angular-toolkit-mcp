import { dsComponentCoveragePlugin } from '@push-based/ds-component-coverage';
import * as process from 'node:process';
import { validateDsComponentsArray } from '../../../../validation/ds-components-file-loader.validation.js';
import {
  ReportCoverageParams,
  BaseViolationResult,
  FormattedCoverageResult,
  BaseViolationAudit,
} from './types.js';
import { groupIssuesByFile } from './formatters.js';
import { resolveCrossPlatformPath } from '../utils/cross-platform-path.js';

/**
 * Validates the input parameters for the report coverage tool
 */
export function validateReportInput(params: ReportCoverageParams): void {
  if (!params.directory || typeof params.directory !== 'string') {
    throw new Error('Directory parameter is required and must be a string');
  }

  try {
    validateDsComponentsArray(params.dsComponents);
  } catch (ctx) {
    throw new Error(
      `Invalid dsComponents parameter: ${(ctx as Error).message}`,
    );
  }
}

/**
 * Executes the coverage plugin and returns the result
 */
export async function executeCoveragePlugin(
  params: ReportCoverageParams,
): Promise<BaseViolationResult> {
  const pluginConfig = await dsComponentCoveragePlugin({
    dsComponents: params.dsComponents,
    directory: resolveCrossPlatformPath(
      params.cwd || process.cwd(),
      params.directory,
    ),
  });

  const { executePlugin } = await import('@code-pushup/core');
  return (await executePlugin(pluginConfig as any, {
    cache: { read: false, write: false },
    persist: { outputDir: '' },
  })) as BaseViolationResult;
}

/**
 * Extracts component name from audit title - performance optimized with caching
 */
const componentNameCache = new Map<string, string>();

export function extractComponentName(title: string): string {
  if (componentNameCache.has(title)) {
    return componentNameCache.get(title)!;
  }

  const componentMatch = title.match(/Usage coverage for (\w+) component/);
  const componentName = componentMatch ? componentMatch[1] : 'Unknown';

  componentNameCache.set(title, componentName);
  return componentName;
}

/**
 * Formats the coverage result as text output - performance optimized
 */
export function formatCoverageResult(
  result: BaseViolationResult,
  params: ReportCoverageParams,
): string {
  // Pre-filter failed audits to avoid repeated filtering
  const failedAudits = result.audits.filter(
    ({ score }: BaseViolationAudit) => score < 1,
  );

  if (failedAudits.length === 0) {
    return '';
  }

  const output: string[] = [];
  output.push(''); // Pre-allocate with expected size for better performance

  for (const { details, title } of failedAudits) {
    const componentName = extractComponentName(title);

    output.push(`- design system component: ${componentName}`);
    output.push(`- base directory: ${params.directory}`);
    output.push('');

    // Use shared, optimized groupIssuesByFile function
    const fileGroups = groupIssuesByFile(
      details?.issues ?? [],
      params.directory,
    );

    // Add first message
    const firstFile = Object.keys(fileGroups)[0];
    if (firstFile && fileGroups[firstFile]) {
      output.push(fileGroups[firstFile].message);
      output.push('');
    }

    // Add files and lines - optimize sorting
    for (const [fileName, { lines }] of Object.entries(fileGroups)) {
      output.push(`- ${fileName}`);
      // Sort once and cache the result
      const sortedLines =
        lines.length > 1 ? lines.sort((a, b) => a - b) : lines;
      output.push(` - lines: ${sortedLines.join(',')}`);
    }

    output.push('');
  }

  return output.join('\n');
}

/**
 * Main implementation function for reporting project coverage
 */
export async function analyzeProjectCoverage(
  params: ReportCoverageParams,
): Promise<FormattedCoverageResult> {
  validateReportInput(params);

  if (params.cwd) {
    process.chdir(params.cwd);
  }

  const result = await executeCoveragePlugin(params);

  const textOutput = formatCoverageResult(result, params);

  const formattedResult: FormattedCoverageResult = {
    textOutput,
  };

  if (params.returnRawData) {
    formattedResult.rawData = {
      rawPluginResult: result,
      pluginOptions: {
        directory: params.directory,
        dsComponents: params.dsComponents,
      },
    };
  }

  return formattedResult;
}
