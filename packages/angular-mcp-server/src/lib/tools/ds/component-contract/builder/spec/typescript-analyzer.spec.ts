import { describe, it, expect } from 'vitest';

import ts from 'typescript';

import {
  extractPublicMethods,
  extractLifecycleHooks,
  extractImports,
} from '../utils/typescript-analyzer.js';

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function parseSource(code: string, fileName = 'comp.ts') {
  return ts.createSourceFile(
    fileName,
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
}

function getFirstClass(sourceFile: ts.SourceFile): ts.ClassDeclaration {
  const cls = sourceFile.statements.find(ts.isClassDeclaration);
  if (!cls) throw new Error('Class not found');
  return cls;
}

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

describe('typescript-analyzer utilities', () => {
  it('extractPublicMethods returns only public non-lifecycle methods', () => {
    const code = `
      class MyComponent {
        foo(a: number): void {}
        private hidden() {}
        protected prot() {}
        ngOnInit() {}
        static util() {}
        async fetchData() {}
      }
    `;

    const sf = parseSource(code);
    const cls = getFirstClass(sf);

    const methods = extractPublicMethods(cls, sf);

    expect(methods).toHaveProperty('foo');
    expect(methods).toHaveProperty('util');
    expect(methods).toHaveProperty('fetchData');
    expect(methods).not.toHaveProperty('hidden');
    expect(methods).not.toHaveProperty('prot');
    expect(methods).not.toHaveProperty('ngOnInit');

    const foo = methods.foo;
    expect(foo.parameters[0]).toEqual(
      expect.objectContaining({ name: 'a', type: 'number' }),
    );
    expect(foo.isStatic).toBe(false);
    expect(foo.isAsync).toBe(false);

    expect(methods.util.isStatic).toBe(true);
    expect(methods.fetchData.isAsync).toBe(true);
  });

  it('extractLifecycleHooks detects implemented and method-based hooks', () => {
    const code = `
      interface OnInit { ngOnInit(): void; }
      class MyComponent implements OnInit {
        ngOnInit() {}
        ngAfterViewInit() {}
        foo() {}
      }
    `;

    const sf = parseSource(code);
    const cls = getFirstClass(sf);

    const hooks = extractLifecycleHooks(cls);
    expect(hooks).toEqual(expect.arrayContaining(['OnInit', 'AfterViewInit']));
  });

  it('extractImports lists imported symbols with their paths', () => {
    const code = `
      import { HttpClient } from '@angular/common/http';
      import * as _ from 'lodash';
      import defaultExport from 'lib';
      import { MatButtonModule as MB } from '@angular/material/button';
    `;

    const sf = parseSource(code);
    const imports = extractImports(sf);

    expect(imports).toEqual(
      expect.arrayContaining([
        { name: 'HttpClient', path: '@angular/common/http' },
        { name: '_', path: 'lodash' },
        { name: 'defaultExport', path: 'lib' },
        { name: 'MB', path: '@angular/material/button' },
      ]),
    );
  });
});
