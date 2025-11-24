import type { EnrichedFile } from './file-enrichment.utils.js';

export interface DirectorySummary {
  directory: string;
  files: EnrichedFile[];
  fileCount: number;
  violations: number;
}

/**
 * Group files by directory hierarchy
 */
export function groupByDirectory(files: EnrichedFile[]): DirectorySummary[] {
  const directoryMap = new Map<string, EnrichedFile[]>();

  files.forEach((file) => {
    const dir = file.subdirectory || file.directory;
    if (!directoryMap.has(dir)) {
      directoryMap.set(dir, []);
    }
    directoryMap.get(dir)!.push(file);
  });

  return Array.from(directoryMap.entries())
    .map(([directory, dirFiles]) => ({
      directory,
      files: dirFiles,
      fileCount: dirFiles.length,
      violations: dirFiles.reduce((sum, f) => sum + f.violations, 0),
    }))
    .sort((a, b) => b.violations - a.violations);
}

/**
 * Determine optimal number of groups
 */
export function determineOptimalGroups(
  totalViolations: number,
  directorySummary: DirectorySummary[],
  minGroups: number,
  maxGroups: number,
  variance: number,
): number {
  for (let g = minGroups; g <= maxGroups; g++) {
    const target = totalViolations / g;
    const maxAcceptable = target * (1 + variance / 100);

    const canBalance = directorySummary.every(
      (dir) => dir.violations <= maxAcceptable,
    );
    if (canBalance) {
      return g;
    }
  }
  return minGroups;
}
