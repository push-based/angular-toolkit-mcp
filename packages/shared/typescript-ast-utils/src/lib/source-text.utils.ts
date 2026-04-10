/**
 * Utilities for parsing raw TypeScript/JavaScript source text.
 * These operate on string content rather than the TypeScript AST,
 * handling constructs like template literals and balanced blocks.
 */

/**
 * Extract the content of a template literal starting at the opening backtick.
 * Handles nested `${}` expressions, inner backtick strings, and quoted strings.
 *
 * @param source - The full source text
 * @param openIdx - Index of the opening backtick character
 * @returns The template literal content (without backticks), or null if unterminated
 */
export function extractTemplateLiteral(
  source: string,
  openIdx: number,
): string | null {
  let i = openIdx + 1; // skip opening backtick
  let depth = 0;
  let result = '';

  while (i < source.length) {
    if (depth === 0 && source[i] === '`') {
      return result;
    }

    if (source[i] === '$' && i + 1 < source.length && source[i + 1] === '{') {
      depth++;
      result += '${';
      i += 2;
      continue;
    }

    if (depth > 0 && source[i] === '{') {
      depth++;
    }

    if (depth > 0 && source[i] === '}') {
      depth--;
      if (depth === 0) {
        result += '}';
        i++;
        continue;
      }
    }

    // Inside a nested expression, skip inner backtick strings
    if (depth > 0 && source[i] === '`') {
      i++;
      let innerDepth = 0;
      while (i < source.length) {
        if (innerDepth === 0 && source[i] === '`') {
          i++;
          break;
        }
        if (
          source[i] === '$' &&
          i + 1 < source.length &&
          source[i + 1] === '{'
        ) {
          innerDepth++;
          i += 2;
          continue;
        }
        if (innerDepth > 0 && source[i] === '}') {
          innerDepth--;
          i++;
          continue;
        }
        if (source[i] === '\\') i++;
        i++;
      }
      continue;
    }

    // Inside a nested expression, skip quoted strings
    if (depth > 0 && (source[i] === "'" || source[i] === '"')) {
      const q = source[i];
      i++;
      while (i < source.length && source[i] !== q) {
        if (source[i] === '\\') i++;
        i++;
      }
      i++; // skip closing quote
      continue;
    }

    result += source[i];
    i++;
  }

  return result || null;
}

/**
 * Extract a balanced `{ }` block from source text starting at or after the given position.
 * Correctly skips over string literals (backtick, single-quote, double-quote) to avoid
 * miscounting braces inside strings.
 *
 * @param source - The full source text
 * @param openIdx - Index at or before the opening `{`
 * @returns The balanced block including braces, or null if not found/unbalanced
 */
export function extractBalancedBlock(
  source: string,
  openIdx: number,
): string | null {
  let depth = 0;
  let i = openIdx;

  while (i < source.length && source[i] !== '{') i++;
  if (i >= source.length) return null;

  const start = i;
  for (; i < source.length; i++) {
    if (source[i] === '{') depth++;
    else if (source[i] === '}') {
      depth--;
      if (depth === 0) return source.slice(start, i + 1);
    }

    // Skip string literals
    if (source[i] === '`') {
      i++;
      while (i < source.length && source[i] !== '`') {
        if (source[i] === '\\') i++;
        i++;
      }
    } else if (source[i] === "'" || source[i] === '"') {
      const quote = source[i];
      i++;
      while (i < source.length && source[i] !== quote) {
        if (source[i] === '\\') i++;
        i++;
      }
    }
  }
  return null;
}
