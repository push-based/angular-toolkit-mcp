import { ToolSchemaOptions } from '@push-based/models';
import {
  createHandler,
  BaseHandlerOptions,
} from '../shared/utils/handler-helpers.js';
import { COMMON_ANNOTATIONS } from '../shared/models/schema-helpers.js';
import { resolveCrossPlatformPath } from '../shared/utils/cross-platform-path.js';
import {
  componentNameToKebabCase,
} from '../shared/utils/component-validation.js';
import * as fs from 'fs';
import * as path from 'path';

interface GetDsTokensOptions extends BaseHandlerOptions {
  theme?: string;
  mode?: string;
  componentName?: string;
  search?: string;
}

interface TokenEntry {
  name: string;
  value: string;
  reference?: string;
}

interface ComponentTokenMixin {
  name: string;
  tokens: TokenEntry[];
}

interface DsTokensResult {
  availableThemes?: Record<string, string[]>;
  availableComponents?: string[];
  semanticTokens?: TokenEntry[];
  componentTokens?: ComponentTokenMixin[];
  theme?: string;
  mode?: string;
  componentName?: string;
}

export const getDsTokensToolSchema: ToolSchemaOptions = {
  name: 'get-ds-tokens',
  description: `Retrieve design system tokens. Returns semantic tokens (CSS custom properties) for a given theme/mode, and/or component-level token mappings (SCSS mixins). When called without parameters, lists available themes, modes, and component token files for discovery.`,
  inputSchema: {
    type: 'object',
    properties: {
      theme: {
        type: 'string',
        description:
          'Brand/theme name (e.g., "bwin", "coral", "betmgm"). When provided with mode, returns semantic tokens for that theme.',
      },
      mode: {
        type: 'string',
        description:
          'Theme mode (e.g., "light", "dark", "hybrid"). Required when theme is provided.',
      },
      componentName: {
        type: 'string',
        description:
          'The class name of the DS component (e.g., DsButton, DsBadge). Returns component-level token mixins mapping component tokens to semantic tokens.',
      },
      search: {
        type: 'string',
        description:
          'Optional substring filter applied to token names (e.g., "primary", "surface", "spacing-stack"). Returns all tokens whose name contains the search string.',
      },
    },
    required: [],
  },
  annotations: {
    title: 'Get Design System Tokens',
    ...COMMON_ANNOTATIONS.readOnly,
  },
};

/**
 * Parse CSS custom properties from a CSS file content.
 * Handles format: --token-name: #value; with optional reference comments
 */
function parseSemanticTokens(
  cssContent: string,
  search?: string,
): TokenEntry[] {
  const tokens: TokenEntry[] = [];
  const tokenRegex =
    /\s*(--[\w-]+)\s*:\s*([^;/]+?)(?:;?\s*\/\*\s*(var\([^)]+\))\s*\*\/|;)/g;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(cssContent)) !== null) {
    const name = match[1].trim();
    const value = match[2].trim();
    const reference = match[3]?.trim();

    if (search && !name.includes(search)) continue;

    const entry: TokenEntry = { name, value };
    if (reference) {
      entry.reference = reference;
    }
    tokens.push(entry);
  }

  return tokens;
}

/**
 * Parse SCSS mixins from component token files.
 * Extracts mixin names and their token assignments.
 */
function parseComponentTokenMixins(scssContent: string): ComponentTokenMixin[] {
  const mixins: ComponentTokenMixin[] = [];
  const mixinRegex = /@mixin\s+([\w-]+)\s*\{([^}]+)\}/g;
  let match: RegExpExecArray | null;

  while ((match = mixinRegex.exec(scssContent)) !== null) {
    const mixinName = match[1];
    const body = match[2];
    const tokens: TokenEntry[] = [];

    const propRegex = /\s*(--[\w-]+)\s*:\s*([^;]+);/g;
    let propMatch: RegExpExecArray | null;

    while ((propMatch = propRegex.exec(body)) !== null) {
      tokens.push({
        name: propMatch[1].trim(),
        value: propMatch[2].trim(),
      });
    }

    mixins.push({ name: mixinName, tokens });
  }

  return mixins;
}

/**
 * Discover available themes and their modes from the tokens directory.
 */
function discoverThemes(
  tokensBasePath: string,
): Record<string, string[]> {
  const themes: Record<string, string[]> = {};

  try {
    const entries = fs.readdirSync(tokensBasePath, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name === 'components') continue;

      const themePath = path.join(tokensBasePath, entry.name);
      const modes = fs
        .readdirSync(themePath, { withFileTypes: true })
        .filter((e) => e.isDirectory())
        .map((e) => e.name);

      if (modes.length > 0) {
        themes[entry.name] = modes;
      }
    }
  } catch {
    // Directory doesn't exist or can't be read
  }

  return themes;
}

/**
 * Discover available component token files.
 */
function discoverComponentTokens(tokensBasePath: string): string[] {
  const componentsPath = path.join(tokensBasePath, 'components');
  const components: string[] = [];

  try {
    if (fs.existsSync(componentsPath)) {
      const entries = fs.readdirSync(componentsPath, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          components.push(entry.name);
        }
      }
    }
  } catch {
    // Directory doesn't exist or can't be read
  }

  return components;
}

export const getDsTokensHandler = createHandler<
  GetDsTokensOptions,
  DsTokensResult
>(
  getDsTokensToolSchema.name,
  async ({ theme, mode, componentName, search }, { cwd, tokensRoot }) => {
    if (!tokensRoot) {
      throw new Error(
        'Missing ds.tokensRoot. Provide --ds.tokensRoot in mcp.json file pointing to the generated styles directory.',
      );
    }

    const tokensBasePath = resolveCrossPlatformPath(cwd, tokensRoot);

    if (!fs.existsSync(tokensBasePath)) {
      throw new Error(`Tokens directory not found: ${tokensRoot}`);
    }

    const result: DsTokensResult = {};

    // Discovery mode: no specific params → list what's available
    const isDiscovery = !theme && !componentName;

    if (isDiscovery) {
      result.availableThemes = discoverThemes(tokensBasePath);
      result.availableComponents = discoverComponentTokens(tokensBasePath);
      return result;
    }

    // Semantic tokens for a specific theme + mode
    if (theme) {
      if (!mode) {
        // List available modes for this theme
        const themePath = path.join(tokensBasePath, theme);
        if (!fs.existsSync(themePath)) {
          throw new Error(
            `Theme "${theme}" not found. Use the tool without parameters to list available themes.`,
          );
        }
        const modes = fs
          .readdirSync(themePath, { withFileTypes: true })
          .filter((e) => e.isDirectory())
          .map((e) => e.name);
        result.availableThemes = { [theme]: modes };
        return result;
      }

      const semanticCssPath = path.join(
        tokensBasePath,
        theme,
        mode,
        'semantic.css',
      );

      if (!fs.existsSync(semanticCssPath)) {
        throw new Error(
          `Semantic tokens not found for theme "${theme}" mode "${mode}". Expected file: ${theme}/${mode}/semantic.css`,
        );
      }

      const cssContent = fs.readFileSync(semanticCssPath, 'utf-8');
      result.semanticTokens = parseSemanticTokens(cssContent, search);
      result.theme = theme;
      result.mode = mode;
    }

    // Component tokens
    if (componentName) {
      const kebabName = componentNameToKebabCase(componentName);
      const componentScssPath = path.join(
        tokensBasePath,
        'components',
        kebabName,
        `${kebabName}.scss`,
      );

      if (!fs.existsSync(componentScssPath)) {
        throw new Error(
          `Component tokens not found for "${componentName}". Expected file: components/${kebabName}/${kebabName}.scss`,
        );
      }

      const scssContent = fs.readFileSync(componentScssPath, 'utf-8');
      result.componentTokens = parseComponentTokenMixins(scssContent);
      result.componentName = componentName;
    }

    return result;
  },
  (result) => {
    const messages: string[] = [];

    if (result.availableThemes) {
      messages.push('Available Themes:');
      for (const [theme, modes] of Object.entries(result.availableThemes)) {
        messages.push(`  ${theme}: ${modes.join(', ')}`);
      }
      messages.push('');
    }

    if (result.availableComponents && result.availableComponents.length > 0) {
      messages.push(
        `Available Component Tokens: ${result.availableComponents.join(', ')}`,
      );
      messages.push('');
    }

    if (result.semanticTokens) {
      messages.push(
        `Semantic Tokens (${result.theme}/${result.mode}): ${result.semanticTokens.length} tokens`,
      );
      messages.push('');
      messages.push(JSON.stringify(result.semanticTokens, null, 2));
      messages.push('');
    }

    if (result.componentTokens) {
      messages.push(
        `Component Tokens (${result.componentName}): ${result.componentTokens.length} mixins`,
      );
      messages.push('');
      messages.push(JSON.stringify(result.componentTokens, null, 2));
    }

    return messages;
  },
);

export const getDsTokensTools = [
  {
    schema: getDsTokensToolSchema,
    handler: getDsTokensHandler,
  },
];
