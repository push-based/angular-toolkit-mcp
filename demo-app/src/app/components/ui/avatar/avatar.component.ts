import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export const DS_AVATAR_SIZE_ARRAY = [
  'xsmall',
  'small',
  'medium',
  'large',
  'xlarge',
] as const;
export type DsAvatarSize = (typeof DS_AVATAR_SIZE_ARRAY)[number];

export const DS_AVATAR_VARIANT_ARRAY = [
  'circular',
  'rounded',
  'square',
] as const;
export type DsAvatarVariant = (typeof DS_AVATAR_VARIANT_ARRAY)[number];

export const DS_AVATAR_STATUS_ARRAY = [
  'online',
  'offline',
  'away',
  'busy',
] as const;
export type DsAvatarStatus = (typeof DS_AVATAR_STATUS_ARRAY)[number];

@Component({
  selector: 'ds-avatar',
  template: `
    <div class="ds-avatar-container">
      <img
        *ngIf="shouldShowImage()"
        [src]="src()"
        [alt]="alt()"
        class="ds-avatar-image"
      />
      <div *ngIf="!shouldShowImage()" class="ds-avatar-initials">
        {{ getInitials() }}
      </div>

      <div
        *ngIf="status()"
        class="ds-avatar-status"
        [class]="getStatusClass()"
        [attr.aria-label]="getStatusAriaLabel()"
      ></div>
    </div>
  `,
  host: {
    class: 'ds-avatar',
    '[class]': 'hostClass()',
    '[class.ds-avatar-disabled]': 'disabled()',
    '[attr.aria-label]': 'getAriaLabel()',
    role: 'img',
  },
  imports: [CommonModule],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./avatar.component.scss'],
})
export class DsAvatar {
  size = input<DsAvatarSize>('medium');
  variant = input<DsAvatarVariant>('circular');
  src = input<string>('');
  alt = input<string>('');
  name = input<string>('');
  status = input<DsAvatarStatus | null>(null);
  disabled = input(false, { transform: booleanAttribute });

  imageError = false;

  hostClass = computed(
    () => `ds-avatar-${this.size()} ds-avatar-${this.variant()}`,
  );

  constructor(public elementRef: ElementRef<HTMLElement>) {}

  shouldShowImage(): boolean {
    return !!this.src() && !this.imageError;
  }

  onImageError(): void {
    this.imageError = true;
  }

  getStatusClass(): string {
    return `ds-avatar-status-${this.status()}`;
  }

  getStatusAriaLabel(): string {
    return `${this.status()} status`;
  }

  getInitials(): string {
    const name = this.name();
    if (!name) return '?';

    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }

    return (
      words[0].charAt(0) + words[words.length - 1].charAt(0)
    ).toUpperCase();
  }

  getAriaLabel(): string {
    const name = this.name();
    const alt = this.alt();
    const status = this.status();

    let label = '';

    if (alt) {
      label = alt;
    } else if (name) {
      label = `Avatar for ${name}`;
    } else {
      label = 'User avatar';
    }

    if (status) {
      label += `, ${status} status`;
    }

    if (this.disabled()) {
      label = `Disabled ${label}`;
    }

    return label;
  }
}
