import { basename, extname } from 'node:path';
import type { Meta, TemplateType } from '../../shared/models/types.js';
import { ParsedComponent } from '@push-based/angular-ast-utils';

/**
 * Generate contract metadata
 */
export function generateMeta(
  templatePath: string,
  parsedComponent: ParsedComponent,
  isInlineTemplate = false,
): Meta {
  const componentName = basename(templatePath, extname(templatePath));
  const templateType: TemplateType = isInlineTemplate ? 'inline' : 'external';

  return {
    name: parsedComponent.className || componentName,
    selector: parsedComponent.selector || `.${componentName}`,
    sourceFile: templatePath,
    templateType,
    generatedAt: new Date().toISOString(),
    hash: '', // Will be filled later
  };
}
