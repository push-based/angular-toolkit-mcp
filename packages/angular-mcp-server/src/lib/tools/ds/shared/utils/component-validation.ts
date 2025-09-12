import { COMPONENT_REGEXES } from './regex-helpers.js';

/**
 * Validates that a component name is a valid Design System component name
 * Accepts both formats: "Button" and "DsButton"
 * @param componentName The component name to validate
 * @throws Error if the component name is invalid
 */
export function validateComponentName(
  componentName: unknown,
): asserts componentName is string {
  if (
    !componentName ||
    typeof componentName !== 'string' ||
    !COMPONENT_REGEXES.isValidDsComponent(componentName)
  ) {
    throw new Error(
      'Invalid component name. Must be a valid PascalCase string (e.g., "Button" or "DsButton").',
    );
  }
}

/**
 * Converts a Design System component name to kebab case
 * @param componentName The component name (e.g., "DsButton" or "Button")
 * @returns The kebab case name (e.g., "button")
 */
export function componentNameToKebabCase(componentName: string): string {
  const kebabCase = COMPONENT_REGEXES.toKebabCase(componentName);

  if (!kebabCase?.trim()?.length) {
    throw new Error(
      'Invalid component name. Must be a valid PascalCase string (e.g., "Button" or "DsButton").',
    );
  }

  return kebabCase;
}

/**
 * Creates a tag name from a component name
 * @param componentName The component name (e.g., "DsButton" or "Button")
 * @returns The tag name (e.g., "ds-button")
 */
export function componentNameToTagName(componentName: string): string {
  return `ds-${componentNameToKebabCase(componentName)}`;
}
