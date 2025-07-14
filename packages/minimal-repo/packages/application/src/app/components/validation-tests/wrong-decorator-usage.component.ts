import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-wrong-decorator',
  standalone: true,
  template: `
    <div>
      <h2>Wrong Decorator Usage Test</h2>
      <p>Input value: {{ inputValue }}</p>
      <button (click)="emitEvent()">Emit Event</button>
    </div>
  `,
  styles: [`
    div { padding: 12px; }
  `]
})
export class WrongDecoratorUsageComponent {
  
  // Wrong: @Input on a method
  @Input()
  setInputValue(value: string): void {
    this.inputValue = value;
  }
  
  // Wrong: @Output on a regular property
  @Output()
  regularProperty = 'not an event emitter';
  
  // Wrong: @Input with wrong type
  @Input()
  inputValue: EventEmitter<string> = new EventEmitter();
  
  // Wrong: @Output with wrong type
  @Output()
  outputValue: string = 'should be EventEmitter';
  
  // Wrong: Multiple decorators on same property
  @Input()
  @Output()
  conflictedProperty = 'has both decorators';
  
  emitEvent(): void {
    // This will cause runtime error since outputValue is not EventEmitter
    this.outputValue.emit('test');
  }
} 