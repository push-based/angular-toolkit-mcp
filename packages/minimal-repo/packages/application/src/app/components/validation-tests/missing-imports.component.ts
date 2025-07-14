import { Component } from '@angular/core';

@Component({
  selector: 'app-missing-imports',
  standalone: true,
  template: `
    <div>
      <h2>Missing Imports Test</h2>
      <input [(ngModel)]="inputValue" placeholder="Two-way binding without FormsModule" />
      <div *ngIf="showContent">Conditional content without CommonModule</div>
      <ul>
        <li *ngFor="let item of items">{{ item | uppercase }}</li>
      </ul>
      <form #myForm="ngForm">
        <input name="test" ngModel required />
        <button type="submit" [disabled]="myForm.invalid">Submit</button>
      </form>
    </div>
  `,
  styles: [`
    div { padding: 10px; }
  `]
})
export class MissingImportsComponent {
  inputValue = '';
  showContent = true;
  items = ['apple', 'banana', 'cherry'];
} 