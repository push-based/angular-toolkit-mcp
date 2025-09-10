import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="home-container">
      <section class="hero">
        <h1>Welcome to Angular Demo App</h1>
        <p class="hero-subtitle">
          A modern, standalone Angular application built with Angular 19.2.7
        </p>
        <div class="hero-features">
          <div class="feature-card">
            <h3>🚀 Modern Angular</h3>
            <p>
              Built with the latest Angular 19.2.7 featuring standalone
              components
            </p>
          </div>
          <div class="feature-card">
            <h3>📱 Responsive Design</h3>
            <p>Mobile-first design that works on all devices</p>
          </div>
          <div class="feature-card">
            <h3>⚡ Fast & Lightweight</h3>
            <p>Optimized build with lazy loading and modern tooling</p>
          </div>
        </div>
      </section>

      <section class="stats">
        <div class="stat-item">
          <h3>{{ currentTime | date: 'medium' }}</h3>
          <p>Current Time</p>
        </div>
        <div class="stat-item">
          <h3>Angular 19.2.7</h3>
          <p>Framework Version</p>
        </div>
        <div class="stat-item">
          <h3>Standalone</h3>
          <p>Architecture</p>
        </div>
      </section>
    </div>
  `,
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  currentTime = new Date();

  constructor() {
    // Update time every second
    setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  }
}
