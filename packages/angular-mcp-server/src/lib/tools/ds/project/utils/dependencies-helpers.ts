import * as fs from 'fs';
import * as path from 'path';
import process from 'node:process';
import { getComponentPathsInfo } from '../../component/utils/paths-helpers.js';
import { resolveCrossPlatformPathAndValidateWithContext } from '../../shared/utils/cross-platform-path.js';

// Type definitions
export interface PackageJsonPeerDependencies {
  [packageName: string]: string;
}

export interface PackageJson {
  name?: string;
  version?: string;
  peerDependencies?: PackageJsonPeerDependencies;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  [key: string]: unknown;
}

export interface ProjectAnalysisResult {
  packageJsonFound: true;
  packageJsonPath: string;
  projectJsonPath: string | null;
  isPublishable: boolean;
  peerDependencies: PackageJsonPeerDependencies;
  peerDependencyMissing: boolean;
  importPath?: string;
  message?: string;
  suggestedChange?: {
    importPath: string;
    message: string;
  };
}

export interface ProjectAnalysisNotFoundResult {
  packageJsonFound: false;
  searchedPath: string;
  message: string;
}

export type ProjectAnalysisResponse =
  | ProjectAnalysisResult
  | ProjectAnalysisNotFoundResult;

export interface ComponentMetadata {
  importPath?: string;
  [key: string]: unknown;
}

/**
 * Finds package.json by traversing up the directory tree
 */
export function findPackageJson(startPath: string): string | null {
  let currentPath = path.resolve(startPath);
  const rootPath = path.parse(currentPath).root;

  while (currentPath !== rootPath) {
    const packageJsonPath = path.join(currentPath, 'package.json');

    if (fs.existsSync(packageJsonPath)) {
      return packageJsonPath;
    }

    currentPath = path.dirname(currentPath);
  }

  return null;
}

/**
 * Finds project.json in the same directory as package.json or nearby
 */
export function findProjectJson(packageJsonDir: string): string | null {
  const projectJsonPath = path.join(packageJsonDir, 'project.json');

  if (fs.existsSync(projectJsonPath)) {
    return projectJsonPath;
  }

  return null;
}

/**
 * Reads and parses package.json file
 */
export function readPackageJson(packageJsonPath: string): PackageJson {
  try {
    const content = fs.readFileSync(packageJsonPath, 'utf-8');
    return JSON.parse(content) as PackageJson;
  } catch (ctx) {
    throw new Error(
      `Failed to read or parse package.json at ${packageJsonPath}: ${
        (ctx as Error).message
      }`,
    );
  }
}

/**
 * Checks if the library has peer dependencies (indicating it's buildable/publishable)
 */
export function hasPeerDependencies(packageJson: PackageJson): boolean {
  return (
    packageJson.peerDependencies !== undefined &&
    typeof packageJson.peerDependencies === 'object' &&
    Object.keys(packageJson.peerDependencies).length > 0
  );
}

/**
 * Gets import path from component metadata
 */
export async function getComponentImportPath(
  componentName: string,
  cwd: string,
  uiRoot: string,
): Promise<string | null> {
  try {
    const pathsInfo = getComponentPathsInfo(componentName, uiRoot, cwd);
    return pathsInfo.importPath || null;
  } catch {
    return null;
  }
}

/**
 * Builds the base project analysis result from package.json and project.json
 */
export function buildProjectAnalysisResult(
  cwd: string,
  packageJsonPath: string,
  packageJson: PackageJson,
): ProjectAnalysisResult {
  const packageJsonDir = path.dirname(packageJsonPath);
  const hasPackagePeerDeps = hasPeerDependencies(packageJson);
  const projectJsonPath = findProjectJson(packageJsonDir);

  return {
    packageJsonFound: true,
    packageJsonPath: path.relative(cwd, packageJsonPath),
    projectJsonPath: projectJsonPath
      ? path.relative(cwd, projectJsonPath)
      : null,
    isPublishable: hasPackagePeerDeps,
    peerDependencies: packageJson.peerDependencies || {},
    peerDependencyMissing: false,
  };
}

/**
 * Handles peer dependencies analysis and component import path validation
 */
export async function handlePeerDependenciesAnalysis(
  result: ProjectAnalysisResult,
  componentName?: string,
  cwd?: string,
  uiRoot?: string,
): Promise<void> {
  if (!result.isPublishable) {
    result.message =
      'Library has no peer dependencies - appears to be a normal library';
    return;
  }

  if (!componentName) {
    result.message =
      'Library has peer dependencies (publishable/buildable). Provide componentName to validate import path.';
    return;
  }

  if (!cwd) {
    result.message = 'CWD is required for component import path validation.';
    return;
  }

  if (!uiRoot) {
    result.message =
      'UI root is required for component import path validation.';
    return;
  }

  // Try to get import path for the component
  const importPath = await getComponentImportPath(componentName, cwd, uiRoot);

  if (!importPath || importPath.trim() === '') {
    result.peerDependencyMissing = true;
    result.suggestedChange = {
      importPath: '*',
      message:
        'Component import path is missing or empty. This is required for publishable libraries.',
    };
  } else {
    result.importPath = importPath;
    result.message =
      'Component import path found - library appears properly configured';
  }
}

/**
 * Analyzes project dependencies and determines if library is buildable/publishable
 */
export async function analyzeProjectDependencies(
  cwd: string,
  directory: string,
  componentName?: string,
  workspaceRoot?: string,
  uiRoot?: string,
): Promise<ProjectAnalysisResponse> {
  // Parameter validation
  if (!directory || typeof directory !== 'string') {
    throw new Error('Directory parameter is required and must be a string');
  }

  // Set working directory
  process.chdir(cwd);

  // Validate target path exists
  const targetPath = resolveCrossPlatformPathAndValidateWithContext(
    cwd,
    directory,
    workspaceRoot,
  );

  // Find package.json
  const packageJsonPath = findPackageJson(targetPath);

  if (!packageJsonPath) {
    return {
      packageJsonFound: false,
      searchedPath: targetPath,
      message: 'No package.json found in the directory tree',
    };
  }

  // Read and parse package.json
  const packageJson = readPackageJson(packageJsonPath);

  // Build base result
  const result = buildProjectAnalysisResult(cwd, packageJsonPath, packageJson);

  // Handle peer dependencies analysis
  await handlePeerDependenciesAnalysis(result, componentName, cwd, uiRoot);

  return result;
}
