# Styles AST Utils

Small, zero‑dependency helpers for **parsing and analyzing CSS/SCSS stylesheets** using PostCSS inside Model Context Protocol (MCP) tools.

## Minimal usage

```ts
import { parseStylesheet, visitEachChild } from '@push-based/styles-ast-utils';

const result = parseStylesheet('.btn { color: red; }', 'styles.css');
const visitor = {
  visitRule: (rule) => console.log(rule.selector), // → '.btn'
};
visitEachChild(result.root, visitor);
```

## Key Features

- **Stylesheet Parsing**: Parse CSS/SCSS content using PostCSS with safe parsing
- **AST Traversal**: Multiple traversal strategies for visiting CSS nodes
- **Visitor Pattern**: Flexible visitor interface for processing different node types
- **Source Location Mapping**: Convert AST nodes to linkable source locations
- **Line Number Preservation**: Maintain accurate line numbers for error reporting
- **Safe Parsing**: Graceful handling of malformed CSS using postcss-safe-parser

## Documentation map

| Doc                            | What you'll find                            |
| ------------------------------ | ------------------------------------------- |
| [FUNCTIONS.md](./FUNCTIONS.md) | A–Z quick reference for every public symbol |
| [EXAMPLES.md](./EXAMPLES.md)   | Runnable scenarios with expected output     |
