import { ToolSchemaOptions } from '@push-based/models';
import {
  createHandler,
  BaseHandlerOptions,
  RESULT_FORMATTERS,
} from '../shared/utils/handler-helpers.js';
import { COMMON_ANNOTATIONS } from '../shared/models/schema-helpers.js';
import {
  validateComponentName,
  componentNameToKebabCase,
} from '../shared/utils/component-validation.js';
import { resolveCrossPlatformPath } from '../shared/utils/cross-platform-path.js';
import { parseStoryFile } from './utils/story-parser.utils.js';
import { formatStoryDataAsMarkdown } from './utils/story-markdown-formatter.utils.js';
import * as fs from 'fs';
import * as path from 'path';

interface GetDsStoryDataOptions extends BaseHandlerOptions {
  componentName: string;
  format?: 'markdown' | 'json';
  descriptionLength?: 'short' | 'full';
  excludeTags?: string[];
}

export const getDsStoryDataToolSchema: ToolSchemaOptions = {
  name: 'get-ds-story-data',
  description:
    'Parse Storybook .stories.ts files for a DS component and return structured data with imports, argTypes, meta args, slots, selector style, form integration, and story definitions.',
  inputSchema: {
    type: 'object',
    properties: {
      componentName: {
        type: 'string',
        description:
          'The class name of the DS component (e.g., DsButton, DsBadge)',
      },
      format: {
        type: 'string',
        enum: ['markdown', 'json'],
        description:
          'Output format. "markdown" (default) returns human-readable markdown, "json" returns structured JSON.',
        default: 'markdown',
      },
      descriptionLength: {
        type: 'string',
        enum: ['short', 'full'],
        description:
          'Description verbosity. "short" (default) truncates to first sentence, "full" returns complete descriptions.',
        default: 'short',
      },
      excludeTags: {
        type: 'array',
        items: { type: 'string' },
        description:
          'Story tags to exclude from output. Defaults to ["docs-template"] to filter showcase stories. Pass empty array [] to include all.',
        default: ['docs-template'],
      },
    },
    required: ['componentName'],
  },
  annotations: {
    title: 'Get Design System Story Data',
    ...COMMON_ANNOTATIONS.readOnly,
  },
};

/**
 * Finds all .stories.ts files in a component directory.
 */
function findStoryFiles(componentDir: string): string[] {
  const files: string[] = [];
  try {
    if (!fs.existsSync(componentDir)) {
      return files;
    }
    const items = fs.readdirSync(componentDir);
    for (const item of items) {
      const fullPath = path.join(componentDir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isFile() && item.endsWith('.stories.ts')) {
        files.push(fullPath);
      }
    }
  } catch {
    // Return empty on any fs error
  }
  return files;
}

export const getDsStoryDataHandler = createHandler<
  GetDsStoryDataOptions,
  string
>(
  getDsStoryDataToolSchema.name,
  async ({ componentName, format = 'markdown', descriptionLength = 'short', excludeTags = ['docs-template'] }, { cwd, storybookDocsRoot }) => {
    validateComponentName(componentName);

    if (!storybookDocsRoot) {
      throw new Error(
        'Storybook docs root is not configured. Cannot resolve story files.',
      );
    }

    const kebabName = componentNameToKebabCase(componentName);
    const docsBasePath = resolveCrossPlatformPath(cwd, storybookDocsRoot);
    const componentDir = path.join(docsBasePath, kebabName);
    const storyFiles = findStoryFiles(componentDir);

    if (storyFiles.length === 0) {
      throw new Error(
        `No story file found for component \`${componentName}\` in ${componentDir}`,
      );
    }

    // Parse the first story file found
    const storyFilePath = storyFiles[0];
    const content = fs.readFileSync(storyFilePath, 'utf-8');
    const data = parseStoryFile(content, storyFilePath, kebabName);

    // Filter stories by excluded tags
    if (excludeTags.length > 0) {
      const excludeSet = new Set(excludeTags);
      data.stories = data.stories.filter(
        (s) => !s.tags.some((t) => excludeSet.has(t)),
      );
    }

    // Truncate descriptions if short mode
    if (descriptionLength === 'short') {
      for (const at of data.argTypes) {
        if (at.description) {
          at.description = truncateToFirstSentence(at.description);
        }
      }
    }

    return format === 'json'
      ? JSON.stringify(data, null, 2)
      : formatStoryDataAsMarkdown(data);
  },
  RESULT_FORMATTERS.success,
);

export const getDsStoryDataTools = [
  {
    schema: getDsStoryDataToolSchema,
    handler: getDsStoryDataHandler,
  },
];

/**
 * Truncate a description to its first sentence.
 */
function truncateToFirstSentence(text: string): string {
  const match = text.match(/^[^.!]+[.!]/);
  return match ? match[0].trim() : text;
}
