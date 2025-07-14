import { Component } from '@angular/core';

@Component({
  selector: 'app-bad-button-dropdown',
  styles: [
    `
      .btn {
        margin: 10px;
      }
      .btn-dropdown {
        padding: 10px;
      }
    `,
  ],
  template: `
    <button class="btn btn-primary">Click Me</button>
    <select class="btn-dropdown">
      <option>Option 1</option>
      <option>Option 2</option>
    </select>
  `,
})
export class BadButtonDropdownComponent {}
