# Examples

## 1 — Transforming a single schema

> Convert an Angular CLI schema definition to MCP tool parameters format.

```ts
import { transformSchemaToMCPParameters } from '@push-based/angular-cli-utils';

const schema = {
  title: 'Angular Component Options Schema',
  type: 'object',
  description: 'Creates a new Angular component',
  additionalProperties: false,
  properties: {
    name: { type: 'string', description: 'The name of the component' },
    standalone: {
      type: 'boolean',
      description: 'Whether the component is standalone',
      default: true,
    },
  },
};

const mcpSchema = transformSchemaToMCPParameters(schema);
console.log(mcpSchema.name); // → 'angular_component_generator'
```

---

## 2 — Generating all Angular CLI schemas

> Generate MCP schemas for all available Angular CLI schematics at once.

```ts
import { generateMcpSchemaForEachSchematic } from '@push-based/angular-cli-utils';

const allSchemas = generateMcpSchemaForEachSchematic();
console.log(Object.keys(allSchemas)); // → ['component', 'service', 'module', ...]
```

---

## 3 — Accessing specific schematic schemas

> Get MCP schemas for specific Angular CLI schematics.

```ts
import { generateMcpSchemaForEachSchematic } from '@push-based/angular-cli-utils';

const schemas = generateMcpSchemaForEachSchematic();
const componentSchema = schemas.component;
const serviceSchema = schemas.service;

console.log(componentSchema.description); // → 'Creates a new Angular component'
console.log(serviceSchema.name); // → 'angular_service_generator'
```

---

## 4 — Building MCP tool configurations

> Create MCP tool configurations from Angular CLI schemas for use in MCP servers.

```ts
import { generateMcpSchemaForEachSchematic } from '@push-based/angular-cli-utils';
import { ToolsConfig } from '@push-based/models';

const schemas = generateMcpSchemaForEachSchematic();

const toolsConfig: ToolsConfig[] = Object.entries(schemas).map(
  ([name, schema]) => ({
    schema,
    handler: async (args) => {
      // Execute Angular CLI command
      return { content: [{ type: 'text', text: `Generated ${name}` }] };
    },
  })
);

console.log(`Created ${toolsConfig.length} MCP tools`);
```

---

## 5 — Filtering schemas by type

> Filter Angular CLI schemas to only include specific schematic types.

```ts
import { generateMcpSchemaForEachSchematic } from '@push-based/angular-cli-utils';

const allSchemas = generateMcpSchemaForEachSchematic();
const commonSchematics = [
  'component',
  'service',
  'module',
  'directive',
  'pipe',
];

const filteredSchemas = Object.entries(allSchemas)
  .filter(([name]) => commonSchematics.includes(name))
  .reduce((acc, [name, schema]) => ({ ...acc, [name]: schema }), {});

console.log(Object.keys(filteredSchemas)); // → ['component', 'service', 'module', 'directive', 'pipe']
```

---

## 6 — Inspecting schema properties

> Examine the properties and requirements of generated MCP schemas.

```ts
import { generateMcpSchemaForEachSchematic } from '@push-based/angular-cli-utils';

const schemas = generateMcpSchemaForEachSchematic();
const componentSchema = schemas.component;

Object.entries(componentSchema.inputSchema.properties).forEach(
  ([prop, config]) => {
    console.log(`${prop}: ${config.type} (required: ${config.required})`);
  }
);
```

These examples demonstrate the flexibility and power of the `@push-based/angular-cli-utils` library for various use cases, from simple schema transformations to complex MCP server integrations.
