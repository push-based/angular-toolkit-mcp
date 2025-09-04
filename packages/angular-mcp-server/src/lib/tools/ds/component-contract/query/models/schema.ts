import { ToolSchemaOptions } from '@push-based/models';
import {
  COMMON_ANNOTATIONS,
  createProjectAnalysisSchema,
} from '../../../shared';

/**
 * Schema for querying component contracts
 */
export const queryComponentContractSchema: ToolSchemaOptions = {
  name: 'query-component-contract',
  description: `Query and explore component contracts with flexible search capabilities.
  
Supports various query types:
- overview: Component metadata and summary
- inputs: Input properties with types and requirements  
- outputs: Output events with types
- methods: Public methods with signatures
- events: All event handlers in the template
- dom: DOM elements (supports CSS-like selectors)
- styles: CSS rules and their element mappings
- imports: All imported dependencies
- search: Text search across the entire contract
- custom: JSONPath-style queries for advanced use cases`,
  inputSchema: {
    ...createProjectAnalysisSchema({
      contractPath: {
        type: 'string',
        description: 'Path to the contract JSON file (relative to directory)',
      },
      queryType: {
        type: 'string',
        enum: ['overview', 'inputs', 'outputs', 'methods', 'events', 'dom', 'styles', 'imports', 'search', 'custom'],
        description: 'Type of query to execute',
      },
      query: {
        type: 'string',
        description: `Query string (usage depends on queryType):
        - dom: CSS-like selector (e.g., ".casino-onboarding-container", "[click]", "div.btn")
        - styles: CSS property name or selector (e.g., "background-color", ".casino-onboarding-*")
        - search: Text to search for across the contract
        - custom: JSONPath expression (e.g., "$.dom.*.children", "$.publicApi.methods[*].name")`,
      },
      filter: {
        type: 'string',
        description: 'Additional filter criteria (e.g., "required", "public", "has-events")',
      },
      format: {
        type: 'string',
        enum: ['json', 'table', 'list', 'tree'],
        default: 'json',
        description: 'Output format for the results',
      },
    }),
    required: ['directory', 'contractPath', 'queryType'],
  },
  annotations: {
    title: 'Query Component Contract',
    ...COMMON_ANNOTATIONS.readOnly,
  },
};
