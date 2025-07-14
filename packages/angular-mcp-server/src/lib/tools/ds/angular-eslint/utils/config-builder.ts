import {
  ANGULAR_ESLINT_RULES,
  ANGULAR_TEMPLATE_RULES,
  TYPESCRIPT_ESLINT_RULES,
  FILE_PATTERNS,
} from '../models/config.js';

const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');

const makeTsOverride = (tsCfg: string, withNg = false): any => ({
  files: FILE_PATTERNS.TYPESCRIPT,
  languageOptions: { parser: tsParser, parserOptions: { project: tsCfg } },
  plugins: {
    '@typescript-eslint': tsPlugin,
    ...(withNg && {
      '@angular-eslint': require('@angular-eslint/eslint-plugin'),
    }),
  },
  rules: { ...TYPESCRIPT_ESLINT_RULES, ...(withNg && ANGULAR_ESLINT_RULES) },
});

export function createFlatConfig(tsCfg: string): any[] {
  try {
    const tplParser = require('@angular-eslint/template-parser');
    const tplPlugin = require('@angular-eslint/eslint-plugin-template');
    return [
      makeTsOverride(tsCfg, true),
      {
        files: [...FILE_PATTERNS.TEMPLATE],
        languageOptions: { parser: tplParser },
        plugins: { '@angular-eslint/template': tplPlugin },
        rules: ANGULAR_TEMPLATE_RULES,
      },
    ];
  } catch {
    return [makeTsOverride(tsCfg)];
  }
}
