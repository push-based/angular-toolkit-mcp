import * as fs from 'fs';
import * as path from 'path';
import {
  validateComponentName,
  componentNameToTagName,
  componentNameToKebabCase,
} from '../../shared/utils/component-validation.js';
import { resolveCrossPlatformPath } from '../../shared/utils/cross-platform-path.js';

export interface ComponentDocPaths {
  componentName: string;
  folderSlug: string;
  tagName: string;
  paths: { api: string; overview: string };
}

export interface ComponentDocContent {
  componentName: string;
  tagName: string;
  api: string | null;
  overview: string | null;
}

export function getComponentDocPathsForName(
  docsBasePath: string,
  componentName: string,
): ComponentDocPaths {
  const folderSlug = componentNameToKebabCase(componentName);
  const tagName = componentNameToTagName(componentName);
  const base = path.join(docsBasePath, folderSlug);
  return {
    componentName,
    folderSlug,
    tagName,
    paths: {
      api: path.join(base, `${folderSlug}-tabs/api.mdx`),
      overview: path.join(base, `${folderSlug}-tabs/overview.mdx`),
    },
  };
}

export function enrichSingleComponentDoc(
  doc: ComponentDocPaths,
): ComponentDocContent {
  let apiContent = null;
  let overviewContent = null;

  if (fs.existsSync(doc.paths.api)) {
    apiContent = fs.readFileSync(doc.paths.api, 'utf-8');
  }
  if (fs.existsSync(doc.paths.overview)) {
    overviewContent = fs.readFileSync(doc.paths.overview, 'utf-8');
  }

  return {
    componentName: doc.componentName,
    tagName: doc.tagName,
    api: apiContent,
    overview: overviewContent,
  };
}

/**
 * Reusable helper function to get component documentation
 * @param componentName - The name of the component (e.g., DsButton)
 * @param storybookDocsRoot - The root path to the storybook docs
 * @param cwd - Current working directory (optional, defaults to process.cwd())
 * @returns Component documentation with API and Overview content
 * @throws Error if component validation fails or documentation retrieval fails
 */
export function getComponentDocs(
  componentName: string,
  storybookDocsRoot: string,
  cwd: string = process.cwd(),
): ComponentDocContent {
  try {
    validateComponentName(componentName);

    const docsBasePath = resolveCrossPlatformPath(cwd, storybookDocsRoot);
    const docPaths = getComponentDocPathsForName(docsBasePath, componentName);
    const doc = enrichSingleComponentDoc(docPaths);

    if (!doc || (!doc.api && !doc.overview)) {
      throw new Error(`No documentation found for component: ${componentName}`);
    }

    return doc;
  } catch (ctx) {
    throw new Error(
      `Error retrieving component documentation: ${(ctx as Error).message}`,
    );
  }
}
