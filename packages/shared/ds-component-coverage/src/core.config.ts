import { CoreConfig, CategoryConfig } from '@push-based/models';
import {
  dsComponentCoveragePlugin,
  type DsComponentUsagePluginConfig,
} from './lib/ds-component-coverage.plugin.js';
import { getAngularDsUsageCategoryRefs } from './lib/utils.js';

export const coreConfig: CoreConfig<DsComponentUsagePluginConfig> = {
  meta: {
    title: 'Design System Coverage',
  },
  categories: [
    {
      id: 'ds-coverage',
      title: 'DS Coverage',
      refs: getAngularDsUsageCategoryRefs([
        { componentName: 'DsButton', deprecatedCssClasses: ['btn'] },
      ]),
    } satisfies CategoryConfig,
  ],
  plugins: [
    {
      module: () => dsComponentCoveragePlugin,
      config: { directory: '' },
    },
  ],
};
