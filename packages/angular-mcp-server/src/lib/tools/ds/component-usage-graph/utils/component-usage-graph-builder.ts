import * as path from 'path';
import { toUnixPath, findAllFiles } from '@push-based/utils';
import {
  BuildComponentUsageGraphOptions,
  ComponentUsageGraphResult,
  FileInfo,
} from '../models/types.js';
import {
  DEPENDENCY_ANALYSIS_CONFIG,
  clearComponentImportRegexCache,
} from '../models/config.js';
import {
  analyzeFileWithUnifiedOptimization,
  extractComponentImportsUnified,
} from './unified-ast-analyzer.js';
import { resolveCrossPlatformPathAndValidateWithContext } from '../../shared/utils/cross-platform-path.js';

const BATCH_SIZE = 50; // Process files in batches of 50

export async function buildComponentUsageGraph(
  options: BuildComponentUsageGraphOptions,
): Promise<ComponentUsageGraphResult> {
  const startTime = performance.now();

  const targetPath = resolveCrossPlatformPathAndValidateWithContext(
    options.cwd,
    options.directory,
    options.workspaceRoot,
  );

  const files: Record<string, FileInfo> = {};

  // Phase 1: Directory scanning
  const scanStartTime = performance.now();
  const allFiles = await scanDirectoryWithUtils(targetPath);
  const scanTime = performance.now() - scanStartTime;

  // Phase 2: File analysis with unified AST parsing
  const analysisStartTime = performance.now();
  await processFilesInParallel(allFiles, targetPath, files);
  const analysisTime = performance.now() - analysisStartTime;

  // Phase 3: Reverse dependency analysis
  const reverseDepsStartTime = performance.now();
  await addReverseDependenciesOptimized(files, targetPath);
  const reverseDepsTime = performance.now() - reverseDepsStartTime;

  const totalTime = performance.now() - startTime;

  // Log performance metrics
  console.log(`🚀 Unified AST Analysis Performance:`);
  console.log(
    `  📁 Directory scan: ${scanTime.toFixed(2)}ms (${((scanTime / totalTime) * 100).toFixed(1)}%)`,
  );
  console.log(
    `  🔍 File analysis: ${analysisTime.toFixed(2)}ms (${((analysisTime / totalTime) * 100).toFixed(1)}%)`,
  );
  console.log(
    `  🔗 Reverse deps: ${reverseDepsTime.toFixed(2)}ms (${((reverseDepsTime / totalTime) * 100).toFixed(1)}%)`,
  );
  console.log(
    `  ⚡ Total time: ${totalTime.toFixed(2)}ms for ${Object.keys(files).length} files`,
  );
  console.log(
    `  📊 Avg per file: ${(totalTime / Object.keys(files).length).toFixed(2)}ms`,
  );

  return files;
}

async function scanDirectoryWithUtils(dirPath: string): Promise<string[]> {
  const files: string[] = [];
  const { fileExtensions } = DEPENDENCY_ANALYSIS_CONFIG;

  try {
    // Use findAllFiles async generator for better memory efficiency
    for await (const file of findAllFiles(dirPath, (filePath) => {
      const ext = path.extname(filePath);
      return fileExtensions.includes(ext as any);
    })) {
      files.push(toUnixPath(file));
    }
  } catch (ctx) {
    throw new Error(
      `Failed to scan directory ${dirPath}: ${(ctx as Error).message}`,
    );
  }

  return files;
}

async function processFilesInParallel(
  allFiles: string[],
  targetPath: string,
  files: Record<string, FileInfo>,
): Promise<void> {
  // Single pass with slice batching (no extra helpers)
  for (let i = 0; i < allFiles.length; i += BATCH_SIZE) {
    const batch = allFiles.slice(i, i + BATCH_SIZE);
    const batchStartTime = performance.now();

    const results = await Promise.all(
      batch.map(async (filePath) => {
        try {
          const relativePath = toUnixPath(path.relative(targetPath, filePath));
          const fileInfo = await analyzeFileWithUnifiedOptimization(
            filePath,
            targetPath,
          );
          return { relativePath, fileInfo } as const;
        } catch (ctx) {
          throw new Error(
            `Failed to analyze file ${filePath}: ${(ctx as Error).message}`,
          );
        }
      }),
    );

    for (const result of results) {
      if (result) {
        files[result.relativePath] = result.fileInfo;
      }
    }

    const batchTime = performance.now() - batchStartTime;
    console.log(
      `  📦 Batch ${Math.ceil((i + batch.length) / BATCH_SIZE)}: ${batch.length} files in ${batchTime.toFixed(2)}ms (${(batchTime / batch.length).toFixed(2)}ms/file)`,
    );
  }
}

async function addReverseDependenciesOptimized(
  files: Record<string, FileInfo>,
  basePath: string,
): Promise<void> {
  // Build component name to file path mapping
  const componentMap = new Map<string, string>();
  const componentNames: string[] = [];

  for (const [filePath, fileInfo] of Object.entries(files)) {
    if (fileInfo.componentName) {
      componentMap.set(fileInfo.componentName, filePath);
      componentNames.push(fileInfo.componentName);
    }
  }

  if (componentNames.length === 0) {
    console.log(`  ℹ️  No components found for reverse dependency analysis`);
    return; // No components to analyze
  }

  console.log(
    `  🔍 Analyzing reverse dependencies for ${componentNames.length} components`,
  );

  // Process files in parallel batches for reverse dependency analysis
  const fileEntries = Object.entries(files);
  const batches = createBatches(fileEntries, BATCH_SIZE);
  let processedBatches = 0;

  for (const batch of batches) {
    const batchStartTime = performance.now();
    const promises = batch.map(
      async ([filePath, fileInfo]: [string, FileInfo]) => {
        const fullPath = path.resolve(basePath, filePath);

        try {
          // Only analyze TypeScript/JavaScript files for component imports
          if (
            fileInfo.type === 'typescript' ||
            fileInfo.type === 'javascript'
          ) {
            // Use unified component import extraction instead of separate file read + AST parsing
            const foundComponents = await extractComponentImportsUnified(
              fullPath,
              componentNames,
            );

            // Collect all reverse dependencies for this file
            const reverseDependencies = [];
            for (const componentName of foundComponents) {
              const componentFilePath = componentMap.get(componentName);
              if (componentFilePath && componentFilePath !== filePath) {
                reverseDependencies.push({
                  componentFilePath,
                  dependency: {
                    path: toUnixPath(filePath),
                    type: 'reverse-dependency' as const,
                    resolved: true,
                    resolvedPath: toUnixPath(filePath),
                    componentName: componentName,
                    sourceFile: filePath,
                  },
                });
              }
            }

            return reverseDependencies;
          }
        } catch (ctx) {
          throw new Error(
            `Failed to analyze reverse dependencies for ${filePath}: ${(ctx as Error).message}`,
          );
        }

        return [];
      },
    );

    const results = await Promise.all(promises);
    const batchTime = performance.now() - batchStartTime;
    processedBatches++;

    // Apply reverse dependencies
    let dependenciesAdded = 0;
    for (const result of results) {
      if (Array.isArray(result)) {
        for (const dependency of result) {
          files[dependency.componentFilePath].dependencies.push(
            dependency.dependency,
          );
          dependenciesAdded++;
        }
      }
    }

    console.log(
      `  🔗 Reverse deps batch ${processedBatches}: ${batch.length} files, ${dependenciesAdded} dependencies in ${batchTime.toFixed(2)}ms`,
    );
  }
}

// Compact batch helper reused by reverse-dependency phase
function createBatches<T>(items: T[], batchSize: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }
  return batches;
}

export function clearAnalysisCache(): void {
  clearComponentImportRegexCache();
}
