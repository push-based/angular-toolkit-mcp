# Angular Toolkit MCP

A Model Context Protocol (MCP) server that provides Angular project analysis and refactoring capabilities. This server enables LLMs to analyze Angular projects for component usage patterns, dependency analysis, code quality issues, and provides automated refactoring assistance.

## Installation

No installation required! Run directly with npx:

```bash
npx @push-based/angular-toolkit-mcp@latest --workspaceRoot=/path/to/workspace --ds.uiRoot=packages/ui
```

## Configuration

Add the server to your MCP client configuration (e.g., Claude Desktop, Cursor, Copilot, Windsurf):

```json
{
  "mcpServers": {
    "angular-toolkit": {
      "command": "npx",
      "args": [
        "@push-based/angular-toolkit-mcp@latest",
        "--workspaceRoot=/absolute/path/to/your/angular/workspace",
        "--ds.uiRoot=packages/ui",
        "--ds.storybookDocsRoot=storybook/docs",
        "--ds.deprecatedCssClassesPath=design-system/component-options.mjs"
      ]
    }
  }
}
```

### Configuration Parameters

#### Required Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `workspaceRoot` | Absolute path | Root directory of your Angular workspace | `/Users/dev/my-angular-app` |
| `ds.uiRoot` | Relative path | Directory containing UI components | `packages/ui` |

#### Optional Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `ds.storybookDocsRoot` | Relative path | Root directory containing Storybook documentation | `storybook/docs` |
| `ds.deprecatedCssClassesPath` | Relative path | JavaScript file mapping deprecated CSS classes | `design-system/component-options.mjs` |

## Key Features

- **Component Analysis**: Detect deprecated CSS classes and component usage violations
- **Safe Refactoring**: Generate contracts for safe component refactoring with breaking change detection
- **Dependency Mapping**: Map component dependencies across modules, templates, and styles
- **ESLint Integration**: Lint Angular files with automatic ESLint configuration discovery
- **Project Analysis**: Analyze buildable/publishable libraries and validate import paths
- **Component Documentation**: Retrieve component data and documentation, list available components

## Available Tools

### Component Analysis
- `report-violations` - Report deprecated CSS usage in a directory
- `report-deprecated-css` - Report deprecated CSS classes found in styling files
- `get-deprecated-css-classes` - List deprecated CSS classes for a component
- `list-ds-components` - List all available Design System components
- `get-ds-component-data` - Get component data including implementation and documentation
- `build-component-usage-graph` - Map component imports across the project

### Component Contracts
- `build_component_contract` - Generate a static surface contract for a component
- `diff_component_contract` - Compare before/after contracts for breaking changes
- `list_component_contracts` - List all available component contracts

### Project Analysis
- `get-project-dependencies` - Analyze project dependencies and library configuration
- `lint-changes` - Lint changed Angular files using ESLint rules

## Requirements

- Node.js version 18 or higher

## Documentation

For comprehensive documentation, guides, and workflows, see the [full documentation](https://github.com/push-based/angular-toolkit-mcp).

## License

MIT License - see the [LICENSE](https://github.com/push-based/angular-toolkit-mcp/blob/main/LICENSE) file for details.

---

<div align="center">
  <p><strong>Sponsored by Entain</strong></p>
</div>
