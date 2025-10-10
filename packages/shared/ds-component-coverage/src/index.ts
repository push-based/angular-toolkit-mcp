import { dsComponentCoveragePlugin } from './lib/ds-component-coverage.plugin.js';
export {
  runnerFunction,
  type CreateRunnerConfig,
} from './lib/runner/create-runner.js';
export {
  dsComponentCoveragePlugin,
  type DsComponentUsagePluginConfig,
} from './lib/ds-component-coverage.plugin.js';
export { getAngularDsUsageCategoryRefs } from './lib/utils.js';
export { ANGULAR_DS_USAGE_PLUGIN_SLUG } from './lib/constants.js';
export default dsComponentCoveragePlugin;
export type {
  ComponentReplacement,
  ComponentReplacementSchema,
} from './lib/runner/audits/ds-coverage/schema.js';
export { ComponentCoverageRunnerOptionsSchema } from './lib/runner/schema.js';
