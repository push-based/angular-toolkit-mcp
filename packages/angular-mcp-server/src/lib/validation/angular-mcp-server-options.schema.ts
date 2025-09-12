import { z } from 'zod';
import * as path from 'path';

const isAbsolutePath = (val: string) => path.isAbsolute(val);
const isRelativePath = (val: string) => !path.isAbsolute(val);

export const AngularMcpServerOptionsSchema = z.object({
  workspaceRoot: z.string().refine(isAbsolutePath, {
    message:
      'workspaceRoot must be an absolute path to the repository root where MCP server is working (e.g., /path/to/workspace-root)',
  }),
  ds: z.object({
    storybookDocsRoot: z
      .string()
      .optional()
      .refine((val) => val === undefined || isRelativePath(val), {
        message:
          'ds.storybookDocsRoot must be a relative path from workspace root to the storybook project root (e.g., path/to/storybook/components)',
      }),
    deprecatedCssClassesPath: z
      .string()
      .optional()
      .refine((val) => val === undefined || isRelativePath(val), {
        message:
          'ds.deprecatedCssClassesPath must be a relative path from workspace root to the file component to deprecated css classes mapping (e.g., path/to/components-config.js)',
      }),
    uiRoot: z.string().refine(isRelativePath, {
      message:
        'ds.uiRoot must be a relative path from workspace root to the components folder (e.g., path/to/components)',
    }),
  }),
});

export type AngularMcpServerOptions = z.infer<
  typeof AngularMcpServerOptionsSchema
>;
