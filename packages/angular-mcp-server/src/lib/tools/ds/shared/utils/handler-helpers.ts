import {
  CallToolRequest,
  CallToolResult,
} from '@modelcontextprotocol/sdk/types.js';
import {
  validateComponentName,
  validateAndNormalizeComponentName,
} from './component-validation.js';
import { buildTextResponse, throwError } from './output.utils.js';
import * as process from 'node:process';

/**
 * Common handler options interface - includes both user inputs and MCP server injected config
 */
export interface BaseHandlerOptions {
  cwd?: string;
  directory?: string;
  componentName?: string;
  workspaceRoot?: string;
  // MCP server injected configuration
  storybookDocsRoot?: string;
  deprecatedCssClassesPath?: string;
  uiRoot?: string;
}

/**
 * Handler context with all available configuration
 */
export interface HandlerContext {
  cwd: string;
  workspaceRoot: string;
  storybookDocsRoot: string;
  deprecatedCssClassesPath: string;
  uiRoot: string;
}

/**
 * Validates common input parameters
 */
export function validateCommonInputs(params: BaseHandlerOptions): void {
  if (params.componentName) {
    validateComponentName(params.componentName);
  }

  if (params.directory && typeof params.directory !== 'string') {
    throw new Error('Directory parameter is required and must be a string');
  }
}

/**
 * Validates and normalizes common input parameters, returning normalized params
 */
export function validateAndNormalizeCommonInputs<T extends BaseHandlerOptions>(
  params: T,
): T {
  if (params.componentName) {
    params.componentName = validateAndNormalizeComponentName(
      params.componentName,
    );
  }

  if (params.directory && typeof params.directory !== 'string') {
    throw new Error('Directory parameter is required and must be a string');
  }

  return params;
}

/**
 * Sets up common environment for handlers
 */
export function setupHandlerEnvironment(
  params: BaseHandlerOptions,
): HandlerContext {
  const originalCwd = process.cwd();
  const cwd = params.cwd || originalCwd;

  if (cwd !== originalCwd) {
    process.chdir(cwd);
  }

  return {
    cwd,
    workspaceRoot: params.workspaceRoot || cwd,
    storybookDocsRoot: params.storybookDocsRoot || '',
    deprecatedCssClassesPath: params.deprecatedCssClassesPath || '',
    uiRoot: params.uiRoot || '',
  };
}

/**
 * Generic handler wrapper that provides common functionality
 */
export function createHandler<TParams extends BaseHandlerOptions, TResult>(
  toolName: string,
  handlerFn: (params: TParams, context: HandlerContext) => Promise<TResult>,
  formatResult: (result: TResult) => string[],
) {
  return async (options: CallToolRequest): Promise<CallToolResult> => {
    try {
      const params = options.params.arguments as TParams;

      validateCommonInputs(params);
      const context = setupHandlerEnvironment(params);

      const result = await handlerFn(params, context);
      const formattedLines = formatResult(result);

      return buildTextResponse(formattedLines);
    } catch (ctx) {
      return throwError(`${toolName}: ${(ctx as Error).message || ctx}`);
    }
  };
}

/**
 * Common result formatters
 */
export const RESULT_FORMATTERS = {
  /**
   * Formats a simple success message
   */
  success: (message: string): string[] => [message],

  /**
   * Formats a list of items
   */
  list: (items: string[], title?: string): string[] =>
    title ? [title, ...items.map((item) => `  - ${item}`)] : items,

  /**
   * Formats key-value pairs
   */
  keyValue: (pairs: Record<string, any>): string[] =>
    Object.entries(pairs).map(
      ([key, value]) =>
        `${key}: ${typeof value === 'object' ? JSON.stringify(value, null, 2) : value}`,
    ),

  /**
   * Formats errors with context
   */
  error: (error: string, context?: string): string[] =>
    context ? [`Error in ${context}:`, `  ${error}`] : [`Error: ${error}`],

  /**
   * Formats empty results
   */
  empty: (entityType: string): string[] => [`No ${entityType} found`],
} as const;
