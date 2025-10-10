import * as path from 'path';
import { toUnixPath } from '@code-pushup/utils';
import { buildText } from '../../shared/utils/output.utils.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import {
  DependencyGraphResult,
  DependencyInfo,
  ComponentGroup,
  FileExtension,
} from '../models/types.js';
import { DEPENDENCY_ANALYSIS_CONFIG } from '../models/config.js';

// Consolidated utilities
const NAME_RE =
  /^(.*?)(?:\.(?:component|directive|pipe|service|module|spec))?\.(?:ts|js|html?|s?css|less)$/i;

const baseName = (filePath: string): string => {
  const fileName = path.basename(filePath);
  const match = fileName.match(NAME_RE);
  return match ? match[1] : fileName;
};

const rel = (root: string, p: string) =>
  toUnixPath(path.isAbsolute(p) ? path.relative(root, p) : p);

type Index = Map<string, string[]>; // baseName → related files

const buildIndex = (graph: DependencyGraphResult): Index => {
  const index: Index = new Map();
  for (const fp of Object.keys(graph)) {
    const bn = baseName(fp);
    (index.get(bn) ?? index.set(bn, []).get(bn)!).push(fp);
  }
  return index;
};

const expandViolations = (seeds: string[], index: Index): string[] => [
  ...new Set(seeds.flatMap((s) => index.get(baseName(s)) ?? [])),
];

export const assetToComponentTs = (p: string): string =>
  path.join(path.dirname(p), baseName(p) + '.component.ts');

export const filterGraph = (
  graph: DependencyGraphResult,
  violationFiles: string[],
  root: string,
  index: Index = buildIndex(graph),
): DependencyGraphResult => {
  const seeds = violationFiles.flatMap((f) =>
    /\.(html?|s?css|sass|less)$/i.test(f) ? [f, assetToComponentTs(f)] : [f],
  );

  const bad = new Set(expandViolations(seeds, index).map((f) => rel(root, f)));
  const badNames = new Set([...bad].map(baseName));

  return Object.fromEntries(
    Object.entries(graph).filter(
      ([fp, info]) =>
        bad.has(fp) ||
        badNames.has(baseName(fp)) ||
        info.dependencies.some(
          (d) => d.type === 'reverse-dependency' && bad.has(d.path),
        ),
    ),
  );
};

const buildGroups = (
  result: DependencyGraphResult,
): Map<string, ComponentGroup> => {
  const componentGroups = new Map<string, ComponentGroup>();

  for (const [filePath, fileInfo] of Object.entries(result)) {
    const bn = baseName(filePath);

    if (!componentGroups.has(bn)) {
      componentGroups.set(bn, {
        relatedFiles: [],
        hasReverseDeps: false,
      });
    }

    const group = componentGroups.get(bn);
    if (group) {
      if (fileInfo.isAngularComponent) {
        group.componentFile = [filePath, fileInfo];
        group.hasReverseDeps = fileInfo.dependencies.some(
          (dep: DependencyInfo) => dep.type === 'reverse-dependency',
        );
      } else {
        group.relatedFiles.push([filePath, fileInfo]);
      }
    }
  }

  return componentGroups;
};

const getFileType = (filePath: string): string => {
  const extension = path.extname(filePath).toLowerCase() as FileExtension;
  return DEPENDENCY_ANALYSIS_CONFIG.fileTypeMap[extension] || 'file';
};

type Mode = 'inline' | 'entity';

export const printComponents = (
  graph: DependencyGraphResult,
  mode: Mode = 'inline',
): string | CallToolResult['content'] => {
  const groups = buildGroups(graph);
  const comps = [...groups.values()].filter((g) => g.componentFile);

  if (!comps.length)
    return mode === 'inline'
      ? 'No Angular components found with violations.'
      : [buildText('No Angular components found with violations.')];

  const toLines = (g: ComponentGroup) => {
    if (!g.componentFile) return '';
    const [cp, ci] = g.componentFile;
    return [
      `Component: ${ci.componentName ?? 'Unknown'}`,
      '',
      `- ${ci.type}: ${cp}`,
      ...g.relatedFiles.map(([p, i]) => `- ${i.type}: ${p}`),
      ...ci.dependencies
        .filter((d) => d.type === 'reverse-dependency')
        .map(
          (d) =>
            `- ${getFileType(d.resolvedPath ?? d.path)}: ${d.resolvedPath ?? d.path}`,
        ),
    ].join('\n');
  };

  if (mode === 'inline') {
    return comps.map(toLines).join('\n\n');
  }
  return comps.map((g) => buildText(toLines(g)));
};
