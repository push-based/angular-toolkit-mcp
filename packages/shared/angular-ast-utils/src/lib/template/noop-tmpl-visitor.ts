import type {
  TmplAstVisitor,
  TmplAstElement,
  TmplAstTemplate,
  TmplAstContent,
  TmplAstText,
  TmplAstBoundText,
  TmplAstIcu,
  TmplAstReference,
  TmplAstVariable,
  TmplAstBoundEvent,
  TmplAstBoundAttribute,
  TmplAstTextAttribute,
  TmplAstUnknownBlock,
  TmplAstDeferredBlock,
  TmplAstDeferredBlockError,
  TmplAstDeferredBlockLoading,
  TmplAstDeferredBlockPlaceholder,
  TmplAstDeferredTrigger,
  TmplAstIfBlock,
  TmplAstIfBlockBranch,
  TmplAstSwitchBlock,
  TmplAstSwitchBlockCase,
  TmplAstForLoopBlock,
  TmplAstForLoopBlockEmpty,
  TmplAstLetDeclaration,
} from '@angular/compiler' with { 'resolution-mode': 'import' };

/**
 * Base visitor that does nothing.
 * Extend this in concrete visitors so you only override what you need.
 */
export abstract class NoopTmplVisitor implements TmplAstVisitor<void> {
  /* eslint-disable @typescript-eslint/no-empty-function */
  visitElement(_: TmplAstElement): void {}
  visitTemplate(_: TmplAstTemplate): void {}
  visitContent(_: TmplAstContent): void {}
  visitText(_: TmplAstText): void {}
  visitBoundText(_: TmplAstBoundText): void {}
  visitIcu(_: TmplAstIcu): void {}
  visitReference(_: TmplAstReference): void {}
  visitVariable(_: TmplAstVariable): void {}
  visitBoundEvent(_: TmplAstBoundEvent): void {}
  visitBoundAttribute(_: TmplAstBoundAttribute): void {}
  visitTextAttribute(_: TmplAstTextAttribute): void {}
  visitUnknownBlock(_: TmplAstUnknownBlock): void {}
  visitDeferredBlock(_: TmplAstDeferredBlock): void {}
  visitDeferredBlockError(_: TmplAstDeferredBlockError): void {}
  visitDeferredBlockLoading(_: TmplAstDeferredBlockLoading): void {}
  visitDeferredBlockPlaceholder(_: TmplAstDeferredBlockPlaceholder): void {}
  visitDeferredTrigger(_: TmplAstDeferredTrigger): void {}
  visitIfBlock(_: TmplAstIfBlock): void {}
  visitIfBlockBranch(_: TmplAstIfBlockBranch): void {}
  visitSwitchBlock(_: TmplAstSwitchBlock): void {}
  visitSwitchBlockCase(_: TmplAstSwitchBlockCase): void {}
  visitForLoopBlock(_: TmplAstForLoopBlock): void {}
  visitForLoopBlockEmpty(_: TmplAstForLoopBlockEmpty): void {}
  visitLetDeclaration(_: TmplAstLetDeclaration): void {}
  /* eslint-enable */
}
