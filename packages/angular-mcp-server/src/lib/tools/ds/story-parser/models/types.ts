// ============================================================================
// get-ds-story-data types
// ============================================================================

export type { SelectorInfo } from '../../shared/utils/template-helpers.js';
import type { SelectorInfo } from '../../shared/utils/template-helpers.js';

export interface ArgTypeEntry {
  name: string;
  options?: string;
  type?: string;
  default?: string;
  description?: string;
}

export interface MetaArg {
  name: string;
  default: string;
}

export interface ArgsOverride {
  name: string;
  value: string;
}

export interface StoryEntry {
  name: string;
  displayName?: string;
  template: string | null;
  tags: string[];
  hasPlayFn: boolean;
  argsOverrides: ArgsOverride[];
  storyLevelArgs?: ArgTypeEntry[];
}

export interface StoryFileData {
  componentName: string;
  filePath: string;
  selector: SelectorInfo;
  imports: string[];
  argTypes: ArgTypeEntry[];
  metaArgs: MetaArg[] | null;
  metaTags: string[];
  slots: string[];
  formIntegration: string[];
  stories: StoryEntry[];
}
