# Public API — Quick Reference

| Symbol                 | Kind     | Summary                                                         |
| ---------------------- | -------- | --------------------------------------------------------------- |
| `QUOTE_REGEX`          | constant | Regular expression for matching quotes at start/end of strings  |
| `getDecorators`        | function | Extract decorators from a TypeScript AST node safely            |
| `hasDecorators`        | function | Type guard to check if a node has decorators property           |
| `isComponentDecorator` | function | Check if a decorator is specifically a `@Component` decorator   |
| `isDecorator`          | function | Check if a decorator matches a specific name (or any decorator) |
| `removeQuotes`         | function | Remove surrounding quotes from a string literal AST node        |

## Function Signatures

### `getDecorators(node: ts.Node): readonly ts.Decorator[]`

Safely extracts decorators from a TypeScript AST node, handling different TypeScript compiler API versions.

**Parameters:**

- `node` - The TypeScript AST node to extract decorators from

**Returns:** Array of decorators (empty array if none found)

### `hasDecorators(node: ts.Node): node is ts.Node & { decorators: readonly ts.Decorator[] }`

Type guard function that checks if a node has a decorators property.

**Parameters:**

- `node` - The TypeScript AST node to check

**Returns:** Type predicate indicating if the node has decorators

### `isComponentDecorator(decorator: ts.Decorator): boolean`

Convenience function to check if a decorator is specifically a `@Component` decorator.

**Parameters:**

- `decorator` - The decorator to check

**Returns:** `true` if the decorator is `@Component`, `false` otherwise

### `isDecorator(decorator: ts.Decorator, decoratorName?: string): boolean`

Generic function to check if a decorator matches a specific name or is any valid decorator.

**Parameters:**

- `decorator` - The decorator to check
- `decoratorName` - Optional name to match against (if omitted, checks if it's any valid decorator)

**Returns:** `true` if the decorator matches the criteria, `false` otherwise

### `removeQuotes(node: ts.Node, sourceFile: ts.SourceFile): string`

Removes surrounding quotes from a string literal AST node's text content.

**Parameters:**

- `node` - The TypeScript AST node containing the quoted string
- `sourceFile` - The source file context for getting node text

**Returns:** The string content without surrounding quotes

## Constants

### `QUOTE_REGEX: RegExp`

Regular expression pattern `/^['"`]+|['"`]+$/g` used to match and remove quotes from the beginning and end of strings. Supports single quotes (`'`), double quotes (`"` ), and backticks (``  ` ``).
