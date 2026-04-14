import { describe, it, expect } from 'vitest';
import {
  extractTemplateLiteral,
  extractBalancedBlock,
} from '../source-text.utils.js';

describe('extractTemplateLiteral', () => {
  it('should extract a simple template literal', () => {
    const source = '`hello world`';
    expect(extractTemplateLiteral(source, 0)).toBe('hello world');
  });

  it('should return empty string for an empty but terminated template', () => {
    const source = '``';
    expect(extractTemplateLiteral(source, 0)).toBe('');
  });

  it('should return null for an unterminated template literal', () => {
    const source = '`hello world';
    expect(extractTemplateLiteral(source, 0)).toBeNull();
  });

  it('should return null for unterminated template with content', () => {
    // Previously this returned the partial content "some partial content"
    const source = '`some partial content';
    expect(extractTemplateLiteral(source, 0)).toBeNull();
  });

  it('should handle template literals with interpolations', () => {
    const source = '`hello ${name} world`';
    expect(extractTemplateLiteral(source, 0)).toBe('hello ${name} world');
  });

  it('should handle nested template literals in expressions', () => {
    const source = '`outer ${`inner`} end`';
    expect(extractTemplateLiteral(source, 0)).toBe('outer ${} end');
  });
});

describe('extractBalancedBlock', () => {
  it('should extract a balanced block', () => {
    const source = '{ a: 1 }';
    expect(extractBalancedBlock(source, 0)).toBe('{ a: 1 }');
  });

  it('should return null for unbalanced block', () => {
    const source = '{ a: 1';
    expect(extractBalancedBlock(source, 0)).toBeNull();
  });

  it('should return null when no opening brace found', () => {
    const source = 'no braces here';
    expect(extractBalancedBlock(source, 0)).toBeNull();
  });
});
