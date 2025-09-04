import {
  createHandler,
  BaseHandlerOptions,
} from '../../shared/utils/handler-helpers.js';
import { buildComponentContractSchema } from './models/schema.js';
import { buildComponentContract } from './utils/build-contract.js';
import {
  saveContract,
  generateContractSummary,
} from '../shared/utils/contract-file-ops.js';
import { ContractResult } from './models/types.js';
import { resolveCrossPlatformPath } from '../../shared/utils/cross-platform-path.js';

interface BuildComponentContractOptions extends BaseHandlerOptions {
  directory: string;
  templateFile: string;
  styleFile: string;
  typescriptFile: string;
  dsComponentName: string;
  saveLocation?: string;
}

export const buildComponentContractHandler = createHandler<
  BuildComponentContractOptions,
  ContractResult
>(
  buildComponentContractSchema.name,
  async (params, { cwd, workspaceRoot }) => {
    const {
      directory,
      templateFile,
      styleFile,
      typescriptFile,
      dsComponentName,
      saveLocation,
    } = params;

    const effectiveTemplatePath = resolveCrossPlatformPath(
      directory,
      templateFile,
    );
    const effectiveScssPath = resolveCrossPlatformPath(directory, styleFile);
    const effectiveTypescriptPath = resolveCrossPlatformPath(
      directory,
      typescriptFile,
    );

    const contract = await buildComponentContract(
      effectiveTemplatePath,
      effectiveScssPath,
      cwd,
      effectiveTypescriptPath,
    );

    const { contractFilePath, hash } = await saveContract(
      contract,
      workspaceRoot,
      effectiveTemplatePath,
      effectiveScssPath,
      cwd,
      dsComponentName,
      saveLocation,
    );

    return {
      contract,
      hash,
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
