/* eslint-disable prefer-const */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// -----------------------------------------------------------------------------
// Mocks for dependencies used by styles.collector.ts
// -----------------------------------------------------------------------------

// fs.readFileSync mock
let readFileSyncMock: any;
vi.mock('node:fs', () => ({
  get readFileSync() {
    return readFileSyncMock;
  },
}));

// Initialize after mock registration
readFileSyncMock = vi.fn();

// style AST utilities mocks
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

// Initialize after mock registration
parseStylesheetMock = vi.fn();
visitEachChildMock = vi.fn();

// selectorMatches mock
let selectorMatchesMock: any;
vi.mock('../utils/css-match.js', () => ({
  get selectorMatches() {
    return selectorMatchesMock;
  },
}));

// Initialize after mock registration
selectorMatchesMock = vi.fn();

// SUT
import { collectStylesV2 } from '../utils/styles.collector.js';

// -----------------------------------------------------------------------------
// Helper to fabricate Rule objects understood by collectStylesV2
// -----------------------------------------------------------------------------
function createRule(selector: string, declarations: Record<string, string>) {
  return {
    selector,
    walkDecls(callback: (decl: { prop: string; value: string }) => void) {
      Object.entries(declarations).forEach(([prop, value]) =>
        callback({ prop, value }),
      );
    },
  } as any;
}

function resetMocks() {
  readFileSyncMock.mockReset();
  parseStylesheetMock.mockReset();
  visitEachChildMock.mockReset();
  selectorMatchesMock.mockReset();
}

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

describe('collectStylesV2', () => {
  const scssPath = '/styles.scss';

  beforeEach(() => {
    resetMocks();
    readFileSyncMock.mockReturnValue('dummy');
    // parseStylesheet returns root obj with type root
    parseStylesheetMock.mockReturnValue({ root: { type: 'root' } });
  });

  it('collects properties and matches dom elements', async () => {
    const dom = {
      div: {} as any,
    };

    // Provide one rule 'div { color:red }'
    visitEachChildMock.mockImplementation((_root: any, visitor: any) => {
      visitor.visitRule(createRule('div', { color: 'red' }));
    });

    selectorMatchesMock.mockImplementation(
      (css: string, domKey: string) => css === 'div' && domKey === 'div',
    );

    const styles = await collectStylesV2(scssPath, dom as any);

    expect(styles.sourceFile).toBe(scssPath);
    expect(styles.rules.div).toBeDefined();
    expect(styles.rules.div.properties).toEqual({ color: 'red' });
    expect(styles.rules.div.appliesTo).toEqual(['div']);
  });

  it('handles multiple rules and appliesTo filtering', async () => {
    const dom = {
      div: {} as any,
      'span.foo': {} as any,
    };

    visitEachChildMock.mockImplementation((_root: any, visitor: any) => {
      visitor.visitRule(createRule('div', { margin: '0' }));
      visitor.visitRule(createRule('.foo', { padding: '1rem' }));
    });

    selectorMatchesMock.mockImplementation((css: string, domKey: string) => {
      if (css === 'div') return domKey === 'div';
      if (css === '.foo') return domKey === 'span.foo';
      return false;
    });

    const styles = await collectStylesV2(scssPath, dom as any);

    expect(styles.rules.div.appliesTo).toEqual(['div']);
    expect(styles.rules['.foo'].appliesTo).toEqual(['span.foo']);
  });
});
