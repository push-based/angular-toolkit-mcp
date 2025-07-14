import { readFileSync } from 'node:fs';
import { parseStylesheet, visitEachChild } from '@push-based/styles-ast-utils';
import { selectorMatches } from './css-match.js';
import type {
  StyleDeclarations,
  DomStructure,
} from '../../shared/models/types.js';
import type { Declaration, Rule } from 'postcss';

/**
 * Collect styles with explicit DOM relationships
 */
export async function collectStylesV2(
  scssPath: string,
  dom: DomStructure,
): Promise<StyleDeclarations> {
  const styles: StyleDeclarations = { sourceFile: scssPath, rules: {} };
  const scssContent = readFileSync(scssPath, 'utf-8');
  const parsedStyles = parseStylesheet(scssContent, scssPath);

  if (parsedStyles.root.type === 'root') {
    visitEachChild(parsedStyles.root, {
      visitRule: (rule: Rule) => {
        const properties: Record<string, string> = {};

        rule.walkDecls?.((decl: Declaration) => {
          properties[decl.prop] = decl.value;
        });

        styles.rules[rule.selector] = {
          appliesTo: findMatchingDomElements(rule.selector, dom),
          properties,
        };
      },
    });
  }

  return styles;
}

/**
 * Find DOM elements that match a CSS selector
 */
function findMatchingDomElements(
  cssSelector: string,
  dom: DomStructure,
): string[] {
  return Object.entries(dom)
    .filter(([domKey, element]) =>
      selectorMatches(cssSelector, domKey, element),
    )
    .map(([domKey]) => domKey);
}
