# Angular Component Tree

This document describes the structure of an Angular component tree created by using the utils helper under `angular.`
The tree is a representation of the Angular component structure in a project. It is used to visualize the component hierarchy and the relationships between components.

## File Content

- JS Content: `*{}` - shorthand for CSS text content
- HTML Content: `</>` - shorthand for HTML text content
- CSS Content: `{;}` - shorthand for JS text content
- JSON Content: `[:]` - shorthand for JSON text content

## File-tree

- Sold Style: `━` - bold
- Tree: `┃` - Tree connection
- Branch: `┣━━` / `┗━━` - Content connection e.g. `Object property`
- Folder Connector: `📂` - the property name `children`
- File Name: `:` - any value `string`, `number`
- Important File: `:` - entry points e.g. `📦` repo; `🅰️`, `⚛️` framework; `🟦` stack, `📜` organisation

### Example

```bash
root
┣━━ 📂src
┃   ┗━━ 📂button
┃       ┣━━ button.component.ts
┃       ┣━━ 📂other-compoennt
┃       ┗━━ 📂other-folder
┃           ┗━━ button.component.ts
┣━━ 📦package.json
┣━━ 🟦tsconfig.json
┣━━ 🅰️angular.json
┗━━ 📜README.md
```

## Code-tree

- Line Type: `│` - Tree connection
- Tree Style: `─` - light
- Branch: `├` / `└` - Content connection e.g. `Object property`
- Branch Connector: `╼` - the property name `children`
- Array: `[ ]` - Information list e.g. `Array`, `Set`, `Iterable`
- Array Index: `[0]` - list item e.g. `Object property`
- Object: `{ }` - Information pairs e.g. `Class`, `Object`, `Map`
- Prop Name: `prop` - any value `string`
- Value Connector: `:` - separates property or index from value
- Prop Value: `42`, `"test"` - any value any value `string`, `number`

### Example

```bash
{ } # component object
 ├╼ className: 'ButtonComponent' - # property: string
 └╼ styleUrls: [ ] # array
                ├╼ [0]: { } # index 0 - first style object
                │        ├╼ startLine: 4
                │        └╼ value: './styles-1.css'
                │                  └╼ value: './styles-1.css'
                └╼ [1]: { }  # index 1 - second style object
                         ├╼ startLine: 2 - # property: number
                         └╼ value: './styles-2.css' - # property: string
```

## AST-tree

- Line Type: `│` - Tree connection
- Tree Style: `─` - light
- Branch: `├` / `└` - Content connection e.g. `Object property`
- Branch Connector: `↘` - the property name `children`
- Array: `[ ]` - Information list e.g. `Array`, `Set`, `Iterable`
- Array Index: `[0]` - list item e.g. `Object property`
- Object: `{ }` - Information pairs e.g. `Class`, `Object`, `Map`
- Prop Name: `prop` - any value `string`
- Value Connector: `:` - separates property or index from value
- Prop Value: `42`, `"test"` - any value any value `string`, `number`

### Example

_`component.ts` - Text representation of the file content_

```bash
export class BaseComponent {
styles: String;
}

export class Component {
styles = ['styles.css'];
}
```

_AbstractSyntaxTree representation of the file content of `component.ts`_

```bash
( ) # `sourceFile` - A plain JavaScript function returning a object
 └╼ sourceFile: TsAstNode # Start of AST tree
                ├↘ [0]: ClassDeclaration # shorter form us array syntax is used
                └↘ [1]: ClassDeclaration
                        ├↘ ClassDeclaration
                        ├↘ FunctionDeclaration
                        └↘ PropertyDeclaration
                           └↘ ObjectLiteralExpression
                              └↘ PropertyAssignment
                                 └↘ Identifier
                                    └↘ getText(): './button.css' # Function returning `./button.css`
                                       ⤷ `.btn { color: red; }` # './button.css' content
```

## Tree Links

- File System Reference: `⤷` - links a file reference to it's content
- In Memory Reference: `↳` - links a reference to values, pairs or lists
- In Memory Reference: `↳` - links a reference to values, pairs or lists

### File System Reference

```bash
root
┗━━ 📂constants
    ┣━━ button.ts  # const buttonStylePath = './button.css'
    ┃   ⤷ `.btn { color: red; }` # './button.css' content
    ┗━━ select.ts # const selectTemplatePath = './select.css'
        ⤷ `<button class="btn btn-primary">Click me</button>` # './select.css' content
```

### In Memory Reference to File System

```bash
{ } # The default export of 'file.ts' file. (a JavaScript object)
 ├╼ className: 'ButtonComponent' - # property: string
 └╼ styleUrls: [ ] # array
                └╼ [0] './button.css' # index 0
                        ⤷ `.btn { color: red; }` # './button.css' content
```

### In Memory Reference - AST to FileSystem

```bash
( ) # `sourceFile` - A plain JavaScript function returning a object
 └╼ sourceFile:
    └╼ sourceFile: ObjectLiteralExpression
                   └↘ PropertyAssignment
                      └↘ Identifier
                         └↘ getText(): './button.css' # Function returning `./button.css`
                            ⤷ `.btn { color: red; }` # './button.css' content
```

## Angular Projects

### Minimal Angular Project - File Tree

```bash
root
┣━━ 📂public
┣━━ 📂src
┃   ┣━━ 📂app
┃   ┃   ┣━━ 📂until
┃   ┃   ┃   ┣━━ 📂button
┃   ┃   ┃   ┃   ┗━━ button.component.ts
┃   ┃   ┃   ┃        ↳ inline-css
┃   ┃   ┃   ┃        ↳ inline-html
┃   ┃   ┃   ┣━━ 📂select
┃   ┃   ┃   ┃   ┣━━ select.component.ts
┃   ┃   ┃   ┃   ┣━━ ⤷ select.component.css
┃   ┃   ┃   ┃   ┗━━ ⤷ select.component.html
┃   ┃   ┃   ┗━━...
┃   ┃   ┣━━ app.routes.ts
┃   ┃   ┣━━ app.component.ts
┃   ┃   ┗━━ app.config.ts
┃   ┣━━ index.html
┃   ┣━━ main.ts
┃   ┗━━ styles.css
┣━━ 📦package.json
┣━━ 🟦tsconfig.json
┣━━ 🅰️angular.json
┗━━ README.md
```

### Inline Assets (Styles and Templates)

```bash
root
┗━━ 📂any
    ┗━━ any.component.ts
        ├╼ styles: [ ]
        │           ├╼ [0]: `.btn { size: 13px; }`
        │           └╼ [1]: `.red { color: red; }`
        └╼ template: `<button class="btn red">Click me</button>`
```

### External Assets (Styles and Templates)

```bash
root
┣━━ 📂any
    ┣━━ any.component.ts
    ┃   ├╼ styleUrls: [ ]
    ┃   │              ├╼ [0]: `any.styles.css`
    ┃   │              │        ⤷ `.btn { size: 13px; }`
    ┃   │              └╼ [1]: `other.styles.css`
    ┃   │                       ⤷ `.red { color: red; }`
    ┃   └╼ templateUrl: 'any.component.html'
    ┃                    ⤷ `<button class="btn red">Click me</button>`
    ┣━━ any.style.css
    ┃   └╼ `.btn { color: red; }`
    ┣━━ other.style-1.css
    ┃   └╼ `.btn-primary { color: blue; }`
    ┗━━ any.component.html
        └╼ `<button class="btn btn-primary">Click me</button>`
```

## Creating Component AST's

### 1. Find Component Files - Regex matching

This part of the process should get optimized for scale as it is one of the costly steps.
We use simple regex matching against a string pattern to detect interesting files.
It is accepted that some of the matching files don't contain components (false positives), as they are later on excluded anyway.

```bash
[ ]
 ├╼ [0]: 'src/app/app.component.ts'
 ├╼ [1]: 'src/app/until/button/button.component.ts'
 └╼ [2]: 'src/app/until/select.component.ts'
```

### 2. Create the TS Program - Read Files and Parse AST

In this step we need to feed the TS program our entry to the frameworks TS code.

The entry is located in Angular's RC file `angular.json`.

```bash
root
┗━━ angular.json
    ⤷ index.html
    ⤷ styles.css
    ⤷ tsconfig.json
    ⤷ └↳main.ts # TSProgram entry
        └↘ app.config.ts
           └↘ app.routes.ts
              └↘ app/app.component.ts
                 ├↘ button.component.ts
                 │  ↳ styles[0]: `*{}`
                 │  ↳ styles[1]: `*{}`
                 │  ↳ template: `</>`
                 └↘ select.component.ts
                      ├↘ styleUrls[0]: 'select.styles.css'
                      │                ↳ `*{}`
                      ├↘ styleUrls[1]: 'select.styles.css'
                      │                ↳ `*{}`
                      └↘ templateUrl: 'select.component.html''
                                      ↳ `</>`
```

This can potentially be used to filter or add more file to our result file list.

```ts
const tsProgramm = createProgram([
  'src/app/app.component.ts',
  // ...
]);

const components = tsProgramm.getSourceFiles();
```

_components content_

```bash
[ ]
 ├↘ FunctionDeclaration # node_modules/lib/file.js
 ├↘ ClassDeclaration # node_modules/other-lib/other-file.js
 ├↘ VariableDeclaration # node_modules/any-lib/any-file.js
 ├↘ ClassDeclaration # app/app.component.ts
 ├↘ ClassDeclaration # app/ui/button.component.ts
 └↘ ClassDeclaration # app/ui/select.component.ts
```

### 3. Filtered Components - exclude other files that got added due to existing imports

```ts
components.filter((source) => matchingFiles.includes(source));
```

```bash
[ ]
 ├↘ ClassDeclaration # app/app.component.ts#AppComponent AST
 ├↘ ClassDeclaration # app/ui/button.component.ts#ButtonComponent AST
 └↘ ClassDeclaration # app/ui/select.component.ts#SelectComponent AST
```

### 4. Parsed Component Class

To go on with creating the Angular component tree we need to get the essential information of every component.

We need:

- basic component data (file, name, contextual infos)
- the component's AST
- all references to assets (internal as well as external)
- in a step that should be executable lazily we need to resolve the assets

As we have to nest different trees here let's quickly define the types that guide us in the future.

```ts
type Unit = {
  type: 'class' | 'html' | 'styles';
};
type Code = {
  filePath: string;
  value: string;
};
type CodeAware = {
  source: <T extends AST>() => T;
};

type LinkedCode<T> = Code &
  CodeAware<T> & {
    startLine: string;
  };

type Style = LinkedCode<CssAst> & {
  type: 'class';
};

type Template = LinkedCode<HtmlAst> & {
  type: 'class';
};

type ParsedComponentClass<T> = Code &
  CodeAware<T> & {
    type: 'class';
    className: string;
    styles?: Style[];
    styleUrls?: Style[];
    template?: Template;
    templateUrl?: Template;
  };
```

```bash
ParsedComponent
 ├╼ className: 'AppComponent`'
 ├╼ filePath: './app.component.ts'
 ├╼ value: `{;}`
 ├╼ source(): TsAst
 │            └↘ ClassDeclaration
 ├╼ styles: [ ]
 │           └╼ [0]: { }
 │                    ├╼ filePath: './app.component.ts'
 │                    ├╼ startLine: 7
 │                    ├╼ value: `*{}`
 │                    └╼ source(): CssAst
 │                                 └↘ RuleContainer
 ├╼ styleUrls: [ ]
 │              └╼ [0]: { }
 │                       ├╼ filePath: './any-styles.css'
 │                       ├╼ startLine: 13
 │                       ├╼ value: `*{}`
 │                       └╼ source(): CssAst
 │                                    └↘ RuleContainer
 ├╼ template: { }
 │             ├╼ filePath: './app.component.ts'
 │             ├╼ startLine: 21
 │             ├╼ value: `</>`
 │             └╼ source(): HtmlAst
 │                          └↘ Element
 └╼ templateUrl: { }
                  ├╼ filePath: './app.component.html'
                  ├╼ startLine: 42
                  ├╼ value: `*{}`
                  └╼ source(): HtmlAst
                               └↘ Element
```

### 5. Glue Traversal Logic

// walk component tree

```ts
const comps: ParsedCompoent[] = getParsedComponents();

function walkComponents(node: CodeAware, visitor: T) {
  for (let comp of comps) {
    if ('source' in comp) {
      const unit = comp.source();
      switch (unit.type) {
        case 'class':
          ts.visitAllChildren(unit, visitor as TsVisitor);
        case 'styles':
          walkRules(unit, visitor as CssVisitor);
        case 'html':
          forEachChild(unit, visitor as HtmlVisitor);
      }
    }
  }
}
```
