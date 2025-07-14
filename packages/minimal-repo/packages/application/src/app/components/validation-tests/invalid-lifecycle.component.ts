import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-invalid-lifecycle',
  standalone: true,
  template: `
    <div>
      <h2>Invalid Lifecycle Test</h2>
      <p>This component has incorrect lifecycle implementations</p>
    </div>
  `,
  styles: [`
    div { padding: 15px; }
  `]
})
export class InvalidLifecycleComponent implements OnInit, OnDestroy, AfterViewInit {
  
  // Wrong signature - should be ngOnInit(): void
  ngOnInit(param: string): boolean {
    console.log('Wrong ngOnInit signature', param);
    return true;
  }
  
  // Wrong signature - should be ngOnDestroy(): void
  ngOnDestroy(cleanup: boolean): string {
    console.log('Wrong ngOnDestroy signature', cleanup);
    return 'destroyed';
  }
  
  // Wrong signature - should be ngAfterViewInit(): void
  ngAfterViewInit(element: HTMLElement): Promise<void> {
    console.log('Wrong ngAfterViewInit signature', element);
    return Promise.resolve();
  }
  
  // Method that doesn't exist in lifecycle
  ngOnChange(): void {
    console.log('This should be ngOnChanges');
  }
} 