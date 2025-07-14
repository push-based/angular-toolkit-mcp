import { Component } from '@angular/core';

@Component({
  selector: 'inl-styl-inl-tmpl',
  template: `<button class="btn">Click me</button>`,
  styles: [
    `
      .btn {
        color: red;
      }
    `,
  ],
})
export class InlStylInlTmplComponent {}
