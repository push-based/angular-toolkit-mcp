import { Issue } from '@push-based/models';
import { Asset } from '@push-based/angular-ast-utils';
import { type Root } from 'postcss';
import { ComponentReplacement } from './schema.js';
import { visitEachStyleNode } from '@push-based/styles-ast-utils';
import { createClassDefinitionVisitor } from './class-definition.visitor.js';

export async function getClassDefinitionIssues(
  componentReplacement: ComponentReplacement,
  style: Asset<Root>,
): Promise<Issue[]> {
  const stylesVisitor = createClassDefinitionVisitor(
    componentReplacement,
    style.startLine,
  );
  const ast = (await style.parse()).root as unknown as Root;
  visitEachStyleNode(ast.nodes, stylesVisitor);

  return stylesVisitor.getIssues();
}
