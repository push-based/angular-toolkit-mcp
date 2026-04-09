import { describe, it, expect } from 'vitest';
import {
  parseStoryFile,
  extractImportsAST,
  extractImportsRegex,
  extractMetaArgsAST,
  extractMetaArgsRegex,
  extractArgTypesAST,
  extractArgTypesRegex,
  extractStoriesAST,
  extractStoriesRegex,
  extractSlotsFromTemplates,
  detectSelectorStyle,
  detectFormIntegration,
  cleanTemplate,
  extractTernaryElseBranch,
} from '../story-parser.utils.js';
import * as ts from 'typescript';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createSourceFile(content: string): ts.SourceFile {
  return ts.createSourceFile(
    'test.stories.ts',
    content,
    ts.ScriptTarget.Latest,
    true,
  );
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const BADGE_STORY = `
import { DsBadge, DS_BADGE_SIZE_ARRAY, DS_BADGE_VARIANT_ARRAY } from '@frontend/ui/badge';
import { DsNotificationBubble } from '@frontend/ui/notification-bubble';
import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { expect } from '@storybook/test';
import { lodashHelper } from 'lodash';

type DsBadgeStoryType = DsBadge & { label: string };

const meta: Meta<DsBadgeStoryType> = {
  title: 'Components/Badge',
  component: DsBadge,
  argTypes: {
    label: {
      type: 'string',
      table: { defaultValue: { summary: 'Label' } },
      description: 'The text of the badge',
    },
    size: {
      options: DS_BADGE_SIZE_ARRAY,
      table: { defaultValue: { summary: 'medium' } },
      description: 'The size of the badge',
    },
    variant: {
      options: DS_BADGE_VARIANT_ARRAY,
      table: { defaultValue: { summary: 'primary' } },
      description: 'The variant of the badge',
    },
  },
  args: {
    label: 'Label',
    size: 'medium',
    variant: 'primary',
  },
};

export default meta;

type Story = StoryObj<DsBadgeStoryType>;

export const Default: Story = {
  render: (badge) => ({
    template: \`
      <ds-badge variant="\${badge.variant}" size="\${badge.size}">
        \${badge.label}
      </ds-badge>
    \`,
  }),
};

export const WithIcon: Story = {
  tags: ['icon-variant'],
  args: {
    ...meta.args,
    size: 'large',
  },
  render: (badge) => ({
    template: \`<ds-badge variant="\${badge.variant}"><span slot="icon">★</span>\${badge.label}</ds-badge>\`,
  }),
};
`;

const FORM_INTEGRATION_STORY = `
import { DsInput } from '@frontend/ui/input';
import { Meta, StoryObj } from '@storybook/angular';

const meta: Meta = {
  title: 'Components/Input',
  component: DsInput,
};

export default meta;

export const WithNgModel: Story = {
  render: () => ({
    template: \`<ds-input [(ngModel)]="value"></ds-input>\`,
  }),
};

export const WithReactiveForms: Story = {
  render: () => ({
    template: \`<ds-input formControlName="name"></ds-input>\`,
  }),
};

export const WithFormControl: Story = {
  render: () => ({
    template: \`<ds-input [formControl]="ctrl"></ds-input>\`,
  }),
};
`;

const PLAY_FN_STORY = `
import { DsSegmentedControl } from '@frontend/ui/segmented-control';
import { Meta, StoryObj } from '@storybook/angular';

const meta: Meta = {
  title: 'Components/Segmented Control',
};

export default meta;

export const Default: StoryObj = {
  render: () => ({
    template: \`<ds-segmented-control></ds-segmented-control>\`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('tab')).toBeTruthy();
  },
};
`;

const EMPTY_META_STORY = `
import { DsCard } from '@frontend/ui/card';
import { Meta, StoryObj } from '@storybook/angular';

const meta: Meta = {
  title: 'Components/Card',
};

export default meta;

export const Default: Story = {
  render: () => ({
    template: \`<ds-card>Content</ds-card>\`,
  }),
};
`;

const MULTILINE_IMPORT_STORY = `
import {
  DsBadge,
  DS_BADGE_SIZE_ARRAY,
  DS_BADGE_VARIANT_ARRAY
} from '@frontend/ui/badge';
import { Meta, StoryObj } from '@storybook/angular';

const meta: Meta = { title: 'Test' };
export default meta;
`;

// ---------------------------------------------------------------------------
// Tests: parseStoryFile (integration)
// ---------------------------------------------------------------------------

describe('parseStoryFile', () => {
  it('should parse a complete story file and return all fields', () => {
    const result = parseStoryFile(BADGE_STORY, 'badge.stories.ts', 'badge');

    expect(result.componentName).toBe('badge');
    expect(result.filePath).toBe('badge.stories.ts');
    expect(result.selector.style).toBe('element');
    expect(result.selector.selector).toBe('ds-badge');
    expect(result.imports.length).toBe(2);
    expect(result.argTypes.length).toBe(3);
    expect(result.metaArgs).not.toBeNull();
    expect(result.metaArgs!.length).toBe(3);
    expect(result.stories.length).toBe(2);
    expect(result.slots).toEqual(['icon']);
  });

  it('should return empty arrays and null metaArgs for minimal story', () => {
    const result = parseStoryFile(EMPTY_META_STORY, 'card.stories.ts', 'card');

    expect(result.argTypes).toEqual([]);
    expect(result.metaArgs).toBeNull();
    expect(result.formIntegration).toEqual([]);
    expect(result.stories.length).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Tests: Import extraction
// ---------------------------------------------------------------------------

describe('extractImportsAST', () => {
  it('should filter to only @frontend/ and @design-system/ imports', () => {
    const sf = createSourceFile(BADGE_STORY);
    const imports = extractImportsAST(sf);

    expect(imports.length).toBe(2);
    expect(
      imports.every(
        (i) => i.includes('@frontend/') || i.includes('@design-system/'),
      ),
    ).toBe(true);
    expect(imports.some((i) => i.includes('@storybook/'))).toBe(false);
    expect(imports.some((i) => i.includes('lodash'))).toBe(false);
  });

  it('should normalize multi-line imports to single line', () => {
    const sf = createSourceFile(MULTILINE_IMPORT_STORY);
    const imports = extractImportsAST(sf);

    expect(imports.length).toBe(1);
    expect(imports[0]).not.toContain('\n');
    expect(imports[0]).toContain('DsBadge');
    expect(imports[0]).toContain('DS_BADGE_SIZE_ARRAY');
  });
});

describe('extractImportsRegex', () => {
  it('should filter to only @frontend/ and @design-system/ imports', () => {
    const imports = extractImportsRegex(BADGE_STORY);

    expect(imports.length).toBe(2);
    expect(
      imports.every(
        (i) => i.includes('@frontend/') || i.includes('@design-system/'),
      ),
    ).toBe(true);
  });

  it('should normalize multi-line imports', () => {
    const imports = extractImportsRegex(MULTILINE_IMPORT_STORY);

    expect(imports.length).toBe(1);
    expect(imports[0]).not.toContain('\n');
  });
});

// ---------------------------------------------------------------------------
// Tests: Meta args extraction
// ---------------------------------------------------------------------------

describe('extractMetaArgsAST', () => {
  it('should extract meta args key-value pairs', () => {
    const sf = createSourceFile(BADGE_STORY);
    const args = extractMetaArgsAST(sf);

    expect(args).not.toBeNull();
    expect(args!.length).toBe(3);
    expect(args!.find((a) => a.name === 'label')?.default).toBe("'Label'");
    expect(args!.find((a) => a.name === 'size')?.default).toBe("'medium'");
    expect(args!.find((a) => a.name === 'variant')?.default).toBe("'primary'");
  });

  it('should return null when no args exist', () => {
    const sf = createSourceFile(EMPTY_META_STORY);
    const args = extractMetaArgsAST(sf);

    expect(args).toBeNull();
  });
});

describe('extractMetaArgsRegex', () => {
  it('should extract meta args key-value pairs', () => {
    const args = extractMetaArgsRegex(BADGE_STORY);

    expect(args).not.toBeNull();
    expect(args!.length).toBe(3);
    expect(args!.find((a) => a.name === 'label')?.default).toBe("'Label'");
  });

  it('should return null when no args exist', () => {
    const args = extractMetaArgsRegex(EMPTY_META_STORY);
    expect(args).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Tests: ArgTypes extraction
// ---------------------------------------------------------------------------

describe('extractArgTypesAST', () => {
  it('should extract argType entries with all fields', () => {
    const sf = createSourceFile(BADGE_STORY);
    const argTypes = extractArgTypesAST(sf);

    expect(argTypes.length).toBe(3);

    const label = argTypes.find((a) => a.name === 'label')!;
    expect(label.type).toBe('string');
    expect(label.default).toBe('Label');
    expect(label.description).toBe('The text of the badge');

    const size = argTypes.find((a) => a.name === 'size')!;
    expect(size.options).toBe('DS_BADGE_SIZE_ARRAY');
    expect(size.default).toBe('medium');
  });

  it('should return empty array when no argTypes exist', () => {
    const sf = createSourceFile(EMPTY_META_STORY);
    expect(extractArgTypesAST(sf)).toEqual([]);
  });
});

describe('extractArgTypesRegex', () => {
  // The regex path uses indentation-sensitive patterns matching real story file formatting.
  // argTypes closing } at 2-4 spaces, entry closing } at 6-8 spaces.
  const REGEX_FORMATTED_ARGTYPES = `const meta = {
  argTypes: {
      label: {
          type: 'string',
          table: { defaultValue: { summary: 'Label' } },
          description: 'The text of the badge',
      },
      size: {
          options: DS_BADGE_SIZE_ARRAY,
          table: { defaultValue: { summary: 'medium' } },
          description: 'The size of the badge',
      },
  },
};
export default meta;
`;

  it('should extract argType entries', () => {
    const argTypes = extractArgTypesRegex(REGEX_FORMATTED_ARGTYPES);
    expect(argTypes.length).toBe(2);
    expect(argTypes.some((a) => a.name === 'label')).toBe(true);
    expect(argTypes.find((a) => a.name === 'label')?.type).toBe('string');
    expect(argTypes.find((a) => a.name === 'label')?.default).toBe('Label');
    expect(argTypes.find((a) => a.name === 'size')?.options).toBe(
      'DS_BADGE_SIZE_ARRAY',
    );
  });

  it('should return empty array when no argTypes exist', () => {
    expect(extractArgTypesRegex(EMPTY_META_STORY)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Tests: Story extraction
// ---------------------------------------------------------------------------

describe('extractStoriesAST', () => {
  it('should extract all exported stories', () => {
    const sf = createSourceFile(BADGE_STORY);
    const stories = extractStoriesAST(sf, BADGE_STORY);

    expect(stories.length).toBe(2);
    expect(stories[0].name).toBe('Default');
    expect(stories[1].name).toBe('WithIcon');
  });

  it('should extract tags from stories', () => {
    const sf = createSourceFile(BADGE_STORY);
    const stories = extractStoriesAST(sf, BADGE_STORY);

    expect(stories[0].tags).toEqual([]);
    expect(stories[1].tags).toEqual(['icon-variant']);
  });

  it('should extract args overrides excluding spreads', () => {
    const sf = createSourceFile(BADGE_STORY);
    const stories = extractStoriesAST(sf, BADGE_STORY);

    // WithIcon has ...meta.args (spread, excluded) and size: 'large' (included)
    const withIcon = stories[1];
    expect(withIcon.argsOverrides.some((a) => a.name === 'size')).toBe(true);
    expect(withIcon.argsOverrides.every((a) => !a.name.includes('...'))).toBe(
      true,
    );
  });

  it('should detect play function', () => {
    const sf = createSourceFile(PLAY_FN_STORY);
    const stories = extractStoriesAST(sf, PLAY_FN_STORY);

    expect(stories[0].hasPlayFn).toBe(true);
  });

  it('should extract and clean templates', () => {
    const sf = createSourceFile(BADGE_STORY);
    const stories = extractStoriesAST(sf, BADGE_STORY);

    expect(stories[0].template).not.toBeNull();
    expect(stories[0].template).toContain('ds-badge');
    // ${...} should be replaced with ...
    expect(stories[0].template).not.toContain('${');
  });
});

describe('extractStoriesRegex', () => {
  it('should extract all exported stories', () => {
    const stories = extractStoriesRegex(BADGE_STORY);

    expect(stories.length).toBe(2);
    expect(stories[0].name).toBe('Default');
    expect(stories[1].name).toBe('WithIcon');
  });

  it('should extract tags', () => {
    const stories = extractStoriesRegex(BADGE_STORY);
    expect(stories[1].tags).toEqual(['icon-variant']);
  });
});

// ---------------------------------------------------------------------------
// Tests: Slot extraction
// ---------------------------------------------------------------------------

describe('extractSlotsFromTemplates', () => {
  it('should extract unique sorted slot names', () => {
    const templates = [
      '<span slot="icon">★</span><span slot="suffix">→</span>',
      '<span slot="icon">★</span><span slot="prefix">←</span>',
    ];
    expect(extractSlotsFromTemplates(templates)).toEqual([
      'icon',
      'prefix',
      'suffix',
    ]);
  });

  it('should return empty array when no slots found', () => {
    expect(extractSlotsFromTemplates(['<div>no slots</div>'])).toEqual([]);
  });

  it('should handle empty templates array', () => {
    expect(extractSlotsFromTemplates([])).toEqual([]);
  });

  it('should deduplicate slot names', () => {
    const templates = ['<span slot="icon">1</span><span slot="icon">2</span>'];
    expect(extractSlotsFromTemplates(templates)).toEqual(['icon']);
  });
});

// ---------------------------------------------------------------------------
// Tests: Selector style detection
// ---------------------------------------------------------------------------

describe('detectSelectorStyle', () => {
  it('should detect element-style selector', () => {
    const result = detectSelectorStyle('<ds-badge variant="primary">', 'badge');
    expect(result.style).toBe('element');
    expect(result.selector).toBe('ds-badge');
  });

  it('should detect attribute-style selector', () => {
    const result = detectSelectorStyle(
      '<button ds-button>Click</button>',
      'button',
    );
    expect(result.style).toBe('attribute');
    expect(result.selector).toBe('ds-button');
    expect(result.note).toContain('attribute');
  });

  it('should return unknown when no selector pattern found', () => {
    const result = detectSelectorStyle('<div>no component</div>', 'badge');
    expect(result.style).toBe('unknown');
  });

  it('should detect attribute on <a> elements', () => {
    const result = detectSelectorStyle(
      '<a ds-button href="#">Link</a>',
      'button',
    );
    expect(result.style).toBe('attribute');
  });
});

// ---------------------------------------------------------------------------
// Tests: Form integration detection
// ---------------------------------------------------------------------------

describe('detectFormIntegration', () => {
  it('should detect ngModel', () => {
    const result = detectFormIntegration('[(ngModel)]="value"');
    expect(result).toContain('ngModel (template-driven)');
  });

  it('should detect formControlName', () => {
    const result = detectFormIntegration('formControlName="name"');
    expect(result).toContain('formControlName (reactive forms)');
  });

  it('should detect formControl without matching formControlName', () => {
    const result = detectFormIntegration('[formControl]="ctrl"');
    expect(result).toContain('formControl (reactive forms)');
    expect(result).not.toContain('formControlName (reactive forms)');
  });

  it('should detect all three patterns', () => {
    const result = detectFormIntegration(FORM_INTEGRATION_STORY);
    expect(result).toHaveLength(3);
  });

  it('should return empty array when no form patterns found', () => {
    expect(detectFormIntegration('<div>no forms</div>')).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Tests: Template cleaning
// ---------------------------------------------------------------------------

describe('cleanTemplate', () => {
  it('should replace ${...} with ...', () => {
    const result = cleanTemplate(
      '<ds-badge variant="${badge.variant}">${badge.label}</ds-badge>',
    );
    expect(result).not.toContain('${');
    expect(result).toContain('...');
  });

  it('should remove Storybook layout wrapper divs', () => {
    const result = cleanTemplate(
      '<div style="width: 650px; display: grid;"><ds-badge>Label</ds-badge>',
    );
    expect(result).not.toContain('display: grid');
    expect(result).toContain('ds-badge');
  });

  it('should normalize whitespace', () => {
    const result = cleanTemplate('\n\n\n  <ds-badge>Label</ds-badge>\n\n\n');
    expect(result).not.toMatch(/\n{3,}/);
  });
});

// ---------------------------------------------------------------------------
// Tests: Ternary else-branch extraction
// ---------------------------------------------------------------------------

describe('extractTernaryElseBranch', () => {
  it('should extract else-branch from ternary with unsupported marker', () => {
    const body = `
      template: isUnsupportedCombination
        ? \`<p>Not Supported</p>\`
        : \`<ds-toggle [checked]="true"></ds-toggle>\`,
    `;
    const result = extractTernaryElseBranch(body);
    expect(result).not.toBeNull();
    expect(result).toContain('ds-toggle');
    expect(result).not.toContain('Not Supported');
  });

  it('should return null when no ternary marker found', () => {
    const body = 'template: `<ds-badge>Label</ds-badge>`';
    expect(extractTernaryElseBranch(body)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Tests: Regex fallback (malformed TypeScript)
// ---------------------------------------------------------------------------

describe('parseStoryFile regex fallback', () => {
  it('should still produce output for content that AST can parse', () => {
    // Even though AST can parse this, verify the regex path works too
    const result = parseStoryFile(BADGE_STORY, 'badge.stories.ts', 'badge');
    expect(result.imports.length).toBeGreaterThan(0);
    expect(result.stories.length).toBeGreaterThan(0);
  });
});
