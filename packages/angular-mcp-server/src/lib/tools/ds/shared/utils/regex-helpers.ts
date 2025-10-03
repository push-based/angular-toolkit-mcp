/**
 * Shared regex utilities for DS tools
 * Consolidates regex patterns used across multiple tools to avoid duplication
 */

// CSS Processing Regexes
export const CSS_REGEXES = {
  /**
   * Escapes special regex characters in a string for safe use in regex patterns
   */
  escape: (str: string): string => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),

  /**
   * Creates a regex to match CSS classes from a list of class names
   */
  createClassMatcher: (classNames: string[]): RegExp =>
    new RegExp(
      `\\.(${classNames.map(CSS_REGEXES.escape).join('|')})(?![\\w-])`,
      'g',
    ),

  /**
   * Style file extensions
   */
  STYLE_EXTENSIONS: /\.(css|scss|sass|less)$/i,
} as const;

// Path Processing Regexes
export const PATH_REGEXES = {
  /**
   * Normalizes file paths to use forward slashes
   */
  normalizeToUnix: (path: string): string => path.replace(/\\/g, '/'),

  /**
   * Removes directory prefix from file paths
   */
  removeDirectoryPrefix: (filePath: string, directory: string): string => {
    const normalizedFilePath = PATH_REGEXES.normalizeToUnix(filePath);
    const normalizedDirectory = PATH_REGEXES.normalizeToUnix(directory);
    const directoryPrefix = normalizedDirectory.endsWith('/')
      ? normalizedDirectory
      : normalizedDirectory + '/';

    return normalizedFilePath.startsWith(directoryPrefix)
      ? normalizedFilePath.replace(directoryPrefix, '')
      : normalizedFilePath;
  },
} as const;

// Component Name Processing Regexes
export const COMPONENT_REGEXES = {
  /**
   * Converts DS component name to kebab-case
   */
  toKebabCase: (componentName: string): string =>
    componentName
      .replace(/^Ds/, '')
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .toLowerCase(),

  /**
   * Validates DS component name format (accepts both "DsButton" and "Button" formats)
   */
  isValidDsComponent: (name: string): boolean =>
    /^(Ds)?[A-Z][a-zA-Z0-9]*$/.test(name),

  /**
   * Extracts component name from coverage titles
   */
  extractFromCoverageTitle: (title: string): string | null => {
    const match = title.match(/Usage coverage for (\w+) component/);
    return match ? match[1] : null;
  },
} as const;

// Import/Dependency Processing Regexes (from component-usage-graph)
export const IMPORT_REGEXES = {
  ES6_IMPORT:
    /import\s+(?:(?:[\w\s{},*]+\s+from\s+)?['"`]([^'"`]+)['"`]|['"`]([^'"`]+)['"`])/g,
  COMMONJS_REQUIRE: /require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
  DYNAMIC_IMPORT: /import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
  CSS_IMPORT: /@import\s+['"`]([^'"`]+)['"`]/g,
  CSS_URL: /url\s*\(\s*['"`]?([^'"`)]+)['"`]?\s*\)/g,
  ANGULAR_COMPONENT_DECORATOR: /@Component/,

  /**
   * Creates cached regex for component imports
   */
  createComponentImportRegex: (componentName: string): RegExp =>
    new RegExp(`import[\\s\\S]*?\\b${componentName}\\b[\\s\\S]*?from`, 'gm'),

  /**
   * Creates combined regex for multiple component imports
   */
  createCombinedComponentImportRegex: (componentNames: string[]): RegExp =>
    new RegExp(
      `import[\\s\\S]*?\\b(${componentNames.join('|')})\\b[\\s\\S]*?from`,
      'gm',
    ),
} as const;

// Regex Cache Management
const REGEX_CACHE = new Map<string, RegExp>();

export const REGEX_CACHE_UTILS = {
  /**
   * Gets or creates a cached regex
   */
  getOrCreate: (key: string, factory: () => RegExp): RegExp => {
    let regex = REGEX_CACHE.get(key);
    if (!regex) {
      regex = factory();
      REGEX_CACHE.set(key, regex);
    }
    regex.lastIndex = 0; // Reset for consistent behavior
    return regex;
  },

  /**
   * Clears the regex cache
   */
  clear: (): void => REGEX_CACHE.clear(),

  /**
   * Gets cache statistics
   */
  getStats: () => ({ size: REGEX_CACHE.size }),
} as const;
