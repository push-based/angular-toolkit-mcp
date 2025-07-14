import * as ts from 'typescript';
import type { PublicApi } from '../../shared/models/types.js';
import {
  extractClassDeclaration,
  extractPublicMethods,
  extractLifecycleHooks,
  extractImports,
  extractInputsAndOutputs,
} from './typescript-analyzer.js';
import { ParsedComponent } from '@push-based/angular-ast-utils';

type InputMeta = {
  type?: string;
  required?: boolean;
  transform?: string;
};

type OutputMeta = {
  type?: string;
};

/**
 * `ParsedComponent` provided by `angular-ast-utils` does not yet expose
 * `inputs` / `outputs`.  We extend it locally in a non-breaking fashion
 * (both properties remain optional).
 */
type ParsedComponentWithIO = ParsedComponent & {
  inputs?: Record<string, InputMeta>;
  outputs?: Record<string, OutputMeta>;
};

/**
 * Extract Public API from TypeScript class analysis
 */
export function extractPublicApi(
  parsedComponent: ParsedComponentWithIO,
): PublicApi {
  const publicApi: PublicApi = {
    properties: {},
    events: {},
    methods: {},
    lifecycle: [],
    imports: [],
  };

  if (parsedComponent.inputs) {
    for (const [name, config] of Object.entries(
      parsedComponent.inputs as Record<string, InputMeta>,
    )) {
      publicApi.properties[name] = {
        type: config?.type ?? 'any',
        isInput: true,
        required: config?.required ?? false,
        transform: config?.transform,
      };
    }
  }

  if (parsedComponent.outputs) {
    for (const [name, config] of Object.entries(
      parsedComponent.outputs as Record<string, OutputMeta>,
    )) {
      publicApi.events[name] = {
        type: config?.type ?? 'EventEmitter<any>',
      };
    }
  }

  const classDeclaration = extractClassDeclaration(parsedComponent);
  if (classDeclaration) {
    const program = ts.createProgram([parsedComponent.fileName], {
      target: ts.ScriptTarget.Latest,
      module: ts.ModuleKind.ESNext,
      experimentalDecorators: true,
    });
    const sourceFile = program.getSourceFile(parsedComponent.fileName);

    if (sourceFile) {
      const { inputs: allInputs, outputs: allOutputs } =
        extractInputsAndOutputs(classDeclaration, sourceFile);

      for (const [name, config] of Object.entries(allInputs)) {
        const isSignalInput = 'defaultValue' in config || 'transform' in config;

        publicApi.properties[name] = {
          type: config.type ?? 'any',
          isInput: true,
          required: config.required ?? false,
          ...(isSignalInput && {
            transform: (config as any).transform,
            defaultValue: (config as any).defaultValue,
          }),
          ...(!isSignalInput && {
            alias: (config as any).alias,
          }),
        };

        const propRef = publicApi.properties[name] as any;
        if (
          propRef.transform === 'booleanAttribute' &&
          propRef.type === 'any'
        ) {
          propRef.type = 'boolean';
        }
      }

      for (const [name, config] of Object.entries(allOutputs)) {
        publicApi.events[name] = {
          type: config.type ?? 'EventEmitter<any>',
          ...('alias' in config && { alias: config.alias }),
        };
      }

      publicApi.methods = extractPublicMethods(classDeclaration, sourceFile);
      publicApi.lifecycle = extractLifecycleHooks(classDeclaration);
      publicApi.imports = extractImports(sourceFile);
    }
  }

  return publicApi;
}
