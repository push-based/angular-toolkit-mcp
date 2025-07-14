# DS Component Coverage

Small, zero‑dependency helpers for **measuring and asserting usage of Design System components** in Angular projects by detecting deprecated CSS classes.

## Minimal usage

```ts
import { dsComponentCoveragePlugin } from '@push-based/ds-component-coverage';

const plugin = dsComponentCoveragePlugin({
  directory: './src/app',
  dsComponents: [
    {
      componentName: 'DsButton',
      deprecatedCssClasses: ['btn', 'button'],
      docsUrl: 'https://design-system.com/button',
    },
  ],
});
```

## Key Features

- **CSS Class Detection**: Find deprecated CSS classes in templates and stylesheets
- **Design System Migration**: Track migration progress from legacy styles to DS components
- **Template Analysis**: Scan Angular templates for class usage in various binding types
- **Style Analysis**: Detect deprecated class definitions in component styles
- **Code Pushup Integration**: Built-in plugin for Code Pushup auditing framework
- **Comprehensive Reporting**: Generate detailed reports with file locations and suggestions

## Documentation map

| Doc                            | What you'll find                            |
| ------------------------------ | ------------------------------------------- |
| [FUNCTIONS.md](./FUNCTIONS.md) | A–Z quick reference for every public symbol |
| [EXAMPLES.md](./EXAMPLES.md)   | Runnable scenarios with expected output     |
