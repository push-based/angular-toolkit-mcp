# Code PushUp Report

| 🏷 Category                                       | ⭐ Score  | 🛡 Audits |
| :------------------------------------------------ | :-------: | :-------: |
| [Design System Coverage](#design-system-coverage) | 🔴 **38** |    13     |

## 🏷 Categories

### Design System Coverage

Usage of design system components

🔴 Score: **38**

- 🟥 [Usage coverage for DSButton component](#usage-coverage-for-dsbutton-component-angular-design-system-coverage) (_Angular Design System Coverage_) - **7 classes found**
- 🟥 [Usage coverage for DSAlert component](#usage-coverage-for-dsalert-component-angular-design-system-coverage) (_Angular Design System Coverage_) - **6 classes found**
- 🟥 [Usage coverage for DSTooltip component](#usage-coverage-for-dstooltip-component-angular-design-system-coverage) (_Angular Design System Coverage_) - **5 classes found**
- 🟥 [Usage coverage for DSBreadcrumb component](#usage-coverage-for-dsbreadcrumb-component-angular-design-system-coverage) (_Angular Design System Coverage_) - **4 classes found**
- 🟥 [Usage coverage for DSDropdown component](#usage-coverage-for-dsdropdown-component-angular-design-system-coverage) (_Angular Design System Coverage_) - **4 classes found**
- 🟥 [Usage coverage for DSModal component](#usage-coverage-for-dsmodal-component-angular-design-system-coverage) (_Angular Design System Coverage_) - **4 classes found**
- 🟥 [Usage coverage for DSProgressBar component](#usage-coverage-for-dsprogressbar-component-angular-design-system-coverage) (_Angular Design System Coverage_) - **4 classes found**
- 🟥 [Usage coverage for DSInput component](#usage-coverage-for-dsinput-component-angular-design-system-coverage) (_Angular Design System Coverage_) - **1 class found**
- 🟩 [Usage coverage for DSAccordion component](#usage-coverage-for-dsaccordion-component-angular-design-system-coverage) (_Angular Design System Coverage_) - **0 classes found**
- 🟩 [Usage coverage for DSCard component](#usage-coverage-for-dscard-component-angular-design-system-coverage) (_Angular Design System Coverage_) - **0 classes found**
- 🟩 [Usage coverage for DSNavbar component](#usage-coverage-for-dsnavbar-component-angular-design-system-coverage) (_Angular Design System Coverage_) - **0 classes found**
- 🟩 [Usage coverage for DSSlider component](#usage-coverage-for-dsslider-component-angular-design-system-coverage) (_Angular Design System Coverage_) - **0 classes found**
- 🟩 [Usage coverage for DSTabsModule component](#usage-coverage-for-dstabsmodule-component-angular-design-system-coverage) (_Angular Design System Coverage_) - **0 classes found**

## 🛡️ Audits

### Usage coverage for DSButton component (Angular Design System Coverage)

<details>
<summary>🟥 <b>7 classes found</b> (score: 0)</summary>

#### Issues

|  Severity  | Message                                                                                                                                                                                                                                                                         | Source file                                                                                                                                                                                                                  | Line(s) |
| :--------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-----: |
| 🚨 _error_ | ✏️🔲 Element <code>button</code> in attribute <code>class</code> uses deprecated class <code>btn</code>. Use <code>DSButton</code> instead. <a href="https://storybook.company.com/latest/?path=/docs/components-button--overview" target="_blank">Learn more</a>.         | [`plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/bad-button-dropdown.component.ts`](../../../../plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/bad-button-dropdown.component.ts)         |    6    |
| 🚨 _error_ | ✏️🔲 Element <code>button</code> in attribute <code>class</code> uses deprecated class <code>btn-primary</code>. Use <code>DSButton</code> instead. <a href="https://storybook.company.com/latest/?path=/docs/components-button--overview" target="_blank">Learn more</a>. | [`plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/bad-button-dropdown.component.ts`](../../../../plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/bad-button-dropdown.component.ts)         |    6    |
| 🚨 _error_ | ✏️🔲 Element <code>button</code> in attribute <code>class</code> uses deprecated class <code>btn</code>. Use <code>DSButton</code> instead. <a href="https://storybook.company.com/latest/?path=/docs/components-button--overview" target="_blank">Learn more</a>.         | [`plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/bad-mixed.component.ts`](../../../../plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/bad-mixed.component.ts)                             |   10    |
| 🚨 _error_ | ✏️🔲 Element <code>button</code> in attribute <code>class</code> uses deprecated class <code>btn-primary</code>. Use <code>DSButton</code> instead. <a href="https://storybook.company.com/latest/?path=/docs/components-button--overview" target="_blank">Learn more</a>. | [`plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/bad-mixed.component.ts`](../../../../plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/bad-mixed.component.ts)                             |   10    |
| 🚨 _error_ | 🔗🎨 ️ The selector's class <code>btn</code> is deprecated. Use <code>DSButton</code> and delete the styles. <a href="https://storybook.company.com/latest/?path=/docs/components-button--overview" target="_blank">Learn more</a>.                                        | [`plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/mixed-external-assets.component.css`](../../../../plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/mixed-external-assets.component.css)   |  7-14   |
| 🚨 _error_ | 🔗🔲 Element <code>button</code> in attribute <code>class</code> uses deprecated class <code>btn</code>. Use <code>DSButton</code> instead. <a href="https://storybook.company.com/latest/?path=/docs/components-button--overview" target="_blank">Learn more</a>.         | [`plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/mixed-external-assets.component.html`](../../../../plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/mixed-external-assets.component.html) |    6    |
| 🚨 _error_ | 🔗🔲 Element <code>button</code> in attribute <code>class</code> uses deprecated class <code>btn-primary</code>. Use <code>DSButton</code> instead. <a href="https://storybook.company.com/latest/?path=/docs/components-button--overview" target="_blank">Learn more</a>. | [`plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/mixed-external-assets.component.html`](../../../../plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/mixed-external-assets.component.html) |    6    |

</details>

Coverage audit for DSButton component. Matching classes: btn, btn-primary, legacy-button

### Usage coverage for DSAlert component (Angular Design System Coverage)

<details>
<summary>🟥 <b>6 classes found</b> (score: 0)</summary>

#### Issues

|  Severity  | Message                                                                                                                                                                                                                                                              | Source file                                                                                                                                                                                                                  | Line(s) |
| :--------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-----: |
| 🚨 _error_ | ✏️🔲 Element <code>div</code> in attribute <code>class</code> uses deprecated class <code>alert</code>. Use <code>DSAlert</code> instead. <a href="https://storybook.company.com/latest/?path=/docs/components-alert--overview" target="_blank">Learn more</a>. | [`plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/bad-alert-tooltip-input.component.ts`](../../../../plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/bad-alert-tooltip-input.component.ts) |    6    |
| 🚨 _error_ | ✏️🔲 Element <code>div</code> in attribute <code>class</code> uses deprecated class <code>alert</code>. Use <code>DSAlert</code> instead. <a href="https://storybook.company.com/latest/?path=/docs/components-alert--overview" target="_blank">Learn more</a>. | [`plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/bad-alert.component.ts`](../../../../plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/bad-alert.component.ts)                             |    5    |
| 🚨 _error_ | ✏️🎨 ️ The selector's class <code>alert</code> is deprecated. Use <code>DSAlert</code> and delete the styles. <a href="https://storybook.company.com/latest/?path=/docs/components-alert--overview" target="_blank">Learn more</a>.                             | [`plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/bad-alert.component.ts`](../../../../plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/bad-alert.component.ts)                             |  7-10   |
| 🚨 _error_ | ✏️🔲 Element <code>div</code> in attribute <code>class</code> uses deprecated class <code>alert</code>. Use <code>DSAlert</code> instead. <a href="https://storybook.company.com/latest/?path=/docs/components-alert--overview" target="_blank">Learn more</a>. | [`plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/bad-mixed.component.ts`](../../../../plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/bad-mixed.component.ts)                             |   46    |
| 🚨 _error_ | 🔗🎨 ️ The selector's class <code>alert</code> is deprecated. Use <code>DSAlert</code> and delete the styles. <a href="https://storybook.company.com/latest/?path=/docs/components-alert--overview" target="_blank">Learn more</a>.                             | [`plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/mixed-external-assets.component.css`](../../../../plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/mixed-external-assets.component.css)   |  43-47  |
| 🚨 _error_ | 🔗🔲 Element <code>div</code> in attribute <code>class</code> uses deprecated class <code>alert</code>. Use <code>DSAlert</code> instead. <a href="https://storybook.company.com/latest/?path=/docs/components-alert--overview" target="_blank">Learn more</a>. | [`plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/mixed-external-assets.component.html`](../../../../plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/mixed-external-assets.component.html) |   22    |

</details>

Coverage audit for DSAlert component. Matching classes: alert, notification, legacy-alert

### Usage coverage for DSTooltip component (Angular Design System Coverage)

<details>
<summary>🟥 <b>5 classes found</b> (score: 0)</summary>

#### Issues

|  Severity  | Message                                                                                                                                                                                                                                                                    | Source file                                                                                                                                                                                                                  | Line(s) |
| :--------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-----: |
| 🚨 _error_ | ✏️🔲 Element <code>div</code> in attribute <code>class</code> uses deprecated class <code>tooltip</code>. Use <code>DSTooltip</code> instead. <a href="https://storybook.company.com/latest/?path=/docs/components-tooltip--overview" target="_blank">Learn more</a>. | [`plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/bad-alert-tooltip-input.component.ts`](../../../../plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/bad-alert-tooltip-input.component.ts) |    8    |
| 🚨 _error_ | ✏️🔲 Element <code>div</code> in attribute <code>class</code> uses deprecated class <code>tooltip</code>. Use <code>DSTooltip</code> instead. <a href="https://storybook.company.com/latest/?path=/docs/components-tooltip--overview" target="_blank">Learn more</a>. | [`plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/bad-mixed.component.ts`](../../../../plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/bad-mixed.component.ts)                             |   52    |
| 🚨 _error_ | 🔗🎨 ️ The selector's class <code>tooltip</code> is deprecated. Use <code>DSTooltip</code> and delete the styles. <a href="https://storybook.company.com/latest/?path=/docs/components-tooltip--overview" target="_blank">Learn more</a>.                             | [`plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/mixed-external-assets.component.css`](../../../../plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/mixed-external-assets.component.css)   |  57-61  |
| 🚨 _error_ | 🔗🎨 ️ The selector's class <code>tooltip</code> is deprecated. Use <code>DSTooltip</code> and delete the styles. <a href="https://storybook.company.com/latest/?path=/docs/components-tooltip--overview" target="_blank">Learn more</a>.                             | [`plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/mixed-external-assets.component.css`](../../../../plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/mixed-external-assets.component.css)   |  63-73  |
| 🚨 _error_ | 🔗🔲 Element <code>div</code> in attribute <code>class</code> uses deprecated class <code>tooltip</code>. Use <code>DSTooltip</code> instead. <a href="https://storybook.company.com/latest/?path=/docs/components-tooltip--overview" target="_blank">Learn more</a>. | [`plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/mixed-external-assets.component.html`](../../../../plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/mixed-external-assets.component.html) |   31    |

</details>

Coverage audit for DSTooltip component. Matching classes: tooltip, legacy-tooltip, info-bubble

### Usage coverage for DSBreadcrumb component (Angular Design System Coverage)

<details>
<summary>🟥 <b>4 classes found</b> (score: 0)</summary>

#### Issues

|  Severity  | Message                                                                                                                                                                                                                                                                             | Source file                                                                                                                                                                                                                  | Line(s) |
| :--------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-----: |
| 🚨 _error_ | ✏️🔲 Element <code>nav</code> in attribute <code>class</code> uses deprecated class <code>breadcrumb</code>. Use <code>DSBreadcrumb</code> instead. <a href="https://storybook.company.com/latest/?path=/docs/components-breadcrumb--overview" target="_blank">Learn more</a>. | [`plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/bad-mixed.component.ts`](../../../../plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/bad-mixed.component.ts)                             |  62-64  |
| 🚨 _error_ | 🔗🎨 ️ The selector's class <code>breadcrumb</code> is deprecated. Use <code>DSBreadcrumb</code> and delete the styles. <a href="https://storybook.company.com/latest/?path=/docs/components-breadcrumb--overview" target="_blank">Learn more</a>.                             | [`plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/mixed-external-assets.component.css`](../../../../plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/mixed-external-assets.component.css)   |  76-79  |
| 🚨 _error_ | 🔗🎨 ️ The selector's class <code>breadcrumb</code> is deprecated. Use <code>DSBreadcrumb</code> and delete the styles. <a href="https://storybook.company.com/latest/?path=/docs/components-breadcrumb--overview" target="_blank">Learn more</a>.                             | [`plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/mixed-external-assets.component.css`](../../../../plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/mixed-external-assets.component.css)   |  81-84  |
| 🚨 _error_ | 🔗🔲 Element <code>nav</code> in attribute <code>class</code> uses deprecated class <code>breadcrumb</code>. Use <code>DSBreadcrumb</code> instead. <a href="https://storybook.company.com/latest/?path=/docs/components-breadcrumb--overview" target="_blank">Learn more</a>. | [`plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/mixed-external-assets.component.html`](../../../../plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/mixed-external-assets.component.html) |  34-36  |

</details>

Coverage audit for DSBreadcrumb component. Matching classes: breadcrumb, legacy-breadcrumb, nav-breadcrumb

### Usage coverage for DSDropdown component (Angular Design System Coverage)

<details>
<summary>🟥 <b>4 classes found</b> (score: 0)</summary>

#### Issues

|  Severity  | Message                                                                                                                                                                                                                                                                          | Source file                                                                                                                                                                                                                  | Line(s) |
| :--------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-----: |
| 🚨 _error_ | ✏️🔲 Element <code>select</code> in attribute <code>class</code> uses deprecated class <code>dropdown</code>. Use <code>DSDropdown</code> instead. <a href="https://storybook.company.com/latest/?path=/docs/components-dropdown--overview" target="_blank">Learn more</a>. | [`plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/bad-button-dropdown.component.ts`](../../../../plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/bad-button-dropdown.component.ts)         |  7-10   |
| 🚨 _error_ | ✏️🔲 Element <code>select</code> in attribute <code>class</code> uses deprecated class <code>dropdown</code>. Use <code>DSDropdown</code> instead. <a href="https://storybook.company.com/latest/?path=/docs/components-dropdown--overview" target="_blank">Learn more</a>. | [`plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/bad-mixed.component.ts`](../../../../plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/bad-mixed.component.ts)                             |  37-40  |
| 🚨 _error_ | 🔗🎨 ️ The selector's class <code>dropdown</code> is deprecated. Use <code>DSDropdown</code> and delete the styles. <a href="https://storybook.company.com/latest/?path=/docs/components-dropdown--overview" target="_blank">Learn more</a>.                                | [`plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/mixed-external-assets.component.css`](../../../../plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/mixed-external-assets.component.css)   |  50-54  |
| 🚨 _error_ | 🔗🔲 Element <code>select</code> in attribute <code>class</code> uses deprecated class <code>dropdown</code>. Use <code>DSDropdown</code> instead. <a href="https://storybook.company.com/latest/?path=/docs/components-dropdown--overview" target="_blank">Learn more</a>. | [`plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/mixed-external-assets.component.html`](../../../../plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/mixed-external-assets.component.html) |  25-28  |

</details>

Coverage audit for DSDropdown component. Matching classes: dropdown, legacy-dropdown, custom-dropdown

### Usage coverage for DSModal component (Angular Design System Coverage)

<details>
<summary>🟥 <b>4 classes found</b> (score: 0)</summary>

#### Issues

|  Severity  | Message                                                                                                                                                                                                                                                              | Source file                                                                                                                                                                                                                  | Line(s) |
| :--------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-----: |
| 🚨 _error_ | ✏️🔲 Element <code>div</code> in attribute <code>class</code> uses deprecated class <code>modal</code>. Use <code>DSModal</code> instead. <a href="https://storybook.company.com/latest/?path=/docs/components-modal--overview" target="_blank">Learn more</a>. | [`plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/bad-mixed.component.ts`](../../../../plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/bad-mixed.component.ts)                             |  18-23  |
| 🚨 _error_ | ✏️🔲 Element <code>div</code> in attribute <code>class</code> uses deprecated class <code>modal</code>. Use <code>DSModal</code> instead. <a href="https://storybook.company.com/latest/?path=/docs/components-modal--overview" target="_blank">Learn more</a>. | [`plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/bad-modal-progress.component.ts`](../../../../plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/bad-modal-progress.component.ts)           |  6-11   |
| 🚨 _error_ | 🔗🎨 ️ The selector's class <code>modal</code> is deprecated. Use <code>DSModal</code> and delete the styles. <a href="https://storybook.company.com/latest/?path=/docs/components-modal--overview" target="_blank">Learn more</a>.                             | [`plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/mixed-external-assets.component.css`](../../../../plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/mixed-external-assets.component.css)   |  17-25  |
| 🚨 _error_ | 🔗🔲 Element <code>div</code> in attribute <code>class</code> uses deprecated class <code>modal</code>. Use <code>DSModal</code> instead. <a href="https://storybook.company.com/latest/?path=/docs/components-modal--overview" target="_blank">Learn more</a>. | [`plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/mixed-external-assets.component.html`](../../../../plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/mixed-external-assets.component.html) |  9-14   |

</details>

Coverage audit for DSModal component. Matching classes: modal, popup, legacy-dialog

### Usage coverage for DSProgressBar component (Angular Design System Coverage)

<details>
<summary>🟥 <b>4 classes found</b> (score: 0)</summary>

#### Issues

|  Severity  | Message                                                                                                                                                                                                                                                                                 | Source file                                                                                                                                                                                                                  | Line(s) |
| :--------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-----: |
| 🚨 _error_ | ✏️🔲 Element <code>div</code> in attribute <code>class</code> uses deprecated class <code>progress-bar</code>. Use <code>DSProgressBar</code> instead. <a href="https://storybook.company.com/latest/?path=/docs/components-progressbar--overview" target="_blank">Learn more</a>. | [`plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/bad-mixed.component.ts`](../../../../plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/bad-mixed.component.ts)                             |  29-31  |
| 🚨 _error_ | ✏️🔲 Element <code>div</code> in attribute <code>class</code> uses deprecated class <code>progress-bar</code>. Use <code>DSProgressBar</code> instead. <a href="https://storybook.company.com/latest/?path=/docs/components-progressbar--overview" target="_blank">Learn more</a>. | [`plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/bad-modal-progress.component.ts`](../../../../plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/bad-modal-progress.component.ts)           |  13-15  |
| 🚨 _error_ | 🔗🎨 ️ The selector's class <code>progress-bar</code> is deprecated. Use <code>DSProgressBar</code> and delete the styles. <a href="https://storybook.company.com/latest/?path=/docs/components-progressbar--overview" target="_blank">Learn more</a>.                             | [`plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/mixed-external-assets.component.css`](../../../../plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/mixed-external-assets.component.css)   |  32-35  |
| 🚨 _error_ | 🔗🔲 Element <code>div</code> in attribute <code>class</code> uses deprecated class <code>progress-bar</code>. Use <code>DSProgressBar</code> instead. <a href="https://storybook.company.com/latest/?path=/docs/components-progressbar--overview" target="_blank">Learn more</a>. | [`plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/mixed-external-assets.component.html`](../../../../plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/mixed-external-assets.component.html) |  17-19  |

</details>

Coverage audit for DSProgressBar component. Matching classes: progress-bar, loading-bar, legacy-progress

### Usage coverage for DSInput component (Angular Design System Coverage)

<details>
<summary>🟥 <b>1 class found</b> (score: 0)</summary>

#### Issues

|  Severity  | Message                                                                                                                                                                                                                                                                       | Source file                                                                                                                                                                                                                  | Line(s) |
| :--------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-----: |
| 🚨 _error_ | ✏️🔲 Element <code>input</code> in attribute <code>class</code> uses deprecated class <code>form-control</code>. Use <code>DSInput</code> instead. <a href="https://storybook.company.com/latest/?path=/docs/components-input--overview" target="_blank">Learn more</a>. | [`plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/bad-alert-tooltip-input.component.ts`](../../../../plugins/ds-component-coverage/mocks/fixtures/coverage-audit/demo/bad-alert-tooltip-input.component.ts) |   10    |

</details>

Coverage audit for DSInput component. Matching classes: input, form-control, legacy-input

### Usage coverage for DSAccordion component (Angular Design System Coverage)

🟩 **0 classes found** (score: 100)

Coverage audit for DSAccordion component. Matching classes: accordion, collapse-panel, legacy-accordion

### Usage coverage for DSCard component (Angular Design System Coverage)

🟩 **0 classes found** (score: 100)

Coverage audit for DSCard component. Matching classes: card, legacy-card, custom-card

### Usage coverage for DSNavbar component (Angular Design System Coverage)

🟩 **0 classes found** (score: 100)

Coverage audit for DSNavbar component. Matching classes: navbar, navigation, legacy-navbar

### Usage coverage for DSSlider component (Angular Design System Coverage)

🟩 **0 classes found** (score: 100)

Coverage audit for DSSlider component. Matching classes: slider, range-slider, legacy-slider

### Usage coverage for DSTabsModule component (Angular Design System Coverage)

🟩 **0 classes found** (score: 100)

Coverage audit for DSTabsModule component. Matching classes: ms-tab-bar, legacy-tabs, custom-tabs

## About

Report was created by [Code PushUp](https://github.com/code-pushup/cli#readme) on Mon, Feb 10, 2025, 11:48 PM GMT+1.

| Plugin                         | Audits | Version | Duration |
| :----------------------------- | :----: | :-----: | -------: |
| Angular Design System Coverage |   13   |         |   366 ms |

| Commit                                         | Version  | Duration | Plugins | Categories | Audits |
| :--------------------------------------------- | :------: | -------: | :-----: | :--------: | :----: |
| wip (523fdf3354f4fdb952ab324ac92f7e0f3cd61957) | `0.57.0` |   418 ms |    1    |     1      |   13   |

---

Made with ❤ by [Code PushUp](https://github.com/code-pushup/cli#readme)
