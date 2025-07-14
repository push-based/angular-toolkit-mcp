import { Component } from '@angular/core';

@Component({
  selector: 'app-bad-document',
  template: `<h3>Document usage</h3>`,
})
export class BadDocumentComponent {
  d = document;
}
