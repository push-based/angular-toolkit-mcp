import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Converts a glob pattern to a regular expression.
 * Supports: `*` (single segment), `**` (recursive), `?` (single char)
 */
export function globToRegex(pattern: string): RegExp {
  let regexPattern = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\?/g, '[^/]')
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

/**
 * Recursively walks a directory synchronously and returns all file paths.
 * Silently skips unreadable directories.
 */
export function walkDirectorySync(dir: string): string[] {
  const results: string[] = [];

  function walk(currentPath: string) {
    try {
      const entries = fs.readdirSync(currentPath, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);
        if (entry.isDirectory()) {
          walk(fullPath);
        } else if (entry.isFile()) {
          results.push(fullPath);
        }
      }
    } catch {
      // Silently skip unreadable directories
    }
  }

  if (fs.existsSync(dir)) {
    walk(dir);
  }

  return results;
}
