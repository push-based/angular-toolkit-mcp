import { Dirent } from 'node:fs';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

/**
 * Searches for `.ts` files containing the search pattern.
 * @param {string} baseDir - The directory to search. Should be absolute or resolved by the caller.
 * @param {RegExp | string} searchPattern - The pattern to match.
 */
export async function findFilesWithPattern(
  baseDir: string,
  searchPattern: string,
) {
  const resolvedBaseDir = path.resolve(baseDir);

  const tsFiles: string[] = [];
  for await (const file of findAllFiles(
    resolvedBaseDir,
    (file) => file.endsWith('.ts') && !file.endsWith('.spec.ts'),
  )) {
    tsFiles.push(file);
  }

  const results: SourceLocation[] = [];
  for (const file of tsFiles) {
    try {
      const hits = await findInFile(file, searchPattern);
      if (hits.length > 0) {
        results.push(...hits);
      }
    } catch (ctx) {
      console.error(`Error searching file ${file}:`, ctx);
    }
  }

  return results.map((r: SourceLocation) => r.file);
}

/**
 * Finds all files in a directory and its subdirectories that match a predicate
 */
export async function* findAllFiles(
  baseDir: string,
  predicate: (file: string) => boolean = (fullPath) => fullPath.endsWith('.ts'),
): AsyncGenerator<string> {
  const entries = await getDirectoryEntries(baseDir);

  for (const entry of entries) {
    const fullPath = path.join(baseDir, entry.name);
    if (entry.isDirectory()) {
      // Skip node_modules and other common exclude directories
      if (!isExcludedDirectory(entry.name)) {
        yield* findAllFiles(fullPath, predicate);
      }
    } else if (entry.isFile() && predicate(fullPath)) {
      yield fullPath;
    }
  }
}

export function isExcludedDirectory(fileName: string) {
  return (
    fileName.startsWith('.') ||
    fileName === 'node_modules' ||
    fileName === 'dist' ||
    fileName === 'coverage'
  );
}

async function getDirectoryEntries(dir: string): Promise<Dirent[]> {
  try {
    return await fs.readdir(dir, { withFileTypes: true });
  } catch (ctx) {
    console.error(`Error reading directory ${dir}:`, ctx);
    return [];
  }
}

export function* accessContent(content: string): Generator<string> {
  for (const line of content.split('\n')) {
    yield line;
  }
}

export function getLineHits(
  content: string,
  pattern: string,
  bail = false,
): LinePosition[] {
  const hits: LinePosition[] = [];
  let index = content.indexOf(pattern);

  while (index !== -1) {
    hits.push({ startColumn: index, endColumn: index + pattern.length });
    if (bail) {
      return hits;
    }
    index = content.indexOf(pattern, index + 1);
  }
  return hits;
}

export type LinePosition = {
  startColumn: number;
  endColumn?: number;
};

export type SourcePosition = {
  startLine: number;
  endLine?: number;
} & LinePosition;

export type SourceLocation = {
  file: string;
  position: SourcePosition;
};

export async function findInFile(
  file: string,
  searchPattern: string,
  bail = false,
): Promise<SourceLocation[]> {
  const hits: SourceLocation[] = [];
  const content = await fs.readFile(file, 'utf8');
  let startLine = 0;
  for (const line of accessContent(content)) {
    startLine++;
    getLineHits(line, searchPattern, bail).forEach((position) => {
      hits.push({
        file,
        position: {
          startLine,
          ...position,
        },
      });
    });
  }
  return hits;
}
