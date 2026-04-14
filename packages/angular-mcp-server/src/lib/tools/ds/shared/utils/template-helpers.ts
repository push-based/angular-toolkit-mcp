/**
 * Utilities for processing Angular HTML templates.
 * These are regex-based helpers for template analysis — not tied to the Angular compiler AST.
 */

import { escapeRegex } from '@push-based/utils';

export interface SelectorInfo {
  style: 'element' | 'attribute' | 'unknown';
  selector: string;
  note?: string;
}

/**
 * Clean a template string:
 * - Replace `${...}` interpolations with `...` placeholders
 * - Remove Storybook layout wrapper divs
 * - Normalize whitespace
 *
 * Returns null if the cleaned result doesn't look like valid HTML
 * (e.g., programmatically generated templates with JS fragments).
 */
export function cleanTemplate(template: string): string | null {
  let t = template;

  // Replace argsToTemplate(args) with a meaningful marker before generic replacement
  t = t.replace(/\$\{argsToTemplate\([^)]*\)\}/g, '[all-meta-args-bound]');

  // Replace ${...} interpolations with placeholder
  t = t.replace(/\$\{[^}]*\}/g, '...');

  // Remove HTML comments
  t = t.replace(/<!--[\s\S]*?-->/g, '');

  // Remove ALL inline style attributes (storybook layout concerns, not component API)
  t = t.replace(/\s*style=["'][^"']*["']/gi, '');

  // Remove storybook layout wrapper divs (with class but layout-only) — strip opening AND closing tag
  t = t.replace(
    /<div\s+class="[^"]*(?:example-|tabgroup-)[^"]*">([\s\S]*?)<\/div>/gi,
    '$1',
  );

  // Collapse to single line: strip all newlines and excess whitespace
  t = t.replace(/\s+/g, ' ').trim();

  // Remove whitespace between tags (but not inside tags)
  t = t.replace(/>\s+</g, '><');

  // Detect programmatically generated templates (JS fragments, not HTML)
  if (!looksLikeHtml(t)) {
    return null;
  }

  return t;
}

/**
 * Check if a cleaned template string looks like valid HTML rather than
 * JS code fragments from programmatically generated templates.
 */
export function looksLikeHtml(template: string): boolean {
  // Must contain at least one HTML tag
  if (!/<\w/.test(template)) return false;

  // JS artifacts that indicate a programmatic template
  const jsArtifacts = ['.join(', '.map(', '=>', 'function ', 'return '];
  const artifactCount = jsArtifacts.filter((a) => template.includes(a)).length;
  if (artifactCount >= 2) return false;

  return true;
}

/**
 * Scan templates for `slot="name"` patterns, deduplicate and sort alphabetically.
 */
export function extractSlotsFromTemplates(templates: string[]): string[] {
  const slots = new Set<string>();
  const slotRegex = /slot="([^"]+)"/g;

  for (const template of templates) {
    let match: RegExpExecArray | null;
    while ((match = slotRegex.exec(template)) !== null) {
      slots.add(match[1]);
    }
  }

  return [...slots].sort();
}

/**
 * Detect whether a component uses attribute-style or element-style selectors.
 */
export function detectSelectorStyle(
  content: string,
  kebabName: string,
): SelectorInfo {
  // Check for attribute usage: <button ds-{name}> or <a ds-{name}>
  const attrRegex = new RegExp(
    `<(?:button|a)\\s[^>]*\\bds-${escapeRegex(kebabName)}\\b`,
    'i',
  );
  if (attrRegex.test(content)) {
    return {
      style: 'attribute',
      selector: `ds-${kebabName}`,
      note: 'Applied as attribute on `<button>` or `<a>`',
    };
  }

  // Check for element usage: <ds-{name} followed by space, >, or newline
  const elemRegex = new RegExp(
    `<ds-${escapeRegex(kebabName)}(?=[\\s>/\\[])`,
    'i',
  );
  if (elemRegex.test(content)) {
    return { style: 'element', selector: `ds-${kebabName}` };
  }

  return { style: 'unknown', selector: `ds-${kebabName}` };
}

/**
 * Detect Angular form integration patterns in templates.
 */
export function detectFormIntegration(content: string): string[] {
  const patterns: string[] = [];
  if (/\[\(ngModel\)\]/.test(content))
    patterns.push('ngModel (template-driven)');
  if (/formControlName/.test(content))
    patterns.push('formControlName (reactive forms)');
  if (/formControl[^N]/.test(content))
    patterns.push('formControl (reactive forms)');
  return patterns;
}
