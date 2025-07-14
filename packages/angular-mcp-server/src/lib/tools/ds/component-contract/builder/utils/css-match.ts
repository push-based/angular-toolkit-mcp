import {
  parseClassNames,
  ngClassesIncludeClassName,
} from '@push-based/angular-ast-utils';
import type {
  DomElement,
  Attribute,
  Binding,
} from '../../shared/models/types.js';

/**
 * Check if a CSS selector matches a DOM element with improved accuracy
 */
export function selectorMatches(
  cssSelector: string,
  domKey: string,
  element: DomElement,
): boolean {
  const normalizedSelector = cssSelector.trim();

  // Handle multiple selectors separated by commas
  if (normalizedSelector.includes(',')) {
    return normalizedSelector
      .split(',')
      .some((selector) => selectorMatches(selector, domKey, element));
  }

  // Handle descendant selectors (space-separated)
  if (normalizedSelector.includes(' ')) {
    const parts = normalizedSelector.split(/\s+/);
    const lastPart = parts[parts.length - 1];
    // Check if the element matches the last part - simplified check as full implementation
    // would need to traverse the DOM tree to check ancestors
    return matchSelector(lastPart, element);
  }

  // Handle single selector
  return matchSelector(normalizedSelector, element);
}

/**
 * Match a single CSS selector (class, id, tag, or attribute)
 */
function matchSelector(selector: string, element: DomElement): boolean {
  // Class selector (.class-name)
  if (selector.startsWith('.')) {
    return matchAttribute('class', selector.substring(1), '=', element);
  }

  // ID selector (#id-name)
  if (selector.startsWith('#')) {
    return matchAttribute('id', selector.substring(1), '=', element);
  }

  // Attribute selector ([attr], [attr=value], [attr*=value], etc.)
  if (selector.startsWith('[') && selector.endsWith(']')) {
    const content = selector.slice(1, -1);

    // Simple attribute existence check [attr]
    if (!content.includes('=')) {
      return (
        element.attributes?.some((attr: Attribute) => attr.name === content) ||
        false
      );
    }

    // Parse attribute selector with value using non-greedy split before the operator
    // This correctly captures operators like *=, ^=, $=
    const match = content.match(/^(.+?)([*^$]?=)(.+)$/);
    if (!match) return false;

    const [, attrNameRaw, operator, value] = match;
    const attrName = attrNameRaw.trim();
    return matchAttribute(attrName, stripQuotes(value), operator, element);
  }

  // Tag selector (div, span, etc.)
  return element.tag === selector;
}

/**
 * Unified attribute matching with support for classes, IDs, and general attributes
 */
function matchAttribute(
  attrName: string,
  expectedValue: string,
  operator: string,
  element: DomElement,
): boolean {
  // Special handling for class attributes
  if (attrName === 'class') {
    // Check static class attribute
    const classAttr = element.attributes?.find(
      (attr: Attribute) => attr.name === 'class',
    );
    if (classAttr) {
      const classes = parseClassNames(classAttr.source);
      if (classes.includes(expectedValue)) {
        return true;
      }
    }

    // Check class bindings [class.foo]
    const classBindings = element.bindings?.filter(
      (binding: Binding) =>
        binding.type === 'class' && binding.name === `class.${expectedValue}`,
    );

    // Check ngClass bindings
    const ngClassBindings = element.bindings?.filter(
      (binding: Binding) => binding.name === 'ngClass',
    );

    for (const binding of ngClassBindings || []) {
      if (ngClassesIncludeClassName(binding.source, expectedValue)) {
        return true;
      }
    }

    return classBindings && classBindings.length > 0;
  }

  // General attribute matching
  const attr = element.attributes?.find(
    (attr: Attribute) => attr.name === attrName,
  );
  if (!attr) return false;

  const attrValue = attr.source;
  return OPERATORS[operator]?.(attrValue, expectedValue) || false;
}

// Operator lookup table
const OPERATORS: Record<
  string,
  (attrValue: string, expectedValue: string) => boolean
> = {
  '=': (attrValue, expectedValue) => attrValue === expectedValue,
  '*=': (attrValue, expectedValue) => attrValue.includes(expectedValue),
  '^=': (attrValue, expectedValue) => attrValue.startsWith(expectedValue),
  '$=': (attrValue, expectedValue) => attrValue.endsWith(expectedValue),
};

/**
 * Remove surrounding quotes from a string
 */
function stripQuotes(str: string): string {
  return str.startsWith('"') || str.startsWith("'") ? str.slice(1, -1) : str;
}
