import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Replaces brace patterns like `{scss,css}` with numbered sentinels
 * and returns a map to restore them as regex alternation groups later.
 * Only handles single-level (non-nested) brace expansion.
 */
function extractBraces(pattern: string): {
  replaced: string;
  sentinels: Map<string, string>;
} {
  let counter = 0;
  const sentinels = new Map<string, string>();

  const replaced = pattern.replace(
    /\{([^}]+)\}/g,
    (_, alternatives: string) => {
      const parts = alternatives.split(',').map((s: string) => s.trim());
      const key = `<!BRACE_${counter++}!>`;
      sentinels.set(key, `(${parts.join('|')})`);
      return key;
    },
  );

  return { replaced, sentinels };
}

/**
 * Converts a glob pattern to a regular expression.
 * Supports: `*` (single segment), `**` (recursive), `?` (single char),
 * `{a,b}` (brace expansion / alternation)
 */
export function globToRegex(pattern: string): RegExp {
  // 1. Extract brace groups into sentinels before escaping
  const { replaced, sentinels } = extractBraces(pattern);

  let regexPattern = replaced
    // Escape ALL regex specials (parens, pipes, etc. are now safe inside sentinels)
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\?/g, '[^/]')
    .replace(/\*\*/g, '<!DOUBLESTAR!>')
    .replace(/\*/g, '[^/]*')
    .replace(/<!DOUBLESTAR!>/g, '.*');

  // 2. Restore brace sentinels as regex alternation groups
  for (const [key, value] of sentinels) {
    regexPattern = regexPattern.replace(key, value);
  }

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
