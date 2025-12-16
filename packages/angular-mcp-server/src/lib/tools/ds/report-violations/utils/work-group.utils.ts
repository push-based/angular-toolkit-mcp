import type {
  DirectorySummary,
  EnrichedFile,
  ReportGroup,
  WorkGroup,
} from './types.js';

/**
 * Map a WorkGroup to the report group format
 */
export function mapWorkGroupToReportGroup(
  group: WorkGroup,
  rootPath: string,
): ReportGroup {
  return {
    id: group.id,
    name: group.name,
    rootPath,
    directories: group.directories,
    files: group.files.map((f) => ({
      file: f.file,
      violations: f.violations,
      components: f.components,
    })),
    statistics: {
      fileCount: group.files.length,
      violationCount: group.violations,
    },
    componentDistribution: group.componentDistribution,
  };
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
  return files.reduce<Record<string, number>>((distribution, file) => {
    return file.components.reduce((dist, comp) => {
      dist[comp.component] = (dist[comp.component] || 0) + comp.lines.length;
      return dist;
    }, distribution);
  }, {});
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
