# LLM Documentation Index

<a id="top"></a>
**Contents:**

- [Structure](#documentation-structure)
- [Foundation](#foundation-layer)
- [Intermediate](#intermediate-layer)
- [Advanced](#advanced-layer)
- [Navigation](#quick-navigation)
- [Related](#related-docs)
- [Tips](#tips)
- [Status](#doc-status)

This document provides quick access to all AI-friendly documentation across the shared libraries. Each library includes comprehensive API documentation, practical examples, and function references.

## 📚 Documentation Structure <a id="documentation-structure"></a>

Each library provides three types of AI documentation:

- **FUNCTIONS.md**: A-Z quick reference for every public symbol
- **API.md**: Overview, key features, and minimal usage examples
- **EXAMPLES.md**: Practical, runnable code scenarios with expected outputs

## 🏗️ Foundation Layer <a id="foundation-layer"></a>

### @push-based/models <a id="models"></a>

Core types, interfaces, and Zod schemas for the entire ecosystem.

- [🔍 Functions Reference](./models/ai/FUNCTIONS.md)
- [📖 API Overview](./models/ai/API.md)
- [💡 Examples](./models/ai/EXAMPLES.md)

### @push-based/typescript-ast-utils <a id="typescript-ast-utils"></a>

TypeScript AST parsing and manipulation utilities.

- [🔍 Functions Reference](./typescript-ast-utils/ai/FUNCTIONS.md)
- [📖 API Overview](./typescript-ast-utils/ai/API.md)
- [💡 Examples](./typescript-ast-utils/ai/EXAMPLES.md)

## 🔧 Intermediate Layer <a id="intermediate-layer"></a>

### @push-based/utils <a id="utils"></a>

General utility functions and file system operations.

- [🔍 Functions Reference](./utils/ai/FUNCTIONS.md)
- [📖 API Overview](./utils/ai/API.md)
- [💡 Examples](./utils/ai/EXAMPLES.md)

### @push-based/styles-ast-utils <a id="styles-ast-utils"></a>

CSS/SCSS AST parsing and manipulation utilities.

- [🔍 Functions Reference](./styles-ast-utils/ai/FUNCTIONS.md)
- [📖 API Overview](./styles-ast-utils/ai/API.md)
- [💡 Examples](./styles-ast-utils/ai/EXAMPLES.md)

## 🚀 Advanced Layer <a id="advanced-layer"></a>

### @push-based/angular-ast-utils <a id="angular-ast-utils"></a>

Angular component parsing and template/style analysis.

- [🔍 Functions Reference](./angular-ast-utils/ai/FUNCTIONS.md)
- [📖 API Overview](./angular-ast-utils/ai/API.md)
- [💡 Examples](./angular-ast-utils/ai/EXAMPLES.md)

### @push-based/ds-component-coverage <a id="ds-component-coverage"></a>

Design System component usage analysis and coverage reporting.

- [🔍 Functions Reference](./ds-component-coverage/ai/FUNCTIONS.md)
- [📖 API Overview](./ds-component-coverage/ai/API.md)
- [💡 Examples](./ds-component-coverage/ai/EXAMPLES.md)

## 🎯 Quick Navigation by Use Case <a id="quick-navigation"></a>

### Type Definitions & Schemas

- [models/FUNCTIONS.md](./models/ai/FUNCTIONS.md) - All available types and interfaces
- [models/API.md](./models/ai/API.md) - Core types and Zod schemas

### File & String Operations

- [utils/FUNCTIONS.md](./utils/ai/FUNCTIONS.md) - Complete function reference
- [utils/API.md](./utils/ai/API.md) - File system and utility functions
- [utils/EXAMPLES.md](./utils/ai/EXAMPLES.md) - File operations and string manipulation

### AST Analysis & Manipulation

- [typescript-ast-utils/FUNCTIONS.md](./typescript-ast-utils/ai/FUNCTIONS.md) - TS AST function reference
- [styles-ast-utils/FUNCTIONS.md](./styles-ast-utils/ai/FUNCTIONS.md) - CSS AST function reference
- [angular-ast-utils/FUNCTIONS.md](./angular-ast-utils/ai/FUNCTIONS.md) - Angular AST function reference

### Angular Development

- [angular-ast-utils/EXAMPLES.md](./angular-ast-utils/ai/EXAMPLES.md) - Component parsing and analysis

### Design System Analysis

- [ds-component-coverage/FUNCTIONS.md](./ds-component-coverage/ai/FUNCTIONS.md) - DS analysis functions
- [ds-component-coverage/API.md](./ds-component-coverage/ai/API.md) - DS migration and coverage analysis
- [ds-component-coverage/EXAMPLES.md](./ds-component-coverage/ai/EXAMPLES.md) - Real-world DS analysis scenarios

## 🔗 Related Documentation <a id="related-docs"></a>

- [DEPENDENCIES.md](./DEPENDENCIES.md) - Cross-dependencies and architecture overview
- [Individual README files](./*/README.md) - Library-specific setup and build instructions

## 💡 Tips for LLMs <a id="tips"></a>

1. **Start with FUNCTIONS.md** for quick function lookup and signatures
2. **Use API.md** for understanding library capabilities and minimal usage
3. **Reference EXAMPLES.md** for practical implementation patterns
4. **Check DEPENDENCIES.md** to understand library relationships
5. **Follow the layered architecture** when combining multiple libraries

## 📋 Documentation Status <a id="doc-status"></a>

All shared libraries have complete AI documentation:

| Library               | Functions | API | Examples | Status   |
| --------------------- | --------- | --- | -------- | -------- |
| models                | ✅        | ✅  | ✅       | Complete |
| typescript-ast-utils  | ✅        | ✅  | ✅       | Complete |
| utils                 | ✅        | ✅  | ✅       | Complete |
| styles-ast-utils      | ✅        | ✅  | ✅       | Complete |
| angular-ast-utils     | ✅        | ✅  | ✅       | Complete |
| ds-component-coverage | ✅        | ✅  | ✅       | Complete |

_Last updated: 2025-06-13_
