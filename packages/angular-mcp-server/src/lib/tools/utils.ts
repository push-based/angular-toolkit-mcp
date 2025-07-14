import {
  CallToolRequest,
  CallToolResult,
} from '@modelcontextprotocol/sdk/types.js';

export function toolNotFound(request: CallToolRequest): CallToolResult {
  return {
    content: [
      {
        type: 'text',
        text: `Tool not found: ${request.params.name}`,
        isError: true,
      },
    ],
  };
}
