import { ToolSchemaOptions } from '@push-based/models';
import {
  createProjectAnalysisSchema,
  COMMON_ANNOTATIONS,
} from '../../../shared/models/schema-helpers.js';

/**
 * Schema for listing component contracts
 */
export const listComponentContractsSchema: ToolSchemaOptions = {
  name: 'list_component_contracts',
  description:
    'List all available component contracts in the specified directory or .cursor/tmp/contracts by default.',
  inputSchema: {
    ...createProjectAnalysisSchema({
      contractsLocation: {
        type: 'string',
        description: 'Optional custom directory path to search for contract files. If not provided, defaults to .cursor/tmp/contracts',
      },
    }),
  },
  annotations: {
    title: 'List Component Contracts',
    ...COMMON_ANNOTATIONS.readOnly,
  },
};
