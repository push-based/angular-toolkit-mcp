import { Component } from '@angular/core';

@Component({
  selector: 'app-invalid-syntax',
  standalone: false,
  template: `
    <div>
      <h2>Invalid Template Syntax Test</h2>
      <p>{{ unclosedInterpolation
      <div [attr.data-value="missingQuotes>Content</div>
      <button (click)="method(">Malformed event binding</button>
      <input [(ngModel)]="value" [disabled]="true" [readonly]="false" />
      <span *ngFor="let item of items; let i = index">{{ item.name }}</span>
      <div [ngClass]="{active: true, disabled: }">Class binding error</div>
    </div>
  `,
  styles: [`
    div { margin: 10px; }
  `]
})
export class InvalidTemplateSyntaxComponent {
  value = '';
  items = [{ name: 'test' }];
} 