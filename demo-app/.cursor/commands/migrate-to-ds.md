```json
{
  "task": "Complete Design System Migration Workflow",
  "failureCriteria": {
    "CRITICAL": "Stop immediately if migration checklist cannot be loaded after ORIENT phase"
  },
  "phases": [
    {
      "id": 1,
      "name": "🔍 OBSERVE & ORIENT",
      "steps": [
        "1. Create folder .cursor/tmp/migrations/profiles-migration",
        "2. EXTRACT ALL violations using find all violations tool. Use <violation_template> format",
      ]
    },
    {
      "id": 2,
      "name": "📋 DECIDE & PLAN",
      "steps": [
        "3. Use get-ds-component-data for component info. Create refactoring steps using <refactoring_step_template>",
        "4. Write migration-checklist.md using <enhanced_checklist_template>"
        "5. Generate minimal Definition of Done using <minimal_dod_template>",
        "6. Build contract for component that will be refactored using build_component_contract tools"
      ]
    },
    {
      "id": 3,
      "name": "⚡ ACT & VALIDATE",
      "proceed_without_approval": true,
      "steps": [
        "7. Open localhost:4200 using playwright MCP. Take screenshot of initial state",
        "8. Load and execute migration-checklist.md step by step",
        "9. Build after-state contracts and create diff using diff_component_contract tool",
        "10. Validate implementation using contract diff and <streamlined_validation> criteria",
        "11. Run report-all-violations tool to confirm no violations remain",
      ]
    }
  ],
  "final_output_format": "Use <final_output> template"
}
```

## Templates

<violation_template>
<violation>
**ID:** VI_XX_YY (XX - file index, YY - violation index)
**File:** <file>path/to/file</file>
**Lines:** [line1, line2, line3]
**Description:**

- [IF STYLES] Usage of {{deprecated-class}} in styles.
- [IF TEMPLATE] Usage of {{deprecated-class}} in {{element}}. Use {{ds-component}} instead.
  </violation>
  </violation_template>

<refactoring_step_template>
<step>
**ID:** RS_XX_YY (XX - file index, YY - step index)
**File**: <file>path/to/file</file>
**Before code**: Code snippet of current state
**After code**: Code snippet of after state
</step>
</refactoring_step_template>

<migration_data_template>

# {{TITLE}}

## Violations Found

{{List of <violation_template>}}

## Refactoring Steps

{{List of <refactoring_step_template>}}

## Files with Violations

{{Bullet point list of relative paths to files with violations}}

## Summary

- **Total Violations**: {{violations_count}} violations in {{files_count}} files
- **Components to Migrate**: {{USED_DS_COMPONENTS}}
- **Migration Complexity**: {{Assessment of migration complexity}}
  </migration_data_template>

<technical_assessment>

- [ ] Old API is preserved in refactored component (click events, disabled states)
- [ ] No override of design system styles via classes/ngClass/ngStyle (except margin/position)
- [ ] All imported Design System Components are used in template
- [ ] All used design system components have proper imports in TypeScript
      </technical_assessment>

<technical_investigation>

- Investigate design system component stories via MCP tools for usage examples
- Deep dive into component files for style override validation
- Cross-check template and TypeScript imports
  </technical_investigation>

<technical_corrections>

- Extend refactoring to match old functionality using DS component docs
- Remove invalid classes from design system components
- Clean up unused imports and add missing ones
  </technical_corrections>

<migration_checklist_template>

## Jira Ticket Information

- **Ticket ID**: {{ID}}
- **Scope Directory**: {{relative path to directory}}
- **Components**: {{relative path to each refactored component}}

## Checklist

{{Grouped checklist optimized for AI operations}}

- [ ] {{StepID}} - {{exact <step> content}}
      </migration_checklist_template>

<enhanced_checklist_template>

# Migration Checklist - {{TITLE}}

## Migration Summary

- **Total Violations**: {{violations_count}} violations in {{files_count}} files
- **Components to Migrate**: {{USED_DS_COMPONENTS}}
- **Migration Complexity**: {{Assessment of migration complexity}}
- **Scope Directory**: {{relative path to directory}}
- **Affected Files**: {{relative path to each file with violations}}

## Violations Found

{{List of <violation_template>}}

## Migration Checklist

{{Grouped checklist optimized for AI operations order}}

### Template Changes

{{Steps for template modifications}}

- [ ] RS*{{XX}}*{{YY}} - {{Before}} → {{After}}

### Style Changes

{{Steps for style modifications}}

- [ ] RS*{{XX}}*{{YY}} - {{Before}} → {{After}}

### Import Changes

{{Steps for import modifications}}

- [ ] RS*{{XX}}*{{YY}} - {{Before}} → {{After}}

### Validation Steps

- [ ] Technical validation using <technical_assessment> criteria
- [ ] Functional testing validation
- [ ] Code quality validation
- [ ] Contract generation and diff creation

## Technical Assessment Status

{{Will be updated during DECIDE phase}}

- [ ] Old API preserved ✅/❌
- [ ] No style overrides ✅/❌
- [ ] All imports used ✅/❌
- [ ] All components imported ✅/❌
      </enhanced_checklist_template>

<minimal_dod_template>

# DoD - {{Ticket ID}}

## Success Criteria

- [ ] **Violations Cleared**: Zero violations remain (via report-all-violations tool)
- [ ] **Functionality Preserved**: All original features work as before
- [ ] **Design System Applied**: New DS components properly integrated
- [ ] **Code Quality**: No TypeScript/ESLint errors, dependencies updated
- [ ] **Contract Validation**: Before/after diff confirms expected changes

## Completion Status

**DONE** when all criteria above are ✅ and user accepts final validation report.
</minimal_dod_template>

## Validation Procedures

<streamlined_validation>
**Core Validation via Contract Diff:**

- Use contracts diff file to confirm refactoring changes
- Validate that deprecated classes were removed from templates/styles
- Confirm Design System components were properly added to imports and templates
- Check that old functionality (click handlers, disabled states) is preserved

**Code Quality Checks:**

- Check project package.json peerDependencies for Design System components
- Add missing dependencies if project is buildable/publishable
- Confirm no TypeScript/ESLint errors via direct inspection
- Validate imports match usage in templates

**Technical Assessment:**

- [ ] Old API preserved (events, disabled states, etc.)
- [ ] No style overrides on DS components (except margin/position)
- [ ] All DS imports used in templates
- [ ] All template DS components have imports

**Final Status:** Report validation results directly without updating documents
</streamlined_validation>

<final_output>

## 🔄 MIGRATION COMPLETE

### Phase Results:

- **🔍 Observe & Orient**: {{violations_count}} violations in {{files_count}} files
- **📋 Decide & Plan**: {{steps_total}} refactoring steps, {{validation_status}}
- **⚡ Act & Validate**: {{implementation_status}}, {{quality_status}}

### Validation Summary:

- **Contract Diff**: {{changes_confirmed_in_diff}}
- **Code Quality**: {{eslint_typescript_status}}
- **Violations Remaining**: {{final_violations_count}}
- **Technical Assessment**: {{technical_criteria_passed}}/4 criteria met

### Deliverables:

- Migration Checklist: {{path_to_checklist}}
- Test Checklist: {{path_to_test_checklist}}
- Minimal DoD: {{path_to_dod}}
- Contracts & Diff: {{path_to_contracts}}
- Final Status: {{COMPLETE | ISSUES_FOUND}}

### Key Tools Used:

- find all violations tool
- get-ds-component-data MCP
- build_component_contract tools
- diff_component_contract tool
- report-all-violations tool
- playwright MCP for validation
  </final_output>
