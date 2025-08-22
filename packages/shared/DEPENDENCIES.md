# Shared Libraries Dependencies

This document provides an AI-friendly overview of the shared libraries in the `/packages/shared` directory, their purposes, and cross-dependencies.

## Library Overview

### Foundation Layer (No Internal Dependencies)

#### `@code-pushup/models`

- **Purpose**: Core types, interfaces, and Zod schemas for the entire ecosystem
- **Key Exports**: Issue, AuditOutput, PluginConfig, CategoryConfig, ToolSchemaOptions
- **Dependencies**: None (foundation library)
- **Used By**: All other shared libraries

#### `@push-based/typescript-ast-utils`

- **Purpose**: TypeScript AST parsing and manipulation utilities
- **Key Exports**: isComponentDecorator, removeQuotes, getDecorators, isDecorator
- **Dependencies**: None (foundation library)
- **Used By**: angular-ast-utils

### Intermediate Layer (Single Foundation Dependency)

#### `@code-pushup/utils`

- **Purpose**: General utility functions and file system operations
- **Key Exports**: findFilesWithPattern, resolveFile
- **Dependencies**: models
- **Used By**: angular-ast-utils, ds-component-coverage

#### `@push-based/styles-ast-utils`

- **Purpose**: CSS/SCSS AST parsing and manipulation utilities
- **Key Exports**: parseStylesheet, CssAstVisitor, visitStyleSheet, styleAstRuleToSource
- **Dependencies**: models
- **Used By**: angular-ast-utils, ds-component-coverage

### Advanced Layer (Multiple Dependencies)

#### `@push-based/angular-ast-utils`

- **Purpose**: Angular component parsing and template/style analysis
- **Key Exports**: parseComponents, visitComponentTemplate, visitComponentStyles, findAngularUnits
- **Dependencies**:
  - models (types and schemas)
  - utils (file operations)
  - typescript-ast-utils (TS AST utilities)
  - styles-ast-utils (CSS AST utilities)
- **Used By**: ds-component-coverage

#### `@push-based/ds-component-coverage`

- **Purpose**: Design System component usage analysis and coverage reporting
- **Key Exports**: dsComponentCoveragePlugin, runnerFunction, getAngularDsUsageCategoryRefs
- **Dependencies**:
  - models (audit types)
  - utils (utilities)
  - styles-ast-utils (CSS analysis)
  - angular-ast-utils (component parsing)
- **Used By**: None (top-level plugin)

## Dependency Graph

```
@code-pushup/models (foundation)
├── @code-pushup/utils
├── styles-ast-utils
└── angular-ast-utils
    ├── @code-pushup/models
    ├── @code-pushup/utils
    ├── typescript-ast-utils
    └── styles-ast-utils

ds-component-coverage (most complex)
├── @code-pushup/models
├── @code-pushup/utils
├── styles-ast-utils
└── angular-ast-utils
```

## Build Order

Based on dependencies, the correct build order is:

1. **Foundation**: `models`, `typescript-ast-utils`
2. **Intermediate**: `utils`, `styles-ast-utils`
3. **Advanced**: `angular-ast-utils`
4. **Top-level**: `ds-component-coverage`

## Key Patterns

### Dependency Injection Pattern

- Libraries accept dependencies through imports rather than direct instantiation
- Enables testing and modularity

### Layered Architecture

- Clear separation between foundation, intermediate, and advanced layers
- Each layer builds upon the previous one

### Single Responsibility

- Each library has a focused purpose
- Cross-cutting concerns are handled by foundation libraries

### No Circular Dependencies

- Clean acyclic dependency graph
- Ensures predictable build order and runtime behavior

## Usage Guidelines for AI

### When to Use Each Library

- **models**: When you need type definitions, schemas, or interfaces
- **utils**: For file operations, string manipulation, or general utilities
- **typescript-ast-utils**: For TypeScript code analysis and manipulation
- **styles-ast-utils**: For CSS/SCSS parsing and analysis
- **angular-ast-utils**: For Angular component analysis and template/style processing
- **ds-component-coverage**: For Design System migration analysis and reporting

### Common Import Patterns

```typescript
// Foundation types
import { Issue, AuditOutput } from '@code-pushup/models';

// File operations
import { resolveFile, findFilesWithPattern } from '@code-pushup/utils';

// Angular component parsing
import {
  parseComponents,
  visitComponentTemplate,
} from '@push-based/angular-ast-utils';

// CSS analysis
import { parseStylesheet, visitStyleSheet } from '@push-based/styles-ast-utils';

// TypeScript utilities
import {
  isComponentDecorator,
  removeQuotes,
} from '@push-based/typescript-ast-utils';
```

### Integration Points

- All libraries use `models` for consistent type definitions
- File operations flow through `utils`
- AST operations are specialized by language (TS, CSS, Angular)
- Complex analysis combines multiple AST utilities through `angular-ast-utils`

## Maintenance Notes

- Changes to `models` affect all other libraries
- `angular-ast-utils` is the most integration-heavy library
- `ds-component-coverage` represents the full stack integration
- Foundation libraries should remain stable and focused
- New features should follow the established layering pattern
