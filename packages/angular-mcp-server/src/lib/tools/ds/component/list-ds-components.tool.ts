import { ToolSchemaOptions } from '@push-based/models';
import { createHandler, BaseHandlerOptions } from '../shared/utils/handler-helpers.js';
import { COMMON_ANNOTATIONS } from '../shared/models/schema-helpers.js';
import { getComponentPathsInfo } from './utils/paths-helpers.js';
import { getComponentDocPathsForName } from './utils/doc-helpers.js';
import { resolveCrossPlatformPath } from '../shared/utils/cross-platform-path.js';
import * as fs from 'fs';
import * as path from 'path';

interface DsComponentInfo {
  componentName: string;
  folderName: string;
  implementation: string[];
  documentation: string[];
  stories: string[];
  importPath: string;
}

interface ListDsComponentsOptions extends BaseHandlerOptions {
  sections?: string[];
}

export const listDsComponentsToolSchema: ToolSchemaOptions = {
  name: 'list-ds-components',
  description: `List all available Design System components in the project. Returns component names, folder structures, import paths, implementation files, documentation files, and stories files.`,
  inputSchema: {
    type: 'object',
    properties: {
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
    required: [],
  },
  annotations: {
    title: 'List Design System Components',
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

function kebabCaseToPascalCase(kebabCase: string): string {
  return 'Ds' + kebabCase
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function isValidComponentFolder(folderPath: string): boolean {
  const packageJsonPath = path.join(folderPath, 'package.json');
  const srcPath = path.join(folderPath, 'src');
  
  return fs.existsSync(packageJsonPath) && fs.existsSync(srcPath) && fs.statSync(srcPath).isDirectory();
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

export const listDsComponentsHandler = createHandler<
  ListDsComponentsOptions,
  DsComponentInfo[]
>(
  listDsComponentsToolSchema.name,
  async ({ sections = ['all'] }, { cwd, uiRoot, storybookDocsRoot }) => {
    try {
      if (!uiRoot || typeof uiRoot !== 'string') {
        throw new Error('uiRoot must be provided and be a string path.');
      }

      const componentsBasePath = resolveCrossPlatformPath(cwd, uiRoot);
      
      if (!fs.existsSync(componentsBasePath)) {
        throw new Error(`Components directory not found: ${uiRoot}`);
      }

      const entries = fs.readdirSync(componentsBasePath, { withFileTypes: true });
      const componentFolders = entries
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .filter((folderName) => {
          const folderPath = path.join(componentsBasePath, folderName);
          return isValidComponentFolder(folderPath);
        });

      const components: DsComponentInfo[] = [];
      const docsBasePath = resolveCrossPlatformPath(cwd, storybookDocsRoot);

      const includeAll = sections.includes('all');
      const includeImplementation = includeAll || sections.includes('implementation');
      const includeDocumentation = includeAll || sections.includes('documentation');
      const includeStories = includeAll || sections.includes('stories');

      for (const folderName of componentFolders) {
        try {
          const componentName = kebabCaseToPascalCase(folderName);
          
          const pathsInfo = getComponentPathsInfo(componentName, uiRoot, cwd);

          let implementationFiles: string[] = [];
          if (includeImplementation) {
            const srcFiles = getAllFilesInDirectory(pathsInfo.srcPath);
            implementationFiles = srcFiles.map((file) => `file://${file}`);
          }

          const documentationFiles: string[] = [];
          if (includeDocumentation) {
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
            const storiesComponentFolderPath = path.join(docsBasePath, folderName);
            const storiesFiles = findStoriesFiles(storiesComponentFolderPath);
            storiesFilePaths = storiesFiles.map((file) => `file://${file}`);
          }

          components.push({
            componentName,
            folderName,
            implementation: implementationFiles,
            documentation: documentationFiles,
            stories: storiesFilePaths,
            importPath: pathsInfo.importPath,
          });
        } catch (ctx) {
          console.warn(`Warning: Skipped component '${folderName}': ${(ctx as Error).message}`);
        }
      }

      return components;
    } catch (ctx) {
      throw new Error(
        `Error listing DS components: ${(ctx as Error).message}`,
      );
    }
  },
  (components) => {
    const response = {
      totalComponents: components?.length || 0,
      components: components || []
    };

    return [JSON.stringify(response, null, 2)];
  },
);

export const listDsComponentsTools = [
  {
    schema: listDsComponentsToolSchema,
    handler: listDsComponentsHandler,
  },
];
