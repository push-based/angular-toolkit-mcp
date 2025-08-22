import type {
  AST,
  ASTWithSource,
  ParsedTemplate,
  ParseSourceSpan,
} from '@angular/compiler' with { 'resolution-mode': 'import' };

import { Issue } from '@code-pushup/models';
import { Asset, ParsedComponent } from '../types.js';

/**
 * Convert a TmplAstElement to an Issue source object and adjust its position based on startLine.
 * It creates a "linkable" source object for the issue.
 * By default, the source location is 0 indexed, so we add 1 to the startLine to make it work in file links.
 *
 * @param element The element to convert.
 * @param startLine The baseline number to adjust positions.
 */
export function tmplAstElementToSource(
  {
    startSourceSpan,
    sourceSpan,
    endSourceSpan,
  }: {
    sourceSpan: ParseSourceSpan;
    startSourceSpan: ParseSourceSpan;
    endSourceSpan: ParseSourceSpan | null;
  },
  startLine = 0,
): Issue['source'] {
  const offset = startLine; // TS Ast is 0 indexed so is work in 0 based index out of the box
  return {
    file: sourceSpan.start.file.url,
    position: {
      startLine: (startSourceSpan?.start.line ?? 0) + offset + 1,
      ...(startSourceSpan?.start.col && {
        startColumn: startSourceSpan?.start.col,
      }),
      ...(endSourceSpan?.end.line !== undefined && {
        endLine: endSourceSpan?.end.line + offset + 1,
      }),
      ...(endSourceSpan?.end.col && {
        endColumn: endSourceSpan?.end.col,
      }),
    },
  };
}

export function parseClassNames(classString: string): string[] {
  return classString.trim().split(/\s+/).filter(Boolean);
}

export async function visitComponentTemplate<T>(
  component: ParsedComponent,
  visitorArgument: T,
  getIssues: (
    tokenReplacement: T,
    asset: Asset<ParsedTemplate>,
  ) => Promise<Issue[]>,
): Promise<Issue[]> {
  const { templateUrl, template } = component;

  if (templateUrl == null && template == null) {
    return [];
  }
  const componentTemplate = templateUrl ?? template;

  return getIssues(visitorArgument, componentTemplate);
}

/**
 * AST-based ngClass parser that properly detects class usage in Angular expressions
 * Handles arrays, objects, and ternary expressions to find actual class usage
 */
export function extractClassNamesFromNgClassAST(
  ast: AST,
  targetClassNames: string[],
): string[] {
  const foundClasses: string[] = [];
  const targetSet = new Set(targetClassNames);

  function visitAST(node: AST): void {
    if (!node) return;

    // Use duck typing instead of instanceof for better compatibility
    const nodeType = node.constructor.name;

    // Handle array literals: ['class1', 'class2', variable]
    if (nodeType === 'LiteralArray' && 'expressions' in node) {
      const arrayNode = node as any;
      arrayNode.expressions.forEach((expr: any) => {
        if (
          expr.constructor.name === 'LiteralPrimitive' &&
          typeof expr.value === 'string'
        ) {
          const classNames = parseClassNames(expr.value);
          classNames.forEach((className: string) => {
            if (targetSet.has(className)) {
              foundClasses.push(className);
            }
          });
        }
        visitAST(expr);
      });
    }
    // Handle object literals: { 'class1': true, 'class2': condition }
    else if (nodeType === 'LiteralMap' && 'keys' in node && 'values' in node) {
      const mapNode = node as any;
      mapNode.keys.forEach((key: any, index: number) => {
        // Handle the key structure: { key: "className", quoted: true }
        if (key && typeof key.key === 'string') {
          const classNames = parseClassNames(key.key);
          classNames.forEach((className: string) => {
            if (targetSet.has(className)) {
              foundClasses.push(className);
            }
          });
        }
        // Visit the value expression but don't extract classes from it
        // (e.g., in { 'card': option?.logo?.toLowerCase() === 'card' })
        // we don't want to extract 'card' from the comparison
        visitAST(mapNode.values[index]);
      });
    }
    // Handle string literals: 'class1 class2'
    else if (
      nodeType === 'LiteralPrimitive' &&
      'value' in node &&
      typeof (node as any).value === 'string'
    ) {
      const primitiveNode = node as any;
      const classNames = parseClassNames(primitiveNode.value);
      classNames.forEach((className: string) => {
        if (targetSet.has(className)) {
          foundClasses.push(className);
        }
      });
    }
    // Handle interpolation: "static {{ dynamic }} static"
    else if (
      nodeType === 'Interpolation' &&
      'strings' in node &&
      'expressions' in node
    ) {
      const interpolationNode = node as any;
      // Extract class names from static string parts only
      // Don't process the expressions to avoid false positives
      interpolationNode.strings.forEach((str: string) => {
        if (str && str.trim()) {
          const classNames = parseClassNames(str);
          classNames.forEach((className: string) => {
            if (targetSet.has(className)) {
              foundClasses.push(className);
            }
          });
        }
      });
      // Note: We intentionally don't visit the expressions to avoid false positives
      // from dynamic expressions like {{ someCondition ? 'card' : 'other' }}
    }
    // Handle ternary expressions: condition ? 'class1' : 'class2'
    else if (
      nodeType === 'Conditional' &&
      'trueExp' in node &&
      'falseExp' in node
    ) {
      const conditionalNode = node as any;
      // Don't visit the condition (to avoid false positives from comparisons)
      visitAST(conditionalNode.trueExp);
      visitAST(conditionalNode.falseExp);
    }
    // Handle binary expressions (avoid extracting from comparisons)
    else if (nodeType === 'Binary') {
      // For binary expressions like comparisons, we generally don't want to extract
      // class names from them to avoid false positives like 'card' in "option?.logo === 'card'"
      return;
    }
    // Handle property access: object.property
    else if (
      (nodeType === 'PropertyRead' || nodeType === 'SafePropertyRead') &&
      'receiver' in node
    ) {
      const propertyNode = node as any;
      visitAST(propertyNode.receiver);
      // Don't extract from property names
    }
    // Handle keyed access: object[key]
    else if (
      (nodeType === 'KeyedRead' || nodeType === 'SafeKeyedRead') &&
      'receiver' in node &&
      'key' in node
    ) {
      const keyedNode = node as any;
      visitAST(keyedNode.receiver);
      visitAST(keyedNode.key);
    }
    // Handle function calls: func(args)
    else if (
      (nodeType === 'Call' || nodeType === 'SafeCall') &&
      'receiver' in node &&
      'args' in node
    ) {
      const callNode = node as any;
      visitAST(callNode.receiver);
      callNode.args.forEach((arg: any) => visitAST(arg));
    }
    // Handle prefix not: !expression
    else if (nodeType === 'PrefixNot' && 'expression' in node) {
      const prefixNode = node as any;
      visitAST(prefixNode.expression);
    } else {
      const anyNode = node as any;
      if (anyNode.expressions && Array.isArray(anyNode.expressions)) {
        anyNode.expressions.forEach((expr: any) => visitAST(expr));
      }
      if (anyNode.receiver) {
        visitAST(anyNode.receiver);
      }
      if (anyNode.args && Array.isArray(anyNode.args)) {
        anyNode.args.forEach((arg: any) => visitAST(arg));
      }
      if (anyNode.left) {
        visitAST(anyNode.left);
      }
      if (anyNode.right) {
        visitAST(anyNode.right);
      }
    }
  }

  visitAST(ast);
  return Array.from(new Set(foundClasses));
}

export function ngClassContainsClass(
  astWithSource: ASTWithSource,
  className: string,
): boolean {
  const foundClasses = extractClassNamesFromNgClassAST(astWithSource.ast, [
    className,
  ]);
  return foundClasses.includes(className);
}

/**
 * Check if a class name exists in an ngClass expression string
 * This is a simplified regex-based implementation for backward compatibility
 * For more accurate AST-based parsing, use extractClassNamesFromNgClassAST directly
 *
 * @param source The ngClass expression source string
 * @param className The class name to search for
 * @returns true if the class name is found in the expression
 */
export function ngClassesIncludeClassName(
  source: string,
  className: string,
): boolean {
  const escaped = className.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const boundary = '[\\w$-]';
  const regex = new RegExp(`(?<!${boundary})${escaped}(?!${boundary})`);

  return regex.test(source);
}
