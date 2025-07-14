import { ToolSchemaOptions } from '@push-based/models';

export const baseToolsSchema: ToolSchemaOptions = {
  name: 'base_tools',
  description: 'Base tools for Angular MCP server',
  inputSchema: {
    type: 'object',
    properties: {
      cwd: {
        type: 'string',
        description: 'The current working directory e.g. repository root',
      },
      workspaceRoot: {
        type: 'string',
        description: 'The absolute path to the workspace root directory',
      },
      verbose: {
        type: 'boolean',
        description: 'Enable verbose logging',
      },
    },
    required: ['cwd'],
  },
};

export type CliArguments = {
  cwd: string;
  workspaceRoot: string;
  verbose?: string;
  [key: string]: unknown;
};
