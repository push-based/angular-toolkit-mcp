# Examples

## 1 — Identifying Angular Component decorators

> Find and validate `@Component` decorators in Angular class declarations.

```ts
import {
  isComponentDecorator,
  getDecorators,
} from '@push-based/typescript-ast-utils';
import * as ts from 'typescript';

// Sample Angular component source code
const sourceCode = `
@Component({
  selector: 'app-example',
  template: '<div>Hello World</div>'
})
export class ExampleComponent {}
`;

// Create source file and program
const sourceFile = ts.createSourceFile(
  'example.ts',
  sourceCode,
  ts.ScriptTarget.Latest
);

// Visit class declarations
function visitClassDeclaration(node: ts.ClassDeclaration) {
  const decorators = getDecorators(node);

  for (const decorator of decorators) {
    if (isComponentDecorator(decorator)) {
      console.log(`Found @Component decorator on class: ${node.name?.text}`);
      // → 'Found @Component decorator on class: ExampleComponent'
    }
  }
}

// Traverse the AST
ts.forEachChild(sourceFile, function visit(node) {
  if (ts.isClassDeclaration(node)) {
    visitClassDeclaration(node);
  }
  ts.forEachChild(node, visit);
});
```

---

## 2 — Generic decorator detection

> Detect any decorator by name or check for any decorators on a node.

```ts
import { isDecorator, getDecorators } from '@push-based/typescript-ast-utils';
import * as ts from 'typescript';

const sourceCode = `
@Injectable()
@Component({
  selector: 'app-service'
})
@CustomDecorator('config')
export class ServiceComponent {}
`;

const sourceFile = ts.createSourceFile(
  'service.ts',
  sourceCode,
  ts.ScriptTarget.Latest
);

function analyzeDecorators(node: ts.ClassDeclaration) {
  const decorators = getDecorators(node);

  console.log(`Found ${decorators.length} decorators`); // → 'Found 3 decorators'

  for (const decorator of decorators) {
    // Check for specific decorators
    if (isDecorator(decorator, 'Injectable')) {
      console.log('Has @Injectable decorator');
    }

    if (isDecorator(decorator, 'Component')) {
      console.log('Has @Component decorator');
    }

    if (isDecorator(decorator, 'CustomDecorator')) {
      console.log('Has @CustomDecorator decorator');
    }

    // Check if it's any valid decorator
    if (isDecorator(decorator)) {
      console.log('Found a valid decorator');
    }
  }
}

// Output:
// → 'Found 3 decorators'
// → 'Has @Injectable decorator'
// → 'Found a valid decorator'
// → 'Has @Component decorator'
// → 'Found a valid decorator'
// → 'Has @CustomDecorator decorator'
// → 'Found a valid decorator'
```

---

## 3 — Removing quotes from string literals

> Clean quoted strings from AST nodes for processing.

```ts
import { removeQuotes } from '@push-based/typescript-ast-utils';
import * as ts from 'typescript';

const sourceCode = `
const singleQuoted = 'hello world';
const doubleQuoted = "typescript utils";
const backtickQuoted = \`template string\`;
const multipleQuotes = """heavily quoted""";
`;

const sourceFile = ts.createSourceFile(
  'strings.ts',
  sourceCode,
  ts.ScriptTarget.Latest
);

function processStringLiterals(node: ts.Node) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    const originalText = node.getText(sourceFile);
    const cleanedText = removeQuotes(node, sourceFile);

    console.log(`Original: ${originalText} → Cleaned: "${cleanedText}"`);
  }
}

ts.forEachChild(sourceFile, function visit(node) {
  processStringLiterals(node);
  ts.forEachChild(node, visit);
});

// Output:
// → Original: 'hello world' → Cleaned: "hello world"
// → Original: "typescript utils" → Cleaned: "typescript utils"
// → Original: `template string` → Cleaned: "template string"
// → Original: """heavily quoted""" → Cleaned: "heavily quoted"
```

---

## 4 — Safe decorator extraction across TypeScript versions

> Handle different TypeScript compiler API versions when extracting decorators.

```ts
import { getDecorators, hasDecorators } from '@push-based/typescript-ast-utils';
import * as ts from 'typescript';

const sourceCode = `
@Deprecated()
@Component({
  selector: 'legacy-component'
})
export class LegacyComponent {
  @Input() data: string;
  
  @Output() change = new EventEmitter();
}
`;

const sourceFile = ts.createSourceFile(
  'legacy.ts',
  sourceCode,
  ts.ScriptTarget.Latest
);

function safelyExtractDecorators(node: ts.Node) {
  // Safe extraction that works across TypeScript versions
  const decorators = getDecorators(node);

  if (decorators.length > 0) {
    console.log(`Node has ${decorators.length} decorators`);

    // Type-safe check
    if (hasDecorators(node)) {
      console.log('Confirmed: node has decorators property');
    }
  }

  return decorators;
}

// Process class and its members
ts.forEachChild(sourceFile, function visit(node) {
  if (ts.isClassDeclaration(node)) {
    console.log(`Class decorators: ${safelyExtractDecorators(node).length}`);
    // → 'Class decorators: 2'

    // Check property decorators
    for (const member of node.members) {
      if (ts.isPropertyDeclaration(member)) {
        const memberDecorators = safelyExtractDecorators(member);
        if (memberDecorators.length > 0) {
          console.log(
            `Property "${member.name?.getText(sourceFile)}" has ${
              memberDecorators.length
            } decorators`
          );
          // → 'Property "data" has 1 decorators'
          // → 'Property "change" has 1 decorators'
        }
      }
    }
  }

  ts.forEachChild(node, visit);
});
```

---

## 5 — Building a decorator analyzer tool

> Create a comprehensive tool to analyze all decorators in a TypeScript file.

```ts
import {
  getDecorators,
  isDecorator,
  isComponentDecorator,
  removeQuotes,
} from '@push-based/typescript-ast-utils';
import * as ts from 'typescript';

interface DecoratorInfo {
  name: string;
  target: string;
  arguments: string[];
  line: number;
}

class DecoratorAnalyzer {
  private decorators: DecoratorInfo[] = [];

  analyze(
    sourceCode: string,
    fileName: string = 'analysis.ts'
  ): DecoratorInfo[] {
    const sourceFile = ts.createSourceFile(
      fileName,
      sourceCode,
      ts.ScriptTarget.Latest
    );
    this.decorators = [];

    this.visitNode(sourceFile, sourceFile);
    return this.decorators;
  }

  private visitNode(node: ts.Node, sourceFile: ts.SourceFile) {
    const decorators = getDecorators(node);

    if (decorators.length > 0) {
      const targetName = this.getTargetName(node, sourceFile);

      for (const decorator of decorators) {
        const decoratorInfo = this.extractDecoratorInfo(
          decorator,
          targetName,
          sourceFile
        );
        if (decoratorInfo) {
          this.decorators.push(decoratorInfo);
        }
      }
    }

    ts.forEachChild(node, (child) => this.visitNode(child, sourceFile));
  }

  private extractDecoratorInfo(
    decorator: ts.Decorator,
    targetName: string,
    sourceFile: ts.SourceFile
  ): DecoratorInfo | null {
    if (!isDecorator(decorator)) return null;

    const expression = decorator.expression;
    let name = '';
    const args: string[] = [];

    if (ts.isIdentifier(expression)) {
      name = expression.text;
    } else if (
      ts.isCallExpression(expression) &&
      ts.isIdentifier(expression.expression)
    ) {
      name = expression.expression.text;

      // Extract arguments
      for (const arg of expression.arguments) {
        if (ts.isStringLiteral(arg)) {
          args.push(removeQuotes(arg, sourceFile));
        } else {
          args.push(arg.getText(sourceFile));
        }
      }
    }

    const line =
      sourceFile.getLineAndCharacterOfPosition(decorator.getStart()).line + 1;

    return {
      name,
      target: targetName,
      arguments: args,
      line,
    };
  }

  private getTargetName(node: ts.Node, sourceFile: ts.SourceFile): string {
    if (ts.isClassDeclaration(node) && node.name) {
      return `class ${node.name.text}`;
    }
    if (ts.isPropertyDeclaration(node) && node.name) {
      return `property ${node.name.getText(sourceFile)}`;
    }
    if (ts.isMethodDeclaration(node) && node.name) {
      return `method ${node.name.getText(sourceFile)}`;
    }
    return 'unknown';
  }
}

// Usage example
const analyzer = new DecoratorAnalyzer();
const sourceCode = `
@Component({
  selector: 'app-example',
  template: '<div>Example</div>'
})
export class ExampleComponent {
  @Input('inputAlias') data: string;
  
  @Output() change = new EventEmitter();
  
  @HostListener('click', ['$event'])
  onClick(event: Event) {}
}
`;

const results = analyzer.analyze(sourceCode);
results.forEach((info) => {
  console.log(`Line ${info.line}: @${info.name} on ${info.target}`);
  if (info.arguments.length > 0) {
    console.log(`  Arguments: ${info.arguments.join(', ')}`);
  }
});

// Output:
// → Line 1: @Component on class ExampleComponent
// →   Arguments: { selector: 'app-example', template: '<div>Example</div>' }
// → Line 6: @Input on property data
// →   Arguments: inputAlias
// → Line 8: @Output on property change
// → Line 10: @HostListener on method onClick
// →   Arguments: click, ['$event']
```

---

## 6 — Error handling and edge cases

> Handle malformed decorators and edge cases gracefully.

```ts
import { getDecorators, isDecorator } from '@push-based/typescript-ast-utils';
import * as ts from 'typescript';

const problematicCode = `
// Valid decorator
@Component()
export class ValidComponent {}

// Malformed decorator (will be handled gracefully)
@
export class MalformedDecorator {}

// Complex decorator expression
@NgModule({
  imports: [CommonModule],
  declarations: [SomeComponent]
})
export class ComplexModule {}
`;

function safeDecoratorAnalysis(sourceCode: string) {
  try {
    const sourceFile = ts.createSourceFile(
      'test.ts',
      sourceCode,
      ts.ScriptTarget.Latest
    );

    ts.forEachChild(sourceFile, function visit(node) {
      if (ts.isClassDeclaration(node)) {
        const decorators = getDecorators(node);

        console.log(`Analyzing class: ${node.name?.text || 'anonymous'}`);
        console.log(`Found ${decorators.length} decorators`);

        for (const decorator of decorators) {
          try {
            if (isDecorator(decorator)) {
              console.log('✓ Valid decorator found');
            } else {
              console.log('✗ Invalid decorator structure');
            }
          } catch (error) {
            console.log(`⚠ Error processing decorator: ${error}`);
          }
        }

        console.log('---');
      }

      ts.forEachChild(node, visit);
    });
  } catch (error) {
    console.error('Failed to parse source code:', error);
  }
}

safeDecoratorAnalysis(problematicCode);

// Output:
// → Analyzing class: ValidComponent
// → Found 1 decorators
// → ✓ Valid decorator found
// → ---
// → Analyzing class: MalformedDecorator
// → Found 0 decorators
// → ---
// → Analyzing class: ComplexModule
// → Found 1 decorators
// → ✓ Valid decorator found
// → ---
```

These examples demonstrate the comprehensive capabilities and practical usage patterns of the `@push-based/typescript-ast-utils` library for TypeScript AST analysis, decorator processing, and source code manipulation.
