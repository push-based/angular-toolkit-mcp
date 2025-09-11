import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  model,
  output,
} from '@angular/core';

export interface DsSegmentedTab {
  id: string;
  label: string;
  count?: number;
}

@Component({
  selector: 'ds-segmented-control',
  templateUrl: './segmented-control.component.html',
  host: {
    class: `ds-segmented-control`,
  },
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./segmented-control.component.scss'],
})
export class DsSegmentedControl {
  readonly tabs = input.required<DsSegmentedTab[]>();
  readonly activeTab = model<string>('');
  readonly fullWidth = input(true);

  readonly tabChange = output<string>();

  selectTab(tabId: string) {
    if (this.activeTab() !== tabId) {
      this.activeTab.set(tabId);
      this.tabChange.emit(tabId);
    }
  }
}
