import {
  visitComponentTemplate,
  visitEachTmplChild,
  NoopTmplVisitor,
  parseClassNames,
  ParsedComponent,
} from '@push-based/angular-ast-utils';
import {
  extractBindings,
  extractAttributes,
  extractEvents,
} from './element-helpers.js';
import type {
  TmplAstNode,
  TmplAstElement,
  TmplAstForLoopBlock,
  TmplAstIfBlock,
  TmplAstSwitchBlock,
  TmplAstDeferredBlock,
  TmplAstContent,
  TmplAstTemplate,
} from '@angular/compiler' with { 'resolution-mode': 'import' };
import type {
  Slots,
  DomStructure,
  StructuralDirectiveContext,
} from '../../shared/models/types.js';

/**
 * Extract both content projection slots (ng-content) and DOM structure
 * in a single pass over the component template for better performance
 */
export async function extractSlotsAndDom(
  parsedComponent: ParsedComponent,
): Promise<{ slots: Slots; dom: DomStructure }> {
  const slots: Slots = {};
  const dom: DomStructure = {};

  await visitComponentTemplate(
    parsedComponent,
    {},
    async (_, templateAsset) => {
      const parsedTemplate = await templateAsset.parse();
      const visitor = new DomAndSlotExtractionVisitor(slots, dom);
      visitEachTmplChild(parsedTemplate.nodes as TmplAstNode[], visitor);
      return [];
    },
  );

  return { slots, dom };
}

/**
 * Combined visitor to extract ng-content slots and build DOM structure in a single pass
 */
class DomAndSlotExtractionVisitor extends NoopTmplVisitor {
  private slotCounter = 0;
  private pathStack: string[] = [];

  /**
   * Stack of active structural directive contexts so that nested elements inherit
   * the directive information of all parent control-flow blocks.
   */
  private directiveStack: StructuralDirectiveContext[] = [];

  constructor(
    private slots: Slots,
    private dom: DomStructure,
  ) {
    super();
  }

  override visitElement(element: TmplAstElement): void {
    // skip explicit handling of <ng-content> here – it is visited by visitContent

    const selectorKey = this.generateSelectorKey(element);
    const parentKey =
      this.pathStack.length > 0 ? this.pathStack.join(' > ') : null;

    this.dom[selectorKey] = {
      tag: element.name,
      parent: parentKey,
      children: [],
      bindings: extractBindings(element),
      attributes: extractAttributes(element),
      events: extractEvents(element),
      structural:
        this.directiveStack.length > 0
          ? // spread to detach reference
            [...this.directiveStack]
          : undefined,
    };

    if (parentKey && this.dom[parentKey]) {
      this.dom[parentKey].children.push(selectorKey);
    }

    // Push only the current element's selector to the stack
    const currentSelector = this.generateCurrentElementSelector(element);
    this.pathStack.push(currentSelector);
    visitEachTmplChild(element.children as TmplAstNode[], this);
    this.pathStack.pop();
  }

  private visitBlockWithChildren(block: { children?: TmplAstNode[] }): void {
    if (block.children) {
      visitEachTmplChild(block.children as TmplAstNode[], this);
    }
  }

  override visitForLoopBlock(block: TmplAstForLoopBlock): void {
    const ctx: StructuralDirectiveContext = {
      kind: 'for',
      expression: (block as any).expression?.source ?? undefined,
      alias: (block as any).item?.name ?? undefined,
    };
    this.directiveStack.push(ctx);
    this.visitBlockWithChildren(block);
    block.empty?.visit(this);
    this.directiveStack.pop();
  }

  override visitIfBlock(block: TmplAstIfBlock): void {
    const outerCtx: StructuralDirectiveContext = { kind: 'if' };
    this.directiveStack.push(outerCtx);
    block.branches.forEach((branch) => branch.visit(this));
    this.directiveStack.pop();
  }

  override visitSwitchBlock(block: TmplAstSwitchBlock): void {
    const ctx: StructuralDirectiveContext = {
      kind: 'switch',
      expression: (block as any).expression?.source ?? undefined,
    };
    this.directiveStack.push(ctx);
    block.cases.forEach((caseBlock) => caseBlock.visit(this));
    this.directiveStack.pop();
  }

  override visitDeferredBlock(deferred: TmplAstDeferredBlock): void {
    const ctx: StructuralDirectiveContext = { kind: 'defer' };
    this.directiveStack.push(ctx);
    deferred.visitAll(this);
    this.directiveStack.pop();
  }

  /**
   * Handle <ng-content> projection points represented in the Angular template AST as TmplAstContent.
   * Recognises default, attribute-selector ([slot=foo]) and legacy slot=foo syntaxes.
   */
  override visitContent(content: TmplAstContent): void {
    const selectValue = content.selector ?? '';
    const slotName = selectValue ? this.parseSlotName(selectValue) : 'default';

    this.slots[slotName] = {
      selector: selectValue
        ? `ng-content[select="${selectValue}"]`
        : 'ng-content',
    };
  }

  private parseSlotName(selectValue: string): string {
    // Matches [slot=foo], [slot='foo'], [slot="foo"], slot=foo  (case-insensitive)
    const match = selectValue.match(
      /(?:^\[?)\s*slot\s*=\s*['"]?([^'" \]\]]+)['"]?\]?$/i,
    );
    if (match) {
      return match[1];
    }

    if (selectValue.startsWith('.')) {
      return selectValue.substring(1);
    }

    return selectValue || `slot-${this.slotCounter++}`;
  }

  private generateSelectorKey(element: TmplAstElement): string {
    const currentSelector = this.generateCurrentElementSelector(element);

    return this.pathStack.length > 0
      ? `${this.pathStack.join(' > ')} > ${currentSelector}`
      : currentSelector;
  }

  private generateCurrentElementSelector(element: TmplAstElement): string {
    const classes = this.extractClasses(element);
    const id = element.attributes.find((attr) => attr.name === 'id')?.value;

    let selector = element.name;
    if (id) selector += `#${id}`;
    if (classes.length > 0) selector += '.' + classes.join('.');

    return selector;
  }

  private extractClasses(element: TmplAstElement): string[] {
    const out = new Set<string>();

    const classAttr = element.attributes.find((attr) => attr.name === 'class');
    if (classAttr) {
      parseClassNames(classAttr.value).forEach((cls) => out.add(cls));
    }

    element.inputs
      .filter((input) => input.name.startsWith('class.'))
      .forEach((input) => out.add(input.name.substring(6)));

    return [...out];
  }

  /** Legacy structural directives on <ng-template> (e.g., *ngIf, *ngFor). */
  override visitTemplate(template: TmplAstTemplate): void {
    const dir = template.templateAttrs?.find?.((a: any) =>
      a.name?.startsWith?.('ng'),
    );

    if (!dir) {
      // Just traverse children when no structural directive is present
      this.visitBlockWithChildren(template);
      return;
    }

    const map: Record<string, StructuralDirectiveContext['kind']> = {
      ngIf: 'if',
      ngForOf: 'for',
      ngSwitch: 'switch',
      ngSwitchCase: 'switchCase',
      ngSwitchDefault: 'switchDefault',
    } as const;

    const kind = map[dir.name as keyof typeof map];

    // If the directive is not one we're interested in, skip recording
    if (!kind) {
      this.visitBlockWithChildren(template);
      return;
    }

    const ctx: StructuralDirectiveContext = {
      kind,
      expression: (dir as any).value as string | undefined,
    };

    this.directiveStack.push(ctx);
    this.visitBlockWithChildren(template);
    this.directiveStack.pop();
  }
}

/**
 * Attach simple "just traverse children" visitors dynamically to
 * avoid eight nearly identical class methods above.
 */
const SIMPLE_VISIT_METHODS = [
  'visitForLoopBlockEmpty',
  'visitIfBlockBranch',
  'visitSwitchBlockCase',
  'visitDeferredBlockError',
  'visitDeferredBlockLoading',
  'visitDeferredBlockPlaceholder',
  // 'visitTemplate',
] as const;

SIMPLE_VISIT_METHODS.forEach((method) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (DomAndSlotExtractionVisitor.prototype as any)[method] = function (
    this: DomAndSlotExtractionVisitor,
    block: { children?: TmplAstNode[] },
  ): void {
    if (block.children) {
      visitEachTmplChild(block.children as TmplAstNode[], this);
    }
  };
});
