import type { FileViolationReport } from '../models/types.js';

export interface GroupForMarkdown {
  name: string;
  statistics: {
    fileCount: number;
    violationCount: number;
  };
  componentDistribution: Record<string, number>;
  files: Array<{
    file: string;
    violations: number;
    components: FileViolationReport['components'];
  }>;
}

/**
 * Generate markdown report for a group
 */
export function generateGroupMarkdown(group: GroupForMarkdown): string {
  // Component distribution summary
  const componentSummary = Object.entries(group.componentDistribution)
    .sort((a, b) => b[1] - a[1])
    .map(([comp, count]) => `${comp} (${count})`)
    .join(', ');

  // Directory list with file counts
  const directoryCounts = new Map<string, number>();
  group.files.forEach((file) => {
    const dir = file.file.split('/').slice(0, 2).join('/');
    directoryCounts.set(dir, (directoryCounts.get(dir) || 0) + 1);
  });

  const directoryList = Array.from(directoryCounts.entries())
    .map(([dir, count]) => `- ${dir} (${count} file${count > 1 ? 's' : ''})`)
    .join('\n');

  // File list with violations
  const fileList = group.files
    .map((file) => {
      const componentLines = file.components
        .map((comp) => {
          const lines = comp.lines.map((l) => `L${l}`).join(',');
          return `- ${comp.component}: ${lines}`;
        })
        .join('\n');

      return `\`${file.file}\` — ${file.violations} violation${file.violations > 1 ? 's' : ''}\n${componentLines}`;
    })
    .join('\n\n');

  return `# ${group.name}

## Summary
${group.statistics.fileCount} files | ${group.statistics.violationCount} violations | ${componentSummary}

## Directories
${directoryList}

## Files to Update

${fileList}
`;
}
