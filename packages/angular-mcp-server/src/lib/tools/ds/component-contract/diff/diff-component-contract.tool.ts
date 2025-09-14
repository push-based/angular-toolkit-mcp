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
import {
  consolidateAndPruneRemoveOperationsWithDeduplication,
  groupChangesByDomainAndType,
  generateDiffSummary,
} from './utils/diff-utils.js';
import { writeFile, mkdir } from 'node:fs/promises';
import diff from 'microdiff';

interface DiffComponentContractOptions extends BaseHandlerOptions {
  saveLocation: string;
  contractBeforePath: string;
  contractAfterPath: string;
  dsComponentName?: string;
}

export const diffComponentContractHandler = createHandler<
  DiffComponentContractOptions,
  {
    fileUrl: string;
    domPathStats?: DomPathDictionary['stats'];
  }
>(
  diffComponentContractSchema.name,
  async (params, { cwd, workspaceRoot }) => {
    const { saveLocation, contractBeforePath, contractAfterPath, dsComponentName = '' } = params;
    
    const effectiveBeforePath = resolveCrossPlatformPath(cwd, contractBeforePath);
    const effectiveAfterPath = resolveCrossPlatformPath(cwd, contractAfterPath);

    const contractBefore = await loadContract(effectiveBeforePath);
    const contractAfter = await loadContract(effectiveAfterPath);

    const rawDiffResult = diff(contractBefore, contractAfter);

    const { processedResult, domPathDict } =
      consolidateAndPruneRemoveOperationsWithDeduplication(rawDiffResult);

    const groupedChanges = groupChangesByDomainAndType(processedResult);

    const diffData = {
      before: effectiveBeforePath,
      after: effectiveAfterPath,
      dsComponentName,
      timestamp: new Date().toISOString(),
      domPathDictionary: domPathDict.paths,
      changes: groupedChanges,
      summary: generateDiffSummary(processedResult, groupedChanges),
    };

    const normalizedDiffData = normalizePathsInObject(diffData, workspaceRoot);

    const effectiveSaveLocation = resolveCrossPlatformPath(cwd, saveLocation);
    
    const { dirname } = await import('node:path');
    await mkdir(dirname(effectiveSaveLocation), { recursive: true });
    
    const diffFilePath = effectiveSaveLocation;

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
