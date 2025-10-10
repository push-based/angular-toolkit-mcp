import { ToolsConfig } from '@push-based/models';
import { dsTools } from './ds/tools.js';

export const TOOLS: ToolsConfig[] = [...dsTools] as const;
