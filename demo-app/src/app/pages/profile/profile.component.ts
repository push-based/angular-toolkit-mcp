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
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: `./profile.component.html`,
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
      joinDate: 'Jan 15, 2000',
    },
    {
      id: 2,
      username: 'sarah_dev',
      email: 'sarah@techcorp.com',
      fullName: 'Sarah Developer',
      role: 'premium',
      status: 'away',
      verified: true,
      joinDate: 'Mar 22, 2001',
    },
    {
      id: 3,
      username: 'mike_user',
      email: 'mike@email.com',
      fullName: 'Mike Johnson',
      role: 'free',
      status: 'offline',
      verified: false,
      joinDate: 'Jul 8, 2002',
    },
    {
      id: 4,
      username: 'admin_lisa',
      email: 'lisa@company.org',
      fullName: 'Lisa Administrator',
      role: 'admin',
      status: 'online',
      verified: true,
      joinDate: 'Nov 3, 1999',
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
    },
  ]);

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

  deleteUser(user: User) {
    // Direct deletion without modal confirmation
    this.users.update((users) => users.filter((u) => u.id !== user.id));
  }
}
