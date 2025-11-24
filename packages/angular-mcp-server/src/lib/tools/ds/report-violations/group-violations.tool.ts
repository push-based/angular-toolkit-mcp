import { createHandler } from '../shared/utils/handler-helpers.js';
import { toWorkspaceRelativePath } from '../shared/utils/path-helpers.js';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import type {
  AllViolationsReportByFile,
  AllViolationsReport,
  GroupViolationsOptions,
  GroupViolationsReport,
  GroupViolationsResult,
} from './models/types.js';
import { groupViolationsSchema } from './models/schema.js';
import {
  detectReportFormat,
  convertComponentToFileFormat,
  enrichFiles,
  groupByDirectory,
  determineOptimalGroups,
  createWorkGroups,
  generateGroupMarkdown,
} from './utils/index.js';

export { groupViolationsSchema };

export const groupViolationsHandler = createHandler<
  GroupViolationsOptions,
  GroupViolationsResult
>(
  groupViolationsSchema.name,
  async (params, { cwd, workspaceRoot }) => {
    const minGroups = params.minGroups ?? 3;
    const maxGroups = params.maxGroups ?? 5;
    const variance = params.variance ?? 20;

    // Read violations file
    const inputPath = join(
      cwd,
      'tmp',
      '.angular-toolkit-mcp',
      'violations-report',
      params.fileName,
    );

    let rawData: any;
    try {
      const fileContent = await readFile(inputPath, 'utf-8');
      rawData = JSON.parse(fileContent);
    } catch (error) {
      throw new Error(
        `Failed to read violations file at ${inputPath}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    // Detect format and convert if necessary
    const format = detectReportFormat(rawData);
    
    if (format === 'unknown') {
      throw new Error(
        'Invalid violations report format. Expected either { files: [...] } or { components: [...] }',
      );
    }

    let violationsData: AllViolationsReportByFile;
    
    if (format === 'component') {
      // Convert component-grouped to file-grouped format
      violationsData = convertComponentToFileFormat(rawData as AllViolationsReport);
    } else {
      violationsData = rawData as AllViolationsReportByFile;
    }

    if (!violationsData.files || violationsData.files.length === 0) {
      throw new Error('No violations found in the input file');
    }

    // Enrich files with metadata
    const enrichedFiles = enrichFiles(violationsData.files);
    const totalViolations = enrichedFiles.reduce(
      (sum, f) => sum + f.violations,
      0,
    );
    const totalFiles = enrichedFiles.length;

    // Group by directory
    const directorySummary = groupByDirectory(enrichedFiles);

    // Determine optimal number of groups
    const optimalGroups = determineOptimalGroups(
      totalViolations,
      directorySummary,
      minGroups,
      maxGroups,
      variance,
    );

    const targetPerGroup = totalViolations / optimalGroups;
    const minAcceptable = Math.floor(
      targetPerGroup * (1 - variance / 100),
    );
    const maxAcceptable = Math.ceil(
      targetPerGroup * (1 + variance / 100),
    );

    // Create work groups
    const groups = createWorkGroups(
      directorySummary,
      optimalGroups,
      maxAcceptable,
    );

    // Validation
    const totalGroupViolations = groups.reduce(
      (sum, g) => sum + g.violations,
      0,
    );
    const allFilesInGroups = groups.flatMap((g) => g.files.map((f) => f.file));
    const uniqueFiles = new Set(allFilesInGroups);
    const pathExclusivity = uniqueFiles.size === allFilesInGroups.length;
    const balanced = groups.every(
      (g) => g.violations >= minAcceptable && g.violations <= maxAcceptable,
    );

    // Create output structure
    const report: GroupViolationsReport = {
      metadata: {
        generatedAt: new Date().toISOString(),
        inputFile: params.fileName,
        totalFiles,
        totalViolations,
        groupCount: optimalGroups,
        targetPerGroup,
        acceptableRange: { min: minAcceptable, max: maxAcceptable },
        variance,
      },
      groups: groups.map((g) => ({
        id: g.id,
        name: g.name,
        directories: g.directories,
        files: g.files.map((f) => ({
          file: f.file,
          violations: f.violations,
          components: f.components,
        })),
        statistics: {
          fileCount: g.files.length,
          violationCount: g.violations,
        },
        componentDistribution: g.componentDistribution,
      })),
      validation: {
        totalViolations: totalGroupViolations,
        totalFiles: allFilesInGroups.length,
        uniqueFiles: uniqueFiles.size,
        pathExclusivity,
        balanced,
      },
    };

    // Save each group as individual file
    const reportName = params.fileName.replace('.json', '');
    const outputDir = join(
      cwd,
      'tmp',
      '.angular-toolkit-mcp',
      'violation-groups',
      reportName,
    );

    await mkdir(outputDir, { recursive: true });

    // Save metadata file
    const metadataPath = join(outputDir, 'metadata.json');
    await writeFile(
      metadataPath,
      JSON.stringify(
        {
          metadata: report.metadata,
          validation: report.validation,
        },
        null,
        2,
      ),
      'utf-8',
    );

    // Save each group as separate file (JSON + Markdown)
    for (const group of report.groups) {
      // Save JSON
      const groupPath = join(outputDir, `group-${group.id}.json`);
      await writeFile(groupPath, JSON.stringify(group, null, 2), 'utf-8');

      // Save Markdown report
      const markdownPath = join(outputDir, `group-${group.id}.md`);
      const markdown = generateGroupMarkdown(group);
      await writeFile(markdownPath, markdown, 'utf-8');
    }

    return {
      ...report,
      outputDir: toWorkspaceRelativePath(outputDir, workspaceRoot),
    };
  },
  (result) => {
    const { metadata, groups, validation, outputDir } = result;

    const message = [
      `✅ Created ${metadata.groupCount} work distribution groups`,
      '',
      `📊 Summary:`,
      `  - Total files: ${metadata.totalFiles}`,
      `  - Total violations: ${metadata.totalViolations}`,
      `  - Target per group: ${metadata.targetPerGroup.toFixed(1)} violations`,
      `  - Acceptable range: ${metadata.acceptableRange.min}-${metadata.acceptableRange.max}`,
      '',
      `📦 Groups:`,
      ...groups.map(
        (g) =>
          `  ${g.name} - ${g.statistics.violationCount} violations (${g.statistics.fileCount} files)`,
      ),
      '',
      `✅ Validation:`,
      `  - Total violations: ${validation.totalViolations} ${validation.totalViolations === metadata.totalViolations ? '✅' : '❌'}`,
      `  - Path exclusivity: ${validation.pathExclusivity ? '✅' : '❌'}`,
      `  - Balance: ${validation.balanced ? '✅' : '⚠️'}`,
      '',
      `📁 Output directory: ${outputDir}`,
      `  - metadata.json (summary and validation)`,
      ...groups.map((g) => `  - group-${g.id}.json + group-${g.id}.md`),
    ];

    return message;
  },
);

export const groupViolationsTools = [
  {
    schema: groupViolationsSchema,
    handler: groupViolationsHandler,
  },
];
