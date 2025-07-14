import {
  createHandler,
  BaseHandlerOptions,
} from '../shared/utils/handler-helpers.js';
import {
  buildComponentUsageGraph,
  clearAnalysisCache,
} from './utils/component-usage-graph-builder.js';
import { filterGraph, printComponents } from './utils/component-helpers.js';
import { buildComponentUsageGraphSchema } from './models/schema.js';
import { resolveCrossPlatformPath } from '../shared/utils/cross-platform-path.js';

interface ComponentUsageGraphOptions extends BaseHandlerOptions {
  directory: string;
  violationFiles: string[];
}

export const buildComponentUsageGraphHandler = createHandler<
  ComponentUsageGraphOptions,
  any
>(
  buildComponentUsageGraphSchema.name,
  async (params, { cwd, workspaceRoot }) => {
    const startTime = performance.now();

    try {
      const { directory, violationFiles } = params;

      if (
        !violationFiles ||
        !Array.isArray(violationFiles) ||
        violationFiles.length === 0
      ) {
        throw new Error(
          'violationFiles parameter is required and must be an array of strings',
        );
      }

      const fullComponentUsageGraph = await buildComponentUsageGraph({
        cwd,
        directory,
        workspaceRoot,
      });

      const targetPath = resolveCrossPlatformPath(cwd, directory);

      const componentUsageGraph =
        violationFiles.length > 0
          ? filterGraph(fullComponentUsageGraph, violationFiles, targetPath)
          : fullComponentUsageGraph;

      const content = printComponents(componentUsageGraph, 'entity');
      const totalTime = performance.now() - startTime;

      return {
        content,
        timing: `⚡ Analysis completed in ${totalTime.toFixed(2)}ms (${Object.keys(fullComponentUsageGraph).length} files processed)`,
      };
    } finally {
      clearAnalysisCache();
    }
  },
  (result) => {
    // Format the result as text lines
    const lines: string[] = [];

    if (Array.isArray(result.content)) {
      result.content.forEach((item: any) => {
        if (item.type === 'text') {
          lines.push(item.text);
        } else {
          lines.push(JSON.stringify(item));
        }
      });
    }

    lines.push(result.timing);
    return lines;
  },
);

export const buildComponentUsageGraphTools = [
  {
    schema: buildComponentUsageGraphSchema,
    handler: buildComponentUsageGraphHandler,
  },
];
