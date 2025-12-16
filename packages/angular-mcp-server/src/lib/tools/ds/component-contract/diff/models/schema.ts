import { ToolSchemaOptions } from '@push-based/models';
import {
  COMMON_ANNOTATIONS,
  DEFAULT_OUTPUT_BASE,
  OUTPUT_SUBDIRS,
} from '../../../shared/index.js';

/**
 * Schema for diffing component contracts
 */
export const diffComponentContractSchema: ToolSchemaOptions = {
  name: 'diff_component_contract',
  description:
    'Compare before/after contracts for parity and surface breaking changes.',
  inputSchema: {
    type: 'object',
    properties: {
      saveLocation: {
        type: 'string',
        description: `Path where to save the diff result file. Supports both absolute and relative paths. If not provided, defaults to ${DEFAULT_OUTPUT_BASE}/${OUTPUT_SUBDIRS.CONTRACT_DIFFS}/<component-name>-diff.json`,
      },
      contractBeforePath: {
        type: 'string',
        description: `Path to the contract file before refactoring. Supports both absolute and relative paths. Typically located at ${DEFAULT_OUTPUT_BASE}/${OUTPUT_SUBDIRS.CONTRACTS}/<component-name>-before-contract.json`,
      },
      contractAfterPath: {
        type: 'string',
        description: `Path to the contract file after refactoring. Supports both absolute and relative paths. Typically located at ${DEFAULT_OUTPUT_BASE}/${OUTPUT_SUBDIRS.CONTRACTS}/<component-name>-after-contract.json`,
      },
      dsComponentName: {
        type: 'string',
        description: 'The name of the design system component being used',
        default: '',
      },
    },
    required: ['contractBeforePath', 'contractAfterPath'],
  },
  annotations: {
    title: 'Diff Component Contract',
    ...COMMON_ANNOTATIONS.readOnly,
  },
};
