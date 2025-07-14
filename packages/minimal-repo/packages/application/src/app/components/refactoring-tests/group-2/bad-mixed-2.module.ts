// generate angular module

import { NgModule } from '@angular/core';
import { MixedStylesNotStandaloneComponent2 } from './bad-mixed-not-standalone-2.component';

@NgModule({
  declarations: [],
  imports: [MixedStylesNotStandaloneComponent2],
  exports: [MixedStylesNotStandaloneComponent2],
})
export class BadModuleModule2 {}
