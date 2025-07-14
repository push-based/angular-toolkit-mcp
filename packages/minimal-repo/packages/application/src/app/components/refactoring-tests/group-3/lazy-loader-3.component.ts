import {
  Component,
  ViewContainerRef,
  ComponentRef,
  OnInit,
} from '@angular/core';

@Component({
  selector: 'app-lazy-loader',
  template: `
    <div>
      <h2>Lazy Component Loader</h2>
      <button (click)="loadComponent()" [disabled]="isLoading">
        {{ isLoading ? 'Loading...' : 'Load External Assets Component' }}
      </button>
      <div #dynamicContainer></div>
    </div>
  `,
  styles: [
    `
      button {
        padding: 10px 20px;
        margin: 10px 0;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      button:disabled {
        background-color: #6c757d;
        cursor: not-allowed;
      }
    `,
  ],
})
export class LazyLoaderComponent3 implements OnInit {
  isLoading = false;
  private componentRef?: ComponentRef<any>;

  constructor(private viewContainerRef: ViewContainerRef) {}

  ngOnInit() {
    console.log('LazyLoaderComponent initialized');
  }

  async loadComponent() {
    if (this.isLoading || this.componentRef) {
      return;
    }

    this.isLoading = true;

    try {
      // Dynamic import statement - this is the key part for lazy loading
      const { BadMixedExternalAssetsComponent3 } = await import(
        './bad-mixed-external-assets-3.component'
      );

      // Clear the container
      this.viewContainerRef.clear();

      // Create the component dynamically
      this.componentRef = this.viewContainerRef.createComponent(
        BadMixedExternalAssetsComponent3
      );

      console.log('Component loaded successfully');
    } catch (error) {
      console.error('Failed to load component:', error);
    } finally {
      this.isLoading = false;
    }
  }

  ngOnDestroy() {
    if (this.componentRef) {
      this.componentRef.destroy();
    }
  }
}
