import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-legacy',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="legacy-container">
      <!-- Early 2000s Header with animated GIF background -->
      <div class="legacy-header">
        <h1 class="legacy-title">
          <span class="blink-text">🌟 WELCOME TO LEGACY DEMO 🌟</span>
        </h1>
        <marquee class="legacy-marquee" behavior="scroll" direction="left">
          ⭐ Built with deprecated CSS classes from the early 2000s! ⭐
          Experience the nostalgia! ⭐ Web 1.0 vibes! ⭐
        </marquee>
      </div>

      <!-- Legacy Navigation with tab-nav -->
      <div class="legacy-nav-section">
        <h2 class="legacy-section-title">🗂️ Legacy Navigation Tabs</h2>
        <div class="tab-nav">
          <div class="nav-tabs">
            <button
              class="tab-nav-item"
              [class.active]="activeTab === 'home'"
              (click)="setActiveTab('home')"
            >
              🏠 Home
            </button>
            <button
              class="tab-nav-item"
              [class.active]="activeTab === 'products'"
              (click)="setActiveTab('products')"
            >
              📦 Products
            </button>
            <button
              class="tab-nav-item"
              [class.active]="activeTab === 'contact'"
              (click)="setActiveTab('contact')"
            >
              📞 Contact
            </button>
          </div>
        </div>
        <div class="legacy-tab-content">
          <p><strong>Active Tab:</strong> {{ activeTab | uppercase }}</p>
        </div>
      </div>

      <!-- Legacy Buttons Section -->
      <div class="legacy-buttons-section">
        <h2 class="legacy-section-title">🔘 Legacy Buttons</h2>
        <div class="legacy-button-grid">
          <button class="btn" (click)="showAlert('Basic Button')">
            Basic Button
          </button>
          <button class="btn-primary" (click)="showAlert('Primary Button')">
            Primary Button
          </button>
          <button class="legacy-button" (click)="showAlert('Legacy Button')">
            Legacy Button
          </button>
          <button class="btn" disabled>Disabled Button</button>
        </div>
      </div>

      <!-- Legacy Cards Section -->
      <div class="legacy-cards-section">
        <h2 class="legacy-section-title">🃏 Legacy Cards</h2>
        <div class="legacy-card-grid">
          <div class="card">
            <h3>💰 Special Offer!</h3>
            <p>Get 50% off on all items!</p>
            <div class="offer-badge">HOT DEAL!</div>
            <button class="btn-primary">Buy Now!</button>
          </div>

          <div class="card">
            <h3>🏆 Sports Update</h3>
            <p>Latest sports news and scores</p>
            <div class="sports-pill">LIVE</div>
            <div class="pill-with-badge">Score: 2-1</div>
          </div>

          <div class="card">
            <h3>📊 Statistics</h3>
            <p>View your account statistics</p>
            <div class="count">42</div>
            <div class="badge-circle">NEW</div>
          </div>
        </div>
      </div>

      <!-- Legacy Forms Section -->
      <div class="legacy-forms-section">
        <h2 class="legacy-section-title">📝 Legacy Forms</h2>
        <div class="legacy-form">
          <div class="form-group">
            <label>Choose your preference:</label>
            <div class="custom-control-radio">
              <input
                type="radio"
                name="preference"
                value="option1"
                [(ngModel)]="selectedOption"
              />
              <label>Option 1</label>
            </div>
            <div class="custom-control-radio">
              <input
                type="radio"
                name="preference"
                value="option2"
                [(ngModel)]="selectedOption"
              />
              <label>Option 2</label>
            </div>
          </div>

          <div class="form-group">
            <div class="custom-control-checkbox">
              <input type="checkbox" [(ngModel)]="isSubscribed" />
              <label>Subscribe to newsletter</label>
            </div>
          </div>

          <div class="form-group">
            <label>Enable notifications:</label>
            <div class="custom-control-switcher">
              <input type="checkbox" [(ngModel)]="notificationsEnabled" />
              <span class="switcher-slider"></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Legacy Segmented Controls -->
      <div class="legacy-segmented-section">
        <h2 class="legacy-section-title">🎛️ Legacy Segmented Controls</h2>
        <div class="form-control-tabs-segmented">
          <button
            class="segment-item"
            [class.active]="segmentedValue === 'view1'"
            (click)="segmentedValue = 'view1'"
          >
            View 1
          </button>
          <button
            class="segment-item"
            [class.active]="segmentedValue === 'view2'"
            (click)="segmentedValue = 'view2'"
          >
            View 2
          </button>
          <button
            class="segment-item"
            [class.active]="segmentedValue === 'view3'"
            (click)="segmentedValue = 'view3'"
          >
            View 3
          </button>
        </div>
        <p class="legacy-result">Selected: {{ segmentedValue }}</p>
      </div>

      <!-- Legacy Loading Section -->
      <div class="legacy-loading-section">
        <h2 class="legacy-section-title">⏳ Legacy Loading Indicators</h2>
        <div class="loading-grid">
          <div class="loading">Loading...</div>
          <div class="loading-v2">Please wait...</div>
          <div class="loading-v3">Processing...</div>
        </div>
        <button class="btn-primary" (click)="toggleLoading()">
          {{ isLoading ? 'Stop Loading' : 'Start Loading' }}
        </button>
      </div>

      <!-- Legacy Modal Section -->
      <div class="legacy-modal-section">
        <h2 class="legacy-section-title">🪟 Legacy Modal</h2>
        <button class="btn-primary" (click)="showLegacyModal = true">
          Open Legacy Modal
        </button>
      </div>

      <!-- Collapsible Container -->
      <div class="legacy-collapsible-section">
        <h2 class="legacy-section-title">📁 Legacy Collapsible</h2>
        <div class="collapsible-container">
          <div class="collapsible-header" (click)="toggleCollapsible()">
            <span
              >{{ isCollapsed ? '▶️' : '⬇️' }} Click to
              {{ isCollapsed ? 'expand' : 'collapse' }}</span
            >
          </div>
          <div class="collapsible-content" [class.collapsed]="isCollapsed">
            <p>This is the collapsible content! 🎉</p>
            <p>Built with early 2000s technology and styling!</p>
            <div class="divider"></div>
            <p>Remember when websites looked like this? 😄</p>
          </div>
        </div>
      </div>

      <!-- Legacy Footer -->
      <div class="legacy-footer">
        <div class="divider"></div>
        <p>
          <span class="blink-text"
            >🌈 Built with ❤️ using deprecated CSS classes! 🌈</span
          >
        </p>
        <p>
          <small>© 2025 - Bringing back the early 2000s web experience!</small>
        </p>
        <marquee behavior="alternate" direction="right">
          🎵 *dial-up modem sounds* 🎵
        </marquee>
      </div>
    </div>

    <!-- Legacy Modal -->
    @if (showLegacyModal) {
      <div class="modal" (click)="showLegacyModal = false">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>🎊 Legacy Modal Window</h3>
            <button class="modal-close" (click)="showLegacyModal = false">
              ❌
            </button>
          </div>
          <div class="modal-body">
            <p>Welcome to the legacy modal experience!</p>
            <p>This modal uses the deprecated "modal" CSS class.</p>
            <div class="offer-badge">RETRO STYLE!</div>
          </div>
          <div class="modal-footer">
            <button class="btn" (click)="showLegacyModal = false">
              Cancel
            </button>
            <button class="btn-primary" (click)="showLegacyModal = false">
              OK
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styleUrls: ['./legacy.component.scss'],
})
export class LegacyComponent {
  activeTab = 'home';
  selectedOption = 'option1';
  isSubscribed = false;
  notificationsEnabled = true;
  segmentedValue = 'view1';
  isLoading = false;
  showLegacyModal = false;
  isCollapsed = true;

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  showAlert(message: string): void {
    alert(`🎉 ${message} clicked! Welcome to the early 2000s! 🎉`);
  }

  toggleLoading(): void {
    this.isLoading = !this.isLoading;
  }

  toggleCollapsible(): void {
    this.isCollapsed = !this.isCollapsed;
  }
}
