import { generateStatusBadges } from '@design-system/shared-storybook-utils';
import {
  DS_CARD_SIZE_ARRAY,
  DS_CARD_VARIANT_ARRAY,
  DsCard,
} from '../../components/ui/card';
import {
  DsComplexityRatingComponent,
  getVariantInfo,
} from '@frontend/ui/utils';
import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';

import { allThemes } from '../../modes';

type DsCardStoryType = DsCard & {
  content: string;
  headerContent?: string;
  footerContent?: string;
};

const meta: Meta<DsCardStoryType> = {
  title: 'Components/Card',
  component: DsCard,
  parameters: {
    status: generateStatusBadges('UX-2308', ['stable']),
  },

  excludeStories: /.*Data$/,
  argTypes: {
    content: {
      type: 'string',
      table: { defaultValue: { summary: 'Card content' } },
      control: 'text',
      description: 'The main content of the card',
    },
    headerContent: {
      type: 'string',
      table: { defaultValue: { summary: '' } },
      control: 'text',
      description: 'Content for the card header',
    },
    footerContent: {
      type: 'string',
      table: { defaultValue: { summary: '' } },
      control: 'text',
      description: 'Content for the card footer',
    },
    size: {
      options: DS_CARD_SIZE_ARRAY,
      table: { defaultValue: { summary: 'medium' }, category: 'Styling' },
      control: { type: 'select' },
      description: 'The size of the card',
    },
    variant: {
      options: DS_CARD_VARIANT_ARRAY,
      table: { defaultValue: { summary: 'default' }, category: 'Styling' },
      control: { type: 'select' },
      description: 'The visual variant of the card',
    },
    interactive: {
      type: 'boolean',
      table: { defaultValue: { summary: 'false' }, category: 'Behavior' },
      control: { type: 'boolean' },
      description: 'Makes the card interactive (clickable)',
    },
    disabled: {
      type: 'boolean',
      table: {
        defaultValue: { summary: 'false' },
      },
      control: { type: 'boolean' },
      description: 'The disabled state of the card',
    },
    hasHeader: {
      type: 'boolean',
      table: { defaultValue: { summary: 'false' }, category: 'Layout' },
      control: { type: 'boolean' },
      description: 'Whether the card has a header section',
    },
    hasFooter: {
      type: 'boolean',
      table: { defaultValue: { summary: 'false' }, category: 'Layout' },
      control: { type: 'boolean' },
      description: 'Whether the card has a footer section',
    },
  },
  args: {
    content: 'This is a card with some content inside it.',
    headerContent: '',
    footerContent: '',
    size: 'medium',
    variant: 'default',
    interactive: false,
    disabled: false,
    hasHeader: false,
    hasFooter: false,
  },
  decorators: [moduleMetadata({ imports: [] })],
};

export default meta;

type Story = StoryObj<DsCardStoryType>;

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
  render: (card) => ({
    template: `
        <ds-card 
          variant="${card.variant}" 
          size="${card.size}" 
          [disabled]="${card.disabled}"
          [interactive]="${card.interactive}"
          [hasHeader]="${card.hasHeader}"
          [hasFooter]="${card.hasFooter}">
          ${card.content}
        </ds-card>
        `,
  }),
};

export const WithHeader: Story = {
  parameters: {
    name: 'With Header',
    design: {
      name: 'Whitelabel',
      type: 'figma',
      url: 'https://www.figma.com/file/NgrOt8MGJhe0obKFBQgqdT/Component-Tokens-(POC)?type=design&node-id=16640-68740&&mode=design&t=fS1qO73SS8lGciLj-4',
    },
  },
  args: {
    ...Default.args,
    hasHeader: true,
    headerContent: 'Card Header',
  },
  render: (card) => ({
    template: `
        <ds-card 
          variant="${card.variant}" 
          size="${card.size}" 
          [disabled]="${card.disabled}"
          [interactive]="${card.interactive}"
          [hasHeader]="${card.hasHeader}"
          [hasFooter]="${card.hasFooter}">
          <div slot="header">${card.headerContent}</div>
          ${card.content}
        </ds-card>
        `,
  }),
};

export const WithFooter: Story = {
  parameters: {
    name: 'With Footer',
    design: {
      name: 'Whitelabel',
      type: 'figma',
      url: 'https://www.figma.com/file/NgrOt8MGJhe0obKFBQgqdT/Component-Tokens-(POC)?type=design&node-id=16640-68740&&mode=design&t=fS1qO73SS8lGciLj-4',
    },
  },
  args: {
    ...Default.args,
    hasFooter: true,
    footerContent: 'Card Footer',
  },
  render: (card) => ({
    template: `
        <ds-card 
          variant="${card.variant}" 
          size="${card.size}" 
          [disabled]="${card.disabled}"
          [interactive]="${card.interactive}"
          [hasHeader]="${card.hasHeader}"
          [hasFooter]="${card.hasFooter}">
          ${card.content}
          <div slot="footer">${card.footerContent}</div>
        </ds-card>
        `,
  }),
};

export const Complete: Story = {
  parameters: {
    name: 'Complete Card',
    design: {
      name: 'Whitelabel',
      type: 'figma',
      url: 'https://www.figma.com/file/NgrOt8MGJhe0obKFBQgqdT/Component-Tokens-(POC)?type=design&node-id=16640-68740&&mode=design&t=fS1qO73SS8lGciLj-4',
    },
  },
  args: {
    ...Default.args,
    hasHeader: true,
    hasFooter: true,
    headerContent: 'Card Title',
    footerContent: 'Card Actions',
  },
  render: (card) => ({
    template: `
        <ds-card 
          variant="${card.variant}" 
          size="${card.size}" 
          [disabled]="${card.disabled}"
          [interactive]="${card.interactive}"
          [hasHeader]="${card.hasHeader}"
          [hasFooter]="${card.hasFooter}">
          <div slot="header"><strong>${card.headerContent}</strong></div>
          ${card.content}
          <div slot="footer"><button>Action</button></div>
        </ds-card>
        `,
  }),
};

export const Interactive: Story = {
  parameters: {
    name: 'Interactive Card',
    design: {
      name: 'Whitelabel',
      type: 'figma',
      url: 'https://www.figma.com/file/NgrOt8MGJhe0obKFBQgqdT/Component-Tokens-(POC)?type=design&node-id=16640-68740&&mode=design&t=fS1qO73SS8lGciLj-4',
    },
  },
  args: {
    ...Default.args,
    interactive: true,
    content: 'This is an interactive card. Click me!',
  },
  render: (card) => ({
    template: `
        <ds-card 
          variant="${card.variant}" 
          size="${card.size}" 
          [disabled]="${card.disabled}"
          [interactive]="${card.interactive}"
          [hasHeader]="${card.hasHeader}"
          [hasFooter]="${card.hasFooter}">
          ${card.content}
        </ds-card>
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

export const AllVariants: Story = {
  tags: ['docs-template'],
  render: (args) => ({
    props: args,
    template: `
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); grid-gap: 16px;">
                <ds-card variant="default">
                    <div slot="header">Default</div>
                    Default variant card content
                </ds-card>
                <ds-card variant="elevated">
                    <div slot="header">Elevated</div>
                    Elevated variant card content
                </ds-card>
                <ds-card variant="outlined">
                    <div slot="header">Outlined</div>
                    Outlined variant card content
                </ds-card>
                <ds-card variant="filled">
                    <div slot="header">Filled</div>
                    Filled variant card content
                </ds-card>
            </div>
        `,
  }),
};

export const AllSizes: Story = {
  tags: ['docs-template'],
  render: (args) => ({
    props: args,
    template: `
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); grid-gap: 16px;">
                <ds-card size="small">
                    <div slot="header">Small</div>
                    Small size card content
                </ds-card>
                <ds-card size="medium">
                    <div slot="header">Medium</div>
                    Medium size card content
                </ds-card>
                <ds-card size="large">
                    <div slot="header">Large</div>
                    Large size card content
                </ds-card>
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
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); grid-row-gap: 1em; grid-column-gap: 1em;">
                
                <!-- Basic variants -->
                <ds-card variant="default">Default card</ds-card>
                <ds-card variant="elevated">Elevated card</ds-card>
                <ds-card variant="outlined">Outlined card</ds-card>
                
                <!-- With headers -->
                <ds-card variant="default" hasHeader="true">
                    <div slot="header">Header</div>
                    Card with header
                </ds-card>
                <ds-card variant="elevated" hasHeader="true">
                    <div slot="header">Header</div>
                    Card with header
                </ds-card>
                <ds-card variant="outlined" hasHeader="true">
                    <div slot="header">Header</div>
                    Card with header
                </ds-card>
                
                <!-- Interactive and disabled states -->
                <ds-card variant="default" interactive="true">Interactive card</ds-card>
                <ds-card variant="default" disabled="true">Disabled card</ds-card>
                <ds-card variant="filled" hasHeader="true" hasFooter="true">
                    <div slot="header">Complete</div>
                    Complete card with all sections
                    <div slot="footer">Footer</div>
                </ds-card>
            </div>
        `,
  }),
};



