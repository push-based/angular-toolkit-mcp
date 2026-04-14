# Angular Toolkit MCP

[![npm version](https://badge.fury.io/js/@push-based%2Fangular-toolkit-mcp.svg)](https://www.npmjs.com/package/@push-based/angular-toolkit-mcp)

A Model Context Protocol (MCP) server that provides Angular project analysis and refactoring capabilities. This server enables LLMs to analyze Angular projects for component usage patterns, dependency analysis, code quality issues, and provides automated refactoring assistance.

## Key Features

- **Component Analysis**: Detect deprecated CSS classes and component usage violations
- **Safe Refactoring**: Generate contracts for safe component refactoring with breaking change detection
- **Dependency Mapping**: Map component dependencies across modules, templates, and styles
- **ESLint Integration**: Lint Angular files with automatic ESLint configuration discovery
- **Project Analysis**: Analyze buildable/publishable libraries and validate import paths
- **Component Documentation**: Retrieve component data and documentation, list available components

## Use Cases

- Angular project migration and refactoring
- Component usage analysis and dependency mapping
- Deprecated CSS class detection and reporting
- Component contract generation for safe refactoring
- Breaking change detection during component updates
- Code quality analysis and improvement

## Quick Start

Install and run via npx (no manual build required):

```json
{
  "mcpServers": {
    "angular-toolkit": {
      "command": "npx",
      "args": [
        "@push-based/angular-toolkit-mcp@latest",
        "--workspaceRoot=/absolute/path/to/your/angular/workspace",
        "--ds.uiRoot=packages/ui"
      ]
    }
  }
}
```

**Required Node.js version:** 18 or higher

## Configuration

### Prerequisites

- Node.js (version 18 or higher) with ESM support

### Installation & Setup

#### For Users

Simply use npx as shown in the Quick Start section above. No installation or build required.

#### For Contributors (Local Development)

1. Clone the repository

2. Install dependencies and build the MCP

   ```bash
   npm install
   npx nx build angular-mcp
   ```

3. Locate the built server

   After building, the server will be available at `packages/angular-mcp/dist/main.js`

### MCP Configuration

Add the server to your MCP client configuration (e.g., Claude Desktop, Cursor, Copilot, Windsurf or other MCP-compatible clients):

#### For Users (npx - Recommended)

```json
{
  "mcpServers": {
    "angular-toolkit": {
      "command": "npx",
      "args": [
        "@push-based/angular-toolkit-mcp@latest",
        "--workspaceRoot=/absolute/path/to/your/angular/workspace",
        "--ds.uiRoot=relative/path/to/ui/components",
        "--ds.storybookDocsRoot=relative/path/to/storybook/docs",
        "--ds.deprecatedCssClassesPath=relative/path/to/component-options.mjs",
        "--ds.generatedStylesRoot=relative/path/to/generated/styles"
      ]
    }
  }
}
```

#### For Contributors (Local Development)

When developing locally, point to the built server:

```json
{
  "mcpServers": {
    "angular-toolkit-mcp": {
      "command": "node",
      "args": [
        "/absolute/path/to/angular-toolkit-mcp/packages/angular-mcp/dist/main.js",
        "--workspaceRoot=/absolute/path/to/your/angular/workspace",
        "--ds.uiRoot=relative/path/to/ui/components",
        "--ds.storybookDocsRoot=relative/path/to/storybook/docs",
        "--ds.deprecatedCssClassesPath=relative/path/to/component-options.mjs",
        "--ds.generatedStylesRoot=relative/path/to/generated/styles"
      ]
    }
  }
}
```

> Note: `ds.storybookDocsRoot`, `ds.deprecatedCssClassesPath`, and `ds.generatedStylesRoot` are optional. The server will start without them. Tools that require these paths will return a clear error prompting you to provide the missing parameter.

> **Note**: The example file contains configuration for `ESLint` official MCP which is required for the toolkit to work properly.

### Configuration Parameters

#### Required Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `workspaceRoot` | Absolute path | Root directory of your Angular workspace | `/Users/dev/my-angular-app` |
| `ds.uiRoot` | Relative path | Directory containing UI components | `packages/ui` |

#### Optional Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `ds.storybookDocsRoot` | Relative path | Root directory containing Storybook documentation used by documentation-related tools | `storybook/docs` |
| `ds.deprecatedCssClassesPath` | Relative path | JavaScript file mapping deprecated CSS classes used by violation and deprecated CSS tools | `design-system/component-options.mjs` |
| `ds.generatedStylesRoot` | Relative path | Directory containing generated design token CSS files. Required for token-aware tools. | `dist/generated/styles` |

When optional parameters are omitted:

- `ds.storybookDocsRoot`: Tools will skip Storybook documentation lookups (e.g., `get-ds-component-data` will still return implementation/import data but may have no docs files).
- `ds.deprecatedCssClassesPath`: Tools that require the mapping will fail fast with a clear error. Affected tools include: `get-deprecated-css-classes`, `report-deprecated-css`, `report-all-violations`, and `report-violations`.
- `ds.generatedStylesRoot`: Token features are disabled. Token-aware tools return a clear message explaining that `--ds.generatedStylesRoot` is required. All other tools work normally.

#### Token Configuration Parameters

These parameters control how design tokens are discovered, organised, and categorised. All are optional and have sensible defaults. They are only relevant when `ds.generatedStylesRoot` is configured.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `ds.tokens.filePattern` | `string` | `**/semantic.css` | Glob pattern to discover token files inside `generatedStylesRoot`. Supports `**` (recursive) and `*` (single-segment) wildcards. Change if your token files have a different name (e.g. `**/variables.css`). |
| `ds.tokens.propertyPrefix` | `string \| null` | `null` | When set, only CSS custom properties whose name starts with this prefix are loaded. When `null`, all `--*` properties are included. Useful to filter out non-token properties from generated files. |
| `ds.tokens.directoryStrategy` | `flat \| brand-theme \| auto` | `flat` | Controls how the directory tree under `generatedStylesRoot` is interpreted. `flat`: all files belong to a single token set (empty scope). `brand-theme`: path segments map to scope keys (first → `brand`, second → `theme`). `auto`: infers from directory depth (≥ 2 levels → `brand-theme`, otherwise → `flat`). |
| `ds.tokens.categoryInference` | `by-prefix \| by-value \| none` | `by-prefix` | How tokens are assigned to categories (color, spacing, etc.). `by-prefix`: matches token names against `categoryPrefixMap` (longest prefix wins). `by-value`: infers from resolved values (hex/rgb/hsl → color, px/rem/em → spacing, % → opacity). `none`: leaves all tokens uncategorised. |

> **Note:** `ds.tokens.categoryPrefixMap` (a `Record<string, string>` mapping category names to token name prefixes) defaults to `{ color: '--semantic-color', spacing: '--semantic-spacing', radius: '--semantic-radius', typography: '--semantic-typography', size: '--semantic-size', opacity: '--semantic-opacity' }`. It is not exposed as a CLI argument but can be set via config file. Only relevant when `categoryInference` is `by-prefix`.

#### Deprecated CSS Classes File Format

The `component-options.mjs` file should export an array of component configurations:

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

export default dsComponents;
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
│       └── component-options.mjs     # ds.deprecatedCssClassesPath
├── dist/
│   └── generated/
│       └── styles/                   # ds.generatedStylesRoot
│           ├── semantic.css          # flat layout
│           └── acme/                 # brand-theme layout
│               ├── dark/
│               │   └── semantic.css
│               └── light/
│                   └── semantic.css
├── storybook/
│   └── docs/                         # ds.storybookDocsRoot
└── apps/
    └── my-app/
```

### Troubleshooting

- **Server not starting**: Ensure all paths are correct and the server is built
- **Permission errors**: Check that the Node.js process has read access to all specified directories
- **Component not found**: Verify that component names in `component-options.mjs` match your actual component class names
- **Path resolution issues**: Use absolute paths for `workspaceRoot` and relative paths (from workspace root) for other parameters

## Available Tools

### Component Analysis

- **`report-violations`**: Report deprecated CSS usage for a specific component in a directory. Supports optional file output with statistics.

- **`report-all-violations`**: Report all deprecated CSS usage across all components in a directory. Supports optional file output with statistics.

- **`group-violations`**: Creates balanced work distribution groups from violations reports using bin-packing algorithm. Maintains path exclusivity and directory boundaries for parallel development.

- **`report-deprecated-css`**: Report deprecated CSS classes found in styling files

- **`get-deprecated-css-classes`**: List deprecated CSS classes for a component

### Component Analysis

- **`list-ds-components`**: List all available Design System components in the project with their file paths and metadata

- **`get-ds-component-data`**: Return data for a component including implementation files, documentation files, and import path

- **`build-component-usage-graph`**: Maps where given Angular components are imported (modules, specs, templates, styles) so refactors touch every file

### Tool behavior with optional parameters

The following tools work without optional params:

- `get-project-dependencies`
- `build-component-usage-graph`
- `get-ds-component-data` (documentation section is empty if `ds.storybookDocsRoot` is not set)
- Component contract tools:
  - `build_component_contract`
  - `diff_component_contract`
  - `list_component_contracts`

The following tools require optional params to work:

- Requires `ds.deprecatedCssClassesPath`:
  - `get-deprecated-css-classes`
  - `report-deprecated-css`
  - `report-all-violations`
  - `report-violations`

- Requires `ds.storybookDocsRoot` for docs lookup (skipped otherwise):
  - `get-ds-component-data` (docs files discovery only)

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
