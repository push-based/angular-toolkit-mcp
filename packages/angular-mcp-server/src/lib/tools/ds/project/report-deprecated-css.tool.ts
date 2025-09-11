import { ToolSchemaOptions } from '@push-based/models';
import * as path from 'node:path';
import {
  createHandler,
  BaseHandlerOptions,
  RESULT_FORMATTERS,
} from '../shared/utils/handler-helpers.js';
import {
  createDirectoryComponentSchema,
  COMMON_ANNOTATIONS,
} from '../shared/models/schema-helpers.js';
import { getDeprecatedCssClasses } from '../component/utils/deprecated-css-helpers.js';
import {
  findStyleFiles,
  analyzeStyleFile,
} from './utils/styles-report-helpers.js';
import { resolveCrossPlatformPath } from '../shared/utils/cross-platform-path.js';

interface ReportDeprecatedCssOptions extends BaseHandlerOptions {
  directory: string;
  componentName: string;
  deprecatedCssClassesPath?: string;
}

export const reportDeprecatedCssSchema: ToolSchemaOptions = {
  name: 'report-deprecated-css',
  description: `Report deprecated CSS classes found in styling files in a directory.`,
  inputSchema: createDirectoryComponentSchema(
    'The class name of the component to get deprecated classes for (e.g., DsButton)',
  ),
  annotations: {
    title: 'Report Deprecated CSS',
    ...COMMON_ANNOTATIONS.readOnly,
  },
};

export const reportDeprecatedCssHandler = createHandler<
  ReportDeprecatedCssOptions,
  string[]
>(
  reportDeprecatedCssSchema.name,
  async (params, { cwd, deprecatedCssClassesPath }) => {
    const { directory, componentName } = params;

    if (!deprecatedCssClassesPath) {
      throw new Error(
        'Missing ds.deprecatedCssClassesPath. Provide --ds.deprecatedCssClassesPath in mcp.json file.',
      );
    }

    const deprecated = getDeprecatedCssClasses(
      componentName,
      deprecatedCssClassesPath,
      cwd,
    );

    if (!deprecated.length) {
      return [`No deprecated CSS classes defined for ${componentName}`];
    }

    const styleFiles = await findStyleFiles(
      resolveCrossPlatformPath(cwd, directory),
    );

    if (!styleFiles.length) {
      return [`No styling files found in ${directory}`];
    }

    const results = await Promise.all(
      styleFiles.map((f) => analyzeStyleFile(f, deprecated)),
    );

    const violations: string[] = [];

    for (const { filePath, foundClasses } of results) {
      if (!foundClasses.length) continue;

      const relativePath = path.relative(cwd, filePath);

      for (const { className, lineNumber } of foundClasses) {
        const lineInfo = lineNumber ? ` (line ${lineNumber})` : '';
        violations.push(
          `${relativePath}${lineInfo}: The selector's class \`${className}\` is deprecated.`,
        );
      }
    }

    return violations.length ? violations : ['No deprecated CSS classes found'];
  },
  (result) => RESULT_FORMATTERS.list(result, 'Design System CSS Violations:'),
);

export const reportDeprecatedCssTools = [
  {
    schema: reportDeprecatedCssSchema,
    handler: reportDeprecatedCssHandler,
  },
];
