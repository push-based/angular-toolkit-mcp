import { ToolSchemaOptions } from '@push-based/models';
import { createHandler } from '../shared/utils/handler-helpers.js';
import {
  createComponentInputSchema,
  COMMON_ANNOTATIONS,
} from '../shared/models/schema-helpers.js';
import { getComponentPathsInfo } from './utils/paths-helpers.js';
import { getComponentDocPathsForName } from './utils/doc-helpers.js';
import { validateComponentName } from '../shared/utils/component-validation.js';
import { resolveCrossPlatformPath } from '../shared/utils/cross-platform-path.js';
import * as fs from 'fs';
import * as path from 'path';

interface DsComponentDataOptions {
  componentName: string;
}

export const getDsComponentDataToolSchema: ToolSchemaOptions = {
  name: 'get-ds-component-data',
  description: `Return comprehensive data for a DS component including implementation files, documentation files, and import path.`,
  inputSchema: createComponentInputSchema(
    'The class name of the component to get data for (e.g., DsBadge)',
  ),
  annotations: {
    title: 'Get Design System Component Data',
    ...COMMON_ANNOTATIONS.readOnly,
  },
};

function getAllFilesInDirectory(dirPath: string): string[] {
  const files: string[] = [];
  const allowedExtensions = ['.html', '.ts', '.scss', '.sass', '.less', '.css'];

  function walkDirectory(currentPath: string) {
    try {
      const items = fs.readdirSync(currentPath);

      for (const item of items) {
        const fullPath = path.join(currentPath, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          walkDirectory(fullPath);
        } else {
          const ext = path.extname(fullPath).toLowerCase();
          if (allowedExtensions.includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    } catch {
    }
  }

  if (fs.existsSync(dirPath)) {
    walkDirectory(dirPath);
  }

  return files;
}

export const getDsComponentDataHandler = createHandler<
  DsComponentDataOptions,
  any
>(
  getDsComponentDataToolSchema.name,
  async ({ componentName }, { cwd, uiRoot, storybookDocsRoot }) => {
    try {
      validateComponentName(componentName);

      const pathsInfo = getComponentPathsInfo(componentName, uiRoot, cwd);

      const srcFiles = getAllFilesInDirectory(pathsInfo.srcPath);
      const implementationFiles = srcFiles.map((file) => `file://${file}`);

      const docsBasePath = resolveCrossPlatformPath(cwd, storybookDocsRoot);
      const docPaths = getComponentDocPathsForName(docsBasePath, componentName);

      const documentationFiles: string[] = [];
      if (fs.existsSync(docPaths.paths.api)) {
        documentationFiles.push(`file://${docPaths.paths.api}`);
      }
      if (fs.existsSync(docPaths.paths.overview)) {
        documentationFiles.push(`file://${docPaths.paths.overview}`);
      }

      return {
        componentName,
        implementation: implementationFiles,
        documentation: documentationFiles,
        importPath: pathsInfo.importPath,
      };
    } catch (ctx) {
      throw new Error(
        `Error retrieving component data: ${(ctx as Error).message}`,
      );
    }
  },
  (result) => {
    const messages: string[] = [];

    if (result.implementation && result.implementation.length > 0) {
      messages.push('Implementation');
      messages.push('');
      result.implementation.forEach((file: string) => {
        messages.push(file);
      });
      messages.push('');
    }

    if (result.documentation && result.documentation.length > 0) {
      messages.push('Documentation');
      messages.push('');
      result.documentation.forEach((file: string) => {
        messages.push(file);
      });
      messages.push('');
    }

    if (result.importPath) {
      messages.push('Import path');
      messages.push('');
      messages.push(result.importPath);
    }

    return messages;
  },
);

export const getDsComponentDataTools = [
  {
    schema: getDsComponentDataToolSchema,
    handler: getDsComponentDataHandler,
  },
];
