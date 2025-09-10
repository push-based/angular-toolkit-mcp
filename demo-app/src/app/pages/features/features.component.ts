import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DsBadge } from '../../components/ui/badge/badge.component';

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [CommonModule, FormsModule, DsBadge],
  template: `
    <div class="features-container">
      <h1>Interactive Features</h1>

      <section class="demo-section">
        <h2>Counter Demo</h2>
        <div class="counter-demo">
          <div class="counter-display">
            <span class="counter-value">{{ counter }}</span>
          </div>
          <div class="counter-controls">
            <button
              (click)="decrement()"
              [disabled]="counter <= 0"
              class="btn btn-secondary"
            >
              - Decrease
            </button>
            <button (click)="reset()" class="btn btn-outline">Reset</button>
            <button (click)="increment()" class="btn btn-primary">
              + Increase
            </button>
          </div>
        </div>
      </section>

      <section class="demo-section">
        <h2>Form Demo</h2>
        <div class="form-demo">
          <div class="form-group">
            <label for="name">Your Name:</label>
            <input
              id="name"
              type="text"
              [(ngModel)]="userName"
              placeholder="Enter your name"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label for="message">Message:</label>
            <textarea
              id="message"
              [(ngModel)]="userMessage"
              placeholder="Enter a message"
              class="form-textarea"
              rows="4"
            ></textarea>
          </div>
          <div class="form-output" *ngIf="userName || userMessage">
            <h3>Live Preview:</h3>
            <div class="preview-card">
              <p><strong>Name:</strong> {{ userName || 'Anonymous' }}</p>
              <p><strong>Message:</strong> {{ userMessage || 'No message' }}</p>
            </div>
          </div>
        </div>
      </section>

      <section class="demo-section">
        <h2>List Demo</h2>
        <div class="list-demo">
          <div class="add-item">
            <input
              type="text"
              [(ngModel)]="newItem"
              placeholder="Add new item"
              class="form-input"
              (keyup.enter)="addItem()"
            />
            <button
              (click)="addItem()"
              [disabled]="!newItem.trim()"
              class="btn btn-primary"
            >
              Add Item
            </button>
          </div>
          <div class="items-list" *ngIf="items.length > 0">
            <div class="list-item" *ngFor="let item of items; let i = index">
              <span>{{ item }}</span>
              <button (click)="removeItem(i)" class="btn-remove">×</button>
            </div>
          </div>
          <p *ngIf="items.length === 0" class="empty-state">
            No items yet. Add some items above!
          </p>
        </div>
      </section>

      <section class="demo-section">
        <h2>Angular Features Showcase</h2>
        <div class="features-grid">
          <div class="feature-card" *ngFor="let feature of angularFeatures">
            <div class="feature-icon">{{ feature.icon }}</div>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
            <ds-badge
              [variant]="feature.status === 'active' ? 'green' : 'neutral'"
              size="xsmall"
            >
              {{ feature.status }}
            </ds-badge>
          </div>
        </div>
      </section>
    </div>
  `,
  styleUrls: ['./features.component.scss'],
})
export class FeaturesComponent {
  counter = 0;
  userName = '';
  userMessage = '';
  newItem = '';
  items: string[] = ['Sample Item 1', 'Sample Item 2'];

  angularFeatures = [
    {
      icon: '🎯',
      title: 'Standalone Components',
      description: 'No NgModules needed, simplified architecture',
      status: 'active',
    },
    {
      icon: '🔄',
      title: 'Two-way Data Binding',
      description: 'Seamless synchronization between model and view',
      status: 'active',
    },
    {
      icon: '🎨',
      title: 'Template Syntax',
      description: 'Powerful templating with directives and pipes',
      status: 'active',
    },
    {
      icon: '⚡',
      title: 'Change Detection',
      description: 'Efficient DOM updates with Zone.js',
      status: 'active',
    },
    {
      icon: '🧩',
      title: 'Dependency Injection',
      description: 'Built-in DI system for clean architecture',
      status: 'active',
    },
    {
      icon: '🛣️',
      title: 'Router',
      description: 'Powerful routing with lazy loading support',
      status: 'active',
    },
  ];

  increment(): void {
    this.counter++;
  }

  decrement(): void {
    if (this.counter > 0) {
      this.counter--;
    }
  }

  reset(): void {
    this.counter = 0;
  }

  addItem(): void {
    if (this.newItem.trim()) {
      this.items.push(this.newItem.trim());
      this.newItem = '';
    }
  }

  removeItem(index: number): void {
    this.items.splice(index, 1);
  }
}
