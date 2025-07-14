import { Component } from '@angular/core';

@Component({
  selector: 'app-bad-button-dropdown',
  template: `
    <button class="btn btn-primary">Click Me</button>
    <select class="dropdown">
      <option>Option 1</option>
      <option>Option 2</option>
    </select>
  `,
})
export class BadButtonDropdownComponent {}
