# Getting Started with Angular MCP Toolkit

A concise, hands-on guide to install, configure, and verify the Angular MCP server in under **5 minutes**.

---

## 1. Prerequisites

| Tool | Minimum Version | Notes |
| ---- | --------------- | ----- |
| Node.js | **18.x** LTS | Tested with 18.18 ⬆︎ |
| npm | **9.x** | Bundled with Node LTS |
| Nx CLI | **≥ 21** | `npm i -g nx` |
| Git | Any recent | For workspace cloning |

> The server itself is framework-agnostic, but most built-in tools assume an **Nx workspace** with Angular projects.

---

## 2. Install the Server

### Clone the repository

```bash
git clone https://github.com/push-based/angular-toolkit-mcp.git
cd angular-toolkit-mcp
npm install   # install workspace dependencies
```

The MCP server source resides under `packages/angular-mcp/` and `packages/angular-mcp-server/`. No package needs to be fetched from the npm registry.

---

## 3. Register with Your Editor

Instead of the palette-based flow, copy the manual configuration from your workspace’s `.cursor/mcp.json` (shown below) and adjust paths if necessary.

```json
{
  "mcpServers": {
    "angular-mcp": {
      "command": "node",
      "args": [
        "./packages/angular-mcp/dist/main.js",
        "--workspaceRoot=/absolute/path/to/angular-toolkit-mcp",
        "--ds.storybookDocsRoot=packages/minimal-repo/packages/design-system/storybook-host-app/src/components",
        "--ds.deprecatedCssClassesPath=packages/minimal-repo/packages/design-system/component-options.mjs",
        "--ds.uiRoot=packages/minimal-repo/packages/design-system/ui",
        "--ds.generatedStylesRoot=dist/generated/styles"
      ]
    }
  }
}
```

Add or edit this JSON in **Cursor → Settings → MCP Servers** (or the equivalent dialog in your editor).

> **Note:** `ds.generatedStylesRoot` is optional. When provided, it enables token-aware features (token discovery, categorisation, and querying). When omitted, all existing tools work normally and token features are simply disabled.

---

## 4. Next Steps

🔗 Continue with the [Architecture & Internal Design](./architecture-internal-design.md) document (work-in-progress).

🚀 Jump straight into [Writing Custom Tools](./writing-custom-tools.md) when ready.

---

## Troubleshooting

| Symptom | Possible Cause | Fix |
| ------- | -------------- | --- |
| `command not found: nx` | Nx CLI missing | `npm i -g nx` |
| Editor shows “tool not found” | Server not running or wrong path in `mcp.json` | Check configuration and restart editor |

---

*Happy coding!* ✨ 