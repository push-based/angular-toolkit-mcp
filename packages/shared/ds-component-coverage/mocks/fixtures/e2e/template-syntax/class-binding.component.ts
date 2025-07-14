import { Component } from '@angular/core';

@Component({
  selector: 'class-binding',
  template: `<button [class.btn]>Click me</button>`,
})
export class ClassAttributeUsageComponent {}
