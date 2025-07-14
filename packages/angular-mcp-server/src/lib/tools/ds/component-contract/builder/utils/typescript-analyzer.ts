import * as ts from 'typescript';
import {
  MethodSignature,
  ParameterInfo,
  ImportInfo,
} from '../../shared/models/types.js';
import {
  DecoratorInputMeta,
  DecoratorOutputMeta,
  SignalInputMeta,
  SignalOutputMeta,
  ExtractedInputsOutputs,
} from '../models/types.js';
import { ParsedComponent } from '@push-based/angular-ast-utils';

/**
 * Angular lifecycle hooks that we can detect
 */
const LIFECYCLE_HOOKS = new Set<string>([
  'OnInit',
  'OnDestroy',
  'OnChanges',
  'DoCheck',
  'AfterContentInit',
  'AfterContentChecked',
  'AfterViewInit',
  'AfterViewChecked',
]);

/**
 * Utility: check whether a node has a given modifier
 */
const hasModifier = (
  node: { modifiers?: ts.NodeArray<ts.ModifierLike> },
  kind: ts.SyntaxKind,
): boolean => node.modifiers?.some((m) => m.kind === kind) ?? false;

/**
 * Extract public methods from a TypeScript class declaration
 */
export function extractPublicMethods(
  classNode: ts.ClassDeclaration,
  sourceFile: ts.SourceFile,
): Record<string, MethodSignature> {
  const methods: Record<string, MethodSignature> = {};

  for (const member of classNode.members) {
    if (!ts.isMethodDeclaration(member) || !ts.isIdentifier(member.name)) {
      continue;
    }

    const methodName = member.name.text;

    if (
      methodName.startsWith('ng') &&
      LIFECYCLE_HOOKS.has(methodName.slice(2))
    ) {
      continue;
    }

    if (
      hasModifier(member, ts.SyntaxKind.PrivateKeyword) ||
      hasModifier(member, ts.SyntaxKind.ProtectedKeyword)
    ) {
      continue;
    }

    methods[methodName] = {
      name: methodName,
      parameters: extractParameters(member.parameters, sourceFile),
      returnType: extractReturnType(member, sourceFile),
      isPublic: true,
      isStatic: hasModifier(member, ts.SyntaxKind.StaticKeyword),
      isAsync: hasModifier(member, ts.SyntaxKind.AsyncKeyword),
    };
  }

  return methods;
}

/**
 * Extract parameter information from method parameters
 */
function extractParameters(
  parameters: ts.NodeArray<ts.ParameterDeclaration>,
  sourceFile: ts.SourceFile,
): ParameterInfo[] {
  return parameters.map((param) => ({
    name: ts.isIdentifier(param.name) ? param.name.text : 'unknown',
    type: param.type?.getText(sourceFile) ?? 'any',
    optional: !!param.questionToken,
    defaultValue: param.initializer?.getText(sourceFile),
  }));
}

/**
 * Extract return type from method declaration
 */
function extractReturnType(
  method: ts.MethodDeclaration,
  sourceFile: ts.SourceFile,
): string {
  return (
    method.type?.getText(sourceFile) ??
    (hasModifier(method, ts.SyntaxKind.AsyncKeyword) ? 'Promise<any>' : 'any')
  );
}

/**
 * Extract implemented Angular lifecycle hooks
 */
export function extractLifecycleHooks(
  classNode: ts.ClassDeclaration,
): string[] {
  const implementedHooks = new Set<string>();

  if (classNode.heritageClauses) {
    for (const heritage of classNode.heritageClauses) {
      if (heritage.token === ts.SyntaxKind.ImplementsKeyword) {
        for (const type of heritage.types) {
          if (ts.isIdentifier(type.expression)) {
            const interfaceName = type.expression.text;
            if (LIFECYCLE_HOOKS.has(interfaceName)) {
              implementedHooks.add(interfaceName);
            }
          }
        }
      }
    }
  }

  for (const member of classNode.members) {
    if (ts.isMethodDeclaration(member) && ts.isIdentifier(member.name)) {
      const methodName = member.name.text;
      if (
        methodName.startsWith('ng') &&
        LIFECYCLE_HOOKS.has(methodName.slice(2))
      ) {
        implementedHooks.add(methodName.slice(2));
      }
    }
  }

  return Array.from(implementedHooks);
}

/**
 * Extract TypeScript class declaration from parsed component
 * This function finds the class node from the component's source file
 */
export function extractClassDeclaration(
  parsedComponent: ParsedComponent,
): ts.ClassDeclaration | null {
  if (!parsedComponent.fileName) {
    return null;
  }

  try {
    const program = ts.createProgram([parsedComponent.fileName], {
      target: ts.ScriptTarget.Latest,
      module: ts.ModuleKind.ESNext,
      experimentalDecorators: true,
    });

    const sourceFile = program.getSourceFile(parsedComponent.fileName);
    if (!sourceFile) {
      return null;
    }

    const classNode = findClassDeclaration(
      sourceFile,
      parsedComponent.className,
    );
    return classNode;
  } catch (ctx) {
    console.warn(
      `Failed to extract class declaration for ${parsedComponent.className}:`,
      ctx,
    );
    return null;
  }
}

/**
 * Find class declaration by name in source file
 */
function findClassDeclaration(
  sourceFile: ts.SourceFile,
  className: string,
): ts.ClassDeclaration | null {
  let foundClass: ts.ClassDeclaration | null = null;

  function visit(node: ts.Node) {
    if (
      ts.isClassDeclaration(node) &&
      node.name &&
      node.name.text === className
    ) {
      foundClass = node;
      return;
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return foundClass;
}

/**
 * Extract import statements from source file
 */
export function extractImports(sourceFile: ts.SourceFile): ImportInfo[] {
  const imports: ImportInfo[] = [];

  function visit(node: ts.Node) {
    if (ts.isImportDeclaration(node) && node.moduleSpecifier) {
      const moduleSpecifier = node.moduleSpecifier;
      if (ts.isStringLiteral(moduleSpecifier)) {
        if (node.importClause) {
          if (node.importClause.name) {
            imports.push({
              name: node.importClause.name.text,
              path: moduleSpecifier.text,
            });
          }

          if (node.importClause.namedBindings) {
            if (ts.isNamespaceImport(node.importClause.namedBindings)) {
              imports.push({
                name: node.importClause.namedBindings.name.text,
                path: moduleSpecifier.text,
              });
            } else if (ts.isNamedImports(node.importClause.namedBindings)) {
              for (const element of node.importClause.namedBindings.elements) {
                imports.push({
                  name: element.name.text,
                  path: moduleSpecifier.text,
                });
              }
            }
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return imports;
}

// Helper: determine if class member is a public property with identifier name
function isPublicProp(
  member: ts.ClassElement,
): member is ts.PropertyDeclaration & { name: ts.Identifier } {
  return (
    ts.isPropertyDeclaration(member) &&
    ts.isIdentifier(member.name) &&
    !hasModifier(member, ts.SyntaxKind.PrivateKeyword) &&
    !hasModifier(member, ts.SyntaxKind.ProtectedKeyword)
  );
}

export function extractInputsAndOutputs(
  classNode: ts.ClassDeclaration,
  sourceFile: ts.SourceFile,
): ExtractedInputsOutputs {
  const inputs: Record<string, DecoratorInputMeta | SignalInputMeta> = {};
  const outputs: Record<string, DecoratorOutputMeta | SignalOutputMeta> = {};

  for (const member of classNode.members) {
    if (!isPublicProp(member)) continue;

    const name = member.name.text;
    const { isInput, isOutput, type, required, alias } =
      extractDecoratorInputsOutputs(member, sourceFile);

    if (isInput) inputs[name] = { name, type, required, alias } as any;
    if (isOutput) outputs[name] = { name, type, alias } as any;

    const init = member.initializer;
    if (
      !init ||
      !ts.isCallExpression(init) ||
      !ts.isIdentifier(init.expression)
    ) {
      continue;
    }

    switch (init.expression.text) {
      case 'input':
        inputs[name] = {
          name,
          ...(extractSignalInputMetadata(init, member, sourceFile) as any),
        } as any;
        break;
      case 'output':
        outputs[name] = {
          name,
          ...(extractSignalOutputMetadata(init, member, sourceFile) as any),
        } as any;
        break;
    }
  }

  return { inputs, outputs };
}

function extractDecoratorInputsOutputs(
  member: ts.PropertyDeclaration,
  sourceFile: ts.SourceFile,
): {
  isInput: boolean;
  isOutput: boolean;
  type?: string;
  required?: boolean;
  alias?: string;
} {
  let isInput = false,
    isOutput = false,
    alias: string | undefined,
    required = false;

  member.modifiers?.forEach((mod) => {
    if (!ts.isDecorator(mod)) return;

    const kind = getDecoratorName(mod); // 'Input' | 'Output' | null
    if (!kind) return;

    const args = getDecoratorArguments(mod);
    const first = args[0];

    if (first && ts.isStringLiteral(first)) {
      alias = first.text;
    }

    if (kind === 'Input') {
      isInput = true;
      if (first && ts.isObjectLiteralExpression(first)) {
        first.properties.forEach((p) => {
          if (!ts.isPropertyAssignment(p) || !ts.isIdentifier(p.name)) return;
          if (p.name.text === 'alias' && ts.isStringLiteral(p.initializer)) {
            alias = p.initializer.text;
          }
          if (p.name.text === 'required') {
            required = p.initializer.kind === ts.SyntaxKind.TrueKeyword;
          }
        });
      }
    } else if (kind === 'Output') {
      isOutput = true;
    }
  });

  const type = extractPropertyType(member, sourceFile, isOutput);

  return { isInput, isOutput, type, required, alias };
}

function getDecoratorName(decorator: ts.Decorator): string | null {
  if (ts.isCallExpression(decorator.expression)) {
    if (ts.isIdentifier(decorator.expression.expression)) {
      return decorator.expression.expression.text;
    }
  } else if (ts.isIdentifier(decorator.expression)) {
    return decorator.expression.text;
  }
  return null;
}

function getDecoratorArguments(decorator: ts.Decorator): ts.Expression[] {
  if (ts.isCallExpression(decorator.expression)) {
    return Array.from(decorator.expression.arguments);
  }
  return [];
}

function extractPropertyType(
  member: ts.PropertyDeclaration,
  sourceFile: ts.SourceFile,
  isOutput = false,
): string {
  if (member.type) {
    const typeText = member.type.getText(sourceFile);
    return typeText;
  }

  if (member.initializer) {
    if (ts.isNewExpression(member.initializer)) {
      const expression = member.initializer.expression;
      if (ts.isIdentifier(expression)) {
        if (expression.text === 'EventEmitter') {
          if (
            member.initializer.typeArguments &&
            member.initializer.typeArguments.length > 0
          ) {
            return `EventEmitter<${member.initializer.typeArguments[0].getText(sourceFile)}>`;
          }
          return 'EventEmitter<any>';
        }
      }
    }
  }

  if (isOutput) {
    return 'EventEmitter<any>';
  }
  return 'any';
}

function extractSignalInputMetadata(
  callExpression: ts.CallExpression,
  propertyDeclaration: ts.PropertyDeclaration,
  sourceFile: ts.SourceFile,
): Omit<SignalInputMeta, 'name'> {
  const meta: Omit<SignalInputMeta, 'name'> = {};

  meta.type = extractInputType(callExpression, propertyDeclaration, sourceFile);

  if (callExpression.arguments.length > 0) {
    const firstArg = callExpression.arguments[0];
    meta.defaultValue = firstArg.getText(sourceFile);
    meta.required = false;
  } else {
    meta.required = true;
  }

  if (callExpression.arguments.length > 1) {
    const optionsArg = callExpression.arguments[1];
    if (ts.isObjectLiteralExpression(optionsArg)) {
      for (const property of optionsArg.properties) {
        if (
          ts.isPropertyAssignment(property) &&
          ts.isIdentifier(property.name)
        ) {
          const propName = property.name.text;
          if (propName === 'transform') {
            meta.transform = property.initializer.getText(sourceFile);
          }
        }
      }
    }
  }

  return meta;
}

function extractSignalOutputMetadata(
  callExpression: ts.CallExpression,
  propertyDeclaration: ts.PropertyDeclaration,
  sourceFile: ts.SourceFile,
): Omit<SignalOutputMeta, 'name'> {
  const meta: Omit<SignalOutputMeta, 'name'> = {};

  meta.type = extractOutputType(
    callExpression,
    propertyDeclaration,
    sourceFile,
  );

  return meta;
}

function extractInputType(
  callExpression: ts.CallExpression,
  propertyDeclaration: ts.PropertyDeclaration,
  sourceFile: ts.SourceFile,
): string {
  if (callExpression.typeArguments && callExpression.typeArguments.length > 0) {
    return callExpression.typeArguments[0].getText(sourceFile);
  }

  if (propertyDeclaration.type) {
    return extractTypeFromInputSignal(propertyDeclaration.type, sourceFile);
  }

  return 'any';
}

function extractOutputType(
  callExpression: ts.CallExpression,
  propertyDeclaration: ts.PropertyDeclaration,
  sourceFile: ts.SourceFile,
): string {
  if (callExpression.typeArguments && callExpression.typeArguments.length > 0) {
    return `EventEmitter<${callExpression.typeArguments[0].getText(sourceFile)}>`;
  }

  if (propertyDeclaration.type) {
    return extractTypeFromOutputEmitter(propertyDeclaration.type, sourceFile);
  }

  return 'EventEmitter<any>';
}

function extractTypeFromInputSignal(
  typeNode: ts.TypeNode,
  sourceFile: ts.SourceFile,
): string {
  if (
    ts.isTypeReferenceNode(typeNode) &&
    typeNode.typeArguments &&
    typeNode.typeArguments.length > 0
  ) {
    return typeNode.typeArguments[0].getText(sourceFile);
  }
  return typeNode.getText(sourceFile);
}

function extractTypeFromOutputEmitter(
  typeNode: ts.TypeNode,
  sourceFile: ts.SourceFile,
): string {
  if (
    ts.isTypeReferenceNode(typeNode) &&
    typeNode.typeArguments &&
    typeNode.typeArguments.length > 0
  ) {
    return `EventEmitter<${typeNode.typeArguments[0].getText(sourceFile)}>`;
  }
  return `EventEmitter<${typeNode.getText(sourceFile)}>`;
}

export const extractSignalInputsAndOutputs = extractInputsAndOutputs;
