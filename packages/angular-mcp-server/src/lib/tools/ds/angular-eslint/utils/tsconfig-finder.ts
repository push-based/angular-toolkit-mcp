import { resolveFile } from '@push-based/utils';
import * as path from 'node:path';

export async function findTsConfig(dir: string): Promise<string> {
  let currentDir: string | undefined = dir;

  while (currentDir && currentDir !== path.parse(currentDir).root) {
    const tsConfigPath = path.join(currentDir, 'tsconfig.json');

    try {
      await resolveFile(tsConfigPath);
      return tsConfigPath;
    } catch {
      currentDir = path.dirname(currentDir);
    }
  }

  return path.join(dir, 'tsconfig.json');
}
