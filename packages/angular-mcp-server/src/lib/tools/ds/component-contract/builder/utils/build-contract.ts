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
 * Build a complete component contract from template and style files.
 * Template and style paths can be the same as TypeScript path for inline templates/styles.
 */
export async function buildComponentContract(
  templatePath: string,
  scssPath: string,
  cwd: string,
  typescriptPath: string,
): Promise<ComponentContract> {
  const componentTsPath = resolveCrossPlatformPathAndValidate(
    cwd,
    typescriptPath,
  );

  // Validate TypeScript file exists (required)
  if (!existsSync(componentTsPath)) {
    throw new Error(`Component TypeScript file not found: ${componentTsPath}`);
  }

  // Resolve and validate template path
  // If it's the same as TS path, it means inline template
  const resolvedTemplatePath = resolveCrossPlatformPathAndValidate(
    cwd,
    templatePath,
  );
  const isInlineTemplate = resolvedTemplatePath === componentTsPath;

  if (!isInlineTemplate && !existsSync(resolvedTemplatePath)) {
    throw new Error(`Template file not found: ${resolvedTemplatePath}`);
  }

  // Resolve and validate style path
  // If it's the same as TS path, it means inline styles or no external styles
  const resolvedScssPath = resolveCrossPlatformPathAndValidate(cwd, scssPath);
  const isInlineOrNoStyles = resolvedScssPath === componentTsPath;

  if (!isInlineOrNoStyles && !existsSync(resolvedScssPath)) {
    throw new Error(`Style file not found: ${resolvedScssPath}`);
  }

  const sources = {
    ts: readFileSync(componentTsPath, 'utf-8'),
    scss: isInlineOrNoStyles ? '' : readFileSync(resolvedScssPath, 'utf-8'),
    template: isInlineTemplate ? '' : readFileSync(resolvedTemplatePath, 'utf-8'),
  };

  const [parsedComponent] = await parseComponents([componentTsPath]);
  if (!parsedComponent) {
    throw new Error(`Failed to parse component: ${componentTsPath}`);
  }

  const relativeTemplatePath = relative(cwd, resolvedTemplatePath);
  const relativeScssPath = relative(cwd, resolvedScssPath);

  const meta = generateMeta(relativeTemplatePath, parsedComponent, isInlineTemplate);
  const publicApi = extractPublicApi(parsedComponent);
  const { slots, dom } = await extractSlotsAndDom(parsedComponent);

  const styleBuckets: import('../../shared/models/types.js').StyleDeclarations[] =
    [];

  if (!isInlineOrNoStyles) {
    const externalStyles = await collectStylesV2(resolvedScssPath, dom);
    externalStyles.sourceFile = relativeScssPath;
    styleBuckets.push(externalStyles);
  }

  const inlineStyles = await collectInlineStyles(parsedComponent, dom);
  styleBuckets.push(inlineStyles);

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
