// Export shared types
export type {
  ComponentContract,
  Meta,
  PublicApi,
  PropertyBinding,
  EventBinding,
  MethodSignature,
  ParameterInfo,
  ImportInfo,
  Slots,
  DomStructure,
  DomElement,
  Binding,
  Attribute,
  Event,
  StyleDeclarations,
  StyleRule,
  DomPathDictionary,
  TemplateType,
} from './shared/models/types.js';

// Export module-specific types that external consumers might need
export type { ContractResult } from './builder/models/types.js';
export type { ContractFileInfo } from './list/models/types.js';

// Export utilities and tools
export { buildComponentContract } from './builder/utils/build-contract.js';
export {
  loadContract,
  saveContract,
  generateContractSummary,
} from './shared/utils/contract-file-ops.js';

export { buildComponentContractTools } from './builder/build-component-contract.tool.js';
export { diffComponentContractTools } from './diff/diff-component-contract.tool.js';
export { listComponentContractsTools } from './list/list-component-contracts.tool.js';
