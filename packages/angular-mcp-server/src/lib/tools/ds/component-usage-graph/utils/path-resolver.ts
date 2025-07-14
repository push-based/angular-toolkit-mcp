import * as fs from 'fs';
import * as path from 'path';
import { toUnixPath } from '@push-based/utils';
import { DEPENDENCY_ANALYSIS_CONFIG } from '../models/config.js';

const { resolveExtensions, indexFiles } = DEPENDENCY_ANALYSIS_CONFIG;

const SUFFIXES = ['', ...resolveExtensions, ...indexFiles.map((ext) => ext)];

// Memoized fs.existsSync (tiny utility)
const existsCache = new Map<string, boolean>();
const exists = (p: string): boolean => {
  const cached = existsCache.get(p);
  if (cached !== undefined) return cached;
  const ok = fs.existsSync(p);
  existsCache.set(p, ok);
  return ok;
};

export const isExternal = (p: string): boolean =>
  !p.startsWith('./') && !p.startsWith('../') && !path.isAbsolute(p);

export const resolveDependencyPath = (
  importPath: string,
  fromFile: string,
  basePath: string,
): string | null => {
  if (isExternal(importPath)) return null;

  const base = path.resolve(
    path.dirname(fromFile),
    importPath.replace(/\/$/, ''),
  );
  for (const s of SUFFIXES) {
    const candidate = base + s;
    if (exists(candidate)) {
      return toUnixPath(path.relative(basePath, candidate));
    }
  }
  return null;
};
