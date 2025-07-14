import { Component, inject, InjectionToken } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export const WINDOW = new InjectionToken<any>('Safe access window object', {
  providedIn: 'root',
  factory: () => inject(DOCUMENT).defaultView,
});

@Component({
  selector: 'app-bad-this-window-document',
  template: `<h3>Window usage</h3>`,
})
export class BadThisWindowDocumentComponent {
  readonly #window = inject(WINDOW);

  doc = this.#window.document;
}
