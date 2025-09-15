import { ToolSchemaOptions } from '@push-based/models';
import { COMMON_ANNOTATIONS } from '../../../shared';

/**
 * Schema for building component contracts
 */
export const buildComponentContractSchema: ToolSchemaOptions = {
  name: 'build_component_contract',
  description:
    "Generate a static surface contract for a component's template and SCSS.",
  inputSchema: {
    type: 'object',
    properties: {
      saveLocation: {
        type: 'string',
        description:
          'Path where to save the contract file. Supports both absolute and relative paths.',
      },
      templateFile: {
        type: 'string',
        description:
          'Path to the component template file (.html) or TypeScript component file (.ts) for inline templates. Supports both absolute and relative paths.',
      },
      styleFile: {
        type: 'string',
        description:
          'Path to the component style file (.scss, .sass, .less, .css). Supports both absolute and relative paths.',
      },
      typescriptFile: {
        type: 'string',
        description:
          'Path to the TypeScript component file (.ts). Supports both absolute and relative paths.',
      },
      dsComponentName: {
        type: 'string',
        description: 'The name of the design system component being used',
        default: '',
      },
    },
    required: ['saveLocation', 'templateFile', 'styleFile', 'typescriptFile'],
  },
  annotations: {
    title: 'Build Component Contract',
    ...COMMON_ANNOTATIONS.readOnly,
  },
};
