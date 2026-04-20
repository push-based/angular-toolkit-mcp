import { describe, expect, it } from 'vitest';
import { globToRegex } from './glob-utils.js';

describe('globToRegex', () => {
  // ── Basic glob features ──

  it('matches exact filename', () => {
    const re = globToRegex('foo.css');
    expect(re.test('foo.css')).toBe(true);
    expect(re.test('bar.css')).toBe(false);
  });

  it('* matches single path segment', () => {
    const re = globToRegex('*.css');
    expect(re.test('foo.css')).toBe(true);
    expect(re.test('dir/foo.css')).toBe(false);
  });

  it('** matches recursive paths', () => {
    const re = globToRegex('**/*.css');
    expect(re.test('foo.css')).toBe(true);
    expect(re.test('a/foo.css')).toBe(true);
    expect(re.test('a/b/c/foo.css')).toBe(true);
  });

  it('? matches single character', () => {
    const re = globToRegex('fo?.css');
    expect(re.test('foo.css')).toBe(true);
    expect(re.test('fob.css')).toBe(true);
    expect(re.test('fooo.css')).toBe(false);
  });

  // ── Brace expansion ──

  it('{a,b} matches either alternative', () => {
    const re = globToRegex('*.{scss,css}');
    expect(re.test('style.scss')).toBe(true);
    expect(re.test('style.css')).toBe(true);
    expect(re.test('style.less')).toBe(false);
  });

  it('{a,b} works with ** recursive pattern', () => {
    const re = globToRegex('**/*.{scss,css}');
    expect(re.test('style.scss')).toBe(true);
    expect(re.test('a/b/style.css')).toBe(true);
    expect(re.test('a/b/style.less')).toBe(false);
  });

  it('single-item brace {a} matches that item', () => {
    const re = globToRegex('*.{css}');
    expect(re.test('style.css')).toBe(true);
    expect(re.test('style.scss')).toBe(false);
  });

  it('brace with three alternatives', () => {
    const re = globToRegex('*.{css,scss,less}');
    expect(re.test('x.css')).toBe(true);
    expect(re.test('x.scss')).toBe(true);
    expect(re.test('x.less')).toBe(true);
    expect(re.test('x.styl')).toBe(false);
  });

  // ── Literal special characters (regression for #1) ──

  it('literal parentheses in pattern are escaped', () => {
    const re = globToRegex('foo(1).css');
    expect(re.test('foo(1).css')).toBe(true);
    expect(re.test('foo1.css')).toBe(false);
  });

  it('literal pipe in pattern is escaped', () => {
    const re = globToRegex('a|b.css');
    expect(re.test('a|b.css')).toBe(true);
    expect(re.test('a.css')).toBe(false);
    expect(re.test('b.css')).toBe(false);
  });

  // ── Combined patterns ──

  it('complex pattern with ** and braces', () => {
    const re = globToRegex('**/components/**/*.{scss,css}');
    expect(re.test('components/button/style.scss')).toBe(true);
    expect(re.test('src/components/card/card.css')).toBe(true);
    expect(re.test('src/components/card/card.ts')).toBe(false);
  });
});
