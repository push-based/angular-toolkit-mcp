import { pathToFileURL } from 'node:url';

/**
 * Dynamically imports an ES Module and extracts the default export.
 *
 * @param filePath - Absolute path to the ES module file to import
 * @returns The default export from the module
 * @throws Error if the module cannot be loaded or has no default export
 *
 * @example
 * ```typescript
 * const data = await loadDefaultExport('/path/to/config.js');
 * ```
 */
export async function loadDefaultExport<T = unknown>(
  filePath: string,
): Promise<T> {
  try {
    const fileUrl = pathToFileURL(filePath).toString();
    // Use indirect eval to prevent webpack from replacing dynamic import with its own context
    // This ensures the import() call works at runtime for external user files
    const dynamicImport = new Function('url', 'return import(url)');
    const module = await dynamicImport(fileUrl);

    if (!('default' in module)) {
      throw new Error(
        `No default export found in module. Expected ES Module format:\n` +
          `export default [...]\n\n` +
          `Available exports: ${Object.keys(module).join(', ') || 'none'}`,
      );
    }

    return module.default;
  } catch (ctx) {
    if (
      ctx instanceof Error &&
      ctx.message.includes('No default export found')
    ) {
      throw ctx;
    }
    throw new Error(
      `Failed to load module from ${filePath}: ${ctx instanceof Error ? ctx.message : String(ctx)}`,
    );
  }
}
