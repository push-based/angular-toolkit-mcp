import { CallToolResult, ToolSchema } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import {
  CallToolResultSchema,
  CallToolRequest,
} from '@modelcontextprotocol/sdk/types.js';

export type ToolSchemaOptions = z.infer<typeof ToolSchema>;
export type ToolHandlerContentResult = z.infer<
  typeof CallToolResultSchema
>['content'][number];

export type ToolsConfig = {
  schema: ToolSchemaOptions;
  handler: (o: CallToolRequest) => Promise<CallToolResult>;
};
