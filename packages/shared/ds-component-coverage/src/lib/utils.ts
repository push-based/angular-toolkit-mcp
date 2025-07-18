import { Audit, CategoryRef } from '@push-based/models';
import { ANGULAR_DS_USAGE_PLUGIN_SLUG } from './constants';
import { getCompUsageAudits } from './runner/audits/ds-coverage/utils';
import { ComponentReplacement } from './runner/audits/ds-coverage/schema';

export function getAudits(
  componentReplacements: ComponentReplacement[],
): Audit[] {
  return [...getCompUsageAudits(componentReplacements)];
}

export function getAngularDsUsageCategoryRefs(
  componentReplacements: ComponentReplacement[],
): CategoryRef[] {
  return getAudits(componentReplacements).map(({ slug }) => ({
    slug,
    plugin: ANGULAR_DS_USAGE_PLUGIN_SLUG,
    type: 'audit',
    weight: 1,
  }));
}
