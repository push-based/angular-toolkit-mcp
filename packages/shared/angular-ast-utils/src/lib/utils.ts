import * as ts from 'typescript';
import { removeQuotes } from '@push-based/typescript-ast-utils';
import { AngularUnit, Asset } from './types.js';

export function assetFromPropertyValueInitializer<T>({
  prop,
  sourceFile,
  textParser,
}: {
  prop: ts.PropertyAssignment;
  sourceFile: ts.SourceFile;
  textParser: (text: string) => Promise<T>;
}): Asset<T> {
  const { line: startLine } = sourceFile.getLineAndCharacterOfPosition(
    prop.getStart(sourceFile),
  );
  const value = removeQuotes(prop.initializer, sourceFile);
  return {
    filePath: sourceFile.fileName,
    startLine,
    parse: () => textParser(value),
  } satisfies Asset<T>;
}

export function assetFromPropertyArrayInitializer<T>(
  prop: ts.PropertyAssignment,
  sourceFile: ts.SourceFile,
  textParser: (text: string) => Promise<T>,
): Asset<T>[] {
  const elements: ts.NodeArray<ts.Expression> = ts.isArrayLiteralExpression(
    prop.initializer,
  )
    ? prop.initializer.elements
    : ts.factory.createNodeArray();

  return elements.map((element) => {
    const { line: startLine } = sourceFile.getLineAndCharacterOfPosition(
      element.getStart(sourceFile),
    );
    const value = removeQuotes(element, sourceFile);
    return {
      filePath: sourceFile.fileName,
      startLine,
      parse: () => textParser(value),
    } satisfies Asset<T>;
  });
}

import { findFilesWithPattern } from '@push-based/utils';
import { parseComponents } from './parse-component';

const unitToSearchPattern = {
  component: '@Component',
  directive: '@Directive',
  pipe: '@Pipe',
  service: '@Service',
} as const satisfies Record<AngularUnit, string>;

export async function findAngularUnits(
  directory: string,
  unit: AngularUnit,
): Promise<string[]> {
  const searchPattern =
    unitToSearchPattern[unit] ?? unitToSearchPattern.component;
  return await findFilesWithPattern(directory, searchPattern);
}

/**
 * Parse Angular units in a given directory.
 *
 * @param directory
 * @param unit
 */
export async function parseAngularUnit(directory: string, unit: AngularUnit) {
  const componentFiles = await findAngularUnits(directory, unit);

  switch (unit) {
    case 'component':
      return parseComponents(componentFiles);
    default:
      throw new Error(`Unit ${unit} is not supported for parsing.`);
  }
}
