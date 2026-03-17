import * as process from 'node:process';
import { getDeprecatedCssClasses } from '../../component/utils/deprecated-css-helpers.js';
import { validateComponentName } from '../utils/component-validation.js';
import {
  BaseViolationOptions,
  BaseViolationResult,
  ReportCoverageParams,
} from './types.js';
import { analyzeProjectCoverage as collectFilesViolations } from './coverage-analyzer.js';

/**
 * Base analyzer for design system violations - shared logic between file and folder reporting
 */
export async function analyzeViolationsBase<T extends BaseViolationResult>(
  options: BaseViolationOptions,
): Promise<T> {
  const cwd = options.cwd || process.cwd();

  validateComponentName(options.componentName);

  if (!options.directory || typeof options.directory !== 'string') {
    throw new Error('Directory parameter is required and must be a string');
  }

  process.chdir(cwd);

  if (!options.deprecatedCssClassesPath) {
    throw new Error(
      'Missing ds.deprecatedCssClassesPath. Provide --ds.deprecatedCssClassesPath in mcp.json file.',
    );
  }

  const deprecatedCssClasses = await getDeprecatedCssClasses(
    options.componentName,
    options.deprecatedCssClassesPath,
    cwd,
  );

  const dsComponents = [
    {
      componentName: options.componentName,
      deprecatedCssClasses,
    },
  ];

  const params: ReportCoverageParams = {
    ...options,
    cwd,
    returnRawData: true,
    dsComponents,
  };

  const result = await collectFilesViolations(params);

  if (!result.rawData?.rawPluginResult) {
    throw new Error('Failed to get raw plugin result for violation analysis');
  }

  return result.rawData.rawPluginResult as T;
}
