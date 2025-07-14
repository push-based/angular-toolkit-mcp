# Models

Comprehensive **Zod schemas and TypeScript types** for Code PushUp configuration, reports, and data validation.

## Minimal usage

```ts
import { auditSchema, reportSchema } from '@push-based/models';

const audit = auditSchema.parse({
  slug: 'performance-audit',
  title: 'Performance Audit',
});

const isValidReport = reportSchema.safeParse(reportData).success;
```

## Key Features

- **Zod Schema Validation**: Comprehensive validation schemas for all Code PushUp data structures
- **TypeScript Types**: Full type safety with proper TypeScript definitions
- **Configuration Models**: Schemas for core config, plugins, categories, and groups
- **Report Models**: Complete report structure validation and types
- **Audit Models**: Detailed audit output and metadata schemas
- **MCP Integration**: Model Context Protocol tool schema definitions
- **Table Models**: Flexible table data structures for reports
- **Diff Models**: Report comparison and difference tracking

## Documentation map

| Doc                            | What you'll find                            |
| ------------------------------ | ------------------------------------------- |
| [FUNCTIONS.md](./FUNCTIONS.md) | A–Z quick reference for every public symbol |
| [EXAMPLES.md](./EXAMPLES.md)   | Runnable scenarios with expected output     |
