/* eslint-disable prefer-const */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// -----------------------------------------------------------------------------
// Mocks
// -----------------------------------------------------------------------------

// @push-based/styles-ast-utils
let parseStylesheetMock: any;
let visitEachChildMock: any;
vi.mock('@push-based/styles-ast-utils', () => ({
  get parseStylesheet() {
    return parseStylesheetMock;
  },
  get visitEachChild() {
    return visitEachChildMock;
  },
}));
parseStylesheetMock = vi.fn();
visitEachChildMock = vi.fn();

// css-match
let selectorMatchesMock: any;
vi.mock('../utils/css-match.js', () => ({
  get selectorMatches() {
    return selectorMatchesMock;
  },
}));
selectorMatchesMock = vi.fn();

// SUT
import { collectInlineStyles } from '../utils/inline-styles.collector.js';

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------
function createRule(selector: string, decls: Record<string, string>) {
  return {
    selector,
    walkDecls(cb: (decl: { prop: string; value: string }) => void) {
      Object.entries(decls).forEach(([prop, value]) => cb({ prop, value }));
    },
  } as any;
}

function resetMocks() {
  parseStylesheetMock.mockReset();
  visitEachChildMock.mockReset();
  selectorMatchesMock.mockReset();
}

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

describe('collectInlineStyles', () => {
  beforeEach(() => {
    resetMocks();
    // Provide a simple PostCSS root mock
    parseStylesheetMock.mockReturnValue({ root: { type: 'root' } });
  });

  it('returns style declarations from inline styles', async () => {
    // Fake ParsedComponent with inline styles array
    const parsedComponent = {
      fileName: '/cmp.ts',
      styles: [
        {
          parse: async () => ({
            toString: () => '.btn{color:red}',
          }),
        },
      ],
    } as any;

    // DOM snapshot with one matching element
    const dom = {
      button: {} as any,
    };

    visitEachChildMock.mockImplementation((_root: any, visitor: any) => {
      visitor.visitRule(createRule('.btn', { color: 'red' }));
    });

    selectorMatchesMock.mockImplementation(
      (cssSel: string, domKey: string) =>
        cssSel === '.btn' && domKey === 'button',
    );

    const styles = await collectInlineStyles(parsedComponent, dom as any);

    expect(styles.sourceFile).toBe('/cmp.ts');
    expect(styles.rules['.btn']).toBeDefined();
    expect(styles.rules['.btn'].properties).toEqual({ color: 'red' });
    expect(styles.rules['.btn'].appliesTo).toEqual(['button']);
  });
});
