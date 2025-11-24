import type { EnrichedFile } from './file-enrichment.utils.js';
import type { DirectorySummary } from './directory-grouping.utils.js';

export interface WorkGroup {
  id: number;
  name: string;
  directories: string[];
  files: EnrichedFile[];
  violations: number;
  componentDistribution: Record<string, number>;
}

/**
 * Assign group name based on primary directory
 */
export function assignGroupName(
  directories: string[],
  groupId: number,
): string {
  const primaryDir = directories[0] || 'misc';
  return `Group ${groupId} - ${primaryDir}`;
}

/**
 * Calculate component distribution for a group
 */
export function calculateComponentDistribution(
  files: EnrichedFile[],
): Record<string, number> {
  const distribution: Record<string, number> = {};

  files.forEach((file) => {
    file.components.forEach((comp) => {
      if (!distribution[comp.component]) {
        distribution[comp.component] = 0;
      }
      distribution[comp.component] += comp.lines.length;
    });
  });

  return distribution;
}

/**
 * Create work groups using bin-packing algorithm
 */
export function createWorkGroups(
  directorySummary: DirectorySummary[],
  optimalGroups: number,
  maxAcceptable: number,
): WorkGroup[] {
  const groups: WorkGroup[] = Array.from({ length: optimalGroups }, (_, i) => ({
    id: i + 1,
    name: '',
    directories: [],
    files: [],
    violations: 0,
    componentDistribution: {},
  }));

  // Bin packing: first-fit decreasing
  const sortedDirs = [...directorySummary].sort(
    (a, b) => b.violations - a.violations,
  );

  sortedDirs.forEach((dir) => {
    // Find group with least violations that can fit this directory
    const targetGroup = groups
      .filter((g) => g.violations + dir.violations <= maxAcceptable)
      .sort((a, b) => a.violations - b.violations)[0];

    const selectedGroup =
      targetGroup || groups.sort((a, b) => a.violations - b.violations)[0];

    selectedGroup.directories.push(dir.directory);
    selectedGroup.files.push(...dir.files);
    selectedGroup.violations += dir.violations;
  });

  // Assign names and component distribution
  groups.forEach((group) => {
    group.name = assignGroupName(group.directories, group.id);
    group.componentDistribution = calculateComponentDistribution(group.files);
  });

  return groups;
}
