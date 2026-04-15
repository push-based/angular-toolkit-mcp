import { ToolSchemaOptions } from '@push-based/models';
import {
  createProjectAnalysisSchema,
  COMMON_SCHEMA_PROPERTIES,
  COMMON_ANNOTATIONS,
} from '../../shared/models/schema-helpers.js';
import { DEFAULT_OUTPUT_BASE } from '../../shared/constants.js';

export const auditTokenUsageSchema: ToolSchemaOptions = {
  name: 'report-audit-token-usage',
  description:
    'Audit token usage: validate token references (typo detection with suggestions) and detect token overrides in style files. ' +
    'Operates in two modes — "validate" (checks var() references against the token dataset) and "overrides" (finds token re-declarations in consumer files). ' +
    'Default mode "all" runs both.',
  inputSchema: createProjectAnalysisSchema({
    modes: {
      anyOf: [
        {
          type: 'array',
          items: { type: 'string', enum: ['validate', 'overrides'] },
        },
        { type: 'string', enum: ['all'] },
      ],
      description:
        'Modes to run. Default: "all" (both validate and overrides).',
      default: 'all',
    },
    brandName: {
      type: 'string',
      description: 'Primary brand context for brand-specific token detection.',
    },
    componentName: COMMON_SCHEMA_PROPERTIES.componentName,
    tokenPrefix: {
      type: 'string',
      description: 'Override the default token prefix from TokensConfig.',
    },
    saveAsFile: {
      type: 'boolean',
      description: `Persist results to ${DEFAULT_OUTPUT_BASE}/audit-token-usage/`,
    },
  }),
  annotations: {
    title: 'Audit Token Usage',
    ...COMMON_ANNOTATIONS.readOnly,
  },
};
