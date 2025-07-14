import { Component } from '@angular/core';

@Component({
  selector: 'app-type-mismatch',
  standalone: true,
  template: `
    <div>
      <h2>Type Mismatch Test</h2>
      <input [value]="numberValue" type="text" />
      <div [hidden]="stringFlag">Content</div>
      <button [disabled]="objectValue">Click me</button>
      <span [title]="arrayValue">Hover me</span>
      <p>{{ booleanValue.length }}</p>
      <div>{{ numberValue.toUpperCase() }}</div>
      <input [(ngModel)]="readonlyValue" />
    </div>
  `,
  styles: [`
    div { padding: 10px; }
  `]
})
export class TypeMismatchComponent {
  numberValue: number = 42;
  stringFlag: string = 'true';  // Should be boolean for [hidden]
  objectValue: { name: string } = { name: 'test' };  // Should be boolean for [disabled]
  arrayValue: string[] = ['a', 'b', 'c'];  // Should be string for [title]
  booleanValue: boolean = true;  // Calling .length on boolean
  readonly readonlyValue: string = 'readonly';  // Two-way binding on readonly
  
  // Note: Type mismatches will cause runtime errors and template binding issues
} 