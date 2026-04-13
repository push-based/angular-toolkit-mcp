import type { BaseHandlerOptions } from '../../shared/utils/handler-helpers.js';

// ============================================================================
// Input types
// ============================================================================

export type AuditMode = 'validate' | 'overrides';

export interface AuditTokenUsageOptions extends BaseHandlerOptions {
  directory: string;
  modes?: AuditMode[] | 'all';
  brandName?: string;
  componentName?: string;
  tokenPrefix?: string;
  excludePatterns?: string | string[];
  saveAsFile?: boolean;
}

// ============================================================================
// Validate mode results
// ============================================================================

export interface ValidTokenRef {
  token: string;
  file: string;
  line: number;
}

export interface InvalidTokenRef {
  token: string;
  file: string;
  line: number;
  suggestion?: string;
  editDistance?: number;
}

export interface BrandSpecificWarning {
  token: string;
  file: string;
  line: number;
  availableBrands: string[];
}

export interface ValidateResult {
  semantic: {
    valid: ValidTokenRef[];
    invalid: InvalidTokenRef[];
  };
  component: {
    valid: ValidTokenRef[];
    invalid: InvalidTokenRef[];
  };
  brandWarnings?: BrandSpecificWarning[];
}

// ============================================================================
// Overrides mode results
// ============================================================================

export type OverrideMechanism =
  | 'host'
  | 'ng-deep'
  | 'class-selector'
  | 'root-theme'
  | 'important'
  | 'encapsulation-none';

export type OverrideClassification =
  | 'legitimate'
  | 'component-override'
  | 'inline-override'
  | 'deep-override'
  | 'important-override'
  | 'encapsulation-none'
  | 'scope-violation';

export interface OverrideItem {
  file: string;
  line: number;
  token: string;
  newValue: string;
  originalValue?: string;
  mechanism: OverrideMechanism;
  classification?: OverrideClassification;
}

export interface OverridesResult {
  items: OverrideItem[];
  byMechanism: Record<string, number>;
  byClassification?: Record<string, number>;
}

// ============================================================================
// Combined result
// ============================================================================

export interface AuditSummary {
  totalIssues: number;
  byMode: {
    validate?: number;
    overrides?: number;
  };
}

export interface AuditTokenUsageResult {
  validate?: ValidateResult;
  overrides?: OverridesResult;
  summary: AuditSummary;
  diagnostics: string[];
}
