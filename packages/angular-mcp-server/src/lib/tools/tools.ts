import { ToolsConfig } from '@push-based/models';
import { dsTools } from './ds/tools';

export const TOOLS: ToolsConfig[] = [...dsTools] as const;
