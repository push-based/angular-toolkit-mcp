# Public API — Quick Reference

| Symbol                              | Kind      | Signature                                                                     | Summary                                               |
| ----------------------------------- | --------- | ----------------------------------------------------------------------------- | ----------------------------------------------------- |
| `generateMcpSchemaForEachSchematic` | function  | `generateMcpSchemaForEachSchematic(): Record<string, ToolSchemaOptions>`      | Generate MCP schemas for all Angular CLI schematics   |
| `SchemaDefinition`                  | interface | `interface SchemaDefinition`                                                  | Complete Angular CLI schema definition                |
| `SchemaProperty`                    | interface | `interface SchemaProperty`                                                    | Property definition in an Angular CLI schema          |
| `transformSchemaToMCPParameters`    | function  | `transformSchemaToMCPParameters(schema: SchemaDefinition): ToolSchemaOptions` | Transform Angular CLI schema to MCP parameters format |
