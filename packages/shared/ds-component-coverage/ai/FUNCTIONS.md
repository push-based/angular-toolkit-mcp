# Public API — Quick Reference

| Symbol                                 | Kind     | Signature                                                                                     | Summary                                              |
| -------------------------------------- | -------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `ANGULAR_DS_USAGE_PLUGIN_SLUG`         | constant | `const ANGULAR_DS_USAGE_PLUGIN_SLUG: string`                                                  | Plugin slug identifier for ds-component-coverage     |
| `ComponentCoverageRunnerOptionsSchema` | schema   | `const ComponentCoverageRunnerOptionsSchema: ZodObject`                                       | Zod schema for runner configuration validation       |
| `ComponentReplacement`                 | type     | `type ComponentReplacement`                                                                   | Type for component replacement configuration         |
| `ComponentReplacementSchema`           | schema   | `const ComponentReplacementSchema: ZodObject`                                                 | Zod schema for component replacement validation      |
| `CreateRunnerConfig`                   | type     | `type CreateRunnerConfig`                                                                     | Type alias for runner configuration                  |
| `dsComponentCoveragePlugin`            | function | `dsComponentCoveragePlugin(options: DsComponentUsagePluginConfig): PluginConfig`              | Create DS component coverage plugin for Code Pushup  |
| `DsComponentUsagePluginConfig`         | type     | `type DsComponentUsagePluginConfig`                                                           | Configuration type for the DS component usage plugin |
| `getAngularDsUsageCategoryRefs`        | function | `getAngularDsUsageCategoryRefs(componentReplacements: ComponentReplacement[]): CategoryRef[]` | Generate category references for audit organization  |
| `runnerFunction`                       | function | `runnerFunction(config: CreateRunnerConfig): Promise<AuditOutputs>`                           | Execute DS component coverage analysis               |
