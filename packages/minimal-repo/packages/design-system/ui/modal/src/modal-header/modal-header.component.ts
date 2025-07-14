import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  inject,
  input,
} from '@angular/core';

import { DsModalContext } from '../modal.component';

export const DS_MODAL_HEADER_VARIANT_ARRAY = [
  'surface-lowest',
  'surface-low',
  'surface',
  'surface-high',
  'nav-bg',
] as const;
export type DsModalHeaderVariant =
  (typeof DS_MODAL_HEADER_VARIANT_ARRAY)[number];

@Component({
  selector: 'ds-modal-header',
  standalone: true,
  template: `
    <div class="ds-modal-header-container">
      <div class="ds-modal-header-start">
        <ng-content select="[slot=start]" />
      </div>
      <div class="ds-modal-header-center">
        <ng-content select="[slot=center]" />
        <ng-content select="ds-modal-header-drag, [modal-header-image]" />
      </div>
      <div class="ds-modal-header-end">
        <ng-content select="[slot=end]" />
      </div>
    </div>
  `,
  host: {
    class: 'ds-modal-header',
    '[class]': 'hostClass()',
    '[class.ds-modal-header-inverse]': 'context.inverse()',
    role: 'dialog',
    'aria-label': 'Modal header dialog',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class DsModalHeader {
  variant = input<DsModalHeaderVariant>('surface');
  protected context = inject(DsModalContext);

  protected hostClass = computed(() => `ds-modal-header-${this.variant()}`);
}
