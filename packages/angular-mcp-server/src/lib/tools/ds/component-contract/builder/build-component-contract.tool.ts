import {
  createHandler,
  BaseHandlerOptions,
} from '../../shared/utils/handler-helpers.js';
import { buildComponentContractSchema } from './models/schema.js';
import { buildComponentContract } from './utils/build-contract.js';
import { generateContractSummary } from '../shared/utils/contract-file-ops.js';
import { ContractResult } from './models/types.js';
import { resolveCrossPlatformPath } from '../../shared/utils/cross-platform-path.js';
import {
  OUTPUT_SUBDIRS,
  resolveDefaultSaveLocation,
} from '../../shared/constants.js';
import { createHash } from 'node:crypto';
import { dirname } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';

interface BuildComponentContractOptions extends BaseHandlerOptions {
  saveLocation?: string;
  templateFile?: string;
  styleFile?: string;
  typescriptFile: string;
  dsComponentName?: string;
}

export const buildComponentContractHandler = createHandler<
  BuildComponentContractOptions,
  ContractResult
>(
  buildComponentContractSchema.name,
  async (params, { cwd, workspaceRoot: _workspaceRoot }) => {
    const {
      saveLocation,
      templateFile,
      styleFile,
      typescriptFile,
      dsComponentName = '',
    } = params;

    const effectiveTypescriptPath = resolveCrossPlatformPath(
      cwd,
      typescriptFile,
    );

    const defaultSaveLocation = resolveDefaultSaveLocation(
      saveLocation,
      OUTPUT_SUBDIRS.CONTRACTS,
      typescriptFile,
      '-contract.json',
    );

    // If templateFile or styleFile are not provided, use the TypeScript file path
    // This indicates inline template/styles
    const effectiveTemplatePath = templateFile
      ? resolveCrossPlatformPath(cwd, templateFile)
      : effectiveTypescriptPath;
    const effectiveScssPath = styleFile
      ? resolveCrossPlatformPath(cwd, styleFile)
      : effectiveTypescriptPath;

    const contract = await buildComponentContract(
      effectiveTemplatePath,
      effectiveScssPath,
      cwd,
      effectiveTypescriptPath,
    );

    const contractString = JSON.stringify(contract, null, 2);
    const hash = createHash('sha256').update(contractString).digest('hex');

    const effectiveSaveLocation = resolveCrossPlatformPath(
      cwd,
      defaultSaveLocation,
    );

    await mkdir(dirname(effectiveSaveLocation), { recursive: true });

    const contractData = {
      contract,
      hash: `sha256-${hash}`,
      metadata: {
        templatePath: effectiveTemplatePath,
        scssPath: effectiveScssPath,
        typescriptPath: effectiveTypescriptPath,
        timestamp: new Date().toISOString(),
        dsComponentName,
      },
    };

    await writeFile(
      effectiveSaveLocation,
      JSON.stringify(contractData, null, 2),
      'utf-8',
    );

    const contractFilePath = effectiveSaveLocation;

    return {
      contract,
      hash: `sha256-${hash}`,
      contractFilePath,
    };
  },
  (result) => {
    const summary = generateContractSummary(result.contract);
    return [
      `✅ Contract Hash: ${result.hash}`,
      `📁 Saved to: ${result.contractFilePath}`,
      ...summary,
    ];
  },
);

export const buildComponentContractTools = [
  {
    schema: buildComponentContractSchema,
    handler: buildComponentContractHandler,
  },
];
