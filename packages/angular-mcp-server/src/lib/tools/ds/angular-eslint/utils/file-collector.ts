import { findAllFiles } from '@push-based/utils';
import path from 'node:path';
import { FILE_EXTENSIONS } from '../models/config.js';
import { resolveCrossPlatformPath } from '../../shared/utils/cross-platform-path.js';

const ACCEPTED = new Set<string>([
  ...FILE_EXTENSIONS.TEMPLATE,
  ...FILE_EXTENSIONS.TYPESCRIPT,
]);

const EXCLUDED = new Set<string>([
  ...FILE_EXTENSIONS.SPEC,
  ...FILE_EXTENSIONS.DECLARATION,
]);

const isValidationFile = (fp: string): boolean => {
  const ext = path.extname(fp);
  return ACCEPTED.has(ext) && ![...EXCLUDED].some((s) => fp.endsWith(s));
};

export async function collectFiles({
  targetDir,
  files,
}: {
  targetDir: string;
  files?: string[];
}): Promise<string[]> {
  if (files?.length)
    return files.map((f) => resolveCrossPlatformPath(targetDir, f));

  const out: string[] = [];
  for await (const p of findAllFiles(targetDir, isValidationFile)) {
    out.push(p);
  }
  return out;
}
