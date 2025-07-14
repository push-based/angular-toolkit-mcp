import { describe, it, expect } from 'vitest';

import {
  extractBindings,
  extractAttributes,
  extractEvents,
} from '../utils/element-helpers.js';

type MockASTWithSource = { source: string };

type MockPosition = {
  offset: number;
  file: { url: string };
};

type MockSourceSpan = {
  start: MockPosition;
  end: MockPosition;
};

function makeSourceSpan(
  start: number,
  end: number,
  fileUrl = '/comp.html',
): MockSourceSpan {
  return {
    start: { offset: start, file: { url: fileUrl } },
    end: { offset: end, file: { url: fileUrl } },
  };
}

interface MockInput {
  name: string;
  value: MockASTWithSource;
  sourceSpan?: MockSourceSpan;
}

interface MockAttribute {
  name: string;
  value: string;
}

interface MockOutput {
  name: string;
  handler: MockASTWithSource;
}

interface MockElement {
  inputs: MockInput[];
  attributes: MockAttribute[];
  outputs: MockOutput[];
}

function createElement(partial: Partial<MockElement>): MockElement {
  return {
    inputs: [],
    attributes: [],
    outputs: [],
    ...partial,
  } as MockElement;
}

describe('element-helpers', () => {
  describe('extractBindings', () => {
    it('class, style, attribute, and property binding types are detected', () => {
      const element = createElement({
        inputs: [
          { name: 'class.foo', value: { source: 'cond' } },
          { name: 'style.color', value: { source: 'expr' } },
          { name: 'attr.data-id', value: { source: 'id' } },
          { name: 'value', value: { source: 'val' } },
        ],
      });

      const bindings = extractBindings(element as any);

      expect(bindings).toEqual([
        {
          type: 'class',
          name: 'class.foo',
          source: 'cond',
          sourceSpan: undefined,
        },
        {
          type: 'style',
          name: 'style.color',
          source: 'expr',
          sourceSpan: undefined,
        },
        {
          type: 'attribute',
          name: 'attr.data-id',
          source: 'id',
          sourceSpan: undefined,
        },
        {
          type: 'property',
          name: 'value',
          source: 'val',
          sourceSpan: undefined,
        },
      ]);
    });

    it('maps sourceSpan information', () => {
      const span = makeSourceSpan(5, 15);
      const element = createElement({
        inputs: [
          { name: 'value', value: { source: 'expr' }, sourceSpan: span },
        ],
      });

      const [binding] = extractBindings(element as any);
      expect(binding.sourceSpan).toEqual({
        start: 5,
        end: 15,
        file: '/comp.html',
      });
    });
  });

  describe('extractAttributes', () => {
    it('returns attribute objects with type="attribute"', () => {
      const element = createElement({
        attributes: [
          { name: 'id', value: 'root' },
          { name: 'role', value: 'banner' },
        ],
      });

      const attrs = extractAttributes(element as any);
      expect(attrs).toEqual([
        { type: 'attribute', name: 'id', source: 'root' },
        { type: 'attribute', name: 'role', source: 'banner' },
      ]);
    });
  });

  describe('extractEvents', () => {
    it('returns event objects with handler source', () => {
      const element = createElement({
        outputs: [{ name: 'click', handler: { source: 'onClick()' } }],
      });

      const events = extractEvents(element as any);
      expect(events).toEqual([{ name: 'click', handler: 'onClick()' }]);
    });
  });
});
