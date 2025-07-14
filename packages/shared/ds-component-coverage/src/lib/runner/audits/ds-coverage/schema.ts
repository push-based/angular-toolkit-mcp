import { z } from 'zod';

export const ComponentReplacementSchema = z.object(
  {
    componentName: z.string({
      description: 'The class name of the component to search for',
    }),
    deprecatedCssClasses: z.array(z.string(), {
      description: 'List of deprecated CSS classes for this component',
    }),
    docsUrl: z
      .string({ description: 'URL to the component documentation' })
      .optional(),
  },
  { description: 'Array of components and their deprecated CSS classes' },
);

export type ComponentReplacement = z.infer<typeof ComponentReplacementSchema>;
