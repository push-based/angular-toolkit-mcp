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
  Renderer2,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface BadgeConfig {
  id: string;
  text: string;
  type: 'offer-badge' | 'status' | 'priority';
  level: 'low' | 'medium' | 'high' | 'critical';
  interactive: boolean;
  customData: Record<string, any>;
}

@Component({
  selector: 'app-complex-badge-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="widget-container">
      <h3>Complex Badge Widget</h3>
      
      <!-- This component relies heavily on custom badge structure that will break -->
      <div class="badge-grid">
        @for (badge of badges(); track badge.id) {
          <div class="badge-item" [attr.data-badge-id]="badge.id">
            <!-- Complex custom badge with nested structure -->
            <div 
              class="offer-badge offer-badge-{{ badge.level }} offer-badge-{{ badge.type }}"
              [class.offer-badge-interactive]="badge.interactive"
              [class.offer-badge-selected]="isSelected(badge.id)"
              (click)="toggleBadge(badge.id)"
              [attr.data-custom-prop]="badge.customData.prop"
              [style.--badge-color]="getBadgeColor(badge.level)">
              
              <!-- This structure is incompatible with DsBadge slots -->
              <div class="offer-badge-header">
                <span class="offer-badge-type-indicator">{{ getTypeIcon(badge.type) }}</span>
                <div class="offer-badge-level-dots">
                  @for (dot of getLevelDots(badge.level); track $index) {
                    <span class="level-dot" [class.active]="dot"></span>
                  }
                </div>
              </div>
              
              <!-- Main content with complex nested structure -->
              <div class="offer-badge-content">
                <div class="offer-badge-primary-text">{{ badge.text }}</div>
                <div class="offer-badge-metadata">
                  <span class="badge-id">ID: {{ badge.id }}</span>
                  <span class="badge-timestamp">{{ getTimestamp() }}</span>
                </div>
              </div>
              
              <!-- Footer with actions - incompatible with DsBadge -->
              <div class="offer-badge-footer">
                @if (badge.interactive) {
                  <button class="badge-action" (click)="editBadge($event, badge.id)">Edit</button>
                  <button class="badge-action danger" (click)="deleteBadge($event, badge.id)">×</button>
                }
                <div class="badge-status-indicator" [class]="getStatusClass(badge)"></div>
              </div>
            </div>
            
            <!-- Additional complex elements that depend on custom structure -->
            <div class="badge-tooltip" [class.visible]="showTooltip() === badge.id">
              <div class="tooltip-content">
                <h4>{{ badge.text }}</h4>
                <p>Type: {{ badge.type }}</p>
                <p>Level: {{ badge.level }}</p>
                <div class="custom-data">
                  @for (item of getCustomDataEntries(badge.customData); track item.key) {
                    <div class="data-item">
                      <strong>{{ item.key }}:</strong> {{ item.value }}
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
        }
      </div>
      
      <!-- Controls that manipulate badge structure directly -->
      <div class="widget-controls">
        <button (click)="addRandomBadge()">Add Random Badge</button>
        <button (click)="modifyAllBadges()">Modify All Badges</button>
        <button (click)="resetBadges()">Reset</button>
        <label>
          <input type="checkbox" [(ngModel)]="enableAdvancedMode" (change)="onAdvancedModeChange()">
          Advanced Mode (manipulates DOM directly)
        </label>
      </div>
      
      <!-- Status display that reads from custom badge elements -->
      <div class="status-display">
        <h4>Status Summary:</h4>
        <div class="status-grid">
          <div class="status-item">
            <strong>Total Badges:</strong> {{ badges().length }}
          </div>
          <div class="status-item">
            <strong>Interactive:</strong> {{ getInteractiveBadgesCount() }}
          </div>
          <div class="status-item">
            <strong>Selected:</strong> {{ selectedBadges().length }}
          </div>
          <div class="status-item">
            <strong>Critical Level:</strong> {{ getCriticalBadgesCount() }}
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./complex-badge-widget.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComplexBadgeWidgetComponent implements OnInit, OnDestroy {
  // Inputs
  initialBadges = input<BadgeConfig[]>([]);
  enableAdvancedMode = signal(false);
  showTooltip = signal<string | null>(null);
  
  // Outputs
  badgeSelected = output<string>();
  badgeModified = output<BadgeConfig>();
  badgeDeleted = output<string>();
  
  // Internal state
  badges = signal<BadgeConfig[]>([]);
  selectedBadges = signal<string[]>([]);
  
  private elementRef = inject(ElementRef);
  private renderer = inject(Renderer2);
  private badgeCounter = 0;

  ngOnInit() {
    this.initializeBadges();
    this.setupAdvancedModeObserver();
  }

  ngOnDestroy() {
    // Cleanup
  }

  private initializeBadges() {
    const defaultBadges: BadgeConfig[] = [
      {
        id: 'badge-1',
        text: 'Premium Offer',
        type: 'offer-badge',
        level: 'high',
        interactive: true,
        customData: { prop: 'premium', priority: 1, category: 'sales' }
      },
      {
        id: 'badge-2',
        text: 'System Status',
        type: 'status',
        level: 'medium',
        interactive: false,
        customData: { prop: 'status', health: 'good', uptime: '99.9%' }
      },
      {
        id: 'badge-3',
        text: 'Critical Alert',
        type: 'priority',
        level: 'critical',
        interactive: true,
        customData: { prop: 'alert', severity: 'high', source: 'monitoring' }
      }
    ];
    
    this.badges.set(this.initialBadges().length > 0 ? this.initialBadges() : defaultBadges);
  }

  private setupAdvancedModeObserver() {
    // This method directly manipulates DOM elements in a way that will break with DsBadge
    // because it expects specific custom badge structure
  }

  // Methods that rely on custom badge structure
  getBadgeColor(level: string): string {
    const colorMap: Record<string, string> = {
      'low': '#10b981',
      'medium': '#f59e0b', 
      'high': '#3b82f6',
      'critical': '#ef4444'
    };
    return colorMap[level] || '#6b7280';
  }

  getTypeIcon(type: string): string {
    const iconMap: Record<string, string> = {
      'offer-badge': '🎯',
      'status': '📊',
      'priority': '⚠️'
    };
    return iconMap[type] || '📌';
  }

  getLevelDots(level: string): boolean[] {
    const dotMap: Record<string, boolean[]> = {
      'low': [true, false, false],
      'medium': [true, true, false],
      'high': [true, true, true],
      'critical': [true, true, true]
    };
    return dotMap[level] || [false, false, false];
  }

  getStatusClass(badge: BadgeConfig): string {
    return `status-${badge.level}-${badge.type}`;
  }

  getCustomDataEntries(customData: Record<string, any>): Array<{key: string, value: any}> {
    return Object.entries(customData).map(([key, value]) => ({ key, value }));
  }

  getTimestamp(): string {
    return new Date().toLocaleTimeString();
  }

  // Interactive methods that depend on custom structure
  isSelected(badgeId: string): boolean {
    return this.selectedBadges().includes(badgeId);
  }

  toggleBadge(badgeId: string) {
    const selected = this.selectedBadges();
    if (selected.includes(badgeId)) {
      this.selectedBadges.set(selected.filter(id => id !== badgeId));
    } else {
      this.selectedBadges.set([...selected, badgeId]);
    }
    this.badgeSelected.emit(badgeId);
  }

  editBadge(event: Event, badgeId: string) {
    event.stopPropagation();
    const badge = this.badges().find(b => b.id === badgeId);
    if (badge) {
      // Simulate editing
      const updatedBadge = { ...badge, text: badge.text + ' (edited)' };
      this.updateBadge(updatedBadge);
      this.badgeModified.emit(updatedBadge);
    }
  }

  deleteBadge(event: Event, badgeId: string) {
    event.stopPropagation();
    this.badges.set(this.badges().filter(b => b.id !== badgeId));
    this.selectedBadges.set(this.selectedBadges().filter(id => id !== badgeId));
    this.badgeDeleted.emit(badgeId);
  }

  addRandomBadge() {
    this.badgeCounter++;
    const types: BadgeConfig['type'][] = ['offer-badge', 'status', 'priority'];
    const levels: BadgeConfig['level'][] = ['low', 'medium', 'high', 'critical'];
    
    const newBadge: BadgeConfig = {
      id: `badge-${Date.now()}-${this.badgeCounter}`,
      text: `Dynamic Badge ${this.badgeCounter}`,
      type: types[Math.floor(Math.random() * types.length)],
      level: levels[Math.floor(Math.random() * levels.length)],
      interactive: Math.random() > 0.5,
      customData: { 
        prop: `dynamic-${this.badgeCounter}`, 
        generated: true,
        timestamp: Date.now()
      }
    };
    
    this.badges.set([...this.badges(), newBadge]);
  }

  modifyAllBadges() {
    // This method directly manipulates DOM to demonstrate breaking changes
    if (this.enableAdvancedMode()) {
      const badgeElements = this.elementRef.nativeElement.querySelectorAll('.offer-badge');
      badgeElements.forEach((element: HTMLElement, index: number) => {
        // Direct DOM manipulation that will break with DsBadge
        const contentDiv = element.querySelector('.offer-badge-content');
        if (contentDiv) {
          this.renderer.setStyle(contentDiv, 'transform', `rotate(${index * 2}deg)`);
          this.renderer.addClass(element, 'modified-badge');
        }
        
        // Add custom attributes that DsBadge won't support
        this.renderer.setAttribute(element, 'data-modification-time', Date.now().toString());
        this.renderer.setAttribute(element, 'data-custom-behavior', 'advanced');
      });
    }
  }

  resetBadges() {
    this.initializeBadges();
    this.selectedBadges.set([]);
    this.showTooltip.set(null);
    
    // Reset DOM modifications
    const badgeElements = this.elementRef.nativeElement.querySelectorAll('.offer-badge');
    badgeElements.forEach((element: HTMLElement) => {
      this.renderer.removeStyle(element, 'transform');
      this.renderer.removeClass(element, 'modified-badge');
      this.renderer.removeAttribute(element, 'data-modification-time');
      this.renderer.removeAttribute(element, 'data-custom-behavior');
    });
  }

  onAdvancedModeChange() {
    if (this.enableAdvancedMode()) {
      // Enable advanced DOM manipulation features
      this.setupAdvancedBehaviors();
    } else {
      this.resetBadges();
    }
  }

  private setupAdvancedBehaviors() {
    // This method sets up behaviors that depend on custom badge DOM structure
    // and will break when using DsBadge
    setTimeout(() => {
      const badgeElements = this.elementRef.nativeElement.querySelectorAll('.offer-badge');
      badgeElements.forEach((element: HTMLElement) => {
        // Add hover effects that depend on custom structure
        element.addEventListener('mouseenter', () => {
          const header = element.querySelector('.offer-badge-header');
          const footer = element.querySelector('.offer-badge-footer');
          if (header && footer) {
            this.renderer.addClass(header, 'hover-active');
            this.renderer.addClass(footer, 'hover-active');
          }
        });
        
        element.addEventListener('mouseleave', () => {
          const header = element.querySelector('.offer-badge-header');
          const footer = element.querySelector('.offer-badge-footer');
          if (header && footer) {
            this.renderer.removeClass(header, 'hover-active');
            this.renderer.removeClass(footer, 'hover-active');
          }
        });
      });
    }, 100);
  }

  private updateBadge(updatedBadge: BadgeConfig) {
    const badges = this.badges();
    const index = badges.findIndex(b => b.id === updatedBadge.id);
    if (index !== -1) {
      badges[index] = updatedBadge;
      this.badges.set([...badges]);
    }
  }

  // Computed values that depend on custom badge structure
  getInteractiveBadgesCount(): number {
    return this.badges().filter(b => b.interactive).length;
  }

  getCriticalBadgesCount(): number {
    return this.badges().filter(b => b.level === 'critical').length;
  }
} 