import { CategoryConfig, CoreConfig } from '@push-based/models';
import angularDsUsagePlugin, {
  DsComponentUsagePluginConfig,
} from './lib/ds-component-coverage.plugin.js';
import { getAngularDsUsageCategoryRefs } from './lib/utils.js';

export async function dsComponentUsagePluginCoreConfig({
  directory,
  dsComponents,
}: DsComponentUsagePluginConfig) {
  return {
    plugins: [
      angularDsUsagePlugin({
        directory,
        dsComponents,
      }),
    ],
    categories: await angularDsUsagePluginCategories({ dsComponents }),
  } as const satisfies CoreConfig;
}

export async function angularDsUsagePluginCategories({
  dsComponents,
}: Pick<DsComponentUsagePluginConfig, 'dsComponents'>): Promise<
  CategoryConfig[]
> {
  return [
    {
      slug: 'design-system-usage',
      title: 'Design System Usage',
      description: 'Usage of design system components',
      refs: getAngularDsUsageCategoryRefs(dsComponents),
    },
  ];
}
