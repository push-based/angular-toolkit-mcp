// generate angular module

import { NgModule } from '@angular/core';
import { MixedStylesNotStandaloneComponent1 } from './bad-mixed-not-standalone-1.component';

@NgModule({
  declarations: [],
  imports: [MixedStylesNotStandaloneComponent1],
  exports: [MixedStylesNotStandaloneComponent1],
})
export class BadModuleModule1 {}
