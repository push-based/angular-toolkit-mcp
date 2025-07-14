import { Component } from '@angular/core';

@Component({
  selector: 'inl-css',
  template: ` <button class="btn">Click me</button>`,
  styles: [
    `
      .btn {
        color: red;
      }
    `,
  ],
})
export class InlCssComponent {}
