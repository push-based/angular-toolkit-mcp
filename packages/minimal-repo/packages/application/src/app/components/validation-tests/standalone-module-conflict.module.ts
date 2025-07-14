import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StandaloneModuleConflictComponent } from './standalone-module-conflict.component';

@NgModule({
  declarations: [
    StandaloneModuleConflictComponent  // ERROR: Standalone components should not be declared in modules
  ],
  imports: [
    CommonModule
  ],
  exports: [
    StandaloneModuleConflictComponent
  ]
})
export class StandaloneModuleConflictModule { } 