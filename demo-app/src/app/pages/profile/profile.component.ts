import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: 'admin' | 'premium' | 'free';
  status: 'online' | 'offline' | 'away';
  verified: boolean;
  joinDate: string;
  messageCount: number;
  updateCount: number;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="retro-container">
      <!-- Filter Tabs -->
      <div class="filter-tabs">
        <button
          *ngFor="let tab of filterTabs"
          class="retro-tab"
          [class.active]="activeFilter() === tab.id"
          (click)="setActiveFilter(tab.id)"
        >
          {{ tab.label }}
          <span class="tab-count" *ngIf="tab.count > 0">({{ tab.count }})</span>
        </button>
      </div>

      <!-- Users Grid -->
      <div class="users-grid">
        <div
          *ngFor="let user of filteredUsers()"
          class="user-card"
          [ngClass]="{ 'premium-border': user.role === 'premium' }"
        >
          <!-- Avatar -->
          <div class="avatar-container">
            <div class="retro-avatar">
              <div class="avatar-inner">
                {{ user.username.charAt(0).toUpperCase() }}
              </div>
            </div>
          </div>

          <!-- User Info -->
          <div class="user-info">
            <h3 class="username">{{ user.fullName }}</h3>
            <div class="user-handle">&#64;{{ user.username }}</div>
            <div class="user-email">{{ user.email }}</div>

            <!-- Badges -->
            <div class="badge-container">
              <div class="retro-badge role-badge" [class]="'role-' + user.role">
                {{ user.role.toUpperCase() }}
              </div>
              <div
                class="retro-badge status-badge"
                [class]="'status-' + user.status"
              >
                {{ user.status.toUpperCase() }}
              </div>
              <div class="retro-badge verified-badge" *ngIf="user.verified">
                ✓ VERIFIED
              </div>
            </div>

            <!-- Notification Badges -->
            <div
              class="notification-badges"
              *ngIf="user.messageCount > 0 || user.updateCount > 0"
            >
              <div
                class="retro-badge notification-badge"
                *ngIf="user.messageCount > 0"
              >
                <span class="blink">{{ user.messageCount }}</span> MESSAGES
              </div>
              <div
                class="retro-badge notification-badge"
                *ngIf="user.updateCount > 0"
              >
                <span class="blink">{{ user.updateCount }}</span> UPDATES
              </div>
            </div>

            <!-- User Details -->
            <div class="user-details">
              <div class="detail-row">
                <span class="detail-label">Joined:</span>
                <span class="detail-value">{{ user.joinDate }}</span>
              </div>
            </div>

            <!-- Action Button -->
            <div class="user-actions">
              <button
                class="retro-button danger"
                [ngStyle]="{
                  border:
                    user.role === 'premium'
                      ? '2px solid rgb(195, 165, 0)'
                      : null,
                  color: user.role === 'premium' ? '#000000' : null,
                  background: user.role === 'premium' ? '#ffd501' : null,
                }"
                [disabled]="user.role === 'admin'"
                (click)="openDeleteModal(user)"
              >
                <span class="button-text">🗑️ DELETE USER</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div
        class="retro-modal-overlay"
        *ngIf="showDeleteModal()"
        (click)="closeDeleteModal()"
      >
        <div
          class="retro-modal delete-modal"
          (click)="$event.stopPropagation()"
        >
          <div class="modal-header">
            <h3 class="modal-title">
              <span class="blink">⚠️</span> Confirm Deletion
              <span class="blink">⚠️</span>
            </h3>
            <button
              class="retro-button close-button"
              (click)="closeDeleteModal()"
            >
              <span class="button-text">✖</span>
            </button>
          </div>

          <div class="modal-content">
            <div class="delete-confirmation">
              <p class="confirmation-text">
                Are you sure you want to delete this user?
              </p>
              <p class="warning-text">WARNING: This action cannot be undone!</p>
            </div>
          </div>

          <div class="modal-actions">
            <button
              class="retro-button danger large"
              (click)="confirmDelete()"
              [disabled]="isDeleting()"
            >
              <span class="button-text" *ngIf="!isDeleting()">
                🗑️ DELETE USER
              </span>
              <span class="button-text blink" *ngIf="isDeleting()">
                ⏳ DELETING...
              </span>
            </button>
            <button
              class="retro-button neutral large"
              (click)="closeDeleteModal()"
            >
              <span class="button-text">❌ CANCEL</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent {
  users = signal<User[]>([
    {
      id: 1,
      username: 'webmaster2000',
      email: 'webmaster@coolsite.com',
      fullName: 'John WebMaster',
      role: 'admin',
      status: 'online',
      verified: true,
      joinDate: 'January 15, 2000',
      messageCount: 3,
      updateCount: 5,
    },
    {
      id: 2,
      username: 'sarah_dev',
      email: 'sarah@techcorp.com',
      fullName: 'Sarah Developer',
      role: 'premium',
      status: 'away',
      verified: true,
      joinDate: 'March 22, 2001',
      messageCount: 0,
      updateCount: 2,
    },
    {
      id: 3,
      username: 'mike_user',
      email: 'mike@email.com',
      fullName: 'Mike Johnson',
      role: 'free',
      status: 'offline',
      verified: false,
      joinDate: 'July 8, 2002',
      messageCount: 7,
      updateCount: 0,
    },
    {
      id: 4,
      username: 'admin_lisa',
      email: 'lisa@company.org',
      fullName: 'Lisa Administrator',
      role: 'admin',
      status: 'online',
      verified: true,
      joinDate: 'November 3, 1999',
      messageCount: 12,
      updateCount: 8,
    },
    {
      id: 5,
      username: 'guest_bob',
      email: 'bob@guest.net',
      fullName: 'Bob Guest',
      role: 'free',
      status: 'away',
      verified: false,
      joinDate: 'September 14, 2003',
      messageCount: 1,
      updateCount: 0,
    },
    {
      id: 6,
      username: 'pro_anna',
      email: 'anna@professional.biz',
      fullName: 'Anna Professional',
      role: 'premium',
      status: 'online',
      verified: true,
      joinDate: 'February 28, 2001',
      messageCount: 4,
      updateCount: 3,
    },
  ]);

  showDeleteModal = signal(false);
  userToDelete = signal<User | null>(null);
  isDeleting = signal(false);
  activeFilter = signal('all');

  filterTabs = [
    { id: 'all', label: 'ALL USERS', count: 0 },
    { id: 'admin', label: 'ADMINS', count: 0 },
    { id: 'premium', label: 'PREMIUM', count: 0 },
    { id: 'free', label: 'FREE USERS', count: 0 },
    { id: 'online', label: 'ONLINE', count: 0 },
    { id: 'verified', label: 'VERIFIED', count: 0 },
  ];

  filteredUsers = computed(() => {
    const filter = this.activeFilter();
    const allUsers = this.users();

    // Update counts
    this.updateTabCounts(allUsers);

    switch (filter) {
      case 'admin':
        return allUsers.filter((user) => user.role === 'admin');
      case 'premium':
        return allUsers.filter((user) => user.role === 'premium');
      case 'free':
        return allUsers.filter((user) => user.role === 'free');
      case 'online':
        return allUsers.filter((user) => user.status === 'online');
      case 'verified':
        return allUsers.filter((user) => user.verified);
      default:
        return allUsers;
    }
  });

  setActiveFilter(filterId: string) {
    this.activeFilter.set(filterId);
  }

  updateTabCounts(users: User[]) {
    this.filterTabs[0].count = users.length; // All users
    this.filterTabs[1].count = users.filter((u) => u.role === 'admin').length;
    this.filterTabs[2].count = users.filter((u) => u.role === 'premium').length;
    this.filterTabs[3].count = users.filter((u) => u.role === 'free').length;
    this.filterTabs[4].count = users.filter(
      (u) => u.status === 'online',
    ).length;
    this.filterTabs[5].count = users.filter((u) => u.verified).length;
  }

  openDeleteModal(user: User) {
    this.userToDelete.set(user);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal() {
    this.showDeleteModal.set(false);
    this.userToDelete.set(null);
  }

  confirmDelete() {
    const userToDelete = this.userToDelete();
    if (!userToDelete) {
      return;
    }

    this.isDeleting.set(true);

    // Simulate API call
    setTimeout(() => {
      this.users.update((users) =>
        users.filter((user) => user.id !== userToDelete.id),
      );

      this.isDeleting.set(false);
      this.closeDeleteModal();
    }, 1000);
  }
}
