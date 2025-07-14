import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { buildText } from '../utils/output.utils.js';
import {
  BaseViolationResult,
  BaseViolationAudit,
  BaseViolationIssue,
  FileGroups,
  PathCache,
} from './types.js';

// Performance-optimized path cache
const pathCache: PathCache = {};

/**
 * Filters audits to only include those with violations (score < 1)
 */
export function filterFailedAudits(
  result: BaseViolationResult,
): BaseViolationAudit[] {
  return result.audits.filter(({ score }) => score < 1);
}

/**
 * Creates standard "no violations found" content
 */
export function createNoViolationsContent(): CallToolResult['content'] {
  return [
    buildText(
      '✅ No violations found! All files are compliant with the design system.',
    ),
  ];
}

/**
 * Extracts all issues from failed audits
 */
export function extractIssuesFromAudits(
  audits: BaseViolationAudit[],
): BaseViolationIssue[] {
  return audits.flatMap(({ details }) => details?.issues ?? []);
}

/**
 * Checks if a violation result has any failures
 */
export function hasViolations(result: BaseViolationResult): boolean {
  return filterFailedAudits(result).length > 0;
}

/**
 * Performance-optimized file path normalization with caching
 */
export function normalizeFilePath(filePath: string, directory: string): string {
  const cacheKey = `${filePath}::${directory}`;

  if (pathCache[cacheKey]) {
    return pathCache[cacheKey];
  }

  // Normalize both paths to use consistent separators
  const normalizedFilePath = filePath.replace(/\\/g, '/');
  const normalizedDirectory = directory.replace(/\\/g, '/');

  // Remove leading './' from directory if present for comparison
  const cleanDirectory = normalizedDirectory.startsWith('./')
    ? normalizedDirectory.slice(2)
    : normalizedDirectory;

  let normalized: string;

  // The file path from the coverage plugin is absolute, but we need to extract the relative part
  // Look for the directory pattern in the file path and extract everything after it
  const directoryPattern = cleanDirectory;
  const directoryIndex = normalizedFilePath.indexOf(directoryPattern);

  if (directoryIndex !== -1) {
    // Found the directory in the path, extract the part after it
    const afterDirectoryIndex = directoryIndex + directoryPattern.length;
    const afterDirectory = normalizedFilePath.slice(afterDirectoryIndex);

    // Remove leading slash if present
    normalized = afterDirectory.startsWith('/')
      ? afterDirectory.slice(1)
      : afterDirectory;
  } else {
    // Fallback: try with directory prefix approach
    const directoryPrefix = normalizedDirectory.endsWith('/')
      ? normalizedDirectory
      : normalizedDirectory + '/';
    normalized = normalizedFilePath.startsWith(directoryPrefix)
      ? normalizedFilePath.slice(directoryPrefix.length)
      : normalizedFilePath;
  }

  pathCache[cacheKey] = normalized;
  return normalized;
}

/**
 * Performance-optimized message normalization with caching
 */
export function normalizeMessage(message: string, directory: string): string {
  const cacheKey = `msg::${message}::${directory}`;

  if (pathCache[cacheKey]) {
    return pathCache[cacheKey];
  }

  const directoryPrefix = directory.endsWith('/') ? directory : directory + '/';
  const normalized = message.includes(directoryPrefix)
    ? message.replace(directoryPrefix, '')
    : message;

  pathCache[cacheKey] = normalized;
  return normalized;
}

/**
 * Groups violation issues by file name - consolidated from multiple modules
 * Performance optimized with Set for duplicate checking and cached normalizations
 */
export function groupIssuesByFile(
  issues: BaseViolationIssue[],
  directory: string,
): FileGroups {
  const fileGroups: FileGroups = {};
  const processedFiles = new Set<string>(); // O(1) lookup instead of includes()

  for (const { message, source } of issues) {
    if (!source?.file) continue;

    const fileName = normalizeFilePath(source.file, directory);
    const lineNumber = source.position?.startLine || 0;

    if (!fileGroups[fileName]) {
      fileGroups[fileName] = {
        message: normalizeMessage(message, directory),
        lines: [],
      };
      processedFiles.add(fileName);
    }

    fileGroups[fileName].lines.push(lineNumber);
  }

  return fileGroups;
}

/**
 * Extracts unique file paths from violation issues - performance optimized
 */
export function extractUniqueFilePaths(
  issues: BaseViolationIssue[],
  directory: string,
): string[] {
  const filePathSet = new Set<string>(); // Eliminate O(n) includes() calls

  for (const { source } of issues) {
    if (source?.file) {
      filePathSet.add(normalizeFilePath(source.file, directory));
    }
  }

  return Array.from(filePathSet);
}

/**
 * Clears the path cache - useful for testing or memory management
 */
export function clearPathCache(): void {
  Object.keys(pathCache).forEach((key) => delete pathCache[key]);
}

/**
 * Unified formatter for violations - supports both file and folder grouping with minimal output
 */
export function formatViolations(
  result: BaseViolationResult,
  directory: string,
  options: {
    groupBy: 'file' | 'folder';
  } = { groupBy: 'file' },
): CallToolResult['content'] {
  const failedAudits = filterFailedAudits(result);

  if (failedAudits.length === 0) {
    return [buildText('No violations found.')];
  }

  const allIssues = extractIssuesFromAudits(failedAudits);
  const content: CallToolResult['content'] = [];

  if (options.groupBy === 'file') {
    // Group by individual files - minimal format
    const fileGroups = groupIssuesByFile(allIssues, directory);

    for (const [fileName, { message, lines }] of Object.entries(fileGroups)) {
      const sortedLines = lines.sort((a, b) => a - b);
      const lineInfo =
        sortedLines.length > 1
          ? `lines ${sortedLines.join(', ')}`
          : `line ${sortedLines[0]}`;

      content.push(buildText(`${fileName} (${lineInfo}): ${message}`));
    }
  } else {
    // Group by folders - minimal format
    const folderGroups: Record<
      string,
      { violations: number; files: Set<string> }
    > = {};

    for (const { source } of allIssues) {
      if (!source?.file) continue;

      const normalizedPath = normalizeFilePath(source.file, directory);
      const folderPath = normalizedPath.includes('/')
        ? normalizedPath.substring(0, normalizedPath.lastIndexOf('/'))
        : '.';

      if (!folderGroups[folderPath]) {
        folderGroups[folderPath] = { violations: 0, files: new Set() };
      }

      folderGroups[folderPath].violations++;
      folderGroups[folderPath].files.add(normalizedPath);
    }

    // Sort folders for consistent output
    for (const [folder, { violations, files }] of Object.entries(
      folderGroups,
    ).sort()) {
      const displayPath = folder === '.' ? directory : `${directory}/${folder}`;
      content.push(
        buildText(
          `${displayPath}: ${violations} violations in ${files.size} files`,
        ),
      );
    }
  }

  return content;
}
