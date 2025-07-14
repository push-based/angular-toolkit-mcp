import * as ts from 'typescript';

import { QUOTE_REGEX } from './constants.js';

export function isComponentDecorator(decorator: ts.Decorator): boolean {
  return isDecorator(decorator, 'Component');
}

export function getDecorators(node: ts.Node): readonly ts.Decorator[] {
  if (ts.getDecorators) {
    return ts.getDecorators(node as ts.HasDecorators) ?? [];
  }
  if (hasDecorators(node)) {
    return node.decorators;
  }
  return [];
}

export function isDecorator(
  decorator: ts.Decorator,
  decoratorName?: string,
): boolean {
  const nodeObject = decorator?.expression as unknown as {
    expression: ts.Expression;
  };
  const identifierObject = nodeObject?.expression;

  if (identifierObject == null || !ts.isIdentifier(identifierObject))
    return false;

  if (decoratorName == null) {
    return true;
  }
  return identifierObject.text === decoratorName;
}

export function removeQuotes(node: ts.Node, sourceFile: ts.SourceFile): string {
  return node.getText(sourceFile).replace(QUOTE_REGEX, '');
}

export function hasDecorators(
  node: ts.Node,
): node is ts.Node & { decorators: readonly ts.Decorator[] } {
  return 'decorators' in node && Array.isArray(node.decorators);
}
