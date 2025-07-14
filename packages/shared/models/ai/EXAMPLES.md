# Examples

## 1 — Validating audit data

> Validate audit configuration and output using Zod schemas.

```ts
import { auditSchema, auditOutputSchema } from '@push-based/models';

// Validate audit configuration
const auditConfig = {
  slug: 'performance-budget',
  title: 'Performance Budget Check',
  description: 'Ensures performance metrics stay within budget',
  docsUrl: 'https://web.dev/performance-budgets/',
};

const validatedAudit = auditSchema.parse(auditConfig);
console.log(validatedAudit.slug); // → 'performance-budget'

// Validate audit output
const auditResult = {
  slug: 'performance-budget',
  score: 0.85,
  value: 1200,
  displayValue: '1.2s',
};

const validatedOutput = auditOutputSchema.parse(auditResult);
console.log(validatedOutput.score); // → 0.85
```

---

## 2 — Creating plugin configurations

> Build and validate plugin configurations with audits and groups.

```ts
import { pluginConfigSchema, type PluginConfig } from '@push-based/models';

const eslintPlugin: PluginConfig = {
  slug: 'eslint',
  title: 'ESLint',
  icon: 'eslint',
  runner: {
    command: 'npx eslint',
    args: ['src/**/*.ts', '--format', 'json'],
    outputFile: 'eslint-results.json',
  },
  audits: [
    {
      slug: 'no-unused-vars',
      title: 'No unused variables',
      description: 'Disallow unused variables',
    },
    {
      slug: 'prefer-const',
      title: 'Prefer const',
      description:
        'Require const declarations for variables that are never reassigned',
    },
  ],
  groups: [
    {
      slug: 'best-practices',
      title: 'Best Practices',
      refs: [
        { slug: 'no-unused-vars', weight: 1 },
        { slug: 'prefer-const', weight: 1 },
      ],
    },
  ],
};

const validatedPlugin = pluginConfigSchema.parse(eslintPlugin);
console.log(`Plugin: ${validatedPlugin.title}`); // → 'Plugin: ESLint'
```

---

## 3 — Building core configuration

> Create a complete Code PushUp configuration with plugins and categories.

```ts
import { coreConfigSchema, type CoreConfig } from '@push-based/models';

const config: CoreConfig = {
  plugins: [
    {
      slug: 'lighthouse',
      title: 'Lighthouse',
      icon: 'lighthouse',
      runner: {
        command: 'lighthouse',
        args: ['https://example.com', '--output=json'],
        outputFile: 'lighthouse-report.json',
      },
      audits: [
        { slug: 'first-contentful-paint', title: 'First Contentful Paint' },
        { slug: 'largest-contentful-paint', title: 'Largest Contentful Paint' },
      ],
      groups: [
        {
          slug: 'performance',
          title: 'Performance',
          refs: [
            { slug: 'first-contentful-paint', weight: 1 },
            { slug: 'largest-contentful-paint', weight: 2 },
          ],
        },
      ],
    },
  ],
  categories: [
    {
      slug: 'performance',
      title: 'Performance',
      refs: [
        {
          plugin: 'lighthouse',
          slug: 'performance',
          type: 'group',
          weight: 1,
        },
      ],
    },
  ],
  persist: {
    outputDir: '.code-pushup',
    filename: 'report',
    format: ['json', 'md'],
  },
};

const validatedConfig = coreConfigSchema.parse(config);
console.log(`Categories: ${validatedConfig.categories?.length}`); // → 'Categories: 1'
```

---

## 4 — Working with reports

> Parse and validate Code PushUp reports.

```ts
import { reportSchema, type Report } from '@push-based/models';

const report: Report = {
  packageName: '@push-based/cli',
  version: '1.0.0',
  date: new Date().toISOString(),
  duration: 45000,
  commit: {
    hash: 'abcdef0123456789abcdef0123456789abcdef01',
    message: 'Add performance optimizations',
    author: 'Developer',
    date: new Date(),
  },
  plugins: [
    {
      slug: 'lighthouse',
      title: 'Lighthouse',
      icon: 'lighthouse',
      date: new Date().toISOString(),
      duration: 30000,
      audits: [
        {
          slug: 'performance-score',
          title: 'Performance Score',
          score: 0.92,
          value: 92,
          displayValue: '92',
        },
      ],
    },
  ],
};

const validatedReport = reportSchema.parse(report);
console.log(`Report duration: ${validatedReport.duration}ms`); // → 'Report duration: 45000ms'
```

---

## 5 — Creating table data

> Build structured table data for reports.

```ts
import { tableSchema, type Table } from '@push-based/models';

const performanceTable: Table = {
  title: 'Performance Metrics',
  columns: [
    { key: 'metric', label: 'Metric', align: 'left' },
    { key: 'value', label: 'Value', align: 'right' },
    { key: 'threshold', label: 'Threshold', align: 'right' },
  ],
  rows: [
    {
      metric: 'First Contentful Paint',
      value: '1.2s',
      threshold: '1.8s',
    },
    {
      metric: 'Largest Contentful Paint',
      value: '2.1s',
      threshold: '2.5s',
    },
    {
      metric: 'Cumulative Layout Shift',
      value: '0.05',
      threshold: '0.1',
    },
  ],
};

const validatedTable = tableSchema().parse(performanceTable);
console.log(`Table has ${validatedTable.rows.length} rows`); // → 'Table has 3 rows'
```

---

## 6 — Comparing reports

> Create report comparisons and diffs.

```ts
import { reportsDiffSchema, type ReportsDiff } from '@push-based/models';

const reportsDiff: ReportsDiff = {
  packageName: '@push-based/cli',
  version: '1.0.0',
  date: new Date().toISOString(),
  duration: 5000,
  commits: {
    before: {
      hash: 'abc123def456abc123def456abc123def456abc1',
      message: 'Previous commit',
      author: 'Developer',
      date: new Date('2024-01-01'),
    },
    after: {
      hash: 'def456abc123def456abc123def456abc123def4',
      message: 'Current commit',
      author: 'Developer',
      date: new Date('2024-01-02'),
    },
  },
  categories: {
    changed: [
      {
        slug: 'performance',
        title: 'Performance',
        scores: {
          before: 0.85,
          after: 0.92,
          diff: 0.07,
        },
      },
    ],
    unchanged: [],
    added: [],
    removed: [],
  },
  groups: {
    changed: [],
    unchanged: [],
    added: [],
    removed: [],
  },
  audits: {
    changed: [
      {
        slug: 'lcp',
        title: 'Largest Contentful Paint',
        plugin: {
          slug: 'lighthouse',
          title: 'Lighthouse',
        },
        scores: {
          before: 0.8,
          after: 0.9,
          diff: 0.1,
        },
        values: {
          before: 2500,
          after: 2100,
          diff: -400,
        },
        displayValues: {
          before: '2.5s',
          after: '2.1s',
        },
      },
    ],
    unchanged: [],
    added: [],
    removed: [],
  },
};

const validatedDiff = reportsDiffSchema.parse(reportsDiff);
console.log(
  `Performance improved by ${validatedDiff.categories.changed[0]?.scores.diff}`
);
// → 'Performance improved by 0.07'
```

---

## 7 — Safe parsing with error handling

> Use safe parsing to handle validation errors gracefully.

```ts
import { auditSchema, coreConfigSchema } from '@push-based/models';

// Safe parsing with error handling
const invalidAudit = {
  slug: 'Invalid Slug!', // Invalid: contains spaces and special characters
  title: 'Test Audit',
};

const auditResult = auditSchema.safeParse(invalidAudit);
if (!auditResult.success) {
  console.log('Validation failed:', auditResult.error.issues[0]?.message);
  // → 'Validation failed: The slug has to follow the pattern...'
} else {
  console.log('Valid audit:', auditResult.data);
}

// Batch validation
const configs = [
  { plugins: [] }, // Invalid: empty plugins array
  { plugins: [{ slug: 'test', title: 'Test' }] }, // Invalid: missing required fields
];

const validConfigs = configs
  .map((config) => coreConfigSchema.safeParse(config))
  .filter((result) => result.success)
  .map((result) => result.data);

console.log(`${validConfigs.length} valid configurations found`);
```

These examples demonstrate the comprehensive validation capabilities and practical usage patterns of the `@push-based/models` library for various Code PushUp data structures and workflows.
