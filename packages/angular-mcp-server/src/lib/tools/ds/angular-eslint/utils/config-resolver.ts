import { readFile, access, constants } from 'node:fs/promises';
import path from 'node:path';
import { createFlatConfig } from './config-builder.js';
import { findTsConfig } from './tsconfig-finder.js';
import { ConfigResolutionResult, ConfigSource } from '../models/types.js';

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

const ESLINT_CONFIG_FILES = [
  'eslint.config.mjs',
  'eslint.config.js',
  'eslint.config.ts',
  'eslint.config.cjs',
  '.eslintrc.js',
  '.eslintrc.mjs',
  '.eslintrc.cjs',
  '.eslintrc.json',
  '.eslintrc.yml',
  '.eslintrc.yaml',
];

export async function resolveESLintConfig({
  targetDir,
  workspaceRoot,
  configPath,
}: {
  targetDir: string;
  workspaceRoot?: string;
  configPath?: string;
}): Promise<ConfigResolutionResult> {
  if (configPath) {
    const resolvedPath = path.isAbsolute(configPath)
      ? configPath
      : path.resolve(targetDir, configPath);
    const customConfig = await loadConfigFromPath(resolvedPath);
    if (customConfig) {
      return {
        config: customConfig,
        source: 'custom',
        path: resolvedPath,
      };
    }
    throw new Error(`Custom config path not found: ${configPath}`);
  }

  const foundConfig = await walkUpForConfig(targetDir, workspaceRoot);
  if (foundConfig.config) {
    return foundConfig;
  }

  return await getFallbackConfig(targetDir);
}

async function walkUpForConfig(
  startDir: string,
  workspaceRoot?: string,
): Promise<ConfigResolutionResult> {
  let currentDir = path.resolve(startDir);
  const root = workspaceRoot
    ? path.resolve(workspaceRoot)
    : path.parse(currentDir).root;

  while (currentDir !== root && currentDir !== path.dirname(currentDir)) {
    for (const configFile of ESLINT_CONFIG_FILES) {
      const configPath = path.join(currentDir, configFile);

      if (await pathExists(configPath)) {
        const config = await loadConfigFromPath(configPath);
        if (config) {
          const source =
            currentDir === path.resolve(startDir)
              ? 'library'
              : currentDir === root
                ? 'workspace'
                : 'parent';

          return {
            config,
            source: source as ConfigSource,
            path: configPath,
          };
        }
      }
    }

    currentDir = path.dirname(currentDir);
  }

  if (workspaceRoot && currentDir === root) {
    for (const configFile of ESLINT_CONFIG_FILES) {
      const configPath = path.join(root, configFile);

      if (await pathExists(configPath)) {
        const config = await loadConfigFromPath(configPath);
        if (config) {
          return {
            config,
            source: 'workspace',
            path: configPath,
          };
        }
      }
    }
  }

  return { config: null, source: 'none' };
}

async function loadConfigFromPath(configPath: string): Promise<any[] | null> {
  try {
    const ext = path.extname(configPath);

    if (ext === '.mjs' || ext === '.js') {
      const module = await import(`file://${configPath}`);
      const config = module.default || module;
      return Array.isArray(config) ? config : [config];
    }

    if (ext === '.cjs') {
      delete require.cache[require.resolve(configPath)];
      const config = require(configPath);
      return Array.isArray(config) ? config : [config];
    }

    if (ext === '.json') {
      const content = await readFile(configPath, 'utf-8');
      const config = JSON.parse(content);
      return convertLegacyToFlat(config);
    }

    if (ext === '.yml' || ext === '.yaml') {
      const yaml = await import('yaml');
      const content = await readFile(configPath, 'utf-8');
      const config = yaml.parse(content);
      return convertLegacyToFlat(config);
    }

    return null;
  } catch (ctx) {
    throw new Error(
      `Failed to load config from ${configPath}: ${(ctx as Error).message}`,
    );
  }
}

async function getFallbackConfig(
  targetDir: string,
): Promise<ConfigResolutionResult> {
  const tsConfigPath = await findTsConfig(targetDir);
  const config = createFlatConfig(tsConfigPath);
  return {
    config,
    source: 'fallback',
    path: undefined,
  };
}

const convertLegacyToFlat = ({
  parserOptions = {},
  plugins = {},
  rules = {},
}): any[] => [
  {
    files: ['**/*.{ts,js}'],
    languageOptions: { parserOptions },
    plugins,
    rules,
  },
];
