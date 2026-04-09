import { StoryFileData, ArgTypeEntry, StoryEntry } from '../models/types.js';

/**
 * Formats parsed story data as a compact, token-efficient markdown string.
 */
export function formatStoryDataAsMarkdown(data: StoryFileData): string {
  const lines: string[] = [];

  lines.push(`# ${data.componentName}`);
  lines.push('');

  // Selector
  lines.push(
    `Selector: \`${data.selector.selector}\` (${data.selector.style})`,
  );
  if (data.selector.note) {
    lines.push(`Note: ${data.selector.note}`);
  }
  lines.push('');

  // Imports
  if (data.imports.length > 0) {
    lines.push('## Imports');
    lines.push('');
    for (const imp of data.imports) {
      lines.push(imp);
    }
    lines.push('');
  }

  // ArgTypes
  if (data.argTypes.length > 0) {
    lines.push('## ArgTypes');
    lines.push('');
    lines.push(formatArgTypesTable(data.argTypes));
    lines.push('');
  }

  // Slots
  if (data.slots.length > 0) {
    lines.push(`Slots: ${data.slots.map((s) => `\`${s}\``).join(', ')}`);
    lines.push('');
  }

  // Form Integration
  if (data.formIntegration.length > 0) {
    lines.push(`Form: ${data.formIntegration.join(', ')}`);
    lines.push('');
  }

  // Stories
  if (data.stories.length > 0) {
    lines.push('## Stories');
    lines.push('');
    for (const story of data.stories) {
      lines.push(formatStoryEntry(story));
    }
  }

  return lines.join('\n');
}

function formatArgTypesTable(argTypes: ArgTypeEntry[]): string {
  const rows: string[] = [];
  rows.push('| Name | Type | Default | Description |');
  rows.push('| --- | --- | --- | --- |');
  for (const at of argTypes) {
    const type = at.options ? `enum (${at.options})` : at.type || '-';
    const def = at.default ? `\`${at.default}\`` : '-';
    const desc = at.description || '-';
    rows.push(`| ${at.name} | ${type} | ${def} | ${desc} |`);
  }
  return rows.join('\n');
}

function formatStoryEntry(story: StoryEntry): string {
  const parts: string[] = [];
  const heading = story.displayName
    ? `### ${story.name} (${story.displayName})`
    : `### ${story.name}`;
  parts.push(heading);

  const meta: string[] = [];
  if (story.tags.length > 0) {
    meta.push(`tags: ${story.tags.join(', ')}`);
  }
  if (story.hasPlayFn) {
    meta.push('has play fn');
  }
  if (story.argsOverrides.length > 0) {
    const overrides = story.argsOverrides
      .map((o) => `${o.name}: ${o.value}`)
      .join(', ');
    meta.push(`args: ${overrides}`);
  }
  if (meta.length > 0) {
    parts.push(meta.join(' · '));
  }

  if (story.storyLevelArgs && story.storyLevelArgs.length > 0) {
    const slArgs = story.storyLevelArgs
      .map((a) => {
        const type = a.options ? `enum(${a.options})` : a.type || '';
        return `${a.name}${type ? `: ${type}` : ''}`;
      })
      .join(', ');
    parts.push(`story-level inputs: ${slArgs}`);
  }

  if (story.template) {
    parts.push(story.template);
  }

  parts.push('');
  return parts.join('\n');
}
