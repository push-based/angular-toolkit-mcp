import { AtRule, Comment, Container, Declaration, Rule } from 'postcss';

export type NodeType<K extends keyof CssAstVisitor> = K extends 'visitRoot'
  ? Container
  : K extends 'visitAtRule'
    ? AtRule
    : K extends 'visitRule'
      ? Rule
      : K extends 'visitDecl'
        ? Declaration
        : K extends 'visitComment'
          ? Comment
          : never;

export interface CssAstVisitor<T = void> {
  // Called once for the root node
  visitRoot?: (root: Container) => T;

  // Called for @rule nodes: @media, @charset, etc.
  visitAtRule?: (atRule: AtRule) => T;

  // Called for standard CSS rule nodes: .btn, .box, etc.
  visitRule?: (rule: Rule) => T;

  // Called for property declarations: color: red, width: 100px, etc.
  visitDecl?: (decl: Declaration) => T;

  // Called for comment nodes: /* some comment */
  visitComment?: (comment: Comment) => T;
}
