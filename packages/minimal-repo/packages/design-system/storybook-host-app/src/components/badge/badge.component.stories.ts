import { generateStatusBadges } from '@design-system/shared-storybook-utils';
import { DemoIconComponent } from '@design-system/storybook-demo-cmp-lib';
import {
  DS_BADGE_SIZE_ARRAY,
  DS_BADGE_VARIANT_ARRAY,
  DsBadge,
} from '@frontend/ui/badge';
import { DsNotificationBubble } from '@frontend/ui/notification-bubble';
import {
  DsComplexityRatingComponent,
  getVariantInfo,
} from '@frontend/ui/utils';
import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';

import { allThemes } from '../../modes';

type DsBadgeStoryType = DsBadge & { label: string };

const meta: Meta<DsBadgeStoryType> = {
  title: 'Components/Badge',
  component: DsBadge,
  parameters: {
    status: generateStatusBadges('UX-2308', ['stable']),
  },

  excludeStories: /.*Data$/,
  argTypes: {
    label: {
      type: 'string',
      table: { defaultValue: { summary: 'Label' } },
      control: 'text',
      description: 'The text of the badge',
    },
    size: {
      options: DS_BADGE_SIZE_ARRAY,
      table: { defaultValue: { summary: 'medium' }, category: 'Styling' },
      control: { type: 'select' },
      description: 'The size of the badge',
    },
    variant: {
      options: DS_BADGE_VARIANT_ARRAY,
      table: { defaultValue: { summary: 'primary' }, category: 'Styling' },
      control: { type: 'select' },
      description: 'The variant of the badge',
    },
    inverse: {
      type: 'boolean',
      table: { defaultValue: { summary: 'false' }, category: 'Styling' },
      control: { type: 'boolean' },
      description: 'The inverse state of the badge',
    },
    disabled: {
      type: 'boolean',
      table: {
        defaultValue: { summary: 'false' },
      },
      control: { type: 'boolean' },
      description: 'The disabled state of the badges',
    },
  },
  args: {
    label: 'Label',
    size: 'medium',
    variant: 'primary',
    disabled: false,
    inverse: false,
  },
  decorators: [
    moduleMetadata({ imports: [DemoIconComponent, DsNotificationBubble] }),
  ],
};

export default meta;

type Story = StoryObj<DsBadgeStoryType>;

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
  render: (badge) => ({
    template: `
        <ds-badge variant="${badge.variant}" size="${badge.size}" disabled="${badge.disabled}" [inverse]="${badge.inverse}">
            ${badge.label}
        </ds-badge>
        `,
  }),
};

export const WithIcon: Story = {
  parameters: {
    name: 'Default',
    design: {
      name: 'Whitelabel',
      type: 'figma',
      url: 'https://www.figma.com/file/NgrOt8MGJhe0obKFBQgqdT/Component-Tokens-(POC)?type=design&node-id=16640-68740&&mode=design&t=fS1qO73SS8lGciLj-4',
    },
  },
  args: {
    ...Default.args,
  },
  argTypes: {
    ...Default.argTypes,
    size: {
      options: ['medium', 'xsmall'],
    },
  },
  decorators: [moduleMetadata({ imports: [DsBadge] })],
  render: (badge) => ({
    template: `
        <ds-badge variant="${badge.variant}" size="${badge.size}" disabled="${badge.disabled}" [inverse]="${badge.inverse}">
            ${badge.label}
            <ds-demo-icon slot="start"/>
        </ds-badge>
        `,
  }),
};

export const WithIconOnly: Story = {
  parameters: {
    name: 'Default',
    design: {
      name: 'Whitelabel',
      type: 'figma',
      url: 'https://www.figma.com/file/NgrOt8MGJhe0obKFBQgqdT/Component-Tokens-(POC)?type=design&node-id=16640-68740&&mode=design&t=fS1qO73SS8lGciLj-4',
    },
  },
  args: {
    ...Default.args,
    label: '',
  },
  argTypes: {
    ...Default.argTypes,
    size: {
      options: ['medium', 'xsmall'],
    },
  },
  decorators: [moduleMetadata({ imports: [DsBadge] })],
  render: (badge) => ({
    template: `
        <ds-badge variant="${badge.variant}" size="${badge.size}" disabled="${badge.disabled}" [inverse]="${badge.inverse}">
            ${badge.label}
            <ds-demo-icon slot="start"/>
        </ds-badge>
        `,
  }),
};

export const WithNotificationBubble: Story = {
  parameters: {
    name: 'Default',
    design: {
      name: 'Whitelabel',
      type: 'figma',
      url: 'https://www.figma.com/file/NgrOt8MGJhe0obKFBQgqdT/Component-Tokens-(POC)?type=design&node-id=16640-68740&&mode=design&t=fS1qO73SS8lGciLj-4',
    },
  },
  args: {
    ...Default.args,
  },
  argTypes: {
    ...Default.argTypes,
    size: {
      options: ['medium'],
    },
  },
  decorators: [moduleMetadata({ imports: [DsBadge] })],
  render: (badge) => ({
    template: `
        <ds-badge variant="${badge.variant}" size="${badge.size}" disabled="${badge.disabled}" [inverse]="${badge.inverse}">
            ${badge.label}
              <ds-notification-bubble slot="start" variant="neutral" disabled="false" size="small" inverse="false">0</ds-notification-bubble>
        </ds-badge>
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

export const WithSuccess: Story = {
  parameters: {
    name: 'Default',
    design: {
      name: 'Whitelabel',
      type: 'figma',
      url: 'https://www.figma.com/file/NgrOt8MGJhe0obKFBQgqdT/Component-Tokens-(POC)?type=design&node-id=16640-68740&&mode=design&t=fS1qO73SS8lGciLj-4',
    },
  },
  args: {
    ...Default.args,
  },

  decorators: [moduleMetadata({})],
  render: (badge) => ({
    template: `
        <ds-badge variant="${badge.variant}" size="${badge.size}" disabled="${badge.disabled}" [inverse]="${badge.inverse}">
            ${badge.label}
            <ds-demo-icon iconName="success" slot="end" />
        </ds-badge>
        `,
  }),
};

export const WithIconAndSuccess: Story = {
  parameters: {
    name: 'Default',
    design: {
      name: 'Whitelabel',
      type: 'figma',
      url: 'https://www.figma.com/file/NgrOt8MGJhe0obKFBQgqdT/Component-Tokens-(POC)?type=design&node-id=16640-68740&&mode=design&t=fS1qO73SS8lGciLj-4',
    },
  },
  args: {
    ...WithIcon.args,
  },

  decorators: [moduleMetadata({})],
  render: (badge) => ({
    template: `
        <ds-badge variant="${badge.variant}" size="${badge.size}" disabled="${badge.disabled}" [inverse]="${badge.inverse}">
            ${badge.label}
            <ds-demo-icon slot="start"/>
            <ds-demo-icon iconName="success" slot="end" />
        </ds-badge>
        `,
  }),
};

export const LargeExamples: Story = {
  tags: ['docs-template'],
  render: (args) => ({
    props: args,
    template: `
            <div style="display: grid; grid-template-columns: 1fr repeat(3, 1fr); grid-row-gap: 1em; grid-column-gap: 1em; text-align: left; align-items: center;">
                ${renderHeaderRow(
                  'Primary',
                  'Primary',
                  'Primary Strong',
                  'Primary Subtle',
                )}
                ${renderPrimaryRows('medium')}
                <div style="grid-column: 1 / -1;">
                    <hr style="width: 100%; border: 1px solid #ddd; margin: 20px 0;">
                </div>
                ${renderHeaderRow(
                  'Secondary',
                  'Secondary',
                  'Secondary Strong',
                  'Secondary Subtle',
                )}
                ${renderSecondaryRows('medium')}
                <div style="grid-column: 1 / -1;">
                    <hr style="width: 100%; border: 1px solid #ddd; margin: 20px 0;">
                </div>
                ${renderHeaderRow(
                  'Green',
                  'Green',
                  'Green Strong',
                  'Green Subtle',
                )}
                ${renderGreenRows('medium')}
                <div style="grid-column: 1 / -1;">
                    <hr style="width: 100%; border: 1px solid #ddd; margin: 20px 0;">
                </div>
                ${renderHeaderRow('Blue', 'Blue', 'Blue Strong', 'Blue Subtle')}
                ${renderBlueRows('medium')}
                <div style="grid-column: 1 / -1;">
                    <hr style="width: 100%; border: 1px solid #ddd; margin: 20px 0;">
                </div>
                ${renderHeaderRow('Red', 'Red', 'Red Strong', 'Red Subtle')}
                ${renderRedRows('medium')}
                <div style="grid-column: 1 / -1;">
                    <hr style="width: 100%; border: 1px solid #ddd; margin: 20px 0;">
                </div>
                ${renderHeaderRow(
                  'Neutral',
                  'Neutral',
                  'Neutral Strong',
                  'Neutral Subtle',
                )}
                ${renderNeutralRows('medium')}
                <div style="grid-column: 1 / -1;">
                    <hr style="width: 100%; border: 1px solid #ddd; margin: 20px 0;">
                </div>
                ${renderHeaderRow(
                  'Purple',
                  'Purple',
                  'Purple Strong',
                  'Purple Subtle',
                )}
                ${renderPurpleRows('medium')}
                <div style="grid-column: 1 / -1;">
                    <hr style="width: 100%; border: 1px solid #ddd; margin: 20px 0;">
                </div>
                ${renderHeaderRow(
                  'Yellow',
                  'Yellow',
                  'Yellow Strong',
                  'Yellow Subtle',
                )}
                ${renderYellowRows('medium')}
                <div style="grid-column: 1 / -1;">
                    <hr style="width: 100%; border: 1px solid #ddd; margin: 20px 0;">
                </div>
                ${renderHeaderRow(
                  'Orange',
                  'Orange',
                  'Orange Strong',
                  'Orange Subtle',
                )}
                ${renderOrangeRows('medium')}
                <div style="grid-column: 1 / -1;">
                    <hr style="width: 100%; border: 1px solid #ddd; margin: 20px 0;">
                </div>
            </div>
        `,
  }),
};

function renderHeaderRow(title = '', col1 = '', col2 = '', col3 = '') {
  return `
        <div style="grid-column: 1 / span 1; text-align: left; margin-top: 20px;">
            <strong>${title}</strong>
        </div>
        <div style="grid-column: 2 / span 1; text-align: left; margin-top: 20px;">
            <strong>${col1}</strong>
        </div>
        <div style="grid-column: 3 / span 1; text-align: left; margin-top: 20px;">
            <strong>${col2}</strong>
        </div>
        <div style="grid-column: 4 / span 1; text-align: left; margin-top: 20px;">
            <strong>${col3}</strong>
        </div>
    `;
}

function renderPrimaryRows(size: string) {
  return `
        ${renderRow('No Icon, No Success', size)}
        ${renderRow('Icon', size, { showIcon: true })}
        ${renderRow('Icon Only', size, { showIcon: true, showIconOnly: true })}
        ${renderRow('Notification Bubble', size, {
          showNotificationBubble: true,
        })}
        ${renderRow('Success', size, { showSuccess: true })}
        ${renderRow('Icon + Success', size, {
          showIcon: true,
          showSuccess: true,
        })}
    `;
}

function renderSecondaryRows(size: string) {
  return `
        ${renderRow('No Icon, No Success', size, {
          variantPrefix: 'secondary',
        })}
        ${renderRow('Icon', size, {
          showIcon: true,
          variantPrefix: 'secondary',
        })}
        ${renderRow('Icon Only', size, {
          showIcon: true,
          showIconOnly: true,
          variantPrefix: 'secondary',
        })}
        ${renderRow('Notification Bubble', size, {
          showNotificationBubble: true,
          variantPrefix: 'secondary',
        })}
        ${renderRow('Success', size, {
          showSuccess: true,
          variantPrefix: 'secondary',
        })}
        ${renderRow('Icon + Success', size, {
          showIcon: true,
          showSuccess: true,
          variantPrefix: 'secondary',
        })}
    `;
}

function renderGreenRows(size: string) {
  return `
        ${renderRow('No Icon, No Success', size, { variantPrefix: 'green' })}
        ${renderRow('Icon', size, { showIcon: true, variantPrefix: 'green' })}
        ${renderRow('Icon Only', size, {
          showIcon: true,
          showIconOnly: true,
          variantPrefix: 'green',
        })}
        ${renderRow('Notification Bubble', size, {
          showNotificationBubble: true,
          variantPrefix: 'green',
        })}
        ${renderRow('Success', size, {
          showSuccess: true,
          variantPrefix: 'green',
        })}
        ${renderRow('Icon + Success', size, {
          showIcon: true,
          showSuccess: true,
          variantPrefix: 'green',
        })}
    `;
}

function renderBlueRows(size: string) {
  return `
        ${renderRow('No Icon, No Success', size, { variantPrefix: 'blue' })}
        ${renderRow('Icon', size, { showIcon: true, variantPrefix: 'blue' })}
        ${renderRow('Icon Only', size, {
          showIcon: true,
          showIconOnly: true,
          variantPrefix: 'blue',
        })}
        ${renderRow('Notification Bubble', size, {
          showNotificationBubble: true,
          variantPrefix: 'blue',
        })}
        ${renderRow('Success', size, {
          showSuccess: true,
          variantPrefix: 'blue',
        })}
        ${renderRow('Icon + Success', size, {
          showIcon: true,
          showSuccess: true,
          variantPrefix: 'blue',
        })}
    `;
}

function renderRedRows(size: string) {
  return `
        ${renderRow('No Icon, No Success', size, { variantPrefix: 'red' })}
        ${renderRow('Icon', size, { showIcon: true, variantPrefix: 'red' })}
        ${renderRow('Icon Only', size, {
          showIcon: true,
          showIconOnly: true,
          variantPrefix: 'red',
        })}
        ${renderRow('Notification Bubble', size, {
          showNotificationBubble: true,
          variantPrefix: 'red',
        })}
        ${renderRow('Success', size, {
          showSuccess: true,
          variantPrefix: 'red',
        })}
        ${renderRow('Icon + Success', size, {
          showIcon: true,
          showSuccess: true,
          variantPrefix: 'red',
        })}
    `;
}

function renderNeutralRows(size: string) {
  return `
        ${renderRow('No Icon, No Success', size, { variantPrefix: 'neutral' })}
        ${renderRow('Icon', size, { showIcon: true, variantPrefix: 'neutral' })}
        ${renderRow('Icon Only', size, {
          showIcon: true,
          showIconOnly: true,
          variantPrefix: 'neutral',
        })}
        ${renderRow('Notification Bubble', size, {
          showNotificationBubble: true,
          variantPrefix: 'neutral',
        })}
        ${renderRow('Success', size, {
          showSuccess: true,
          variantPrefix: 'neutral',
        })}
        ${renderRow('Icon + Success', size, {
          showIcon: true,
          showSuccess: true,
          variantPrefix: 'neutral',
        })}
    `;
}

function renderPurpleRows(size: string) {
  return `
        ${renderRow('No Icon, No Success', size, { variantPrefix: 'purple' })}
        ${renderRow('Icon', size, { showIcon: true, variantPrefix: 'purple' })}
        ${renderRow('Icon Only', size, {
          showIcon: true,
          showIconOnly: true,
          variantPrefix: 'purple',
        })}
        ${renderRow('Notification Bubble', size, {
          showNotificationBubble: true,
          variantPrefix: 'purple',
        })}
        ${renderRow('Success', size, {
          showSuccess: true,
          variantPrefix: 'purple',
        })}
        ${renderRow('Icon + Success', size, {
          showIcon: true,
          showSuccess: true,
          variantPrefix: 'purple',
        })}
    `;
}

function renderYellowRows(size: string) {
  return `
        ${renderRow('No Icon, No Success', size, { variantPrefix: 'yellow' })}
        ${renderRow('Icon', size, { showIcon: true, variantPrefix: 'yellow' })}
        ${renderRow('Icon Only', size, {
          showIcon: true,
          showIconOnly: true,
          variantPrefix: 'yellow',
        })}
        ${renderRow('Notification Bubble', size, {
          showNotificationBubble: true,
          variantPrefix: 'yellow',
        })}
        ${renderRow('Success', size, {
          showSuccess: true,
          variantPrefix: 'yellow',
        })}
        ${renderRow('Icon + Success', size, {
          showIcon: true,
          showSuccess: true,
          variantPrefix: 'yellow',
        })}
    `;
}

function renderOrangeRows(size: string) {
  return `
        ${renderRow('No Icon, No Success', size, { variantPrefix: 'orange' })}
        ${renderRow('Icon', size, { showIcon: true, variantPrefix: 'orange' })}
        ${renderRow('Icon Only', size, {
          showIcon: true,
          showIconOnly: true,
          variantPrefix: 'orange',
        })}
        ${renderRow('Notification Bubble', size, {
          showNotificationBubble: true,
          variantPrefix: 'orange',
        })}
        ${renderRow('Success', size, {
          showSuccess: true,
          variantPrefix: 'orange',
        })}
        ${renderRow('Icon + Success', size, {
          showIcon: true,
          showSuccess: true,
          variantPrefix: 'orange',
        })}
    `;
}

function renderRow(
  name: string,
  size: string,
  {
    showSuccess = false,
    showIcon = false,
    showIconOnly = false,
    showNotificationBubble = false,
    variantPrefix = 'primary',
  } = {},
) {
  return `
        <span style="grid-column: 1 / span 1; align-self: center;">${name}</span>
        ${renderBadge(
          `${variantPrefix}`,
          size,
          showIcon,
          showIconOnly,
          showNotificationBubble,
          showSuccess,
        )}
        ${renderBadge(
          `${variantPrefix}-strong`,
          size,
          showIcon,
          showIconOnly,
          showNotificationBubble,
          showSuccess,
        )}
        ${renderBadge(
          `${variantPrefix}-subtle`,
          size,
          showIcon,
          showIconOnly,
          showNotificationBubble,
          showSuccess,
        )}
    `;
}

function renderBadge(
  variant: string,
  size: string,
  showIcon: boolean,
  showIconOnly: boolean,
  showNotificationBubble: boolean,
  showSuccess: boolean,
) {
  return `
        <div style="grid-column: span 1;">
            <ds-badge variant="${variant}" size="${size}">
                ${showIconOnly ? '' : 'Label'}
                ${showIcon ? '<ds-demo-icon slot="start"/>' : ''}
                ${
                  showNotificationBubble
                    ? '<ds-notification-bubble slot="start" variant="neutral" disabled="false" size="small" inverse="false">0</ds-notification-bubble>'
                    : ''
                }
                ${
                  showSuccess
                    ? '<ds-demo-icon iconName="success" slot="end"/>'
                    : ''
                }
            </ds-badge>
        </div>
    `;
}
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
            <div style="display: grid; grid-template-columns: repeat(7, 1fr); grid-row-gap: 1em; grid-column-gap: 1em; align-items: center; justify-items: center;">
                
            
                ${renderHeaderRow()}
                
                ${renderRow('Xsmall', 'xsmall')}
                
                <div style="grid-column: span 7"></div>
                ${renderRow('Medium', 'medium')}
                ${renderRow('Medium, Icon', 'medium', { showIcon: true })}
                ${renderRow('Medium, IconOnly', 'medium', {
                  showIcon: true,
                  showIconOnly: true,
                })}
                ${renderRow('Medium, NotificationBubble', 'medium', {
                  showNotificationBubble: true,
                })}
                ${renderRow('Medium, Success', 'medium', { showSuccess: true })}
                ${renderRow('Medium, Icon + Success', 'medium', {
                  showIcon: true,
                  showSuccess: true,
                })}
                
                <div style="grid-column: span 7"></div>
                ${renderRow('Large', 'medium')}
                ${renderRow('Large, Icon', 'medium', { showIcon: true })}
                ${renderRow('Large, IconOnly', 'medium', {
                  showIcon: true,
                  showIconOnly: true,
                })}
                ${renderRow('Large, NotificationBubble', 'medium', {
                  showNotificationBubble: true,
                })}
                ${renderRow('Large, Success', 'medium', { showSuccess: true })}
                ${renderRow('Large, Icon + Success', 'medium', {
                  showIcon: true,
                  showSuccess: true,
                })}
            </div>
        `,
  }),
};
