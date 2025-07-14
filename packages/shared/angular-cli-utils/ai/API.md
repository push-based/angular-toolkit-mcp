# Angular CLI Utils

Small, zero‑dependency helpers for **transforming Angular CLI schemas** into Model Context Protocol (MCP) tool parameters.

## Minimal usage

```ts
import { generateMcpSchemaForEachSchematic } from '@push-based/angular-cli-utils';

const schemas = generateMcpSchemaForEachSchematic();
console.log(schemas.component.name); // → 'angular_component_generator'
```

## Key Features

- **Schema Transformation**: Convert Angular CLI schemas to MCP parameter format
- **Bulk Processing**: Generate MCP schemas for all Angular CLI schematics
- **Type Safety**: Full TypeScript support with proper type definitions
- **MCP Integration**: Seamless integration with MCP tool systems
- **Angular CLI Support**: Built-in support for all Angular CLI schematics
- **Automatic Generation**: Generate MCP schemas for all available schematics

## Documentation map

| Doc                            | What you'll find                            |
| ------------------------------ | ------------------------------------------- |
| [FUNCTIONS.md](./FUNCTIONS.md) | A–Z quick reference for every public symbol |
| [EXAMPLES.md](./EXAMPLES.md)   | Runnable scenarios with expected output     |
