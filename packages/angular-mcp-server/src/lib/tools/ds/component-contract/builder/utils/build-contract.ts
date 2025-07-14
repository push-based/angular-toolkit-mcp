import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { parseComponents } from '@push-based/angular-ast-utils';
import { resolveCrossPlatformPathAndValidate } from '../../../shared/index.js';
import { generateMeta } from './meta.generator.js';
import { extractPublicApi } from './public-api.extractor.js';
import { extractSlotsAndDom } from './dom-slots.extractor.js';
import { collectStylesV2 } from './styles.collector.js';
import { collectInlineStyles } from './inline-styles.collector.js';
import type { ComponentContract } from '../../shared/models/types.js';
import { relative } from 'node:path';

/**
 * Build a complete component contract from template and style files
 */
export async function buildComponentContract(
  templatePath: string,
  scssPath: string,
  cwd: string,
  typescriptPath: string,
): Promise<ComponentContract> {
  const resolvedScssPath = resolveCrossPlatformPathAndValidate(cwd, scssPath);
  const resolvedTemplatePath = resolveCrossPlatformPathAndValidate(
    cwd,
    templatePath,
  );
  const componentTsPath = resolveCrossPlatformPathAndValidate(
    cwd,
    typescriptPath,
  );

  const requiredPaths = [
    { path: resolvedScssPath, name: 'Style file' },
    { path: resolvedTemplatePath, name: 'Template file' },
    { path: componentTsPath, name: 'Component TypeScript file' },
  ];

  for (const { path, name } of requiredPaths) {
    if (!existsSync(path)) {
      throw new Error(`${name} not found: ${path}`);
    }
  }

  const sources = {
    ts: readFileSync(componentTsPath, 'utf-8'),
    scss: readFileSync(resolvedScssPath, 'utf-8'),
    template: readFileSync(resolvedTemplatePath, 'utf-8'),
  };

  const [parsedComponent] = await parseComponents([componentTsPath]);
  if (!parsedComponent) {
    throw new Error(`Failed to parse component: ${componentTsPath}`);
  }

  const relativeTemplatePath = relative(cwd, resolvedTemplatePath);
  const relativeScssPath = relative(cwd, resolvedScssPath);

  const meta = generateMeta(relativeTemplatePath, parsedComponent, false);
  const publicApi = extractPublicApi(parsedComponent);
  const { slots, dom } = await extractSlotsAndDom(parsedComponent);

  // -------------------------------------------------------------------------
  // Collect styles from both external SCSS and inline `styles` array
  // -------------------------------------------------------------------------
  const styleBuckets: import('../../shared/models/types.js').StyleDeclarations[] =
    [];

  // External stylesheet – only if it is a real stylesheet different from the TS file
  if (resolvedScssPath !== componentTsPath) {
    const externalStyles = await collectStylesV2(resolvedScssPath, dom);
    externalStyles.sourceFile = relativeScssPath;
    styleBuckets.push(externalStyles);
  }

  // Inline styles declared on the component decorator
  const inlineStyles = await collectInlineStyles(parsedComponent, dom);
  styleBuckets.push(inlineStyles);

  // Merge collected buckets giving later buckets precedence on selector clashes
  const styles = styleBuckets.reduce<
    import('../../shared/models/types.js').StyleDeclarations
  >(
    (acc, bucket) => {
      acc.rules = { ...acc.rules, ...bucket.rules };
      return acc;
    },
    {
      sourceFile:
        styleBuckets.length > 0
          ? styleBuckets[styleBuckets.length - 1].sourceFile
          : relativeScssPath,
      rules: {},
    },
  );

  const hash = createHash('sha256')
    .update(sources.template + sources.scss + sources.ts)
    .digest('hex');

  return {
    meta: { ...meta, hash },
    publicApi,
    slots,
    dom,
    styles,
  };
}
