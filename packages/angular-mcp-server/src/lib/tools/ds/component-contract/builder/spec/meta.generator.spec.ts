import { describe, it, expect } from 'vitest';

import { generateMeta } from '../utils/meta.generator.js';

interface ParsedComponentStub {
  className?: string;
  selector?: string;
}

describe('generateMeta', () => {
  const templatePath = 'src/app/foo.component.html';

  it('uses parsed component className and selector when provided', () => {
    const parsedComponent: ParsedComponentStub = {
      className: 'FooComponent',
      selector: 'app-foo',
    };

    const meta = generateMeta(templatePath, parsedComponent as any, false);

    expect(meta.name).toBe('FooComponent');
    expect(meta.selector).toBe('app-foo');
    expect(meta.sourceFile).toBe(templatePath);
    expect(meta.templateType).toBe('external');
    expect(meta.hash).toBe('');
    expect(typeof meta.generatedAt).toBe('string');
  });

  it('falls back to filename when className or selector missing', () => {
    const parsedComponent: ParsedComponentStub = {};

    const meta = generateMeta(templatePath, parsedComponent as any);

    expect(meta.name).toBe('foo.component');
    expect(meta.selector).toBe('.foo.component');
  });

  it('sets templateType to inline when flag is true', () => {
    const parsedComponent: ParsedComponentStub = {};

    const meta = generateMeta(templatePath, parsedComponent as any, true);

    expect(meta.templateType).toBe('inline');
  });
});
