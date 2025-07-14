// Configuration constants for ESLint validation

export const ANGULAR_ESLINT_RULES = {
  '@angular-eslint/no-output-native': 'error',
  '@angular-eslint/no-output-on-prefix': 'error',
  '@angular-eslint/no-output-rename': 'error',
  '@angular-eslint/no-input-rename': 'error',
  '@angular-eslint/contextual-lifecycle': 'error',
  '@angular-eslint/no-conflicting-lifecycle': 'error',
  '@angular-eslint/no-async-lifecycle-method': 'error',
  '@angular-eslint/no-input-prefix': 'error',
  '@angular-eslint/no-inputs-metadata-property': 'error',
  '@angular-eslint/no-outputs-metadata-property': 'error',
  '@angular-eslint/use-lifecycle-interface': 'error',
  '@angular-eslint/component-class-suffix': 'error',
  '@angular-eslint/directive-class-suffix': 'error',
  '@angular-eslint/no-host-metadata-property': 'error',
  '@angular-eslint/prefer-on-push-component-change-detection': 'warn',
} as const;

export const TYPESCRIPT_ESLINT_RULES = {
  '@typescript-eslint/no-unused-vars': 'warn',
  '@typescript-eslint/no-explicit-any': 'warn',
} as const;

export const ANGULAR_TEMPLATE_RULES = {
  '@angular-eslint/template/banana-in-box': 'error',
  '@angular-eslint/template/no-call-expression': 'error',
  '@angular-eslint/template/no-negated-async': 'error',
  '@angular-eslint/template/no-duplicate-attributes': 'error',
  '@angular-eslint/template/use-track-by-function': 'warn',
  '@angular-eslint/template/conditional-complexity': 'warn',
  '@angular-eslint/template/cyclomatic-complexity': 'warn',
  '@angular-eslint/template/no-any': 'warn',
  '@angular-eslint/template/no-autofocus': 'error',
  '@angular-eslint/template/no-distracting-elements': 'error',
  '@angular-eslint/template/no-positive-tabindex': 'error',
  '@angular-eslint/template/valid-aria': 'error',
} as const;

export const FILE_PATTERNS = {
  TYPESCRIPT: ['**/*.ts'],
  TEMPLATE: ['**/*.html'],
} as const;

export const FILE_EXTENSIONS = {
  TYPESCRIPT: ['.ts'],
  TEMPLATE: ['.html'],
  SPEC: ['.spec.ts'],
  DECLARATION: ['.d.ts'],
} as const;
