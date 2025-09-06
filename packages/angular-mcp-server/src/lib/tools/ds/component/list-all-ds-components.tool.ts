import { ToolSchemaOptions } from '@push-based/models';
import { createHandler } from '../shared/utils/handler-helpers.js';
import { COMMON_ANNOTATIONS } from '../shared/models/schema-helpers.js';
import { getComponentPathsInfo } from './utils/paths-helpers.js';
import { getComponentDocPathsForName } from './utils/doc-helpers.js';
import { validateComponentName } from '../shared/utils/component-validation.js';
import { resolveCrossPlatformPath } from '../shared/utils/cross-platform-path.js';
import * as fs from 'fs';

interface ComponentData {
  name: string;
  implementationDir: string;
  docsDir: string;
}

export const listAllDsComponentsToolSchema: ToolSchemaOptions = {
  name: 'list-all-ds-components',
  description: `List all available design system components with their implementation and documentation directories in JSON format.`,
  inputSchema: {
    type: 'object',
    properties: {},
    required: [],
  },
  annotations: {
    title: 'List All Design System Components',
    ...COMMON_ANNOTATIONS.readOnly,
  },
};

function getAllComponentsFromDeprecatedFile(
  deprecatedCssClassesPath: string,
  cwd: string,
): Array<{ componentName: string; deprecatedCssClasses: string[] }> {
  if (
    !deprecatedCssClassesPath ||
    typeof deprecatedCssClassesPath !== 'string'
  ) {
    throw new Error('deprecatedCssClassesPath must be a string path');
  }

  const absPath = resolveCrossPlatformPath(cwd, deprecatedCssClassesPath);
  if (!fs.existsSync(absPath)) {
    throw new Error(`File not found at deprecatedCssClassesPath: ${absPath}`);
  }

  const module = require(absPath);

  const dsComponents = module.default || module.dsComponents || module;

  if (!Array.isArray(dsComponents)) {
    throw new Error('Invalid export: expected dsComponents to be an array');
  }

  return dsComponents;
}

export const listAllDsComponentsHandler = createHandler<
  Record<string, never>,
  ComponentData[]
>(
  listAllDsComponentsToolSchema.name,
  async (
    _options,
    { cwd, uiRoot, storybookDocsRoot, deprecatedCssClassesPath },
  ) => {
    try {
      const dsComponents = getAllComponentsFromDeprecatedFile(
        deprecatedCssClassesPath,
        cwd,
      );

      const results: ComponentData[] = [];

      for (const { componentName } of dsComponents) {
        try {
          validateComponentName(componentName);

          const pathsInfo = getComponentPathsInfo(componentName, uiRoot, cwd);

          const docsBasePath = resolveCrossPlatformPath(
            cwd,
            storybookDocsRoot,
          );
          const docPaths = getComponentDocPathsForName(
            docsBasePath,
            componentName,
          );

          const componentDocsDir = `${docsBasePath}/${docPaths.folderSlug}`;

          results.push({
            name: componentName,
            implementationDir: pathsInfo.srcPath,
            docsDir: componentDocsDir,
          });
        } catch (ctx) {
          throw new Error(
            `Could not process component ${componentName}: ${(ctx as Error).message}`,
          );  
        }
      }

      return results;
    } catch (ctx) {
      throw new Error(
        `Error retrieving all components data: ${(ctx as Error).message}`,
      );
    }
  },
  (result) => {
    return [JSON.stringify(result, null, 2)];
  },
);

export const listAllDsComponentsTools = [
  {
    schema: listAllDsComponentsToolSchema,
    handler: listAllDsComponentsHandler,
  },
];
