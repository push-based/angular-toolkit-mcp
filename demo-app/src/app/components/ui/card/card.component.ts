import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export const DS_CARD_VARIANT_ARRAY = [
  'default',
  'elevated',
  'outlined',
  'filled',
] as const;

export type DsCardVariant = (typeof DS_CARD_VARIANT_ARRAY)[number];

export const DS_CARD_SIZE_ARRAY = ['small', 'medium', 'large'] as const;
export type DsCardSize = (typeof DS_CARD_SIZE_ARRAY)[number];

@Component({
  selector: 'ds-card',
  template: `
    <div class="ds-card-header" *ngIf="hasHeader()">
      <ng-content select="[slot=header]" />
    </div>
    <div class="ds-card-content">
      <ng-content />
    </div>
    <div class="ds-card-footer" *ngIf="hasFooter()">
      <ng-content select="[slot=footer]" />
    </div>
  `,
  host: {
    class: 'ds-card',
    '[class]': 'hostClass()',
    '[class.ds-card-disabled]': 'disabled()',
    '[class.ds-card-interactive]': 'interactive()',
    '[attr.role]': 'interactive() ? "button" : null',
    '[attr.tabindex]': 'interactive() && !disabled() ? "0" : null',
    '[attr.aria-disabled]': 'disabled()',
  },
  imports: [CommonModule],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./card.component.scss'],
})
export class DsCard {
  size = input<DsCardSize>('medium');
  variant = input<DsCardVariant>('default');
  disabled = input(false, { transform: booleanAttribute });
  interactive = input(false, { transform: booleanAttribute });
  hasHeader = input(false, { transform: booleanAttribute });
  hasFooter = input(false, { transform: booleanAttribute });

  hostClass = computed(
    () => `ds-card-${this.size()} ds-card-${this.variant()}`,
  );
}
