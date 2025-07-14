import { Component } from '@angular/core';

@Component({
  selector: 'app-bad-window',
  template: `<h3>Window usage</h3>`,
})
export class BadWindowComponent {
  w = window;
}
