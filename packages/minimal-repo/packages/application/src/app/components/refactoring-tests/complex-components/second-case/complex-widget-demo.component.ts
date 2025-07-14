import { Component, signal } from '@angular/core';
import { ComplexBadgeWidgetComponent, BadgeConfig } from './complex-badge-widget.component';

@Component({
  selector: 'app-complex-widget-demo',
  standalone: true,
  imports: [ComplexBadgeWidgetComponent],
  template: `
    <div class="demo-container">
      <h2>Complex Badge Widget Demo</h2>
      <p>This component demonstrates a complex badge implementation that will fail when refactored to DsBadge.</p>
      
      <app-complex-badge-widget
        [initialBadges]="customBadges()"
        (badgeSelected)="onBadgeSelected($event)"
        (badgeModified)="onBadgeModified($event)"
        (badgeDeleted)="onBadgeDeleted($event)">
      </app-complex-badge-widget>
      
      <div class="demo-log">
        <h3>Event Log:</h3>
        <div class="log-entries">
          @for (entry of eventLog(); track $index) {
            <div class="log-entry">{{ entry }}</div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .demo-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .demo-container h2 {
      color: #1f2937;
      margin-bottom: 1rem;
    }
    
    .demo-container p {
      color: #6b7280;
      margin-bottom: 2rem;
    }
    
    .demo-log {
      background: white;
      border-radius: 0.5rem;
      padding: 1.5rem;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
      margin-top: 2rem;
    }
    
    .demo-log h3 {
      margin: 0 0 1rem 0;
      color: #1f2937;
      font-size: 1.125rem;
    }
    
    .log-entries {
      max-height: 200px;
      overflow-y: auto;
    }
    
    .log-entry {
      padding: 0.5rem;
      border-bottom: 1px solid #f3f4f6;
      font-size: 0.875rem;
      color: #374151;
      font-family: monospace;
    }
    
    .log-entry:last-child {
      border-bottom: none;
    }
  `]
})
export class ComplexWidgetDemoComponent {
  eventLog = signal<string[]>([]);
  
  customBadges = signal<BadgeConfig[]>([
    {
      id: 'complex-1',
      text: 'Ultra Premium',
      type: 'offer-badge',
      level: 'critical',
      interactive: true,
      customData: { 
        prop: 'ultra-premium', 
        complexity: 'high',
        features: ['animations', 'tooltips', 'dom-manipulation'],
        breakingPoints: ['nested-structure', 'pseudo-elements', 'direct-dom-access']
      }
    },
    {
      id: 'complex-2',
      text: 'System Health',
      type: 'status',
      level: 'high',
      interactive: false,
      customData: { 
        prop: 'health-monitor',
        realTime: true,
        dependencies: ['custom-animations', 'complex-selectors'],
        refactorRisk: 'high'
      }
    },
    {
      id: 'complex-3',
      text: 'Critical Priority',
      type: 'priority',
      level: 'critical',
      interactive: true,
      customData: { 
        prop: 'priority-alert',
        escalated: true,
        customBehaviors: ['hover-effects', 'click-handlers', 'tooltip-system'],
        migrationComplexity: 'very-high'
      }
    }
  ]);

  onBadgeSelected(badgeId: string) {
    this.addLogEntry(`Badge selected: ${badgeId}`);
  }

  onBadgeModified(badge: BadgeConfig) {
    this.addLogEntry(`Badge modified: ${badge.id} - ${badge.text}`);
  }

  onBadgeDeleted(badgeId: string) {
    this.addLogEntry(`Badge deleted: ${badgeId}`);
  }

  private addLogEntry(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    const entry = `[${timestamp}] ${message}`;
    this.eventLog.update(log => [entry, ...log.slice(0, 49)]);
  }
} 