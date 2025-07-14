import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import * as path from 'path';

export const fileResolverCache = new Map<string, Promise<string>>();

/**
 * Resolves a file content from the file system, caching the result
 * to avoid reading the same file multiple times.
 *
 * This function returns a Promise that resolves to the file content.
 * This is important to avoid reading the same file multiple times.
 * @param filePath
 */
export async function resolveFileCached(filePath: string): Promise<string> {
  const normalizedPath = path.normalize(filePath);
  if (!existsSync(normalizedPath)) {
    throw new Error(`File not found: ${normalizedPath}`);
  }

  if (fileResolverCache.has(normalizedPath)) {
    const cachedPromise = fileResolverCache.get(normalizedPath);
    if (cachedPromise) {
      return cachedPromise;
    }
  }

  const fileReadOperationPromise = resolveFile(filePath)
    .then((content) => {
      fileResolverCache.set(normalizedPath, Promise.resolve(content));
      return content;
    })
    .catch((ctx) => {
      fileResolverCache.delete(normalizedPath);
      throw ctx;
    });

  fileResolverCache.set(normalizedPath, fileReadOperationPromise);
  return fileReadOperationPromise;
}

/**
 * Resolves a file content from the file system directly, bypassing any cache.
 *
 * @param filePath
 */
export async function resolveFile(filePath: string): Promise<string> {
  const normalizedPath = path.normalize(filePath);
  if (!existsSync(normalizedPath)) {
    throw new Error(`File not found: ${normalizedPath}`);
  }
  return readFile(normalizedPath, 'utf-8');
}
