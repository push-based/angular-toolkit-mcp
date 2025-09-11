import { ToolSchemaOptions } from '@push-based/models';
import {
  createHandler,
  BaseHandlerOptions,
} from '../shared/utils/handler-helpers.js';
import {
  createProjectAnalysisSchema,
  COMMON_ANNOTATIONS,
} from '../shared/models/schema-helpers.js';
import { analyzeProjectDependencies } from './utils/dependencies-helpers.js';
import { validateComponentName } from '../shared/utils/component-validation.js';

interface ProjectDependenciesOptions extends BaseHandlerOptions {
  directory: string;
  componentName?: string;
  workspaceRoot?: string;
  uiRoot?: string;
}

export const getProjectDependenciesSchema: ToolSchemaOptions = {
  name: 'get-project-dependencies',
  description: `
    Analyze project dependencies and detect if library is buildable/publishable.
    Checks for peer dependencies and validates import paths for DS components.
  `,
  inputSchema: createProjectAnalysisSchema({
    componentName: {
      type: 'string',
      description:
        'Optional component name to validate import path for (e.g., DsButton)',
    },
  }),
  annotations: {
    title: 'Get Project Dependencies',
    ...COMMON_ANNOTATIONS.readOnly,
  },
};

export const getProjectDependenciesHandler = createHandler<
  ProjectDependenciesOptions,
  any
>(
  getProjectDependenciesSchema.name,
  async (params, { cwd, workspaceRoot, uiRoot }) => {
    const { directory, componentName } = params;

    if (componentName) {
      validateComponentName(componentName);
    }

    return await analyzeProjectDependencies(
      cwd,
      directory,
      componentName,
      workspaceRoot,
      uiRoot,
    );
  },
  (result) => [JSON.stringify(result, null, 2)],
);

export const getProjectDependenciesTools = [
  {
    schema: getProjectDependenciesSchema,
    handler: getProjectDependenciesHandler,
  },
];
