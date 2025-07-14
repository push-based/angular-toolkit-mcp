# Public API — Quick Reference

| Symbol                          | Kind      | Summary                                                   |
| ------------------------------- | --------- | --------------------------------------------------------- |
| `ArgumentValue`                 | type      | CLI argument value types (number, string, boolean, array) |
| `Audit`                         | type      | Audit metadata and configuration                          |
| `AuditDetails`                  | type      | Detailed audit information with issues and tables         |
| `AuditDiff`                     | type      | Audit comparison between two reports                      |
| `AuditOutput`                   | type      | Audit execution result with score and value               |
| `AuditOutputs`                  | type      | Array of audit outputs from plugin execution              |
| `AuditReport`                   | type      | Combined audit metadata and output                        |
| `AuditResult`                   | type      | Audit result in report comparison                         |
| `CategoryConfig`                | type      | Category configuration with weighted references           |
| `CategoryDiff`                  | type      | Category comparison between two reports                   |
| `CategoryRef`                   | type      | Weighted reference to audit or group in category          |
| `CategoryResult`                | type      | Category result in report comparison                      |
| `CliArgsObject`                 | type      | CLI arguments object with typed values                    |
| `Commit`                        | type      | Git commit information                                    |
| `CoreConfig`                    | type      | Main Code PushUp configuration                            |
| `DiagnosticsAware`              | interface | Interface for objects that can report issues              |
| `Format`                        | type      | Report output format (json, md)                           |
| `Group`                         | type      | Group configuration with audit references                 |
| `GroupDiff`                     | type      | Group comparison between two reports                      |
| `GroupMeta`                     | type      | Group metadata information                                |
| `GroupRef`                      | type      | Weighted reference to group                               |
| `GroupResult`                   | type      | Group result in report comparison                         |
| `Issue`                         | type      | Issue information with severity and source location       |
| `IssueSeverity`                 | type      | Issue severity level (info, warning, error)               |
| `MaterialIcon`                  | type      | Material Design icon name                                 |
| `PersistConfig`                 | type      | Configuration for persisting reports                      |
| `PluginConfig`                  | type      | Plugin configuration with runner and audits               |
| `PluginMeta`                    | type      | Plugin metadata information                               |
| `PluginReport`                  | type      | Plugin execution report                                   |
| `Report`                        | type      | Complete Code PushUp report                               |
| `ReportsDiff`                   | type      | Comparison between two reports                            |
| `RunnerConfig`                  | type      | Runner configuration for plugin execution                 |
| `RunnerFilesPaths`              | type      | File paths for runner configuration and output            |
| `RunnerFunction`                | type      | Function-based runner implementation                      |
| `SourceFileLocation`            | type      | Source file location with position information            |
| `Table`                         | type      | Table data structure for reports                          |
| `TableAlignment`                | type      | Table column alignment (left, center, right)              |
| `TableCellValue`                | type      | Table cell value types                                    |
| `TableColumnObject`             | type      | Table column configuration object                         |
| `TableColumnPrimitive`          | type      | Primitive table column alignment                          |
| `TableRowObject`                | type      | Table row as key-value object                             |
| `TableRowPrimitive`             | type      | Table row as array of values                              |
| `ToolHandlerContentResult`      | type      | MCP tool handler content result                           |
| `ToolSchemaOptions`             | type      | MCP tool schema configuration options                     |
| `ToolsConfig`                   | type      | MCP tools configuration                                   |
| `UploadConfig`                  | type      | Configuration for uploading reports to portal             |
| `auditDetailsSchema`            | schema    | Zod schema for audit details validation                   |
| `auditDiffSchema`               | schema    | Zod schema for audit diff validation                      |
| `auditOutputSchema`             | schema    | Zod schema for audit output validation                    |
| `auditOutputsSchema`            | schema    | Zod schema for audit outputs array validation             |
| `auditReportSchema`             | schema    | Zod schema for audit report validation                    |
| `auditResultSchema`             | schema    | Zod schema for audit result validation                    |
| `auditSchema`                   | schema    | Zod schema for audit validation                           |
| `categoryConfigSchema`          | schema    | Zod schema for category configuration validation          |
| `categoryDiffSchema`            | schema    | Zod schema for category diff validation                   |
| `categoryRefSchema`             | schema    | Zod schema for category reference validation              |
| `categoryResultSchema`          | schema    | Zod schema for category result validation                 |
| `commitSchema`                  | schema    | Zod schema for git commit validation                      |
| `coreConfigSchema`              | schema    | Zod schema for core configuration validation              |
| `fileNameSchema`                | schema    | Zod schema for file name validation                       |
| `filePathSchema`                | schema    | Zod schema for file path validation                       |
| `formatSchema`                  | schema    | Zod schema for format validation                          |
| `groupRefSchema`                | schema    | Zod schema for group reference validation                 |
| `groupResultSchema`             | schema    | Zod schema for group result validation                    |
| `groupSchema`                   | schema    | Zod schema for group validation                           |
| `issueSchema`                   | schema    | Zod schema for issue validation                           |
| `issueSeveritySchema`           | schema    | Zod schema for issue severity validation                  |
| `materialIconSchema`            | schema    | Zod schema for material icon validation                   |
| `persistConfigSchema`           | schema    | Zod schema for persist configuration validation           |
| `pluginConfigSchema`            | schema    | Zod schema for plugin configuration validation            |
| `pluginMetaSchema`              | schema    | Zod schema for plugin metadata validation                 |
| `pluginReportSchema`            | schema    | Zod schema for plugin report validation                   |
| `reportSchema`                  | schema    | Zod schema for report validation                          |
| `reportsDiffSchema`             | schema    | Zod schema for reports diff validation                    |
| `runnerConfigSchema`            | schema    | Zod schema for runner configuration validation            |
| `runnerFilesPathsSchema`        | schema    | Zod schema for runner file paths validation               |
| `runnerFunctionSchema`          | schema    | Zod schema for runner function validation                 |
| `sourceFileLocationSchema`      | schema    | Zod schema for source file location validation            |
| `tableAlignmentSchema`          | schema    | Zod schema for table alignment validation                 |
| `tableCellValueSchema`          | schema    | Zod schema for table cell value validation                |
| `tableColumnObjectSchema`       | schema    | Zod schema for table column object validation             |
| `tableColumnPrimitiveSchema`    | schema    | Zod schema for table column primitive validation          |
| `tableRowObjectSchema`          | schema    | Zod schema for table row object validation                |
| `tableRowPrimitiveSchema`       | schema    | Zod schema for table row primitive validation             |
| `tableSchema`                   | function  | Function that returns Zod schema for table validation     |
| `uploadConfigSchema`            | schema    | Zod schema for upload configuration validation            |
| `CONFIG_FILE_NAME`              | constant  | Default configuration file name                           |
| `DEFAULT_PERSIST_FILENAME`      | constant  | Default persist filename                                  |
| `DEFAULT_PERSIST_FORMAT`        | constant  | Default persist format array                              |
| `DEFAULT_PERSIST_OUTPUT_DIR`    | constant  | Default persist output directory                          |
| `MAX_DESCRIPTION_LENGTH`        | constant  | Maximum description length limit                          |
| `MAX_ISSUE_MESSAGE_LENGTH`      | constant  | Maximum issue message length limit                        |
| `MAX_SLUG_LENGTH`               | constant  | Maximum slug length limit                                 |
| `MAX_TITLE_LENGTH`              | constant  | Maximum title length limit                                |
| `SUPPORTED_CONFIG_FILE_FORMATS` | constant  | Array of supported configuration file formats             |
| `exists`                        | function  | Utility function to check if value exists (non-null)      |
