import { Component } from '@angular/core';

@Component({
  selector: 'app-mixed-styles',
  standalone: false,
  template: `
    <!-- ✅ Good: Using DSButton -->
    <ds-button>Good Button</ds-button>

    <!-- ❌ Bad: Legacy button class -->
    <button class="btn btn-primary">Bad Button</button>

    <!-- ✅ Good: Using DSModal -->
    <ds-modal [open]="true">
      <p>Good Modal Content</p>
    </ds-modal>

    <!-- ❌ Bad: Custom modal with legacy styles -->
    <div class="modal">
      <div class="modal-content">
        <h2>Bad Modal</h2>
        <p>This is a legacy modal.</p>
      </div>
    </div>

    <!-- ✅ Good: DSProgressBar -->
    <ds-progress-bar [value]="50"></ds-progress-bar>

    <!-- ❌ Bad: Manually styled progress bar -->
    <div class="progress-bar">
      <div class="progress" style="width: 50%;"></div>
    </div>

    <!-- ✅ Good: DSDropdown -->
    <ds-dropdown [options]="['Option 1', 'Option 2']"></ds-dropdown>

    <!-- ❌ Bad: Legacy dropdown -->
    <select class="dropdown">
      <option>Option 1</option>
      <option>Option 2</option>
    </select>

    <!-- ✅ Good: Using DSAlert -->
    <ds-alert type="error"> Good Alert </ds-alert>

    <!-- ❌ Bad: Manually styled alert -->
    <div class="alert alert-danger">Bad Alert</div>

    <!-- ✅ Good: Using DSTooltip -->
    <ds-tooltip content="Good tooltip">Hover me</ds-tooltip>

    <!-- ❌ Bad: Legacy tooltip -->
    <div class="tooltip">Bad tooltip</div>

    <!-- ✅ Good: Using DSBreadcrumb -->
    <ds-breadcrumb>
      <ds-breadcrumb-item>Home</ds-breadcrumb-item>
      <ds-breadcrumb-item>Products</ds-breadcrumb-item>
      <ds-breadcrumb-item>Details</ds-breadcrumb-item>
    </ds-breadcrumb>

    <!-- ❌ Bad: Manually created breadcrumb -->
    <nav class="breadcrumb">
      <span>Home</span> / <span>Products</span> / <span>Details</span>
    </nav>
  `,
})
export class MixedStylesNotStandaloneComponent {}
