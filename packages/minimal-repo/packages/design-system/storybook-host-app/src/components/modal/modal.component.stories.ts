import { generateStatusBadges } from '@design-system/shared-storybook-utils';
import {
  DemoChevronComponent,
  DemoCloseIconComponent,
  DemoIconComponent,
} from '@design-system/storybook-demo-cmp-lib';
import { DsBadge } from '@frontend/ui/badge';
import { DsButton } from '@frontend/ui/button';
import { DsButtonIcon } from '@frontend/ui/button-icon';
import {
  DsModal,
  DsModalContent,
  DsModalHeader,
  DsModalHeaderDrag,
  DsModalHeaderVariant,
} from '@frontend/ui/modal';
import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular';

import { DemoCdkModalContainer } from './demo-cdk-dialog-cmp.component';
import { DemoModalContainer } from './demo-modal-cmp.component';

type DsModalStoryType = DsModal & { headerVariant: DsModalHeaderVariant };

const meta: Meta<DsModalStoryType> = {
  title: 'Components/Modal',
  component: DsModal,
  parameters: {
    status: generateStatusBadges('UX-2414', ['integration ready']),
  },
  excludeStories: /.*Data$/,
  argTypes: {
    headerVariant: {
      options: [
        'surface-lowest',
        'surface-low',
        'surface',
        'surface-high',
        'nav-bg',
      ],
      table: { defaultValue: { summary: 'surface' }, category: 'Styling' },
      control: { type: 'select' },
      description: 'Surface type',
    },
    variant: {
      options: ['surface-lowest', 'surface-low', 'surface'],
      table: { defaultValue: { summary: 'surface' }, category: 'Styling' },
      control: { type: 'select' },
      description: 'Surface type',
    },
    inverse: {
      type: 'boolean',
      table: { defaultValue: { summary: 'false' }, category: 'Styling' },
      control: { type: 'boolean' },
      description: 'The inverse state of the Modal',
    },
    bottomSheet: {
      type: 'boolean',
      table: { defaultValue: { summary: 'false' }, category: 'Styling' },
      control: { type: 'boolean' },
      description: 'The dialog should open from bottom',
    },
  },
  args: {
    headerVariant: 'surface',
    inverse: false,
    bottomSheet: true,
    variant: 'surface',
  },
  decorators: [
    moduleMetadata({
      imports: [
        DsModal,
        DemoIconComponent,
        DemoCloseIconComponent,
        DsButton,
        DsButtonIcon,
        DemoChevronComponent,
        DsBadge,
        DsModalHeader,
        DsModalContent,
        DsModalHeaderDrag,
        DemoModalContainer,
        DemoCdkModalContainer,
      ],
    }),
  ],
};

export default meta;
type Story = StoryObj<DsModalStoryType>;

export const Default: Story = {
  render: () => ({
    template: `<ds-modal style="width: 250px; min-height: 120px"></ds-modal>`,
  }),
};

export const WithMatDialog: Story = {
  render: (modal) => ({
    template: `
            <div>
                <ds-demo-dialog-container headerVariant="${modal.headerVariant}" inverse="${modal.inverse}" variant="${modal.variant}" bottomSheetInput="${modal.bottomSheet}"/>
            </div>
        `,
  }),
};

export const WithCdkDialog: Story = {
  render: (modal) => ({
    template: `
            <div>
                <ds-demo-cdk-dialog-container headerVariant="${modal.headerVariant}" variant="${modal.variant}" inverse="${modal.inverse}" bottomSheetInput="${modal.bottomSheet}" />
            </div>
        `,
  }),
};

export const ModalWithContentOnly: Story = {
  argTypes: {
    bottomSheet: {
      table: { disable: true },
    },
  },
  render: (args) => ({
    template: `
            <ds-modal variant="${args.variant}" inverse="${args.inverse}" style="width: 250px;">
                <ds-modal-content> Lorem ipsum dolor sit amet. </ds-modal-content>
            </ds-modal>
        `,
  }),
};

export const WithTitleAndClose: Story = {
  argTypes: {
    bottomSheet: {
      table: { disable: true },
    },
  },
  render: (args) => ({
    template: `
            <ds-modal inverse="${args.inverse}" variant="${args.variant}" >
                <ds-modal-header variant="${args.headerVariant}">
                    <div slot="start">
                        <div slot="title">Hello world</div>
                    </div>
                    <button slot="end" ds-button-icon size="small" variant="flat" kind="utility">
                        <ds-demo-close-icon />
                    </button>
                </ds-modal-header>
                <ds-modal-content> Lorem ipsum dolor sit amet. </ds-modal-content>
            </ds-modal>
        `,
  }),
};

export const WithDragger: Story = {
  argTypes: {
    bottomSheet: {
      table: { disable: true },
    },
  },
  render: (args) => ({
    template: `
            <ds-modal variant="${args.variant}" inverse="${args.inverse}" >
                <ds-modal-header variant="${args.headerVariant}">
                   <ds-modal-header-drag />
                </ds-modal-header>
                <ds-modal-content> Lorem ipsum dolor sit amet. </ds-modal-content>
            </ds-modal>
        `,
  }),
};

export const BolderSubtitleThanTitle: Story = {
  argTypes: {
    bottomSheet: {
      table: { disable: true },
    },
  },
  render: (args) => ({
    template: `
            <ds-modal variant="${args.variant}" inverse="${args.inverse}" >
                <ds-modal-header variant="${args.headerVariant}">
                    <button slot="start" ds-button variant="outline" size="medium">Cancel</button>
                    <div slot="center">
                        <div slot="title">Title</div>
                        <div slot="subtitle">Subtitle</div>
                    </div>
                    <button slot="end" ds-button variant="filled" size="medium">
                        <ds-demo-icon slot="start" />
                        Agree
                    </button>
                </ds-modal-header>
                <ds-modal-content> Lorem ipsum dolor sit amet. </ds-modal-content>
            </ds-modal>
        `,
  }),
};

export const ActionsAndCenteredTitle: Story = {
  argTypes: {
    bottomSheet: {
      table: { disable: true },
    },
  },
  render: (args) => ({
    template: `
            <ds-modal variant="${args.variant}" inverse="${args.inverse}" >
                <ds-modal-header variant="${args.headerVariant}">
                    <button slot="start" ds-button variant="outline" size="medium">Cancel</button>
                    <div slot="center">
                        <div slot="title">Hello world</div>
                        <div slot="subtitle">From DS team</div>
                    </div>
                    <button slot="end" ds-button variant="filled" size="medium">
                        <ds-demo-icon slot="start" />
                        Agree
                    </button>
                </ds-modal-header>
                <ds-modal-content> Lorem ipsum dolor sit amet. </ds-modal-content>
            </ds-modal>
        `,
  }),
};

export const CloseTitleLabelAction: Story = {
  argTypes: {
    bottomSheet: {
      table: { disable: true },
    },
  },
  render: (args) => ({
    template: `
            <ds-modal variant="${args.variant}" inverse="${args.inverse}" >
                <ds-modal-header variant="${args.headerVariant}">
                    <ng-container slot="start" >
                      <button ds-button-icon variant="outline" size="medium" kind="secondary">
                        <ds-demo-close-icon />                        
                      </button>
                      <div slot="title">
                        Hello world
                        <ds-badge variant="blue">Label</ds-badge>
                      </div>
                    </ng-container>
                    <ng-container slot="end">
                        <ds-demo-icon slot="start" />
                        <button slot="end" ds-button variant="outline" size="medium">
                          Action
                        </button>
                    </ng-container>
                </ds-modal-header>
                <ds-modal-content> Lorem ipsum dolor sit amet. </ds-modal-content>
            </ds-modal>
        `,
  }),
};

export const BackBtnTitleLabelAction: Story = {
  argTypes: {
    bottomSheet: {
      table: { disable: true },
    },
  },
  render: (args) => ({
    template: `
            <ds-modal variant="${args.variant}" inverse="${args.inverse}" >
                <ds-modal-header variant="${args.headerVariant}">
                    <ng-container slot="start">
                      <button ds-button-icon variant="outline" size="medium" kind="secondary">
                        <ds-demo-chevron rotation="90" />                        
                      </button>
                      <div style="display: flex; flex-direction: column;">
                        <div slot="title">
                          Hello world
                          <ds-badge variant="blue">Label</ds-badge>
                        </div>
                        <div slot="subtitle">From DS team</div>
                      </div>
                    </ng-container>
                    <ng-container slot="end">
                        <ds-demo-icon slot="start" />
                        <button slot="end" ds-button variant="outline" size="medium">
                          Action
                        </button>
                    </ng-container>
                </ds-modal-header>
                <ds-modal-content> Lorem ipsum dolor sit amet. </ds-modal-content>
            </ds-modal>
        `,
  }),
};

export const ModalHeaderTypes: Story = {
  argTypes: {
    headerVariant: {
      table: { disable: true },
    },
    bottomSheet: {
      table: { disable: true },
    },
    variant: {
      table: { disable: true },
    },
  },
  render: (args) => ({
    template: `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px">
                 <div style="display: grid; gap: 10px">
                    <ds-modal inverse="${args.inverse}" >
                        <ds-modal-header variant="surface">
                            <div slot="start">
                                <div slot="title">Surface</div>
                            </div>
                            <button slot="end" ds-button-icon size="small" variant="flat" kind="utility">
                                <ds-demo-close-icon />
                            </button>
                        </ds-modal-header>
                        <ds-modal-content> Lorem ipsum dolor sit amet. </ds-modal-content>
                    </ds-modal>
                    <ds-modal inverse="${args.inverse}" >
                        <ds-modal-header variant="surface-lowest">
                            <div slot="start">
                                <div slot="title">Surface lowest</div>
                            </div>
                            <button slot="end" ds-button-icon size="small" variant="outline" kind="utility">
                                <ds-demo-close-icon />
                            </button>
                        </ds-modal-header>
                        <ds-modal-content> Lorem ipsum dolor sit amet. </ds-modal-content>
                    </ds-modal>
                    <ds-modal inverse="${args.inverse}" >
                        <ds-modal-header variant="surface-low">
                            <div slot="start">
                                <div slot="title">Surface low</div>
                            </div>
                            <button slot="end" ds-button-icon size="small" variant="filled" kind="utility">
                                <ds-demo-close-icon />
                            </button>
                        </ds-modal-header>
                        <ds-modal-content> Lorem ipsum dolor sit amet. </ds-modal-content>
                    </ds-modal>
                    <ds-modal inverse="${args.inverse}" >
                        <ds-modal-header variant="surface-high">
                            <div slot="start">
                                <div slot="title">Surface High</div>
                            </div>
                            <button slot="end" ds-button-icon size="small" kind="secondary">
                                <ds-demo-close-icon />
                            </button>
                        </ds-modal-header>
                        <ds-modal-content> Lorem ipsum dolor sit amet. </ds-modal-content>
                    </ds-modal>
                </div>
                 <div style="display: grid; gap: 10px">
                    <ds-modal inverse="${args.inverse}" >
                        <ds-modal-header variant="surface">
                            <div slot="start">
                                <div slot="title">Surface</div>
                                <div slot="subtitle">Header subtitle</div>
                            </div>
                            <div slot="end">
                              <button ds-button-icon size="small" variant="flat" kind="utility">
                                <ds-demo-close-icon />
                              </button>
                            </div>
                        </ds-modal-header>
                        <ds-modal-content> Lorem ipsum dolor sit amet. </ds-modal-content>
                    </ds-modal>
                    <ds-modal inverse="${args.inverse}" >
                        <ds-modal-header variant="surface-lowest">
                            <div slot="start">
                                <div slot="title">Surface lowest</div>
                                <div slot="subtitle">Header subtitle</div>
                            </div>
                            <button slot="end" ds-button-icon size="small" variant="outline" kind="utility">
                                <ds-demo-close-icon />
                            </button>
                        </ds-modal-header>
                        <ds-modal-content> Lorem ipsum dolor sit amet. </ds-modal-content>
                    </ds-modal>
                    <ds-modal inverse="${args.inverse}" >
                        <ds-modal-header variant="surface-low">
                            <div slot="start">
                                <div slot="title">Surface low</div>
                                <div slot="subtitle">Header subtitle</div>
                            </div>
                            <button slot="end" ds-button-icon size="small" kind="utility">
                                <ds-demo-close-icon />
                            </button>
                        </ds-modal-header>
                        <ds-modal-content> Lorem ipsum dolor sit amet. </ds-modal-content>
                    </ds-modal>
                    <ds-modal inverse="${args.inverse}" >
                        <ds-modal-header variant="surface-high">
                            <div slot="start">
                                <div slot="title">Surface High</div>
                                <div slot="subtitle">Header subtitle</div>
                            </div>
                            <button slot="end" ds-button-icon size="small" kind="secondary">
                                <ds-demo-close-icon />
                            </button>
                        </ds-modal-header>
                        <ds-modal-content> Lorem ipsum dolor sit amet. </ds-modal-content>
                    </ds-modal>
                </div>
            </div>
        `,
  }),
};
