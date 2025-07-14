import { ToolSchemaOptions } from '@push-based/models';

/**
 * Common schema property definitions used across DS tools
 * Note: cwd and workspaceRoot are injected by MCP server configuration, not user inputs
 */
export const COMMON_SCHEMA_PROPERTIES = {
  directory: {
    type: 'string' as const,
    description:
      'The relative path to the directory (starting with "./path/to/dir") to scan. Respect the OS specifics.',
  },

  componentName: {
    type: 'string' as const,
    description: 'The class name of the component (e.g., DsButton)',
  },

  groupBy: {
    type: 'string' as const,
    enum: ['file', 'folder'] as const,
    description: 'How to group the results',
    default: 'file' as const,
  },
} as const;

/**
 * Creates a component input schema with a custom description
 */
export const createComponentInputSchema = (
  description: string,
): ToolSchemaOptions['inputSchema'] => ({
  type: 'object',
  properties: {
    componentName: {
      ...COMMON_SCHEMA_PROPERTIES.componentName,
      description,
    },
  },
  required: ['componentName'],
});

/**
 * Creates a directory + component schema for tools that analyze both
 */
export const createDirectoryComponentSchema = (
  componentDescription: string,
  additionalProperties?: Record<string, any>,
): ToolSchemaOptions['inputSchema'] => ({
  type: 'object',
  properties: {
    directory: COMMON_SCHEMA_PROPERTIES.directory,
    componentName: {
      ...COMMON_SCHEMA_PROPERTIES.componentName,
      description: componentDescription,
    },
    ...additionalProperties,
  },
  required: ['directory', 'componentName'],
});

/**
 * Creates a project analysis schema with common project properties
 * Note: cwd and workspaceRoot are handled by MCP server configuration, not user inputs
 */
export const createProjectAnalysisSchema = (
  additionalProperties?: Record<string, any>,
): ToolSchemaOptions['inputSchema'] => ({
  type: 'object',
  properties: {
    directory: COMMON_SCHEMA_PROPERTIES.directory,
    ...additionalProperties,
  },
  required: ['directory'],
});

/**
 * Creates a violation reporting schema with grouping options
 */
export const createViolationReportingSchema = (
  additionalProperties?: Record<string, any>,
): ToolSchemaOptions['inputSchema'] => ({
  type: 'object',
  properties: {
    directory: COMMON_SCHEMA_PROPERTIES.directory,
    componentName: COMMON_SCHEMA_PROPERTIES.componentName,
    groupBy: COMMON_SCHEMA_PROPERTIES.groupBy,
    ...additionalProperties,
  },
  required: ['directory', 'componentName'],
});

/**
 * Common annotation patterns for DS tools
 */
export const COMMON_ANNOTATIONS = {
  readOnly: {
    readOnlyHint: true,
    openWorldHint: true,
    idempotentHint: true,
  },
  project: {
    readOnlyHint: true,
    openWorldHint: true,
    idempotentHint: true,
  },
} as const;
