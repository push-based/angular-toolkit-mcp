import { z } from 'zod';

/**
 * Expected format example:
 * [
 *   {
 *     componentName: 'DsButton',
 *     deprecatedCssClasses: ['btn', 'btn-primary', 'legacy-button']
 *   },
 *   {
 *     componentName: 'DsModal',
 *     deprecatedCssClasses: ['modal']
 *   }
 * ]
 */

const EXAMPLE_FORMAT = `Expected: [{ componentName: 'DsButton', deprecatedCssClasses: ['btn'] }]`;

export const DsComponentSchema = z.object({
  componentName: z.string({
    required_error:
      'Missing required "componentName" field. Must be a string like "DsButton".',
    invalid_type_error:
      'Invalid "componentName" type. Must be a string like "DsButton".',
  }),
  deprecatedCssClasses: z.array(
    z.string({
      required_error:
        'CSS class name must be a string. Example: "btn" or "legacy-button".',
      invalid_type_error: 'CSS class name must be a string.',
    }),
    {
      required_error:
        'Missing required "deprecatedCssClasses" field. Must be an array like ["btn", "legacy-button"].',
      invalid_type_error:
        'Invalid "deprecatedCssClasses" type. Must be an array of strings.',
    },
  ),
});

export const DsComponentsArraySchema = z.array(DsComponentSchema, {
  required_error: `Configuration must be an array of component objects. ${EXAMPLE_FORMAT}`,
  invalid_type_error: `Invalid configuration format. Must export an array. ${EXAMPLE_FORMAT}`,
});
