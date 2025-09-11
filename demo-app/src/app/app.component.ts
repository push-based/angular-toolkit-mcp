import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { NotificationService } from './services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="app-container">
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>

      <footer class="footer">
        <p>&copy; 2025 Angular Demo App.</p>
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
