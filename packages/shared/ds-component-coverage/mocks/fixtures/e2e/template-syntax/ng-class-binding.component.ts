import { Component } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'ng-class-binding',
  imports: [NgClass],
  template: `<button [ngClass]="'btn'">Click me</button>`,
})
export class NgClassBindingComponent {}
