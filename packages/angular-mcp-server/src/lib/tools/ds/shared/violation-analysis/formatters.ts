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
 * Groups violation issues by file name - consolidated from multiple modules
 * Performance optimized with Set for duplicate checking and cached normalizations
 * Lines are sorted inline for efficiency
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
      // Normalize message inline (remove directory prefix)
      const directoryPrefix = directory.endsWith('/')
        ? directory
        : directory + '/';
      const normalizedMessage = message.includes(directoryPrefix)
        ? message.replace(directoryPrefix, '')
        : message;

      fileGroups[fileName] = {
        message: normalizedMessage,
        lines: [],
      };
      processedFiles.add(fileName);
    }

    fileGroups[fileName].lines.push(lineNumber);
  }

  // Sort lines inline for each file (single sort operation per file)
  for (const fileGroup of Object.values(fileGroups)) {
    if (fileGroup.lines.length > 1) {
      fileGroup.lines.sort((a, b) => a - b);
    }
  }

  return fileGroups;
}
