import { createHandler } from '../shared/utils/handler-helpers.js';
import { normalizeAbsolutePathToRelative } from '../shared/utils/cross-platform-path.js';
import { DEFAULT_OUTPUT_BASE, OUTPUT_SUBDIRS } from '../shared/constants.js';
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
  mapWorkGroupToReportGroup,
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

    const inputPath = join(
      cwd,
      DEFAULT_OUTPUT_BASE,
      OUTPUT_SUBDIRS.VIOLATIONS_REPORT,
      params.fileName,
    );

    let rawData: any;
    try {
      const fileContent = await readFile(inputPath, 'utf-8');
      rawData = JSON.parse(fileContent);
    } catch (ctx) {
      throw new Error(
        `Failed to read violations file at ${inputPath}: ${ctx instanceof Error ? ctx.message : String(ctx)}`,
      );
    }

    const format = detectReportFormat(rawData);

    if (format === 'unknown') {
      throw new Error(
        'Invalid violations report format. Expected either { files: [...] } or { components: [...] }',
      );
    }

    let violationsData: AllViolationsReportByFile;

    if (format === 'component') {
      // Convert component-grouped to file-grouped format
      violationsData = convertComponentToFileFormat(
        rawData as AllViolationsReport,
      );
    } else {
      violationsData = rawData as AllViolationsReportByFile;
    }

    if (!violationsData.files || violationsData.files.length === 0) {
      throw new Error('No violations found in the input file');
    }

    const rootPath = violationsData.rootPath || '';

    const enrichedFiles = enrichFiles(violationsData.files);
    const totalViolations = enrichedFiles.reduce(
      (sum, f) => sum + f.violations,
      0,
    );
    const totalFiles = enrichedFiles.length;

    const directorySummary = groupByDirectory(enrichedFiles);

    const optimalGroups = determineOptimalGroups(
      totalViolations,
      directorySummary,
      minGroups,
      maxGroups,
      variance,
    );

    const targetPerGroup = totalViolations / optimalGroups;
    const minAcceptable = Math.floor(targetPerGroup * (1 - variance / 100));
    const maxAcceptable = Math.ceil(targetPerGroup * (1 + variance / 100));

    const groups = createWorkGroups(
      directorySummary,
      optimalGroups,
      maxAcceptable,
    );

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

    const report: GroupViolationsReport = {
      metadata: {
        generatedAt: new Date().toISOString(),
        inputFile: params.fileName,
        rootPath,
        totalFiles,
        totalViolations,
        groupCount: optimalGroups,
        targetPerGroup,
        acceptableRange: { min: minAcceptable, max: maxAcceptable },
        variance,
      },
      groups: groups.map((g) => mapWorkGroupToReportGroup(g, rootPath)),
      validation: {
        totalViolations: totalGroupViolations,
        totalFiles: allFilesInGroups.length,
        uniqueFiles: uniqueFiles.size,
        pathExclusivity,
        balanced,
      },
    };

    const reportName = params.fileName.replace('.json', '');
    const outputDir = join(
      cwd,
      DEFAULT_OUTPUT_BASE,
      OUTPUT_SUBDIRS.VIOLATION_GROUPS,
      reportName,
    );

    await mkdir(outputDir, { recursive: true });

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

    for (const group of report.groups) {
      const groupPath = join(outputDir, `group-${group.id}.json`);
      await writeFile(groupPath, JSON.stringify(group, null, 2), 'utf-8');

      const markdownPath = join(outputDir, `group-${group.id}.md`);
      const markdown = generateGroupMarkdown(group);
      await writeFile(markdownPath, markdown, 'utf-8');
    }

    return {
      ...report,
      outputDir: normalizeAbsolutePathToRelative(outputDir, workspaceRoot),
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
