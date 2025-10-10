import { validateComponentName } from '../../shared/utils/component-validation.js';
import { getDeprecatedCssClasses } from './deprecated-css-helpers.js';
import { getComponentDocs } from './doc-helpers.js';
import { getComponentPathsInfo } from './paths-helpers.js';

export interface ComponentMetadataParams {
  componentName: string;
  storybookDocsRoot?: string;
  deprecatedCssClassesPath?: string;
  uiRoot?: string;
  cwd?: string;
}

export interface ComponentMetadataResult {
  sourcePath: string | null;
  importPath: string | null;
  tagName: string | null;
  api: string | null;
  overview: string | null;
  deprecatedCssClasses: string;
}

export async function analyzeComponentMetadata(
  params: ComponentMetadataParams,
): Promise<ComponentMetadataResult> {
  validateComponentName(params.componentName);

  const storybookDocsRoot = params.storybookDocsRoot || 'docs';
  const deprecatedCssClassesPath =
    params.deprecatedCssClassesPath || 'deprecated-css-classes.js';
  const uiRoot = params.uiRoot || 'libs/ui';
  const cwd = params.cwd || process.cwd();

  const documentation = getComponentDocs(
    params.componentName,
    storybookDocsRoot,
  );
  const deprecatedCssClassesList = await getDeprecatedCssClasses(
    params.componentName,
    deprecatedCssClassesPath,
    cwd,
  );
  const componentPaths = getComponentPathsInfo(
    params.componentName,
    uiRoot,
    cwd,
  );

  return {
    sourcePath: componentPaths.srcPath,
    importPath: componentPaths.importPath,
    tagName: documentation.tagName,
    api: documentation.api,
    overview: documentation.overview,
    deprecatedCssClasses: JSON.stringify(deprecatedCssClassesList),
  };
}
