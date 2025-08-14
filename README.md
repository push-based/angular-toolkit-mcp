# Angular Toolkit MCP

A Model Context Protocol (MCP) server that provides Angular project analysis and refactoring capabilities. This server enables LLMs to analyze Angular projects for component usage patterns, dependency analysis, code quality issues, and provides automated refactoring assistance.

## Key Features

- **Component Analysis**: Detect deprecated CSS classes and component usage violations
- **Safe Refactoring**: Generate contracts for safe component refactoring with breaking change detection
- **Dependency Mapping**: Map component dependencies across modules, templates, and styles
- **ESLint Integration**: Lint Angular files with automatic ESLint configuration discovery
- **Project Analysis**: Analyze buildable/publishable libraries and validate import paths
- **Component Documentation**: Retrieve component data and documentation

## Use Cases

- Angular project migration and refactoring
- Component usage analysis and dependency mapping
- Deprecated CSS class detection and reporting
- Component contract generation for safe refactoring
- Breaking change detection during component updates
- Code quality analysis and improvement

## Configuration

### Prerequisites

- Node.js (version 18 or higher)

### Installation & Setup

1. Clone the repository

2. Build the MCP

  ```bash
   npm install
   npx nx build angular-mcp
  ```

2. Locate the built server

   After building, the server will be available at `packages/angular-mcp/dist/main.js`

### MCP Configuration

Add the server to your MCP client configuration (e.g., Claude Desktop, Cursor, Copilot, Windsurf or other MCP-compatible clients):

#### For Cursor (`.cursor/mcp.json` or MCP settings):

Copy `.cursor/mcp.json.example` to the project you're working on. Copied file should be: `.cursor/mcp.json` and update `angular-toolkit-mcp` values accordingly:

```json
{
  "mcpServers": {
     ...(other servers)...
    "angular-toolkit-mcp": {
      "command": "node",
      "args": [
        "/absolute/path/to/angular-mcp-server/packages/angular-mcp-server/dist/index.js",
        "--workspaceRoot=/absolute/path/to/your/angular/workspace",
        "--ds.storybookDocsRoot=relative/path/to/storybook/docs",
        "--ds.deprecatedCssClassesPath=relative/path/to/component-options.js",
        "--ds.uiRoot=relative/path/to/ui/components"
      ]
    }
  }
}
```

> **Note**: The example file contains configuration for `ESLint` official MCP which is required for the toolkit to work properly.

### Configuration Parameters

#### Required Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `workspaceRoot` | Absolute path | Root directory of your Angular workspace | `/Users/dev/my-angular-app` |
| `ds.storybookDocsRoot` | Relative path | Root directory containing Storybook documentation | `storybook/docs` |
| `ds.deprecatedCssClassesPath` | Relative path | JavaScript file mapping deprecated CSS classes | `design-system/component-options.js` |
| `ds.uiRoot` | Relative path | Directory containing UI components | `packages/ui` |

#### Deprecated CSS Classes File Format

The `component-options.js` file should export an array of component configurations:

```javascript
const dsComponents = [
  {
    componentName: 'DsButton',
    deprecatedCssClasses: ['btn', 'btn-primary', 'legacy-button']
  },
  {
    componentName: 'DsModal',
    deprecatedCssClasses: ['modal', 'old-modal']
  }
];

module.exports = dsComponents;
```

### Example Project Structure

```
my-angular-workspace/
├── packages/
│   ├── ui/                           # ds.uiRoot
│   │   ├── button/
│   │   ├── modal/
│   │   └── ...
│   └── design-system/
│       └── component-options.js      # ds.deprecatedCssClassesPath
├── storybook/
│   └── docs/                         # ds.storybookDocsRoot
└── apps/
    └── my-app/
```

### Troubleshooting

- **Server not starting**: Ensure all paths are correct and the server is built
- **Permission errors**: Check that the Node.js process has read access to all specified directories
- **Component not found**: Verify that component names in `component-options.js` match your actual component class names
- **Path resolution issues**: Use absolute paths for `workspaceRoot` and relative paths (from workspace root) for other parameters

## Available Tools

### Component Analysis

- **`report-violations`**: Report deprecated CSS usage in a directory with configurable grouping format

- **`report-deprecated-css`**: Report deprecated CSS classes found in styling files

- **`get-deprecated-css-classes`**: List deprecated CSS classes for a component

### Component Analysis

- **`get-ds-component-data`**: Return data for a component including implementation files, documentation files, and import path

- **`build-component-usage-graph`**: Maps where given Angular components are imported (modules, specs, templates, styles) so refactors touch every file

### Component Contracts

- **`build_component_contract`**: Generate a static surface contract for a component's template and SCSS

- **`diff_component_contract`**: Compare before/after contracts for parity and surface breaking changes

- **`list_component_contracts`**: List all available component contracts in the .cursor/tmp/contracts directory

### Project Analysis

- **`get-project-dependencies`**: Analyze project dependencies and detect if library is buildable/publishable. Checks for peer dependencies and validates import paths for components

- **`lint-changes`**: Lint changed Angular files using ESLint rules. Automatically resolves ESLint config by walking up the directory tree

## Component Contract Workflow

The component contract system provides a safety net for Angular component refactoring:

1. **Generate Initial Contract**: Create a baseline contract before refactoring
2. **Perform Refactoring**: Make your component changes
3. **Generate New Contract**: Create a contract after refactoring
4. **Compare Contracts**: Detect breaking changes and API differences

```bash
# 1. Generate initial contract
User: build_component_contract for my-component

# 2. Make component changes...

# 3. Generate new contract and compare
User: build_component_contract for my-component
User: diff_component_contract old-contract.json new-contract.json
```

## Angular Project Integration

This MCP server is designed for Angular project analysis and refactoring. It helps with:

- **Migration Planning**: Identify all usages of deprecated components/classes
- **Refactoring Safety**: Generate contracts to ensure no breaking changes
- **Documentation Access**: Quick access to component documentation and examples
- **Code Quality**: Analyze and improve code quality across your Angular project

## Documentation

For comprehensive documentation, guides, and workflows, see our [Documentation Hub](docs/README.md).

## Contributing

Please read our [Contributing Guide](CONTRIBUTING.md). 

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p><strong>Sponsored by</strong></p>
  <img src="assets/entain.png" alt="Entain" width="150">
</div>
