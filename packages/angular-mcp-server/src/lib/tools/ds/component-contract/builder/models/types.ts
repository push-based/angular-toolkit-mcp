/**
 * Builder Module Types
 * Builder-specific result types - core contract types are in shared models/types.ts
 */

import type { ComponentContract } from '../../shared/models/types.js';

export interface ContractResult {
  contract: ComponentContract;
  hash: string;
  contractFilePath: string;
}

export interface DecoratorInputMeta {
  name: string;
  type?: string;
  required?: boolean;
  alias?: string;
}

export interface DecoratorOutputMeta {
  name: string;
  type?: string;
  alias?: string;
}

export interface SignalInputMeta {
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  transform?: string;
}

export interface SignalOutputMeta {
  name: string;
  type?: string;
}

export interface ExtractedInputsOutputs {
  inputs: Record<string, DecoratorInputMeta | SignalInputMeta>;
  outputs: Record<string, DecoratorOutputMeta | SignalOutputMeta>;
}
