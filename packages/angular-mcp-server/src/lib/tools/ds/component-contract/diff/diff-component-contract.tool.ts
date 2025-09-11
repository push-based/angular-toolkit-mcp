import {
  createHandler,
  BaseHandlerOptions,
} from '../../shared/utils/handler-helpers.js';
import {
  resolveCrossPlatformPath,
  normalizePathsInObject,
} from '../../shared/utils/cross-platform-path.js';
import { diffComponentContractSchema } from './models/schema.js';
import type { DomPathDictionary } from '../shared/models/types.js';
import { loadContract } from '../shared/utils/contract-file-ops.js';
import { componentNameToKebabCase } from '../../shared/utils/component-validation.js';
import { basename } from 'node:path';
import {
  consolidateAndPruneRemoveOperationsWithDeduplication,
  groupChangesByDomainAndType,
  generateDiffSummary,
} from './utils/diff-utils.js';
import { writeFile, mkdir } from 'node:fs/promises';
import diff from 'microdiff';

interface DiffComponentContractOptions extends BaseHandlerOptions {
  directory: string;
  contractBeforePath: string;
  contractAfterPath: string;
  dsComponentName: string;
}

export const diffComponentContractHandler = createHandler<
  DiffComponentContractOptions,
  {
    fileUrl: string;
    domPathStats?: DomPathDictionary['stats'];
  }
>(
  diffComponentContractSchema.name,
  async (params, { workspaceRoot }) => {
    const effectiveBeforePath = resolveCrossPlatformPath(
      params.directory,
      params.contractBeforePath,
    );
    const effectiveAfterPath = resolveCrossPlatformPath(
      params.directory,
      params.contractAfterPath,
    );

    const contractBefore = await loadContract(effectiveBeforePath);
    const contractAfter = await loadContract(effectiveAfterPath);

    const rawDiffResult = diff(contractBefore, contractAfter);

    const { processedResult, domPathDict } =
      consolidateAndPruneRemoveOperationsWithDeduplication(rawDiffResult);

    const groupedChanges = groupChangesByDomainAndType(processedResult);

    const diffData = {
      before: effectiveBeforePath,
      after: effectiveAfterPath,
      dsComponentName: params.dsComponentName,
      timestamp: new Date().toISOString(),
      domPathDictionary: domPathDict.paths,
      changes: groupedChanges,
      summary: generateDiffSummary(processedResult, groupedChanges),
    };

    // Normalize absolute paths to relative paths for portability
    const normalizedDiffData = normalizePathsInObject(diffData, workspaceRoot);

    // Create component-specific diffs directory
    const componentKebab = componentNameToKebabCase(params.dsComponentName);
    const diffDir = resolveCrossPlatformPath(
      workspaceRoot,
      `.cursor/tmp/contracts/${componentKebab}/diffs`,
    );
    await mkdir(diffDir, { recursive: true });

    // Generate simplified diff filename: diff-{componentName}-{timestamp}.json
    const componentBaseName = basename(
      effectiveBeforePath,
      '.contract.json',
    ).split('-')[0]; // Extract component name before timestamp
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d+Z$/, 'Z');
    const diffFileName = `diff-${componentBaseName}-${timestamp}.json`;
    const diffFilePath = resolveCrossPlatformPath(diffDir, diffFileName);

    const formattedJson = JSON.stringify(normalizedDiffData, null, 2);
    await writeFile(diffFilePath, formattedJson, 'utf-8');

    return {
      fileUrl: `file://${diffFilePath}`,
      domPathStats: domPathDict.stats,
    };
  },
  (result) => {
    return [result.fileUrl];
  },
);

export const diffComponentContractTools = [
  {
    schema: diffComponentContractSchema,
    handler: diffComponentContractHandler,
  },
];
