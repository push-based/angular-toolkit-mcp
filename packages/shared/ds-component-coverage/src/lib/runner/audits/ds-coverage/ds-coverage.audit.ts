import { getCompCoverageAuditOutput } from './utils';
import { AuditOutputs, Issue } from '@push-based/models';
import {
  ParsedComponent,
  visitComponentStyles,
  visitComponentTemplate,
  Asset,
} from '@push-based/angular-ast-utils';
import type { ParsedTemplate } from '@angular/compiler' with { 'resolution-mode': 'import' };
import { ComponentReplacement } from './schema';
import { getClassUsageIssues } from './class-usage.utils';
import { getClassDefinitionIssues } from './class-definition.utils';

export function dsCompCoverageAuditOutputs(
  dsComponents: ComponentReplacement[],
  parsedComponents: ParsedComponent[],
): Promise<AuditOutputs> {
  return Promise.all(
    dsComponents.map(async (dsComponent) => {
      const allIssues = (
        await Promise.all(
          parsedComponents.flatMap(async (component) => {
            return [
              ...(await visitComponentTemplate(
                component,
                dsComponent,
                getClassUsageIssues as (
                  tokenReplacement: ComponentReplacement,
                  asset: Asset<ParsedTemplate>,
                ) => Promise<Issue[]>,
              )),
              ...(await visitComponentStyles(
                component,
                dsComponent,
                getClassDefinitionIssues,
              )),
            ];
          }),
        )
      ).flat();

      return getCompCoverageAuditOutput(dsComponent, allIssues);
    }),
  );
}
