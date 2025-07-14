import { Component, signal } from '@angular/core';
import { DashboardHeaderComponent, UserProfile, NotificationItem } from '../dashboard-header.component';

@Component({
  selector: 'app-dashboard-demo',
  standalone: true,
  imports: [DashboardHeaderComponent],
  templateUrl: './dashboard-demo.component.html',
  styleUrls: ['./dashboard-demo.component.scss']
})
export class DashboardDemoComponent {
  darkMode = signal(false);
  eventLog = signal<string[]>([]);
  
  userProfile = signal<UserProfile>({
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Administrator',
    lastLogin: new Date(),
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  });

  private users: UserProfile[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'Administrator',
      lastLogin: new Date(),
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      role: 'Manager',
      lastLogin: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike.johnson@example.com',
      role: 'Developer',
      lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    }
  ];

  private currentUserIndex = 0;

  onSearchPerformed(query: string) {
    this.addLogEntry(`Search performed: "${query}"`);
  }

  onBadgeDismissed() {
    this.addLogEntry('Offer badge dismissed');
  }

  onNotificationClicked(notification: NotificationItem) {
    this.addLogEntry(`Notification clicked: ${notification.title}`);
  }

  onUserActionClicked(action: string) {
    this.addLogEntry(`User action: ${action}`);
    
    if (action === 'logout') {
      this.addLogEntry('User logged out');
      // In a real app, you would handle logout logic here
    }
  }

  onThemeToggled(isDark: boolean) {
    this.darkMode.set(isDark);
    this.addLogEntry(`Theme toggled to: ${isDark ? 'dark' : 'light'}`);
    
    // Apply theme to demo container
    const container = document.querySelector('.demo-container');
    if (container) {
      container.classList.toggle('dark', isDark);
    }
  }

  toggleTheme() {
    const newTheme = !this.darkMode();
    this.onThemeToggled(newTheme);
  }

  changeUser() {
    this.currentUserIndex = (this.currentUserIndex + 1) % this.users.length;
    const newUser = this.users[this.currentUserIndex];
    this.userProfile.set(newUser);
    this.addLogEntry(`User changed to: ${newUser.name}`);
  }

  addNotification() {
    const notifications = [
      {
        id: Date.now().toString(),
        title: 'New Message',
        message: 'You have received a new message from a colleague',
        timestamp: new Date(),
        read: false,
        type: 'info' as const
      },
      {
        id: Date.now().toString(),
        title: 'Task Completed',
        message: 'Your background task has finished successfully',
        timestamp: new Date(),
        read: false,
        type: 'success' as const
      },
      {
        id: Date.now().toString(),
        title: 'Warning',
        message: 'Your session will expire in 10 minutes',
        timestamp: new Date(),
        read: false,
        type: 'warning' as const
      }
    ];
    
    const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
    this.addLogEntry(`Added notification: ${randomNotification.title}`);
  }

  private addLogEntry(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    const entry = `[${timestamp}] ${message}`;
    this.eventLog.update(log => [entry, ...log.slice(0, 49)]); // Keep last 50 entries
  }
} 