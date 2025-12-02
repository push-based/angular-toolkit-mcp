import type { FileViolationReport } from '../models/types.js';
import type { EnrichedFile } from './types.js';

/**
 * Calculate total violations for a file
 */
export function calculateViolations(file: FileViolationReport): number {
  return file.components.reduce((sum, comp) => sum + comp.lines.length, 0);
}

/**
 * Enrich files with metadata
 */
export function enrichFiles(files: FileViolationReport[]): EnrichedFile[] {
  return files.map((file) => ({
    ...file,
    violations: calculateViolations(file),
    directory: file.file.split('/')[0],
    subdirectory: file.file.split('/').slice(0, 2).join('/'),
  }));
}
