import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  inject,
  input,
} from '@angular/core';
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheet,
  MatBottomSheetModule,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';

import { DemoCloseIconComponent } from '@design-system/storybook-demo-cmp-lib';
import { DsButton } from '@frontend/ui/button';
import { DsButtonIcon } from '@frontend/ui/button-icon';
import {
  DsModal,
  DsModalContent,
  DsModalHeader,
  DsModalHeaderVariant,
  DsModalVariant,
} from '@frontend/ui/modal';

@Component({
  selector: 'ds-demo-dialog-cmp',
  imports: [
    MatDialogModule,
    DsButton,
    DsModalHeader,
    DsButtonIcon,
    DemoCloseIconComponent,
    DsModal,
    DsModalContent,
  ],
  standalone: true,
  template: `
    <ds-modal
      [inverse]="data.inverse"
      [bottomSheet]="data.bottomSheet"
      [variant]="data.variant"
    >
      <ds-modal-header [variant]="data.headerVariant">
        <div slot="start">
          <div slot="title">Hello start</div>
          <div slot="subtitle">Header subtitle</div>
        </div>

        <button slot="end" ds-button-icon size="small" (click)="close()">
          Close
        </button>
      </ds-modal-header>
      <ds-modal-content>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquam,
        ducimus, sequi! Ab consequatur earum expedita fugit illo illum in
        maiores nihil nostrum officiis ratione repellendus temporibus, vel!
        <br />
        <br />
        <b>Lorem ipsum dolor sit amet</b>, consectetur adipisicing elit.
        Aliquam, ducimus, sequi! Ab consequatur earum expedita fugit illo illum
        in maiores nihil nostrum officiis ratione repellendus temporibus, vel!
        <br />
        <br />
        <div class="footer-buttons">
          <button
            ds-button
            [inverse]="data.inverse"
            kind="secondary"
            variant="outline"
            mat-dialog-close
          >
            Outline Button
          </button>
          <button
            ds-button
            [inverse]="data.inverse"
            kind="primary"
            variant="filled"
            mat-dialog-close
          >
            Filled Button
          </button>
        </div>
      </ds-modal-content>
    </ds-modal>
  `,
  styles: `
    ds-modal {
      width: 400px;
      min-height: 300px;
      margin-left: auto;
      margin-right: auto;
    }

    .footer-buttons {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoModalCmp {
  dialogRef = inject(MatDialogRef<DemoModalCmp>, { optional: true });
  bottomSheetRef = inject(MatBottomSheetRef<DemoModalCmp>, { optional: true });
  dialogData = inject(MAT_DIALOG_DATA, { optional: true });
  bottomSheetData = inject(MAT_BOTTOM_SHEET_DATA, { optional: true });

  data = this.dialogData ?? this.bottomSheetData ?? {}; // fallback to empty {}

  close() {
    this.dialogRef?.close();
    this.bottomSheetRef?.dismiss();
  }
}

@Component({
  selector: 'ds-demo-dialog-container',
  standalone: true,
  imports: [MatDialogModule, MatBottomSheetModule, DsButton],
  template: `
    <button ds-button (click)="openDialog()">Open with Material Dialog</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoModalContainer {
  dialog = inject(MatDialog);
  bottomSheet = inject(MatBottomSheet);

  headerVariant = input<DsModalHeaderVariant>();
  variant = input<DsModalVariant>();
  inverse = input(false, { transform: booleanAttribute });
  bottomSheetInput = input(false, { transform: booleanAttribute });

  openDialog() {
    const data = {
      headerVariant: this.headerVariant(),
      inverse: this.inverse(),
      variant: this.variant(),
      bottomSheet: this.bottomSheetInput(),
    };

    if (data.bottomSheet) {
      this.bottomSheet.open(DemoModalCmp, {
        data,
        panelClass: 'ds-bottom-sheet-panel',
      });
    } else {
      this.dialog.open(DemoModalCmp, {
        data,
        panelClass: 'ds-dialog-panel',
      });
    }
  }
}
