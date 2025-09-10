import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
} from '@angular/core';

export const DS_BADGE_VARIANT_ARRAY = [
  'primary',
  'primary-strong',
  'primary-subtle',
  'secondary',
  'secondary-strong',
  'secondary-subtle',
  'green',
  'green-strong',
  'green-subtle',
  'blue',
  'blue-strong',
  'blue-subtle',
  'red',
  'red-strong',
  'red-subtle',
  'purple',
  'purple-strong',
  'purple-subtle',
  'neutral',
  'neutral-strong',
  'neutral-subtle',
  'yellow',
  'yellow-strong',
  'yellow-subtle',
  'orange',
  'orange-strong',
  'orange-subtle',
] as const;

export type DsBadgeVariant = (typeof DS_BADGE_VARIANT_ARRAY)[number];

export const DS_BADGE_SIZE_ARRAY = ['xsmall', 'medium'] as const;
export type DsBadgeSize = (typeof DS_BADGE_SIZE_ARRAY)[number];

@Component({
  selector: 'ds-badge',
  template: `
    <div class="ds-badge-slot-container">
      <ng-content select="[slot=start]" />
    </div>
    <span class="ds-badge-text">
      <ng-content />
    </span>
    <div class="ds-badge-slot-container">
      <ng-content select="[slot=end]" />
    </div>
  `,
  host: {
    '[class]': 'hostClass()',
    '[class.ds-badge-disabled]': 'disabled()',
    '[class.ds-badge-inverse]': 'inverse()',
    '[attr.aria-label]': 'getAriaLabel()',
    role: 'img', // for now we are using role img till we find better solution to work with nvda
  },
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./badge.component.scss'],
})
export class DsBadge {
  size = input<DsBadgeSize>('medium');
  variant = input<DsBadgeVariant>('primary');
  disabled = input(false, { transform: booleanAttribute });
  inverse = input(false, { transform: booleanAttribute });

  hostClass = computed(
    () => `ds-badge ds-badge-${this.size()} ds-badge-${this.variant()}`,
  );

  constructor(public elementRef: ElementRef<HTMLElement>) {}

  public getAriaLabel(): string {
    const mainContent = this.elementRef.nativeElement
      .querySelector('.ds-badge-text')
      ?.textContent?.trim();

    const label = mainContent || '';

    if (this.disabled()) {
      return `Disabled badge: ${label}`;
    }
    return `Badge: ${label}`;
  }
}
