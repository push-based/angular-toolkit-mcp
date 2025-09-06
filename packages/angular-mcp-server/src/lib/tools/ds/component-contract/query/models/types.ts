export interface ContractQuery {
  query: string;
  sections?: ContractSection[];
}

export type ContractSection = 'meta' | 'publicApi' | 'dom' | 'styles';

export interface QueryResult {
  query: ContractQuery;
  results: unknown;
  count?: number;
  summary?: string;
  sectionsSearched: ContractSection[];
}

export interface QueryOptions {
  directory: string;
  contractPath: string;
  query: string;
  sections?: ContractSection[];
}

export interface ComponentOverview {
  component: {
    name: string;
    selector: string;
    templateType: string;
    sourceFile: string;
  };
  publicApi: {
    inputCount: number;
    outputCount: number;
    methodCount: number;
    lifecycleHooks: string[];
    importCount: number;
  };
  structure: {
    domElementCount: number;
    styleRuleCount: number;
  };
  metadata: {
    generatedAt: string;
    hash: string;
  };
}

export interface InputProperty {
  name: string;
  type: string;
  required: boolean;
  isInput: boolean;
}

export interface OutputEvent {
  name: string;
  type: string;
}

export interface MethodInfo {
  name: string;
  parameters: unknown[];
  returnType: string;
  isPublic: boolean;
  isAsync: boolean;
  signature: string;
}

export interface EventHandler {
  element: string;
  eventName: string;
  handler: string;
  tag: string;
}

export interface DomElement {
  path: string;
  tag: string;
  attributes: unknown[];
  events: unknown[];
  bindings: unknown[];
  structural: unknown[];
  children: unknown[];
}

export interface StyleRule {
  selector: string;
  properties: Record<string, unknown>;
  appliesTo: string[];
}

export interface ImportInfo {
  name: string;
  path: string;
  type: string;
}

export interface SearchResult {
  path: string;
  value: unknown;
  type: string;
  section?: string;
}
