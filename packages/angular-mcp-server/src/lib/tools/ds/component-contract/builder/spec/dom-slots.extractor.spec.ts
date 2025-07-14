import { describe, it, expect, vi } from 'vitest';

// -----------------------------------------------------------------------------
// Mocking angular-ast-utils functions relied upon by extractSlotsAndDom
// -----------------------------------------------------------------------------

// Helper used by extractSlotsAndDom to traverse template
function visitEachTmplChild(nodes: any[], visitor: any): void {
  nodes.forEach((node) => {
    if (typeof node.visit === 'function') {
      node.visit(visitor);
    }
  });
}

// Mock implementation of visitComponentTemplate – supplies template nodes
async function visitComponentTemplate(
  parsedComponent: any,
  _options: any,
  cb: any,
) {
  const templateAsset = {
    parse: async () => ({ nodes: parsedComponent.templateNodes }),
  };
  return cb(parsedComponent, templateAsset);
}

/* eslint-disable prefer-const */

vi.mock('@push-based/angular-ast-utils', () => {
  // Define a lightweight NoopTmplVisitor inside the mock factory to avoid
  // reference-before-initialization issues caused by hoisting.
  class NoopTmplVisitor {}

  return {
    visitComponentTemplate,
    visitEachTmplChild,
    NoopTmplVisitor,
    parseClassNames: (classStr: string) => classStr.trim().split(/\s+/),
  };
});

// -----------------------------------------------------------------------------
// Imports (after mocks)
// -----------------------------------------------------------------------------
import { extractSlotsAndDom } from '../utils/dom-slots.extractor.js';

// -----------------------------------------------------------------------------
// Minimal AST node builders
// -----------------------------------------------------------------------------

type AttributeNode = { name: string; value: string };
type InputNode = { name: string; value?: any };
type OutputNode = { name: string; handler: { source: string } };

type ElementNode = {
  name: string;
  attributes: AttributeNode[];
  inputs: InputNode[];
  outputs: OutputNode[];
  children: any[];
  visit: (v: any) => void;
};

function createElement(
  params: Partial<ElementNode> & { name: string },
): ElementNode {
  const node: ElementNode = {
    name: params.name,
    attributes: params.attributes ?? [],
    inputs: params.inputs ?? [],
    outputs: params.outputs ?? [],
    children: params.children ?? [],
    visit(visitor: any) {
      // Call the appropriate visitor method
      if (typeof visitor.visitElement === 'function') {
        visitor.visitElement(this as any);
      }
    },
  } as ElementNode;
  return node;
}

function createContent(selector: string | undefined): any {
  return {
    selector,
    visit(visitor: any) {
      if (typeof visitor.visitContent === 'function') {
        visitor.visitContent(this);
      }
    },
  };
}

function createForLoopBlock(
  children: any[],
  expressionSrc = 'item of items',
  alias = 'item',
): any {
  return {
    children,
    expression: { source: expressionSrc },
    item: { name: alias },
    visit(visitor: any) {
      if (typeof visitor.visitForLoopBlock === 'function') {
        visitor.visitForLoopBlock(this);
      }
    },
  };
}

// -----------------------------------------------------------------------------
// Test suites
// -----------------------------------------------------------------------------

describe('extractSlotsAndDom', () => {
  it('extracts default and named slots', async () => {
    const defaultSlot = createContent(undefined);
    const namedSlot = createContent('[slot=header]');

    const parsedComponent = {
      templateNodes: [defaultSlot, namedSlot],
    };

    const { slots } = await extractSlotsAndDom(parsedComponent as any);

    expect(slots).toHaveProperty('default');
    expect(slots.default.selector).toBe('ng-content');

    expect(slots).toHaveProperty('header');
    expect(slots.header.selector).toBe('ng-content[select="[slot=header]"]');
  });

  it('builds DOM structure with parent-child links', async () => {
    const span = createElement({
      name: 'span',
      attributes: [{ name: 'class', value: 'foo' }],
    });

    const div = createElement({
      name: 'div',
      attributes: [{ name: 'id', value: 'root' }],
      children: [span],
    });

    const parsedComponent = { templateNodes: [div] };

    const { dom } = await extractSlotsAndDom(parsedComponent as any);

    const parentKey = 'div#root';
    const childKey = 'div#root > span.foo';

    expect(Object.keys(dom)).toEqual([parentKey, childKey]);

    const parent = dom[parentKey] as any;
    const child = dom[childKey] as any;

    expect(parent.children).toEqual([childKey]);
    expect(child.parent).toBe(parentKey);
  });

  it('captures structural directive context (for loop)', async () => {
    const li = createElement({ name: 'li' });
    const forBlock = createForLoopBlock([li]);

    const parsedComponent = { templateNodes: [forBlock] };

    const { dom } = await extractSlotsAndDom(parsedComponent as any);

    const liNode = dom['li'] as any;
    expect(liNode).toBeTruthy();
    expect(liNode.structural?.[0]).toEqual(
      expect.objectContaining({ kind: 'for', alias: 'item' }),
    );
  });
});
