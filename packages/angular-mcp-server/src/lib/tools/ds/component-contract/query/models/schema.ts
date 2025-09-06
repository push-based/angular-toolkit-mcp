import { ToolSchemaOptions } from '@push-based/models';
import {
  COMMON_ANNOTATIONS,
  createProjectAnalysisSchema,
} from '../../../shared';

/**
 * Schema for querying component contracts with section filtering
 */
export const queryComponentContractSchema: ToolSchemaOptions = {
  name: 'query-component-contract',
  description: `Query and explore component contracts with flexible search and section filtering.
  
Search across contract sections with optional filtering:
- Search any text/pattern across the entire contract
- Filter results to specific sections: meta, publicApi, dom, styles
- Combine multiple sections for cross-cutting analysis
- Use CSS-like selectors for DOM elements
- Support JSONPath expressions for advanced queries`,
  inputSchema: {
    ...createProjectAnalysisSchema({
      contractPath: {
        type: 'string',
        description: 'Path to the contract JSON file (relative to directory)',
      },
      query: {
        type: 'string',
        description: `Search query - can be:
        - Text/pattern to search for (e.g., "casino-onboarding-container")
        - CSS-like selector for DOM (e.g., ".container", "[click]", "div.btn")
        - JSONPath expression (e.g., "$.dom.*.children", "$.publicApi.methods[*].name")
        - Property/method names, class names, or any contract content`,
      },
      sections: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['meta', 'publicApi', 'dom', 'styles']
        },
        description: 'Contract sections to search in. If empty, searches all sections. Options: meta (component metadata), publicApi (inputs/outputs/methods/imports), dom (template elements), styles (CSS rules)',
        default: []
      },
    }),
    required: ['directory', 'contractPath', 'query'],
  },
  annotations: {
    title: 'Query Component Contract',
    ...COMMON_ANNOTATIONS.readOnly,
  },
};
