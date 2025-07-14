import { describe, it, expect, vi } from 'vitest';

vi.mock('@push-based/angular-ast-utils', () => {
  return {
    parseClassNames: (classStr: string) => classStr.trim().split(/\s+/),
    ngClassesIncludeClassName: (expr: string, className: string) =>
      expr.includes(className),
  };
});

import { selectorMatches } from '../utils/css-match.js';

import type {
  DomElement,
  Attribute,
  Binding,
} from '../../shared/models/types.js';

function createElement(overrides: Partial<DomElement> = {}): DomElement {
  return {
    tag: 'div',
    parent: null,
    children: [],
    attributes: [],
    bindings: [],
    events: [],
    ...overrides,
  } as DomElement;
}

function attr(name: string, source: string): Attribute {
  return { type: 'attribute', name, source };
}

function classBinding(name: string, source = ''): Binding {
  return { type: 'class', name, source } as Binding;
}

describe('selectorMatches', () => {
  const domKey = '';

  describe('class selectors', () => {
    it('matches static class attribute', () => {
      const el = createElement({
        attributes: [attr('class', 'foo bar')],
      });
      expect(selectorMatches('.foo', domKey, el)).toBe(true);
      expect(selectorMatches('.bar', domKey, el)).toBe(true);
      expect(selectorMatches('.baz', domKey, el)).toBe(false);
    });

    it('matches Angular [class.foo] binding', () => {
      const el = createElement({
        bindings: [classBinding('class.foo')],
      });
      expect(selectorMatches('.foo', domKey, el)).toBe(true);
    });

    it('matches ngClass expression', () => {
      const el = createElement({
        bindings: [classBinding('ngClass', "{ 'foo': cond }")],
      });
      expect(selectorMatches('.foo', domKey, el)).toBe(true);
    });
  });

  describe('id selectors', () => {
    it('matches id attribute', () => {
      const el = createElement({ attributes: [attr('id', 'my-id')] });
      expect(selectorMatches('#my-id', domKey, el)).toBe(true);
      expect(selectorMatches('#other', domKey, el)).toBe(false);
    });
  });

  describe('tag selectors', () => {
    it('matches element tag', () => {
      const spanEl = createElement({ tag: 'span' });
      expect(selectorMatches('span', domKey, spanEl)).toBe(true);
      expect(selectorMatches('div', domKey, spanEl)).toBe(false);
    });
  });

  describe('attribute selectors', () => {
    it('matches existence selector', () => {
      const el = createElement({ attributes: [attr('disabled', '')] });
      expect(selectorMatches('[disabled]', domKey, el)).toBe(true);
    });

    it('matches equality selector', () => {
      const el = createElement({ attributes: [attr('type', 'button')] });
      expect(selectorMatches('[type="button"]', domKey, el)).toBe(true);
      expect(selectorMatches('[type="text"]', domKey, el)).toBe(false);
    });

    it('matches *= selector', () => {
      const el = createElement({
        attributes: [attr('data-role', 'dialog-box')],
      });
      expect(selectorMatches('[data-role*="dialog"]', domKey, el)).toBe(true);
      expect(selectorMatches('[data-role*="modal"]', domKey, el)).toBe(false);
    });

    it('matches ^= and $= selectors', () => {
      const el = createElement({
        attributes: [attr('data-role', 'dialog-box')],
      });
      expect(selectorMatches('[data-role^="dialog"]', domKey, el)).toBe(true);
      expect(selectorMatches('[data-role$="box"]', domKey, el)).toBe(true);
    });
  });

  describe('composite selectors', () => {
    it('matches when any comma-separated selector matches', () => {
      const el = createElement({ attributes: [attr('class', 'foo')] });
      expect(selectorMatches('.foo, #bar', domKey, el)).toBe(true);
      expect(selectorMatches('.baz, #bar', domKey, el)).toBe(false);
    });

    it('matches last part of descendant selector', () => {
      const el = createElement({ attributes: [attr('class', 'foo')] });
      expect(selectorMatches('div .foo', domKey, el)).toBe(true);
    });
  });
});
