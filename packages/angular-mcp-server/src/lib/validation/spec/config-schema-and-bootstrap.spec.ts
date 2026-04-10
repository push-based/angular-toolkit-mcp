/* eslint-disable prefer-const */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

let existsSyncMock: any;
let statSyncMock: any;

vi.mock('node:fs', () => ({
  get existsSync() {
    return existsSyncMock;
  },
  get statSync() {
    return statSyncMock;
  },
}));

import {
  AngularMcpServerOptionsSchema,
  TokensConfigSchema,
} from '../angular-mcp-server-options.schema.js';
import { validateAngularMcpServerFilesExist } from '../file-existence.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Minimal valid config that satisfies the existing schema (no new fields). */
function baseConfig(overrides: Record<string, unknown> = {}) {
  return {
    workspaceRoot: '/workspace',
    ds: {
      uiRoot: 'packages/ui',
      ...overrides,
    },
  };
}

/** Build a full parsed config object for bootstrap validation tests. */
function parsedConfig(dsOverrides: Record<string, unknown> = {}) {
  const raw = baseConfig(dsOverrides);
  return AngularMcpServerOptionsSchema.parse(raw);
}

// ---------------------------------------------------------------------------
// Unit Tests — Config Schema
// ---------------------------------------------------------------------------

describe('AngularMcpServerOptionsSchema', () => {
  // ---- Backward compatibility (Req 11.1) ----
  describe('backward compatibility', () => {
    it('accepts existing config without any new fields', () => {
      const result = AngularMcpServerOptionsSchema.safeParse(baseConfig());
      expect(result.success).toBe(true);
    });

    it('accepts config with optional storybookDocsRoot and deprecatedCssClassesPath', () => {
      const result = AngularMcpServerOptionsSchema.safeParse(
        baseConfig({
          storybookDocsRoot: 'docs/storybook',
          deprecatedCssClassesPath: 'config/deprecated.js',
        }),
      );
      expect(result.success).toBe(true);
    });
  });

  // ---- generatedStylesRoot path validation (Req 1.1, 1.2) ----
  describe('ds.generatedStylesRoot', () => {
    it('accepts a relative path', () => {
      const result = AngularMcpServerOptionsSchema.safeParse(
        baseConfig({ generatedStylesRoot: 'dist/styles' }),
      );
      expect(result.success).toBe(true);
    });

    it('accepts undefined (field is optional)', () => {
      const result = AngularMcpServerOptionsSchema.safeParse(baseConfig());
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.ds.generatedStylesRoot).toBeUndefined();
      }
    });

    it('rejects an absolute path', () => {
      const result = AngularMcpServerOptionsSchema.safeParse(
        baseConfig({ generatedStylesRoot: '/absolute/path' }),
      );
      expect(result.success).toBe(false);
    });
  });

  // ---- TokensConfigSchema defaults (Req 2.1–2.10) ----
  describe('ds.tokens defaults', () => {
    it('defaults the entire tokens block when not provided', () => {
      const result = AngularMcpServerOptionsSchema.parse(baseConfig());
      expect(result.ds.tokens).toBeDefined();
    });

    it('defaults filePattern to **/semantic.css', () => {
      const result = AngularMcpServerOptionsSchema.parse(baseConfig());
      expect(result.ds.tokens.filePattern).toBe('**/semantic.css');
    });

    it('defaults propertyPrefix to null', () => {
      const result = AngularMcpServerOptionsSchema.parse(baseConfig());
      expect(result.ds.tokens.propertyPrefix).toBeNull();
    });

    it('defaults directoryStrategy to flat', () => {
      const result = AngularMcpServerOptionsSchema.parse(baseConfig());
      expect(result.ds.tokens.directoryStrategy).toBe('flat');
    });

    it('defaults categoryInference to by-prefix', () => {
      const result = AngularMcpServerOptionsSchema.parse(baseConfig());
      expect(result.ds.tokens.categoryInference).toBe('by-prefix');
    });

    it('defaults categoryPrefixMap with all expected entries', () => {
      const result = AngularMcpServerOptionsSchema.parse(baseConfig());
      const map = result.ds.tokens.categoryPrefixMap;
      expect(map).toEqual({
        color: '--semantic-color',
        spacing: '--semantic-spacing',
        radius: '--semantic-radius',
        typography: '--semantic-typography',
        size: '--semantic-size',
        opacity: '--semantic-opacity',
      });
    });

    it('defaults componentTokenPrefix to --ds-', () => {
      const result = AngularMcpServerOptionsSchema.parse(baseConfig());
      expect(result.ds.tokens.componentTokenPrefix).toBe('--ds-');
    });
  });

  // ---- directoryStrategy enum validation (Req 2.6) ----
  describe('ds.tokens.directoryStrategy enum', () => {
    it.each(['flat', 'brand-theme', 'auto'] as const)(
      'accepts valid value: %s',
      (strategy) => {
        const result = AngularMcpServerOptionsSchema.safeParse(
          baseConfig({ tokens: { directoryStrategy: strategy } }),
        );
        expect(result.success).toBe(true);
      },
    );

    it.each(['invalid', 'FLAT', 'brandTheme', ''])(
      'rejects invalid value: %s',
      (strategy) => {
        const result = AngularMcpServerOptionsSchema.safeParse(
          baseConfig({ tokens: { directoryStrategy: strategy } }),
        );
        expect(result.success).toBe(false);
      },
    );
  });

  // ---- categoryInference enum validation (Req 2.8) ----
  describe('ds.tokens.categoryInference enum', () => {
    it.each(['by-prefix', 'by-value', 'none'] as const)(
      'accepts valid value: %s',
      (inference) => {
        const result = AngularMcpServerOptionsSchema.safeParse(
          baseConfig({ tokens: { categoryInference: inference } }),
        );
        expect(result.success).toBe(true);
      },
    );

    it.each(['invalid', 'BY-PREFIX', 'byValue', ''])(
      'rejects invalid value: %s',
      (inference) => {
        const result = AngularMcpServerOptionsSchema.safeParse(
          baseConfig({ tokens: { categoryInference: inference } }),
        );
        expect(result.success).toBe(false);
      },
    );
  });
});

// ---------------------------------------------------------------------------
// Unit Tests — Bootstrap Validation (file-existence.ts)
// ---------------------------------------------------------------------------

describe('validateAngularMcpServerFilesExist — generatedStylesRoot', () => {
  beforeEach(() => {
    existsSyncMock = vi.fn().mockReturnValue(true);
    statSyncMock = vi.fn().mockReturnValue({ isDirectory: () => true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('passes through config when generatedStylesRoot is not provided', () => {
    const config = parsedConfig();
    const result = validateAngularMcpServerFilesExist(config);
    expect(result.ds.generatedStylesRoot).toBeUndefined();
  });

  it('keeps generatedStylesRoot when path exists and is a directory', () => {
    const config = parsedConfig({ generatedStylesRoot: 'dist/styles' });
    const result = validateAngularMcpServerFilesExist(config);
    expect(result.ds.generatedStylesRoot).toBe('dist/styles');
  });

  it('sets generatedStylesRoot to undefined and warns when path does not exist', () => {
    statSyncMock = vi.fn((p: string) => {
      // workspace root exists, but the generatedStylesRoot does not
      if (typeof p === 'string' && p.includes('dist/styles')) {
        throw new Error('ENOENT: no such file or directory');
      }
      return { isDirectory: () => true };
    });

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const config = parsedConfig({ generatedStylesRoot: 'dist/styles' });
    const result = validateAngularMcpServerFilesExist(config);

    expect(result.ds.generatedStylesRoot).toBeUndefined();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('does not exist or is not a directory'),
    );
    warnSpy.mockRestore();
  });

  it('sets generatedStylesRoot to undefined when path exists but is not a directory', () => {
    statSyncMock = vi.fn().mockReturnValue({ isDirectory: () => false });

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const config = parsedConfig({ generatedStylesRoot: 'dist/styles' });
    const result = validateAngularMcpServerFilesExist(config);

    expect(result.ds.generatedStylesRoot).toBeUndefined();
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// Property-Based Tests (parameterised)
// ---------------------------------------------------------------------------

/**
 * **Validates: Requirements 1.1, 1.2**
 * Property 1: Config schema accepts relative paths and rejects absolute paths
 */
describe('Property 1: generatedStylesRoot path validation', () => {
  const relativePaths = [
    'dist/styles',
    'packages/ui/generated',
    './relative/path',
    'single-segment',
    'a/b/c/d/e',
    'path with spaces/child',
    '../parent-relative',
  ];

  const absolutePaths = ['/absolute/path', '/usr/local/styles', '/a', '/root'];

  it.each(relativePaths)('accepts relative path: %s', (relPath) => {
    const result = AngularMcpServerOptionsSchema.safeParse(
      baseConfig({ generatedStylesRoot: relPath }),
    );
    expect(result.success).toBe(true);
  });

  it.each(absolutePaths)('rejects absolute path: %s', (absPath) => {
    const result = AngularMcpServerOptionsSchema.safeParse(
      baseConfig({ generatedStylesRoot: absPath }),
    );
    expect(result.success).toBe(false);
  });
});

/**
 * **Validates: Requirements 2.6**
 * Property 2: Config schema validates directoryStrategy enum
 */
describe('Property 2: directoryStrategy enum validation', () => {
  const validValues = ['flat', 'brand-theme', 'auto'];
  const invalidValues = [
    'invalid',
    'FLAT',
    'Brand-Theme',
    'AUTO',
    'none',
    'custom',
    '',
    'flat ',
    ' auto',
    'brand_theme',
    'brandTheme',
  ];

  it.each(validValues)('accepts valid directoryStrategy: %s', (value) => {
    const result = TokensConfigSchema.safeParse({ directoryStrategy: value });
    expect(result.success).toBe(true);
  });

  it.each(invalidValues)('rejects invalid directoryStrategy: %s', (value) => {
    const result = TokensConfigSchema.safeParse({ directoryStrategy: value });
    expect(result.success).toBe(false);
  });
});

/**
 * **Validates: Requirements 2.8**
 * Property 3: Config schema validates categoryInference enum
 */
describe('Property 3: categoryInference enum validation', () => {
  const validValues = ['by-prefix', 'by-value', 'none'];
  const invalidValues = [
    'invalid',
    'BY-PREFIX',
    'By-Value',
    'NONE',
    'flat',
    'custom',
    '',
    'by_prefix',
    'byPrefix',
    'by-prefix ',
    ' none',
  ];

  it.each(validValues)('accepts valid categoryInference: %s', (value) => {
    const result = TokensConfigSchema.safeParse({ categoryInference: value });
    expect(result.success).toBe(true);
  });

  it.each(invalidValues)('rejects invalid categoryInference: %s', (value) => {
    const result = TokensConfigSchema.safeParse({ categoryInference: value });
    expect(result.success).toBe(false);
  });
});

/**
 * **Validates: Requirements 11.1**
 * Property 21: Backward-compatible config parsing
 */
describe('Property 21: Backward-compatible config parsing', () => {
  const existingConfigs = [
    {
      label: 'minimal config (only required fields)',
      config: {
        workspaceRoot: '/workspace',
        ds: { uiRoot: 'packages/ui' },
      },
    },
    {
      label: 'config with storybookDocsRoot',
      config: {
        workspaceRoot: '/workspace',
        ds: {
          uiRoot: 'packages/ui',
          storybookDocsRoot: 'docs/storybook',
        },
      },
    },
    {
      label: 'config with deprecatedCssClassesPath',
      config: {
        workspaceRoot: '/workspace',
        ds: {
          uiRoot: 'packages/ui',
          deprecatedCssClassesPath: 'config/deprecated.js',
        },
      },
    },
    {
      label: 'config with all existing optional fields',
      config: {
        workspaceRoot: '/workspace',
        ds: {
          uiRoot: 'packages/ui',
          storybookDocsRoot: 'docs/storybook',
          deprecatedCssClassesPath: 'config/deprecated.js',
        },
      },
    },
  ];

  it.each(existingConfigs)('parses successfully: $label', ({ config }) => {
    const result = AngularMcpServerOptionsSchema.safeParse(config);
    expect(result.success).toBe(true);
  });

  it.each(existingConfigs)(
    'produces valid defaults for new fields: $label',
    ({ config }) => {
      const parsed = AngularMcpServerOptionsSchema.parse(config);
      // generatedStylesRoot should be undefined (not provided)
      expect(parsed.ds.generatedStylesRoot).toBeUndefined();
      // tokens block should have all defaults
      expect(parsed.ds.tokens).toBeDefined();
      expect(parsed.ds.tokens.filePattern).toBe('**/semantic.css');
      expect(parsed.ds.tokens.propertyPrefix).toBeNull();
      expect(parsed.ds.tokens.directoryStrategy).toBe('flat');
      expect(parsed.ds.tokens.categoryInference).toBe('by-prefix');
      expect(parsed.ds.tokens.componentTokenPrefix).toBe('--ds-');
    },
  );
});
