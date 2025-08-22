import { Node } from 'postcss';
import {
  PLURALIZE_MIN_REGEX,
  PROHIBITED_CHARS_REGEX,
  STYLE_IMPORT_SELECTOR_REGEX,
} from './constants.js';
import { DiagnosticsAware, Issue } from '@push-based/models';

export function createClassDefinitionVisitor(
  componentReplacement: import('./schema.js').ComponentReplacement,
  startLine: number,
): DiagnosticsAware {
  const { componentName, deprecatedCssClasses } = componentReplacement;

  const issues: Issue[] = [];
  const dsComponentName = componentName;

  function isDeprecatedClassNameOrPlural(className: string) {
    const lowerCase = className.toLowerCase();
    return (
      deprecatedCssClasses.includes(lowerCase) ||
      PLURALIZE_MIN_REGEX.test(lowerCase)
    );
  }

  function getSpecialCharacter(className: string): string | null {
    const match = className.match(PROHIBITED_CHARS_REGEX);
    return match?.[0] ?? null;
  }

  function pushSelectorIssue(value: string, position?: Node['source']) {
    issues.push({
      message: `Avoid using the class name/selector "${value}" use the DS component "${dsComponentName}" instead!`,
      source: getSource(position),
      severity: 'warning',
    });
  }

  function pushImportIssue(path: string, position?: Node['source']) {
    issues.push({
      message: `Replace style variable/mixin import from path "${path}" with DesignSystem component usage "${dsComponentName}"`,
      source: getSource(position),
      severity: 'warning',
    });
  }

  function getSource(position?: Node['source']) {
    const start = position?.start?.line ?? 0;
    return {
      file: position?.input.file ?? '',
      position: {
        startLine: startLine + (start - 1),
        startColumn: position?.start?.column ?? 0,
      },
    } satisfies Issue['source'];
  }

  return {
    getIssues: () => issues,
    clear: () => {
      issues.length = 0;
    },
    // CSS visitor compatibility
    visitRule: (rule: any) => {
      for (const className of String(rule.selector ?? '').split(/\s+/)) {
        const clean = className.replace(/^\./, '');
        if (
          isDeprecatedClassNameOrPlural(clean) ||
          getSpecialCharacter(clean)
        ) {
          pushSelectorIssue(clean, rule.source);
        }
      }
    },
    visitAtRule: (rule: any) => {
      if (STYLE_IMPORT_SELECTOR_REGEX.test(String(rule.params ?? ''))) {
        pushImportIssue(rule.params, rule.source);
      }
    },
  } as unknown as DiagnosticsAware;
}
