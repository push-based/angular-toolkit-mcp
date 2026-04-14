import { z } from 'zod';
import * as path from 'path';

const isAbsolutePath = (val: string) => path.isAbsolute(val);
const isRelativePath = (val: string) => !path.isAbsolute(val);

export const TokensConfigSchema = z
  .object({
    filePattern: z.string().default('**/semantic.css'),
    propertyPrefix: z.string().nullable().default(null),
    /**
     * How directory structure under generatedStylesRoot maps to token scope metadata.
     * - 'flat': All token files are treated as a single set. Tokens get no scope metadata (scope: {}).
     *   Use when tokens are not organised by brand or theme.
     * - 'brand-theme': Path segments relative to generatedStylesRoot are mapped to scope keys.
     *   First segment → 'brand', second segment → 'theme'.
     *   Example: generatedStylesRoot/acme/dark/semantic.css → scope: { brand: 'acme', theme: 'dark' }.
     *   Use when tokens are organised in a {brand}/{theme}/ directory layout.
     */
    scopeStrategy: z.enum(['flat', 'brand-theme']).default('flat'),
    categoryInference: z
      .enum(['by-prefix', 'by-value', 'none'])
      .default('by-prefix'),
    categoryPrefixMap: z.record(z.string(), z.string()).default({
      color: '--semantic-color',
      spacing: '--semantic-spacing',
      radius: '--semantic-radius',
      typography: '--semantic-typography',
      size: '--semantic-size',
      opacity: '--semantic-opacity',
    }),
  })
  .default({});

export type TokensConfig = z.infer<typeof TokensConfigSchema>;

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
    generatedStylesRoot: z
      .string()
      .optional()
      .refine((val) => val === undefined || isRelativePath(val), {
        message:
          'ds.generatedStylesRoot must be a relative path from workspace root',
      }),
    tokens: TokensConfigSchema,
  }),
});

export type AngularMcpServerOptions = z.infer<
  typeof AngularMcpServerOptionsSchema
>;
