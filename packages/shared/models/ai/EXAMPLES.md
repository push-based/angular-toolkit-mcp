# Examples

## 1 — Working with CLI arguments

> Type-safe handling of command line arguments.

```ts
import { type CliArgsObject, type ArgumentValue } from '@push-based/models';

// Basic CLI arguments
const args: CliArgsObject = {
  directory: './src/components',
  componentName: 'DsButton',
  groupBy: 'file',
  _: ['report-violations'],
};

console.log(args.directory); // → './src/components'
console.log(args._); // → ['report-violations']

// Typed CLI arguments with specific structure
interface MyToolArgs {
  directory: string;
  componentName: string;
  groupBy?: 'file' | 'folder';
  verbose?: boolean;
}

const typedArgs: CliArgsObject<MyToolArgs> = {
  directory: './packages/shared/models',
  componentName: 'DsCard',
  groupBy: 'folder',
  verbose: true,
  _: ['analyze'],
};

console.log(`Analyzing ${typedArgs.componentName} in ${typedArgs.directory}`);
// → 'Analyzing DsCard in ./packages/shared/models'
```

---

## 2 — Creating MCP tools

> Build Model Context Protocol tools with proper typing.

```ts
import { type ToolsConfig, type ToolSchemaOptions } from '@push-based/models';

// Define a simple MCP tool
const reportViolationsTool: ToolsConfig = {
  schema: {
    name: 'report-violations',
    description: 'Report deprecated DS CSS usage in a directory',
    inputSchema: {
      type: 'object',
      properties: {
        directory: {
          type: 'string',
          description: 'The relative path to the directory to scan',
        },
        componentName: {
          type: 'string',
          description: 'The class name of the component (e.g., DsButton)',
        },
        groupBy: {
          type: 'string',
          enum: ['file', 'folder'],
          default: 'file',
          description: 'How to group the results',
        },
      },
      required: ['directory', 'componentName'],
    },
  },
  handler: async (request) => {
    const { directory, componentName, groupBy = 'file' } = request.params.arguments as {
      directory: string;
      componentName: string;
      groupBy?: 'file' | 'folder';
    };

    // Tool implementation logic here
    const violations = await analyzeViolations(directory, componentName, groupBy);

    return {
      content: [
        {
          type: 'text',
          text: `Found ${violations.length} violations in ${directory}`,
        },
      ],
    };
  },
};

// Use the tool configuration
console.log(`Tool: ${reportViolationsTool.schema.name}`);
// → 'Tool: report-violations'
```

---

## 3 — Implementing diagnostics

> Create objects that can report issues and diagnostics.

```ts
import { type DiagnosticsAware } from '@push-based/models';

class ComponentAnalyzer implements DiagnosticsAware {
  private issues: Array<{ code?: number; message: string; severity: string }> = [];

  analyze(componentPath: string): void {
    // Simulate analysis
    if (!componentPath.endsWith('.ts')) {
      this.issues.push({
        code: 1001,
        message: 'Component file should have .ts extension',
        severity: 'error',
      });
    }

    if (componentPath.includes('deprecated')) {
      this.issues.push({
        code: 2001,
        message: 'Component uses deprecated patterns',
        severity: 'warning',
      });
    }
  }

  getIssues() {
    return this.issues;
  }

  clear(): void {
    this.issues = [];
  }
}

// Usage
const analyzer = new ComponentAnalyzer();
analyzer.analyze('src/components/deprecated-button.js');

const issues = analyzer.getIssues();
console.log(`Found ${issues.length} issues:`);
issues.forEach((issue) => {
  console.log(`  ${issue.severity}: ${issue.message} (code: ${issue.code})`);
});
// → Found 2 issues:
// →   error: Component file should have .ts extension (code: 1001)
// →   warning: Component uses deprecated patterns (code: 2001)

analyzer.clear();
console.log(`Issues after clear: ${analyzer.getIssues().length}`); // → 0
```

---

## 4 — Advanced MCP tool with content results

> Create sophisticated MCP tools that return structured content.

```ts
import {
  type ToolsConfig,
  type ToolHandlerContentResult,
} from '@push-based/models';

const buildComponentContractTool: ToolsConfig = {
  schema: {
    name: 'build-component-contract',
    description: 'Generate a static surface contract for a component',
    inputSchema: {
      type: 'object',
      properties: {
        directory: { type: 'string' },
        templateFile: { type: 'string' },
        styleFile: { type: 'string' },
        typescriptFile: { type: 'string' },
        dsComponentName: { type: 'string' },
      },
      required: ['directory', 'templateFile', 'styleFile', 'typescriptFile', 'dsComponentName'],
    },
  },
  handler: async (request) => {
    const params = request.params.arguments as {
      directory: string;
      templateFile: string;
      styleFile: string;
      typescriptFile: string;
      dsComponentName: string;
    };

    // Generate contract
    const contract = await generateContract(params);

    const content: ToolHandlerContentResult[] = [
      {
        type: 'text',
        text: `Generated contract for ${params.dsComponentName}`,
      },
      {
        type: 'text',
        text: `Template inputs: ${contract.templateInputs.length}`,
      },
      {
        type: 'text',
        text: `Style classes: ${contract.styleClasses.length}`,
      },
    ];

    return { content };
  },
};

// Mock contract generation function
async function generateContract(params: any) {
  return {
    templateInputs: ['@Input() label: string', '@Input() disabled: boolean'],
    styleClasses: ['.ds-button', '.ds-button--primary'],
  };
}
```

These examples demonstrate the practical usage patterns of the `@push-based/models` library for building type-safe CLI tools, MCP integrations, and diagnostic utilities in the Angular MCP toolkit.
