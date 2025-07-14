import { FocusMonitor } from '@angular/cdk/a11y';
import { NgTemplateOutlet } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  Renderer2,
  ViewEncapsulation,
  WritableSignal,
  booleanAttribute,
  contentChildren,
  effect,
  inject,
  input,
  model,
  signal,
  untracked,
  viewChild,
  viewChildren,
} from '@angular/core';

import { SEGMENTED_CONTROL_OPTIONS_TOKEN } from './segmented-control.token';
import { DsSegmentedOption } from './segmented-option.component';

@Component({
  selector: 'ds-segmented-control',
  templateUrl: './segmented-control.component.html',
  host: {
    class: `ds-segmented-control`,
  },
  imports: [NgTemplateOutlet],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DsSegmentedControl implements AfterViewInit, OnDestroy {
  private controlOptions = inject(SEGMENTED_CONTROL_OPTIONS_TOKEN);
  private renderer = inject(Renderer2);
  private ngZone = inject(NgZone);
  private focusMonitor = inject(FocusMonitor);

  readonly activeOption = model('');
  readonly fullWidth = input(this.controlOptions.fullWidth, {
    transform: booleanAttribute,
  });
  readonly roleType = input<'radiogroup' | 'tablist'>('tablist');
  readonly twoLineTruncation = input(false, { transform: booleanAttribute });
  readonly inverse = model<boolean>(false);

  protected readonly scContainer =
    viewChild.required<ElementRef<HTMLDivElement>>('scContainer');
  protected readonly segmentedOptions = contentChildren(DsSegmentedOption);
  protected readonly tabLabels =
    viewChildren<ElementRef<HTMLDivElement>>('tabOption');

  protected isReady = signal(false);

  readonly selectedOption: WritableSignal<DsSegmentedOption | null> =
    signal<DsSegmentedOption | null>(this.segmentedOptions()[0] ?? null);
  readonly focusedOption: WritableSignal<DsSegmentedOption | null> =
    signal<DsSegmentedOption | null>(null);
  readonly focusVisibleOption: WritableSignal<DsSegmentedOption | null> =
    signal<DsSegmentedOption | null>(null);
  private readonly resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      this._setIndicatorCSSVars(entry.target as HTMLDivElement);
    }
  });

  constructor() {
    effect(() => {
      const isReady = this.isReady();
      const options = this.segmentedOptions();
      const activeOption = this.activeOption();

      // activate the option that comes from the input
      untracked(() => {
        if (isReady) {
          const selectedOption = this.selectedOption();
          if (selectedOption) {
            this._setHighlightWidthAndXPost(selectedOption);
          }

          if (options.length === 0) {
            throw new Error('Please provide segmented options!');
          }
          this.selectOption(activeOption);
        }
      });
    });

    effect(() => {
      const isReady = this.isReady();

      untracked(() => {
        if (isReady) {
          const selectedOption = this.selectedOption();
          if (selectedOption) {
            this._setHighlightWidthAndXPost(selectedOption);
          }
        }
      });
    });
  }

  ngAfterViewInit(): void {
    this.tabLabels().forEach((option, index) => {
      this.focusMonitor
        .monitor(option.nativeElement, true)
        .subscribe((focusOrigin) => {
          const isFocused =
            focusOrigin === 'keyboard' || focusOrigin === 'program';
          if (isFocused) {
            this.focusedOption.set(this.segmentedOptions()[index] ?? null);
            this.focusVisibleOption.set(this.segmentedOptions()[index] ?? null);
          }
        });
    });

    // we don't want to show the initial animation, but only the subsequent ones
    this.ngZone.runOutsideAngular(() =>
      setTimeout(() => this.isReady.set(true)),
    );
    this.selectOption(this.activeOption());
  }

  /**
   * The method which will update the `selected` signal in `ds-segment-option` based on the selected name.
   * @param name Name of the selected option
   * @param event
   */
  selectOption(name: string, event?: Event): void {
    if (
      ((event &&
        this.activeOption() === name &&
        this.selectedOption()?.name() === name) ||
        name === undefined) &&
      this.activeOption() != null
    ) {
      return; // do nothing if the same option is clicked again
    }

    const option = this.segmentedOptions().find((x) => x.name() === name);
    if (option) {
      this.selectedOption.set(option);

      if (this.isReady()) {
        this._setHighlightWidthAndXPost(option);
      }
      this.activeOption.set(name);
    } else {
      // if no option can be found, we select the first one by default
      this.selectFirstOption();
    }
  }

  /**
   * Select first segment option. This is useful when the activeOption is not provided.
   * @private
   */
  private selectFirstOption() {
    const options = this.segmentedOptions();

    if (options.length === 0) {
      return;
    }

    const firstOption = options[0] ?? null;

    this.selectedOption.set(firstOption);
    this.activeOption.set(firstOption?.name() ?? '');
  }

  /**
   * Will get the active segment position in order to show the indicator on the background.
   * @private
   */
  private _setHighlightWidthAndXPost(option: DsSegmentedOption) {
    for (const item of this.tabLabels()) {
      this.resizeObserver.unobserve(item.nativeElement);
    }

    const element = this.tabLabels().find(
      (item) => item.nativeElement.id === `ds-segment-item-${option.name()}`,
    );
    if (element) {
      this._setIndicatorCSSVars(element.nativeElement);
      this.resizeObserver.observe(element.nativeElement);
    }
  }

  /**
   * Will set the active element indicator related css variables
   * @private
   */
  private _setIndicatorCSSVars(element: HTMLDivElement) {
    const { offsetWidth, offsetLeft } = element;
    // We update the DOM directly, so we don't have to go through Angular Change Detection
    this.renderer.setProperty(
      this.scContainer().nativeElement,
      'style',
      `--ds-sc-highlight-width: ${offsetWidth}px; --ds-sc-highlight-x-pos: ${offsetLeft}px`,
    );
  }

  onKeydown(event: KeyboardEvent) {
    const { key } = event;
    const options = this.segmentedOptions();
    const currentIndex = options.findIndex((option) => option.focused());
    let newIndex: number | undefined;

    if (key === 'ArrowRight') {
      newIndex = (currentIndex + 1) % options.length;
    } else if (key === 'ArrowLeft') {
      newIndex = (currentIndex - 1 + options.length) % options.length;
    } else if (
      (key === ' ' || key === 'Enter') &&
      currentIndex !== -1 &&
      options[currentIndex]
    ) {
      this.selectOption(options[currentIndex].name(), event);
    }

    if (newIndex !== undefined) {
      event.preventDefault();
      const newOption = options[newIndex];
      if (newOption) {
        this.focusOption(newOption, newIndex);
      }
    }
  }

  private focusOption(option: DsSegmentedOption, index: number) {
    const focusOption = this.tabLabels()[index];
    if (focusOption) {
      this.focusedOption.set(option);
      this.focusVisibleOption.set(option);
      this.focusMonitor.focusVia(focusOption.nativeElement, 'keyboard');
    }
  }

  ngOnDestroy() {
    if (this.tabLabels()) {
      this.tabLabels().forEach((option) =>
        this.focusMonitor.stopMonitoring(option),
      );
    }

    this.resizeObserver.disconnect();
  }
}
