import * as fs from 'node:fs';
import * as path from 'node:path';
import { AngularMcpServerOptions } from './angular-mcp-server-options.schema';

export function validateAngularMcpServerFilesExist(
  config: AngularMcpServerOptions,
) {
  const root = config.workspaceRoot;

  if (!fs.existsSync(root)) {
    throw new Error(`workspaceRoot directory does not exist: ${root}`);
  }

  const missingFiles: string[] = [];

  const dsPaths = [
    { label: 'ds.storybookDocsRoot', relPath: config.ds.storybookDocsRoot },
    {
      label: 'ds.deprecatedCssClassesPath',
      relPath: config.ds.deprecatedCssClassesPath,
    },
    { label: 'ds.uiRoot', relPath: config.ds.uiRoot },
  ];

  for (const { label, relPath } of dsPaths) {
    const absPath = path.resolve(root, relPath);
    if (!fs.existsSync(absPath)) {
      missingFiles.push(`${label} (resolved to: ${absPath})`);
    }
  }

  if (missingFiles.length > 0) {
    throw new Error(
      `The following required files or directories do not exist:\n` +
        missingFiles.join('\n'),
    );
  }
}
