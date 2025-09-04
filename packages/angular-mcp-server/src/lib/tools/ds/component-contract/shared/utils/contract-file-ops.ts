import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, basename, extname } from 'node:path';
import { createHash } from 'node:crypto';
import { ComponentContract } from '../models/types.js';
import { resolveCrossPlatformPath } from '../../../shared/utils/cross-platform-path.js';
import { componentNameToKebabCase } from '../../../shared/utils/component-validation.js';

/**
 * Load a contract from a JSON file, handling both wrapped and direct formats
 */
export async function loadContract(path: string): Promise<ComponentContract> {
  if (!existsSync(path)) {
    throw new Error(`Contract file not found: ${path}`);
  }

  const content = await readFile(path, 'utf-8');
  const data = JSON.parse(content);

  return data.contract || data;
}

/**
 * Save a contract to the standard location with metadata
 */
export async function saveContract(
  contract: ComponentContract,
  workspaceRoot: string,
  templatePath: string,
  scssPath: string,
  cwd: string,
  dsComponentName?: string,
  customSaveLocation?: string,
): Promise<{ contractFilePath: string; hash: string }> {
  const componentName = basename(templatePath, extname(templatePath));

  const contractString = JSON.stringify(contract, null, 2);

  const hash = createHash('sha256').update(contractString).digest('hex');

  const timestamp = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d+Z$/, 'Z');

  const contractFileName = `${componentName}-${timestamp}.contract.json`;

  let contractDir: string;

  if (customSaveLocation) {
    contractDir = resolve(workspaceRoot, customSaveLocation);
  } else {
    contractDir = resolveCrossPlatformPath(
      workspaceRoot,
      '.cursor/tmp/contracts',
    );

    if (dsComponentName) {
      const folderSlug = componentNameToKebabCase(dsComponentName);
      contractDir = resolveCrossPlatformPath(
        workspaceRoot,
        `.cursor/tmp/contracts/${folderSlug}`,
      );
    }
  }

  await mkdir(contractDir, { recursive: true });

  const contractFilePath = resolve(contractDir, contractFileName);

  const contractData = {
    contract,
    hash: `sha256-${hash}`,
    metadata: {
      templatePath: resolve(cwd, templatePath),
      scssPath: resolve(cwd, scssPath),
      timestamp: new Date().toISOString(),
      componentName,
    },
  };

  await writeFile(
    contractFilePath,
    JSON.stringify(contractData, null, 2),
    'utf-8',
  );

  return {
    contractFilePath,
    hash: `sha256-${hash}`,
  };
}

/**
 * Generate a standardized contract summary for display
 */
export function generateContractSummary(contract: ComponentContract): string[] {
  return [
    `🎯 DOM Elements: ${Object.keys(contract.dom).length}`,
    `🎨 Style Rules: ${Object.keys(contract.styles.rules).length}`,
    `📥 Properties: ${Object.keys(contract.publicApi.properties).length}`,
    `📤 Events: ${Object.keys(contract.publicApi.events).length}`,
    `⚙️  Methods: ${Object.keys(contract.publicApi.methods).length}`,
    `🔄 Lifecycle Hooks: ${contract.publicApi.lifecycle.length}`,
    `📦 Imports: ${contract.publicApi.imports.length}`,
    `🎪 Slots: ${Object.keys(contract.slots).length}`,
    `📁 Source: ${contract.meta.sourceFile}`,
  ];
}

/**
 * Generate a timestamped filename for diff results
 */
export function generateDiffFileName(
  beforePath: string,
  afterPath: string,
): string {
  const beforeName = basename(beforePath, '.contract.json');
  const afterName = basename(afterPath, '.contract.json');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `diff-${beforeName}-vs-${afterName}-${timestamp}.json`;
}
