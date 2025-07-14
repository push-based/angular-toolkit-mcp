import { Component } from '@angular/core';

@Component({
  selector: 'app-template-reference-error',
  standalone: true,
  template: `
    <div>
      <h2>Template Reference Error Test</h2>
      <input #inputRef type="text" />
      <button (click)="processInput(nonExistentRef.value)">Process</button>
      <div>{{ undefinedTemplateVar }}</div>
      <span>{{ someRef.innerText }}</span>
      <p #paragraphRef>{{ missingMethod(paragraphRef.textContent) }}</p>
      <div *ngFor="let item of items; let i = index">
        {{ item.name }} - {{ j }} - {{ unknownVar }}
      </div>
    </div>
  `,
  styles: [`
    div { margin: 8px; }
  `]
})
export class TemplateReferenceErrorComponent {
  items = [{ name: 'test1' }, { name: 'test2' }];
  
  processInput(value: string): void {
    console.log('Processing:', value);
  }
  
  // Note: missingMethod is called in template but not defined
  // Note: nonExistentRef, undefinedTemplateVar, someRef, j, unknownVar are referenced but don't exist
} 