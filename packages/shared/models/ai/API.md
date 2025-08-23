# Models

Simple **TypeScript types** for Angular MCP toolkit shared interfaces and utilities.

## Minimal usage

```ts
import { type CliArgsObject, type ToolsConfig } from '@push-based/models';

// CLI argument types
const args: CliArgsObject = {
  directory: './src',
  componentName: 'DsButton',
  _: ['command'],
};

// MCP tool configuration
const toolConfig: ToolsConfig = {
  schema: {
    name: 'my-tool',
    description: 'A custom tool',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  handler: async (request) => {
    return { content: [{ type: 'text', text: 'Result' }] };
  },
};
```

## Key Features

- **CLI Types**: Type-safe command line argument handling
- **MCP Integration**: Model Context Protocol tool schema definitions and handlers
- **Diagnostics**: Interface for objects that can report issues and diagnostics
- **Lightweight**: Minimal dependencies, focused on essential shared types

## Documentation map

| Doc                            | What you'll find                            |
| ------------------------------ | ------------------------------------------- |
| [FUNCTIONS.md](./FUNCTIONS.md) | A–Z quick reference for every public symbol |
| [EXAMPLES.md](./EXAMPLES.md)   | Runnable scenarios with expected output     |
