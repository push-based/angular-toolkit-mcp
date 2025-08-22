import { Audit, CategoryRef } from '@code-pushup/models';
import { ANGULAR_DS_USAGE_PLUGIN_SLUG } from './constants.js';
import { getCompUsageAudits } from './runner/audits/ds-coverage/utils.js';
import { ComponentReplacement } from './runner/audits/ds-coverage/schema.js';

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
