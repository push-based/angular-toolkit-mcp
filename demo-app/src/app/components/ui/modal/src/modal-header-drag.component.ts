import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';

@Component({
  standalone: true,
  selector: 'ds-modal-header-drag',
  host: {
    class: 'ds-modal-header-drag',
    role: 'dialog',
    'aria-label': 'Modal header drag dialog',
  },
  template: `<span class="ds-modal-header-drag-rectangle"></span>`,
  styleUrls: ['./modal-header-drag.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class DsModalHeaderDrag {}
