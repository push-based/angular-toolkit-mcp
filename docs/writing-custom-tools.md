# Writing Custom Tools for Angular MCP Server

> **Goal:** Enable developers to add new, type-safe MCP tools that can be called by LLMs or scripts.

---

## 1. Anatomy of a Tool

Every tool consists of **three parts**:

1. **Schema** – JSON-schema (via `zod`) that describes the tool name, description and arguments.
2. **Handler** – an async function that receives a typed `CallToolRequest`, executes logic, and returns a `CallToolResult`.
3. **Registration** – export a `ToolsConfig` object and add it to the category list (`dsTools`, etc.).

Directory convention
```
packages/angular-mcp-server/src/lib/tools/<category>/my-feature/hello-world.tool.ts
```
File name **must** end with `.tool.ts` so tests & registries can auto-discover it.

---

## 2. Boilerplate Template

```ts
import { z } from 'zod';
import { ToolSchemaOptions, ToolsConfig } from '@push-based/models';
import { createHandler, RESULT_FORMATTERS } from '../shared/utils/handler-helpers.js';

// 1️⃣ Schema
const helloWorldSchema: ToolSchemaOptions = {
  name: 'hello-world',
  description: 'Echo a friendly greeting',
  inputSchema: z.object({
    name: z.string().describe('Name to greet'),
  }),
  annotations: {
    title: 'Hello World',
  },
};

// 2️⃣ Handler (business logic)
const helloWorldHandler = createHandler<{ name: string }, string>(
  helloWorldSchema.name,
  async (params) => {
    return `Hello, ${params.name}! 👋`;
  },
  (result) => RESULT_FORMATTERS.success(result),
);

// 3️⃣ Registration
export const helloWorldTools: ToolsConfig[] = [
  { schema: helloWorldSchema, handler: helloWorldHandler },
];
```

Key points:
* `createHandler` automatically validates common arguments, injects workspace paths, and formats output.
* Generic parameters `<{ name: string }, string>` indicate input shape and raw result type.
* Use `RESULT_FORMATTERS` helpers to produce consistent textual arrays.

---

## 3. Adding to the Registry

Open the category file (e.g. `tools/ds/tools.ts`) and spread your array:

```ts
import { helloWorldTools } from './my-feature/hello-world.tool';

export const dsTools: ToolsConfig[] = [
  // …existing
  ...helloWorldTools,
];
```

The server will now expose `hello-world` via `list_tools`.

---

## 4. Parameter Injection

The server adds workspace-specific paths to every call so you don’t need to pass them manually:

| Field | Injected Value |
|-------|----------------|
| `cwd` | Current working dir (may be overridden) |
| `workspaceRoot` | `--workspaceRoot` CLI flag |
| `storybookDocsRoot` | Relative path from CLI flags |
| `deprecatedCssClassesPath` | Path to deprecated CSS map |
| `uiRoot` | Path to DS component source |

Access them inside the handler via the second argument of `createHandler`:

```ts
async (params, ctx) => {
  console.log('Workspace root:', ctx.workspaceRoot);
}
```

---

## 5. Validation Helpers

* `validateCommonInputs` – ensures `directory` is string, `componentName` matches `Ds[A-Z]…` pattern.
* Custom validation: extend the Zod `inputSchema` with additional constraints.

---

## 6. Testing Your Tool

1. **Unit tests** (recommended): import the handler function directly and assert on the returned `CallToolResult`.

---

## 7. Documentation Checklist

After publishing a tool:

- [ ] Add an entry to `docs/tools.md` with purpose, parameters, output.

---

## 8. Common Pitfalls

| Pitfall | Fix |
|---------|-----|
| Tool not listed via `list_tools` | Forgot to spread into `dsTools` array. |
| “Unknown argument” error | Ensure `inputSchema` matches argument names exactly. |
| Long-running sync FS operations | Use async `fs/promises` or worker threads to keep server responsive. |

---

Happy tooling! 🎉 