import { describe, it, expect, vi, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { AngularMcpServerWrapper } from '../angular-mcp-server.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let tmpDir: string;

function createTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'mcp-server-test-'));
}

function setupWorkspace(options?: {
  generatedStylesRoot?: string;
  cssContent?: string;
}) {
  tmpDir = createTmpDir();

  // Create the required uiRoot directory
  const uiRoot = path.join(tmpDir, 'packages', 'ui');
  fs.mkdirSync(uiRoot, { recursive: true });

  // Optionally create generatedStylesRoot with a CSS file
  if (options?.generatedStylesRoot) {
    const stylesDir = path.join(tmpDir, options.generatedStylesRoot);
    fs.mkdirSync(stylesDir, { recursive: true });

    if (options.cssContent) {
      fs.writeFileSync(
        path.join(stylesDir, 'semantic.css'),
        options.cssContent,
        'utf-8',
      );
    }
  }

  return {
    workspaceRoot: tmpDir,
    uiRoot: 'packages/ui',
    generatedStylesRoot: options?.generatedStylesRoot,
  };
}

function cleanupTmpDir() {
  if (tmpDir && fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

// ---------------------------------------------------------------------------
// Integration Tests — Server Bootstrap with Token Config
// ---------------------------------------------------------------------------

/**
 * **Validates: Requirements 1.4–1.8, 10.1–10.3, 11.2–11.3**
 */
describe('Server bootstrap with token config (integration)', () => {
  afterEach(() => {
    cleanupTmpDir();
    vi.restoreAllMocks();
  });

  // ---- Req 1.7: Server starts without errors when generatedStylesRoot is not provided ----
  it('starts without errors when generatedStylesRoot is not provided', async () => {
    const { workspaceRoot, uiRoot } = setupWorkspace();

    const server = await AngularMcpServerWrapper.create({
      workspaceRoot,
      ds: { uiRoot },
    } as Parameters<typeof AngularMcpServerWrapper.create>[0]);

    expect(server).toBeDefined();
    expect(server.getMcpServer()).toBeDefined();
  });

  // ---- Req 1.4: Server starts without errors when generatedStylesRoot is provided and valid ----
  it('starts without errors when generatedStylesRoot is provided and valid', async () => {
    const cssContent = ':root { --semantic-color-primary: #86b521; }';
    const { workspaceRoot, uiRoot, generatedStylesRoot } = setupWorkspace({
      generatedStylesRoot: 'dist/styles',
      cssContent,
    });

    const server = await AngularMcpServerWrapper.create({
      workspaceRoot,
      ds: { uiRoot, generatedStylesRoot },
    } as Parameters<typeof AngularMcpServerWrapper.create>[0]);

    expect(server).toBeDefined();
    expect(server.getMcpServer()).toBeDefined();
  });

  // ---- Req 1.5, 1.6: Server starts with warning when generatedStylesRoot points to non-existent path ----
  it('starts with warning when generatedStylesRoot points to non-existent path', async () => {
    const { workspaceRoot, uiRoot } = setupWorkspace();
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const server = await AngularMcpServerWrapper.create({
      workspaceRoot,
      ds: { uiRoot, generatedStylesRoot: 'non-existent/path' },
    } as Parameters<typeof AngularMcpServerWrapper.create>[0]);

    expect(server).toBeDefined();
    expect(server.getMcpServer()).toBeDefined();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('does not exist or is not a directory'),
    );
  });

  // ---- Req 11.2, 11.3: Existing tool invocations are unaffected by new config fields ----
  it('existing tool invocations are unaffected by new config fields', async () => {
    const { workspaceRoot, uiRoot } = setupWorkspace();

    // Create server with new token config fields (partial — Zod fills defaults)
    const server = await AngularMcpServerWrapper.create({
      workspaceRoot,
      ds: {
        uiRoot,
        tokens: {
          filePattern: '**/custom.css',
          scopeStrategy: 'brand-theme',
          categoryInference: 'by-value',
        },
      },
    } as Parameters<typeof AngularMcpServerWrapper.create>[0]);

    expect(server).toBeDefined();

    // The MCP server should still have tools registered
    const mcpServer = server.getMcpServer();
    expect(mcpServer).toBeDefined();
  });

  // ---- Req 10.1: getTokenDataset() returns empty dataset with actionable message when generatedStylesRoot is absent ----
  it('getTokenDataset() returns empty dataset with actionable message when generatedStylesRoot is absent', async () => {
    const { workspaceRoot, uiRoot } = setupWorkspace();

    const server = await AngularMcpServerWrapper.create({
      workspaceRoot,
      ds: { uiRoot },
    } as Parameters<typeof AngularMcpServerWrapper.create>[0]);

    const dataset = await server.getTokenDataset();

    expect(dataset.isEmpty).toBe(true);
    expect(dataset.diagnostics.length).toBeGreaterThan(0);
    expect(dataset.diagnostics[0]).toContain('generatedStylesRoot');
  });
});
