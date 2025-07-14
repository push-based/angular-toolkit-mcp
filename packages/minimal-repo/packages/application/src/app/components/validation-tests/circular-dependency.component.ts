import { Component } from '@angular/core';
import { CircularDependencyComponent } from './circular-dependency.component';

@Component({
  selector: 'app-circular-dependency',
  standalone: true,
  imports: [CircularDependencyComponent],
  template: `
    <div>
      <h2>Circular Dependency Test</h2>
      <p>This component imports itself!</p>
      <app-circular-dependency></app-circular-dependency>
    </div>
  `,
  styles: [`
    div { 
      border: 2px solid orange; 
      margin: 5px; 
      padding: 10px; 
    }
  `]
})
export class CircularDependencyComponent {
  title = 'Circular Dependency Component';
} 