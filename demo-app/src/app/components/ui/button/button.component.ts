import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { rxHostPressedListener } from '../rx-host-listener/rx-host-listener';

export const DS_BUTTON_VARIANT_ARRAY = [
  'primary',
  'primary-strong',
  'primary-subtle',
  'secondary',
  'secondary-strong',
  'secondary-subtle',
  'success',
  'success-strong',
  'success-subtle',
  'danger',
  'danger-strong',
  'danger-subtle',
  'warning',
  'warning-strong',
  'warning-subtle',
  'info',
  'info-strong',
  'info-subtle',
  'neutral',
  'neutral-strong',
  'neutral-subtle',
  'ghost',
  'outline',
] as const;

export type DsButtonVariant = (typeof DS_BUTTON_VARIANT_ARRAY)[number];

export const DS_BUTTON_SIZE_ARRAY = [
  'xsmall',
  'small',
  'medium',
  'large',
] as const;
export type DsButtonSize = (typeof DS_BUTTON_SIZE_ARRAY)[number];

export const DS_BUTTON_TYPE_ARRAY = ['button', 'submit', 'reset'] as const;
export type DsButtonType = (typeof DS_BUTTON_TYPE_ARRAY)[number];

@Component({
  selector: 'ds-button',
  template: `
    <div class="ds-button-slot-container ds-button-start">
      <ng-content select="[slot=start]" />
    </div>
    <span class="ds-button-text">
      <ng-content />
    </span>
    <div class="ds-button-slot-container ds-button-end">
      <ng-content select="[slot=end]" />
    </div>
  `,
  host: {
    '[class]': 'hostClass()',
    '[class.ds-button-disabled]': 'disabled()',
    '[class.ds-button-inverse]': 'inverse()',
    '[class.ds-button-loading]': 'loading()',
    '[class.ds-button-full-width]': 'fullWidth()',
    '[attr.aria-label]': 'getAriaLabel()',
    '[attr.aria-disabled]': 'disabled()',
    '[attr.disabled]': 'disabled() ? true : null',
    '[attr.type]': 'type()',
    role: 'button',
    tabindex: '0',
  },
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./button.component.scss'],
})
export class DsButton {
  size = input<DsButtonSize>('medium');
  variant = input<DsButtonVariant>('primary');
  type = input<DsButtonType>('button');
  disabled = input(false, { transform: booleanAttribute });
  loading = input(false, { transform: booleanAttribute });
  inverse = input(false, { transform: booleanAttribute });
  fullWidth = input(false, { transform: booleanAttribute });
  ariaLabel = input<string>('');

  readonly click = output<MouseEvent>();
  readonly focus = output<FocusEvent>();
  readonly blur = output<FocusEvent>();

  hostClass = computed(
    () => `ds-button ds-button-${this.size()} ds-button-${this.variant()}`,
  );

  constructor(public elementRef: ElementRef<HTMLElement>) {
    // Handle click events using the reactive host listener
    rxHostPressedListener()
      .pipe(takeUntilDestroyed())
      .subscribe((event) => {
        if (!this.disabled() && !this.loading()) {
          this.click.emit(event);
        }
      });
  }

  public getAriaLabel(): string {
    if (this.ariaLabel()) {
      return this.ariaLabel();
    }

    const mainContent = this.elementRef.nativeElement
      .querySelector('.ds-button-text')
      ?.textContent?.trim();

    const label = mainContent || 'Button';

    if (this.disabled()) {
      return `Disabled button: ${label}`;
    }

    if (this.loading()) {
      return `Loading button: ${label}`;
    }

    return `Button: ${label}`;
  }
}
