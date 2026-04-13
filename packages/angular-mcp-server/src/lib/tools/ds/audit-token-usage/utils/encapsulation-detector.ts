import * as ts from 'typescript';
import { readFile, access } from 'node:fs/promises';
import * as path from 'node:path';
import {
  getDecorators,
  isComponentDecorator,
} from '@push-based/typescript-ast-utils';

/**
 * Scans for .ts files adjacent to the given style files and detects
 * components with ViewEncapsulation.None.
 *
 * Convention: `foo.component.scss` → `foo.component.ts`
 *
 * Returns a Set of style file paths whose component uses None encapsulation.
 */
export async function detectViewEncapsulationNone(
  styleFiles: string[],
): Promise<Set<string>> {
  const result = new Set<string>();

  for (const styleFile of styleFiles) {
    const dir = path.dirname(styleFile);
    const baseName = path.basename(styleFile, path.extname(styleFile));
    // Convention: foo.component.scss → foo.component.ts
    const tsFile = path.join(dir, baseName + '.ts');

    try {
      await access(tsFile);
    } catch {
      continue;
    }

    const content = await readFile(tsFile, 'utf-8');
    const sourceFile = ts.createSourceFile(
      tsFile,
      content,
      ts.ScriptTarget.Latest,
      true,
    );

    ts.forEachChild(sourceFile, (node) => {
      if (ts.isClassDeclaration(node)) {
        const decorators = getDecorators(node);
        for (const decorator of decorators) {
          if (isComponentDecorator(decorator)) {
            if (hasEncapsulationNone(decorator)) {
              result.add(styleFile);
            }
          }
        }
      }
    });
  }

  return result;
}

/**
 * Checks whether a @Component decorator contains `encapsulation: ViewEncapsulation.None`.
 */
function hasEncapsulationNone(decorator: ts.Decorator): boolean {
  const expr = decorator.expression;
  if (!ts.isCallExpression(expr)) return false;

  for (const arg of expr.arguments) {
    if (!ts.isObjectLiteralExpression(arg)) continue;
    for (const prop of arg.properties) {
      if (
        ts.isPropertyAssignment(prop) &&
        prop.name.getText() === 'encapsulation'
      ) {
        const value = prop.initializer.getText();
        if (value.includes('None')) return true;
      }
    }
  }
  return false;
}
