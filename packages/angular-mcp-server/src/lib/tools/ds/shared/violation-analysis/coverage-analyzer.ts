import { dsComponentCoveragePlugin } from '@push-based/ds-component-coverage';
import * as process from 'node:process';
import { validateDsComponentsArray } from '../../../../validation/ds-components-file-loader.validation.js';
import {
  ReportCoverageParams,
  BaseViolationResult,
  FormattedCoverageResult,
} from './types.js';
import { resolveCrossPlatformPath } from '../utils/cross-platform-path.js';
import { normalizeFilePath } from './formatters.js';

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
 * Normalizes excludePatterns to an array format
 */
function normalizeExcludePatterns(
  patterns: string | string[] | undefined,
): string[] {
  if (!patterns) {
    return [];
  }
  return Array.isArray(patterns) ? patterns : [patterns];
}

/**
 * Converts a glob pattern to a regular expression.
 * Supports: *, **, ?
 */
function globToRegex(pattern: string): RegExp {
  let regexPattern = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\?/g, '.')
    .replace(/\*\*/g, '<!DOUBLESTAR!>')
    .replace(/\*/g, '[^/]*')
    .replace(/<!DOUBLESTAR!>/g, '.*');

  if (pattern.startsWith('**/')) {
    regexPattern = regexPattern.replace(/^\.\*\//, '');
    regexPattern = `^(?:.*\\/)?${regexPattern}`;
  } else {
    regexPattern = `^${regexPattern}`;
  }

  if (!regexPattern.endsWith('$')) {
    regexPattern = `${regexPattern}$`;
  }

  return new RegExp(regexPattern);
}

function validateGlobPattern(pattern: string): void {
  try {
    globToRegex(pattern);
  } catch (ctx) {
    throw new Error(
      `Invalid glob pattern "${pattern}": ${ctx instanceof Error ? ctx.message : 'Unknown error'}`,
    );
  }
}

function validateExcludePatterns(
  patterns: string | string[] | undefined,
): void {
  const normalized = normalizeExcludePatterns(patterns);
  for (const pattern of normalized) {
    validateGlobPattern(pattern);
  }
}

function shouldExcludeFile(
  filePath: string,
  excludeRegexes: RegExp[],
): boolean {
  if (excludeRegexes.length === 0) {
    return false;
  }

  const normalizedPath = filePath.replace(/\\/g, '/');

  return excludeRegexes.some((regex) => regex.test(normalizedPath));
}

/**
 * Main implementation function for reporting project coverage
 */
export async function analyzeProjectCoverage(
  params: ReportCoverageParams,
): Promise<FormattedCoverageResult> {
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

  if (params.excludePatterns) {
    validateExcludePatterns(params.excludePatterns);
  }

  const normalizedPatterns = normalizeExcludePatterns(params.excludePatterns);
  const excludeRegexes = normalizedPatterns.map(globToRegex);

  if (params.cwd) {
    process.chdir(params.cwd);
  }

  const scanRootDirectory = resolveCrossPlatformPath(
    params.cwd || process.cwd(),
    params.directory,
  );

  const pluginConfig = await dsComponentCoveragePlugin({
    dsComponents: params.dsComponents,
    directory: scanRootDirectory,
  });

  const { executePlugin } = await import('@code-pushup/core');
  const result = (await executePlugin(pluginConfig as any, {
    cache: { read: false, write: false },
    persist: { outputDir: '' },
  })) as BaseViolationResult;

  const filteredResult: BaseViolationResult = {
    ...result,
    audits: result.audits.map((audit) => {
      if (!audit.details?.issues) {
        return audit;
      }

      const filteredIssues = audit.details.issues.filter((issue) => {
        if (!issue.source?.file) {
          return true;
        }

        const relativePath = normalizeFilePath(
          issue.source.file,
          params.directory,
        );

        return !shouldExcludeFile(relativePath, excludeRegexes);
      });

      const score = filteredIssues.length === 0 ? 1 : audit.score;

      return {
        ...audit,
        score,
        details: {
          ...audit.details,
          issues: filteredIssues,
        },
      };
    }),
  };

  const formattedResult: FormattedCoverageResult = {
    textOutput: '',
  };

  if (params.returnRawData) {
    formattedResult.rawData = {
      rawPluginResult: filteredResult,
      pluginOptions: {
        directory: params.directory,
        dsComponents: params.dsComponents,
      },
    };
  }

  return formattedResult;
}
