import { AuditOutputs } from '@push-based/models';
import { parseAngularUnit } from '@push-based/angular-ast-utils';
import { dsCompCoverageAuditOutputs } from './audits/ds-coverage/ds-coverage.audit';
import { ComponentCoverageRunnerOptions } from './schema';

export type CreateRunnerConfig = ComponentCoverageRunnerOptions;

export async function runnerFunction({
  directory,
  dsComponents,
}: CreateRunnerConfig): Promise<AuditOutputs> {
  const parsedComponents = await parseAngularUnit(directory, 'component');

  return dsCompCoverageAuditOutputs(dsComponents, parsedComponents);
}
