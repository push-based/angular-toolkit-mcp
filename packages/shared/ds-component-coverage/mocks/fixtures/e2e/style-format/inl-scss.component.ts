import { Component } from '@angular/core';

@Component({
  selector: 'inl-scss',
  template: `<button class="btn">Click me</button>`,
  styles: [
    `
      .btn {
        span {
          color: darkred;
        }

        color: red;
      }
    `,
  ],
})
export class InlCssComponent {}
