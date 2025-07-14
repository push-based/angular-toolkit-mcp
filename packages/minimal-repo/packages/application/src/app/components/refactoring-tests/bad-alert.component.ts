import { Component } from '@angular/core';

@Component({
  selector: 'app-bad-alert',
  styles: [
    `
      .alert {
        padding: 10px;
      }
      .btn {
        padding: 10px;
      }
    `,
  ],
  template: `<div class="alert alert-danger">This is a legacy alert!</div>`,
})
export class BadAlertComponent {}
