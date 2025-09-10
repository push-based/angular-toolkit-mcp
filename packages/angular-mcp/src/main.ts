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
  };
};
const { storybookDocsRoot, deprecatedCssClassesPath, uiRoot } = ds;

async function startServer() {
  const server = await AngularMcpServerWrapper.create({
    workspaceRoot: workspaceRoot as string,
    ds: {
      storybookDocsRoot,
      deprecatedCssClassesPath,
      uiRoot,
    },
  });

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
