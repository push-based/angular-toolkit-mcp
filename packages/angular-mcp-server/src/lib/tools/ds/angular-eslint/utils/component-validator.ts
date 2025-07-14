import { ESLint } from 'eslint';
import { Issue } from '@push-based/models';
import { resolveESLintConfig } from './config-resolver.js';
import path from 'node:path';
import {
  ValidateAngularComponentsOptions,
  ValidationResult,
} from '../models/types.js';
import { collectFiles } from './file-collector.js';
import { resolveCrossPlatformPathAndValidateWithContext } from '../../shared/utils/cross-platform-path.js';

export async function validateAngularComponents({
  directory,
  files,
  cwd = process.cwd(),
  workspaceRoot,
  configPath,
}: ValidateAngularComponentsOptions): Promise<ValidationResult> {
  const t0 = performance.now();
  const targetDir = resolveCrossPlatformPathAndValidateWithContext(
    cwd,
    directory,
    workspaceRoot,
  );
  const filePaths = await collectFiles({ targetDir, files });

  if (!filePaths.length) {
    return {
      issues: [],
      totalFiles: 0,
      executionTime: performance.now() - t0,
      configSource: 'none',
    };
  }

  const {
    config,
    source: cfgSource,
    path: cfgPath,
  } = await resolveESLintConfig({ targetDir, workspaceRoot, configPath });

  const eslint = new ESLint({
    baseConfig: config,
    cwd: targetDir,
    cache: false,
    errorOnUnmatchedPattern: false,
  });

  const results = await eslint.lintFiles(
    filePaths.map((f) => path.relative(targetDir, f)),
  );

  const issues: Issue[] = results.flatMap((r) =>
    r.messages.map((m) => ({
      severity: m.severity === 2 ? 'error' : 'warning',
      message: m.message,
      source: {
        file: r.filePath,
        position: { startLine: m.line, startColumn: m.column },
      },
    })),
  );

  return {
    issues,
    totalFiles: filePaths.length,
    executionTime: performance.now() - t0,
    configSource: cfgSource,
    configPath: cfgPath,
  };
}
