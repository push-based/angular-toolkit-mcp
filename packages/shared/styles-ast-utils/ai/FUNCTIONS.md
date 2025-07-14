# Public API — Quick Reference

| Symbol                 | Kind      | Summary                                            |
| ---------------------- | --------- | -------------------------------------------------- |
| `CssAstVisitor`        | interface | Visitor interface for traversing CSS AST nodes     |
| `NodeType`             | type      | Type mapping for visitor method parameters         |
| `parseStylesheet`      | function  | Parse CSS content and return PostCSS AST           |
| `styleAstRuleToSource` | function  | Convert CSS rule to linkable source location       |
| `stylesAstUtils`       | function  | Utility function (returns package identifier)      |
| `visitEachChild`       | function  | Traverse AST calling visitor methods for each node |
| `visitEachStyleNode`   | function  | Recursively visit CSS nodes with visitor pattern   |
| `visitStyleSheet`      | function  | Visit top-level stylesheet nodes                   |

## Interface Details

### `CssAstVisitor<T = void>`

Visitor interface for processing different types of CSS AST nodes:

- `visitRoot?: (root: Container) => T` - Called once for the root node
- `visitAtRule?: (atRule: AtRule) => T` - Called for @rule nodes (@media, @charset, etc.)
- `visitRule?: (rule: Rule) => T` - Called for CSS rule nodes (.btn, .box, etc.)
- `visitDecl?: (decl: Declaration) => T` - Called for property declarations (color: red, etc.)
- `visitComment?: (comment: Comment) => T` - Called for comment nodes (/_ comment _/)

### `NodeType<K extends keyof CssAstVisitor>`

Type utility that maps visitor method names to their corresponding PostCSS node types:

- `visitRoot` → `Container`
- `visitAtRule` → `AtRule`
- `visitRule` → `Rule`
- `visitDecl` → `Declaration`
- `visitComment` → `Comment`

## Function Details

### `parseStylesheet(content: string, filePath: string)`

Parse CSS content using PostCSS with safe parsing. Returns a PostCSS `LazyResult` object.

**Parameters:**

- `content` - The CSS content to parse
- `filePath` - File path for source mapping and error reporting

**Returns:** PostCSS `LazyResult` with parsed AST

### `styleAstRuleToSource(rule: Pick<Rule, 'source'>, startLine?: number)`

Convert a PostCSS rule to a linkable source location for issue reporting.

**Parameters:**

- `rule` - PostCSS rule with source information
- `startLine` - Optional offset for line numbers (0-indexed, default: 0)

**Returns:** `Issue['source']` object with file path and position information

### `visitEachChild<T>(root: Root, visitor: CssAstVisitor<T>)`

Single function that traverses the entire AST, calling specialized visitor methods for each node type.

**Parameters:**

- `root` - PostCSS Root node to traverse
- `visitor` - Visitor object with optional methods for different node types

### `visitEachStyleNode<T>(nodes: Root['nodes'], visitor: CssAstVisitor<T>)`

Recursively visit CSS nodes using the visitor pattern, processing nested structures.

**Parameters:**

- `nodes` - Array of PostCSS nodes to visit
- `visitor` - Visitor object with optional methods for different node types

### `visitStyleSheet<T>(root: Root, visitor: CssAstVisitor<T>)`

Visit only the top-level nodes of a stylesheet (non-recursive).

**Parameters:**

- `root` - PostCSS Root node
- `visitor` - Visitor object with optional methods for different node types
