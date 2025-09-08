import { ToolSchemaOptions } from '@push-based/models';
import { createHandler, BaseHandlerOptions } from '../shared/utils/handler-helpers.js';
import {
  COMMON_ANNOTATIONS,
} from '../shared/models/schema-helpers.js';
import { getComponentPathsInfo } from './utils/paths-helpers.js';
import { getComponentDocPathsForName } from './utils/doc-helpers.js';
import { validateComponentName, componentNameToKebabCase } from '../shared/utils/component-validation.js';
import { resolveCrossPlatformPath } from '../shared/utils/cross-platform-path.js';
import * as fs from 'fs';
import * as path from 'path';

interface DsComponentDataOptions extends BaseHandlerOptions {
  componentName: string;
  sections?: string[];
}

interface DsComponentData {
  componentName: string;
  implementation: string[];
  documentation: string[];
  stories: string[];
  importPath: string;
}

export const getDsComponentDataToolSchema: ToolSchemaOptions = {
  name: 'get-ds-component-data',
  description: `Return comprehensive data for a DS component including implementation files, documentation files, stories files, and import path.`,
  inputSchema: {
    type: 'object',
    properties: {
      componentName: {
        type: 'string',
        description: 'The class name of the component to get data for (e.g., DsBadge)',
      },
      sections: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['implementation', 'documentation', 'stories', 'all'],
        },
        description: 'Sections to include in the response. Options: "implementation", "documentation", "stories", "all". Defaults to ["all"] if not specified.',
        default: ['all'],
      },
    },
    required: ['componentName'],
  },
  annotations: {
    title: 'Get Design System Component Data',
    ...COMMON_ANNOTATIONS.readOnly,
  },
};

function getAllFilesInDirectory(dirPath: string): string[] {
  const files: string[] = [];

  function walkDirectory(currentPath: string) {
    try {
      const items = fs.readdirSync(currentPath);

      for (const item of items) {
        const fullPath = path.join(currentPath, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          walkDirectory(fullPath);
        } else {
          files.push(fullPath);
        }
      }
    } catch {
      return;
    }
  }

  if (fs.existsSync(dirPath)) {
    walkDirectory(dirPath);
  }

  return files;
}

function findStoriesFiles(componentPath: string): string[] {
  const storiesFiles: string[] = [];
  
  try {
    if (fs.existsSync(componentPath)) {
      const items = fs.readdirSync(componentPath);
      
      for (const item of items) {
        const fullPath = path.join(componentPath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isFile() && item.endsWith('.stories.ts')) {
          storiesFiles.push(fullPath);
        }
      }
    }
  } catch {
    return storiesFiles;
  }
  
  return storiesFiles;
}

export const getDsComponentDataHandler = createHandler<
  DsComponentDataOptions,
  DsComponentData
>(
  getDsComponentDataToolSchema.name,
  async ({ componentName, sections = ['all'] }, { cwd, uiRoot, storybookDocsRoot }) => {
    try {
      validateComponentName(componentName);

      const includeAll = sections.includes('all');
      const includeImplementation = includeAll || sections.includes('implementation');
      const includeDocumentation = includeAll || sections.includes('documentation');
      const includeStories = includeAll || sections.includes('stories');

      const pathsInfo = getComponentPathsInfo(componentName, uiRoot, cwd);

      let implementationFiles: string[] = [];
      if (includeImplementation) {
        const srcFiles = getAllFilesInDirectory(pathsInfo.srcPath);
        implementationFiles = srcFiles.map((file) => `file://${file}`);
      }

      const documentationFiles: string[] = [];
      if (includeDocumentation) {
        const docsBasePath = resolveCrossPlatformPath(cwd, storybookDocsRoot);
        const docPaths = getComponentDocPathsForName(docsBasePath, componentName);

        if (fs.existsSync(docPaths.paths.api)) {
          documentationFiles.push(`file://${docPaths.paths.api}`);
        }
        if (fs.existsSync(docPaths.paths.overview)) {
          documentationFiles.push(`file://${docPaths.paths.overview}`);
        }
      }

      let storiesFilePaths: string[] = [];
      if (includeStories) {
        const docsBasePath = resolveCrossPlatformPath(cwd, storybookDocsRoot);
        const componentFolderName = componentNameToKebabCase(componentName);
        const storiesComponentFolderPath = path.join(docsBasePath, componentFolderName);
        const storiesFiles = findStoriesFiles(storiesComponentFolderPath);
        storiesFilePaths = storiesFiles.map((file) => `file://${file}`);
      }

      return {
        componentName,
        implementation: implementationFiles,
        documentation: documentationFiles,
        stories: storiesFilePaths,
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

    if (result.stories && result.stories.length > 0) {
      messages.push('Stories');
      messages.push('');
      result.stories.forEach((file: string) => {
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
