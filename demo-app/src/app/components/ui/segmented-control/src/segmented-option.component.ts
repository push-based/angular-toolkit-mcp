import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  ViewEncapsulation,
  computed,
  contentChild,
  inject,
  input,
  output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { rxHostPressedListener } from '../../rx-host-listener/src/rx-host-listener';

import { DsSegmentedControl } from './segmented-control.component';

@Component({
  selector: 'ds-segmented-option',
  template: `<ng-content />`,
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DsSegmentedOption {
  private segmentedControl = inject(DsSegmentedControl);

  readonly title = input('');
  readonly name = input.required<string>();

  readonly selectOption = output<string>();

  readonly customTemplate = contentChild<TemplateRef<any>>('dsTemplate');

  readonly selected = computed(
    () => this.segmentedControl.selectedOption() === this,
  );
  readonly focusVisible = computed(
    () => this.segmentedControl.focusVisibleOption() === this,
  );
  readonly focused = computed(
    () => this.segmentedControl.focusedOption() === this,
  );

  constructor() {
    rxHostPressedListener()
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.selectOption.emit(this.name()));
  }
}
