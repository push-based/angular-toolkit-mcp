import type {
  TmplAstNode,
  TmplAstVisitor,
} from '@angular/compiler' with { 'resolution-mode': 'import' };

export function visitEachTmplChild(
  nodes: TmplAstNode[],
  visitor: TmplAstVisitor<unknown>,
) {
  nodes.forEach((node) => node.visit(visitor));
}
