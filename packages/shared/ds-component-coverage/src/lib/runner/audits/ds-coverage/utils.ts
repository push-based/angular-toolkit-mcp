import { Audit, AuditOutput, Issue } from '@push-based/models';
import { pluralize, slugify } from '@push-based/utils';
import { ComponentReplacement } from './schema';

/**
 * Creates a scored audit output.
 * @returns Audit output.
 * @param componentReplacements
 */
export function getCompUsageAudits(
  componentReplacements: ComponentReplacement[],
): Audit[] {
  return componentReplacements.map((comp) => ({
    slug: getCompCoverageAuditSlug(comp),
    title: getCompCoverageAuditTitle(comp),
    description: getCompCoverageAuditDescription(comp),
  }));
}

/**
 * Creates a scored audit output.
 * @param componentName
 * @param issues
 * @returns Audit output.
 */
export function getCompCoverageAuditOutput(
  componentName: ComponentReplacement,
  issues: Issue[],
): AuditOutput {
  return {
    slug: getCompCoverageAuditSlug(componentName),
    displayValue: `${issues.length} ${pluralize('class', issues.length)} found`,
    score: issues.length === 0 ? 1 : 0,
    value: issues.length,
    details: {
      issues,
    },
  };
}

export function getCompCoverageAuditSlug({
  componentName,
}: ComponentReplacement): string {
  return slugify(`coverage-${componentName}`);
}
export function getCompCoverageAuditTitle({
  componentName,
}: ComponentReplacement): string {
  return `Usage coverage for ${componentName} component`;
}
export function getCompCoverageAuditDescription({
  componentName,
  deprecatedCssClasses,
}: ComponentReplacement): string {
  return `Coverage audit for ${componentName} component. Matching classes: ${deprecatedCssClasses.join(
    ', ',
  )}`;
}
