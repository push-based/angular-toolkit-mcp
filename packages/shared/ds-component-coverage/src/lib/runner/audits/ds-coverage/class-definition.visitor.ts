import { Rule } from 'postcss';
import { Issue, DiagnosticsAware } from '@push-based/models';
import {
  CssAstVisitor,
  styleAstRuleToSource,
} from '@push-based/styles-ast-utils';

import {
  EXTERNAL_ASSET_ICON,
  INLINE_ASSET_ICON,
  STYLES_ASSET_ICON,
} from './constants.js';
import { ComponentReplacement } from './schema.js';

export type ClassDefinitionVisitor = CssAstVisitor & DiagnosticsAware;

/**
 * Visits a `CssAstVisitor` that is `DiagnosticsAware`and collects the definition of deprecated class names.
 *
 * @example
 * const ast: Root = postcss.parse(`
 *   .btn {
 *     color: red;
 *   }
 * `);
 * const visitor = createClassDefinitionVisitor(ast, { deprecatedCssClasses: ['btn'] });
 * // The visitor will check each `Rule` definition for matching deprecateCssClasses
 * visitEachStyleNode(ast.nodes, visitor);
 *
 * // The visitor is `DiagnosticsAware` and xou can get the issues over a public API.
 * const issues: Issue & { coed?: number } = visitor.getIssues();
 *
 * // Subsequent usags will add to the issues.
 * // You can also clear the issues
 * visitor.clear();
 *
 * @param componentReplacement
 * @param startLine
 */
export const createClassDefinitionVisitor = (
  componentReplacement: ComponentReplacement,
  startLine = 0,
): ClassDefinitionVisitor => {
  const { deprecatedCssClasses = [] } = componentReplacement;
  let diagnostics: Issue[] = [];

  return {
    getIssues(): Issue[] {
      return diagnostics;
    },

    clear(): void {
      diagnostics = [];
    },

    visitRule(rule: Rule) {
      getMatchingClassNames(
        { selector: rule.selector },
        deprecatedCssClasses,
      ).forEach((className) => {
        const message = classUsageMessage({
          className,
          rule,
          componentName: componentReplacement.componentName,
          docsUrl: componentReplacement.docsUrl,
        });
        const isInline = rule.source?.input.file?.match(/\.ts$/) != null;
        diagnostics.push({
          message,
          severity: 'error',
          source: styleAstRuleToSource(rule, isInline ? startLine : 0),
        });
      });
    },
  };
};

function classUsageMessage({
  className,
  rule,
  componentName,
  docsUrl,
}: Pick<ComponentReplacement, 'componentName' | 'docsUrl'> & {
  className: string;
  rule: Rule;
}): string {
  const isInline = rule.source?.input.file?.match(/\.ts$/) != null;
  const iconString = `${
    isInline ? INLINE_ASSET_ICON : EXTERNAL_ASSET_ICON
  }${STYLES_ASSET_ICON}`;
  const docsLink = docsUrl
    ? ` <a href="${docsUrl}" target="_blank">Learn more</a>.`
    : '';
  return `${iconString}️ The selector's class <code>${className}</code> is deprecated. Use <code>${componentName}</code> and delete the styles.${docsLink}`;
}

export function getMatchingClassNames(
  { selector }: Pick<Rule, 'selector'>,
  targetClassNames: string[],
): string[] {
  const classNames = selector.match(/\.[\w-]+/g) || [];
  return classNames
    .map((className) => className.slice(1)) // Strip the leading "."
    .filter((className) => targetClassNames.includes(className));
}
