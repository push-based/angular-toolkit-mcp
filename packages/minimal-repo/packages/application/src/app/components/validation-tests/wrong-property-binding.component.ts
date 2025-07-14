import { Component } from '@angular/core';

@Component({
  selector: 'app-wrong-property',
  standalone: true,
  template: `
    <div>
      <h2>Wrong Property Binding Test</h2>
      <p>{{ nonExistentProperty }}</p>
      <input [value]="undefinedValue" />
      <div [class.active]="isActiveButNotDefined">
        Status: {{ status.value }}
      </div>
      <span [hidden]="hiddenFlag">{{ missingData }}</span>
    </div>
  `,
  styles: [`
    .active { background: green; }
  `]
})
export class WrongPropertyBindingComponent {
  title = 'Wrong Property Component';
  
  // Note: nonExistentProperty, undefinedValue, isActiveButNotDefined, status, hiddenFlag, and missingData are used in template but not defined
} 