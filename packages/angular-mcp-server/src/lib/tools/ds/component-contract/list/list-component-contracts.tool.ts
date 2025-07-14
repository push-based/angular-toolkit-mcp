import { readdir, stat, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  createHandler,
  BaseHandlerOptions,
} from '../../shared/utils/handler-helpers.js';
import { resolveCrossPlatformPath } from '../../shared/utils/cross-platform-path.js';
import { listComponentContractsSchema } from './models/schema.js';
import type { ContractFileInfo } from './models/types.js';
import {
  extractComponentNameFromFile,
  formatBytes,
  formatContractsByComponent,
} from './utils/contract-list-utils.js';

interface ListComponentContractsOptions extends BaseHandlerOptions {
  directory: string;
}

/**
 * Recursively scan directory for contract files
 */
async function scanContractsRecursively(
  dirPath: string,
  contracts: ContractFileInfo[],
): Promise<void> {
  try {
    const entries = await readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);

      if (entry.isDirectory()) {
        // Recursively scan subdirectories
        await scanContractsRecursively(fullPath, contracts);
      } else if (entry.isFile() && entry.name.endsWith('.contract.json')) {
        // Process contract file
        const stats = await stat(fullPath);

        try {
          const contractData = JSON.parse(await readFile(fullPath, 'utf-8'));
          const componentName =
            contractData.metadata?.componentName ||
            extractComponentNameFromFile(entry.name);

          contracts.push({
            fileName: entry.name,
            filePath: fullPath,
            componentName,
            timestamp:
              contractData.metadata?.timestamp || stats.mtime.toISOString(),
            hash: contractData.hash || 'unknown',
            size: formatBytes(stats.size),
          });
        } catch {
          console.warn(`Skipping invalid contract file: ${fullPath}`);
          continue;
        }
      }
    }
  } catch (ctx) {
    // Silently skip directories that can't be read
    if ((ctx as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.warn(`Error scanning directory ${dirPath}:`, ctx);
    }
  }
}

export const listComponentContractsHandler = createHandler<
  ListComponentContractsOptions,
  ContractFileInfo[]
>(
  listComponentContractsSchema.name,
  async (_, { cwd: _cwd, workspaceRoot }) => {
    const contractDir = resolveCrossPlatformPath(
      workspaceRoot,
      '.cursor/tmp/contracts',
    );
    const contracts: ContractFileInfo[] = [];

    await scanContractsRecursively(contractDir, contracts);

    // Sort by timestamp (newest first)
    contracts.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    return contracts;
  },
  (contracts) => {
    if (contracts.length === 0) {
      return [
        '📁 No component contracts found',
        '💡 Use the build_component_contract tool to generate contracts',
        '🎯 Contracts are stored in .cursor/tmp/contracts/*.contract.json',
      ];
    }

    const output: string[] = [];

    output.push(...formatContractsByComponent(contracts));

    output.push('💡 Use diff_component_contract to compare contracts');
    output.push('🔄 Newer contracts appear first within each component');

    return output;
  },
);

export const listComponentContractsTools = [
  {
    schema: listComponentContractsSchema,
    handler: listComponentContractsHandler,
  },
];
