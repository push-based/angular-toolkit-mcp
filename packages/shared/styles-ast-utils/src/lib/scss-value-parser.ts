import fs from 'node:fs';
import { Declaration, Root, Rule } from 'postcss';

import { parseStylesheet } from './stylesheet.parse.js';
import { visitEachChild } from './stylesheet.walk.js';

/**
 * Classification of a CSS property entry:
 * - `declaration`: property name starts with the configured componentTokenPrefix (token declaration)
 * - `consumption`: value contains a `var(--*)` reference (token consumption)
 * - `plain`: neither a declaration nor a consumption
 */
export type ScssClassification = 'declaration' | 'consumption' | 'plain';

/**
 * Represents a single CSS property-value pair extracted from an SCSS file,
 * along with its resolved selector path and classification.
 */
export interface ScssPropertyEntry {
  /** CSS property name, e.g. 'color' or '--ds-button-bg' */
  property: string;
  /** CSS value, e.g. 'var(--semantic-color-primary)' */
  value: string;
  /** 1-based line number in the source file */
  line: number;
  /** Full selector path, e.g. ':host .button' */
  selector: string;
  /** Classification of this entry */
  classification: ScssClassification;
}

/**
 * Result of parsing an SCSS file, containing all extracted property entries
 * and query methods for filtering.
 */
export interface ScssParseResult {
  /** All extracted property entries */
  entries: ScssPropertyEntry[];
  /** Get entries for a specific selector */
  getBySelector(selector: string): ScssPropertyEntry[];
  /** Get only token declarations */
  getDeclarations(): ScssPropertyEntry[];
  /** Get only token consumptions */
  getConsumptions(): ScssPropertyEntry[];
}

/**
 * Options for the SCSS Value Parser.
 */
export interface ScssValueParserOptions {
  /** Prefix for component token declarations. Default: '--ds-' */
  componentTokenPrefix?: string;
}

const DEFAULT_COMPONENT_TOKEN_PREFIX = '--ds-';
const VAR_REFERENCE_PATTERN = /var\(\s*--[\w-]+/;

/**
 * Resolves the full selector path for a PostCSS Declaration node
 * by walking up through parent Rule nodes.
 * Handles nested selectors, `::ng-deep`, and `:host`.
 */
function resolveSelector(node: Declaration): string {
  const selectors: string[] = [];
  let current = node.parent;

  while (current && current.type === 'rule') {
    selectors.unshift((current as Rule).selector);
    current = current.parent;
  }

  return selectors.join(' ') || ':root';
}

/**
 * Classifies a CSS property-value pair based on the configured prefix.
 *
 * - `declaration`: property name starts with componentTokenPrefix
 * - `consumption`: value contains a `var(--*)` reference
 * - `plain`: neither
 */
function classifyEntry(
  property: string,
  value: string,
  componentTokenPrefix: string,
): ScssClassification {
  if (property.startsWith(componentTokenPrefix)) {
    return 'declaration';
  }
  if (VAR_REFERENCE_PATTERN.test(value)) {
    return 'consumption';
  }
  return 'plain';
}

/**
 * Creates a ScssParseResult with query methods from a list of entries.
 */
function createParseResult(entries: ScssPropertyEntry[]): ScssParseResult {
  return {
    entries,
    getBySelector(selector: string): ScssPropertyEntry[] {
      return entries.filter((e) => e.selector === selector);
    },
    getDeclarations(): ScssPropertyEntry[] {
      return entries.filter((e) => e.classification === 'declaration');
    },
    getConsumptions(): ScssPropertyEntry[] {
      return entries.filter((e) => e.classification === 'consumption');
    },
  };
}

/**
 * Parses SCSS content string and extracts CSS property-value pairs per selector.
 * Uses PostCSS AST via `parseStylesheet()` and `visitEachChild()`.
 */
export async function parseScssContent(
  content: string,
  filePath: string,
  options?: ScssValueParserOptions,
): Promise<ScssParseResult> {
  const componentTokenPrefix =
    options?.componentTokenPrefix ?? DEFAULT_COMPONENT_TOKEN_PREFIX;
  const entries: ScssPropertyEntry[] = [];

  const result = parseStylesheet(content, filePath);
  const root = result.root as Root;

  visitEachChild(root, {
    visitDecl(decl: Declaration) {
      const selector = resolveSelector(decl);
      const property = decl.prop;
      const value = decl.value;
      const line = decl.source?.start?.line ?? 0;
      const classification = classifyEntry(
        property,
        value,
        componentTokenPrefix,
      );

      entries.push({ property, value, line, selector, classification });
    },
  });

  return createParseResult(entries);
}

/**
 * Parses an SCSS file and extracts CSS property-value pairs per selector.
 * Reads the file from disk and delegates to `parseScssContent`.
 */
export async function parseScssValues(
  filePath: string,
  options?: ScssValueParserOptions,
): Promise<ScssParseResult> {
  const content = fs.readFileSync(filePath, 'utf-8');
  return parseScssContent(content, filePath, options);
}
