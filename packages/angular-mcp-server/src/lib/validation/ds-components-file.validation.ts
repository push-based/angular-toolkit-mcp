import * as path from 'path';
import { pathToFileURL } from 'url';
import { AngularMcpServerOptions } from './angular-mcp-server-options.schema.js';
import { DsComponentsArraySchema } from './ds-components.schema.js';

export async function validateDeprecatedCssClassesFile(
  config: AngularMcpServerOptions,
): Promise<void> {
  const deprecatedCssClassesAbsPath = path.resolve(
    config.workspaceRoot,
    config.ds.deprecatedCssClassesPath,
  );

  let dsComponents;
  try {
    const fileUrl = pathToFileURL(deprecatedCssClassesAbsPath).toString();
    const module = await import(fileUrl);

    // Handle both ES modules (export default) and CommonJS (module.exports)
    dsComponents = module.default || module.dsComponents || module;
  } catch (ctx) {
    throw new Error(
      `Failed to load deprecated CSS classes configuration file: ${deprecatedCssClassesAbsPath}\n\n` +
        `Possible causes:\n` +
        `- File does not exist\n` +
        `- Invalid JavaScript syntax\n` +
        `- File permission issues\n\n` +
        `Original error: ${ctx}`,
    );
  }

  // Validate the schema
  const validation = DsComponentsArraySchema.safeParse(dsComponents);
  if (!validation.success) {
    const actualType = Array.isArray(dsComponents)
      ? 'array'
      : typeof dsComponents;
    const exportedValue =
      dsComponents === undefined
        ? 'undefined'
        : dsComponents === null
          ? 'null'
          : JSON.stringify(dsComponents, null, 2).substring(0, 100) +
            (JSON.stringify(dsComponents).length > 100 ? '...' : '');

    throw new Error(
      `Invalid deprecated CSS classes configuration format in: ${deprecatedCssClassesAbsPath}\n\n` +
        `Expected: Array of component objects\n` +
        `Received: ${actualType}\n` +
        `Value: ${exportedValue}\n\n` +
        `Fix options:\n` +
        `1. ES Module format:\n` +
        `   export default [\n` +
        `     { componentName: 'DsButton', deprecatedCssClasses: ['btn'] }\n` +
        `   ];\n\n` +
        `2. CommonJS format:\n` +
        `   module.exports = {\n` +
        `     dsComponents: [{ componentName: 'DsButton', deprecatedCssClasses: ['btn'] }]\n` +
        `   };\n\n` +
        `Schema errors: ${JSON.stringify(validation.error.format(), null, 2)}`,
    );
  }
}
