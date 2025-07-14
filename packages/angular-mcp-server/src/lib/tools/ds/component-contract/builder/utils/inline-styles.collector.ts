import { parseStylesheet, visitEachChild } from '@push-based/styles-ast-utils';
import { selectorMatches } from './css-match.js';
import type {
  StyleDeclarations,
  DomStructure,
} from '../../shared/models/types.js';
import type { Declaration, Rule } from 'postcss';
import type { ParsedComponent } from '@push-based/angular-ast-utils';

/**
 * Collect style rules declared inline via the `styles` property of an
 * `@Component` decorator and map them to the DOM snapshot that comes from the
 * template.
 */
export async function collectInlineStyles(
  component: ParsedComponent,
  dom: DomStructure,
): Promise<StyleDeclarations> {
  const styles: StyleDeclarations = {
    // Inline styles logically live in the component TS file
    sourceFile: component.fileName,
    rules: {},
  };

  if (!component.styles || component.styles.length === 0) {
    return styles;
  }

  // Combine all inline style strings into one CSS blob
  const cssText = (
    await Promise.all(component.styles.map((asset) => asset.parse()))
  )
    .map((root) => root.toString())
    .join('\n');

  if (!cssText.trim()) {
    return styles;
  }

  const parsed = parseStylesheet(cssText, component.fileName);
  if (parsed.root.type !== 'root') {
    return styles;
  }

  visitEachChild(parsed.root, {
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

  return styles;
}

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
