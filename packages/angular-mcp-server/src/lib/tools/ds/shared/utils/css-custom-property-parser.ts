import * as fs from 'node:fs';

import { CSS_CUSTOM_PROPERTY_REGEXES } from './regex-helpers.js';

export interface CssCustomPropertyParserOptions {
  /** When set, only extract properties whose name starts with this prefix */
  propertyPrefix?: string | null;
}

/**
 * Extracts CSS custom property declarations from CSS content string.
 * Strips comments, extracts `--*` declarations via regex, optionally filters by `propertyPrefix`.
 */
export function extractCustomPropertiesFromContent(
  content: string,
  options?: CssCustomPropertyParserOptions,
): Map<string, string> {
  const result = new Map<string, string>();

  // Strip CSS comments
  const stripped = content.replace(CSS_CUSTOM_PROPERTY_REGEXES.COMMENT, '');

  // Extract custom property declarations
  const regex = new RegExp(
    CSS_CUSTOM_PROPERTY_REGEXES.DECLARATION.source,
    CSS_CUSTOM_PROPERTY_REGEXES.DECLARATION.flags,
  );

  let match: RegExpExecArray | null;
  while ((match = regex.exec(stripped)) !== null) {
    const name = match[1];
    const value = match[2].trim();
    const prefix = options?.propertyPrefix;

    if (prefix != null && !name.startsWith(prefix)) {
      continue;
    }

    result.set(name, value);
  }

  return result;
}

/**
 * Extracts CSS custom property declarations from a CSS file.
 * Returns a Map<string, string> of property name → resolved value.
 * Returns an empty Map if the file cannot be read.
 */
export function parseCssCustomProperties(
  filePath: string,
  options?: CssCustomPropertyParserOptions,
): Map<string, string> {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return extractCustomPropertiesFromContent(content, options);
  } catch {
    return new Map();
  }
}
