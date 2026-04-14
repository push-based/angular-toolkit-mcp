import * as fs from 'node:fs';

import { parseScssContent } from './scss-value-parser.js';

export interface CssCustomPropertyParserOptions {
  /** When set, only extract properties whose name starts with this prefix */
  propertyPrefix?: string | null;
}

/**
 * Extracts CSS custom property declarations from CSS/SCSS content string.
 * Uses PostCSS AST for proper parsing — handles nesting, comments, and
 * multi-line declarations correctly.
 */
export async function extractCustomPropertiesFromContent(
  content: string,
  options?: CssCustomPropertyParserOptions,
): Promise<Map<string, string>> {
  const result = new Map<string, string>();

  const parsed = await parseScssContent(content, 'inline.css');

  for (const entry of parsed.entries) {
    if (!entry.property.startsWith('--')) continue;

    const prefix = options?.propertyPrefix;
    if (prefix != null && !entry.property.startsWith(prefix)) {
      continue;
    }

    result.set(entry.property, entry.value);
  }

  return result;
}

/**
 * Extracts CSS custom property declarations from a CSS/SCSS file.
 * Returns a Map<string, string> of property name → resolved value.
 * Returns an empty Map if the file cannot be read.
 */
export async function parseCssCustomProperties(
  filePath: string,
  options?: CssCustomPropertyParserOptions,
): Promise<Map<string, string>> {
  let content: string;
  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch {
    return new Map();
  }
  return extractCustomPropertiesFromContent(content, options);
}
