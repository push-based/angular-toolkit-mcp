import { ToolSchemaOptions } from '@push-based/models';
import {
  createProjectAnalysisSchema,
  COMMON_ANNOTATIONS,
} from '../../../shared';

/**
 * Schema for diffing component contracts
 */
export const diffComponentContractSchema: ToolSchemaOptions = {
  name: 'diff_component_contract',
  description:
    'Compare before/after contracts for parity and surface breaking changes.',
  inputSchema: {
    ...createProjectAnalysisSchema({
      contractBeforePath: {
        type: 'string',
        description: 'Path to the contract file before refactoring',
      },
      contractAfterPath: {
        type: 'string',
        description: 'Path to the contract file after refactoring',
      },
      dsComponentName: {
        type: 'string',
        description: 'The name of the design system component being used',
      },
      saveLocation: {
        type: 'string',
        description: 'Optional custom directory path to save the diff file. If not provided, defaults to .cursor/tmp/contracts/{component}/diffs',
      },
    }),
    required: [
      'directory',
      'contractBeforePath',
      'contractAfterPath',
      'dsComponentName',
    ],
  },
  annotations: {
    title: 'Diff Component Contract',
    ...COMMON_ANNOTATIONS.readOnly,
  },
};
