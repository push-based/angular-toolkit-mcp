import { Component } from '@angular/core';

@Component({
  selector: 'app-standalone-module-conflict',
  standalone: true,
  template: `
    <div>
      <h2>Standalone Module Conflict Test</h2>
      <p>This standalone component should NOT be declared in a module</p>
    </div>
  `,
  styles: [`
    div { 
      background: #ffe6e6; 
      padding: 15px; 
      border: 1px solid red; 
    }
  `]
})
export class StandaloneModuleConflictComponent {
  title = 'Standalone Component in Module';
} 