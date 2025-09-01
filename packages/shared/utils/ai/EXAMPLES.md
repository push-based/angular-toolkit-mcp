# Examples

## 1 — Process execution with real-time monitoring

> Execute commands with live output streaming and error handling.

```ts
import { executeProcess, ProcessObserver } from '@push-based/utils';

// Create an observer to handle process events
const observer: ProcessObserver = {
  onStdout: (data) => {
    console.log(`📤 ${data.trim()}`);
  },
  onStderr: (data) => {
    console.error(`❌ ${data.trim()}`);
  },
  onError: (error) => {
    console.error(`Process failed with code ${error.code}`);
  },
  onComplete: () => {
    console.log('✅ Process completed successfully');
  },
};

// Execute a Node.js command
const result = await executeProcess({
  command: 'node',
  args: ['--version'],
  observer,
});

console.log(`Exit code: ${result.code}`);
console.log(`Duration: ${result.duration}ms`);
console.log(`Output: ${result.stdout.trim()}`);

// Output:
// → 📤 v18.17.0
// → ✅ Process completed successfully
// → Exit code: 0
// → Duration: 45ms
// → Output: v18.17.0
```

---

## 2 — File pattern searching and processing

> Search for files containing specific patterns and process the results.

```ts
import {
  findFilesWithPattern,
  findInFile,
  resolveFileCached,
} from '@push-based/utils';

// Find all TypeScript files containing 'Component'
const componentFiles = await findFilesWithPattern('./src', 'Component');

console.log(`Found ${componentFiles.length} files with 'Component':`);
componentFiles.forEach((file) => console.log(`  - ${file}`));

// Get detailed information about matches in a specific file
if (componentFiles.length > 0) {
  const firstFile = componentFiles[0];
  const matches = await findInFile(firstFile, 'Component');

  console.log(`\nDetailed matches in ${firstFile}:`);
  matches.forEach((match) => {
    console.log(
      `  Line ${match.position.startLine}, Column ${match.position.startColumn}`
    );
  });

  // Load and cache the file content
  const content = await resolveFileCached(firstFile);
  console.log(`File size: ${content.length} characters`);

  // Subsequent calls will use cached version
  const cachedContent = await resolveFileCached(firstFile); // ⚡ Fast cached access
}

// Output:
// → Found 3 files with 'Component':
// →   - ./src/app/user.component.ts
// →   - ./src/app/admin.component.ts
// →   - ./src/shared/base.component.ts
// →
// → Detailed matches in ./src/app/user.component.ts:
// →   Line 5, Column 14
// →   Line 12, Column 25
// → File size: 1247 characters
```

---

## 3 — Command formatting and logging

> Format commands with colors and context for better development experience.

```ts
import { formatCommandLog, isVerbose, calcDuration } from '@push-based/utils';

// Set verbose mode for demonstration
process.env['NG_MCP_VERBOSE'] = 'true';

// Format commands with different contexts
const commands = [
  { cmd: 'npm', args: ['install'], cwd: undefined },
  { cmd: 'npx', args: ['eslint', '--fix', 'src/'], cwd: './packages/app' },
  { cmd: 'node', args: ['build.js', '--prod'], cwd: '../tools' },
  {
    cmd: 'git',
    args: ['commit', '-m', 'feat: add new feature'],
    cwd: process.cwd(),
  },
];

console.log('Formatted commands:');
commands.forEach(({ cmd, args, cwd }) => {
  const formatted = formatCommandLog(cmd, args, cwd);
  console.log(formatted);
});

// Performance timing example
async function timedOperation() {
  const start = performance.now();

  // Simulate some work
  await new Promise((resolve) => setTimeout(resolve, 150));

  const duration = calcDuration(start);
  console.log(`Operation completed in ${duration}ms`);
}

// Verbose logging check
if (isVerbose()) {
  console.log('🔍 Verbose logging is enabled');
  await timedOperation();
} else {
  console.log('🔇 Verbose logging is disabled');
}

// Output (with ANSI colors in terminal):
// → Formatted commands:
// → $ npm install
// → packages/app $ npx eslint --fix src/
// → .. $ node build.js --prod
// → $ git commit -m feat: add new feature
// → 🔍 Verbose logging is enabled
// → Operation completed in 152ms
```

---

## 4 — CLI argument generation

> Convert objects to command-line arguments for process execution.

```ts
import { objectToCliArgs, executeProcess } from '@push-based/utils';

// Simple configuration object
const config = {
  _: ['npx', 'eslint'], // Command and base args
  fix: true, // Boolean flag
  format: 'json', // String value
  ext: ['.ts', '.js'], // Array values
  'max-warnings': 0, // Numeric value
  quiet: false, // Negative boolean
};

const args = objectToCliArgs(config);
console.log('Generated CLI args:');
args.forEach((arg) => console.log(`  ${arg}`));

// Use the generated arguments in process execution
const result = await executeProcess({
  command: args[0], // 'npx'
  args: args.slice(1), // Everything after the command
});

// Output:
// → Generated CLI args:
// →   npx
// →   eslint
// →   --fix
// →   --format="json"
// →   --ext=".ts"
// →   --ext=".js"
// →   --max-warnings=0
// →   --no-quiet

// Complex nested configuration
const complexConfig = {
  _: ['node', 'build.js'],
  output: {
    path: './dist',
    format: 'esm',
  },
  optimization: {
    minify: true,
    'tree-shake': true,
  },
};

const complexArgs = objectToCliArgs(complexConfig);
console.log('\nComplex nested args:');
complexArgs.forEach((arg) => console.log(`  ${arg}`));

// Output:
// → Complex nested args:
// →   node
// →   build.js
// →   --output.path="./dist"
// →   --output.format="esm"
// →   --optimization.minify
// →   --optimization.tree-shake
```

---

## 5 — Error handling and process management

> Handle process errors gracefully with comprehensive error information.

```ts
import { executeProcess, ProcessError } from '@push-based/utils';

async function robustProcessExecution() {
  const commands = [
    { command: 'node', args: ['--version'] }, // ✅ Should succeed
    { command: 'nonexistent-command', args: [] }, // ❌ Should fail
    { command: 'node', args: ['-e', 'process.exit(1)'] }, // ❌ Should fail with exit code 1
  ];

  for (const config of commands) {
    try {
      console.log(
        `\n🚀 Executing: ${config.command} ${config.args?.join(' ') || ''}`
      );

      const result = await executeProcess({
        ...config,
        observer: {
          onStdout: (data) => console.log(`  📤 ${data.trim()}`),
          onStderr: (data) => console.error(`  ❌ ${data.trim()}`),
          onComplete: () => console.log('  ✅ Process completed'),
        },
      });

      console.log(
        `  ✅ Success! Exit code: ${result.code}, Duration: ${result.duration}ms`
      );
    } catch (error) {
      if (error instanceof ProcessError) {
        console.error(`  ❌ Process failed:`);
        console.error(`     Exit code: ${error.code}`);
        console.error(
          `     Error output: ${error.stderr.trim() || 'No stderr'}`
        );
        console.error(
          `     Standard output: ${error.stdout.trim() || 'No stdout'}`
        );
      } else {
        console.error(`  ❌ Unexpected error: ${error}`);
      }
    }
  }

  // Example with ignoreExitCode option
  console.log('\n🔄 Executing command with ignoreExitCode=true:');
  try {
    const result = await executeProcess({
      command: 'node',
      args: ['-e', 'console.log("Hello"); process.exit(1)'],
      ignoreExitCode: true,
      observer: {
        onStdout: (data) => console.log(`  📤 ${data.trim()}`),
        onComplete: () =>
          console.log('  ✅ Process completed (exit code ignored)'),
      },
    });

    console.log(`  ✅ Completed with exit code ${result.code} (ignored)`);
    console.log(`  📝 Output: ${result.stdout.trim()}`);
  } catch (error) {
    console.error(`  ❌ This shouldn't happen with ignoreExitCode=true`);
  }
}

await robustProcessExecution();

// Output:
// → 🚀 Executing: node --version
// →   📤 v18.17.0
// →   ✅ Process completed
// →   ✅ Success! Exit code: 0, Duration: 42ms
// →
// → 🚀 Executing: nonexistent-command
// →   ❌ Process failed:
// →      Exit code: null
// →      Error output: spawn nonexistent-command ENOENT
// →      Standard output: No stdout
// →
// → 🚀 Executing: node -e process.exit(1)
// →   ❌ Process failed:
// →      Exit code: 1
// →      Error output: No stderr
// →      Standard output: No stdout
// →
// → 🔄 Executing command with ignoreExitCode=true:
// →   📤 Hello
// →   ✅ Process completed (exit code ignored)
// →   ✅ Completed with exit code 1 (ignored)
// →   📝 Output: Hello
```

---

## 6 — Advanced file operations with generators

> Use async generators for efficient file processing.

```ts
import {
  findAllFiles,
  accessContent,
  getLineHits,
  isExcludedDirectory,
} from '@push-based/utils';

// Custom file finder with filtering
async function findLargeTypeScriptFiles(
  baseDir: string,
  minSize: number = 1000
) {
  const largeFiles: string[] = [];

  // Use async generator to process files one by one
  for await (const file of findAllFiles(baseDir, (path) =>
    path.endsWith('.ts')
  )) {
    try {
      const stats = await fs.stat(file);
      if (stats.size > minSize) {
        largeFiles.push(file);
        console.log(`📁 Large file: ${file} (${stats.size} bytes)`);
      }
    } catch (error) {
      console.warn(`⚠️  Could not stat file: ${file}`);
    }
  }

  return largeFiles;
}

// Process file content line by line
async function analyzeFileContent(filePath: string, searchTerm: string) {
  const content = await fs.readFile(filePath, 'utf-8');
  const results = {
    totalLines: 0,
    matchingLines: 0,
    matches: [] as Array<{ line: number; hits: number; content: string }>,
  };

  // Use generator to process content efficiently
  let lineNumber = 0;
  for (const line of accessContent(content)) {
    lineNumber++;
    results.totalLines++;

    const hits = getLineHits(line, searchTerm);
    if (hits.length > 0) {
      results.matchingLines++;
      results.matches.push({
        line: lineNumber,
        hits: hits.length,
        content: line.trim(),
      });
    }
  }

  return results;
}

// Directory filtering
const directories = [
  'src',
  '.git',
  'node_modules',
  'dist',
  'coverage',
  '.vscode',
];
directories.forEach((dir) => {
  const excluded = isExcludedDirectory(dir);
  console.log(`${dir}: ${excluded ? '❌ excluded' : '✅ included'}`);
});

// Usage example
const largeFiles = await findLargeTypeScriptFiles('./src', 2000);
if (largeFiles.length > 0) {
  const analysis = await analyzeFileContent(largeFiles[0], 'export');
  console.log(`\nAnalysis of ${largeFiles[0]}:`);
  console.log(`Total lines: ${analysis.totalLines}`);
  console.log(`Lines with 'export': ${analysis.matchingLines}`);
  console.log(`First few matches:`);
  analysis.matches.slice(0, 3).forEach((match) => {
    console.log(`  Line ${match.line} (${match.hits} hits): ${match.content}`);
  });
}

// Output:
// → src: ✅ included
// → .git: ❌ excluded
// → node_modules: ❌ excluded
// → dist: ❌ excluded
// → coverage: ❌ excluded
// → .vscode: ✅ included
// → 📁 Large file: ./src/lib/utils.ts (2247 bytes)
// → 📁 Large file: ./src/lib/execute-process.ts (5043 bytes)
// →
// → Analysis of ./src/lib/utils.ts:
// → Total lines: 88
// → Lines with 'export': 5
// → First few matches:
// →   Line 2 (1 hits): export function calcDuration(start: number, stop?: number): number {
// →   Line 6 (1 hits): export function isVerbose(): boolean {
// →   Line 14 (1 hits): export function formatCommandLog(command: string, args?: string[], cwd?: string): string {
```

---

## 7 — ES Module loading and dynamic imports

> Load ES modules dynamically and extract default exports safely.

```ts
import { loadDefaultExport } from '@push-based/utils';

// Load configuration from ES module
const config = await loadDefaultExport('./config/app.config.mjs');
console.log(`API Port: ${config.port}`);

// Load with type safety
interface AppData {
  version: string;
  features: string[];
}

const appData = await loadDefaultExport<AppData>('./data/app.mjs');
console.log(`App version: ${appData.version}`);
console.log(`Features: ${appData.features.join(', ')}`);

// Handle loading errors gracefully
try {
  const plugin = await loadDefaultExport('./plugins/optional.mjs');
  console.log('✅ Plugin loaded');
} catch (error) {
  if (error.message.includes('No default export found')) {
    console.warn('⚠️  Module missing default export');
  } else {
    console.warn('⚠️  Plugin not found, continuing without it');
  }
}

// Output:
// → API Port: 3000
// → App version: 1.2.0  
// → Features: auth, logging, metrics
// → ⚠️  Plugin not found, continuing without it
```

---



These examples demonstrate the comprehensive capabilities of the `@push-based/utils` library for process execution, file operations, string manipulation, and development tooling in Node.js applications.
