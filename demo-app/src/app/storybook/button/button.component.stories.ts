import { generateStatusBadges } from '@design-system/shared-storybook-utils';
import { DemoIconComponent } from '@design-system/storybook-demo-cmp-lib';
import {
  DS_BUTTON_SIZE_ARRAY,
  DS_BUTTON_VARIANT_ARRAY,
  DS_BUTTON_TYPE_ARRAY,
  DsButton,
} from '../../components/ui/button';
import {
  DsComplexityRatingComponent,
  getVariantInfo,
} from '@frontend/ui/utils';
import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';

import { allThemes } from '../../modes';

type DsButtonStoryType = DsButton & { label: string };

const meta: Meta<DsButtonStoryType> = {
  title: 'Components/Button',
  component: DsButton,
  parameters: {
    status: generateStatusBadges('UX-2308', ['stable']),
  },

  excludeStories: /.*Data$/,
  argTypes: {
    label: {
      type: 'string',
      table: { defaultValue: { summary: 'Button' } },
      control: 'text',
      description: 'The text label of the button',
    },
    size: {
      options: DS_BUTTON_SIZE_ARRAY,
      table: { defaultValue: { summary: 'medium' }, category: 'Styling' },
      control: { type: 'select' },
      description: 'The size of the button',
    },
    variant: {
      options: DS_BUTTON_VARIANT_ARRAY,
      table: { defaultValue: { summary: 'primary' }, category: 'Styling' },
      control: { type: 'select' },
      description: 'The visual variant of the button',
    },
    type: {
      options: DS_BUTTON_TYPE_ARRAY,
      table: { defaultValue: { summary: 'button' }, category: 'Behavior' },
      control: { type: 'select' },
      description: 'The HTML button type',
    },
    disabled: {
      type: 'boolean',
      table: {
        defaultValue: { summary: 'false' },
      },
      control: { type: 'boolean' },
      description: 'The disabled state of the button',
    },
    loading: {
      type: 'boolean',
      table: { defaultValue: { summary: 'false' }, category: 'State' },
      control: { type: 'boolean' },
      description: 'The loading state of the button',
    },
    inverse: {
      type: 'boolean',
      table: { defaultValue: { summary: 'false' }, category: 'Styling' },
      control: { type: 'boolean' },
      description: 'The inverse theme state of the button',
    },
    fullWidth: {
      type: 'boolean',
      table: { defaultValue: { summary: 'false' }, category: 'Layout' },
      control: { type: 'boolean' },
      description: 'Makes the button take full width of its container',
    },
    ariaLabel: {
      type: 'string',
      table: { defaultValue: { summary: '' }, category: 'Accessibility' },
      control: 'text',
      description: 'Custom aria-label for the button',
    },
  },
  args: {
    label: 'Button',
    size: 'medium',
    variant: 'primary',
    type: 'button',
    disabled: false,
    loading: false,
    inverse: false,
    fullWidth: false,
    ariaLabel: '',
  },
  decorators: [moduleMetadata({ imports: [DemoIconComponent] })],
};

export default meta;

type Story = StoryObj<DsButtonStoryType>;

export const Default: Story = {
  parameters: {
    name: 'Default',
    design: {
      name: 'Whitelabel',
      type: 'figma',
      url: 'https://www.figma.com/file/NgrOt8MGJhe0obKFBQgqdT/Component-Tokens-(POC)?type=design&node-id=16640-68740&&mode=design&t=fS1qO73SS8lGciLj-4',
    },
  },
  name: 'Default',
  args: {
    ...meta.args,
  },
  render: (button) => ({
    template: `
        <ds-button 
          variant="${button.variant}" 
          size="${button.size}" 
          type="${button.type}"
          [disabled]="${button.disabled}"
          [loading]="${button.loading}"
          [inverse]="${button.inverse}"
          [fullWidth]="${button.fullWidth}"
          ${button.ariaLabel ? `ariaLabel="${button.ariaLabel}"` : ''}>
          ${button.label}
        </ds-button>
        `,
  }),
};

export const WithIcon: Story = {
  parameters: {
    name: 'With Icon',
    design: {
      name: 'Whitelabel',
      type: 'figma',
      url: 'https://www.figma.com/file/NgrOt8MGJhe0obKFBQgqdT/Component-Tokens-(POC)?type=design&node-id=16640-68740&&mode=design&t=fS1qO73SS8lGciLj-4',
    },
  },
  args: {
    ...Default.args,
  },
  render: (button) => ({
    template: `
        <ds-button 
          variant="${button.variant}" 
          size="${button.size}" 
          type="${button.type}"
          [disabled]="${button.disabled}"
          [loading]="${button.loading}"
          [inverse]="${button.inverse}"
          [fullWidth]="${button.fullWidth}"
          ${button.ariaLabel ? `ariaLabel="${button.ariaLabel}"` : ''}>
          <ds-demo-icon slot="start"/>
          ${button.label}
        </ds-button>
        `,
  }),
};

export const IconOnly: Story = {
  parameters: {
    name: 'Icon Only',
    design: {
      name: 'Whitelabel',
      type: 'figma',
      url: 'https://www.figma.com/file/NgrOt8MGJhe0obKFBQgqdT/Component-Tokens-(POC)?type=design&node-id=16640-68740&&mode=design&t=fS1qO73SS8lGciLj-4',
    },
  },
  args: {
    ...Default.args,
    label: '',
    ariaLabel: 'Icon button',
  },
  render: (button) => ({
    template: `
        <ds-button 
          variant="${button.variant}" 
          size="${button.size}" 
          type="${button.type}"
          [disabled]="${button.disabled}"
          [loading]="${button.loading}"
          [inverse]="${button.inverse}"
          [fullWidth]="${button.fullWidth}"
          ariaLabel="${button.ariaLabel}">
          <ds-demo-icon slot="start"/>
        </ds-button>
        `,
  }),
};

export const Loading: Story = {
  parameters: {
    name: 'Loading State',
    design: {
      name: 'Whitelabel',
      type: 'figma',
      url: 'https://www.figma.com/file/NgrOt8MGJhe0obKFBQgqdT/Component-Tokens-(POC)?type=design&node-id=16640-68740&&mode=design&t=fS1qO73SS8lGciLj-4',
    },
  },
  args: {
    ...Default.args,
    loading: true,
  },
  render: (button) => ({
    template: `
        <ds-button 
          variant="${button.variant}" 
          size="${button.size}" 
          type="${button.type}"
          [disabled]="${button.disabled}"
          [loading]="${button.loading}"
          [inverse]="${button.inverse}"
          [fullWidth]="${button.fullWidth}"
          ${button.ariaLabel ? `ariaLabel="${button.ariaLabel}"` : ''}>
          ${button.label}
        </ds-button>
        `,
  }),
};

export const FullWidth: Story = {
  parameters: {
    name: 'Full Width',
    design: {
      name: 'Whitelabel',
      type: 'figma',
      url: 'https://www.figma.com/file/NgrOt8MGJhe0obKFBQgqdT/Component-Tokens-(POC)?type=design&node-id=16640-68740&&mode=design&t=fS1qO73SS8lGciLj-4',
    },
  },
  args: {
    ...Default.args,
    fullWidth: true,
  },
  render: (button) => ({
    template: `
        <div style="width: 300px;">
          <ds-button 
            variant="${button.variant}" 
            size="${button.size}" 
            type="${button.type}"
            [disabled]="${button.disabled}"
            [loading]="${button.loading}"
            [inverse]="${button.inverse}"
            [fullWidth]="${button.fullWidth}"
            ${button.ariaLabel ? `ariaLabel="${button.ariaLabel}"` : ''}>
            ${button.label}
          </ds-button>
        </div>
        `,
  }),
};

export const variantInfo = {
  ...getVariantInfo(meta),
  tags: ['docs-template'],
};

export const ComplexityLevel: Story = {
  tags: ['docs-template'],

  render: () => ({
    moduleMetadata: {
      imports: [DsComplexityRatingComponent],
    },
    template: `
            <ds-complexity-rating 
                [totalVariants]="variantInfo.totalCombinations"
                [variantOptions]="variantInfo.variantOptions"
                [sizeOptions]="variantInfo.sizeOptions"
            ></ds-complexity-rating>
        `,
    props: {
      variantInfo,
    },
  }),
};

export const AllSizes: Story = {
  tags: ['docs-template'],
  render: (args) => ({
    props: args,
    template: `
            <div style="display: flex; align-items: center; gap: 16px;">
                <ds-button size="xsmall">XSmall</ds-button>
                <ds-button size="small">Small</ds-button>
                <ds-button size="medium">Medium</ds-button>
                <ds-button size="large">Large</ds-button>
            </div>
        `,
  }),
};

export const AllVariants: Story = {
  tags: ['docs-template'],
  render: (args) => ({
    props: args,
    template: `
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); grid-gap: 8px;">
                <ds-button variant="primary">Primary</ds-button>
                <ds-button variant="primary-strong">Primary Strong</ds-button>
                <ds-button variant="primary-subtle">Primary Subtle</ds-button>
                <ds-button variant="secondary">Secondary</ds-button>
                <ds-button variant="secondary-strong">Secondary Strong</ds-button>
                <ds-button variant="secondary-subtle">Secondary Subtle</ds-button>
                <ds-button variant="success">Success</ds-button>
                <ds-button variant="success-strong">Success Strong</ds-button>
                <ds-button variant="success-subtle">Success Subtle</ds-button>
                <ds-button variant="danger">Danger</ds-button>
                <ds-button variant="danger-strong">Danger Strong</ds-button>
                <ds-button variant="danger-subtle">Danger Subtle</ds-button>
                <ds-button variant="warning">Warning</ds-button>
                <ds-button variant="warning-strong">Warning Strong</ds-button>
                <ds-button variant="warning-subtle">Warning Subtle</ds-button>
                <ds-button variant="info">Info</ds-button>
                <ds-button variant="info-strong">Info Strong</ds-button>
                <ds-button variant="info-subtle">Info Subtle</ds-button>
                <ds-button variant="neutral">Neutral</ds-button>
                <ds-button variant="neutral-strong">Neutral Strong</ds-button>
                <ds-button variant="neutral-subtle">Neutral Subtle</ds-button>
                <ds-button variant="ghost">Ghost</ds-button>
                <ds-button variant="outline">Outline</ds-button>
            </div>
        `,
  }),
};

export const ChromaticTestStory: Story = {
  tags: ['docs-template'],
  parameters: {
    chromatic: {
      modes: allThemes,
      disableSnapshot: false,
    },
  },
  render: (args) => ({
    props: args,
    template: `
            <div style="display: grid; grid-template-columns: repeat(5, 1fr); grid-row-gap: 1em; grid-column-gap: 1em; align-items: center;">
                
                <!-- Basic variants -->
                <ds-button variant="primary">Primary</ds-button>
                <ds-button variant="secondary">Secondary</ds-button>
                <ds-button variant="success">Success</ds-button>
                <ds-button variant="danger">Danger</ds-button>
                <ds-button variant="outline">Outline</ds-button>
                
                <!-- With icons -->
                <ds-button variant="primary"><ds-demo-icon slot="start"/>With Icon</ds-button>
                <ds-button variant="secondary"><ds-demo-icon slot="start"/>With Icon</ds-button>
                <ds-button variant="success" ariaLabel="Success action"><ds-demo-icon slot="start"/></ds-button>
                <ds-button variant="danger" loading="true">Loading</ds-button>
                <ds-button variant="outline" disabled="true">Disabled</ds-button>
                
                <!-- Sizes -->
                <ds-button size="xsmall">XSmall</ds-button>
                <ds-button size="small">Small</ds-button>
                <ds-button size="medium">Medium</ds-button>
                <ds-button size="large">Large</ds-button>
                <ds-button fullWidth="true">Full Width</ds-button>
            </div>
        `,
  }),
};



