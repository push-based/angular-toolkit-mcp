import { ToolSchemaOptions } from '@push-based/models';
import {
  COMMON_ANNOTATIONS,
  createProjectAnalysisSchema,
} from '../../../shared/index.js';

/**
 * Schema for building component contracts
 */
export const buildComponentContractSchema: ToolSchemaOptions = {
  name: 'build_component_contract',
  description:
    "Generate a static surface contract for a component's template and SCSS.",
  inputSchema: {
    ...createProjectAnalysisSchema({
      templateFile: {
        type: 'string',
        description:
          'File name of the component template file (.html) or TypeScript component file (.ts) for inline templates',
      },
      styleFile: {
        type: 'string',
        description:
          'File name of the component style file (.scss, .sass, .less, .css)',
      },
      typescriptFile: {
        type: 'string',
        description: 'File name of the TypeScript component file (.ts)',
      },
      dsComponentName: {
        type: 'string',
        description: 'The name of the design system component being used',
      },
    }),
    required: [
      'directory',
      'templateFile',
      'styleFile',
      'typescriptFile',
      'dsComponentName',
    ],
  },
  annotations: {
    title: 'Build Component Contract',
    ...COMMON_ANNOTATIONS.readOnly,
  },
};
