import {
  createHandler,
  BaseHandlerOptions,
} from '../shared/utils/handler-helpers.js';
import { validateAngularComponents } from './utils/component-validator.js';
import { formatResults } from './utils/result-formatter.js';
import { lintChangesSchema } from './models/schema.js';

interface LintChangesOptions extends BaseHandlerOptions {
  directory: string;
  files?: string[];
  configPath?: string;
}

export const lintChangesHandler = createHandler<LintChangesOptions, any>(
  lintChangesSchema.name,
  async (params: LintChangesOptions, { cwd }: { cwd: string }) => {
    const { directory, files, configPath } = params;

    const validationResult = await validateAngularComponents({
      directory,
      files,
      cwd,
      configPath,
    });

    return {
      issues: validationResult.issues,
      totalFiles: validationResult.totalFiles,
      cwd,
      executionTime: validationResult.executionTime,
      configSource: validationResult.configSource,
      configPath: validationResult.configPath,
    };
  },
  (result: any) => {
    const formattedResult = formatResults(
      result.issues,
      result.totalFiles,
      result.cwd,
      result.executionTime,
      result.configSource,
      result.configPath,
    );

    // Extract text content from the formatted result
    const lines: string[] = [];
    if (formattedResult.content && Array.isArray(formattedResult.content)) {
      formattedResult.content.forEach((item: any) => {
        if (item.type === 'text') {
          lines.push(item.text);
        } else {
          lines.push(JSON.stringify(item));
        }
      });
    }

    return lines;
  },
);

export const lintChangesTools = [
  {
    schema: lintChangesSchema,
    handler: lintChangesHandler,
  },
];

// Backward compatibility alias (to be removed in next major)
export const validateAngularComponentsTools = lintChangesTools;
