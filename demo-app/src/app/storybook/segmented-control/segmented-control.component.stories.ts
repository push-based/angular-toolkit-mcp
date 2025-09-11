import { generateStatusBadges } from '@design-system/shared-storybook-utils';
import {
  DsSegmentedControl,
  type DsSegmentedTab,
} from '@frontend/ui/segmented-control';
import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { expect, fireEvent, within } from '@storybook/test';

type StoryType = DsSegmentedControl & {
  customLabel: string;
};

export default {
  title: 'Components/Segmented Control',
  parameters: {
    status: generateStatusBadges('UX-2309', ['a11y', 'integration ready']),
  },
  component: DsSegmentedControl,
  args: {
    fullWidth: true,
    activeTab: 'tab2',
    customLabel: 'CUSTOM TAB',
  },
  argTypes: {
    fullWidth: {
      type: 'boolean',
      table: {
        defaultValue: { summary: 'true' },
      },
      control: { type: 'boolean' },
      description:
        'Whether the segment should take up the full width of the container',
    },
    activeTab: {
      type: 'string',
      control: 'text',
      description: 'The ID of the currently active tab',
    },
    customLabel: {
      type: 'string',
      table: { defaultValue: { summary: 'CUSTOM TAB' } },
      control: 'text',
      description: 'Custom text you can use to check the behavior',
    },
    tabs: {
      table: { disable: true },
    },
    tabChange: {
      table: { disable: true },
    },
  },

  decorators: [
    moduleMetadata({
      imports: [DsSegmentedControl],
    }),
  ],
} as Meta<StoryType>;

export const Default: StoryObj<StoryType> = {
  parameters: {
    name: 'Default',
    design: {
      name: 'Whitelabel',
      type: 'figma',
      url: 'https://www.figma.com/file/NgrOt8MGJhe0obKFBQgqdT/Component-Tokens-(POC)?type=design&node-id=12596-148225&mode=design&t=fS1qO73SS8lGciLj-4',
    },
  },
  render: (args: any) => ({
    props: {
      ...args,
      tabs: [
        { id: 'tab1', label: 'ALL USERS', count: 25 },
        { id: 'tab2', label: 'ADMINS', count: 3 },
        { id: 'tab3', label: 'PREMIUM', count: 8 },
        { id: 'tab4', label: args.customLabel, count: 5 },
      ] as DsSegmentedTab[],
    },
    template: `
    <div style='width: 650px; text-align: center; display: block;'>
        <ds-segmented-control 
          [tabs]="tabs" 
          [activeTab]="activeTab" 
          [fullWidth]="fullWidth">
        </ds-segmented-control>
    </div>
  `,
  }),
  play: async ({ canvasElement, step }: any) => {
    await step('check Click event is being called', async () => {
      const canvas = within(canvasElement);
      const segments = canvas.getAllByRole('button');
      await fireEvent.click(segments[0]);
      await expect(segments[0]).toHaveClass('ds-segment-selected');
    });
  },
};

export const WithCounts: StoryObj<StoryType> = {
  parameters: {
    name: 'With Counts',
    design: {
      name: 'Whitelabel',
      type: 'figma',
      url: 'https://www.figma.com/file/NgrOt8MGJhe0obKFBQgqdT/Component-Tokens-(POC)?type=design&node-id=12596-148323&mode=design&t=fS1qO73SS8lGciLj-4',
    },
  },
  argTypes: {
    customLabel: {
      table: { disable: true },
    },
  },
  render: (args: any) => ({
    props: {
      ...args,
      tabs: [
        { id: 'active', label: 'ACTIVE', count: 42 },
        { id: 'pending', label: 'PENDING', count: 7 },
        { id: 'completed', label: 'COMPLETED', count: 156 },
        { id: 'archived', label: 'ARCHIVED' }, // No count
      ] as DsSegmentedTab[],
    },
    template: `
    <div style='width: 450px; text-align: center; display: block;' >
        <ds-segmented-control 
          [tabs]="tabs" 
          [activeTab]="activeTab" 
          [fullWidth]="fullWidth">
        </ds-segmented-control>
    </div>
    `,
  }),
  play: async ({ canvasElement, step }: any) => {
    await step('check Click event is being called', async () => {
      const canvas = within(canvasElement);
      const segments = canvas.getAllByRole('button');
      await fireEvent.click(segments[0]);
      await expect(segments[0]).toHaveClass('ds-segment-selected');
    });
  },
};
