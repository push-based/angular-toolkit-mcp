import * as fs from 'node:fs';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  DsComponentsArraySchema,
  DsComponentSchema,
} from './ds-components.schema';
import { z } from 'zod';

export type DsComponent = z.infer<typeof DsComponentSchema>;
export type DsComponentsArray = z.infer<typeof DsComponentsArraySchema>;

export function validateDsComponent(rawComponent: unknown): DsComponent {
  const validation = DsComponentSchema.safeParse(rawComponent);
  if (!validation.success) {
    throw new Error(
      `Invalid component format: ${JSON.stringify(validation.error.format())}`,
    );
  }
  return validation.data;
}

export function validateDsComponentsArray(rawData: unknown): DsComponentsArray {
  // First check if it's an array
  if (!Array.isArray(rawData)) {
    throw new Error(`Expected array of components, received ${typeof rawData}`);
  }

  // Validate each component individually for better error messages
  const validatedComponents: DsComponent[] = [];
  for (let i = 0; i < rawData.length; i++) {
    try {
      const validComponent = validateDsComponent(rawData[i]);
      validatedComponents.push(validComponent);
    } catch (ctx) {
      throw new Error(`Component at index ${i}: ${(ctx as Error).message}`);
    }
  }

  // Final validation with the array schema for completeness
  const arrayValidation =
    DsComponentsArraySchema.safeParse(validatedComponents);
  if (!arrayValidation.success) {
    throw new Error(
      `Array validation failed: ${JSON.stringify(
        arrayValidation.error.format(),
      )}`,
    );
  }

  return arrayValidation.data;
}

export async function loadAndValidateDsComponentsFile(
  cwd: string,
  deprecatedCssClassesPath: string,
): Promise<DsComponentsArray> {
  if (
    !deprecatedCssClassesPath ||
    typeof deprecatedCssClassesPath !== 'string'
  ) {
    throw new Error('deprecatedCssClassesPath must be a string path');
  }

  const absPath = path.resolve(cwd, deprecatedCssClassesPath);
  if (!fs.existsSync(absPath)) {
    throw new Error(`File not found at deprecatedCssClassesPath: ${absPath}`);
  }

  try {
    const fileUrl = pathToFileURL(absPath).toString();
    const module = await import(fileUrl);

    // Handle both ES modules (export default) and CommonJS (module.exports)
    const rawData = module.default || module.dsComponents || module;

    // Use the granular validation functions
    return validateDsComponentsArray(rawData);
  } catch (ctx) {
    if (
      ctx instanceof Error &&
      (ctx.message.includes('Invalid component format') ||
        ctx.message.includes('Expected array of components') ||
        ctx.message.includes('Component at index'))
    ) {
      throw ctx; // Re-throw validation errors as-is
    }
    throw new Error(
      `Failed to load configuration file: ${(ctx as Error).message}`,
    );
  }
}
