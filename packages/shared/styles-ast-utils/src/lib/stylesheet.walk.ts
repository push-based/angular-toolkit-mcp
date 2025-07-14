import { Root, Rule } from 'postcss';

import { CssAstVisitor } from './stylesheet.visitor.js';
import { NodeType } from './types.js';

/**
 * Single function that traverses the AST, calling
 * specialized visitor methods as it encounters each node type.
 */
export function visitEachChild<T>(root: Root, visitor: CssAstVisitor<T>) {
  visitor.visitRoot?.(root);

  root.walk((node) => {
    const visitMethodName = `visit${
      node.type[0].toUpperCase() + node.type.slice(1)
    }` as keyof CssAstVisitor<T>;
    const visitMethod = visitor[visitMethodName] as
      | ((node: NodeType<typeof visitMethodName>) => void)
      | undefined;
    visitMethod?.(node as NodeType<typeof visitMethodName>);
  });
}

export function visitStyleSheet<T>(root: Root, visitor: CssAstVisitor<T>) {
  for (const node of root.nodes) {
    switch (node.type) {
      case 'rule':
        visitor?.visitRule?.(node);
        break;
      case 'atrule':
        visitor?.visitAtRule?.(node);
        break;
      case 'decl':
        throw new Error('visit declaration not implemented');
      // visitor?.visitDeclaration?.(node);
      case 'comment':
        visitor?.visitComment?.(node);
        break;
      default:
        throw new Error(`Unknown node type: ${(node as Root).type}`);
    }
  }
}

export function visitEachStyleNode<T>(
  nodes: Root['nodes'],
  visitor: CssAstVisitor<T>,
) {
  for (const node of nodes) {
    switch (node.type) {
      case 'rule':
        visitor?.visitRule?.(node);
        visitEachStyleNode((node as Rule).nodes, visitor);
        break;
      case 'atrule':
        visitor?.visitAtRule?.(node);
        break;
      case 'decl':
        visitor?.visitDecl?.(node);
        break;
      case 'comment':
        visitor?.visitComment?.(node);
        break;
      default:
        throw new Error(`Unknown node type: ${(node as Root).type}`);
    }
  }
}
