/* eslint-disable prefer-const */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

let readFileMock: any;
let mkdirMock: any;
let writeFileMock: any;
let existsSyncMock: any;
let resolveCrossPlatformPathMock: any;

vi.mock('node:fs/promises', () => ({
  get readFile() {
    return readFileMock;
  },
  get mkdir() {
    return mkdirMock;
  },
  get writeFile() {
    return writeFileMock;
  },
}));

vi.mock('node:fs', () => ({
  get existsSync() {
    return existsSyncMock;
  },
}));

vi.mock('node:crypto', () => ({
  createHash: () => ({
    update: () => ({
      digest: () => 'deadbeefdeadbeef',
    }),
  }),
}));

vi.mock('../../../shared/utils/cross-platform-path.js', () => ({
  get resolveCrossPlatformPath() {
    return resolveCrossPlatformPathMock;
  },
}));

import {
  loadContract,
  saveContract,
  generateContractSummary,
  generateDiffFileName,
} from '../utils/contract-file-ops.js';

import type { ComponentContract } from '../models/types.js';

function fixedDate(dateStr = '2024-02-10T12:00:00Z') {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(dateStr));
}

function restoreTime() {
  vi.useRealTimers();
}

const minimalContract: ComponentContract = {
  meta: {
    name: 'FooComponent',
    selector: 'app-foo',
    sourceFile: '/src/app/foo.component.ts',
    templateType: 'external',
    generatedAt: new Date().toISOString(),
    hash: 'hash',
  },
  publicApi: {
    properties: { foo: { type: 'string', isInput: true, required: true } },
    events: { done: { type: 'void' } },
    methods: {
      do: {
        name: 'do',
        parameters: [],
        returnType: 'void',
        isPublic: true,
        isStatic: false,
        isAsync: false,
      },
    },
    lifecycle: ['ngOnInit'],
    imports: [],
  },
  slots: { default: { selector: 'ng-content' } },
  dom: {
    div: {
      tag: 'div',
      parent: null,
      children: [],
      bindings: [],
      attributes: [],
      events: [],
    },
  },
  styles: {
    sourceFile: '/src/app/foo.component.scss',
    rules: { div: { appliesTo: ['div'], properties: { color: 'red' } } },
  },
};

describe('contract-file-ops', () => {
  beforeEach(() => {
    readFileMock = vi.fn();
    mkdirMock = vi.fn();
    writeFileMock = vi.fn();
    existsSyncMock = vi.fn();
    resolveCrossPlatformPathMock = vi.fn(
      (_root: string, p: string) => `${_root}/${p}`,
    );
  });

  afterEach(() => {
    restoreTime();
  });

  describe('loadContract', () => {
    it('loads wrapped contract files', async () => {
      const filePath = '/tmp/contract.json';

      existsSyncMock.mockReturnValue(true);
      readFileMock.mockResolvedValue(
        JSON.stringify({ contract: minimalContract }),
      );

      const contract = await loadContract(filePath);

      expect(readFileMock).toHaveBeenCalledWith(filePath, 'utf-8');
      expect(contract).toEqual(minimalContract);
    });

    it('throws when file is missing', async () => {
      existsSyncMock.mockReturnValue(false);

      await expect(loadContract('/missing.json')).rejects.toThrow(
        'Contract file not found',
      );
    });
  });

  describe('saveContract', () => {
    it('writes contract with metadata and returns path & hash', async () => {
      fixedDate();

      const workspaceRoot = '/workspace';
      const templatePath = 'src/app/foo.component.html';
      const scssPath = 'src/app/foo.component.scss';
      const cwd = '/cwd';

      writeFileMock.mockResolvedValue(undefined);
      mkdirMock.mockResolvedValue(undefined);

      const { contractFilePath, hash } = await saveContract(
        minimalContract,
        workspaceRoot,
        templatePath,
        scssPath,
        cwd,
      );

      // mkdir called for .cursor/tmp directory
      expect(mkdirMock).toHaveBeenCalled();
      expect(contractFilePath).toMatch(/foo\.component.*\.contract\.json$/i);
      expect(hash.startsWith('sha256-')).toBe(true);
      expect(writeFileMock).toHaveBeenCalled();
    });
  });

  describe('generateContractSummary', () => {
    it('generates human-readable summary lines', () => {
      const lines = generateContractSummary(minimalContract);
      expect(lines).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/^🎯 DOM Elements: 1/),
          expect.stringMatching(/^🎨 Style Rules: 1/),
          expect.stringMatching(/^📥 Properties: 1/),
          expect.stringMatching(/^📤 Events: 1/),
        ]),
      );
    });
  });

  describe('generateDiffFileName', () => {
    it('creates timestamped diff filename', () => {
      fixedDate();
      const before = '/contracts/foo.contract.json';
      const after = '/contracts/bar.contract.json';
      const fname = generateDiffFileName(before, after);
      expect(fname).toMatch(/^diff-foo-vs-bar-.*\.json$/);
    });
  });
});
