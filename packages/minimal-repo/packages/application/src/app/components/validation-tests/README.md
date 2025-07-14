# Validation Test Components

This folder contains various Angular components designed to test different types of build and validation errors.

## Error Cases

- `missing-method.component.ts` - Template calls non-existing method `nonExistentMethod()`
- `wrong-property-binding.component.ts` - Template binds to non-existing property `nonExistentProperty`
- `invalid-template-syntax.component.ts` - Invalid template syntax with unclosed tags and malformed bindings
- `missing-imports.component.ts` - Uses Angular features without proper imports (FormsModule, CommonModule)
- `circular-dependency.component.ts` - Creates circular dependency by importing itself
- `invalid-lifecycle.component.ts` - Implements lifecycle interfaces incorrectly
- `wrong-decorator-usage.component.ts` - Uses @Input/@Output decorators incorrectly
- `template-reference-error.component.ts` - Template references undefined variables and methods
- `invalid-pipe-usage.component.ts` - Uses non-existent pipes and incorrect pipe syntax
- `type-mismatch.component.ts` - Type mismatches between template and component properties
- `standalone-module-conflict.component.ts` - Standalone component incorrectly declared in module
- `external-files-missing.component.ts` - References non-existent external template and style files

## Valid Component

- `valid.component.ts` - Fully valid standalone component for comparison 