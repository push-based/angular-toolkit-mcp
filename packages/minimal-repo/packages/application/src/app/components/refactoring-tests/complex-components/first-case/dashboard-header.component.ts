import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  computed,
  input,
  output,
  signal,
  booleanAttribute,
  OnInit,
  OnDestroy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DsBadge, DsBadgeVariant } from '@frontend/ui/badge';
import { Subject, interval, takeUntil } from 'rxjs';

export const OFFER_BADGE_TYPES = ['limited', 'premium', 'new', 'hot', 'sale'] as const;
export type OfferBadgeType = (typeof OFFER_BADGE_TYPES)[number];

export const OFFER_BADGE_SIZES = ['small', 'medium', 'large'] as const;
export type OfferBadgeSize = (typeof OFFER_BADGE_SIZES)[number];

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: 'info' | 'warning' | 'error' | 'success';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  lastLogin: Date;
}

@Component({
  selector: 'app-dashboard-header',
  standalone: true,
  imports: [CommonModule, FormsModule, DsBadge],
  templateUrl: './dashboard-header.component.html',
  styleUrls: ['./dashboard-header.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardHeaderComponent implements OnInit, OnDestroy {
  // Offer Badge Inputs
  badgeType = input<OfferBadgeType>('premium');
  badgeSize = input<OfferBadgeSize>('medium');
  animated = input(true, { transform: booleanAttribute });
  pulsing = input(false, { transform: booleanAttribute });
  dismissible = input(true, { transform: booleanAttribute });
  
  // General Inputs
  searchDisabled = input(false, { transform: booleanAttribute });
  darkMode = input(false, { transform: booleanAttribute });
  userProfile = input<UserProfile | null>(null);
  
  // Outputs
  searchPerformed = output<string>();
  badgeDismissed = output<void>();
  notificationClicked = output<NotificationItem>();
  userActionClicked = output<string>();
  themeToggled = output<boolean>();

  // Internal State
  searchQuery = signal('');
  searchFocused = signal(false);
  showNotifications = signal(false);
  showUserMenu = signal(false);
  notifications = signal<NotificationItem[]>([]);
  searchSuggestions = signal<{id: string, text: string}[]>([]);
  
  private destroy$ = new Subject<void>();
  private elementRef = inject(ElementRef);

  // Computed values
  unreadNotifications = computed(() => 
    this.notifications().filter(n => !n.read).length
  );

  defaultBadgeText = computed(() => {
    const typeMap: Record<OfferBadgeType, string> = {
      'limited': 'Limited Time',
      'premium': 'Premium',
      'new': 'New Feature',
      'hot': 'Hot Deal',
      'sale': 'On Sale'
    };
    return typeMap[this.badgeType()];
  });

  getBadgeVariant = computed((): DsBadgeVariant => {
    const variantMap: Record<OfferBadgeType, DsBadgeVariant> = {
      'premium': 'purple-strong',
      'limited': 'red-strong',
      'new': 'green-strong',
      'hot': 'orange-strong',
      'sale': 'blue-strong'
    };
    return variantMap[this.badgeType()];
  });

  ngOnInit() {
    this.initializeMockData();
    this.setupAutoRefresh();
    this.setupClickOutsideHandlers();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeMockData() {
    // Mock notifications
    this.notifications.set([
      {
        id: '1',
        title: 'System Update',
        message: 'New dashboard features are now available',
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        read: false,
        type: 'info'
      },
      {
        id: '2',
        title: 'Payment Processed',
        message: 'Your monthly subscription has been renewed',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        read: true,
        type: 'success'
      },
      {
        id: '3',
        title: 'Storage Warning',
        message: 'You are running low on storage space',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        read: false,
        type: 'warning'
      }
    ]);

    // Mock search suggestions
    this.searchSuggestions.set([
      { id: '1', text: 'Analytics Dashboard' },
      { id: '2', text: 'User Management' },
      { id: '3', text: 'Settings & Preferences' },
      { id: '4', text: 'Reports & Export' }
    ]);
  }

  private setupAutoRefresh() {
    // Refresh notifications every 30 seconds
    interval(30000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        // In a real app, this would fetch new notifications
        console.log('Refreshing notifications...');
      });
  }

  private setupClickOutsideHandlers() {
    document.addEventListener('click', this.handleClickOutside.bind(this));
  }

  private handleClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!this.elementRef.nativeElement.contains(target)) {
      this.showNotifications.set(false);
      this.showUserMenu.set(false);
      this.searchFocused.set(false);
    }
  }

  // Badge Methods

  dismissBadge() {
    this.badgeDismissed.emit();
  }

  hasIconSlot(): boolean {
    return !!this.elementRef.nativeElement.querySelector('[slot=start]');
  }

  hasContent(): boolean {
    const textContent = this.elementRef.nativeElement
      .querySelector('.ds-badge-text')
      ?.textContent?.trim();
    return !!textContent;
  }

  // Search Methods
  performSearch() {
    if (this.searchQuery().trim()) {
      this.searchPerformed.emit(this.searchQuery());
    }
  }

  clearSearch() {
    this.searchQuery.set('');
  }

  selectSuggestion(suggestion: {id: string, text: string}) {
    this.searchQuery.set(suggestion.text);
    this.searchFocused.set(false);
    this.performSearch();
  }

  // Notification Methods
  toggleNotifications() {
    this.showNotifications.update(show => !show);
    this.showUserMenu.set(false);
  }

  markAllNotificationsRead() {
    this.notifications.update(notifications =>
      notifications.map(n => ({ ...n, read: true }))
    );
  }

  dismissNotification(id: string) {
    this.notifications.update(notifications =>
      notifications.filter(n => n.id !== id)
    );
  }

  formatTime(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }

  // User Menu Methods
  toggleUserMenu() {
    this.showUserMenu.update(show => !show);
    this.showNotifications.set(false);
  }

  getUserInitials(): string {
    const name = this.userProfile()?.name || 'User';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  navigateToProfile() {
    this.userActionClicked.emit('profile');
    this.showUserMenu.set(false);
  }

  navigateToPreferences() {
    this.userActionClicked.emit('preferences');
    this.showUserMenu.set(false);
  }

  toggleTheme() {
    const newTheme = !this.darkMode();
    this.themeToggled.emit(newTheme);
    this.showUserMenu.set(false);
  }

  logout() {
    this.userActionClicked.emit('logout');
    this.showUserMenu.set(false);
  }
} 