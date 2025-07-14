import { Component } from '@angular/core';

@Component({
  selector: 'app-external-files-missing',
  standalone: true,
  templateUrl: './non-existent-template.html',  // This file doesn't exist
  styleUrls: [
    './missing-styles.css',                     // This file doesn't exist
    './another-missing-style.scss',             // This file doesn't exist
    '../shared/non-existent-shared.css'         // This file doesn't exist
  ]
})
export class ExternalFilesMissingComponent {
  title = 'External Files Missing Component';
  message = 'This component references non-existent external files';
} 