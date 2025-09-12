import { ToolSchemaOptions } from '@push-based/models';
import { createHandler } from '../shared/utils/handler-helpers.js';
import {
  createComponentInputSchema,
  COMMON_ANNOTATIONS,
} from '../shared/models/schema-helpers.js';
import { getDeprecatedCssClasses } from './utils/deprecated-css-helpers.js';

interface DeprecatedCssClassesOptions {
  componentName: string;
}

export const getDeprecatedCssClassesSchema: ToolSchemaOptions = {
  name: 'get-deprecated-css-classes',
  description: `List deprecated CSS classes for a DS component.`,
  inputSchema: createComponentInputSchema(
    'The class name of the component to get deprecated classes for (e.g., DsButton)',
  ),
  annotations: {
    title: 'Get Deprecated CSS Classes',
    ...COMMON_ANNOTATIONS.readOnly,
  },
};

export const getDeprecatedCssClassesHandler = createHandler<
  DeprecatedCssClassesOptions,
  string[]
>(
  getDeprecatedCssClassesSchema.name,
  async ({ componentName }, { cwd, deprecatedCssClassesPath }) => {
    if (!deprecatedCssClassesPath) {
      throw new Error(
        'Missing ds.deprecatedCssClassesPath. Provide --ds.deprecatedCssClassesPath in mcp.json file.',
      );
    }
    return getDeprecatedCssClasses(
      componentName,
      deprecatedCssClassesPath,
      cwd,
    );
  },
  (result) => result,
);

export const getDeprecatedCssClassesTools = [
  {
    schema: getDeprecatedCssClassesSchema,
    handler: getDeprecatedCssClassesHandler,
  },
];
