# Examples

## 1 — Basic plugin setup

> Create a DS component coverage plugin to detect deprecated CSS classes.

```ts
import { dsComponentCoveragePlugin } from '@push-based/ds-component-coverage';

const plugin = dsComponentCoveragePlugin({
  directory: './src/app',
  dsComponents: [
    {
      componentName: 'DsButton',
      deprecatedCssClasses: ['btn', 'button-primary'],
      docsUrl: 'https://design-system.com/button',
    },
  ],
});

console.log(plugin.slug); // → 'ds-component-coverage'
```

---

## 2 — Running coverage analysis

> Execute the runner function to analyze Angular components for deprecated CSS usage.

```ts
import { runnerFunction } from '@push-based/ds-component-coverage';

const results = await runnerFunction({
  directory: './src/app',
  dsComponents: [
    {
      componentName: 'DsCard',
      deprecatedCssClasses: ['card', 'card-header', 'card-body'],
    },
  ],
});

console.log(results.length); // → Number of audit outputs
```

---

## 3 — Multiple component tracking

> Track multiple design system components and their deprecated classes.

```ts
import { dsComponentCoveragePlugin } from '@push-based/ds-component-coverage';

const plugin = dsComponentCoveragePlugin({
  directory: './src',
  dsComponents: [
    {
      componentName: 'DsButton',
      deprecatedCssClasses: ['btn', 'button'],
      docsUrl: 'https://design-system.com/button',
    },
    {
      componentName: 'DsModal',
      deprecatedCssClasses: ['modal', 'dialog'],
      docsUrl: 'https://design-system.com/modal',
    },
    {
      componentName: 'DsInput',
      deprecatedCssClasses: ['form-control', 'input-field'],
    },
  ],
});

console.log(plugin.audits.length); // → 3 audits (one per component)
```

---

## 4 — Code Pushup integration

> Integrate with Code Pushup for automated design system migration tracking.

```ts
import {
  dsComponentCoveragePlugin,
  getAngularDsUsageCategoryRefs,
} from '@push-based/ds-component-coverage';

const dsComponents = [
  {
    componentName: 'DsBadge',
    deprecatedCssClasses: ['badge', 'label'],
    docsUrl: 'https://design-system.com/badge',
  },
];

// Use in code-pushup.config.ts
export default {
  plugins: [
    dsComponentCoveragePlugin({
      directory: './src/app',
      dsComponents,
    }),
  ],
  categories: [
    {
      slug: 'design-system-usage',
      title: 'Design System Usage',
      description: 'Usage of design system components',
      refs: getAngularDsUsageCategoryRefs(dsComponents),
    },
  ],
};
```

---

## 5 — Category references for reporting

> Generate category references for organizing audit results.

```ts
import { getAngularDsUsageCategoryRefs } from '@push-based/ds-component-coverage';

const dsComponents = [
  {
    componentName: 'DsButton',
    deprecatedCssClasses: ['btn'],
  },
  {
    componentName: 'DsCard',
    deprecatedCssClasses: ['card'],
  },
];

const categoryRefs = getAngularDsUsageCategoryRefs(dsComponents);
console.log(categoryRefs); // → Array of category references for each component
```

---

## 6 — Custom configuration with schema validation

> Use schema validation to ensure proper configuration structure.

```ts
import {
  ComponentCoverageRunnerOptionsSchema,
  ComponentReplacementSchema,
} from '@push-based/ds-component-coverage';

// Validate individual component replacement
const componentConfig = ComponentReplacementSchema.parse({
  componentName: 'DsAlert',
  deprecatedCssClasses: ['alert', 'notification'],
  docsUrl: 'https://design-system.com/alert',
});

// Validate full runner options
const runnerConfig = ComponentCoverageRunnerOptionsSchema.parse({
  directory: './src/app',
  dsComponents: [componentConfig],
});

console.log(runnerConfig.directory); // → './src/app'
```
