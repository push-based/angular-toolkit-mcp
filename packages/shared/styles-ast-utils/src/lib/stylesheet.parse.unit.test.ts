import { describe, expect } from 'vitest';
import { parseStylesheet } from './stylesheet.parse.js';
import { Rule } from 'postcss';

describe('parseStylesheet', () => {
  it('should have line numbers starting from 1', () => {
    const result = parseStylesheet(`.btn{ color: red; }`, 'styles.css').root;
    const { source = {} as Exclude<Rule['source'], undefined> } =
      result.nodes.at(0) as Rule;
    const { start, end } = source;

    expect(start?.line).toBe(1);
    expect(start?.column).toBe(1);
    expect(end?.line).toBe(1);
    expect(end?.column).toBe(19);
  });

  it('should have correct line number for starting line breaks', () => {
    const result = parseStylesheet(
      `

.btn{ color: red; }`,
      'styles.css',
    ).root;

    const { source = {} as Exclude<Rule['source'], undefined> } =
      result?.nodes?.at(0) as Rule;
    const { start, end } = source;

    expect(start?.line).toBe(3);
    expect(start?.column).toBe(1);
    expect(end?.line).toBe(3);
    expect(end?.column).toBe(19);
  });

  it('should have correct line number for spans', () => {
    const result = parseStylesheet(
      `
.btn{
  color: red;
}`,
      'styles.css',
    ).root;

    const { source = {} as Exclude<Rule['source'], undefined> } =
      result?.nodes?.at(0) as Rule;
    const { start, end } = source;

    expect(start?.line).toBe(2);
    expect(start?.column).toBe(1);
    expect(end?.line).toBe(4);
    expect(end?.column).toBe(1);
  });
});
