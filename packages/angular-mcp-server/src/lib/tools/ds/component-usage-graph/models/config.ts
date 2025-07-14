import { FileExtension, FileType } from './types.js';
import {
  IMPORT_REGEXES,
  REGEX_CACHE_UTILS,
} from '../../shared/utils/regex-helpers.js';

const STYLES_EXTENSIONS = ['.css', '.scss', '.sass', '.less'] as const;
const SCRIPT_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'] as const;
const TEMPLATE_EXTENSIONS = ['.html'] as const;
const FILE_EXTENSIONS = [
  ...STYLES_EXTENSIONS,
  ...SCRIPT_EXTENSIONS,
  ...TEMPLATE_EXTENSIONS,
] as const;
const RESOLVE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'] as const;
const INDEX_FILES = [
  '/index.ts',
  '/index.tsx',
  '/index.js',
  '/index.jsx',
] as const;
const EXCLUDE_PATTERNS = [
  'node_modules',
  'dist',
  'build',
  '.git',
  '.vscode',
  '.idea',
] as const;

const FILE_TYPE_MAP = {
  '.ts': 'typescript',
  '.tsx': 'typescript-react',
  '.js': 'javascript',
  '.jsx': 'javascript-react',
  '.css': 'css',
  '.scss': 'scss',
  '.sass': 'sass',
  '.less': 'less',
  '.html': 'template',
} as const satisfies Record<FileExtension, FileType>;

export const DEPENDENCY_ANALYSIS_CONFIG = {
  stylesExtensions: STYLES_EXTENSIONS,
  scriptExtensions: SCRIPT_EXTENSIONS,
  fileExtensions: FILE_EXTENSIONS,
  resolveExtensions: RESOLVE_EXTENSIONS,
  indexFiles: INDEX_FILES,
  excludePatterns: EXCLUDE_PATTERNS,
  fileTypeMap: FILE_TYPE_MAP,
} as const;

// Use shared regex patterns instead of duplicating them
export const REGEX_PATTERNS = {
  ES6_IMPORT: IMPORT_REGEXES.ES6_IMPORT,
  COMMONJS_REQUIRE: IMPORT_REGEXES.COMMONJS_REQUIRE,
  DYNAMIC_IMPORT: IMPORT_REGEXES.DYNAMIC_IMPORT,
  CSS_IMPORT: IMPORT_REGEXES.CSS_IMPORT,
  CSS_URL: IMPORT_REGEXES.CSS_URL,
  ANGULAR_COMPONENT_DECORATOR: IMPORT_REGEXES.ANGULAR_COMPONENT_DECORATOR,
  GLOB_WILDCARD_REPLACEMENT: /\*/g,
} as const;

// Use shared regex cache utilities instead of duplicating cache management
export const componentImportRegex = (componentName: string): RegExp =>
  REGEX_CACHE_UTILS.getOrCreate(`component-import-${componentName}`, () =>
    IMPORT_REGEXES.createComponentImportRegex(componentName),
  );

export const getComponentImportRegex = (componentName: string): RegExp =>
  componentImportRegex(componentName);

export const getCombinedComponentImportRegex = (
  componentNames: string[],
): RegExp => {
  const cacheKey = componentNames.sort().join('|');
  return REGEX_CACHE_UTILS.getOrCreate(
    `combined-component-import-${cacheKey}`,
    () => IMPORT_REGEXES.createCombinedComponentImportRegex(componentNames),
  );
};

export const clearComponentImportRegexCache = (): void => {
  REGEX_CACHE_UTILS.clear();
};

export const getComponentImportRegexCacheStats = () => {
  const stats = REGEX_CACHE_UTILS.getStats();
  return {
    singleComponentCacheSize: stats.size, // Combined cache now
    combinedComponentCacheSize: 0, // No longer separate
    totalCacheSize: stats.size,
  };
};
