import { PROMPTS, PROMPTS_IMPL } from './prompts/prompt-registry.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  CallToolRequest,
  CallToolRequestSchema,
  GetPromptRequestSchema,
  GetPromptResult,
  ListPromptsRequestSchema,
  ListPromptsResult,
  ListResourcesRequestSchema,
  ListResourcesResult,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { TOOLS } from './tools/tools';
import { toolNotFound } from './tools/utils';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  AngularMcpServerOptionsSchema,
  AngularMcpServerOptions,
} from './validation/angular-mcp-server-options.schema';
import { validateAngularMcpServerFilesExist } from './validation/file-existence';
import { validateDeprecatedCssClassesFile } from './validation/ds-components-file.validation';

export class AngularMcpServerWrapper {
  private readonly mcpServer: McpServer;
  private readonly workspaceRoot: string;
  private readonly storybookDocsRoot?: string;
  private readonly deprecatedCssClassesPath?: string;
  private readonly uiRoot: string;

  /**
   * Private constructor - use AngularMcpServerWrapper.create() instead.
   * Config is already validated when this constructor is called.
   */
  private constructor(config: AngularMcpServerOptions) {
    // Config is already validated, no need to validate again
    const { workspaceRoot, ds } = config;

    this.workspaceRoot = workspaceRoot;
    this.storybookDocsRoot = ds.storybookDocsRoot;
    this.deprecatedCssClassesPath = ds.deprecatedCssClassesPath;
    this.uiRoot = ds.uiRoot;

    this.mcpServer = new McpServer({
      name: 'Angular MCP',
      version: '0.0.0',
    });

    this.mcpServer.server.registerCapabilities({
      prompts: {},
      tools: {},
      resources: {},
    });
    this.registerPrompts();
    this.registerTools();
    this.registerResources();
  }

  /**
   * Creates and validates an AngularMcpServerWrapper instance.
   * This is the recommended way to create an instance as it performs all necessary validations.
   *
   * @param config - The Angular MCP server configuration options
   * @returns A Promise that resolves to a fully configured AngularMcpServerWrapper instance
   * @throws {Error} If configuration validation fails or required files don't exist
   */
  static async create(
    config: AngularMcpServerOptions,
  ): Promise<AngularMcpServerWrapper> {
    // Validate config using the Zod schema - only once here
    const validatedConfig = AngularMcpServerOptionsSchema.parse(config);

    // Validate file existence (optional keys are checked only when provided)
    validateAngularMcpServerFilesExist(validatedConfig);

    // Load and validate deprecatedCssClassesPath content only if provided
    if (validatedConfig.ds.deprecatedCssClassesPath) {
      await validateDeprecatedCssClassesFile(validatedConfig);
    }

    return new AngularMcpServerWrapper(validatedConfig);
  }

  getMcpServer(): McpServer {
    return this.mcpServer;
  }

  private registerResources() {
    this.mcpServer.server.setRequestHandler(
      ListResourcesRequestSchema,
      async (): Promise<ListResourcesResult> => {
        try {
          // Read the llms.txt file from the package root
          const filePath = path.resolve(__dirname, '../../llms.txt');
          console.log('Attempting to read file from:', filePath);
          const content = fs.readFileSync(filePath, 'utf-8');
          const lines = content.split('\n');

          const resources = [];
          let currentSection = '';

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            // Skip empty lines and comments that don't start with #
            if (!line || (line.startsWith('#') && !line.includes(':'))) {
              continue;
            }

            // Update section if line starts with #
            if (line.startsWith('# ')) {
              currentSection = line.substring(2).replace(':', '').trim();
              continue;
            }

            // Parse markdown links: [name](url)
            const linkMatch = line.match(/- \[(.*?)\]\((.*?)\):(.*)/);
            if (linkMatch) {
              const [, name, uri, description = ''] = linkMatch;
              resources.push({
                uri,
                name: name.trim(),
                type: currentSection.toLowerCase(),
                content: description.trim() || name.trim(),
              });
              continue;
            }

            // Parse simple links: - [name](url)
            const simpleLinkMatch = line.match(/- \[(.*?)\]\((.*?)\)/);
            if (simpleLinkMatch) {
              const [, name, uri] = simpleLinkMatch;
              resources.push({
                uri,
                name: name.trim(),
                type: currentSection.toLowerCase(),
                content: name.trim(),
              });
            }
          }

          // Scan available design system components to add them as discoverable resources
          try {
            if (!this.storybookDocsRoot) {
              return {
                resources,
              };
            }

            const dsUiPath = path.resolve(
              process.cwd(),
              this.storybookDocsRoot,
            );
            if (fs.existsSync(dsUiPath)) {
              const componentFolders = fs
                .readdirSync(dsUiPath, { withFileTypes: true })
                .filter((dirent) => dirent.isDirectory())
                .map((dirent) => dirent.name);

              for (const folder of componentFolders) {
                // Convert kebab-case to PascalCase with 'Ds' prefix
                const componentName =
                  'Ds' +
                  folder
                    .split('-')
                    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                    .join('');

                resources.push({
                  uri: `ds-component://${folder}`,
                  name: componentName,
                  type: 'design-system-component',
                  content: `Design System component: ${componentName}`,
                });
              }
            }
          } catch (ctx: unknown) {
            if (ctx instanceof Error) {
              console.error('Error scanning DS components:', ctx);
            }
          }

          return {
            resources,
          };
        } catch (ctx: unknown) {
          if (ctx instanceof Error) {
            console.error('Error reading llms.txt:', ctx);
            // Return a more informative error message
            return {
              resources: [
                {
                  uri: 'error://file-not-found',
                  name: 'Error Reading Resources',
                  type: 'error',
                  content: `Failed to read llms.txt: ${
                    ctx.message
                  }. Attempted path: ${path.resolve(
                    __dirname,
                    '../../llms.txt',
                  )}`,
                },
              ],
            };
          }
          return {
            resources: [
              {
                uri: 'error://unknown',
                name: 'Unknown Error',
                type: 'error',
                content: 'An unknown error occurred while reading resources',
              },
            ],
          };
        }
      },
    );
  }

  private registerPrompts() {
    this.mcpServer.server.setRequestHandler(
      ListPromptsRequestSchema,
      async (): Promise<ListPromptsResult> => {
        return {
          prompts: Object.values(PROMPTS),
        };
      },
    );

    this.mcpServer.server.setRequestHandler(
      GetPromptRequestSchema,
      async (request): Promise<GetPromptResult> => {
        const prompt = PROMPTS[request.params.name];
        if (!prompt) {
          throw new Error(`Prompt not found: ${request.params.name}`);
        }

        const promptResult = PROMPTS_IMPL[request.params.name];
        // Register all prompts
        if (promptResult && promptResult.text) {
          return {
            messages: [
              {
                role: 'user',
                content: {
                  type: 'text',
                  text: promptResult.text(request.params.arguments ?? {}),
                },
              },
            ],
          };
        }
        throw new Error('Prompt implementation not found');
      },
    );
  }

  private registerTools() {
    this.mcpServer.server.setRequestHandler(
      ListToolsRequestSchema,
      async () => {
        return {
          tools: TOOLS.map(({ schema }) => schema),
        };
      },
    );

    this.mcpServer.server.setRequestHandler(
      CallToolRequestSchema,
      async (request: CallToolRequest) => {
        const tool = TOOLS.find(
          ({ schema }) => request.params.name === schema.name,
        );

        if (tool?.schema && tool.schema.name === request.params.name) {
          return await tool.handler({
            ...request,
            params: {
              ...request.params,
              arguments: {
                ...request.params.arguments,
                storybookDocsRoot: this.storybookDocsRoot,
                deprecatedCssClassesPath: this.deprecatedCssClassesPath,
                uiRoot: this.uiRoot,
                cwd: this.workspaceRoot,
                workspaceRoot: this.workspaceRoot,
              },
            },
          });
        }

        return {
          content: [toolNotFound(request)],
          isError: false,
        };
      },
    );
  }
}
