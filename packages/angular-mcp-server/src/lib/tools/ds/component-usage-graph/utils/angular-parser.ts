import { parseComponents } from '@push-based/angular-ast-utils';
import { ComponentMetadata } from '../models/types.js';

export async function parseAngularComponent(
  filePath: string,
): Promise<ComponentMetadata | null> {
  try {
    const [component] = await parseComponents([filePath]);
    return component ? { className: component.className } : null;
  } catch (ctx) {
    throw new Error(
      `Failed to parse Angular component from ${filePath}: ${(ctx as Error).message}`,
    );
  }
}
