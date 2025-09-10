import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

import { NotificationService } from './services/notification.service';
import { DsBadge } from './components/ui/badge/badge.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, DsBadge],
  template: `
    <div class="app-container">
      <header class="header">
        <h1>{{ title }}</h1>
        <nav class="nav">
          <a
            routerLink="/"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
            >Home</a
          >
          <a routerLink="/about" routerLinkActive="active">About</a>
          <a routerLink="/features" routerLinkActive="active">Features</a>
          <a routerLink="/components" routerLinkActive="active">Components</a>
          <a
            routerLink="/notifications"
            routerLinkActive="active"
            class="notification-link"
          >
            📬 Notifications
            @if (unreadCount() > 0) {
              <ds-badge variant="red" size="xsmall" class="notification-badge">
                {{ unreadCount() }}
              </ds-badge>
            }
          </a>
          <a routerLink="/legacy" routerLinkActive="active">🕰️ Legacy</a>
        </nav>
      </header>

      <main class="main-content">
        <router-outlet></router-outlet>
      </main>

      <footer class="footer">
        <p>
          &copy; 2025 Angular Demo App. Built with Angular {{ angularVersion }}
        </p>
      </footer>
    </div>
  `,
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'Angular Demo App';
  angularVersion = '19.2.7';

  private notificationService = inject(NotificationService);
  unreadCount = this.notificationService.unreadCount;
}
