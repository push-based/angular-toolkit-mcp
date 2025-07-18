import * as fs from 'fs';
import { resolveCrossPlatformPath } from '../../shared/utils/cross-platform-path.js';

export interface DeprecatedCssComponent {
  componentName: string;
  deprecatedCssClasses: string[];
}

/**
 * Retrieves deprecated CSS classes for a specific component from a configuration file
 * @param componentName - The name of the component to get deprecated classes for
 * @param deprecatedCssClassesPath - Path to the file containing deprecated CSS classes configuration
 * @param cwd - Current working directory
 * @returns Array of deprecated CSS classes for the component
 * @throws Error if file not found, invalid format, or component not found
 */
export function getDeprecatedCssClasses(
  componentName: string,
  deprecatedCssClassesPath: string,
  cwd: string,
): string[] {
  if (
    !deprecatedCssClassesPath ||
    typeof deprecatedCssClassesPath !== 'string'
  ) {
    throw new Error('deprecatedCssClassesPath must be a string path');
  }

  const absPath = resolveCrossPlatformPath(cwd, deprecatedCssClassesPath);
  if (!fs.existsSync(absPath)) {
    throw new Error(`File not found at deprecatedCssClassesPath: ${absPath}`);
  }

  const module = require(absPath);

  // Handle both ES modules (export default) and CommonJS (module.exports)
  // Support: export default dsComponents, module.exports = { dsComponents }, or direct module.exports = dsComponents
  const dsComponents = module.default || module.dsComponents || module;

  if (!Array.isArray(dsComponents)) {
    throw new Error('Invalid export: expected dsComponents to be an array');
  }

  const componentData = dsComponents.find(
    (item) => item.componentName === componentName,
  );

  if (!componentData) {
    throw new Error(
      `No deprecated classes found for component: ${componentName}`,
    );
  }

  return componentData.deprecatedCssClasses;
}
