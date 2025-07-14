// generate angular module

import { NgModule } from '@angular/core';
import { MixedStylesNotStandaloneComponent } from './bad-mixed-not-standalone.component';

@NgModule({
  declarations: [],
  imports: [MixedStylesNotStandaloneComponent],
  exports: [MixedStylesNotStandaloneComponent],
})
export class BadModuleModule {}
