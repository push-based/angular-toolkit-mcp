import { dsComponentCoveragePlugin } from './lib/ds-component-coverage.plugin';
export {
  runnerFunction,
  type CreateRunnerConfig,
} from './lib/runner/create-runner';
export {
  dsComponentCoveragePlugin,
  type DsComponentUsagePluginConfig,
} from './lib/ds-component-coverage.plugin';
export { getAngularDsUsageCategoryRefs } from './lib/utils';
export { ANGULAR_DS_USAGE_PLUGIN_SLUG } from './lib/constants';
export default dsComponentCoveragePlugin;
export type {
  ComponentReplacement,
  ComponentReplacementSchema,
} from './lib/runner/audits/ds-coverage/schema';
export { ComponentCoverageRunnerOptionsSchema } from './lib/runner/schema';
