import type {
  TmplAstElement,
  ASTWithSource,
} from '@angular/compiler' with { 'resolution-mode': 'import' };

/**
 * Extract bindings from a template element
 */
export function extractBindings(element: TmplAstElement) {
  return element.inputs.map((input) => ({
    type: getBindingType(input.name),
    name: input.name,
    source: (input.value as ASTWithSource).source || '',
    sourceSpan: input.sourceSpan
      ? {
          start: input.sourceSpan.start.offset,
          end: input.sourceSpan.end.offset,
          file: input.sourceSpan.start.file.url,
        }
      : undefined,
  }));
}

/**
 * Extract attributes from a template element
 */
export function extractAttributes(element: TmplAstElement) {
  return element.attributes.map((attr) => ({
    type: 'attribute' as const,
    name: attr.name,
    source: attr.value,
  }));
}

/**
 * Extract events from a template element
 */
export function extractEvents(element: TmplAstElement) {
  return element.outputs.map((output) => ({
    name: output.name,
    handler: (output.handler as ASTWithSource).source || '',
  }));
}

/**
 * Determine the binding type based on the binding name
 */
function getBindingType(
  bindingName: string,
): 'class' | 'style' | 'property' | 'attribute' {
  if (bindingName.startsWith('class.')) return 'class';
  if (bindingName.startsWith('style.')) return 'style';
  if (bindingName.startsWith('attr.')) return 'attribute';
  return 'property';
}
