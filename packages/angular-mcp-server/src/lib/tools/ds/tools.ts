import { ToolsConfig } from '@push-based/models';
import {
  reportViolationsTools,
  reportAllViolationsTools,
} from './report-violations/index.js';
import { getProjectDependenciesTools } from './project/get-project-dependencies.tool.js';
import { reportDeprecatedCssTools } from './project/report-deprecated-css.tool.js';
import { buildComponentUsageGraphTools } from './component-usage-graph/index.js';
import { getDsComponentDataTools } from './component/get-ds-component-data.tool.js';
import { getDeprecatedCssClassesTools } from './component/get-deprecated-css-classes.tool.js';
import {
  buildComponentContractTools,
  diffComponentContractTools,
  listComponentContractsTools,
} from './component-contract/index.js';

export const dsTools: ToolsConfig[] = [
  // Project tools
  ...reportViolationsTools,
  ...reportAllViolationsTools,
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
