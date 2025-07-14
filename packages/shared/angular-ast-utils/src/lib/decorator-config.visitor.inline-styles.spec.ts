/* eslint-disable prefer-const */
import { describe, it, expect } from 'vitest';
import * as ts from 'typescript';
import { classDecoratorVisitor } from './decorator-config.visitor.js';

describe('DecoratorConfigVisitor - inline styles', () => {
  it('extracts inline styles when styles is provided as single string', async () => {
    const source = [
      "import { Component } from '@angular/core';",
      '@Component({',
      "  selector: 'x-comp',",
      '  styles: `',
      '    .btn { color: red; }',
      '  `',
      '})',
      'export class XComponent {}',
    ].join('\n');

    const sourceFile = ts.createSourceFile(
      'cmp.ts',
      source,
      ts.ScriptTarget.Latest,
      true,
    );

    const visitor = await classDecoratorVisitor({ sourceFile });
    ts.visitEachChild(sourceFile, visitor, undefined);

    expect(visitor.components).toHaveLength(1);
    const cmp = visitor.components[0] as any;
    expect(cmp.styles).toBeDefined();
    expect(Array.isArray(cmp.styles)).toBe(true);
    expect(cmp.styles.length).toBe(1);
    expect(cmp.styles[0]).toEqual(
      expect.objectContaining({ filePath: 'cmp.ts' }),
    );
  });
});
