import * as fs from 'fs';
import * as path from 'path';
import {
  validateComponentName,
  componentNameToKebabCase,
} from '../../shared/utils/component-validation.js';
import { resolveCrossPlatformPath } from '../../shared/utils/cross-platform-path.js';

export interface ComponentPaths {
  componentName: string;
  folderSlug: string;
  srcPath: string;
  packageJsonPath: string;
}

export interface ComponentPathsInfo {
  srcPath: string;
  importPath: string;
  relativeSrcPath: string;
}

export function getComponentPaths(
  uiRoot: string,
  componentName: string,
): ComponentPaths {
  const folderSlug = componentNameToKebabCase(componentName);
  const componentFolder = path.join(uiRoot, folderSlug);
  const srcPath = path.join(componentFolder, 'src');
  const packageJsonPath = path.join(componentFolder, 'package.json');

  return {
    componentName,
    folderSlug,
    srcPath,
    packageJsonPath,
  };
}

export function getImportPathFromPackageJson(
  packageJsonPath: string,
): string | null {
  try {
    if (!fs.existsSync(packageJsonPath)) {
      return null;
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    return packageJson.name || null;
  } catch (ctx) {
    throw new Error(
      `Error reading import path from package.json: ${(ctx as Error).message}`,
    );
  }
}

/**
 * Reusable helper function to get component paths information
 * @param componentName - The class name of the component (e.g., DsBadge)
 * @param uiRoot - The UI root directory path
 * @param cwd - Current working directory (optional, defaults to process.cwd())
 * @returns Object containing source path and import path information
 */
export function getComponentPathsInfo(
  componentName: string,
  uiRoot: string,
  cwd: string = process.cwd(),
): ComponentPathsInfo {
  try {
    validateComponentName(componentName);

    if (!uiRoot || typeof uiRoot !== 'string') {
      throw new Error('uiRoot must be provided and be a string path.');
    }

    const componentsBasePath = resolveCrossPlatformPath(cwd, uiRoot);
    const componentPaths = getComponentPaths(componentsBasePath, componentName);

    const relativeComponentPaths = getComponentPaths(uiRoot, componentName);

    if (!fs.existsSync(componentPaths.srcPath)) {
      throw new Error(
        `Component source directory not found: ${relativeComponentPaths.srcPath}`,
      );
    }

    const importPath = getImportPathFromPackageJson(
      componentPaths.packageJsonPath,
    );

    if (!importPath) {
      throw new Error(
        `Could not read import path from package.json for component: ${componentName}`,
      );
    }

    return {
      srcPath: componentPaths.srcPath,
      importPath,
      relativeSrcPath: relativeComponentPaths.srcPath,
    };
  } catch (ctx) {
    throw new Error(
      `Error retrieving component information: ${(ctx as Error).message}`,
    );
  }
}
