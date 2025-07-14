import { Asset, visitEachTmplChild } from '@push-based/angular-ast-utils';
import { ComponentReplacement } from './schema';
import { ClassUsageVisitor } from './class-usage.visitor';
import type {
  ParsedTemplate,
  TmplAstNode,
} from '@angular/compiler' with { 'resolution-mode': 'import' };

export async function getClassUsageIssues(
  componentReplacement: ComponentReplacement,
  asset: Asset<ParsedTemplate>,
) {
  const visitor = new ClassUsageVisitor(componentReplacement, asset.startLine);
  const parsedTemplate = await asset.parse();
  visitEachTmplChild(parsedTemplate.nodes as TmplAstNode[], visitor);

  return visitor.getIssues();
}
