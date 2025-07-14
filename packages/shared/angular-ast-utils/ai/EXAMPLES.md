# Examples

## 1 — Parsing components

> Parse a single Angular component file and list component class names.

```ts
import { parseComponents } from 'angular-ast-utils';

const comps = await parseComponents(['src/app/app.component.ts']);
console.log(comps.map((c) => c.className));
```

---

## 2 — Checking for a CSS class

> Detect whether a given class name appears in an Angular `[ngClass]` binding.

```ts
import { ngClassesIncludeClassName } from 'angular-ast-utils';

const source = "{'btn' : isActive}";
const hasBtn = ngClassesIncludeClassName(source, 'btn');
console.log(hasBtn); // → true
```

---

## 3 — Finding Angular units by type

> Find all components, directives, pipes, or services in a directory.

```ts
import { findAngularUnits } from 'angular-ast-utils';

const componentFiles = await findAngularUnits('./src/app', 'component');
const serviceFiles = await findAngularUnits('./src/app', 'service');
console.log(componentFiles); // → ['./src/app/app.component.ts', ...]
```

---

## 4 — Parsing Angular units in a directory

> Parse all Angular components in a directory and get their metadata.

```ts
import { parseAngularUnit } from 'angular-ast-utils';

const components = await parseAngularUnit('./src/app', 'component');
console.log(components.map((c) => c.className)); // → ['AppComponent', ...]
```

---

## 5 — Visiting component templates

> Run a visitor function against a component's template AST.

```ts
import { visitComponentTemplate } from 'angular-ast-utils';

await visitComponentTemplate(component, searchTerm, async (term, template) => {
  // Process template AST and return issues
  return [];
});
```

---

## 6 — Visiting component styles

> Run a visitor function against a component's styles.

```ts
import { visitComponentStyles } from 'angular-ast-utils';

const issues = await visitComponentStyles(
  component,
  searchTerm,
  async (term, style) => {
    // Process style AST and return issues
    return [];
  }
);
```
