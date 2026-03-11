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
 * Converts a glob pattern to a regular expression
 * Supports: *, **, ?
 */
function globToRegex(pattern: string): RegExp {
  // Escape special regex characters except glob wildcards
  let regexPattern = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\?/g, '.')
    .replace(/\*\*/g, '<!DOUBLESTAR!>')
    .replace(/\*/g, '[^/]*')
    .replace(/<!DOUBLESTAR!>/g, '.*');

  // Handle leading **/ to match from start or middle of path
  if (regexPattern.startsWith('^.*\\/')) {
    // Make the leading .*/ optional to match paths starting with the pattern
    regexPattern = '^(?:.*\\/)?'  + regexPattern.substring(6);
  }

  // Anchor the pattern if not already anchored
  if (!regexPattern.startsWith('^')) {
    regexPattern = `^${regexPattern}`;
  }
  if (!regexPattern.endsWith('$')) {
    regexPattern = `${regexPattern}$`;
  }

  return new RegExp(regexPattern);
}

/**
 * Validates glob pattern syntax
 * @throws Error if pattern is invalid
 */
function validateGlobPattern(pattern: string): void {
  try {
    // Test pattern compilation
    globToRegex(pattern);
  } catch (ctx) {
    throw new Error(
      `Invalid glob pattern "${pattern}": ${ctx instanceof Error ? ctx.message : 'Unknown error'}`,
    );
  }
}

/**
 * Validates all patterns in the array
 * @throws Error if any pattern is invalid
 */
function validateExcludePatterns(
  patterns: string | string[] | undefined,
): void {
  const normalized = normalizeExcludePatterns(patterns);
  for (const pattern of normalized) {
    validateGlobPattern(pattern);
  }
}

/**
 * Checks if a file path matches any exclude pattern
 * @param filePath - Relative file path from scan root
 * @param excludePatterns - Array of glob patterns
 * @returns true if file should be excluded
 */
function shouldExcludeFile(
  filePath: string,
  excludePatterns: string[],
): boolean {
  if (excludePatterns.length === 0) {
    return false;
  }

  // Normalize path separators for cross-platform compatibility (backslash to forward slash)
  const normalizedPath = filePath.replace(/\\/g, '/');

  // Check if path matches any pattern
  return excludePatterns.some((pattern) => {
    const regex = globToRegex(pattern);
    return regex.test(normalizedPath);
  });
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

  // Validate exclude patterns early (fail-fast validation)
  if (params.excludePatterns) {
    validateExcludePatterns(params.excludePatterns);
  }

  const normalizedPatterns = normalizeExcludePatterns(params.excludePatterns);

  if (params.cwd) {
    process.chdir(params.cwd);
  }

  const scanRootDirectory = resolveCrossPlatformPath(
    params.cwd || process.cwd(),
    params.directory,
  );

  // Execute the coverage plugin
  const pluginConfig = await dsComponentCoveragePlugin({
    dsComponents: params.dsComponents,
    directory: scanRootDirectory,
  });

  const { executePlugin } = await import('@code-pushup/core');
  const result = (await executePlugin(pluginConfig as any, {
    cache: { read: false, write: false },
    persist: { outputDir: '' },
  })) as BaseViolationResult;

  // Filter violations from excluded files
  const filteredResult: BaseViolationResult = {
    ...result,
    audits: result.audits.map((audit) => {
      if (!audit.details?.issues) {
        return audit;
      }

      const filteredIssues = audit.details.issues.filter((issue) => {
        if (!issue.source?.file) {
          return true; // Keep issues without file information
        }

        // The file path is already relative to the scan root directory
        const relativePath = issue.source.file;

        // Check if file should be excluded
        return !shouldExcludeFile(relativePath, normalizedPatterns);
      });

      return {
        ...audit,
        details: {
          ...audit.details,
          issues: filteredIssues,
        },
      };
    }),
  };

  const formattedResult: FormattedCoverageResult = {
    textOutput: '', // No longer used, kept for backwards compatibility
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
