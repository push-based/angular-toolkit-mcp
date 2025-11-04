# Design System Migration Plan Generator

> **Purpose**: Generate concise, actionable migration plans transforming components from legacy to Design System compliance  
> **Input**: component_path (e.g., `path/to/folder`)

---

## ⚠️ CRITICAL: Required Investigation

**MUST EXECUTE IN THIS ORDER:**

1. **Locate Violations**: Use `report-all-violations` tool in a provided component_path to understand what to migrate and which components to use
2. **Get Component Details**: Use `get-ds-component-data` to extract relevant design system component file paths. Read to understand how components work and to know import paths - **PRIORITY SOURCE**
3. **Capture BEFORE MIGRATION snapshots**: Use `build_component_contract` tool to capture before-refactoring snapshot of the feature component.

**Failure to investigate FIRST will result in incomplete migration plan.**

## ⚠️ CRITICAL: Required Validation After Refactoring

1. **Capture AFTER MIGRATION snapshots**: Use `build_component_contract` tool to capture after-refactoring snapshot of the feature component.
2. **Create semantic diffs**: Use `diff_component_contract` tool to capture the changes.
3. **Validate**: Check diff file to see if expected results achieved.

---

## Migration Success Criterias

- [ ] **SC1:** Elements with deprecated classes replaced by DS components
- [ ] **SC2:** Legacy styles removed from style files; no DS host overrides left
- [ ] **SC3:** Public API preserved (all `@Input()`, `@Output()`, public methods unchanged)
- [ ] **SC4:** Slot/content projection matches DS contract
- [ ] **SC5:** DS imports added and correct; templates use DS selectors
- [ ] **SC6:** No **new** ESLint errors
- [ ] **SC7:** Accessibility and semantic structure preserved or improved
- [ ] **SC8:** `report-all-violations` tool returns **0**
- [ ] **SC9:** Only in‑scope files modified; no repo‑wide wildcards used
- [ ] **SC10:** No `[style]` / `[ngClass]` applied on DS host elements

---

## Edge Cases

**DS Component Gap**: Flag with "⚠️ **DS Component Gap**: No direct DS equivalent for [pattern]. Recommend [workaround] or escalate to DS team."

**Constraint Conflict**: Flag with "⚠️ **Constraint Conflict**: [Requirement A] conflicts with [Requirement B]. Proposed resolution: [strategy]." Prioritize: API preservation → DS compliance → Performance
