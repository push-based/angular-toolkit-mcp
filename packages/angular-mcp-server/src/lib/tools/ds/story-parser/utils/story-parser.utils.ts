import * as ts from 'typescript';
import {
  StoryFileData,
  SelectorInfo,
  ArgTypeEntry,
  MetaArg,
  StoryEntry,
  ArgsOverride,
} from '../models/types.js';

// ============================================================================
// Main entry point
// ============================================================================

/**
 * Parse a Storybook .stories.ts file into structured JSON.
 * Uses TypeScript AST as primary extraction with regex fallback.
 */
export function parseStoryFile(
  content: string,
  filePath: string,
  kebabName: string,
): StoryFileData {
  try {
    const sourceFile = ts.createSourceFile(
      filePath,
      content,
      ts.ScriptTarget.Latest,
      true,
    );
    return extractFromAST(sourceFile, content, filePath, kebabName);
  } catch {
    return extractWithRegex(content, filePath, kebabName);
  }
}

// ============================================================================
// AST extraction path
// ============================================================================

function extractFromAST(
  sourceFile: ts.SourceFile,
  content: string,
  filePath: string,
  kebabName: string,
): StoryFileData {
  const imports = extractImportsAST(sourceFile);
  const metaArgs = extractMetaArgsAST(sourceFile);
  const argTypes = extractArgTypesAST(sourceFile);
  crossReferenceDefaults(argTypes, metaArgs);
  const metaTags = extractMetaTagsAST(sourceFile);
  const stories = extractStoriesAST(sourceFile, content);
  const templates = stories
    .map((s) => s.template)
    .filter((t): t is string => t !== null);
  const slots = extractSlotsFromTemplates(templates);
  const selector = detectSelectorStyle(content, kebabName);
  const formIntegration = detectFormIntegration(content);

  return {
    componentName: kebabName,
    filePath,
    selector,
    imports,
    argTypes,
    metaArgs,
    metaTags,
    slots,
    formIntegration,
    stories,
  };
}

// ============================================================================
// Regex fallback path
// ============================================================================

function extractWithRegex(
  content: string,
  filePath: string,
  kebabName: string,
): StoryFileData {
  const imports = extractImportsRegex(content);
  const metaArgs = extractMetaArgsRegex(content);
  const argTypes = extractArgTypesRegex(content);
  crossReferenceDefaults(argTypes, metaArgs);
  const metaTags = extractMetaTagsRegex(content);
  const stories = extractStoriesRegex(content);
  const templates = stories
    .map((s) => s.template)
    .filter((t): t is string => t !== null);
  const slots = extractSlotsFromTemplates(templates);
  const selector = detectSelectorStyle(content, kebabName);
  const formIntegration = detectFormIntegration(content);

  return {
    componentName: kebabName,
    filePath,
    selector,
    imports,
    argTypes,
    metaArgs,
    metaTags,
    slots,
    formIntegration,
    stories,
  };
}

// ============================================================================
// Post-processing: cross-reference meta args into argTypes
// ============================================================================

/**
 * Fill in missing argType defaults from meta args.
 * When an argType has no `default` but meta.args has a value for that key, use it.
 */
function crossReferenceDefaults(
  argTypes: ArgTypeEntry[],
  metaArgs: MetaArg[] | null,
): void {
  if (!metaArgs || metaArgs.length === 0) return;

  const metaMap = new Map(metaArgs.map((a) => [a.name, a.default]));
  for (const at of argTypes) {
    if (!at.default && metaMap.has(at.name)) {
      const val = metaMap.get(at.name);
      if (val) {
        at.default = val.replace(/^['"]|['"]$/g, '');
      }
    }
  }
}

// ============================================================================
// Import extraction
// ============================================================================

const DS_IMPORT_SCOPES = ['@frontend/', '@design-system/'];

function isDsScopedImport(moduleSpecifier: string): boolean {
  return DS_IMPORT_SCOPES.some((scope) => moduleSpecifier.startsWith(scope));
}

function normalizeImportText(importText: string): string {
  // Collapse multi-line imports to single line
  const namesMatch = importText.match(/import\s+\{([^}]*)\}/s);
  const fromMatch = importText.match(/from\s+['"]([^'"]+)['"]/);
  if (!namesMatch || !fromMatch) return importText.replace(/\s+/g, ' ').trim();

  const names = namesMatch[1]
    .split(',')
    .map((n) => n.trim())
    .filter(Boolean)
    .join(', ');
  return `import { ${names} } from '${fromMatch[1]}';`;
}

export function extractImportsAST(sourceFile: ts.SourceFile): string[] {
  const imports: string[] = [];

  for (const statement of sourceFile.statements) {
    if (
      ts.isImportDeclaration(statement) &&
      statement.moduleSpecifier &&
      ts.isStringLiteral(statement.moduleSpecifier)
    ) {
      const moduleSpec = statement.moduleSpecifier.text;
      if (isDsScopedImport(moduleSpec)) {
        const rawText = statement.getText(sourceFile);
        imports.push(normalizeImportText(rawText));
      }
    }
  }

  return imports;
}

export function extractImportsRegex(content: string): string[] {
  const imports: string[] = [];
  const importRegex =
    /import\s+\{[^}]*\}\s+from\s+['"](@frontend\/[^'"]+|@design-system\/[^'"]+)['"]\s*;?/gs;
  let match: RegExpExecArray | null;

  while ((match = importRegex.exec(content)) !== null) {
    imports.push(normalizeImportText(match[0]));
  }

  return imports;
}

// ============================================================================
// Meta args extraction
// ============================================================================

export function extractMetaArgsAST(
  sourceFile: ts.SourceFile,
): MetaArg[] | null {
  const metaObject = findMetaObjectAST(sourceFile);
  if (!metaObject) return null;

  for (const prop of metaObject.properties) {
    if (
      ts.isPropertyAssignment(prop) &&
      ts.isIdentifier(prop.name) &&
      prop.name.text === 'args' &&
      ts.isObjectLiteralExpression(prop.initializer)
    ) {
      return extractArgsFromObjectLiteral(prop.initializer, sourceFile);
    }
  }

  return null;
}

function findMetaObjectAST(
  sourceFile: ts.SourceFile,
): ts.ObjectLiteralExpression | null {
  for (const statement of sourceFile.statements) {
    // const meta = { ... }
    if (ts.isVariableStatement(statement)) {
      for (const decl of statement.declarationList.declarations) {
        if (
          ts.isIdentifier(decl.name) &&
          decl.name.text === 'meta' &&
          decl.initializer
        ) {
          // Handle: const meta: Meta<T> = { ... }
          if (ts.isObjectLiteralExpression(decl.initializer)) {
            return decl.initializer;
          }
          // Handle: const meta = { ... } satisfies Meta<T>
          if (
            ts.isSatisfiesExpression(decl.initializer) &&
            ts.isObjectLiteralExpression(decl.initializer.expression)
          ) {
            return decl.initializer.expression;
          }
          // Handle: const meta = { ... } as Meta<T>
          if (
            ts.isAsExpression(decl.initializer) &&
            ts.isObjectLiteralExpression(decl.initializer.expression)
          ) {
            return decl.initializer.expression;
          }
        }
      }
    }
    // export default { ... }
    if (
      ts.isExportAssignment(statement) &&
      ts.isObjectLiteralExpression(statement.expression)
    ) {
      return statement.expression;
    }
    // export default { ... } as Meta
    if (
      ts.isExportAssignment(statement) &&
      ts.isAsExpression(statement.expression) &&
      ts.isObjectLiteralExpression(statement.expression.expression)
    ) {
      return statement.expression.expression;
    }
    // export default { ... } satisfies Meta
    if (
      ts.isExportAssignment(statement) &&
      ts.isSatisfiesExpression(statement.expression) &&
      ts.isObjectLiteralExpression(statement.expression.expression)
    ) {
      return statement.expression.expression;
    }
  }
  return null;
}

function extractArgsFromObjectLiteral(
  obj: ts.ObjectLiteralExpression,
  sourceFile: ts.SourceFile,
): MetaArg[] {
  const args: MetaArg[] = [];
  for (const prop of obj.properties) {
    if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
      args.push({
        name: prop.name.text,
        default: prop.initializer.getText(sourceFile).replace(/,\s*$/, ''),
      });
    }
    if (ts.isShorthandPropertyAssignment(prop)) {
      args.push({
        name: prop.name.text,
        default: prop.name.text,
      });
    }
  }
  return args;
}

export function extractMetaArgsRegex(content: string): MetaArg[] | null {
  // Find the meta block boundary
  const metaStart = content.indexOf('const meta');
  const exportDefault = content.indexOf('export default');
  if (metaStart === -1 && exportDefault === -1) return null;

  const searchStart = metaStart !== -1 ? metaStart : exportDefault;
  // For const meta, the meta block ends at export default (or EOF)
  const searchEnd =
    metaStart !== -1 && exportDefault > metaStart
      ? exportDefault
      : content.length;

  const metaBlock = content.slice(searchStart, searchEnd);
  const argsMatch = metaBlock.match(/\n\s{2,4}args:\s*\{([^}]+)\}/);
  if (!argsMatch) return null;

  const pairs: MetaArg[] = [];
  const body = argsMatch[1];
  for (const line of body.split('\n')) {
    const pairMatch = line.match(/^\s*(\w+):\s*(.+?),?\s*$/);
    if (pairMatch) {
      pairs.push({
        name: pairMatch[1],
        default: pairMatch[2].replace(/,\s*$/, ''),
      });
    }
  }
  return pairs.length > 0 ? pairs : null;
}

// ============================================================================
// Meta tags extraction
// ============================================================================

function extractMetaTagsAST(sourceFile: ts.SourceFile): string[] {
  const metaObject = findMetaObjectAST(sourceFile);
  if (!metaObject) return [];

  for (const prop of metaObject.properties) {
    if (
      ts.isPropertyAssignment(prop) &&
      ts.isIdentifier(prop.name) &&
      prop.name.text === 'tags' &&
      ts.isArrayLiteralExpression(prop.initializer)
    ) {
      return prop.initializer.elements
        .filter(ts.isStringLiteral)
        .map((el) => el.text);
    }
  }
  return [];
}

function extractMetaTagsRegex(content: string): string[] {
  // Match tags at meta level (indented 4 spaces, before export default)
  const metaEnd = content.indexOf('export default');
  const metaBlock = metaEnd !== -1 ? content.slice(0, metaEnd) : content;
  const tagsMatch = metaBlock.match(/\n\s{2,4}tags:\s*\[([^\]]*)\]/);
  if (!tagsMatch) return [];
  return tagsMatch[1]
    .replace(/['"]/g, '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

// ============================================================================
// ArgTypes extraction
// ============================================================================

export function extractArgTypesAST(sourceFile: ts.SourceFile): ArgTypeEntry[] {
  const metaObject = findMetaObjectAST(sourceFile);
  if (!metaObject) return [];

  for (const prop of metaObject.properties) {
    if (
      ts.isPropertyAssignment(prop) &&
      ts.isIdentifier(prop.name) &&
      prop.name.text === 'argTypes' &&
      ts.isObjectLiteralExpression(prop.initializer)
    ) {
      return extractArgTypeEntries(prop.initializer, sourceFile);
    }
  }

  return [];
}

function extractArgTypeEntries(
  obj: ts.ObjectLiteralExpression,
  sourceFile: ts.SourceFile,
): ArgTypeEntry[] {
  const entries: ArgTypeEntry[] = [];

  for (const prop of obj.properties) {
    if (
      ts.isPropertyAssignment(prop) &&
      ts.isIdentifier(prop.name) &&
      ts.isObjectLiteralExpression(prop.initializer)
    ) {
      const entry: ArgTypeEntry = { name: prop.name.text };
      extractArgTypeFields(prop.initializer, sourceFile, entry);
      entries.push(entry);
    }
  }

  return entries;
}

function extractArgTypeFields(
  obj: ts.ObjectLiteralExpression,
  sourceFile: ts.SourceFile,
  entry: ArgTypeEntry,
): void {
  for (const prop of obj.properties) {
    if (!ts.isPropertyAssignment(prop) || !ts.isIdentifier(prop.name)) continue;

    const key = prop.name.text;

    if (key === 'options') {
      // Preserve constant references (e.g., DS_BUTTON_VARIANTS_ARRAY)
      entry.options = prop.initializer.getText(sourceFile);
    } else if (key === 'type') {
      if (ts.isStringLiteral(prop.initializer)) {
        entry.type = prop.initializer.text;
      }
    } else if (key === 'description') {
      if (ts.isStringLiteral(prop.initializer)) {
        entry.description = prop.initializer.text;
      } else if (ts.isNoSubstitutionTemplateLiteral(prop.initializer)) {
        entry.description = prop.initializer.text;
      }
    } else if (
      key === 'table' &&
      ts.isObjectLiteralExpression(prop.initializer)
    ) {
      // Look for table.defaultValue.summary
      extractDefaultFromTable(prop.initializer, sourceFile, entry);
    }
  }
}

function extractDefaultFromTable(
  tableObj: ts.ObjectLiteralExpression,
  sourceFile: ts.SourceFile,
  entry: ArgTypeEntry,
): void {
  for (const prop of tableObj.properties) {
    if (
      ts.isPropertyAssignment(prop) &&
      ts.isIdentifier(prop.name) &&
      prop.name.text === 'defaultValue' &&
      ts.isObjectLiteralExpression(prop.initializer)
    ) {
      for (const dvProp of prop.initializer.properties) {
        if (
          ts.isPropertyAssignment(dvProp) &&
          ts.isIdentifier(dvProp.name) &&
          dvProp.name.text === 'summary'
        ) {
          if (ts.isStringLiteral(dvProp.initializer)) {
            entry.default = dvProp.initializer.text.trim();
          } else if (ts.isNoSubstitutionTemplateLiteral(dvProp.initializer)) {
            entry.default = dvProp.initializer.text.trim();
          }
        }
      }
    }
  }
}

export function extractArgTypesRegex(content: string): ArgTypeEntry[] {
  const results: ArgTypeEntry[] = [];

  const argTypesMatch = content.match(
    /argTypes:\s*\{([\s\S]*?)\n\s{2,4}\},?\s*\n/,
  );
  if (!argTypesMatch) return results;

  const block = argTypesMatch[1];
  const entryRegex = /(\w+):\s*\{([\s\S]*?)\n\s{6,8}\},?/g;
  let match: RegExpExecArray | null;

  while ((match = entryRegex.exec(block)) !== null) {
    const name = match[1];
    const body = match[2];
    const entry: ArgTypeEntry = { name };

    const optionsMatch = body.match(/options:\s*(\[.*?\]|[A-Z_]\w+)/);
    if (optionsMatch) entry.options = optionsMatch[1];

    const typeMatch = body.match(/type:\s*['"](\w+)['"]/);
    if (typeMatch) entry.type = typeMatch[1];

    const defaultMatch = body.match(
      /defaultValue:\s*\{\s*summary:\s*['"]([^'"]*)['"]/,
    );
    if (defaultMatch) entry.default = defaultMatch[1].trim();

    const descMatch = body.match(/description:\s*['"]([^'"]*)['"]/);
    if (descMatch) entry.description = descMatch[1];

    // Handle multi-line description with string concatenation
    if (!descMatch) {
      const descMultiMatch = body.match(
        /description:\s*\n?\s*['"]([^'"]+)['"]/,
      );
      if (descMultiMatch) entry.description = descMultiMatch[1];
    }

    results.push(entry);
  }

  return results;
}

// ============================================================================
// Story extraction
// ============================================================================

export function extractStoriesAST(
  sourceFile: ts.SourceFile,
  content: string,
): StoryEntry[] {
  const stories: StoryEntry[] = [];

  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;

    // Must be an export
    const isExported = statement.modifiers?.some(
      (m) => m.kind === ts.SyntaxKind.ExportKeyword,
    );
    if (!isExported) continue;

    for (const decl of statement.declarationList.declarations) {
      if (!ts.isIdentifier(decl.name)) continue;

      // Check type annotation is Story or StoryObj<...>
      if (!decl.type) continue;
      const typeText = decl.type.getText(sourceFile);
      if (typeText !== 'Story' && !typeText.startsWith('StoryObj')) continue;

      const name = decl.name.text;
      if (!decl.initializer || !ts.isObjectLiteralExpression(decl.initializer))
        continue;

      const storyObj = decl.initializer;
      const tags = extractTagsAST(storyObj, sourceFile);
      const hasPlayFn = detectPlayFnAST(storyObj);
      const argsOverrides = extractStoryArgsAST(storyObj, sourceFile);
      const template = extractTemplateFromStoryAST(storyObj, content);
      const storyLevelArgs = extractStoryLevelArgTypesAST(storyObj, sourceFile);
      const displayName = extractDisplayNameAST(storyObj, sourceFile);

      const entry: StoryEntry = {
        name,
        template: template ? cleanTemplate(template) : null,
        tags,
        hasPlayFn,
        argsOverrides,
      };
      if (displayName) {
        entry.displayName = displayName;
      }
      if (storyLevelArgs.length > 0) {
        entry.storyLevelArgs = storyLevelArgs;
      }
      stories.push(entry);
    }
  }

  return stories;
}

function extractTagsAST(
  obj: ts.ObjectLiteralExpression,
  _sourceFile: ts.SourceFile,
): string[] {
  for (const prop of obj.properties) {
    if (
      ts.isPropertyAssignment(prop) &&
      ts.isIdentifier(prop.name) &&
      prop.name.text === 'tags' &&
      ts.isArrayLiteralExpression(prop.initializer)
    ) {
      return prop.initializer.elements
        .filter(ts.isStringLiteral)
        .map((el) => el.text);
    }
  }
  return [];
}

/**
 * Extract display name from story's top-level `name` property or `parameters.name`.
 */
function extractDisplayNameAST(
  obj: ts.ObjectLiteralExpression,
  _sourceFile: ts.SourceFile,
): string | null {
  for (const prop of obj.properties) {
    if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
      // Top-level name: 'Custom Toggle'
      if (prop.name.text === 'name' && ts.isStringLiteral(prop.initializer)) {
        return prop.initializer.text;
      }
      // parameters.name
      if (
        prop.name.text === 'parameters' &&
        ts.isObjectLiteralExpression(prop.initializer)
      ) {
        for (const paramProp of prop.initializer.properties) {
          if (
            ts.isPropertyAssignment(paramProp) &&
            ts.isIdentifier(paramProp.name) &&
            paramProp.name.text === 'name' &&
            ts.isStringLiteral(paramProp.initializer)
          ) {
            return paramProp.initializer.text;
          }
        }
      }
    }
  }
  return null;
}

function detectPlayFnAST(obj: ts.ObjectLiteralExpression): boolean {
  for (const prop of obj.properties) {
    if (ts.isPropertyAssignment(prop) || ts.isMethodDeclaration(prop)) {
      if (ts.isIdentifier(prop.name) && prop.name.text === 'play') {
        return true;
      }
    }
  }
  return false;
}

function extractStoryArgsAST(
  obj: ts.ObjectLiteralExpression,
  sourceFile: ts.SourceFile,
): ArgsOverride[] {
  const overrides: ArgsOverride[] = [];

  for (const prop of obj.properties) {
    if (
      ts.isPropertyAssignment(prop) &&
      ts.isIdentifier(prop.name) &&
      prop.name.text === 'args' &&
      ts.isObjectLiteralExpression(prop.initializer)
    ) {
      for (const argProp of prop.initializer.properties) {
        // Skip spread elements
        if (ts.isSpreadAssignment(argProp)) continue;

        if (ts.isPropertyAssignment(argProp) && ts.isIdentifier(argProp.name)) {
          overrides.push({
            name: argProp.name.text,
            value: argProp.initializer.getText(sourceFile).replace(/,\s*$/, ''),
          });
        }
        if (ts.isShorthandPropertyAssignment(argProp)) {
          overrides.push({
            name: argProp.name.text,
            value: argProp.name.text,
          });
        }
      }
    }
  }

  return overrides;
}

/**
 * Extract story-level argTypes that are not in the meta block.
 * These represent inputs only defined at the story level (e.g., TruncateTextButton's `truncate`).
 * Filters out entries that only override display settings (e.g., table: { disable: true }).
 */
function extractStoryLevelArgTypesAST(
  storyObj: ts.ObjectLiteralExpression,
  sourceFile: ts.SourceFile,
): ArgTypeEntry[] {
  for (const prop of storyObj.properties) {
    if (
      ts.isPropertyAssignment(prop) &&
      ts.isIdentifier(prop.name) &&
      prop.name.text === 'argTypes' &&
      ts.isObjectLiteralExpression(prop.initializer)
    ) {
      const entries = extractArgTypeEntries(prop.initializer, sourceFile);
      // Only keep entries with meaningful content (not just display overrides)
      return entries.filter(
        (e) => e.type || e.options || e.default || e.description,
      );
    }
  }
  return [];
}

/**
 * Extract template from a story's render function.
 * Falls back to raw text extraction for complex cases like ternary expressions.
 */
function extractTemplateFromStoryAST(
  storyObj: ts.ObjectLiteralExpression,
  content: string,
): string | null {
  // Get the raw text of the story object for ternary/template literal extraction
  const storyText = storyObj.getText();

  // Try ternary else-branch first
  const ternaryElse = extractTernaryElseBranch(storyText);
  if (ternaryElse) return ternaryElse;

  // Find render function and extract template
  for (const prop of storyObj.properties) {
    if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
      if (prop.name.text === 'render') {
        return extractTemplateFromRenderNode(prop.initializer, content);
      }
    }
    if (ts.isMethodDeclaration(prop) && ts.isIdentifier(prop.name)) {
      if (prop.name.text === 'render') {
        return extractTemplateFromMethodBody(prop, content);
      }
    }
  }

  return null;
}

function extractTemplateFromRenderNode(
  node: ts.Node,
  content: string,
): string | null {
  // Walk the AST to find a property assignment with name "template"
  let result: string | null = null;

  const visit = (n: ts.Node): void => {
    if (result) return;

    if (
      ts.isPropertyAssignment(n) &&
      ts.isIdentifier(n.name) &&
      n.name.text === 'template'
    ) {
      if (ts.isNoSubstitutionTemplateLiteral(n.initializer)) {
        result = n.initializer.text;
      } else if (ts.isTemplateExpression(n.initializer)) {
        // Template with interpolations — extract raw text from source
        const start = n.initializer.getStart() + 1; // skip opening backtick
        const end = n.initializer.getEnd() - 1; // skip closing backtick
        result = content.slice(start, end);
      } else if (ts.isStringLiteral(n.initializer)) {
        result = n.initializer.text;
      }
    }

    ts.forEachChild(n, visit);
  };

  visit(node);
  return result;
}

function extractTemplateFromMethodBody(
  method: ts.MethodDeclaration,
  content: string,
): string | null {
  if (!method.body) return null;
  return extractTemplateFromRenderNode(method.body, content);
}

export function extractStoriesRegex(content: string): StoryEntry[] {
  const stories: StoryEntry[] = [];
  const exportRegex =
    /export\s+const\s+(\w+):\s*(?:Story|StoryObj<[^>]+>)\s*=\s*\{/g;
  let match: RegExpExecArray | null;

  while ((match = exportRegex.exec(content)) !== null) {
    const name = match[1];
    const startIdx = match.index + match[0].length;
    const storyBody = extractBalancedBlock(content, startIdx - 1);
    if (!storyBody) continue;

    const template = extractTemplateRegex(storyBody);

    const tagsMatch = storyBody.match(/tags:\s*\[([^\]]*)\]/);
    const tags = tagsMatch
      ? tagsMatch[1]
          .replace(/['"]/g, '')
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    const hasPlayFn = /play:\s*async/.test(storyBody);
    const argsOverrides = extractStoryArgsRegex(storyBody);

    stories.push({
      name,
      template: template ? cleanTemplate(template) : null,
      tags,
      hasPlayFn,
      argsOverrides,
    });
  }

  return stories;
}

function extractTemplateRegex(storyBody: string): string | null {
  const ternaryElse = extractTernaryElseBranch(storyBody);
  if (ternaryElse) return ternaryElse;

  const templateIdx = storyBody.indexOf('template:');
  if (templateIdx === -1) return null;

  let i = templateIdx + 'template:'.length;
  while (i < storyBody.length && storyBody[i] !== '`' && storyBody[i] !== "'")
    i++;
  if (i >= storyBody.length) return null;

  const quote = storyBody[i];
  if (quote === '`') {
    return extractTemplateLiteral(storyBody, i);
  }
  const end = storyBody.indexOf("'", i + 1);
  if (end === -1) return null;
  return storyBody.slice(i + 1, end);
}

function extractStoryArgsRegex(storyBody: string): ArgsOverride[] {
  const argsMatch = storyBody.match(/\n\s+args:\s*\{([^}]*)\}/);
  if (!argsMatch) return [];

  const pairs: ArgsOverride[] = [];
  const body = argsMatch[1];
  for (const line of body.split('\n')) {
    if (/\.\.\./.test(line)) continue;
    const pairMatch = line.match(/^\s*(\w+):\s*(.+?),?\s*$/);
    if (pairMatch) {
      pairs.push({
        name: pairMatch[1],
        value: pairMatch[2].replace(/,\s*$/, ''),
      });
    }
  }
  return pairs;
}

// ============================================================================
// Template utilities
// ============================================================================

/**
 * Extract the else-branch from a ternary inside a template literal.
 * Handles "unsupported combination" ternary guards.
 */
export function extractTernaryElseBranch(storyBody: string): string | null {
  const markers = [
    'isUnsupported',
    'isUnsupportedCombination',
    'Not Supported',
  ];
  const hasMarker = markers.some((m) => storyBody.includes(m));
  if (!hasMarker) return null;

  // Find the last `: ` followed by a backtick after a template context
  const colonIdx = storyBody.lastIndexOf(': `');
  if (colonIdx === -1) return null;

  const templateIdx = storyBody.indexOf('template:');
  if (templateIdx === -1 || colonIdx < templateIdx) return null;

  const backtickStart = storyBody.indexOf('`', colonIdx + 1);
  if (backtickStart === -1) return null;

  return extractTemplateLiteral(storyBody, backtickStart);
}

/**
 * Extract content of a template literal starting at the opening backtick.
 * Handles nested ${} expressions.
 */
function extractTemplateLiteral(
  source: string,
  openIdx: number,
): string | null {
  let i = openIdx + 1; // skip opening backtick
  let depth = 0;
  let result = '';

  while (i < source.length) {
    if (depth === 0 && source[i] === '`') {
      return result;
    }

    if (source[i] === '$' && i + 1 < source.length && source[i + 1] === '{') {
      depth++;
      result += '${';
      i += 2;
      continue;
    }

    if (depth > 0 && source[i] === '{') {
      depth++;
    }

    if (depth > 0 && source[i] === '}') {
      depth--;
      if (depth === 0) {
        result += '}';
        i++;
        continue;
      }
    }

    // Inside a nested expression, skip inner backtick strings
    if (depth > 0 && source[i] === '`') {
      i++;
      let innerDepth = 0;
      while (i < source.length) {
        if (innerDepth === 0 && source[i] === '`') {
          i++;
          break;
        }
        if (
          source[i] === '$' &&
          i + 1 < source.length &&
          source[i + 1] === '{'
        ) {
          innerDepth++;
          i += 2;
          continue;
        }
        if (innerDepth > 0 && source[i] === '}') {
          innerDepth--;
          i++;
          continue;
        }
        if (source[i] === '\\') i++;
        i++;
      }
      continue;
    }

    // Inside a nested expression, skip quoted strings
    if (depth > 0 && (source[i] === "'" || source[i] === '"')) {
      const q = source[i];
      i++;
      while (i < source.length && source[i] !== q) {
        if (source[i] === '\\') i++;
        i++;
      }
      i++; // skip closing quote
      continue;
    }

    result += source[i];
    i++;
  }

  return result || null;
}

/**
 * Extract balanced { } block starting at the opening brace position.
 */
function extractBalancedBlock(source: string, openIdx: number): string | null {
  let depth = 0;
  let i = openIdx;

  while (i < source.length && source[i] !== '{') i++;
  if (i >= source.length) return null;

  const start = i;
  for (; i < source.length; i++) {
    if (source[i] === '{') depth++;
    else if (source[i] === '}') {
      depth--;
      if (depth === 0) return source.slice(start, i + 1);
    }

    // Skip string literals
    if (source[i] === '`') {
      i++;
      while (i < source.length && source[i] !== '`') {
        if (source[i] === '\\') i++;
        i++;
      }
    } else if (source[i] === "'" || source[i] === '"') {
      const quote = source[i];
      i++;
      while (i < source.length && source[i] !== quote) {
        if (source[i] === '\\') i++;
        i++;
      }
    }
  }
  return null;
}

/**
 * Clean a template string:
 * - Replace ${...} interpolations with `...` placeholders
 * - Remove Storybook layout wrapper divs
 * - Normalize whitespace
 * Returns null if the cleaned result doesn't look like valid HTML
 * (e.g., programmatically generated templates with JS fragments).
 */
export function cleanTemplate(template: string): string | null {
  let t = template;

  // Replace argsToTemplate(args) with a meaningful marker before generic replacement
  t = t.replace(/\$\{argsToTemplate\([^)]*\)\}/g, '[all-meta-args-bound]');

  // Replace ${...} interpolations with placeholder
  t = t.replace(/\$\{[^}]*\}/g, '...');

  // Remove HTML comments
  t = t.replace(/<!--[\s\S]*?-->/g, '');

  // Remove ALL inline style attributes (storybook layout concerns, not component API)
  t = t.replace(/\s*style=["'][^"']*["']/gi, '');

  // Remove storybook layout wrapper divs (with class but layout-only) — strip opening AND closing tag
  t = t.replace(
    /<div\s+class="[^"]*(?:example-|tabgroup-)[^"]*">([\s\S]*?)<\/div>/gi,
    '$1',
  );

  // Collapse to single line: strip all newlines and excess whitespace
  t = t.replace(/\s+/g, ' ').trim();

  // Remove whitespace between tags (but not inside tags)
  t = t.replace(/>\s+</g, '><');

  // Detect programmatically generated templates (JS fragments, not HTML)
  if (!looksLikeHtml(t)) {
    return null;
  }

  return t;
}

/**
 * Check if a cleaned template string looks like valid HTML rather than
 * JS code fragments from programmatically generated templates.
 */
function looksLikeHtml(template: string): boolean {
  // Must contain at least one HTML tag
  if (!/<\w/.test(template)) return false;

  // JS artifacts that indicate a programmatic template
  const jsArtifacts = ['.join(', '.map(', '=>', 'function ', 'return '];
  const artifactCount = jsArtifacts.filter((a) => template.includes(a)).length;
  if (artifactCount >= 2) return false;

  return true;
}

// ============================================================================
// Slot extraction
// ============================================================================

/**
 * Scan templates for slot="name" patterns, deduplicate and sort alphabetically.
 */
export function extractSlotsFromTemplates(templates: string[]): string[] {
  const slots = new Set<string>();
  const slotRegex = /slot="([^"]+)"/g;

  for (const template of templates) {
    let match: RegExpExecArray | null;
    while ((match = slotRegex.exec(template)) !== null) {
      slots.add(match[1]);
    }
  }

  return [...slots].sort();
}

// ============================================================================
// Selector style detection
// ============================================================================

/**
 * Detect whether a component uses attribute-style or element-style selectors.
 */
export function detectSelectorStyle(
  content: string,
  kebabName: string,
): SelectorInfo {
  // Check for attribute usage: <button ds-{name}> or <a ds-{name}>
  const attrRegex = new RegExp(
    `<(?:button|a)\\s[^>]*\\bds-${escapeRegex(kebabName)}\\b`,
    'i',
  );
  if (attrRegex.test(content)) {
    return {
      style: 'attribute',
      selector: `ds-${kebabName}`,
      note: 'Applied as attribute on `<button>` or `<a>`',
    };
  }

  // Check for element usage: <ds-{name} followed by space, >, or newline
  const elemRegex = new RegExp(
    `<ds-${escapeRegex(kebabName)}(?=[\\s>/\\[])`,
    'i',
  );
  if (elemRegex.test(content)) {
    return { style: 'element', selector: `ds-${kebabName}` };
  }

  return { style: 'unknown', selector: `ds-${kebabName}` };
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ============================================================================
// Form integration detection
// ============================================================================

/**
 * Detect Angular form integration patterns in templates.
 */
export function detectFormIntegration(content: string): string[] {
  const patterns: string[] = [];
  if (/\[\(ngModel\)\]/.test(content))
    patterns.push('ngModel (template-driven)');
  if (/formControlName/.test(content))
    patterns.push('formControlName (reactive forms)');
  if (/formControl[^N]/.test(content))
    patterns.push('formControl (reactive forms)');
  return patterns;
}
