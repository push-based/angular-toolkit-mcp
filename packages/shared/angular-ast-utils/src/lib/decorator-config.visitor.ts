import * as path from 'node:path';
import * as ts from 'typescript';

import { ParsedComponent } from './types.js';
import { parseStylesheet } from '@push-based/styles-ast-utils';
import { resolveFile } from '@push-based/utils';
import {
  visitAngularDecoratorProperties,
  visitAngularDecorators,
} from './ts.walk.js';
import {
  assetFromPropertyArrayInitializer,
  assetFromPropertyValueInitializer,
} from './utils.js';
import {
  isComponentDecorator,
  removeQuotes,
} from '@push-based/typescript-ast-utils';
import type {
  ParsedTemplate,
  ParseTemplateOptions,
} from '@angular/compiler' with { 'resolution-mode': 'import' };

const DEBUG = false;
const debug = ({
  step,
  title,
  info,
}: {
  step: string;
  title: string;
  info: string | null | undefined;
}) =>
  DEBUG &&
  console.log(
    `─── 📌 [${step}]: ${title} ${info ? '-' + info : ''}──────────────────────────────`,
  );

export async function classDecoratorVisitor({
  sourceFile,
}: {
  sourceFile: ts.SourceFile;
}) {
  // @TODO: rethink module resolution
  const { parseTemplate } = await import('@angular/compiler');
  const components: ParsedComponent[] = [];
  let activeComponent: ParsedComponent | null = null;
  let currentClassName: string | null = null;

  const visitor = (node: ts.Node): ts.VisitResult<ts.Node> => {
    // ─── 📌 ENTER: Class Declaration ──────────────────────────────
    if (ts.isClassDeclaration(node)) {
      currentClassName = node.name?.text ?? 'Unknown'; // Capture class name immediately
      debug({
        step: 'ENTER',
        title: 'ClassDeclaration',
        info: `class ${currentClassName}`,
      });

      activeComponent = {
        startLine: ts.getLineAndCharacterOfPosition(
          sourceFile,
          node.getStart(sourceFile),
        ).line,
        className: currentClassName,
        fileName: sourceFile.fileName,
      } as ParsedComponent;

      visitAngularDecorators(node, (decorator: ts.Decorator) => {
        debug({
          step: 'ENTER',
          title: 'ClassDecorators',
          info: 'of ' + currentClassName,
        });
        if (isComponentDecorator(decorator)) {
          debug({
            step: 'ENTER',
            title: 'ClassDecorator',
            info: '@Component',
          });
          visitAngularDecoratorProperties(
            decorator,
            (prop: ts.PropertyAssignment) => {
              if (
                !ts.isPropertyAssignment(prop) ||
                !ts.isIdentifier(prop.name)
              ) {
                return;
              }

              const propName = prop.name.escapedText as string;
              const getPropValue = getPropValueFactory(parseTemplate);
              const propValue = getPropValue(
                prop,
                sourceFile,
                currentClassName ?? 'undefined-class',
              );
              if (activeComponent) {
                (activeComponent as ParsedComponent)[propName] =
                  propValue as unknown as string;

                debug({
                  step: 'Update',
                  title: 'ParsedComponent',
                  info: `add ${propName}`,
                });
              }
            },
          );

          if (activeComponent) {
            debug({
              step: 'PUSH',
              title: 'ParsedComponent',
              info: `add ${activeComponent.className}`,
            });
            components.push(activeComponent);
            activeComponent = null;
          }
        }
      });

      debug({
        step: 'EXIT',
        title: 'ClassDeclaration',
        info: `class ${currentClassName}`,
      });
      currentClassName = null;
    }
    return node;
  };

  visitor.components = components;
  return visitor;
}

function getPropValueFactory(
  parseTemplate: (
    template: string,
    templateUrl: string,
    options?: ParseTemplateOptions,
  ) => ParsedTemplate,
) {
  return (
    prop: ts.PropertyAssignment,
    sourceFile: ts.SourceFile,
    currentClassName: string,
  ): string | unknown => {
    let propName = '';
    if (ts.isIdentifier(prop.name)) {
      propName = prop.name.escapedText as string;
    } else {
      throw new Error('Property name is not an identifier');
    }
    switch (propName) {
      case 'templateUrl':
      case 'template':
        return assetFromPropertyValueInitializer({
          prop,
          sourceFile,
          textParser: async (text: string) => {
            const filePath =
              propName === 'templateUrl'
                ? path.join(path.dirname(sourceFile.fileName), text)
                : sourceFile.fileName;
            const content =
              propName === 'templateUrl' ? await resolveFile(filePath) : text;

            debug({
              step: 'RESOLVE',
              title: 'Template',
              info: `${currentClassName}; file ${filePath}`,
            });

            return parseTemplate(content, filePath, {
              preserveWhitespaces: true,
              preserveLineEndings: true,
              // preserveSignificantWhitespace: true,
            });
          },
        });
      case 'styleUrl':
        return assetFromPropertyValueInitializer({
          prop,
          sourceFile,
          textParser: async (text: string) => {
            const filePath = path.join(path.dirname(sourceFile.fileName), text);
            const content = await resolveFile(filePath);

            debug({
              step: 'RESOLVE',
              title: 'styleUrl',
              info: `${currentClassName}; file ${filePath}`,
            });
            return parseStylesheet(content, filePath);
          },
        });
      case 'styles':
        if (ts.isArrayLiteralExpression(prop.initializer)) {
          return assetFromPropertyArrayInitializer(
            prop,
            sourceFile,
            async (text: string) => {
              debug({
                step: 'RESOLVE',
                title: 'Styles',
                info: `${currentClassName}; inline-array`,
              });
              return parseStylesheet(text, sourceFile.fileName);
            },
          );
        }

        return [
          assetFromPropertyValueInitializer({
            prop,
            sourceFile,
            textParser: async (text: string) => {
              debug({
                step: 'RESOLVE',
                title: 'Styles',
                info: `${currentClassName}; inline-single`,
              });
              return parseStylesheet(text, sourceFile.fileName);
            },
          }),
        ];
      case 'styleUrls':
        return assetFromPropertyArrayInitializer(
          prop,
          sourceFile,
          async (text: string) => {
            const filePath = path.join(path.dirname(sourceFile.fileName), text);
            const content = await resolveFile(filePath);

            debug({
              step: 'RESOLVE',
              title: 'styleUrls',
              info: `${currentClassName}; file ${filePath}`,
            });
            return parseStylesheet(content, filePath);
          },
        );
      default:
        // @TODO: Implement all of the decorator props
        return removeQuotes(prop.initializer, sourceFile);
    }
  };
}
