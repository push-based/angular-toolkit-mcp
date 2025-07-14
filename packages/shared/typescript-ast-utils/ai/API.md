# TypeScript AST Utils

Comprehensive **TypeScript AST manipulation utilities** for working with TypeScript compiler API decorators, nodes, and source file analysis.

## Minimal usage

```ts
import {
  isComponentDecorator,
  getDecorators,
  removeQuotes,
} from '@push-based/typescript-ast-utils';
import * as ts from 'typescript';

// Check if a decorator is a Component decorator
const isComponent = isComponentDecorator(decorator);

// Get all decorators from a node
const decorators = getDecorators(classNode);

// Remove quotes from a string literal node
const cleanText = removeQuotes(stringNode, sourceFile);
```

## Key Features

- **Decorator Analysis**: Utilities for identifying and working with TypeScript decorators
- **Node Inspection**: Functions to safely extract decorators from AST nodes
- **String Processing**: Tools for cleaning quoted strings from AST nodes
- **Type Guards**: Type-safe functions for checking node properties
- **Cross-Version Compatibility**: Handles different TypeScript compiler API versions

## Use Cases

- **Angular Component Analysis**: Identify `@Component` decorators in Angular applications
- **AST Traversal**: Safely navigate TypeScript abstract syntax trees
- **Code Analysis Tools**: Build static analysis tools for TypeScript codebases
- **Decorator Processing**: Extract and process decorator metadata
- **Source Code Transformation**: Clean and manipulate string literals from source files

## Documentation map

| Doc                            | What you'll find                            |
| ------------------------------ | ------------------------------------------- |
| [FUNCTIONS.md](./FUNCTIONS.md) | A–Z quick reference for every public symbol |
| [EXAMPLES.md](./EXAMPLES.md)   | Runnable scenarios with expected output     |

```

```
