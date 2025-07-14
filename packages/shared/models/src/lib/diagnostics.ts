import { Issue } from './issue.js';

export interface DiagnosticsAware {
  // @TODO use Set<Issue & { code: number }>
  getIssues(): (Issue & { code?: number })[];

  clear(): void;
}
