import { toUnixPath } from '@push-based/utils';
import * as ts from 'typescript';

import { classDecoratorVisitor } from './decorator-config.visitor.js';
import { ParsedComponent } from './types.js';

/**
 * Parses Angular components from a `FastFindInFiles` result.
 * It uses `typescript` to parse the components source files and extract the decorators.
 * From the decorators, it extracts the `@Component` decorator and its properties.
 * The used properties are `templateUrl`, `template`, `styles`, and `styleUrls`.
 *
 * @param files
 */
export async function parseComponents(
  files: string[],
): Promise<ParsedComponent[]> {
  const filePaths = new Set(files.map((filePath) => toUnixPath(filePath)));

  const program = ts.createProgram([...filePaths], {
    target: ts.ScriptTarget.Latest,
    module: ts.ModuleKind.ESNext,
    experimentalDecorators: true,
  });

  const sourceFiles: ts.SourceFile[] = program
    .getSourceFiles()
    .filter((file: ts.SourceFile) => filePaths.has(file.fileName));

  const results: ParsedComponent[] = [];
  //sourceFiles
  for (const sourceFile of sourceFiles) {
    const visitor = await classDecoratorVisitor({ sourceFile });

    ts.visitEachChild(sourceFile, visitor, undefined);
    results.push(...visitor.components);
  }

  return results;
}
