import { PluginConfig } from '@push-based/models';
import { CreateRunnerConfig, runnerFunction } from './runner/create-runner.js';
import { getAudits } from './utils.js';
import { ANGULAR_DS_USAGE_PLUGIN_SLUG } from './constants.js';

export type DsComponentUsagePluginConfig = CreateRunnerConfig;

/**
 * Plugin to measure and assert usage of DesignSystem components in an Angular project.
 * It will check if the there are class names in the project that should get replaced by a DesignSystem components.
 *
 * @param options
 */
export function dsComponentCoveragePlugin(
  options: DsComponentUsagePluginConfig,
): PluginConfig {
  return {
    slug: ANGULAR_DS_USAGE_PLUGIN_SLUG,
    title: 'Angular Design System Coverage',
    icon: 'angular',
    description:
      'A plugin to measure and assert usage of styles in an Angular project.',
    audits: getAudits(options.dsComponents),
    runner: () => runnerFunction(options),
  } as const;
}

export default dsComponentCoveragePlugin;
