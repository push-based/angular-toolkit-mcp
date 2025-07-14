import { PromptSchema } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

/**
 * Registry of available prompts for the Angular MCP server.
 *
 * This registry is currently empty but provides the infrastructure
 * for future prompt implementations. Prompts allow LLMs to request
 * structured text generation with specific parameters.
 *
 * When adding prompts:
 * 1. Add the prompt schema to PROMPTS with name, description, and arguments
 * 2. Add the corresponding implementation to PROMPTS_IMPL
 *
 * Example implementation:
 * ```typescript
 * PROMPTS['component-docs'] = {
 *   name: 'component-docs',
 *   description: 'Generate documentation for Angular components',
 *   arguments: [
 *     {
 *       name: 'componentName',
 *       description: 'Name of the component to document',
 *       required: true,
 *     },
 *   ],
 * };
 *
 * PROMPTS_IMPL['component-docs'] = {
 *   text: (args) => `Generate docs for ${args.componentName}...`,
 * };
 * ```
 */
export const PROMPTS: Record<string, z.infer<typeof PromptSchema>> = {
  // Future prompts will be added here
} as const;

export const PROMPTS_IMPL: Record<
  string,
  { text: (args: Record<string, string>) => string }
> = {
  // Future prompt implementations will be added here
} as const;
