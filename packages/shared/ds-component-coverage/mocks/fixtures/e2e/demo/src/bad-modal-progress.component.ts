import { Component } from '@angular/core';

@Component({
  selector: 'app-bad-modal-progress',
  template: `
    <div class="modal">
      <div class="modal-content">
        <h2>Legacy Modal</h2>
        <p>This is an old modal.</p>
      </div>
    </div>

    <div class="progress-bar">
      <div class="progress" style="width: 50%;"></div>
    </div>
  `,
})
export class BadModalProgressComponent {}
