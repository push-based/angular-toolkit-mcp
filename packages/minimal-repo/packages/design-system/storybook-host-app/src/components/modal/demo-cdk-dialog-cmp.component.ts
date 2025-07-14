import {
  DIALOG_DATA,
  Dialog,
  DialogModule,
  DialogRef,
} from '@angular/cdk/dialog';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  Renderer2,
  ViewChild,
  booleanAttribute,
  inject,
  input,
} from '@angular/core';

import { DemoCloseIconComponent } from '@design-system/storybook-demo-cmp-lib';
import { DsButton } from '@frontend/ui/button';
import { DsButtonIcon } from '@frontend/ui/button-icon';
import {
  DsModal,
  DsModalContent,
  DsModalHeader,
  DsModalHeaderDrag,
  DsModalHeaderVariant,
  DsModalVariant,
} from '@frontend/ui/modal';

@Component({
  selector: 'ds-demo-cdk-dialog-cmp',
  imports: [
    DialogModule,
    DsButton,
    DsModalHeader,
    DsButtonIcon,
    DemoCloseIconComponent,
    DsModal,
    DsModalContent,
    DsModalHeaderDrag,
  ],
  standalone: true,
  template: `
    <ds-modal
      [inverse]="data.inverse"
      [bottomSheet]="data.bottomSheet"
      [variant]="data.variant"
    >
      <ds-modal-header [variant]="data.headerVariant">
        <ds-modal-header-drag #dragHandle />
        <button slot="end" ds-button-icon size="small" (click)="close()">
          <ds-demo-close-icon />
        </button>
      </ds-modal-header>
      <!-- eslint-disable-next-line @angular-eslint/template/no-inline-styles -->
      <div style="height: 400px; width: 400px; overflow: auto">
        <ds-modal-content>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquam,
          ducimus, sequi! Ab consequatur earum expedita fugit illo illum in
          maiores nihil nostrum officiis ratione repellendus temporibus, vel!
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquam,
          ducimus, sequi! Ab consequatur earum expedita fugit illo illum in
          maiores nihil nostrum officiis ratione repellendus temporibus, vel! Lo
          rem ipsum dolor sit amet, consectetur adipisicing elit. Aliquam,
          ducimus, sequi! Ab consequatur earum expedita fugit illo illum in
          maiores nihil nostrum officiis ratione repellendus temporibus, vel!
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquam,
          ducimus, sequi! Ab consequatur earum expedita fugit illo illum in
          maiores nihil nostrum officiis ratione repellendus temporibus, vel!
          Lorem ipsum Lorem ipsum dolor sit amet, consectetur adipisicing elit.
          Aliquam, ducimus, sequi! Ab consequatur earum expedita fugit illo
          illum in maiores nihil nostrum officiis ratione repellendus
          temporibus, vel! dolor sit amet, consectetur adipisicing elit.
          Aliquam, ducimus, sequi! Ab consequatur earum expedita fugit illo
          illum in maiores nihil nostrum officiis ratione repellendus
          temporibus, vel! Lorem ipsum dolor sit amet, consectetur adipisicing
          elit. Aliquam, ducimus, sequi! Ab consequatur earum expedita fugit
          illo illum in maiores nihil nostrum officiis ratione repellendus
          temporibus, vel! Lorem ipsum dolor sit amet, consectetur adipisicing
          elit. Aliquam, ducimus, sequi! Ab consequatur earum expedita fugit
          illo illum in maiores nihil nostrum officiis ratione repellendus
          temporibus, vel!
          <br />
          <br />
          <b>Lorem ipsum dolor sit amet</b>, consectetur adipisicing elit.
          Aliquam, ducimus, sequi! Ab consequatur earum expedita fugit illo
          illum in maiores nihil nostrum officiis ratione repellendus
          temporibus, vel!
          <br />
          <br />
          <div class="footer-buttons">
            <button
              ds-button
              [inverse]="data.inverse"
              kind="secondary"
              variant="outline"
              (click)="close()"
            >
              Outline Button
            </button>
            <button
              ds-button
              [inverse]="data.inverse"
              kind="primary"
              variant="filled"
              (click)="close()"
            >
              Filled Button
            </button>
          </div>
        </ds-modal-content>
      </div>
    </ds-modal>
  `,
  styles: [
    `
      ds-modal {
        width: 400px;
        min-height: 300px;
      }

      /* Bottom Sheet styles */
      :host-context(.ds-bottom-sheet-panel) ds-modal {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        margin-left: auto;
        margin-right: auto;
      }

      .footer-buttons {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoCdkModalCmp implements AfterViewInit {
  @ViewChild('dragHandle', { static: true, read: ElementRef })
  dragHandle!: ElementRef<HTMLElement>;
  @ViewChild(DsModal, { static: true, read: ElementRef })
  modalElementRef!: ElementRef<HTMLElement>;

  private renderer = inject(Renderer2);
  private isDragging = false;
  private startX = 0;
  private startY = 0;
  private initialLeft = 0;
  private initialTop = 0;
  private moveListener?: () => void;
  private upListener?: () => void;

  constructor(
    private dialogRef: DialogRef,
    @Inject(DIALOG_DATA)
    public data: { headerVariant: string; inverse: boolean; variant: string },
  ) {}

  ngAfterViewInit() {
    if (this.dragHandle) {
      this.renderer.listen(
        this.dragHandle.nativeElement,
        'mousedown',
        (event: MouseEvent) => this.startDrag(event),
      );
    }
  }

  startDrag(event: MouseEvent) {
    event.preventDefault();
    this.isDragging = true;

    const dialogEl = this.modalElementRef.nativeElement;

    const rect = dialogEl.getBoundingClientRect();
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.initialLeft = rect.left;
    this.initialTop = rect.top;

    this.moveListener = this.renderer.listen('document', 'mousemove', (e) =>
      this.onDragMove(e, dialogEl),
    );
    this.upListener = this.renderer.listen('document', 'mouseup', () =>
      this.endDrag(),
    );
  }

  private onDragMove(event: MouseEvent, dialogEl: HTMLElement) {
    if (!this.isDragging) return;

    const deltaX = event.clientX - this.startX;
    const deltaY = event.clientY - this.startY;

    const left = this.initialLeft + deltaX;
    const top = this.initialTop + deltaY;

    // Apply updated position
    this.renderer.setStyle(dialogEl, 'position', 'fixed');
    this.renderer.setStyle(dialogEl, 'left', `${left}px`);
    this.renderer.setStyle(dialogEl, 'top', `${top}px`);
    this.renderer.setStyle(dialogEl, 'margin', `0`);
  }

  private endDrag() {
    this.isDragging = false;
    this.moveListener?.();
    this.upListener?.();
  }

  close() {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'ds-demo-cdk-dialog-container',
  imports: [DialogModule, DsButton],
  standalone: true,
  template: `
    <button ds-button (click)="openDialog()">Open with CDK Dialog</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoCdkModalContainer {
  dialog = inject(Dialog);

  headerVariant = input<DsModalHeaderVariant>();
  inverse = input(false, { transform: booleanAttribute });
  variant = input<DsModalVariant>();
  bottomSheetInput = input(false, { transform: booleanAttribute });

  openDialog() {
    const isBottomSheet = this.bottomSheetInput();
    this.dialog.open(DemoCdkModalCmp, {
      panelClass: isBottomSheet ? 'ds-bottom-sheet-panel' : 'ds-dialog-panel',
      data: {
        headerVariant: this.headerVariant(),
        inverse: this.inverse(),
        variant: this.variant(),
        bottomSheet: isBottomSheet,
      },
    });
  }
}
