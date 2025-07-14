import { describe, expect } from 'vitest';
import { tmplAstElementToSource } from './utils';
import type { TmplAstElement } from '@angular/compiler' with { 'resolution-mode': 'import' };

describe('tmplAstElementToSource', () => {
  let parseTemplate: typeof import('@angular/compiler').parseTemplate;
  beforeAll(async () => {
    parseTemplate = (await import('@angular/compiler')).parseTemplate;
  });
  it('should have line number starting from 1', () => {
    const result = parseTemplate(
      `<button class="btn">click</button>`,
      'inline-template.component.ts',
    );
    const attribute = result.nodes.at(0) as TmplAstElement;
    const source = tmplAstElementToSource(attribute);
    expect(source).toStrictEqual({
      file: 'inline-template.component.ts',
      position: {
        startLine: 1,
      },
    });
  });

  it('should have line number where startLine is respected', () => {
    const result = parseTemplate(
      `<button class="btn">click</button>`,
      'template.html',
    );
    const attribute = (result.nodes.at(0) as TmplAstElement)?.attributes.at(0);

    const source = tmplAstElementToSource(attribute);

    expect(source).toStrictEqual({
      file: expect.stringMatching(/template\.html$/),
      position: {
        startLine: 5,
        startColumn: 1,
        endLine: 5,
        endColumn: 19,
      },
    });
  });

  it('should have correct line number for starting line breaks', () => {
    const result = parseTemplate(
      `

<button class="btn">click</button>`,
      'template.html',
    );
    const attribute = (result.nodes.at(0) as TmplAstElement)?.attributes.at(0);
    const source = tmplAstElementToSource(attribute);

    expect(source).toStrictEqual({
      file: expect.stringMatching(/template\.html/),
      position: {
        startLine: 3,
        startColumn: 1,
        endLine: 3,
        endColumn: 19,
      },
    });
  });

  it('should have correct line number for spans', () => {
    const result = parseTemplate(
      `<button class="btn">
  click
</button>`,
      'template.html',
    );
    const attribute = result.nodes.at(0)?.attributes.at(0);
    const source = tmplAstElementToSource(attribute);

    expect(source).toStrictEqual({
      file: expect.stringMatching(/template\.html$/),
      position: {
        startLine: 1,
        startColumn: 1,
        endLine: 4,
        endColumn: 1,
      },
    });
  });
});
