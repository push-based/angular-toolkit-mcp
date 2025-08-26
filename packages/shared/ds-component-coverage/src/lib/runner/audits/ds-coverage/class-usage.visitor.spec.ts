import { ClassUsageVisitor } from './class-usage.visitor';
import type {
  ParsedTemplate,
  ParseTemplateOptions,
} from '@angular/compiler' with { 'resolution-mode': 'import' };

describe('ClassCollectorVisitor', () => {
  let visitor: ClassUsageVisitor;
  let parseTemplate: (
    template: string,
    templateUrl: string,
    options?: ParseTemplateOptions,
  ) => ParsedTemplate;

  beforeAll(async () => {
    parseTemplate = (await import('@angular/compiler')).parseTemplate;
  });
  beforeEach(() => {
    visitor = new ClassUsageVisitor({
      componentName: 'CounterComponent',
      deprecatedCssClasses: ['count', 'count-badge', 'count-item'],
      docsUrl: 'my.doc#CounterComponent',
    });
  });

  it('should not find class when it is not a class-binding', () => {
    const template = `
                <ms-list-item
                    [count]="link.count"
                    >
                </ms-list-item>
             `;

    const ast = parseTemplate(template, 'template.html');

    ast.nodes.forEach((node) => node.visit(visitor));

    expect(visitor.getIssues()).toHaveLength(0);
  });

  it('<div class="count">1</div> should find node with css class', () => {
    const template = `<div class="count">1</div>`;

    const ast = parseTemplate(template, 'template.html');
    ast.nodes.forEach((node) => node.visit(visitor));

    expect(visitor.getIssues()).toStrictEqual([
      expect.objectContaining({
        message: expect.stringContaining('CounterComponent'),
      }),
    ]);
  });

  it('<div class="count">1</div> should find node within other css classes', () => {
    const template = `<div class="a count b">1</div>`;

    const ast = parseTemplate(template, 'template.html');
    ast.nodes.forEach((node) => node.visit(visitor));

    expect(visitor.getIssues()).toStrictEqual([
      expect.objectContaining({
        message: expect.stringContaining('CounterComponent'),
        severity: 'error',
        source: expect.objectContaining({
          file: 'template.html',
          position: expect.any(Object),
        }),
      }),
    ]);
  });

  it('<div [class.count]="true">2</div>', () => {
    const template = `<div [class.count]="true">2</div>`;

    const ast = parseTemplate(template, 'template.html');
    ast.nodes.forEach((node) => node.visit(visitor));

    expect(visitor.getIssues()).toStrictEqual([
      expect.objectContaining({
        message: expect.stringContaining('CounterComponent'),
        severity: 'error',
        source: expect.objectContaining({
          file: 'template.html',
          position: expect.any(Object),
        }),
      }),
    ]);
  });

  it('<div [class.count]="false">2</div> should find node with class-binding', () => {
    const template = `<div [class.count]="false">2</div>`;

    const ast = parseTemplate(template, 'template.html');
    ast.nodes.forEach((node) => node.visit(visitor));

    expect(visitor.getIssues()).toStrictEqual([
      expect.objectContaining({
        message: expect.stringContaining('CounterComponent'),
        severity: 'error',
        source: expect.objectContaining({
          file: 'template.html',
          position: expect.any(Object),
        }),
      }),
    ]);
  });

  it('<div [class.a]="true">3</div> should not find not when other class is used in class-binding', () => {
    const template = `<div [class.a]="true">3</div>`;

    const ast = parseTemplate(template, 'template.html');
    ast.nodes.forEach((node) => node.visit(visitor));

    expect(visitor.getIssues()).toHaveLength(0);
  });

  it('<div [class.a]="false">3</div> should not find node when other class is used in class-binding', () => {
    const template = `<div [class.a]="false">3</div>`;

    const ast = parseTemplate(template, 'template.html');
    ast.nodes.forEach((node) => node.visit(visitor));

    expect(visitor.getIssues()).toHaveLength(0);
  });

  it("<div [ngClass]=\"['count', 'second']\">5</div> should find node when class is used in ngClass-binding", () => {
    const template = `<div [ngClass]="['count', 'second']">5</div>`;

    const ast = parseTemplate(template, 'template.html');
    ast.nodes.forEach((node) => node.visit(visitor));

    expect(visitor.getIssues()).toStrictEqual([
      expect.objectContaining({
        message: expect.stringContaining('CounterComponent'),
        severity: 'error',
        source: expect.objectContaining({
          file: 'template.html',
          position: expect.any(Object),
        }),
      }),
    ]);
  });

  it('<div [ngClass]="{ count: true, second: true, third: true }">6</div> should find node when class is used in ngClass-binding with object-binding', () => {
    const template = `<div [ngClass]="{ count: true, second: true, third: true }">6</div>`;

    const ast = parseTemplate(template, 'template.html');
    ast.nodes.forEach((node) => node.visit(visitor));

    expect(visitor.getIssues()).toStrictEqual([
      expect.objectContaining({
        message: expect.stringContaining('CounterComponent'),
        severity: 'error',
        source: expect.objectContaining({
          file: 'template.html',
          position: expect.any(Object),
        }),
      }),
    ]);
  });

  it('<div [ngClass]="{ count: false, second: true, third: true }">6</div> should find node when class is used in ngClass-binding with object-binding and other classes', () => {
    const template = `<div [ngClass]="{ count: false, second: true, third: true }">6</div>`;

    const ast = parseTemplate(template, 'template.html');
    ast.nodes.forEach((node) => node.visit(visitor));

    expect(visitor.getIssues()).toStrictEqual([
      expect.objectContaining({
        message: expect.stringContaining('CounterComponent'),
        severity: 'error',
        source: expect.objectContaining({
          file: 'template.html',
          position: expect.any(Object),
        }),
      }),
    ]);
  });

  it('<div [ngClass]="{ \'count second\': true }">7</div> should find node when class is used in ngClass-binding with object-binding and condensed signature', () => {
    const template = `<div [ngClass]="{ 'count second': true }">7</div>`;

    const ast = parseTemplate(template, 'template.html');
    ast.nodes.forEach((node) => node.visit(visitor));

    expect(visitor.getIssues()).toStrictEqual([
      expect.objectContaining({
        message: expect.stringContaining('CounterComponent'),
        severity: 'error',
        source: expect.objectContaining({
          file: 'template.html',
          position: expect.any(Object),
        }),
      }),
    ]);
  });

  it('<div [ngClass]="{ \'count second\': false }">7</div>', () => {
    const template = `<div [ngClass]="{ 'count second': false }">7</div>`;

    const ast = parseTemplate(template, 'template.html');
    ast.nodes.forEach((node) => node.visit(visitor));

    expect(visitor.getIssues()).toStrictEqual([
      expect.objectContaining({
        message: expect.stringContaining('CounterComponent'),
        severity: 'error',
        source: expect.objectContaining({
          file: 'template.html',
          position: expect.any(Object),
        }),
      }),
    ]);
  });

  it('should find all nodes in @if-blocks', () => {
    const template = `
            @if (true){
              <div id="1" class="count"></div>
            }
             <div>
              <span>
                 @if (true){
                  <div id="2" class="count"></div>
                  }
              </span>
            </div>
      `;

    const ast = parseTemplate(template, 'template.html');
    ast.nodes.forEach((node) => node.visit(visitor));

    expect(visitor.getIssues()).toHaveLength(2);
    expect(visitor.getIssues()).toEqual([
      expect.objectContaining({
        message: expect.stringContaining('CounterComponent'),
        severity: 'error',
        source: expect.objectContaining({
          file: 'template.html',
          position: expect.any(Object),
        }),
      }),
      expect.objectContaining({
        message: expect.stringContaining('CounterComponent'),
        severity: 'error',
        source: expect.objectContaining({
          file: 'template.html',
          position: expect.any(Object),
        }),
      }),
    ]);
  });

  it('should find all nodes with *ngIf', () => {
    const template = `
          <ng-container *ngIf="true">
           <div id="1" class="count"></div>
          </ng-container>
           <div>
          <span>

                <div *ngIf="true" id="2" class="count"></div>

          </span>
        </div>
      `;

    const ast = parseTemplate(template, 'template.html');
    ast.nodes.forEach((node) => node.visit(visitor));

    expect(visitor.getIssues()).toHaveLength(2);
    expect(visitor.getIssues()).toEqual([
      expect.objectContaining({
        message: expect.stringContaining('CounterComponent'),
        severity: 'error',
        source: expect.objectContaining({
          file: 'template.html',
          position: expect.any(Object),
        }),
      }),
      expect.objectContaining({
        message: expect.stringContaining('CounterComponent'),
        severity: 'error',
        source: expect.objectContaining({
          file: 'template.html',
          position: expect.any(Object),
        }),
      }),
    ]);
  });

  it('should find all nodes in @for-block', () => {
    const template = `
        @for (item of items; track item.name) {
          <div id="1" class="count"></div>
        }
        <div>
          <span>
            @for (item of items; track item.name) {
              <div id="2" class="count"></div>
            }
          </span>
        </div>
      `;

    const ast = parseTemplate(template, 'template.html');
    ast.nodes.forEach((node) => node.visit(visitor));

    expect(visitor.getIssues()).toHaveLength(2);
    expect(visitor.getIssues()).toEqual([
      expect.objectContaining({
        message: expect.stringContaining('CounterComponent'),
        severity: 'error',
        source: expect.objectContaining({
          file: 'template.html',
          position: expect.any(Object),
        }),
      }),
      expect.objectContaining({
        message: expect.stringContaining('CounterComponent'),
        severity: 'error',
        source: expect.objectContaining({
          file: 'template.html',
          position: expect.any(Object),
        }),
      }),
    ]);
  });

  it('should find all nodes with *ngFor', () => {
    const template = `
        <div id="1" *ngFor="let item of [1,2,3]" class="count"></div>
      `;

    const ast = parseTemplate(template, 'template.html');
    ast.nodes.forEach((node) => node.visit(visitor));

    expect(visitor.getIssues()).toStrictEqual([
      expect.objectContaining({
        message: expect.stringContaining('CounterComponent'),
        severity: 'error',
        source: expect.objectContaining({
          file: 'template.html',
          position: expect.any(Object),
        }),
      }),
    ]);
  });

  it('should find all nodes with *switch', () => {
    const template = `
        <ng-container *ngSwitchCase="userPermissions">
          <ng-container *ngSwitchCase="'admin'">
            <div id="1" class="count"></div>
          </ng-container>
           <ng-container *ngSwitchCase="'reviewer'">

          </ng-container>
            <ng-container *ngSwitchDefault>

          </ng-container>
        </ng-container>
      `;

    const ast = parseTemplate(template, 'template.html');
    ast.nodes.forEach((node) => node.visit(visitor));

    expect(visitor.getIssues()).toStrictEqual([
      expect.objectContaining({
        message: expect.stringContaining('CounterComponent'),
        severity: 'error',
        source: expect.objectContaining({
          file: 'template.html',
          position: expect.any(Object),
        }),
      }),
    ]);
  });

  it('should find all nodes inside @switch', () => {
    const template = `
          @switch (userPermissions) {
            @case ('admin') {
              <div id="1" class="count"></div>
            }
            @case ('reviewer') {

            }
            @case ('editor') {

            }
            @default {

            }
          }
        `;

    const ast = parseTemplate(template, 'template.html');
    ast.nodes.forEach((node) => node.visit(visitor));

    expect(visitor.getIssues()).toStrictEqual([
      expect.objectContaining({
        message: expect.stringContaining('CounterComponent'),
        severity: 'error',
        source: expect.objectContaining({
          file: 'template.html',
          position: expect.any(Object),
        }),
      }),
    ]);
  });

  it('should find all nodes inside @defer', () => {
    const template = `
          @defer {
              <div id="1" class="count"></div>
          }
        `;

    const ast = parseTemplate(template, 'template.html');
    ast.nodes.forEach((node) => node.visit(visitor));

    expect(visitor.getIssues()).toStrictEqual([
      expect.objectContaining({
        message: expect.stringContaining('CounterComponent'),
        severity: 'error',
        source: expect.objectContaining({
          file: 'template.html',
          position: expect.any(Object),
        }),
      }),
    ]);
  });

  it('should find deprecated classes in interpolated class attributes', () => {
    const template = `<div class="count count-{{ size() }} other-class">Content</div>`;

    const ast = parseTemplate(template, 'template.html');
    ast.nodes.forEach((node) => node.visit(visitor));

    expect(visitor.getIssues()).toStrictEqual([
      expect.objectContaining({
        message: expect.stringContaining('CounterComponent'),
        severity: 'error',
        source: expect.objectContaining({
          file: 'template.html',
          position: expect.any(Object),
        }),
      }),
    ]);
  });

  // Deduplication tests
  describe('deduplication', () => {
    it('should deduplicate multiple deprecated classes in same class attribute', () => {
      const template = `<div class="count count-badge other-class">Content</div>`;

      const ast = parseTemplate(template, 'template.html');
      ast.nodes.forEach((node) => node.visit(visitor));

      expect(visitor.getIssues()).toHaveLength(1);
      const message = visitor.getIssues()[0].message;
      expect(message).toContain('count, count-badge');
      expect(message).toContain('CounterComponent');
      expect(visitor.getIssues()[0]).toEqual(
        expect.objectContaining({
          severity: 'error',
          source: expect.objectContaining({
            file: 'template.html',
            position: expect.any(Object),
          }),
        }),
      );
    });

    it('should deduplicate multiple deprecated classes in ngClass array', () => {
      const template = `<div [ngClass]="['count', 'count-badge', 'other-class']">Content</div>`;

      const ast = parseTemplate(template, 'template.html');
      ast.nodes.forEach((node) => node.visit(visitor));

      expect(visitor.getIssues()).toHaveLength(1);
      const message = visitor.getIssues()[0].message;
      expect(message).toContain('count, count-badge');
      expect(message).toContain('CounterComponent');
      expect(visitor.getIssues()[0]).toEqual(
        expect.objectContaining({
          severity: 'error',
          source: expect.objectContaining({
            file: 'template.html',
            position: expect.any(Object),
          }),
        }),
      );
    });

    it('should deduplicate multiple deprecated classes in ngClass object', () => {
      const template = `<div [ngClass]="{ count: true, 'count-badge': true, other: false }">Content</div>`;

      const ast = parseTemplate(template, 'template.html');
      ast.nodes.forEach((node) => node.visit(visitor));

      expect(visitor.getIssues()).toHaveLength(1);
      const message = visitor.getIssues()[0].message;
      expect(message).toContain('count, count-badge');
      expect(message).toContain('CounterComponent');
      expect(visitor.getIssues()[0]).toEqual(
        expect.objectContaining({
          severity: 'error',
          source: expect.objectContaining({
            file: 'template.html',
            position: expect.any(Object),
          }),
        }),
      );
    });

    it('should still create single issue for single deprecated class', () => {
      const template = `<div class="count other-class">Content</div>`;

      const ast = parseTemplate(template, 'template.html');
      ast.nodes.forEach((node) => node.visit(visitor));

      expect(visitor.getIssues()).toHaveLength(1);
      const message = visitor.getIssues()[0].message;
      expect(message).toContain('count');
      expect(message).not.toContain(',');
      expect(message).toContain('CounterComponent');
      expect(visitor.getIssues()[0]).toEqual(
        expect.objectContaining({
          severity: 'error',
          source: expect.objectContaining({
            file: 'template.html',
            position: expect.any(Object),
          }),
        }),
      );
    });

    it('should deduplicate three deprecated classes in same class attribute', () => {
      const template = `<div class="count count-badge count-item other-class">Content</div>`;

      const ast = parseTemplate(template, 'template.html');
      ast.nodes.forEach((node) => node.visit(visitor));

      expect(visitor.getIssues()).toHaveLength(1);
      const message = visitor.getIssues()[0].message;
      expect(message).toContain('count, count-badge, count-item');
      expect(message).toContain('CounterComponent');
      expect(visitor.getIssues()[0]).toEqual(
        expect.objectContaining({
          severity: 'error',
          source: expect.objectContaining({
            file: 'template.html',
            position: expect.any(Object),
          }),
        }),
      );
    });
  });
});
