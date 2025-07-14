# Angular AST Utils

Small, zero‑dependency helpers for **parsing and analysing Angular code** inside Model Context Protocol (MCP) tools.

## Minimal usage

```ts
import { parseComponents } from 'angular-ast-utils';

const components = await parseComponents(['src/app/app.component.ts']);
console.log(components[0].className); // → 'AppComponent'
```

## Key Features

- **Component Parsing**: Parse Angular components from TypeScript files
- **Template Analysis**: Visit and analyze Angular template AST nodes
- **Style Processing**: Process component styles and stylesheets
- **Angular Unit Discovery**: Find components, directives, pipes, and services
- **Decorator Traversal**: Walk through Angular decorators and their properties
- **CSS Class Detection**: Check for CSS classes in `[ngClass]` bindings

## Documentation map

| Doc                            | What you'll find                            |
| ------------------------------ | ------------------------------------------- |
| [FUNCTIONS.md](./FUNCTIONS.md) | A–Z quick reference for every public symbol |
| [EXAMPLES.md](./EXAMPLES.md)   | Runnable scenarios with expected output     |
