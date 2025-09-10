import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { DsBadge } from '../../components/ui/badge/badge.component';
import { DsButton } from '../../components/ui/button/button.component';
import { DsModal } from '../../components/ui/modal/modal.component';
import { DsModalContent } from '../../components/ui/modal/modal-content.component';
import { DsModalHeader } from '../../components/ui/modal/modal-header.component';
import { DsModalHeaderDrag } from '../../components/ui/modal/modal-header-drag.component';
import { DsSegmentedControl } from '../../components/ui/segmented-control/segmented-control.component';
import { DsSegmentedOption } from '../../components/ui/segmented-control/segmented-option.component';

@Component({
  selector: 'app-components',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    DsBadge,
    DsButton,
    DsModal,
    DsModalContent,
    DsModalHeader,
    DsModalHeaderDrag,
    DsSegmentedControl,
    DsSegmentedOption,
  ],
  template: `
    <div class="components-container">
      <h1>UI Components Showcase</h1>
      <p class="intro">
        This page demonstrates the design system components that have been
        integrated into the demo application.
      </p>
      <div class="legacy-comparison">
        <p>
          <strong>🕰️ Want to see how we used to build UIs?</strong>
          Check out our
          <a routerLink="/legacy" class="legacy-link">Legacy Demo</a>
          that uses deprecated CSS classes from the early 2000s!
        </p>
      </div>

      <!-- Button Component Section -->
      <section class="component-section">
        <h2>Button Component</h2>
        <p>
          Versatile button component with multiple variants, sizes, and states.
        </p>

        <div class="demo-group">
          <h3>Variants</h3>
          <div class="button-grid">
            <ds-button variant="primary" (click)="onButtonClick('Primary')"
              >Primary</ds-button
            >
            <ds-button
              variant="primary-strong"
              (click)="onButtonClick('Primary Strong')"
              >Primary Strong</ds-button
            >
            <ds-button
              variant="primary-subtle"
              (click)="onButtonClick('Primary Subtle')"
              >Primary Subtle</ds-button
            >
            <ds-button variant="secondary" (click)="onButtonClick('Secondary')"
              >Secondary</ds-button
            >
            <ds-button variant="success" (click)="onButtonClick('Success')"
              >Success</ds-button
            >
            <ds-button variant="danger" (click)="onButtonClick('Danger')"
              >Danger</ds-button
            >
            <ds-button variant="warning" (click)="onButtonClick('Warning')"
              >Warning</ds-button
            >
            <ds-button variant="info" (click)="onButtonClick('Info')"
              >Info</ds-button
            >
            <ds-button variant="neutral" (click)="onButtonClick('Neutral')"
              >Neutral</ds-button
            >
            <ds-button variant="ghost" (click)="onButtonClick('Ghost')"
              >Ghost</ds-button
            >
            <ds-button variant="outline" (click)="onButtonClick('Outline')"
              >Outline</ds-button
            >
          </div>
        </div>

        <div class="demo-group">
          <h3>Sizes</h3>
          <div class="button-row">
            <ds-button
              size="xsmall"
              variant="primary"
              (click)="onButtonClick('XSmall')"
              >Extra Small</ds-button
            >
            <ds-button
              size="small"
              variant="primary"
              (click)="onButtonClick('Small')"
              >Small</ds-button
            >
            <ds-button
              size="medium"
              variant="primary"
              (click)="onButtonClick('Medium')"
              >Medium</ds-button
            >
            <ds-button
              size="large"
              variant="primary"
              (click)="onButtonClick('Large')"
              >Large</ds-button
            >
          </div>
        </div>

        <div class="demo-group">
          <h3>States</h3>
          <div class="button-row">
            <ds-button variant="primary" (click)="onButtonClick('Normal')"
              >Normal</ds-button
            >
            <ds-button variant="primary" [disabled]="true">Disabled</ds-button>
            <ds-button
              variant="primary"
              [loading]="isLoading"
              (click)="toggleLoading()"
            >
              {{ isLoading ? 'Loading...' : 'Click to Load' }}
            </ds-button>
            <ds-button
              variant="primary"
              [inverse]="true"
              (click)="onButtonClick('Inverse')"
              >Inverse</ds-button
            >
          </div>
        </div>

        <div class="demo-group">
          <h3>With Icons</h3>
          <div class="button-row">
            <ds-button variant="success" (click)="onButtonClick('Save')">
              <span slot="start">✓</span>
              Save
            </ds-button>
            <ds-button variant="danger" (click)="onButtonClick('Delete')">
              Delete
              <span slot="end">🗑️</span>
            </ds-button>
            <ds-button variant="info" (click)="onButtonClick('Download')">
              <span slot="start">⬇️</span>
              Download
              <span slot="end">📁</span>
            </ds-button>
          </div>
        </div>

        <div class="demo-group">
          <h3>Full Width</h3>
          <ds-button
            variant="primary"
            [fullWidth]="true"
            (click)="onButtonClick('Full Width')"
          >
            Full Width Button
          </ds-button>
        </div>

        @if (lastButtonClicked) {
          <div class="demo-feedback">
            <p>
              Last button clicked: <strong>{{ lastButtonClicked }}</strong>
            </p>
          </div>
        }
      </section>

      <!-- Badge Component Section -->
      <section class="component-section">
        <h2>Badge Component</h2>
        <p>Versatile badge component with multiple variants and sizes.</p>

        <div class="demo-group">
          <h3>Variants</h3>
          <div class="badge-grid">
            <ds-badge variant="primary">Primary</ds-badge>
            <ds-badge variant="primary-strong">Primary Strong</ds-badge>
            <ds-badge variant="primary-subtle">Primary Subtle</ds-badge>
            <ds-badge variant="secondary">Secondary</ds-badge>
            <ds-badge variant="green">Success</ds-badge>
            <ds-badge variant="red">Error</ds-badge>
            <ds-badge variant="yellow">Warning</ds-badge>
            <ds-badge variant="blue">Info</ds-badge>
            <ds-badge variant="purple">Purple</ds-badge>
            <ds-badge variant="orange">Orange</ds-badge>
          </div>
        </div>

        <div class="demo-group">
          <h3>Sizes</h3>
          <div class="badge-row">
            <ds-badge size="xsmall" variant="primary">Extra Small</ds-badge>
            <ds-badge size="medium" variant="primary">Medium</ds-badge>
          </div>
        </div>

        <div class="demo-group">
          <h3>States</h3>
          <div class="badge-row">
            <ds-badge variant="primary">Normal</ds-badge>
            <ds-badge variant="primary" [disabled]="true">Disabled</ds-badge>
            <ds-badge variant="primary" [inverse]="true">Inverse</ds-badge>
          </div>
        </div>

        <div class="demo-group">
          <h3>With Slots</h3>
          <div class="badge-row">
            <ds-badge variant="green">
              <span slot="start">✓</span>
              Success
            </ds-badge>
            <ds-badge variant="red">
              Error
              <span slot="end">✗</span>
            </ds-badge>
            <ds-badge variant="blue">
              <span slot="start">ℹ</span>
              Info
              <span slot="end">→</span>
            </ds-badge>
          </div>
        </div>
      </section>

      <!-- Segmented Control Section -->
      <section class="component-section">
        <h2>Segmented Control</h2>
        <p>
          Interactive segmented control for selecting between multiple options.
        </p>

        <div class="demo-group">
          <h3>Basic Usage</h3>
          <ds-segmented-control [(activeOption)]="selectedTab">
            <ds-segmented-option name="home" title="Home" />
            <ds-segmented-option name="profile" title="Profile" />
            <ds-segmented-option name="settings" title="Settings" />
          </ds-segmented-control>
          <p class="selected-info">Selected: {{ selectedTab }}</p>
        </div>

        <div class="demo-group">
          <h3>Full Width</h3>
          <ds-segmented-control
            [(activeOption)]="selectedFullWidthTab"
            [fullWidth]="true"
          >
            <ds-segmented-option name="overview" title="Overview" />
            <ds-segmented-option name="analytics" title="Analytics" />
            <ds-segmented-option name="reports" title="Reports" />
            <ds-segmented-option name="export" title="Export" />
          </ds-segmented-control>
          <p class="selected-info">Selected: {{ selectedFullWidthTab }}</p>
        </div>

        <div class="demo-group">
          <h3>Radio Group Mode</h3>
          <ds-segmented-control
            [(activeOption)]="selectedRadioTab"
            roleType="radiogroup"
          >
            <ds-segmented-option name="option1" title="Option 1" />
            <ds-segmented-option name="option2" title="Option 2" />
            <ds-segmented-option name="option3" title="Option 3" />
          </ds-segmented-control>
          <p class="selected-info">Selected: {{ selectedRadioTab }}</p>
        </div>
      </section>

      <!-- Modal Section -->
      <section class="component-section">
        <h2>Modal Component</h2>
        <p>Flexible modal dialog system with header and content areas.</p>

        <div class="demo-group">
          <h3>Modal Examples</h3>
          <div class="button-row">
            <ds-button variant="primary" (click)="showBasicModal = true">
              Show Basic Modal
            </ds-button>
            <ds-button variant="secondary" (click)="showHeaderModal = true">
              Show Modal with Header
            </ds-button>
            <ds-button variant="outline" (click)="showBottomSheetModal = true">
              Show Bottom Sheet
            </ds-button>
          </div>
        </div>
      </section>

      <!-- Usage Information -->
      <section class="component-section">
        <h2>Component Usage</h2>
        <div class="usage-grid">
          <div class="usage-card">
            <h3>Button</h3>
            <p>
              Interactive button component with multiple variants, sizes, and
              states. Supports loading states, icons, and full accessibility
              features.
            </p>
            <code
              >&lt;ds-button variant="primary" (click)="onClick()"&gt;Click
              Me&lt;/ds-button&gt;</code
            >
          </div>
          <div class="usage-card">
            <h3>Badge</h3>
            <p>
              Use badges to display status, categories, or small pieces of
              information. They support various colors, sizes, and can include
              icons or symbols.
            </p>
            <code
              >&lt;ds-badge variant="primary"&gt;Label&lt;/ds-badge&gt;</code
            >
          </div>
          <div class="usage-card">
            <h3>Segmented Control</h3>
            <p>
              Perfect for tab-like navigation or option selection. Supports
              keyboard navigation and accessibility features out of the box.
            </p>
            <code>
              &lt;ds-segmented-control
              [(activeOption)]="selected"&gt;...&lt;/ds-segmented-control&gt;
            </code>
          </div>
          <div class="usage-card">
            <h3>Modal</h3>
            <p>
              Use modals for dialogs, forms, or any content that needs to
              overlay the main interface. Includes header and content
              components.
            </p>
            <code
              >&lt;ds-modal&gt;&lt;ds-modal-content&gt;...&lt;/ds-modal-content&gt;&lt;/ds-modal&gt;</code
            >
          </div>
        </div>
      </section>
    </div>

    <!-- Modal Examples -->
    @if (showBasicModal) {
      <ds-modal (click)="showBasicModal = false">
        <ds-modal-content (click)="$event.stopPropagation()">
          <div class="modal-body">
            <h3>Basic Modal</h3>
            <p>
              This is a basic modal example. Click outside or press the close
              button to dismiss.
            </p>
            <div class="modal-actions">
              <ds-button variant="ghost" (click)="showBasicModal = false">
                Close
              </ds-button>
              <ds-button variant="primary" (click)="showBasicModal = false">
                Confirm
              </ds-button>
            </div>
          </div>
        </ds-modal-content>
      </ds-modal>
    }

    @if (showHeaderModal) {
      <ds-modal (click)="showHeaderModal = false">
        <ds-modal-content (click)="$event.stopPropagation()">
          <ds-modal-header>
            <span slot="center">Modal with Header</span>
            <ds-button
              slot="end"
              variant="ghost"
              size="small"
              (click)="showHeaderModal = false"
            >
              ✕
            </ds-button>
          </ds-modal-header>
          <div class="modal-body">
            <p>
              This modal includes a header component with centered title and
              close button.
            </p>
            <p>
              The header provides a consistent way to display modal titles and
              actions.
            </p>
          </div>
        </ds-modal-content>
      </ds-modal>
    }

    @if (showBottomSheetModal) {
      <ds-modal [bottomSheet]="true" (click)="showBottomSheetModal = false">
        <ds-modal-content (click)="$event.stopPropagation()">
          <ds-modal-header>
            <ds-modal-header-drag slot="center" />
            <ds-button
              slot="end"
              variant="ghost"
              size="small"
              (click)="showBottomSheetModal = false"
            >
              ✕
            </ds-button>
          </ds-modal-header>
          <div class="modal-body">
            <h3>Bottom Sheet Modal</h3>
            <p>
              This is a bottom sheet style modal with a drag handle. It slides
              up from the bottom of the screen.
            </p>
            <p>Perfect for mobile interfaces and quick actions.</p>
          </div>
        </ds-modal-content>
      </ds-modal>
    }
  `,
  styleUrls: ['./components.component.scss'],
})
export class ComponentsComponent {
  selectedTab = 'home';
  selectedFullWidthTab = 'overview';
  selectedRadioTab = 'option1';

  showBasicModal = false;
  showHeaderModal = false;
  showBottomSheetModal = false;

  lastButtonClicked = '';
  isLoading = false;

  onButtonClick(buttonName: string): void {
    this.lastButtonClicked = buttonName;
    console.log(`Button clicked: ${buttonName}`);
  }

  toggleLoading(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
      this.lastButtonClicked = 'Loading Complete';
    }, 2000);
  }
}
