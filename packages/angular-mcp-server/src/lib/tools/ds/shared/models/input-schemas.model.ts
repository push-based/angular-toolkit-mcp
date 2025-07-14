import { ToolSchemaOptions } from '@push-based/models';

export const componentInputSchema = (
  description: string,
): ToolSchemaOptions['inputSchema'] => ({
  type: 'object',
  properties: {
    componentName: {
      type: 'string',
      description,
    },
  },
  required: ['componentName'],
});
