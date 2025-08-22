import {
  createHandler,
  BaseHandlerOptions,
} from './shared/utils/handler-helpers.js';
import { ToolSchemaOptions } from '@push-based/models';
import { dsComponentCoveragePlugin } from '@push-based/ds-component-coverage';
import { baseToolsSchema } from '../schema.js';
import { join } from 'node:path';
import { reportViolationsTools } from './report-violations/index.js';

export const componentCoverageToolsSchema: ToolSchemaOptions = {
  name: 'ds_component-coverage',
  description:
    'Migration report. Search for deprecated CSS classes in a component. List available options with the tool `ds_list-options',
  inputSchema: {
    type: 'object',
    properties: {
      ...baseToolsSchema.inputSchema.properties,
      directory: {
        type: 'string',
        description:
          'The relative path the directory (starting with "./path/to/dir" avoid big folders.)  to run the task in starting from CWD. Respect the OS specifics.',
      },
      dsComponents: {
        type: 'array',
        items: {
          type: 'object',
          required: ['componentName', 'deprecatedCssClasses'],
          properties: {
            componentName: {
              type: 'string',
              description: 'The class name of the component to search for',
            },
            deprecatedCssClasses: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'List of deprecated CSS classes for this component',
            },
            docsUrl: {
              type: 'string',
              description: 'URL to the component documentation',
            },
          },
        },
        description: 'Array of components and their deprecated CSS classes',
      },
    },
    required: [
      ...(baseToolsSchema.inputSchema.required as string[]),
      'directory',
      'dsComponents',
    ],
  },
  annotations: {
    title: 'Design System Component Coverage',
    readOnlyHint: true,
    openWorldHint: true,
    idempotentHint: false,
  },
};

interface ComponentCoverageOptions extends BaseHandlerOptions {
  directory: string;
  dsComponents: Array<{
    componentName: string;
    deprecatedCssClasses: string[];
    docsUrl?: string;
  }>;
}

export const componentCoverageHandler = createHandler<
  ComponentCoverageOptions,
  any
>(
  componentCoverageToolsSchema.name,
  async (params, { cwd }) => {
    const { directory, dsComponents, ...pluginOptions } = params;

    const pluginConfig = await dsComponentCoveragePlugin({
      ...pluginOptions,
      directory: join(cwd, directory),
      dsComponents,
    });

    const { executePlugin } = await import('@code-pushup/core');
    const result = await executePlugin(pluginConfig as any);
    const reducedResult = {
      ...result,
      audits: result.audits.filter(({ score }) => score < 1),
    };

    return {
      directory,
      reducedResult,
    };
  },
  (result) => {
    const output = [`List of missing DS components:`];

    output.push(`Result:\n\nBase directory: ${result.directory}`);

    result.reducedResult.audits.forEach(({ details, title }: any) => {
      const auditOutput = [`\n${title}`];
      (details?.issues ?? []).forEach(
        ({ message, source }: any, index: number) => {
          if (index === 0) {
            auditOutput.push(message.replace(result.directory + '/', ''));
          }
          auditOutput.push(
            `  - ${source?.file.replace(result.directory + '/', '')}#L${source?.position?.startLine}`,
          );
        },
      );
      output.push(auditOutput.join('\n'));
    });

    return [output.join('\n')];
  },
);

export const componentCoverageTools = [
  {
    schema: componentCoverageToolsSchema,
    handler: componentCoverageHandler,
  },
];

export const dsTools = [...componentCoverageTools, ...reportViolationsTools];
