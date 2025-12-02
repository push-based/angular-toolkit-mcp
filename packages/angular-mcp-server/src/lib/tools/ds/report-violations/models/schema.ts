import {
  createViolationReportingSchema,
  createProjectAnalysisSchema,
  COMMON_ANNOTATIONS,
} from '../../shared/models/schema-helpers.js';
import {
  DEFAULT_OUTPUT_BASE,
  OUTPUT_SUBDIRS,
} from '../../shared/constants.js';

export const reportViolationsSchema = {
  name: 'report-violations',
  description: `Report deprecated CSS usage for a specific design system component in a directory. Returns violations grouped by file, showing which deprecated classes are used and where. Use this when you know which component you're checking for. Output includes: file paths, line numbers, and violation details (but not replacement suggestions since the component is already known).`,
  inputSchema: createViolationReportingSchema({
    saveAsFile: {
      type: 'boolean',
      description: `If true, saves the violations report to <root>/${DEFAULT_OUTPUT_BASE}/${OUTPUT_SUBDIRS.VIOLATIONS_REPORT}/<componentName>/ with filename pattern <directory>-violations.json (e.g., packages-poker-core-lib-violations.json). Overwrites if file exists.`,
    },
  }),
  annotations: {
    title: 'Report Violations',
    ...COMMON_ANNOTATIONS.readOnly,
  },
};

export const reportAllViolationsSchema = {
  name: 'report-all-violations',
  description:
    'Scan a directory for all deprecated design system CSS classes and output a comprehensive violation report. Use this to discover all violations across multiple components. Output can be grouped by component (default) or by file, and includes: file paths, line numbers, violation details, and replacement suggestions (which component should be used instead). This is ideal for getting an overview of all violations in a directory.',
  inputSchema: createProjectAnalysisSchema({
    groupBy: {
      type: 'string',
      enum: ['component', 'file'],
      description:
        'How to group the results: "component" (default) groups by design system component showing all files affected by each component, "file" groups by file path showing all components violated in each file',
      default: 'component',
    },
    saveAsFile: {
      type: 'boolean',
      description: `If true, saves the violations report to <root>/${DEFAULT_OUTPUT_BASE}/${OUTPUT_SUBDIRS.VIOLATIONS_REPORT}/ with filename pattern <directory>-violations.json (e.g., packages-poker-core-lib-violations.json). Overwrites if file exists.`,
    },
  }),
  annotations: {
    title: 'Report All Violations',
    ...COMMON_ANNOTATIONS.readOnly,
  },
};

export const groupViolationsSchema = {
  name: 'group-violations',
  description: `Creates work distribution groups from violations report. Reads a violations JSON file (e.g., packages-poker-violations.json) from ${DEFAULT_OUTPUT_BASE}/${OUTPUT_SUBDIRS.VIOLATIONS_REPORT}/ and creates balanced work groups using bin-packing algorithm. Accepts both file-grouped and component-grouped violation reports. Groups are balanced by violation count, maintain path exclusivity (each file in one group), and preserve directory boundaries for parallel development.`,
  inputSchema: {
    type: 'object' as const,
    properties: {
      fileName: {
        type: 'string',
        description: `Name of the violations JSON file (e.g., "packages-poker-violations.json"). File must exist in ${DEFAULT_OUTPUT_BASE}/${OUTPUT_SUBDIRS.VIOLATIONS_REPORT}/`,
      },
      minGroups: {
        type: 'number',
        description: 'Minimum number of groups to create (default: 3)',
        default: 3,
      },
      maxGroups: {
        type: 'number',
        description: 'Maximum number of groups to create (default: 5)',
        default: 5,
      },
      variance: {
        type: 'number',
        description:
          'Acceptable variance percentage for group balance (default: 20). Groups will have violations within target ± variance%',
        default: 20,
      },
    },
    required: ['fileName'],
  },
  annotations: {
    title: 'Group Violations',
    ...COMMON_ANNOTATIONS.readOnly,
  },
};
