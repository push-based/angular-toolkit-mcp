import { Component } from '@angular/core';

@Component({
  selector: 'app-bad-global-this',
  template: `<h3>Global this usage</h3>`,
})
export class BadGlobalThisComponent {
  g = globalThis;
}
