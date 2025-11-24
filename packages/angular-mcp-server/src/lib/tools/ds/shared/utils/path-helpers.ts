import { relative } from 'path';

/**
 * Convert an absolute path to a workspace-relative path
 * @param absolutePath - The absolute path to convert
 * @param workspaceRoot - The workspace root directory
 * @returns Path relative to workspace root
 */
export function toWorkspaceRelativePath(
  absolutePath: string,
  workspaceRoot: string,
): string {
  const relativePath = relative(workspaceRoot, absolutePath);
  // If the path is outside workspace, return the absolute path
  if (relativePath.startsWith('..')) {
    return absolutePath;
  }
  return relativePath;
}
