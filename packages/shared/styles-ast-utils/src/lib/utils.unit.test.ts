import { describe, expect } from 'vitest';
import { parseStylesheet } from './stylesheet.parse';
import { Rule } from 'postcss';
import { styleAstRuleToSource } from './utils';

describe('styleAstRuleToSource', () => {
  it('should have line number starting from 1', () => {
    const result = parseStylesheet(`.btn{ color: red; }`, 'inline-styles').root;
    const source = styleAstRuleToSource(result?.nodes?.at(0) as Rule);
    expect(source).toStrictEqual({
      file: expect.stringMatching(/inline-styles$/),
      position: {
        startLine: 1,
        startColumn: 1,
        endLine: 1,
        endColumn: 19,
      },
    });
  });

  it('should have line number where startLine is respected', () => {
    const result = parseStylesheet(`.btn{ color: red; }`, 'styles.css').root;
    const source = styleAstRuleToSource(result?.nodes?.at(0) as Rule, 4);
    expect(source).toStrictEqual({
      file: expect.stringMatching(/styles\.css$/),
      position: {
        startLine: 5,
        startColumn: 1,
        endLine: 5,
        endColumn: 19,
      },
    });
  });

  it('should have correct line number for starting line breaks', () => {
    const result = parseStylesheet(
      `

.btn{ color: red; }`,
      'styles.css',
    ).root;
    const source = styleAstRuleToSource(result?.nodes?.at(0) as Rule);
    expect(source).toStrictEqual({
      file: expect.stringMatching(/styles\.css$/),
      position: {
        startLine: 3,
        startColumn: 1,
        endLine: 3,
        endColumn: 19,
      },
    });
  });

  it('should have correct line number for spans', () => {
    const result = parseStylesheet(
      `
.btn{
  color: red;
}`,
      'styles.css',
    ).root;

    const source = styleAstRuleToSource(result?.nodes?.at(0) as Rule);
    expect(source).toStrictEqual({
      file: expect.stringMatching(/styles\.css$/),
      position: {
        startLine: 2,
        startColumn: 1,
        endLine: 4,
        endColumn: 1,
      },
    });
  });
});
