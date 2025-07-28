# Design System Tools for AI Agents

This document provides comprehensive guidance for AI agents working with Angular Design System (DS) migration and analysis tools. Each tool is designed to support automated refactoring, validation, and analysis workflows.

## Tool Categories

### 🔍 Project Analysis Tools

#### `report-violations`
**Purpose**: Identifies deprecated DS CSS usage patterns in Angular projects
**AI Usage**: Use as the first step in migration workflows to identify all violations before planning refactoring
**Key Parameters**:
- `directory`: Target analysis directory (use relative paths like `./src/app`)
- `componentName`: DS component class name (e.g., `DsButton`)
- `groupBy`: `"file"` or `"folder"` for result organization
**Output**: Structured violation reports grouped by file or folder
**Best Practice**: Always run this before other migration tools to establish baseline

#### `get-project-dependencies`
**Purpose**: Analyzes project structure, dependencies, and buildability
**AI Usage**: Validate project architecture before suggesting refactoring strategies
**Key Parameters**:
- `directory`: Project directory to analyze
- `componentName`: Optional DS component for import path validation
**Output**: Dependency analysis, buildable/publishable status, peer dependencies
**Best Practice**: Use to understand project constraints before recommending changes

#### `report-deprecated-css`
**Purpose**: Scans styling files for deprecated CSS classes
**AI Usage**: Complement violation reports with style-specific analysis
**Key Parameters**:
- `directory`: Directory containing style files
- `componentName`: Target DS component
**Output**: List of deprecated CSS classes found in stylesheets
**Best Practice**: Run after `report-violations` for comprehensive CSS analysis

### 📚 Component Information Tools

#### `get-component-docs`
**Purpose**: Retrieves MDX documentation for DS components
**AI Usage**: Access official component documentation to understand proper usage patterns
**Key Parameters**:
- `componentName`: DS component class name (e.g., `DsButton`)
**Output**: API documentation and usage examples in MDX format
**Best Practice**: Always consult docs before suggesting component usage changes

#### `get-component-paths`
**Purpose**: Provides filesystem and NPM import paths for DS components
**AI Usage**: Verify correct import paths when suggesting code changes
**Key Parameters**:
- `componentName`: DS component class name
**Output**: Source directory path and NPM import path
**Best Practice**: Use to ensure accurate import statements in generated code

#### `get-deprecated-css-classes`
**Purpose**: Lists deprecated CSS classes for specific DS components
**AI Usage**: Understand what CSS classes to avoid or replace during migration
**Key Parameters**:
- `componentName`: DS component class name
**Output**: Array of deprecated CSS class names
**Best Practice**: Cross-reference with violation reports to prioritize fixes

### 🔗 Analysis & Mapping Tools

#### `build-component-usage-graph`
**Purpose**: Maps component usage across modules, specs, templates, and styles
**AI Usage**: Understand component dependencies before refactoring to avoid breaking changes
**Key Parameters**:
- `directory`: Root directory for analysis
- `violationFiles`: Array of files with violations (from `report-violations`)
**Output**: Component usage graph showing all import relationships
**Best Practice**: Essential for large refactoring projects to map impact scope

#### `lint-changes`
**Purpose**: Runs ESLint validation on changed Angular files
**AI Usage**: Validate code quality after making automated changes
**Key Parameters**:
- `directory`: Root directory containing components
- `files`: Optional list of changed files
- `configPath`: Optional ESLint config path
**Output**: ESLint results and violations
**Best Practice**: Always run after code modifications to ensure quality

### 📋 Component Contract Tools

#### `build_component_contract`
**Purpose**: Creates static surface contracts for component templates and styles
**AI Usage**: Generate contracts before refactoring to track breaking changes
**Key Parameters**:
- `directory`: Component directory
- `templateFile`: Template file name (.html or .ts for inline)
- `styleFile`: Style file name (.scss, .css, etc.)
- `typescriptFile`: TypeScript component file (.ts)
**Output**: Component contract file with API surface
**Best Practice**: Create contracts before major refactoring for comparison

#### `diff_component_contract`
**Purpose**: Compares before/after contracts to identify breaking changes
**AI Usage**: Validate that refactoring doesn't introduce breaking changes
**Key Parameters**:
- `directory`: Component directory
- `contractBeforePath`: Path to pre-refactoring contract
- `contractAfterPath`: Path to post-refactoring contract
**Output**: Diff analysis showing breaking changes
**Best Practice**: Essential validation step after component modifications

#### `list_component_contracts`
**Purpose**: Lists all available component contracts
**AI Usage**: Discover existing contracts for comparison operations
**Key Parameters**:
- `directory`: Directory to search for contracts
**Output**: List of available contract files
**Best Practice**: Use to manage contract lifecycle during refactoring

### ⚙️ Configuration Tools

## AI Agent Workflow Patterns

### 1. Discovery & Analysis Workflow
```
1. report-violations → Identify all violations
2. get-project-dependencies → Analyze project structure
```

### 2. Planning & Preparation Workflow
```
1. build-component-usage-graph → Map component relationships
2. get-component-docs → Review proper usage patterns
3. get-component-paths → Verify import paths
4. build_component_contract → Create baseline contracts
```

### 3. Refactoring & Validation Workflow
```
1. [Apply code changes]
2. build_component_contract → Create post-change contracts
3. diff_component_contract → Validate no breaking changes
4. lint-changes → Ensure code quality
```

### 4. Non-Viable Cases Handling (Alternative to Steps 3-5)
```
1. report-deprecated-css → Identify CSS usage in global styles
2. report-deprecated-css → Identify CSS usage in component overrides
3. [Replace HTML classes with after-migration- prefix]
4. [Duplicate CSS selectors with prefixed versions]
5. report-deprecated-css → Validate CSS count consistency
6. report-violations → Validate violation reduction
```
**Purpose**: Used during the main DS refactoring workflow when components are identified as non-viable during planning step
**Trigger**: Requires developer review and approval after AI identifies non-viable cases in step 2
**Key Pattern**: Use `after-migration-[ORIGINAL_CLASS]` prefix to exclude components from future analysis
**Replaces**: Normal fix violations → validate changes → prepare report sequence

## Error Handling for AI Agents

- **Path Resolution**: Always use relative paths starting with `./`
- **Component Names**: Use PascalCase with `Ds` prefix (e.g., `DsButton`)
- **File Arrays**: Ensure violation file arrays are properly formatted
- **Directory Validation**: Verify directories exist before analysis
- **Contract Management**: Clean up temporary contracts after analysis

## Performance Considerations

- Use `groupBy: "folder"` for large codebases to reduce output size
- Limit `violationFiles` arrays to relevant files only
- Cache component documentation between related operations
- Run validation tools in parallel when possible

## Integration Points

These tools integrate with:
- **Storybook**: For component documentation
- **PostCSS**: For style analysis

## Output Formats

All tools return structured data suitable for:
- JSON parsing for programmatic analysis
- Markdown formatting for human-readable reports
- File path arrays for batch operations
- Contract objects for API comparison 