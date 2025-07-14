import { ToolSchemaOptions } from '@push-based/models';

export const lintChangesSchema: ToolSchemaOptions = {
  name: 'lint-changes',
  description:
    'Lint changed Angular files using ESLint rules. The tool automatically resolves an ESLint config by walking up the directory tree when none is supplied.',
  inputSchema: {
    type: 'object',
    properties: {
      directory: {
        type: 'string',
        description: 'Root directory under which components live.',
      },
      files: {
        type: 'array',
        items: { type: 'string' },
        description: 'Optional list of changed files relative to "directory".',
      },
      configPath: {
        type: 'string',
        description:
          'Optional path to specific ESLint config file. If not provided, walks up directory tree to find config.',
      },
    },
    required: ['directory'],
  },
  annotations: {
    title: 'Lint Changes',
    readOnlyHint: true,
    openWorldHint: false,
    idempotentHint: true,
  },
};
