import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import { toUnixPath } from '@push-based/utils';

import {
  DependencyInfo,
  FileInfo,
  ComponentMetadata,
  FileExtension,
} from '../models/types.js';
import {
  DEPENDENCY_ANALYSIS_CONFIG,
  REGEX_PATTERNS,
  getCombinedComponentImportRegex,
} from '../models/config.js';
import { isExternal, resolveDependencyPath } from './path-resolver.js';

const DEP_REGEX_TABLE: Array<[RegExp, DependencyInfo['type']]> = [
  [REGEX_PATTERNS.ES6_IMPORT, 'import'],
  [REGEX_PATTERNS.COMMONJS_REQUIRE, 'require'],
  [REGEX_PATTERNS.DYNAMIC_IMPORT, 'dynamic-import'],
];

const STYLE_REGEX_TABLE: Array<
  [RegExp, DependencyInfo['type'], ((p: string) => boolean)?]
> = [
  [REGEX_PATTERNS.CSS_IMPORT, 'css-import'],
  [
    REGEX_PATTERNS.CSS_URL,
    'asset',
    (u) => !u.startsWith('http') && !u.startsWith('data:'),
  ],
];

export interface UnifiedAnalysisResult {
  dependencies: DependencyInfo[];
  componentMetadata?: ComponentMetadata;
  importedComponentNames: string[];
  isAngularComponent: boolean;
}

export async function analyzeFileWithUnifiedAST(
  filePath: string,
  basePath: string,
  componentNamesForReverseDeps?: string[],
): Promise<UnifiedAnalysisResult> {
  const content = await fs.promises.readFile(filePath, 'utf-8');

  try {
    return analyzeContentWithUnifiedAST(
      content,
      filePath,
      basePath,
      componentNamesForReverseDeps,
    );
  } catch {
    return analyzeContentWithRegexFallback(
      content,
      filePath,
      basePath,
      componentNamesForReverseDeps,
    );
  }
}

function analyzeContentWithUnifiedAST(
  content: string,
  filePath: string,
  basePath: string,
  componentNamesForReverseDeps?: string[],
): UnifiedAnalysisResult {
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true,
  );

  const result: UnifiedAnalysisResult = {
    dependencies: [],
    importedComponentNames: [],
    isAngularComponent: false,
  };

  const componentNameSet = componentNamesForReverseDeps
    ? new Set(componentNamesForReverseDeps)
    : new Set<string>();
  let componentClassName: string | undefined;

  const visit = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node) && node.moduleSpecifier) {
      if (ts.isStringLiteral(node.moduleSpecifier)) {
        const importPath = node.moduleSpecifier.text;
        result.dependencies.push(
          createDependencyInfo(importPath, 'import', filePath, basePath),
        );

        if (
          componentNamesForReverseDeps &&
          componentNamesForReverseDeps.length > 0 &&
          node.importClause
        ) {
          extractComponentImportsFromImportNode(
            node,
            componentNameSet,
            result.importedComponentNames,
          );
        }
      }
    } else if (ts.isCallExpression(node)) {
      if (
        ts.isIdentifier(node.expression) &&
        node.expression.text === 'require' &&
        node.arguments.length === 1 &&
        ts.isStringLiteral(node.arguments[0])
      ) {
        const importPath = node.arguments[0].text;
        result.dependencies.push(
          createDependencyInfo(importPath, 'require', filePath, basePath),
        );
      } else if (
        node.expression.kind === ts.SyntaxKind.ImportKeyword &&
        node.arguments.length === 1 &&
        ts.isStringLiteral(node.arguments[0])
      ) {
        const importPath = node.arguments[0].text;
        result.dependencies.push(
          createDependencyInfo(
            importPath,
            'dynamic-import',
            filePath,
            basePath,
          ),
        );
      }
    } else if (ts.isClassDeclaration(node) && node.name) {
      const hasComponentDecorator = ts
        .getDecorators?.(node as ts.HasDecorators)
        ?.some((decorator) => {
          if (ts.isCallExpression(decorator.expression)) {
            return (
              ts.isIdentifier(decorator.expression.expression) &&
              decorator.expression.expression.text === 'Component'
            );
          }
          return (
            ts.isIdentifier(decorator.expression) &&
            decorator.expression.text === 'Component'
          );
        });

      if (hasComponentDecorator) {
        result.isAngularComponent = true;
        componentClassName = node.name.text;
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);

  if (result.isAngularComponent && componentClassName) {
    result.componentMetadata = {
      className: componentClassName,
    };
  }

  return result;
}

function extractComponentImportsFromImportNode(
  importNode: ts.ImportDeclaration,
  componentNameSet: Set<string>,
  foundComponents: string[],
): void {
  const importClause = importNode.importClause;
  if (!importClause) return;

  if (
    importClause.namedBindings &&
    ts.isNamedImports(importClause.namedBindings)
  ) {
    for (const element of importClause.namedBindings.elements) {
      const importName = element.name.text;
      if (componentNameSet.has(importName)) {
        foundComponents.push(importName);
      }
    }
  }

  if (importClause.name) {
    const importName = importClause.name.text;
    if (componentNameSet.has(importName)) {
      foundComponents.push(importName);
    }
  }
}

function analyzeContentWithRegexFallback(
  content: string,
  filePath: string,
  basePath: string,
  componentNamesForReverseDeps?: string[],
): UnifiedAnalysisResult {
  const result: UnifiedAnalysisResult = {
    dependencies: [],
    importedComponentNames: [],
    isAngularComponent: false,
  };

  DEP_REGEX_TABLE.forEach(([regex, type]) => {
    regex.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(content))) {
      const importPath = match[1] || match[2];
      result.dependencies.push(
        createDependencyInfo(importPath, type, filePath, basePath),
      );
    }
  });

  result.isAngularComponent =
    REGEX_PATTERNS.ANGULAR_COMPONENT_DECORATOR.test(content);

  if (result.isAngularComponent) {
    const classMatch = content.match(/export\s+class\s+(\w+)/);
    if (classMatch) {
      result.componentMetadata = {
        className: classMatch[1],
      };
    }
  }

  if (componentNamesForReverseDeps && componentNamesForReverseDeps.length > 0) {
    const combinedImportRegex = getCombinedComponentImportRegex(
      componentNamesForReverseDeps,
    );
    const matches = Array.from(content.matchAll(combinedImportRegex));
    result.importedComponentNames = matches
      .map((match) => match[1])
      .filter(Boolean);
  }

  return result;
}

/**
 * Enhanced version of analyzeFileOptimized that uses unified AST analysis
 */
export async function analyzeFileWithUnifiedOptimization(
  filePath: string,
  basePath: string,
): Promise<FileInfo> {
  const stats = await fs.promises.stat(filePath);
  const ext = path.extname(filePath);

  const { stylesExtensions, scriptExtensions } = DEPENDENCY_ANALYSIS_CONFIG;

  let dependencies: DependencyInfo[] = [];
  let isAngularComponent = false;
  let componentName: string | undefined;

  if (scriptExtensions.includes(ext as any)) {
    const unifiedResult = await analyzeFileWithUnifiedAST(filePath, basePath);
    dependencies = unifiedResult.dependencies;
    isAngularComponent = unifiedResult.isAngularComponent;
    componentName = unifiedResult.componentMetadata?.className;
  } else if (stylesExtensions.includes(ext as any)) {
    dependencies = parseStyleDependencies(
      await fs.promises.readFile(filePath, 'utf-8'),
      filePath,
      basePath,
    );
  }

  return {
    type:
      DEPENDENCY_ANALYSIS_CONFIG.fileTypeMap[ext as FileExtension] || 'unknown',
    size: stats.size,
    dependencies,
    lastModified: stats.mtime.getTime(),
    isAngularComponent,
    componentName,
  };
}

export async function extractComponentImportsUnified(
  filePath: string,
  componentNames: string[],
): Promise<string[]> {
  if (componentNames.length === 0) {
    return [];
  }

  try {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    const result = analyzeContentWithUnifiedAST(
      content,
      filePath,
      '',
      componentNames,
    );
    return Array.from(new Set(result.importedComponentNames));
  } catch {
    return [];
  }
}

function createDependencyInfo(
  importPath: string,
  type: DependencyInfo['type'],
  filePath: string,
  basePath: string,
): DependencyInfo {
  if (isExternal(importPath)) {
    return {
      path: importPath,
      type: 'external',
      resolved: false,
    };
  }

  const resolvedPath = resolveDependencyPath(importPath, filePath, basePath);

  return {
    path: importPath,
    type,
    resolved: resolvedPath !== null,
    resolvedPath: resolvedPath ? toUnixPath(resolvedPath) : undefined,
  };
}

function parseStyleDependencies(
  content: string,
  filePath: string,
  basePath: string,
): DependencyInfo[] {
  const dependencies: DependencyInfo[] = [];

  STYLE_REGEX_TABLE.forEach(([regex, type, filter]) => {
    regex.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(content))) {
      const importPath = match[1] || match[2];
      if (!filter || filter(importPath)) {
        dependencies.push(
          createDependencyInfo(importPath, type, filePath, basePath),
        );
      }
    }
  });

  return dependencies;
}
