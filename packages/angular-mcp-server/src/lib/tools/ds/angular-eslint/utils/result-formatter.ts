import { Issue } from '@push-based/models';
import { buildText } from '../../shared/utils/output.utils.js';
import { formatViolations } from '../../shared/violation-analysis/formatters.js';
import {
  BaseViolationResult,
  BaseViolationIssue,
} from '../../shared/violation-analysis/types.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ConfigSource } from '../models/types.js';

const CONFIG_DESCRIPTIONS: Record<ConfigSource, string> = {
  custom: 'custom config',
  library: 'library config',
  parent: 'parent directory config',
  workspace: 'workspace config',
  fallback: 'built-in config',
  none: 'no config',
};

/**
 * Converts angular-eslint Issue[] to BaseViolationResult format
 */
const convertToViolationResult = (issues: Issue[]): BaseViolationResult => ({
  audits: [
    {
      details: {
        issues: issues.map(
          (issue): BaseViolationIssue => ({
            message: issue.message,
            source: issue.source
              ? {
                  file: issue.source.file,
                  position: issue.source.position
                    ? { startLine: issue.source.position.startLine }
                    : undefined,
                }
              : undefined,
          }),
        ),
      },
      title: 'Angular ESLint Validation',
      score: issues.length ? 0 : 1, // 0 = failed, 1 = passed
    },
  ],
});

function formatConfigInfo(
  configSource?: ConfigSource,
  configPath?: string,
): string {
  if (!configSource) return '';

  const description = CONFIG_DESCRIPTIONS[configSource] || configSource;
  const pathInfo = configPath ? ` (${configPath})` : '';

  return `\n\nESLint config: Using ${description}${pathInfo}`;
}

export function formatResults(
  issues: Issue[],
  totalFiles: number,
  cwd: string,
  _ms: number,
  configSource?: ConfigSource,
  configPath?: string,
): CallToolResult {
  const configInfo = formatConfigInfo(configSource, configPath);

  if (!issues.length) {
    return {
      content: [
        buildText(
          `Angular component validation passed for ${totalFiles} file(s).${configInfo}`,
        ),
      ],
    };
  }

  const violationResult = convertToViolationResult(issues);
  const formattedViolations = formatViolations(violationResult, cwd, {
    groupBy: 'file',
  });

  if (
    formattedViolations.length > 0 &&
    formattedViolations[0].type === 'text'
  ) {
    formattedViolations[0].text += configInfo;
  }

  return {
    content: formattedViolations,
  };
}
