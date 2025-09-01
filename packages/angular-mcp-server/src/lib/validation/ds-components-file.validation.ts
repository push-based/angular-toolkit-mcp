import * as path from 'path';
import { AngularMcpServerOptions } from './angular-mcp-server-options.schema.js';
import { DsComponentsArraySchema } from './ds-components.schema.js';
import { loadDefaultExport } from '@push-based/utils';

export async function validateDeprecatedCssClassesFile(
  config: AngularMcpServerOptions,
): Promise<void> {
  const deprecatedCssClassesAbsPath = path.resolve(
    config.workspaceRoot,
    config.ds.deprecatedCssClassesPath,
  );

  const dsComponents = await loadDefaultExport(deprecatedCssClassesAbsPath);

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
