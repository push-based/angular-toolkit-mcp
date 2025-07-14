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
    'List all available component contracts in the .cursor/tmp/contracts directory.',
  inputSchema: createProjectAnalysisSchema(),
  annotations: {
    title: 'List Component Contracts',
    ...COMMON_ANNOTATIONS.readOnly,
  },
};
