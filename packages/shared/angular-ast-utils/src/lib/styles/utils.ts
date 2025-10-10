import type { Root } from 'postcss';
import { Issue } from '@code-pushup/models';
import { Asset, ParsedComponent } from '../types.js';

export async function visitComponentStyles<T>(
  component: ParsedComponent,
  visitorArgument: T,
  getIssues: (tokenReplacement: T, asset: Asset<Root>) => Promise<Issue[]>,
): Promise<(Issue & { code?: number })[]> {
  const { styles, styleUrls, styleUrl } = component;

  if (styleUrls == null && styles == null && styleUrl == null) {
    return [];
  }

  // Handle inline styles
  const styleIssues: Issue[] = (
    await Promise.all(
      (styles ?? []).flatMap(async (style: Asset<Root>) => {
        return getIssues(visitorArgument, style);
      }),
    )
  ).flat();

  const styleUrlsIssues: Issue[] = (
    await Promise.all(
      (styleUrls ?? []).flatMap(async (styleUrl: Asset<Root>) => {
        return getIssues(visitorArgument, styleUrl);
      }),
    )
  ).flat();

  const styleUrlIssues: Issue[] = styleUrl
    ? await (async () => {
        return getIssues(visitorArgument, styleUrl);
      })()
    : [];

  return [...styleIssues, ...styleUrlsIssues, ...styleUrlIssues];
}
