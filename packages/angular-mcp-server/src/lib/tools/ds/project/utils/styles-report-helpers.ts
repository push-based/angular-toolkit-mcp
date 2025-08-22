import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { parseStylesheet, visitEachChild } from '@push-based/styles-ast-utils';
import { findAllFiles } from '@push-based/utils';
import type { Rule } from 'postcss';

export interface StyleFileReport {
  filePath: string;
  foundClasses: {
    className: string;
    selector: string;
    lineNumber?: number;
  }[];
}

const STYLE_EXT = new Set(['.css', '.scss', '.sass', '.less']);

const isStyleFile = (f: string) => STYLE_EXT.has(path.extname(f).toLowerCase());
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const { parseStylesheet: _noop1, visitEachChild: _noop2 } = {
  parseStylesheet,
  visitEachChild,
};

export async function findStyleFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  for await (const file of findAllFiles(dir, isStyleFile)) {
    files.push(file);
  }
  return files;
}

export async function analyzeStyleFile(
  filePath: string,
  deprecated: string[],
): Promise<StyleFileReport> {
  const css = await fs.readFile(filePath, 'utf8');
  const { root } = await parseStylesheet(css, filePath);

  const found: StyleFileReport['foundClasses'] = [];
  const master = new RegExp(
    `\\.(${deprecated.map(escapeRegex).join('|')})(?![\\w-])`,
    'g',
  );

  // Handle both Document_ and Root_ types
  if (root.type !== 'root') {
    return { filePath, foundClasses: found };
  }

  visitEachChild(root, {
    visitRule(rule: Rule) {
      let match;
      while ((match = master.exec(rule.selector)) !== null) {
        found.push({
          className: match[1],
          selector: rule.selector,
          lineNumber: rule.source?.start?.line,
        });
      }
      master.lastIndex = 0;
    },
  });

  return { filePath, foundClasses: found };
}
