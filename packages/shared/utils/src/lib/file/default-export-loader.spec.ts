import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { writeFileSync, rmSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { loadDefaultExport } from './default-export-loader.js';

describe('loadDefaultExport', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = join(
      tmpdir(),
      `test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    );
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  const createFile = (name: string, content: string) => {
    const path = join(testDir, name);
    writeFileSync(path, content, 'utf-8');
    return path;
  };

  describe('Success Cases', () => {
    it.each([
      {
        type: 'array',
        content: '[{name: "test"}]',
        expected: [{ name: 'test' }],
      },
      {
        type: 'object',
        content: '{version: "1.0"}',
        expected: { version: '1.0' },
      },
      { type: 'string', content: '"test"', expected: 'test' },
      { type: 'null', content: 'null', expected: null },
      { type: 'boolean', content: 'false', expected: false },
      { type: 'undefined', content: 'undefined', expected: undefined },
    ])('should load $type default export', async ({ content, expected }) => {
      const path = createFile('test.mjs', `export default ${content};`);
      expect(await loadDefaultExport(path)).toEqual(expected);
    });
  });

  describe('Error Cases - No Default Export', () => {
    it.each([
      {
        desc: 'named exports only',
        content: 'export const a = 1; export const b = 2;',
        exports: 'a, b',
      },
      { desc: 'empty module', content: '', exports: 'none' },
      { desc: 'comments only', content: '// comment', exports: 'none' },
      {
        desc: 'function exports',
        content: 'export function fn() {}',
        exports: 'fn',
      },
    ])('should throw error for $desc', async ({ content, exports }) => {
      const path = createFile('test.mjs', content);
      await expect(loadDefaultExport(path)).rejects.toThrow(
        `No default export found in module. Expected ES Module format:\nexport default [...]\n\nAvailable exports: ${exports}`,
      );
    });
  });

  describe('Error Cases - File System', () => {
    it('should throw error when file does not exist', async () => {
      const path = join(testDir, 'missing.mjs');
      await expect(loadDefaultExport(path)).rejects.toThrow(
        `Failed to load module from ${path}`,
      );
    });

    it('should throw error when file has syntax errors', async () => {
      const path = createFile(
        'syntax.mjs',
        'export default { invalid: syntax }',
      );
      await expect(loadDefaultExport(path)).rejects.toThrow(
        `Failed to load module from ${path}`,
      );
    });
  });

  describe('Edge Cases', () => {
    it('should work with TypeScript generics', async () => {
      interface Config {
        name: string;
      }
      const path = createFile('typed.mjs', 'export default [{name: "test"}];');
      const result = await loadDefaultExport<Config[]>(path);
      expect(result).toEqual([{ name: 'test' }]);
    });

    it('should handle mixed exports (prefers default)', async () => {
      const path = createFile(
        'mixed.mjs',
        'export const named = "n"; export default "d";',
      );
      expect(await loadDefaultExport<string>(path)).toBe('d');
    });

    it('should handle complex nested structures', async () => {
      const path = createFile(
        'complex.mjs',
        `
        export default {
          data: [{ name: 'test', meta: { date: new Date('2024-01-01') } }],
          version: '1.0'
        };
      `,
      );
      const result = await loadDefaultExport(path);
      expect(result).toMatchObject({
        data: [{ name: 'test', meta: { date: expect.any(Date) } }],
        version: '1.0',
      });
    });
  });
});
