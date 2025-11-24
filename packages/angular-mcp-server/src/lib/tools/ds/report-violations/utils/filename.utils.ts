/**
 * Generates filename from directory path
 * Example: "./packages/poker/core-lib" -> "packages-poker-core-lib-violations.json"
 */
export function generateFilename(directory: string): string {
  const normalized = directory
    .replace(/^\.\//, '') // Remove leading ./
    .replace(/\/+$/, '') // Remove trailing slashes
    .replace(/\//g, '-'); // Replace slashes with dashes
  return `${normalized}-violations.json`;
}
