import { ToolsConfig } from '@push-based/models';
import { reportViolationsTools } from './report-violations';
import { getProjectDependenciesTools } from './project/get-project-dependencies.tool';
import { reportDeprecatedCssTools } from './project/report-deprecated-css.tool';
import { buildComponentUsageGraphTools } from './component-usage-graph';
import { getDsComponentDataTools } from './component/get-ds-component-data.tool';
import { getDeprecatedCssClassesTools } from './component/get-deprecated-css-classes.tool';
import {
  buildComponentContractTools,
  diffComponentContractTools,
  listComponentContractsTools,
} from './component-contract';

export const dsTools: ToolsConfig[] = [
  // Project tools
  ...reportViolationsTools,
  ...getProjectDependenciesTools,
  ...reportDeprecatedCssTools,
  ...buildComponentUsageGraphTools,
  // Component contract tools
  ...buildComponentContractTools,
  ...diffComponentContractTools,
  ...listComponentContractsTools,
  // Component tools
  ...getDsComponentDataTools,
  ...getDeprecatedCssClassesTools,
];
