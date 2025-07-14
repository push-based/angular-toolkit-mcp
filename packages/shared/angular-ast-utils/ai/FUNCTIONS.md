# Public API — Quick Reference

| Symbol                              | Kind     | Signature                                                                     | Summary                                                |
| ----------------------------------- | -------- | ----------------------------------------------------------------------------- | ------------------------------------------------------ |
| `ANGULAR_COMPONENT_DECORATOR`       | function | `const ANGULAR_COMP...`                                                       | Constant for Angular component decorator string        |
| `AngularUnit`                       | function | `type AngularUnit = z.infer<…>`                                               | Union type for Angular unit types                      |
| `AngularUnitSchema`                 | function | `const AngularUnitSchema = z.enum…`                                           | Zod schema for Angular unit types                      |
| `Asset<T>`                          | function | `interface Asset<T>`                                                          | Typed asset wrapper                                    |
| `assetFromPropertyArrayInitializer` | function | `assetFromPropertyArrayInitializer(prop, sourceFile, textParser): Asset<T>[]` | Create assets from array property initializers         |
| `assetFromPropertyValueInitializer` | function | `assetFromPropertyValueInitializer(opts): Asset<T>`                           | Create asset from property value initializer           |
| `classDecoratorVisitor`             | function | `classDecoratorVisitor(opts): Visitor`                                        | Iterate class decorators in a SourceFile               |
| `findAngularUnits`                  | function | `findAngularUnits(directory, unit): Promise<string[]>`                        | Find Angular unit files by type in directory           |
| `ngClassesIncludeClassName`         | function | `ngClassesIncludeClassName(src, name): boolean`                               | Check if class name exists inside `[ngClass]` bindings |
| `parseAngularUnit`                  | function | `parseAngularUnit(directory, unit): Promise<ParsedComponent[]>`               | Parse Angular units in a directory                     |
| `parseClassNames`                   | function | `parseClassNames(str): string[]`                                              | Split string into individual CSS class names           |
| `parseComponents`                   | function | `parseComponents(files): Promise<ParsedComponent[]>`                          | Parse TS/TSX components into AST descriptors           |
| `ParsedComponent`                   | function | `type ParsedComponent`                                                        | Type for parsed Angular component data                 |
| `SourceLink`                        | function | `type SourceLink`                                                             | Type for source file location reference                |
| `tmplAstElementToSource`            | function | `tmplAstElementToSource(el): Source`                                          | Convert template AST elements to source map location   |
| `visitAngularDecoratorProperties`   | function | `visitAngularDecoratorProperties(opts)`                                       | Visit properties of Angular decorators                 |
| `visitAngularDecorators`            | function | `visitAngularDecorators(opts)`                                                | Traverse decorators & return matches                   |
| `visitComponentStyles`              | function | `visitComponentStyles(comp, arg, cb): Promise<Issue[]>`                       | Visit component styles with callback                   |
| `visitComponentTemplate`            | function | `visitComponentTemplate(comp, arg, cb)`                                       | Run visitor against a component's template             |
| `visitEachTmplChild`                | function | `visitEachTmplChild(nodes, visitor)`                                          | Visit each template AST child node                     |
