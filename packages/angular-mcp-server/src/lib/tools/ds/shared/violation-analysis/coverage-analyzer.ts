import { dsComponentCoveragePlugin } from '@push-based/ds-component-coverage';
import * as process from 'node:process';
import { validateDsComponentsArray } from '../../../../validation/ds-components-file-loader.validation.js';
import {
  ReportCoverageParams,
  BaseViolationResult,
  FormattedCoverageResult,
} from './types.js';
import { resolveCrossPlatformPath } from '../utils/cross-platform-path.js';

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
 * Main implementation function for reporting project coverage
 */
export async function analyzeProjectCoverage(
  params: ReportCoverageParams,
): Promise<FormattedCoverageResult> {
  // Validate input parameters
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

  if (params.cwd) {
    process.chdir(params.cwd);
  }

  // Execute the coverage plugin
  const pluginConfig = await dsComponentCoveragePlugin({
    dsComponents: params.dsComponents,
    directory: resolveCrossPlatformPath(
      params.cwd || process.cwd(),
      params.directory,
    ),
  });

  const { executePlugin } = await import('@code-pushup/core');
  const result = (await executePlugin(pluginConfig as any, {
    cache: { read: false, write: false },
    persist: { outputDir: '' },
  })) as BaseViolationResult;

  const formattedResult: FormattedCoverageResult = {
    textOutput: '', // No longer used, kept for backwards compatibility
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
