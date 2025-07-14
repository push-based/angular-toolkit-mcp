import { z } from 'zod';
import { ComponentReplacementSchema } from './audits/ds-coverage/schema';

export const baseToolsSchema = {
  inputSchema: {
    type: 'object' as const,
    properties: {
      cwd: z
        .string({ description: 'The current working directory' })
        .optional(),
      tsconfig: z
        .string({
          description: 'The absolute path to a TypeScript config file',
        })
        .optional(),
      verbose: z.boolean({ description: 'More verbose output' }).optional(),
      progress: z.boolean({ description: 'Show progress bar' }).optional(),
    },
    required: [] as string[],
  },
};

export const ComponentCoverageRunnerOptionsSchema = z.object({
  directory: z
    .string({ description: 'The directory to run the task in' })
    .default('.'),
  dsComponents: z.array(ComponentReplacementSchema, {
    description: 'Array of components and their deprecated CSS classes',
  }),
});

export type ComponentCoverageRunnerOptions = z.infer<
  typeof ComponentCoverageRunnerOptionsSchema
>;
