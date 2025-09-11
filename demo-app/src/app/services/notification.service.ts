import { Injectable, signal } from '@angular/core';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system' | 'message';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'system' | 'user' | 'security' | 'update' | 'social' | 'promotion';
  actionUrl?: string;
  actionText?: string;
  avatar?: string;
  sender?: string;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly STORAGE_KEY = 'retro-notifications';

  // Reactive signals for notifications
  private readonly _notifications = signal<Notification[]>([]);
  private readonly _unreadCount = signal<number>(0);

  // Public readonly signals
  public readonly notifications = this._notifications.asReadonly();
  public readonly unreadCount = this._unreadCount.asReadonly();

  constructor() {
    this.loadNotifications();
    this.generateSampleNotifications();
    this.updateUnreadCount();
  }

  private loadNotifications(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const notifications = JSON.parse(stored).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        }));
        this._notifications.set(notifications);
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    }
  }

  private saveNotifications(): void {
    localStorage.setItem(
      this.STORAGE_KEY,
      JSON.stringify(this._notifications()),
    );
  }

  private updateUnreadCount(): void {
    const unread = this._notifications().filter((n) => !n.isRead).length;
    this._unreadCount.set(unread);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  addNotification(
    notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>,
  ): void {
    const newNotification: Notification = {
      ...notification,
      id: this.generateId(),
      timestamp: new Date(),
      isRead: false,
    };

    const current = this._notifications();
    this._notifications.set([newNotification, ...current]);
    this.updateUnreadCount();
    this.saveNotifications();
  }

  markAsRead(id: string): void {
    const notifications = this._notifications().map((n) =>
      n.id === id ? { ...n, isRead: true } : n,
    );
    this._notifications.set(notifications);
    this.updateUnreadCount();
    this.saveNotifications();
  }

  markAllAsRead(): void {
    const notifications = this._notifications().map((n) => ({
      ...n,
      isRead: true,
    }));
    this._notifications.set(notifications);
    this.updateUnreadCount();
    this.saveNotifications();
  }

  deleteNotification(id: string): void {
    const notifications = this._notifications().filter((n) => n.id !== id);
    this._notifications.set(notifications);
    this.updateUnreadCount();
    this.saveNotifications();
  }

  clearAllNotifications(): void {
    this._notifications.set([]);
    this.updateUnreadCount();
    this.saveNotifications();
  }

  getNotificationsByCategory(category: string): Notification[] {
    return this._notifications().filter((n) => n.category === category);
  }

  getNotificationsByType(type: string): Notification[] {
    return this._notifications().filter((n) => n.type === type);
  }

  private generateSampleNotifications(): void {
    if (this._notifications().length === 0) {
      const sampleNotifications: Omit<
        Notification,
        'id' | 'timestamp' | 'isRead'
      >[] = [
        {
          type: 'system',
          title: '🚨 SYSTEM ALERT',
          message:
            'Your computer has been running for 72 hours straight! Time to reboot?',
          priority: 'urgent',
          category: 'system',
          sender: 'Windows XP',
        },
        {
          type: 'message',
          title: "📧 You've Got Mail!",
          message:
            'New message from: xXCoolDude2001Xx - "Hey, check out this awesome website!"',
          priority: 'medium',
          category: 'social',
          sender: 'AOL Instant Messenger',
          avatar: '🧑‍💻',
        },
        {
          type: 'success',
          title: '💾 Download Complete',
          message:
            'song.mp3 has finished downloading from Napster (3.2MB in 47 minutes)',
          priority: 'low',
          category: 'system',
          sender: 'Download Manager',
        },
        {
          type: 'warning',
          title: '⚠️ Low Disk Space',
          message:
            'Your C:\\ drive has only 50MB remaining. Please delete some files.',
          priority: 'high',
          category: 'system',
          sender: 'Disk Cleanup Wizard',
        },
        {
          type: 'info',
          title: '🌐 Internet Connection',
          message:
            'Successfully connected to the World Wide Web via dial-up modem',
          priority: 'medium',
          category: 'system',
          sender: 'Network Connection',
        },
        {
          type: 'error',
          title: '💥 Application Error',
          message:
            'Internet Explorer has encountered an error and needs to close. We are sorry for the inconvenience.',
          priority: 'high',
          category: 'system',
          sender: 'Internet Explorer',
        },
        {
          type: 'message',
          title: '💬 ICQ Message',
          message: 'BuddyGuy99: "uh-oh!" *ICQ sound plays*',
          priority: 'medium',
          category: 'social',
          sender: 'ICQ',
          avatar: '🟢',
        },
        {
          type: 'system',
          title: '🔄 Windows Update',
          message:
            'Important updates are available. Your computer will restart in 10 minutes.',
          priority: 'urgent',
          category: 'update',
          sender: 'Windows Update',
        },
        {
          type: 'success',
          title: '🎵 CD Burning Complete',
          message:
            'Your "Awesome Mix CD #47" has been successfully burned to disc!',
          priority: 'low',
          category: 'system',
          sender: 'Nero Burning ROM',
        },
        {
          type: 'warning',
          title: '🦠 Virus Scan Alert',
          message:
            'Norton AntiVirus detected 3 potential threats. Click here to quarantine.',
          priority: 'high',
          category: 'security',
          sender: 'Norton AntiVirus',
          actionText: 'Scan Now',
          actionUrl: '#',
        },
      ];

      // Add notifications with some delay to simulate real-time
      sampleNotifications.forEach((notification, index) => {
        setTimeout(() => {
          this.addNotification(notification);
        }, index * 100);
      });
    }
  }

  // Simulate real-time notifications
  simulateNewNotification(): void {
    const randomNotifications = [
      {
        type: 'message' as const,
        title: '📱 New Message',
        message: 'CoolFriend2001: "Want to play some Counter-Strike?"',
        priority: 'medium' as const,
        category: 'social' as const,
        sender: 'MSN Messenger',
        avatar: '😎',
      },
      {
        type: 'system' as const,
        title: '🔊 Sound Event',
        message: 'Windows startup sound has played successfully',
        priority: 'low' as const,
        category: 'system' as const,
        sender: 'Windows Sound System',
      },
      {
        type: 'warning' as const,
        title: '⏰ Reminder',
        message: "Don't forget to feed your Tamagotchi!",
        priority: 'medium' as const,
        category: 'user' as const,
        sender: 'Desktop Reminder',
      },
    ];

    const randomNotification =
      randomNotifications[
        Math.floor(Math.random() * randomNotifications.length)
      ];
    this.addNotification(randomNotification);
  }
}
