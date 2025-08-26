import { describe, expect, it } from 'vitest';
import { createClassDefinitionVisitor } from './class-definition.visitor';
import postcss from 'postcss';
import { visitEachChild } from '@push-based/styles-ast-utils';

describe('ClassDefinitionVisitor', () => {
  let cssAstVisitor: ReturnType<typeof createClassDefinitionVisitor>;

  it('should find deprecated class in CSS selector', () => {
    const styles = `
                /* This comment is here */
                .btn {
                  color: red;
                }
             `;

    cssAstVisitor = createClassDefinitionVisitor({
      deprecatedCssClasses: ['btn'],
      componentName: 'DsButton',
      docsUrl: 'docs.example.com/DsButton',
    });

    const ast = postcss.parse(styles, { from: 'styles.css' });
    visitEachChild(ast, cssAstVisitor);

    expect(cssAstVisitor.getIssues()).toHaveLength(1);
    const message = cssAstVisitor.getIssues()[0].message;
    expect(message).toContain('btn');
    expect(message).toContain('DsButton');
    expect(cssAstVisitor.getIssues()[0]).toEqual(
      expect.objectContaining({
        severity: 'error',
        source: expect.objectContaining({
          file: 'styles.css',
          position: expect.any(Object),
        }),
      })
    );
  });

  it('should not find class when it is not deprecated', () => {
    const styles = `
                .safe-class {
                  color: red;
                }

                #btn-1 {
                  color: green;
                }

                button {
                  color: blue;
                }
             `;

    cssAstVisitor = createClassDefinitionVisitor({
      deprecatedCssClasses: ['btn'],
      componentName: 'DsButton',
    });

    const ast = postcss.parse(styles, { from: 'styles.css' });
    visitEachChild(ast, cssAstVisitor);

    expect(cssAstVisitor.getIssues()).toHaveLength(0);
  });

  it('should find deprecated class in complex selector', () => {
    const styles = `
                div > button.btn {
                  color: blue;
                }
             `;

    cssAstVisitor = createClassDefinitionVisitor({
      deprecatedCssClasses: ['btn'],
      componentName: 'DsButton',
    });

    const ast = postcss.parse(styles, { from: 'styles.css' });
    visitEachChild(ast, cssAstVisitor);

    expect(cssAstVisitor.getIssues()).toHaveLength(1);
    const message = cssAstVisitor.getIssues()[0].message;
    expect(message).toContain('btn');
    expect(message).toContain('DsButton');
    expect(cssAstVisitor.getIssues()[0]).toEqual(
      expect.objectContaining({
        severity: 'error',
        source: expect.objectContaining({
          file: 'styles.css',
          position: expect.any(Object),
        }),
      })
    );
  });

  describe('deduplication', () => {
    it('should deduplicate multiple deprecated classes in same selector', () => {
      const styles = `
                  .btn.btn-primary {
                    color: red;
                  }
               `;

      cssAstVisitor = createClassDefinitionVisitor({
        deprecatedCssClasses: ['btn', 'btn-primary'],
        componentName: 'DsButton',
        docsUrl: 'docs.example.com/DsButton',
      });

      const ast = postcss.parse(styles, { from: 'styles.css' });
      visitEachChild(ast, cssAstVisitor);

      expect(cssAstVisitor.getIssues()).toHaveLength(1);
      const message = cssAstVisitor.getIssues()[0].message;
      expect(message).toContain('btn, btn-primary');
      expect(message).toContain('DsButton');
      expect(cssAstVisitor.getIssues()[0]).toEqual(
        expect.objectContaining({
          severity: 'error',
          source: expect.objectContaining({
            file: 'styles.css',
            position: expect.any(Object),
          }),
        })
      );
    });

    it('should deduplicate multiple deprecated classes in comma-separated selectors', () => {
      const styles = `
                  .btn, .btn-primary {
                    color: red;
                  }
               `;

      cssAstVisitor = createClassDefinitionVisitor({
        deprecatedCssClasses: ['btn', 'btn-primary'],
        componentName: 'DsButton',
        docsUrl: 'docs.example.com/DsButton',
      });

      const ast = postcss.parse(styles, { from: 'styles.css' });
      visitEachChild(ast, cssAstVisitor);

      expect(cssAstVisitor.getIssues()).toHaveLength(1);
      const message = cssAstVisitor.getIssues()[0].message;
      expect(message).toContain('btn, btn-primary');
      expect(message).toContain('DsButton');
      expect(cssAstVisitor.getIssues()[0]).toEqual(
        expect.objectContaining({
          severity: 'error',
          source: expect.objectContaining({
            file: 'styles.css',
            position: expect.any(Object),
          }),
        })
      );
    });

    it('should deduplicate three deprecated classes in same selector', () => {
      const styles = `
                  .btn.btn-primary.btn-large {
                    color: red;
                  }
               `;

      cssAstVisitor = createClassDefinitionVisitor({
        deprecatedCssClasses: ['btn', 'btn-primary', 'btn-large'],
        componentName: 'DsButton',
        docsUrl: 'docs.example.com/DsButton',
      });

      const ast = postcss.parse(styles, { from: 'styles.css' });
      visitEachChild(ast, cssAstVisitor);

      expect(cssAstVisitor.getIssues()).toHaveLength(1);
      const message = cssAstVisitor.getIssues()[0].message;
      expect(message).toContain('btn, btn-primary, btn-large');
      expect(message).toContain('DsButton');
      expect(cssAstVisitor.getIssues()[0]).toEqual(
        expect.objectContaining({
          severity: 'error',
          source: expect.objectContaining({
            file: 'styles.css',
            position: expect.any(Object),
          }),
        })
      );
    });

    it('should still create single issue for single deprecated class', () => {
      const styles = `
                  .btn {
                    color: red;
                  }
               `;

      cssAstVisitor = createClassDefinitionVisitor({
        deprecatedCssClasses: ['btn', 'btn-primary'],
        componentName: 'DsButton',
        docsUrl: 'docs.example.com/DsButton',
      });

      const ast = postcss.parse(styles, { from: 'styles.css' });
      visitEachChild(ast, cssAstVisitor);

      expect(cssAstVisitor.getIssues()).toHaveLength(1);
      const message = cssAstVisitor.getIssues()[0].message;
      expect(message).toContain('btn');
      expect(message).not.toContain(',');
      expect(message).toContain('DsButton');
      expect(cssAstVisitor.getIssues()[0]).toEqual(
        expect.objectContaining({
          severity: 'error',
          source: expect.objectContaining({
            file: 'styles.css',
            position: expect.any(Object),
          }),
        })
      );
    });

    it('should handle mixed deprecated and non-deprecated classes', () => {
      const styles = `
                  .btn.safe-class.btn-primary {
                    color: red;
                  }
               `;

      cssAstVisitor = createClassDefinitionVisitor({
        deprecatedCssClasses: ['btn', 'btn-primary'],
        componentName: 'DsButton',
        docsUrl: 'docs.example.com/DsButton',
      });

      const ast = postcss.parse(styles, { from: 'styles.css' });
      visitEachChild(ast, cssAstVisitor);

      expect(cssAstVisitor.getIssues()).toHaveLength(1);
      const message = cssAstVisitor.getIssues()[0].message;
      expect(message).toContain('btn, btn-primary');
      expect(message).not.toContain('safe-class');
      expect(message).toContain('DsButton');
      expect(cssAstVisitor.getIssues()[0]).toEqual(
        expect.objectContaining({
          severity: 'error',
          source: expect.objectContaining({
            file: 'styles.css',
            position: expect.any(Object),
          }),
        })
      );
    });
  });
});
