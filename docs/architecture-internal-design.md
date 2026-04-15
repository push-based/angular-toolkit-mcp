# Angular MCP Server – Architecture & Internal Design

> **Audience:** Backend & tool authors who need to understand how the MCP server is wired together so they can extend it with new tools, prompts, or transports.

---

## 1. High-level Overview

The Angular MCP Server is a **Node.js** process that wraps the generic **[Model Context Protocol SDK](https://github.com/modelcontextprotocol/sdk)** and exposes Angular-specific analysis & refactoring tools.  
It follows a clean, layered design:

1. **Transport & Core (MCP SDK)** – HTTP/SSE transport, request routing, JSON-schema validation.  
2. **Server Wrapper (`AngularMcpServerWrapper`)** – registers prompts, tools, and resources; injects workspace-specific paths.  
3. **Tools Layer (`src/lib/tools/**`)** – thin adapters delegating to shared analysis libraries.  
4. **Shared Libraries (`packages/shared/**`)** – AST utilities, DS coverage, generic helpers.

---

## 2. Runtime Flow

```mermaid
graph TD
    subgraph Editor / LLM Client
      A[CallTool / ListTools] -->|HTTP + SSE| B(McpServer Core)
    end

    B --> C{Request Router}
    C -->|tools| D[Tools Registry]
    C -->|prompts| E[Prompts Registry]
    C -->|resources| F[Resources Provider]

    D --> G[Individual Tool Handler]
    G --> H[Shared Libs & Workspace FS]
```

1. The client sends a **`CallTool`** request.  
2. `McpServer` validates the request against JSON Schema.  
3. `AngularMcpServerWrapper` routes it to the correct handler inside **Tools Registry**.  
4. The handler performs analysis (often via shared libs) and returns structured content.  
5. The response streams back.

---

## 3. Bootstrap Sequence

1. **CLI Invocation** (see `.cursor/mcp.json`):
   ```bash
   node packages/angular-mcp/dist/main.js --workspaceRoot=/abs/path ...
   ```
2. `main.ts` → `AngularMcpServerWrapper.create()`
3. **Config Validation** (`AngularMcpServerOptionsSchema`) – checks absolute/relative paths.
4. **File Existence Validation** – ensures Storybook docs & DS mapping files are present.
5. **Server Setup** – registers capabilities & calls:
   - `registerPrompts()`
   - `registerTools()`
   - `registerResources()`
6. Server starts listening.

---

## 4. Directory Layout (server package)

```
packages/angular-mcp-server/
  src/
    lib/
      angular-mcp-server.ts   # Wrapper class (core of the server)
      tools/
        ds/                  # DS-specific tool categories
        shared/              # Internal helpers
      prompts/               # Prompt schemas & impls
      validation/            # Zod schemas & file checks
    index.ts                 # Re-export of wrapper
```

---

## 5. Tools & Extension Points

| Extension | Where to Add | Boilerplate |
|-----------|-------------|-------------|
| **Tool** | `src/lib/tools/**` | 1. Create `my-awesome.tool.ts` exporting `ToolsConfig[]`.  <br>2. Add it to the export list in `tools/ds/tools.ts` (or another category). |
| **Prompt** | `prompts/prompt-registry.ts` | 1. Append schema to `PROMPTS`. <br>2. Provide implementation in `PROMPTS_IMPL`. |
| **Resource Provider** | `registerResources()` | Extend logic to aggregate custom docs or design-system assets. |

All tools share the `ToolsConfig` interface (`@push-based/models`) that bundles:
- `schema` (name, description, arguments, return type)
- `handler(request)` async function.

The MCP SDK auto-validates every call against the schema – no manual parsing required.

---

## 6. Configuration Options

### Core Options

| Option | Type | Description |
|--------|------|-------------|
| `workspaceRoot` | absolute path | Root of the Nx/Angular workspace. |
| `ds.storybookDocsRoot` | relative path | Path (from root) to Storybook MDX/Docs for DS components. |
| `ds.deprecatedCssClassesPath` | relative path | JS file mapping components → deprecated CSS classes. |
| `ds.uiRoot` | relative path | Folder containing raw design-system component source. |
| `ds.generatedStylesRoot` | relative path | Directory containing generated design token CSS files. Enables token-aware features when provided. |

### Token Configuration (`ds.tokens.*`)

These options control how design tokens are discovered, organised, and categorised. All have defaults and are only relevant when `ds.generatedStylesRoot` is configured.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `ds.tokens.filePattern` | string | `**/semantic.css` | Glob pattern to discover token files inside `generatedStylesRoot`. |
| `ds.tokens.propertyPrefix` | string \| null | `null` | When set, only properties starting with this prefix are loaded into the token dataset. **Note**: setting this to a single prefix (e.g. `--semantic-`) means the `report-audit-token-usage` tool will only validate and detect overrides for tokens matching that prefix. Leave as `null` to load all tokens and let the tool derive all prefixes automatically (e.g. `--semantic-` and `--ds-`). |
| `ds.tokens.scopeStrategy` | enum | `flat` | `flat` or `brand-theme`. Controls how directory structure maps to token scope metadata. `flat`: no scope. `brand-theme`: path segments → brand/theme scope keys. |
| `ds.tokens.categoryInference` | enum | `by-prefix` | `by-prefix`, `by-value`, or `none`. Controls how tokens are assigned categories. |
| `ds.tokens.categoryPrefixMap` | Record | `{ color: '--semantic-color', ... }` | Category → prefix mapping (used with `by-prefix`). |

Validation is handled via **Zod** in `angular-mcp-server-options.schema.ts`.

### Token Dataset Storage Model

The token dataset stores one flat array of all loaded `TokenEntry` objects. At construction time, four index maps are built from that array for efficient lookups:

| Index | Type | Behaviour |
|-------|------|-----------|
| `byName` | `Map<name, TokenEntry>` | Last-write-wins — only one entry per token name. When the same token appears in multiple brand files, only the last processed entry is kept. |
| `byValue` | `Map<value, TokenEntry[]>` | All entries with that resolved value are kept. Enables reverse-lookup ("which tokens resolve to `#86b521`?"). |
| `byCategory` | `Map<category, TokenEntry[]>` | All entries in that category are kept. |
| `byScopeKey` | `Map<scopeKey, Map<scopeValue, TokenEntry[]>>` | All entries matching a scope dimension are kept. Enables scoped queries like "all tokens where brand = acme". |

For example, if `--semantic-color-primary` appears in 30 brand files with different values, the `tokens` array has 30 entries. `byValue` and `byScopeKey` keep all 30. `byName` only keeps the last one processed.

---

## 7. Shared Libraries in Play

```
models  (types & schemas)
├─ utils
├─ styles-ast-utils
│   └─ scss-value-parser  (extracts property-value pairs per selector from SCSS)
├─ angular-ast-utils
└─ ds-component-coverage  (top-level plugin)
```

The `angular-mcp-server` package also contains shared token infrastructure:

```
tools/ds/shared/utils/
├─ css-custom-property-parser.ts  (regex-based CSS --* extraction)
├─ token-dataset.ts               (queryable token data structure)
├─ token-dataset-loader.ts        (file discovery, scope, categorisation)
└─ regex-helpers.ts                (shared regex patterns)
```

These libraries provide AST parsing, file operations, token loading, and DS analysis. Tools import them directly; they are **framework-agnostic** and can be unit-tested in isolation.

---

## 8. Testing & Examples

`packages/minimal-repo/**` contains miniature Angular apps used by unit/integration tests. They are **not** part of production code but useful when debugging a new tool.

---

## 9. Adding a New Tool – Checklist

1. Identify functionality and pick/create an appropriate shared library function.  
2. Generate a JSON-schema with arguments & result shape (can use Zod helper).  
3. Implement handler logic (avoid heavy FS operations in main thread; prefer async).  
4. Export via `ToolsConfig[]` and append to category list.  
5. Write unit tests.
6. Update `docs/tools.md` once published.

---