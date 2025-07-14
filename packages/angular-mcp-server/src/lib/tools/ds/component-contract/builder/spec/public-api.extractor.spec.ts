/* eslint-disable prefer-const */
import { describe, it, expect, beforeEach, vi } from 'vitest';

let createProgramMock: any;
vi.mock('typescript', () => {
  return {
    get createProgram() {
      return createProgramMock;
    },
    ScriptTarget: { Latest: 99 },
    ModuleKind: { ESNext: 99 },
  };
});

createProgramMock = vi.fn();

let extractClassDeclaration: any;
let extractPublicMethods: any;
let extractLifecycleHooks: any;
let extractImports: any;
let extractInputsAndOutputs: any;

extractClassDeclaration = vi.fn();
extractPublicMethods = vi.fn();
extractLifecycleHooks = vi.fn();
extractImports = vi.fn();
extractInputsAndOutputs = vi.fn();

vi.mock('../utils/typescript-analyzer.js', () => ({
  get extractClassDeclaration() {
    return extractClassDeclaration;
  },
  get extractPublicMethods() {
    return extractPublicMethods;
  },
  get extractLifecycleHooks() {
    return extractLifecycleHooks;
  },
  get extractImports() {
    return extractImports;
  },
  get extractInputsAndOutputs() {
    return extractInputsAndOutputs;
  },
}));

import { extractPublicApi } from '../utils/public-api.extractor.js';

type ParsedComponentStub = {
  fileName: string;
  inputs?: Record<string, any>;
  outputs?: Record<string, any>;
};

function makeParsedComponent(
  partial: Partial<ParsedComponentStub> = {},
): ParsedComponentStub {
  return {
    fileName: '/comp.ts',
    ...partial,
  } as ParsedComponentStub;
}

function resetHelperMocks() {
  extractClassDeclaration.mockReset();
  extractPublicMethods.mockReset();
  extractLifecycleHooks.mockReset();
  extractImports.mockReset();
  extractInputsAndOutputs.mockReset();
  createProgramMock.mockReset();
}

describe('extractPublicApi', () => {
  beforeEach(() => {
    resetHelperMocks();
  });

  it('maps basic inputs and outputs when no class declaration', () => {
    const parsed = makeParsedComponent({
      inputs: { foo: { type: 'string', required: true } },
      outputs: { done: { type: 'void' } },
    });

    extractClassDeclaration.mockReturnValue(undefined);

    const api = extractPublicApi(parsed as any);

    expect(api.properties.foo).toEqual({
      type: 'string',
      isInput: true,
      required: true,
    });
    expect(api.events.done).toEqual({ type: 'void' });
    expect(api.methods).toEqual({});
    expect(api.lifecycle).toEqual([]);
    expect(api.imports).toEqual([]);
  });

  it('merges TypeScript analysis results', () => {
    const parsed = makeParsedComponent();

    const classDeclStub = {};
    extractClassDeclaration.mockReturnValue(classDeclStub);

    createProgramMock.mockReturnValue({
      getSourceFile: () => ({}),
    });

    extractInputsAndOutputs.mockReturnValue({
      inputs: {
        bar: { type: 'number', required: false, alias: 'baz' },
      },
      outputs: {
        submitted: { type: 'CustomEvt', alias: 'submittedAlias' },
      },
    });

    extractPublicMethods.mockReturnValue({
      doStuff: { parameters: [], returnType: 'void' },
    });

    extractLifecycleHooks.mockReturnValue(['ngOnInit']);
    extractImports.mockReturnValue([
      { name: 'HttpClient', path: '@angular/common/http' },
    ]);

    const api = extractPublicApi(parsed as any);

    expect(api.properties.bar).toEqual(
      expect.objectContaining({
        type: 'number',
        isInput: true,
        alias: 'baz',
      }),
    );

    expect(api.events.submitted).toEqual(
      expect.objectContaining({ type: 'CustomEvt', alias: 'submittedAlias' }),
    );

    expect(api.methods).toHaveProperty('doStuff');
    expect(api.lifecycle).toEqual(['ngOnInit']);
    expect(api.imports[0]).toEqual({
      name: 'HttpClient',
      path: '@angular/common/http',
    });
  });

  it('coerces booleanAttribute transform to boolean type', () => {
    const parsed = makeParsedComponent();
    extractClassDeclaration.mockReturnValue({});
    createProgramMock.mockReturnValue({ getSourceFile: () => ({}) });
    extractInputsAndOutputs.mockReturnValue({
      inputs: {
        flag: { type: 'any', transform: 'booleanAttribute' },
      },
      outputs: {},
    });

    const api = extractPublicApi(parsed as any);
    expect(api.properties.flag.type).toBe('boolean');
  });

  it('handles signal input with defaultValue and transform', () => {
    const parsed = makeParsedComponent();
    extractClassDeclaration.mockReturnValue({});
    createProgramMock.mockReturnValue({ getSourceFile: () => ({}) });
    extractInputsAndOutputs.mockReturnValue({
      inputs: {
        count: { type: 'number', defaultValue: 0, transform: 'identity' },
      },
      outputs: {},
    });

    const api = extractPublicApi(parsed as any);

    const countProp = api.properties.count as any;
    expect(countProp.isInput).toBe(true);
    expect(countProp.defaultValue).toBe(0);
    expect(countProp.transform).toBe('identity');
    expect(countProp).not.toHaveProperty('alias');
  });
});
