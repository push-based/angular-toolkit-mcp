import { classDecoratorVisitor } from './decorator-config.visitor.js';
import * as ts from 'typescript';

describe('DecoratorConfigVisitor', () => {
  it.skip('should not find class when it is not a class-binding', async () => {
    const sourceCode = `
  class Example {
    method() {}
  }

  function greet() {
    console.log('Hello');
  }

  let x = 123;
`;

    const sourceFile = ts.createSourceFile(
      'example.ts',
      sourceCode,
      ts.ScriptTarget.Latest,
      true,
    );

    const visitor = await classDecoratorVisitor({ sourceFile });
    ts.visitEachChild(sourceFile, visitor, undefined);

    expect(visitor.components).toEqual([]);
  });

  it('should not find class when it is not a class-binding', async () => {
    const sourceCode = `
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'minimal';
}
`;

    const sourceFile = ts.createSourceFile(
      'example.ts',
      sourceCode,
      ts.ScriptTarget.Latest,
      true,
    );
    const visitor = await classDecoratorVisitor({ sourceFile });

    ts.visitEachChild(sourceFile, visitor, undefined);

    expect(visitor.components).toStrictEqual([
      expect.objectContaining({
        className: 'AppComponent',
        fileName: 'example.ts',
        startLine: 4,
        selector: 'app-root',
        imports: '[RouterOutlet]',
        styleUrls: [
          expect.objectContaining({
            startLine: 8,
            filePath: 'example.ts',
          }),
        ],
        templateUrl: expect.objectContaining({
          startLine: 7,
          filePath: 'example.ts',
        }),
      }),
    ]);
  });
});
