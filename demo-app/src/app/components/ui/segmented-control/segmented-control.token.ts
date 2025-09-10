import { InjectionToken, Provider } from '@angular/core';

export type DsSegmentedControlOptions = {
  /*
   * Whether the control should take up the full width of the container.
   */
  fullWidth: boolean;
};

const DEFAULT_SC_OPTIONS: DsSegmentedControlOptions = {
  fullWidth: false,
};

export const SEGMENTED_CONTROL_OPTIONS_TOKEN =
  new InjectionToken<DsSegmentedControlOptions>('SC_OPTIONS', {
    providedIn: 'root',
    factory: () => DEFAULT_SC_OPTIONS,
  });

export const provideSegmentedControlOptions = (
  options: Partial<DsSegmentedControlOptions>,
) =>
  ({
    provide: SEGMENTED_CONTROL_OPTIONS_TOKEN,
    useValue: { ...DEFAULT_SC_OPTIONS, ...options },
  }) satisfies Provider;
