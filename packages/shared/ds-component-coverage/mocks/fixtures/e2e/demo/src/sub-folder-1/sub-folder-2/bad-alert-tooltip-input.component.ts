import { Component } from '@angular/core';

@Component({
  selector: 'app-bad-alert-tooltip-input',
  template: `
    <div class="alert alert-warning">This is a warning alert!</div>

    <div class="tooltip">Hover over me!</div>

    <input class="form-control" placeholder="Enter text here" />
  `,
})
export class BadAlertTooltipInputComponent {}
