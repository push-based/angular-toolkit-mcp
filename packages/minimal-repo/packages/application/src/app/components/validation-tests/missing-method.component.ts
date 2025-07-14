import { Component } from '@angular/core';

@Component({
  selector: 'app-missing-method',
  standalone: true,
  template: `
    <div>
      <h2>Missing Method Test</h2>
      <button (click)="nonExistentMethod()">Click me</button>
      <p>{{ getDisplayText() }}</p>
      <div>{{ calculateValue(42) }}</div>
    </div>
  `,
  styles: [`
    div {
      padding: 20px;
      border: 1px solid red;
    }
  `]
})
export class MissingMethodComponent {
  title = 'Missing Method Component';
  
  // Note: nonExistentMethod(), getDisplayText(), and calculateValue() are called in template but not defined
} 