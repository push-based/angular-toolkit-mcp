import { generateStatusBadges } from '@design-system/shared-storybook-utils';
import {
  DsSegmentedControl,
  DsSegmentedOption,
} from '@frontend/ui/segmented-control';
import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { expect, fireEvent, within } from '@storybook/test';

type StoryType = DsSegmentedControl & {
  roleType: string;
  itemMaxWidth: string;
  customLabel: string;
  twoLineTruncation: boolean;
};

export default {
  title: 'Components/Segmented Control',
  parameters: {
    status: generateStatusBadges('UX-2309', ['a11y', 'integration ready']),
  },
  component: DsSegmentedControl,
  args: {
    fullWidth: false,
    inverse: false,
    activeOption: '2',
    roleType: 'tablist',
    itemMaxWidth: 'auto',
    customLabel: 'customLabel',
    twoLineTruncation: false,
  },
  argTypes: {
    fullWidth: {
      type: 'boolean',
      table: {
        defaultValue: { summary: 'false' },
      },
      control: { type: 'boolean' },
      description:
        'Whether the segment should take up the full width of the container',
    },
    inverse: {
      type: 'boolean',
      table: { defaultValue: { summary: 'false' } },
      control: { type: 'boolean' },
      description: 'The inverse state of the Segmented Control',
    },
    twoLineTruncation: {
      type: 'boolean',
      table: { defaultValue: { summary: 'false' } },
      control: { type: 'boolean' },
      description: 'Defining if two lines of text should be visible',
    },
    activeOption: {
      type: 'string',
      control: 'text',
      description: 'The text/value of name to be active',
    },
    roleType: {
      control: { type: 'select' },
      table: { defaultValue: { summary: 'tablist' } },
      options: ['radiogroup', 'tablist'],
      description: 'Determines the ARIA role applied to the segmented control',
    },
    itemMaxWidth: {
      type: 'string',
      table: { defaultValue: { summary: 'auto' } },
      control: 'text',
      description: 'Max width of the item',
    },
    customLabel: {
      type: 'string',
      table: { defaultValue: { summary: 'customLabel' } },
      control: 'text',
      description: 'Custom text you can use to check the behavior',
    },
  },

  decorators: [
    moduleMetadata({
      imports: [DsSegmentedControl, DsSegmentedOption],
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
  render: (args) => ({
    props: args,
    template: `
    <div style='width: 650px; text-align: center; display: block;'>
        <ds-segmented-control [twoLineTruncation]="${args.twoLineTruncation}" [roleType]="'${args.roleType}'" [fullWidth]="${args.fullWidth}" [inverse]="${args.inverse}" [activeOption]="'${args.activeOption}'" style="--ds-segment-item-text-max-width: ${args.itemMaxWidth};">
            <ds-segmented-option name='0' title="Label1 long text support, label long text support label long text support label long text support" />
            <ds-segmented-option name="1" title="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s" />
            <ds-segmented-option name='2' title="Label3" />
            <ds-segmented-option name="3" title="${args.customLabel}" />
        </ds-segmented-control>
    </div>
  `,
  }),
  play: async ({ canvasElement, step }) => {
    await step('check Click event is being called', async () => {
      const canvas = within(canvasElement);
      const segments = canvas.getAllByRole('tab');
      await fireEvent.click(segments[0]);
      await expect(segments[0]).toHaveClass('ds-segment-selected');
    });
  },
};

export const WithImage: StoryObj<StoryType> = {
  parameters: {
    name: 'Default',
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
    itemMaxWidth: {
      table: { disable: true },
    },
    twoLineTruncation: {
      table: { disable: true },
    },
  },
  render: (args) => ({
    props: args,
    template: `
    <div style='width: 450px; text-align: center; display: block;' >
        <ds-segmented-control [roleType]="'${args.roleType}'" [fullWidth]="${args.fullWidth}" [inverse]="${args.inverse}" [activeOption]="'${args.activeOption}'">
            <ds-segmented-option name="1" title="image1">
                <ng-template #dsTemplate>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clip-path="url(#clip0_12185_5035)">
    <path d="M1.22907 11.123L0.397165 10.2663C0.140073 10.0015 0.140072 9.5722 0.397165 9.30742L9.2418 0.198579C9.49889 -0.0661931 9.91572 -0.0661931 10.1728 0.198579L10.927 0.975275L1.22907 11.123Z" fill="currentColor"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M4.02262 14L1.68316 11.5907L11.3811 1.44293L15.3023 5.4813C15.5594 5.74607 15.5594 6.17535 15.3023 6.44013L7.96171 14H4.02262ZM10.6476 6.44004C10.3905 6.17527 10.3905 5.74599 10.6476 5.48122L11.5786 4.52239C11.8357 4.25762 12.2525 4.25762 12.5096 4.52239L13.4406 5.48122C13.6977 5.74599 13.6977 6.17527 13.4406 6.44004L12.5096 7.39887C12.2525 7.66364 11.8357 7.66364 11.5786 7.39887L10.6476 6.44004ZM3.66431 11.7136L7.38836 7.87826L7.85387 8.35767L4.12981 12.193L3.66431 11.7136Z" fill="currentColor"/>
    <path d="M9.76108 14.644H13.4364C13.6182 14.644 13.7655 14.7958 13.7655 14.983V15.661C13.7655 15.8483 13.6182 16 13.4364 16H2.24482C2.06303 16 1.91566 15.8483 1.91566 15.661V14.983C1.91566 14.8388 2.00309 14.7157 2.12634 14.6667H9.76108V14.644Z" fill="currentColor"/>
    </g>
    <defs>
    <clipPath id="clip0_12185_5035">
    <rect width="16" height="16" fill="currentColor"/>
    </clipPath>
    </defs>
</svg>
                </ng-template>
            </ds-segmented-option>

            <ds-segmented-option name="2" title="image2">
                <ng-template #dsTemplate>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clip-path="url(#clip0_12185_5035)">
    <path d="M1.22907 11.123L0.397165 10.2663C0.140073 10.0015 0.140072 9.5722 0.397165 9.30742L9.2418 0.198579C9.49889 -0.0661931 9.91572 -0.0661931 10.1728 0.198579L10.927 0.975275L1.22907 11.123Z" fill="currentColor"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M4.02262 14L1.68316 11.5907L11.3811 1.44293L15.3023 5.4813C15.5594 5.74607 15.5594 6.17535 15.3023 6.44013L7.96171 14H4.02262ZM10.6476 6.44004C10.3905 6.17527 10.3905 5.74599 10.6476 5.48122L11.5786 4.52239C11.8357 4.25762 12.2525 4.25762 12.5096 4.52239L13.4406 5.48122C13.6977 5.74599 13.6977 6.17527 13.4406 6.44004L12.5096 7.39887C12.2525 7.66364 11.8357 7.66364 11.5786 7.39887L10.6476 6.44004ZM3.66431 11.7136L7.38836 7.87826L7.85387 8.35767L4.12981 12.193L3.66431 11.7136Z" fill="currentColor"/>
    <path d="M9.76108 14.644H13.4364C13.6182 14.644 13.7655 14.7958 13.7655 14.983V15.661C13.7655 15.8483 13.6182 16 13.4364 16H2.24482C2.06303 16 1.91566 15.8483 1.91566 15.661V14.983C1.91566 14.8388 2.00309 14.7157 2.12634 14.6667H9.76108V14.644Z" fill="currentColor"/>
    </g>
    <defs>
    <clipPath id="clip0_12185_5035">
    <rect width="16" height="16" fill="currentColor"/>
    </clipPath>
    </defs>
</svg>
                </ng-template>
            </ds-segmented-option>

            <ds-segmented-option name="3" title="image3">
                <ng-template #dsTemplate>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clip-path="url(#clip0_12185_5035)">
    <path d="M1.22907 11.123L0.397165 10.2663C0.140073 10.0015 0.140072 9.5722 0.397165 9.30742L9.2418 0.198579C9.49889 -0.0661931 9.91572 -0.0661931 10.1728 0.198579L10.927 0.975275L1.22907 11.123Z" fill="currentColor"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M4.02262 14L1.68316 11.5907L11.3811 1.44293L15.3023 5.4813C15.5594 5.74607 15.5594 6.17535 15.3023 6.44013L7.96171 14H4.02262ZM10.6476 6.44004C10.3905 6.17527 10.3905 5.74599 10.6476 5.48122L11.5786 4.52239C11.8357 4.25762 12.2525 4.25762 12.5096 4.52239L13.4406 5.48122C13.6977 5.74599 13.6977 6.17527 13.4406 6.44004L12.5096 7.39887C12.2525 7.66364 11.8357 7.66364 11.5786 7.39887L10.6476 6.44004ZM3.66431 11.7136L7.38836 7.87826L7.85387 8.35767L4.12981 12.193L3.66431 11.7136Z" fill="currentColor"/>
    <path d="M9.76108 14.644H13.4364C13.6182 14.644 13.7655 14.7958 13.7655 14.983V15.661C13.7655 15.8483 13.6182 16 13.4364 16H2.24482C2.06303 16 1.91566 15.8483 1.91566 15.661V14.983C1.91566 14.8388 2.00309 14.7157 2.12634 14.6667H9.76108V14.644Z" fill="currentColor"/>
    </g>
    <defs>
    <clipPath id="clip0_12185_5035">
    <rect width="16" height="16" fill="currentColor"/>
    </clipPath>
    </defs>
</svg>
                </ng-template>
            </ds-segmented-option>
        </ds-segmented-control>
    </div>
    `,
  }),
  play: async ({ canvasElement, step }) => {
    await step('check Click event is being called', async () => {
      const canvas = within(canvasElement);
      const segments = canvas.getAllByRole('tab');
      await fireEvent.click(segments[0]);
      await expect(segments[0]).toHaveClass('ds-segment-selected');
    });
  },
};
