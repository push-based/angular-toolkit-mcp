import { generateStatusBadges } from '@design-system/shared-storybook-utils';
import {
  DS_AVATAR_SIZE_ARRAY,
  DS_AVATAR_VARIANT_ARRAY,
  DS_AVATAR_STATUS_ARRAY,
  DsAvatar,
} from '../../components/ui/avatar';
import {
  DsComplexityRatingComponent,
  getVariantInfo,
} from '@frontend/ui/utils';
import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';

import { allThemes } from '../../modes';

type DsAvatarStoryType = DsAvatar & { name: string };

const meta: Meta<DsAvatarStoryType> = {
  title: 'Components/Avatar',
  component: DsAvatar,
  parameters: {
    status: generateStatusBadges('UX-2308', ['stable']),
  },

  excludeStories: /.*Data$/,
  argTypes: {
    name: {
      type: 'string',
      table: { defaultValue: { summary: 'User' } },
      control: 'text',
      description: 'Name for the avatar (used to generate initials)',
    },
    src: {
      type: 'string',
      table: { defaultValue: { summary: '' } },
      control: 'text',
      description: 'Image source URL',
    },
    alt: {
      type: 'string',
      table: { defaultValue: { summary: '' } },
      control: 'text',
      description: 'Alternative text for the image',
    },
    size: {
      options: DS_AVATAR_SIZE_ARRAY,
      table: { defaultValue: { summary: 'medium' }, category: 'Styling' },
      control: { type: 'select' },
      description: 'The size of the avatar',
    },
    variant: {
      options: DS_AVATAR_VARIANT_ARRAY,
      table: { defaultValue: { summary: 'circular' }, category: 'Styling' },
      control: { type: 'select' },
      description: 'The shape variant of the avatar',
    },
    status: {
      options: [null, ...DS_AVATAR_STATUS_ARRAY],
      table: { defaultValue: { summary: null }, category: 'Styling' },
      control: { type: 'select' },
      description: 'The status indicator for the avatar',
    },
    disabled: {
      type: 'boolean',
      table: {
        defaultValue: { summary: 'false' },
      },
      control: { type: 'boolean' },
      description: 'The disabled state of the avatar',
    },
  },
  args: {
    name: 'John Doe',
    src: '',
    alt: '',
    size: 'medium',
    variant: 'circular',
    status: null,
    disabled: false,
  },
  decorators: [moduleMetadata({ imports: [] })],
};

export default meta;

type Story = StoryObj<DsAvatarStoryType>;

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
  render: (avatar) => ({
    template: `
        <ds-avatar 
          variant="${avatar.variant}" 
          size="${avatar.size}" 
          name="${avatar.name}"
          src="${avatar.src}"
          alt="${avatar.alt}"
          [disabled]="${avatar.disabled}"
          ${avatar.status ? `status="${avatar.status}"` : ''}>
        </ds-avatar>
        `,
  }),
};

export const WithImage: Story = {
  parameters: {
    name: 'With Image',
    design: {
      name: 'Whitelabel',
      type: 'figma',
      url: 'https://www.figma.com/file/NgrOt8MGJhe0obKFBQgqdT/Component-Tokens-(POC)?type=design&node-id=16640-68740&&mode=design&t=fS1qO73SS8lGciLj-4',
    },
  },
  args: {
    ...Default.args,
    src: 'https://via.placeholder.com/150x150/007BFF/FFFFFF?text=JD',
    alt: 'John Doe avatar',
  },
  render: (avatar) => ({
    template: `
        <ds-avatar 
          variant="${avatar.variant}" 
          size="${avatar.size}" 
          name="${avatar.name}"
          src="${avatar.src}"
          alt="${avatar.alt}"
          [disabled]="${avatar.disabled}"
          ${avatar.status ? `status="${avatar.status}"` : ''}>
        </ds-avatar>
        `,
  }),
};

export const WithStatus: Story = {
  parameters: {
    name: 'With Status',
    design: {
      name: 'Whitelabel',
      type: 'figma',
      url: 'https://www.figma.com/file/NgrOt8MGJhe0obKFBQgqdT/Component-Tokens-(POC)?type=design&node-id=16640-68740&&mode=design&t=fS1qO73SS8lGciLj-4',
    },
  },
  args: {
    ...Default.args,
    status: 'online',
  },
  render: (avatar) => ({
    template: `
        <ds-avatar 
          variant="${avatar.variant}" 
          size="${avatar.size}" 
          name="${avatar.name}"
          src="${avatar.src}"
          alt="${avatar.alt}"
          [disabled]="${avatar.disabled}"
          status="${avatar.status}">
        </ds-avatar>
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
                <ds-avatar size="xsmall" name="John Doe"></ds-avatar>
                <ds-avatar size="small" name="John Doe"></ds-avatar>
                <ds-avatar size="medium" name="John Doe"></ds-avatar>
                <ds-avatar size="large" name="John Doe"></ds-avatar>
                <ds-avatar size="xlarge" name="John Doe"></ds-avatar>
            </div>
        `,
  }),
};

export const AllVariants: Story = {
  tags: ['docs-template'],
  render: (args) => ({
    props: args,
    template: `
            <div style="display: flex; align-items: center; gap: 16px;">
                <ds-avatar variant="circular" name="John Doe"></ds-avatar>
                <ds-avatar variant="rounded" name="John Doe"></ds-avatar>
                <ds-avatar variant="square" name="John Doe"></ds-avatar>
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
            <div style="display: grid; grid-template-columns: repeat(6, 1fr); grid-row-gap: 1em; grid-column-gap: 1em; align-items: center; justify-items: center;">
                
                <!-- Sizes -->
                <ds-avatar size="xsmall" name="XS" status="online"></ds-avatar>
                <ds-avatar size="small" name="SM" status="offline"></ds-avatar>
                <ds-avatar size="medium" name="MD" status="away"></ds-avatar>
                <ds-avatar size="large" name="LG" status="busy"></ds-avatar>
                <ds-avatar size="xlarge" name="XL"></ds-avatar>
                <ds-avatar size="medium" name="Disabled" disabled="true"></ds-avatar>
                
                <!-- Variants -->
                <ds-avatar variant="circular" name="JD"></ds-avatar>
                <ds-avatar variant="rounded" name="JD"></ds-avatar>
                <ds-avatar variant="square" name="JD"></ds-avatar>
                <ds-avatar variant="circular" name="JD" src="https://via.placeholder.com/100x100/007BFF/FFFFFF?text=JD"></ds-avatar>
                <ds-avatar variant="rounded" name="JD" src="https://via.placeholder.com/100x100/28A745/FFFFFF?text=JD"></ds-avatar>
                <ds-avatar variant="square" name="JD" src="https://via.placeholder.com/100x100/DC3545/FFFFFF?text=JD"></ds-avatar>
            </div>
        `,
  }),
};



