# Segmented Control Component

A simplified segmented control component that works like tabs, similar to the profile component tabs.

## Usage

```typescript
import { DsSegmentedControl, type DsSegmentedTab } from '@ui/segmented-control';

@Component({
  imports: [DsSegmentedControl],
  // ...
})
export class MyComponent {
  tabs: DsSegmentedTab[] = [
    { id: 'tab1', label: 'TAB ONE', count: 5 },
    { id: 'tab2', label: 'TAB TWO', count: 10 },
    { id: 'tab3', label: 'TAB THREE' }, // count is optional
  ];

  activeTab = signal('tab1');

  onTabChange(tabId: string) {
    this.activeTab.set(tabId);
  }
}
```

```html
<ds-segmented-control
  [tabs]="tabs"
  [activeTab]="activeTab()"
  (tabChange)="onTabChange($event)"
></ds-segmented-control>
```

## Interface

```typescript
interface DsSegmentedTab {
  id: string;
  label: string;
  count?: number; // Optional count to display in parentheses
}
```

## Inputs

- `tabs: DsSegmentedTab[]` - Array of tab objects
- `activeTab: string` - ID of the currently active tab
- `fullWidth: boolean` - Whether the control should take full width (default: true)

## Outputs

- `tabChange: string` - Emitted when a tab is clicked, returns the tab ID
