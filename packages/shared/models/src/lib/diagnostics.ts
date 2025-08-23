import { Issue } from '@code-pushup/models';

export interface DiagnosticsAware {
  // @TODO use Set<Issue & { code: number }>
  getIssues(): (Issue & { code?: number })[];

  clear(): void;
}
