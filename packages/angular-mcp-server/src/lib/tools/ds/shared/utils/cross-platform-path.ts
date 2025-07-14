import * as path from 'path';
import * as fs from 'fs';
import { toUnixPath } from '@push-based/utils';

/**
 * Enhanced path resolution with workspace root context for better debugging
 */
export function resolveCrossPlatformPathWithContext(
  basePath: string,
  relativePath: string,
  workspaceRoot?: string,
): {
  resolved: string;
  context: {
    basePath: string;
    relativePath: string;
    workspaceRoot?: string;
    isBasePathSameAsWorkspaceRoot: boolean;
    relativeToWorkspaceRoot?: string;
  };
} {
  const normalizedRelative = relativePath.replace(/\\/g, '/');
  const resolved = path.resolve(basePath, normalizedRelative);
  const unixResolved = toUnixPath(resolved);

  const context = {
    basePath: toUnixPath(basePath),
    relativePath: normalizedRelative,
    workspaceRoot: workspaceRoot ? toUnixPath(workspaceRoot) : undefined,
    isBasePathSameAsWorkspaceRoot: workspaceRoot
      ? toUnixPath(basePath) === toUnixPath(workspaceRoot)
      : false,
    relativeToWorkspaceRoot: workspaceRoot
      ? path.relative(workspaceRoot, unixResolved)
      : undefined,
  };

  return { resolved: unixResolved, context };
}

/**
 * Enhanced validation with comprehensive workspace root context
 */
export function resolveCrossPlatformPathAndValidateWithContext(
  basePath: string,
  relativePath: string,
  workspaceRoot?: string,
): string {
  const { resolved, context } = resolveCrossPlatformPathWithContext(
    basePath,
    relativePath,
    workspaceRoot,
  );

  // Convert to platform-specific for fs operations
  const fsPath = resolved.replace(/\//g, path.sep);

  if (!fs.existsSync(fsPath)) {
    let errorMessage =
      `Directory does not exist: ${relativePath}\n` +
      `Resolved to: ${resolved}\n` +
      `Base path: ${basePath}`;

    if (workspaceRoot) {
      errorMessage +=
        `\n` +
        `Workspace root: ${workspaceRoot}\n` +
        `Base path same as workspace root: ${context.isBasePathSameAsWorkspaceRoot}\n` +
        `Path relative to workspace root: ${context.relativeToWorkspaceRoot}`;

      if (!context.isBasePathSameAsWorkspaceRoot) {
        errorMessage +=
          `\n` +
          `⚠️  WARNING: Base path differs from workspace root!\n` +
          `   This might indicate a configuration issue.`;
      }
    }

    throw new Error(errorMessage);
  }

  return resolved;
}

/**
 * Resolves a relative path against a base path with cross-platform normalization.
 * Handles mixed path separators and ensures consistent Unix-style output.
 *
 * @param basePath - The base directory (usually absolute)
 * @param relativePath - The relative path to resolve
 * @returns Normalized absolute path with Unix-style separators
 */
export function resolveCrossPlatformPath(
  basePath: string,
  relativePath: string,
): string {
  return resolveCrossPlatformPathWithContext(basePath, relativePath).resolved;
}

/**
 * Resolves a relative path against a base path and validates that it exists.
 * Provides helpful error messages for debugging path issues.
 *
 * @param basePath - The base directory (usually absolute)
 * @param relativePath - The relative path to resolve
 * @returns Normalized absolute path with Unix-style separators
 * @throws Error if the resolved path does not exist
 */
export function resolveCrossPlatformPathAndValidate(
  basePath: string,
  relativePath: string,
): string {
  return resolveCrossPlatformPathAndValidateWithContext(basePath, relativePath);
}

/**
 * Legacy replacement for validateTargetPath function.
 * Enhanced version that includes workspace root context when available.
 *
 * @param cwd - Current working directory (base path)
 * @param directory - Relative directory path to validate
 * @param workspaceRoot - Optional workspace root for enhanced error context
 * @returns Normalized absolute path with Unix-style separators
 * @throws Error if the resolved path does not exist
 */
export function validateTargetPath(
  cwd: string,
  directory: string,
  workspaceRoot?: string,
): string {
  return resolveCrossPlatformPathAndValidateWithContext(
    cwd,
    directory,
    workspaceRoot,
  );
}

/**
 * Converts absolute paths to relative paths based on a workspace root.
 * Handles file paths with line/column annotations (e.g., "file.html@44:9")
 *
 * @param absolutePath - The absolute path to normalize
 * @param workspaceRoot - The workspace root to make paths relative to
 * @returns The normalized relative path
 */
export function normalizeAbsolutePathToRelative(
  absolutePath: string,
  workspaceRoot: string,
): string {
  // Handle paths with line/column annotations (e.g., "file.html@44:9")
  const [filePath, annotation] = absolutePath.split('@');

  // Convert to Unix-style paths for consistent processing
  const normalizedFilePath = toUnixPath(filePath);
  const normalizedWorkspaceRoot = toUnixPath(workspaceRoot);

  // If the path is already relative or doesn't start with workspace root, return as-is
  if (
    !path.isAbsolute(normalizedFilePath) ||
    !normalizedFilePath.startsWith(normalizedWorkspaceRoot)
  ) {
    return absolutePath;
  }

  // Calculate relative path
  const relativePath = path.relative(
    normalizedWorkspaceRoot,
    normalizedFilePath,
  );

  // Reconstruct with annotation if it existed
  return annotation ? `${relativePath}@${annotation}` : relativePath;
}

/**
 * Recursively normalizes all absolute paths in an object to relative paths
 *
 * @param obj - The object to process
 * @param workspaceRoot - The workspace root to make paths relative to
 * @returns The object with normalized paths
 */
export function normalizePathsInObject<T>(obj: T, workspaceRoot: string): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    // Check if this looks like an absolute path that starts with workspace root
    const normalizedWorkspaceRoot = toUnixPath(workspaceRoot);
    const normalizedObj = toUnixPath(obj);

    if (
      path.isAbsolute(normalizedObj) &&
      normalizedObj.startsWith(normalizedWorkspaceRoot)
    ) {
      return normalizeAbsolutePathToRelative(obj, workspaceRoot) as T;
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => normalizePathsInObject(item, workspaceRoot)) as T;
  }

  if (typeof obj === 'object') {
    const result = {} as T;
    for (const [key, value] of Object.entries(obj)) {
      (result as any)[key] = normalizePathsInObject(value, workspaceRoot);
    }
    return result;
  }

  return obj;
}
