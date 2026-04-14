#!/usr/bin/env node
import express from 'express';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { AngularMcpServerWrapper } from '@push-based/angular-mcp-server';

interface ArgvType {
  sse: boolean;
  port?: number;
  _: (string | number)[];
  $0: string;

  [x: string]: unknown;
}

const argv = yargs(hideBin(process.argv))
  .command('$0', 'Start the angular-mcp server')
  .option('workspaceRoot', {
    describe: 'The root directory of the workspace as absolute path',
    type: 'string',
    required: true,
  })
  .option('ds.storybookDocsRoot', {
    describe:
      'The root directory of the storybook docs relative from workspace root',
    type: 'string',
  })
  .option('ds.deprecatedCssClassesPath', {
    describe:
      'The path to the deprecated classes file relative from workspace root',
    type: 'string',
  })
  .option('ds.uiRoot', {
    describe:
      'The root directory of the actual Angular components relative from workspace root',
    type: 'string',
  })
  .option('ds.generatedStylesRoot', {
    describe: 'Path to generated styles directory relative from workspace root',
    type: 'string',
  })
  .option('ds.tokens.filePattern', {
    describe:
      'Glob pattern used to discover token CSS files within ds.generatedStylesRoot (default: "**/semantic.css")',
    type: 'string',
  })
  .option('ds.tokens.propertyPrefix', {
    describe:
      'When set, only CSS custom properties whose name starts with this prefix are extracted. When omitted all custom properties are included (default: null)',
    type: 'string',
  })
  .option('ds.tokens.directoryStrategy', {
    describe:
      'Controls how directory structure maps to token scopes. "flat" treats all files as one set, "brand-theme" derives brand/theme scope from path segments, "auto" infers from directory depth (default: "flat")',
    type: 'string',
  })
  .option('ds.tokens.categoryInference', {
    describe:
      'Strategy for categorising tokens. "by-prefix" uses longest prefix match from categoryPrefixMap, "by-value" infers category from the CSS value pattern (hex→color, px→spacing, etc.), "none" skips categorisation (default: "by-prefix")',
    type: 'string',
  })
  .option('sse', {
    describe: 'Configure the server to use SSE (Server-Sent Events)',
    type: 'boolean',
    default: false,
  })
  .option('port', {
    alias: 'p',
    describe: 'Port to use for the SSE server (default: 9921)',
    type: 'number',
  })
  .check((argv) => {
    if (argv.port !== undefined && !argv.sse) {
      throw new Error(
        'The --port option can only be used when --sse is enabled',
      );
    }
    return true;
  })
  .help()
  .parseSync() as ArgvType;

const { workspaceRoot, ds } = argv as unknown as {
  workspaceRoot: string;
  ds: {
    storybookDocsRoot?: string;
    deprecatedCssClassesPath?: string;
    uiRoot: string;
    generatedStylesRoot?: string;
    tokens?: {
      filePattern?: string;
      propertyPrefix?: string;
      directoryStrategy?: string;
      categoryInference?: string;
    };
  };
};
const {
  storybookDocsRoot,
  deprecatedCssClassesPath,
  uiRoot,
  generatedStylesRoot,
  tokens,
} = ds;

async function startServer() {
  const server = await AngularMcpServerWrapper.create({
    workspaceRoot: workspaceRoot as string,
    ds: {
      storybookDocsRoot,
      deprecatedCssClassesPath,
      uiRoot,
      generatedStylesRoot,
      ...(tokens ? { tokens } : {}),
    },
  } as Parameters<typeof AngularMcpServerWrapper.create>[0]);

  if (argv.sse) {
    const port = argv.port ?? 9921;

    const app = express();
    let transport: SSEServerTransport;
    app.get('/sse', async (_, res) => {
      transport = new SSEServerTransport('/messages', res);
      await server.getMcpServer().connect(transport);
    });

    app.post('/messages', async (req, res) => {
      if (!transport) {
        res.status(400).send('No transport found');
        return;
      }
      await transport.handlePostMessage(req, res);
    });

    const server_instance = app.listen(port);

    process.on('exit', () => {
      server_instance.close();
    });
  } else {
    const transport = new StdioServerTransport();
    server.getMcpServer().connect(transport);
  }
}

// eslint-disable-next-line unicorn/prefer-top-level-await
startServer().catch((ctx) => {
  console.error('Failed to start server:', ctx);
  process.exit(1);
});
