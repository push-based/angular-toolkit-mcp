/**
 * Component Contract Types
 */

export type TemplateType = 'inline' | 'external';

export interface ComponentContract {
  meta: Meta;
  publicApi: PublicApi;
  slots: Slots;
  dom: DomStructure;
  styles: StyleDeclarations;
}

export interface Meta {
  name: string;
  selector: string;
  sourceFile: string;
  templateType: TemplateType;
  generatedAt: string;
  hash: string;
}

export interface PublicApi {
  properties: Record<string, PropertyBinding>;
  events: Record<string, EventBinding>;
  methods: Record<string, MethodSignature>;
  lifecycle: string[];
  imports: ImportInfo[];
}

export interface PropertyBinding {
  type: string;
  isInput: boolean;
  required: boolean;
  transform?: string;
}

export interface EventBinding {
  type: string;
}

export interface MethodSignature {
  name: string;
  parameters: ParameterInfo[];
  returnType: string;
  isPublic: boolean;
  isStatic: boolean;
  isAsync: boolean;
}

export interface ParameterInfo {
  name: string;
  type: string;
  optional: boolean;
  defaultValue?: string;
}

export interface ImportInfo {
  name: string;
  path: string;
}

export interface Slots {
  [slotName: string]: {
    selector: string;
  };
}

/**
 * Flat DOM structure with CSS selector keys for efficient lookups and minimal diff noise
 */
export interface DomStructure {
  [selectorKey: string]: DomElement;
}

export interface DomElement {
  tag: string;
  parent: string | null;
  children: string[];
  bindings: Binding[];
  attributes: Attribute[];
  events: Event[];
  /**
   * Optional stack of active structural directives (Angular control-flow / template constructs)
   * that wrap this DOM element, preserving the order of nesting from outermost → innermost.
   * Kept optional so that existing contracts without this field remain valid.
   */
  structural?: StructuralDirectiveContext[];
}

export interface Binding {
  type: 'class' | 'style' | 'property' | 'attribute';
  name: string;
  source: string;
}

export interface Attribute {
  type: 'attribute';
  name: string;
  source: string;
}

export interface Event {
  name: string;
  handler: string;
}

/**
 * Style declarations with explicit DOM relationships for property-level change detection
 */
export interface StyleDeclarations {
  sourceFile: string;
  rules: Record<string, StyleRule>;
}

export interface StyleRule {
  appliesTo: string[];
  properties: Record<string, string>;
}

/**
 * DOM path deduplication utility for diff operations
 */
export interface DomPathDictionary {
  paths: string[];
  lookup: Map<string, number>;
  stats: {
    totalPaths: number;
    uniquePaths: number;
    duplicateReferences: number;
    bytesBeforeDeduplication: number;
    bytesAfterDeduplication: number;
  };
}

/**
 * Captures context of Angular structural directives (v17 control-flow blocks and classic *ngX)
 */
export interface StructuralDirectiveContext {
  kind: 'for' | 'if' | 'switch' | 'switchCase' | 'switchDefault' | 'defer';
  /** Raw expression text (loop expression, condition…) when available */
  expression?: string;
  /** Optional alias / let-var (e.g., let-item) or trackBy identifier */
  alias?: string;
  /** Optional branch inside control-flow blocks (then/else, empty, case…). */
  branch?: 'then' | 'else' | 'empty' | 'case' | 'default';
}
