# Examples

## 1 — Basic stylesheet parsing

> Parse CSS content and access the AST structure.

```ts
import { parseStylesheet } from '@push-based/styles-ast-utils';

const cssContent = `
.btn {
  color: red;
  background: blue;
}

.card {
  padding: 1rem;
}
`;

const result = parseStylesheet(cssContent, 'styles.css');
const root = result.root;

console.log(`Parsed ${root.nodes.length} top-level nodes`); // → 'Parsed 2 top-level nodes'
console.log(root.nodes[0].type); // → 'rule'
console.log(root.nodes[0].selector); // → '.btn'
```

---

## 2 — Using the visitor pattern

> Traverse CSS AST using the visitor pattern to collect information.

```ts
import { parseStylesheet, visitEachChild } from '@push-based/styles-ast-utils';

const cssContent = `
/* Main styles */
.btn {
  color: red;
  font-size: 14px;
}

@media (max-width: 768px) {
  .btn {
    font-size: 12px;
  }
}
`;

const result = parseStylesheet(cssContent, 'styles.css');
const selectors: string[] = [];
const properties: string[] = [];
const mediaQueries: string[] = [];

const visitor = {
  visitRule: (rule) => {
    selectors.push(rule.selector);
  },
  visitDecl: (decl) => {
    properties.push(`${decl.prop}: ${decl.value}`);
  },
  visitAtRule: (atRule) => {
    if (atRule.name === 'media') {
      mediaQueries.push(atRule.params);
    }
  },
  visitComment: (comment) => {
    console.log(`Found comment: ${comment.text}`);
  },
};

visitEachChild(result.root, visitor);

console.log('Selectors:', selectors);
// → ['Selectors:', ['.btn', '.btn']]

console.log('Properties:', properties);
// → ['Properties:', ['color: red', 'font-size: 14px', 'font-size: 12px']]

console.log('Media queries:', mediaQueries);
// → ['Media queries:', ['(max-width: 768px)']]
```

---

## 3 — Converting AST nodes to source locations

> Convert CSS rules to linkable source locations for error reporting.

```ts
import {
  parseStylesheet,
  styleAstRuleToSource,
} from '@push-based/styles-ast-utils';
import { Rule } from 'postcss';

const cssContent = `
.header {
  background: linear-gradient(to right, #ff0000, #00ff00);
  padding: 2rem;
}

.footer {
  margin-top: auto;
}
`;

const result = parseStylesheet(cssContent, 'components/layout.css');
const rules = result.root.nodes.filter(
  (node) => node.type === 'rule'
) as Rule[];

rules.forEach((rule, index) => {
  const source = styleAstRuleToSource(rule);
  console.log(`Rule ${index + 1}:`, {
    selector: rule.selector,
    location: `${source.file}:${source.position.startLine}:${source.position.startColumn}`,
    span: `${source.position.startLine}-${source.position.endLine}`,
  });
});

// Output:
// Rule 1: {
//   selector: '.header',
//   location: 'components/layout.css:2:1',
//   span: '2-4'
// }
// Rule 2: {
//   selector: '.footer',
//   location: 'components/layout.css:6:1',
//   span: '6-8'
// }
```

---

## 4 — Handling inline styles with line offset

> Parse inline styles and adjust line numbers for accurate source mapping.

```ts
import {
  parseStylesheet,
  styleAstRuleToSource,
} from '@push-based/styles-ast-utils';
import { Rule } from 'postcss';

// Simulate inline styles starting at line 15 in a component file
const inlineStyles = `.component-btn { color: blue; }`;
const componentFilePath = 'src/app/button.component.ts';
const styleStartLine = 15; // 0-indexed line where styles begin

const result = parseStylesheet(inlineStyles, componentFilePath);
const rule = result.root.nodes[0] as Rule;

// Convert with line offset
const source = styleAstRuleToSource(rule, styleStartLine);

console.log('Inline style location:', {
  file: source.file,
  line: source.position.startLine, // → 16 (adjusted for file position)
  selector: rule.selector, // → '.component-btn'
});
```

---

## 5 — Recursive node traversal

> Use recursive traversal to process nested CSS structures.

```ts
import {
  parseStylesheet,
  visitEachStyleNode,
} from '@push-based/styles-ast-utils';

const cssContent = `
.container {
  display: flex;
  
  .item {
    flex: 1;
    
    &:hover {
      opacity: 0.8;
    }
  }
}

@supports (display: grid) {
  .grid-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }
}
`;

const result = parseStylesheet(cssContent, 'nested-styles.scss');
let depth = 0;

const visitor = {
  visitRule: (rule) => {
    console.log(`${'  '.repeat(depth)}Rule: ${rule.selector}`);
    depth++;
    if (rule.nodes) {
      visitEachStyleNode(rule.nodes, visitor);
    }
    depth--;
  },
  visitAtRule: (atRule) => {
    console.log(`${'  '.repeat(depth)}@${atRule.name}: ${atRule.params}`);
    depth++;
    if (atRule.nodes) {
      visitEachStyleNode(atRule.nodes, visitor);
    }
    depth--;
  },
  visitDecl: (decl) => {
    console.log(`${'  '.repeat(depth)}${decl.prop}: ${decl.value}`);
  },
};

visitEachStyleNode(result.root.nodes, visitor);

// Output shows nested structure:
// Rule: .container
//   display: flex
//   Rule: .item
//     flex: 1
//     Rule: &:hover
//       opacity: 0.8
// @supports: (display: grid)
//   Rule: .grid-container
//     display: grid
//     grid-template-columns: repeat(3, 1fr)
```

---

## 6 — Safe parsing with malformed CSS

> Handle malformed CSS gracefully using the safe parser.

```ts
import { parseStylesheet, visitEachChild } from '@push-based/styles-ast-utils';

// Malformed CSS with missing closing braces and invalid syntax
const malformedCss = `
.btn {
  color: red
  background: blue;
  /* missing closing brace */

.card 
  padding: 1rem;
  margin: invalid-value;
}

/* unclosed comment
.footer {
  text-align: center;
`;

const result = parseStylesheet(malformedCss, 'malformed.css');
const issues: string[] = [];

const visitor = {
  visitRule: (rule) => {
    console.log(`Successfully parsed rule: ${rule.selector}`);
  },
  visitDecl: (decl) => {
    if (!decl.value || decl.value.includes('invalid')) {
      issues.push(`Invalid declaration: ${decl.prop}: ${decl.value}`);
    }
  },
};

visitEachChild(result.root, visitor);

console.log(`Parsed ${result.root.nodes.length} nodes despite malformed CSS`);
console.log('Issues found:', issues);

// The safe parser recovers from errors and continues parsing
// Output:
// Successfully parsed rule: .btn
// Successfully parsed rule: .card
// Successfully parsed rule: .footer
// Parsed 3 nodes despite malformed CSS
// Issues found: ['Invalid declaration: margin: invalid-value']
```

---

## 7 — Collecting CSS class names

> Extract all CSS class selectors from a stylesheet.

```ts
import { parseStylesheet, visitEachChild } from '@push-based/styles-ast-utils';

const cssContent = `
.btn, .button {
  padding: 0.5rem 1rem;
}

.btn-primary {
  background: blue;
}

.card .header {
  font-weight: bold;
}

#main .sidebar .nav-item {
  list-style: none;
}

[data-theme="dark"] .btn {
  color: white;
}
`;

const result = parseStylesheet(cssContent, 'components.css');
const classNames = new Set<string>();

const visitor = {
  visitRule: (rule) => {
    // Extract class names from selectors using regex
    const matches = rule.selector.match(/\.([a-zA-Z0-9_-]+)/g);
    if (matches) {
      matches.forEach((match) => {
        classNames.add(match.substring(1)); // Remove the dot
      });
    }
  },
};

visitEachChild(result.root, visitor);

console.log('Found CSS classes:', Array.from(classNames).sort());
// → ['Found CSS classes:', ['btn', 'btn-primary', 'button', 'card', 'header', 'nav-item', 'sidebar']]
```

These examples demonstrate the comprehensive CSS parsing and analysis capabilities of the `@push-based/styles-ast-utils` library for various stylesheet processing scenarios.
