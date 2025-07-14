import { Component } from '@angular/core';

@Component({
  selector: 'ds-button',
  template: `<button class="ds-btn">Click me</button>`,
  styles: [
    `
      .ds-btn {
        color: red;
      }
    `,
  ],
})
export class ButtonComponent {}
