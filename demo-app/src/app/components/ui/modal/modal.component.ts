import {
  ChangeDetectionStrategy,
  Component,
  Signal,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';

export const DS_MODAL_VARIANT_ARRAY = [
  'surface-lowest',
  'surface-low',
  'surface',
] as const;
export type DsModalVariant = (typeof DS_MODAL_VARIANT_ARRAY)[number];
export class DsModalContext {
  inverse: Signal<boolean> = signal(false); // Explicit type
}

@Component({
  selector: 'ds-modal',
  template: `<ng-content />`,
  host: {
    class: 'ds-modal',
    role: 'dialog',
    'aria-label': 'Modal dialog',
    '[class.ds-modal-inverse]': 'inverse()',
    '[class.ds-modal-bottom-sheet]': 'bottomSheet()',
    '[class]': 'hostClass()',
  },
  providers: [DsModalContext],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./modal.component.scss'],
})
export class DsModal {
  inverse = input(false, { transform: booleanAttribute });
  bottomSheet = input(false, { transform: booleanAttribute });
  variant = input<DsModalVariant>('surface');

  private context = inject(DsModalContext);

  protected hostClass = computed(() => `ds-modal-${this.variant()}`);

  constructor() {
    this.context.inverse = computed(() => this.inverse());
  }
}
