import { ToolSchemaOptions } from '@push-based/models';

export const buildComponentUsageGraphSchema: ToolSchemaOptions = {
  name: 'build-component-usage-graph',
  description:
    'Maps where given Angular components are imported (modules, specs, templates, styles) so refactors touch every file.',
  inputSchema: {
    type: 'object',
    properties: {
      directory: {
        type: 'string',
        description:
          'The relative path to the directory to analyze (starting with "./path/to/dir"). This should be the root directory containing the components with violations.',
      },
      violationFiles: {
        type: 'array',
        items: {
          type: 'string',
        },
        description:
          'Array of file paths with design system violations (obtained from previous report-violations calls).',
      },
    },
    required: ['directory', 'violationFiles'],
  },
  annotations: {
    title: 'Build Component Usage Graph',
    readOnlyHint: true,
    openWorldHint: false,
    idempotentHint: true,
  },
};
