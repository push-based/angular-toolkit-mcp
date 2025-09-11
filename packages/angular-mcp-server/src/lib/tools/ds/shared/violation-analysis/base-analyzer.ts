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
  const {
    cwd = process.cwd(),
    directory,
    componentName,
    deprecatedCssClassesPath,
  } = options;

  validateComponentName(componentName);

  if (!directory || typeof directory !== 'string') {
    throw new Error('Directory parameter is required and must be a string');
  }

  process.chdir(cwd);

  if (!deprecatedCssClassesPath) {
    throw new Error(
      'Missing ds.deprecatedCssClassesPath. Provide --ds.deprecatedCssClassesPath in mcp.json file.',
    );
  }

  const deprecatedCssClasses = getDeprecatedCssClasses(
    componentName,
    deprecatedCssClassesPath || '',
    cwd,
  );

  const dsComponents = [
    {
      componentName,
      deprecatedCssClasses,
    },
  ];

  const params: ReportCoverageParams = {
    cwd,
    returnRawData: true,
    directory,
    dsComponents,
  };

  const result = await collectFilesViolations(params);

  if (!result.rawData?.rawPluginResult) {
    throw new Error('Failed to get raw plugin result for violation analysis');
  }

  return result.rawData.rawPluginResult as T;
}
