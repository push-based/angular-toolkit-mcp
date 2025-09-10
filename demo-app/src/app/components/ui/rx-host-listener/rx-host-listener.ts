import { ChangeDetectorRef, ElementRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  type Observable,
  debounceTime,
  filter,
  fromEvent,
  merge,
  of,
  switchMap,
  tap,
} from 'rxjs';

export function rxHostListener<T extends Event>(event: string): Observable<T> {
  const cdr = inject(ChangeDetectorRef);

  // Listen to event
  return fromEvent<T>(inject(ElementRef).nativeElement, event).pipe(
    debounceTime(0),
    tap(() => cdr.markForCheck()), // Trigger CD like @HostListener would
    takeUntilDestroyed(), // Unsubscribe
  );
}

/*
 * @internal
 **/
export function rxHostPressedListener(): Observable<any> {
  return merge(
    rxHostListener('click'),
    rxHostListener<KeyboardEvent>('keyup').pipe(
      switchMap((x) => {
        return x.code === 'Space' || x.code === 'Enter' ? of(true) : of(null);
      }),
      filter(Boolean),
    ),
  ).pipe(debounceTime(0));
}
