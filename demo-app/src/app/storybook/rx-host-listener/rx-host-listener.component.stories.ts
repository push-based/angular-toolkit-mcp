import { generateStatusBadges } from '@design-system/shared-storybook-utils';
import { Component, ElementRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  rxHostListener,
  rxHostPressedListener,
} from '../../components/ui/rx-host-listener/rx-host-listener';
import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';

import { allThemes } from '../../modes';

// Demo component to showcase the utility
@Component({
  selector: 'rx-host-listener-demo',
  template: `
    <div class="demo-container">
      <h3>{{ title }}</h3>
      <div class="demo-box" [class.clicked]="hasBeenClicked">
        {{ content }}
        <div class="event-log" *ngIf="lastEvent">
          Last event: {{ lastEvent }}
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .demo-container {
        padding: 20px;
        border: 1px solid #ccc;
        border-radius: 8px;
        margin: 10px 0;
      }
      .demo-box {
        padding: 20px;
        background: #f5f5f5;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s ease;
        min-height: 60px;
      }
      .demo-box:hover {
        background: #e5e5e5;
      }
      .demo-box.clicked {
        background: #d4edda;
        border: 2px solid #28a745;
      }
      .event-log {
        margin-top: 10px;
        font-size: 12px;
        color: #666;
        font-style: italic;
      }
    `,
  ],
  standalone: true,
})
class RxHostListenerDemoComponent {
  title = 'Click or press Space/Enter';
  content = 'Interactive element using rxHostListener';
  lastEvent = '';
  hasBeenClicked = false;

  constructor() {
    // Example usage of rxHostListener
    rxHostListener('click')
      .pipe(takeUntilDestroyed())
      .subscribe((event) => {
        this.lastEvent = `Click at (${event.clientX}, ${event.clientY})`;
        this.hasBeenClicked = true;
        setTimeout(() => (this.hasBeenClicked = false), 1000);
      });
  }
}

@Component({
  selector: 'rx-host-pressed-demo',
  template: `
    <div class="demo-container">
      <h3>{{ title }}</h3>
      <div class="demo-box" [class.pressed]="hasBeenPressed" tabindex="0">
        {{ content }}
        <div class="event-log" *ngIf="pressCount > 0">
          Pressed {{ pressCount }} times
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .demo-container {
        padding: 20px;
        border: 1px solid #ccc;
        border-radius: 8px;
        margin: 10px 0;
      }
      .demo-box {
        padding: 20px;
        background: #f5f5f5;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s ease;
        min-height: 60px;
        outline: none;
      }
      .demo-box:hover,
      .demo-box:focus {
        background: #e5e5e5;
      }
      .demo-box.pressed {
        background: #fff3cd;
        border: 2px solid #ffc107;
      }
      .event-log {
        margin-top: 10px;
        font-size: 12px;
        color: #666;
        font-style: italic;
      }
    `,
  ],
  standalone: true,
})
class RxHostPressedDemoComponent {
  title = 'Click, Space, or Enter';
  content = 'Interactive element using rxHostPressedListener';
  pressCount = 0;
  hasBeenPressed = false;

  constructor() {
    // Example usage of rxHostPressedListener
    rxHostPressedListener()
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.pressCount++;
        this.hasBeenPressed = true;
        setTimeout(() => (this.hasBeenPressed = false), 500);
      });
  }
}

type RxHostListenerStoryType = {};

const meta: Meta<RxHostListenerStoryType> = {
  title: 'Utilities/RxHostListener',
  parameters: {
    status: generateStatusBadges('UX-2308', ['stable']),
  },

  excludeStories: /.*Data$/,
  argTypes: {},
  args: {},
  decorators: [
    moduleMetadata({
      imports: [RxHostListenerDemoComponent, RxHostPressedDemoComponent],
    }),
  ],
};

export default meta;

type Story = StoryObj<RxHostListenerStoryType>;

export const BasicHostListener: Story = {
  parameters: {
    name: 'Basic rxHostListener',
    design: {
      name: 'Utility',
      type: 'figma',
      url: 'https://www.figma.com/file/NgrOt8MGJhe0obKFBQgqdT/Component-Tokens-(POC)?type=design&node-id=16640-68740&&mode=design&t=fS1qO73SS8lGciLj-4',
    },
  },
  name: 'Basic rxHostListener',
  render: () => ({
    template: `
      <div>
        <p>The <code>rxHostListener</code> function provides reactive event handling for host elements.</p>
        <rx-host-listener-demo></rx-host-listener-demo>
      </div>
    `,
  }),
};

export const PressedListener: Story = {
  parameters: {
    name: 'rxHostPressedListener',
    design: {
      name: 'Utility',
      type: 'figma',
      url: 'https://www.figma.com/file/NgrOt8MGJhe0obKFBQgqdT/Component-Tokens-(POC)?type=design&node-id=16640-68740&&mode=design&t=fS1qO73SS8lGciLj-4',
    },
  },
  name: 'rxHostPressedListener',
  render: () => ({
    template: `
      <div>
        <p>The <code>rxHostPressedListener</code> function handles both click and keyboard events (Space/Enter).</p>
        <rx-host-pressed-demo></rx-host-pressed-demo>
      </div>
    `,
  }),
};

export const MultipleListeners: Story = {
  parameters: {
    name: 'Multiple Listeners',
    design: {
      name: 'Utility',
      type: 'figma',
      url: 'https://www.figma.com/file/NgrOt8MGJhe0obKFBQgqdT/Component-Tokens-(POC)?type=design&node-id=16640-68740&&mode=design&t=fS1qO73SS8lGciLj-4',
    },
  },
  name: 'Multiple Listeners',
  render: () => ({
    template: `
      <div>
        <p>You can use multiple rx host listeners in the same component:</p>
        <rx-host-listener-demo></rx-host-listener-demo>
        <rx-host-pressed-demo></rx-host-pressed-demo>
      </div>
    `,
  }),
};

export const UsageExample: Story = {
  parameters: {
    name: 'Usage Example',
  },
  name: 'Usage Example',
  render: () => ({
    template: `
      <div style="padding: 20px;">
        <h3>Code Example</h3>
        <pre style="background: #f5f5f5; padding: 15px; border-radius: 5px; overflow: auto;"><code>import { rxHostListener, rxHostPressedListener } from '@frontend/ui/rx-host-listener';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'my-component',
  template: \`<div>Click me or press Space/Enter</div>\`,
})
export class MyComponent {
  constructor() {
    // Listen to specific events
    rxHostListener('click')
      .pipe(takeUntilDestroyed())
      .subscribe(event => {
        console.log('Clicked!', event);
      });

    // Listen to both click and keyboard activation
    rxHostPressedListener()
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        console.log('Pressed!');
      });
  }
}</code></pre>
      </div>
    `,
  }),
};

export const ChromaticTestStory: Story = {
  tags: ['docs-template'],
  parameters: {
    chromatic: {
      modes: allThemes,
      disableSnapshot: false,
    },
  },
  render: () => ({
    template: `
      <div style="display: grid; grid-gap: 20px;">
        <rx-host-listener-demo></rx-host-listener-demo>
        <rx-host-pressed-demo></rx-host-pressed-demo>
      </div>
    `,
  }),
};



