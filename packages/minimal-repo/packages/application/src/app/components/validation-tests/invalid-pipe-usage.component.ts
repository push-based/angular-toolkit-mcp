import { Component } from '@angular/core';

@Component({
  selector: 'app-invalid-pipe',
  standalone: true,
  template: `
    <div>
      <h2>Invalid Pipe Usage Test</h2>
      <p>{{ text | nonExistentPipe }}</p>
      <div>{{ number | currency | }}</div>
      <span>{{ date | customPipe: 'param1' : 'param2' }}</span>
      <p>{{ value | | uppercase }}</p>
      <div>{{ items | slice:0:3 | unknownPipe }}</div>
      <span>{{ text | lowercase | missingPipe: }}</span>
      <p>{{ data | json | customFormat: param1, param2 }}</p>
    </div>
  `,
  styles: [`
    div { padding: 5px; }
  `]
})
export class InvalidPipeUsageComponent {
  text = 'Hello World';
  number = 123.45;
  date = new Date();
  value = 'test value';
  items = [1, 2, 3, 4, 5];
  data = { name: 'test', value: 42 };
  
  // Note: nonExistentPipe, customPipe, unknownPipe, missingPipe, customFormat don't exist
  // Note: malformed pipe syntax with empty pipes and missing parameters
} 