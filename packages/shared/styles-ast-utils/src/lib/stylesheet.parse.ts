import postcss from 'postcss';
import safeParser from 'postcss-safe-parser';

/**
 * Parse a stylesheet content and return the AST.
 * PostCss is indexed with 1, so we don't need to adjust the line number to be linkable.
 *
 * @param content
 * @param filePath
 */
export function parseStylesheet(content: string, filePath: string) {
  return postcss().process(content, {
    parser: safeParser,
    from: filePath,
    map: {
      inline: false, // preserve line number
    },
  });
}
