import { ToolSchemaOptions } from '@push-based/models';

export const reportViolationsSchema: ToolSchemaOptions = {
  name: 'report-violations',
  description: `Report deprecated DS CSS usage in a directory with configurable grouping format.`,
  inputSchema: {
    type: 'object',
    properties: {
      directory: {
        type: 'string',
        description:
          'The relative path the directory (starting with "./path/to/dir" avoid big folders.)  to run the task in starting from CWD. Respect the OS specifics.',
      },
      componentName: {
        type: 'string',
        description:
          'The class name of the component to search for (e.g., DsButton)',
      },
      groupBy: {
        type: 'string',
        enum: ['file', 'folder'],
        description: 'How to group the violation results',
        default: 'file',
      },
    },
    required: ['directory', 'componentName'],
  },
  annotations: {
    title: 'Report Violations',
    readOnlyHint: true,
    openWorldHint: false,
    idempotentHint: false,
  },
};
