import {
  createHandler,
  BaseHandlerOptions,
} from '../../shared/utils/handler-helpers.js';
import { resolveCrossPlatformPath } from '../../shared/utils/cross-platform-path.js';
import { queryComponentContractSchema } from './models/schema.js';
import type { QueryResult, ContractQuery } from './models/types.js';
import { executeContractQuery } from './utils/contract-query.js';
import { formatQueryResult } from './utils/format-results.js';

interface QueryComponentContractOptions extends BaseHandlerOptions {
  directory: string;
  contractPath: string;
  queryType: string;
  query?: string;
  filter?: string;
  format?: string;
}

export const queryComponentContractHandler = createHandler<
  QueryComponentContractOptions,
  QueryResult
>(
  queryComponentContractSchema.name,
  async (params) => {
    const { directory, contractPath, queryType, query, filter, format = 'json' } = params;
    
    const fullContractPath = resolveCrossPlatformPath(directory, contractPath);
    
    const queryObj: ContractQuery = {
      type: queryType as ContractQuery['type'],
      query,
      filter,
      format: format as ContractQuery['format'],
    };
    
    return await executeContractQuery(fullContractPath, queryObj);
  },
  (result) => {
    const formattedResult = formatQueryResult(result);
    return [formattedResult];
  },
);

export const queryComponentContractTools = [
  {
    schema: queryComponentContractSchema,
    handler: queryComponentContractHandler,
  },
];
