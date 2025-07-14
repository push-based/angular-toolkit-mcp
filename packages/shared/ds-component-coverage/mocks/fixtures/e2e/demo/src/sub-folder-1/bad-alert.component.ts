import { Component } from '@angular/core';

@Component({
  selector: 'app-bad-alert',
  template: `<div class="alert alert-danger">This is a legacy alert!</div>`,
  styles: [
    `
      .alert {
        color: red;
      }
    `,
  ],
})
export class BadAlertComponent {}
