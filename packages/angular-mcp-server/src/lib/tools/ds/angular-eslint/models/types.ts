import { Issue } from '@push-based/models';

export interface ValidateAngularComponentsOptions {
  directory: string;
  files?: string[];
  cwd?: string;
  workspaceRoot?: string;
  configPath?: string;
}

export interface ValidationResult {
  issues: Issue[];
  totalFiles: number;
  executionTime: number;
  configSource?: ConfigSource;
  configPath?: string;
}

export interface ConfigResolutionResult {
  config: any[] | null;
  source: ConfigSource;
  path?: string;
}

export type ConfigSource =
  | 'custom' // User-provided configPath
  | 'library' // Found in target directory
  | 'parent' // Found in parent directory during walk-up
  | 'workspace' // Found in workspace root
  | 'fallback' // Using hardcoded config
  | 'none'; // No config found (before fallback)

export interface ESLintConfig {
  files: string[];
  languageOptions: {
    parser: any;
    parserOptions?: {
      project?: string;
      sourceType?: string;
      ecmaVersion?: number;
    };
  };
  plugins: Record<string, any>;
  rules: Record<string, string | string[]>;
}

export interface FileValidationResult {
  filePath: string;
  issues: Issue[];
}

export type ValidationSeverity = 'error' | 'warning';
