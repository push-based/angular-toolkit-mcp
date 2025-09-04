import { readFileSync, existsSync } from 'fs';
import { ComponentContract } from '../../shared/models/types.js';
import type {
  ContractQuery,
  QueryResult,
  ComponentOverview,
  InputProperty,
  OutputEvent,
  MethodInfo,
  EventHandler,
  DomElement,
  StyleRule,
  ImportInfo,
  SearchResult,
} from '../models/types.js';

/**
 * Execute a query against a component contract
 */
export async function executeContractQuery(
  contractPath: string,
  query: ContractQuery,
): Promise<QueryResult> {
  if (!existsSync(contractPath)) {
    throw new Error(`Contract file not found: ${contractPath}`);
  }

  const contractData = JSON.parse(readFileSync(contractPath, 'utf-8'));
  const contract: ComponentContract = contractData.contract || contractData;

  return queryContract(contract, query);
}

/**
 * Query a component contract based on the query type
 */
function queryContract(
  contract: ComponentContract,
  query: ContractQuery,
): QueryResult {
  switch (query.type) {
    case 'overview':
      return queryOverview(contract, query);
    case 'inputs':
      return queryInputs(contract, query);
    case 'outputs':
      return queryOutputs(contract, query);
    case 'methods':
      return queryMethods(contract, query);
    case 'events':
      return queryEvents(contract, query);
    case 'dom':
      return queryDOM(contract, query);
    case 'styles':
      return queryStyles(contract, query);
    case 'imports':
      return queryImports(contract, query);
    case 'search':
      return querySearch(contract, query);
    case 'custom':
      return queryCustom(contract, query);
    default:
      throw new Error(`Unsupported query type: ${query.type}`);
  }
}

/**
 * Get component overview with metadata and statistics
 */
function queryOverview(
  contract: ComponentContract,
  query: ContractQuery,
): QueryResult {
  const meta = contract.meta || {};
  const publicApi = contract.publicApi || {};
  const dom = contract.dom || {};
  const styles = contract.styles || {};

  const overview: ComponentOverview = {
    component: {
      name: meta.name || 'Unknown',
      selector: meta.selector || 'Unknown',
      templateType: meta.templateType || 'Unknown',
      sourceFile: meta.sourceFile || 'Unknown',
    },
    publicApi: {
      inputCount: Object.keys(publicApi.properties || {}).filter(
        (key) => publicApi.properties?.[key]?.isInput,
      ).length,
      outputCount: Object.keys(publicApi.events || {}).length,
      methodCount: Object.keys(publicApi.methods || {}).length,
      lifecycleHooks: publicApi.lifecycle || [],
      importCount: (publicApi.imports || []).length,
    },
    structure: {
      domElementCount: Object.keys(dom).length,
      styleRuleCount: Object.keys(styles.rules || {}).length,
    },
    metadata: {
      generatedAt: meta.generatedAt || 'Unknown',
      hash: meta.hash || 'Unknown',
    },
  };

  return {
    query,
    results: overview,
    summary: `Component: ${meta.name} with ${overview.publicApi.inputCount} inputs, ${overview.publicApi.outputCount} outputs, ${overview.structure.domElementCount} DOM elements`,
  };
}

/**
 * Query input properties
 */
function queryInputs(
  contract: ComponentContract,
  query: ContractQuery,
): QueryResult {
  const properties = contract.publicApi?.properties || {};
  let inputs = Object.entries(properties)
    .filter(([, prop]) => prop.isInput)
    .map(([name, prop]): InputProperty => ({
      name,
      type: prop.type || 'unknown',
      required: prop.required || false,
      isInput: prop.isInput || false,
    }));

  if (query.filter === 'required') {
    inputs = inputs.filter((input) => input.required);
  }

  return {
    query,
    results: inputs,
    count: inputs.length,
    summary: `Found ${inputs.length} input properties`,
  };
}

/**
 * Query output events
 */
function queryOutputs(
  contract: ComponentContract,
  query: ContractQuery,
): QueryResult {
  const events = contract.publicApi?.events || {};
  const outputs = Object.entries(events).map(([name, event]): OutputEvent => ({
    name,
    type: event.type || 'unknown',
  }));

  return {
    query,
    results: outputs,
    count: outputs.length,
    summary: `Found ${outputs.length} output events`,
  };
}

/**
 * Query public methods
 */
function queryMethods(
  contract: ComponentContract,
  query: ContractQuery,
): QueryResult {
  const methods = contract.publicApi?.methods || {};
  let methodList = Object.entries(methods).map(([name, method]): MethodInfo => ({
    name,
    parameters: method.parameters || [],
    returnType: method.returnType || 'unknown',
    isPublic: method.isPublic || false,
    isAsync: method.isAsync || false,
    signature: buildMethodSignature(name, method),
  }));

  if (query.filter === 'public') {
    methodList = methodList.filter((method) => method.isPublic);
  }

  return {
    query,
    results: methodList,
    count: methodList.length,
    summary: `Found ${methodList.length} methods`,
  };
}

/**
 * Query event handlers in the template
 */
function queryEvents(
  contract: ComponentContract,
  query: ContractQuery,
): QueryResult {
  const dom = contract.dom || {};
  const events: EventHandler[] = [];

  Object.entries(dom).forEach(([elementPath, element]) => {
    if (element.events && element.events.length > 0) {
      element.events.forEach((event) => {
        events.push({
          element: elementPath,
          eventName: event.name || 'unknown',
          handler: event.handler || 'unknown',
          tag: element.tag || 'unknown',
        });
      });
    }
  });

  return {
    query,
    results: events,
    count: events.length,
    summary: `Found ${events.length} event handlers`,
  };
}

/**
 * Query DOM elements with optional CSS-like selectors
 */
function queryDOM(contract: ComponentContract, query: ContractQuery): QueryResult {
  const dom = contract.dom || {};
  let elements = Object.entries(dom).map(([path, element]): DomElement => ({
    path,
    tag: element.tag || 'unknown',
    attributes: element.attributes || [],
    events: element.events || [],
    bindings: element.bindings || [],
    structural: element.structural || [],
    children: element.children || [],
  }));

  // Apply CSS-like selector filtering
  if (query.query) {
    elements = elements.filter((element) =>
      matchesSelector(element, query.query as string),
    );
  }

  return {
    query,
    results: elements,
    count: elements.length,
    summary: `Found ${elements.length} DOM elements${
      query.query ? ` matching "${query.query}"` : ''
    }`,
  };
}

/**
 * Query CSS style rules
 */
function queryStyles(
  contract: ComponentContract,
  query: ContractQuery,
): QueryResult {
  const styles = contract.styles?.rules || {};
  let styleRules = Object.entries(styles).map(([selector, rule]): StyleRule => ({
    selector,
    properties: rule.properties || {},
    appliesTo: rule.appliesTo || [],
  }));

  if (query.query) {
    const searchTerm = query.query.toLowerCase();
    styleRules = styleRules.filter(
      (rule) =>
        rule.selector.toLowerCase().includes(searchTerm) ||
        Object.keys(rule.properties).some((prop) =>
          prop.toLowerCase().includes(searchTerm),
        ) ||
        Object.values(rule.properties).some((value) =>
          String(value).toLowerCase().includes(searchTerm),
        ),
    );
  }

  return {
    query,
    results: styleRules,
    count: styleRules.length,
    summary: `Found ${styleRules.length} CSS rules${
      query.query ? ` matching "${query.query}"` : ''
    }`,
  };
}

/**
 * Query imports
 */
function queryImports(
  contract: ComponentContract,
  query: ContractQuery,
): QueryResult {
  const imports = contract.publicApi?.imports || [];
  let importList = imports.map((imp): ImportInfo => ({
    name: imp.name || 'unknown',
    path: imp.path || 'unknown',
    type: categorizeImport(imp.path || ''),
  }));

  if (query.filter) {
    const filterType = query.filter.toLowerCase();
    importList = importList.filter((imp) => imp.type === filterType);
  }

  return {
    query,
    results: importList,
    count: importList.length,
    summary: `Found ${importList.length} imports`,
  };
}

/**
 * Full-text search across the contract
 */
function querySearch(
  contract: ComponentContract,
  query: ContractQuery,
): QueryResult {
  if (!query.query) {
    return { query, results: [], summary: 'No search term provided' };
  }

  const searchTerm = query.query.toLowerCase();
  const results: SearchResult[] = [];

  function searchObject(obj: unknown, path = '') {
    if (typeof obj === 'string' && obj.toLowerCase().includes(searchTerm)) {
      results.push({ path, value: obj, type: 'string' });
    } else if (typeof obj === 'object' && obj !== null) {
      Object.entries(obj).forEach(([key, value]) => {
        const newPath = path ? `${path}.${key}` : key;
        if (key.toLowerCase().includes(searchTerm)) {
          results.push({ path: newPath, value, type: 'key' });
        }
        searchObject(value, newPath);
      });
    }
  }

  searchObject(contract);

  return {
    query,
    results: results.slice(0, 50), // Limit results
    count: results.length,
    summary: `Found ${results.length} matches for "${query.query}"`,
  };
}

/**
 * Custom JSONPath-like queries
 */
function queryCustom(
  contract: ComponentContract,
  query: ContractQuery,
): QueryResult {
  if (!query.query) {
    return { query, results: [], summary: 'No JSONPath query provided' };
  }

  try {
    // Simple JSONPath-like evaluation (basic implementation)
    const result = evaluateJSONPath(contract, query.query);

    return {
      query,
      results: result,
      count: Array.isArray(result) ? result.length : 1,
      summary: `JSONPath query executed: ${query.query}`,
    };
  } catch (ctx) {
    return {
      query,
      results: [],
      summary: `JSONPath query failed: ${ctx}`,
    };
  }
}

// Helper functions

/**
 * Build method signature string
 */
function buildMethodSignature(name: string, method: unknown): string {
  const methodObj = method as {
    parameters?: Array<{ name: string; type: string; optional: boolean }>;
    returnType?: string;
  };
  
  const params = (methodObj.parameters || [])
    .map((p) => `${p.name}${p.optional ? '?' : ''}: ${p.type}`)
    .join(', ');
  return `${name}(${params}): ${methodObj.returnType || 'unknown'}`;
}

/**
 * Check if a DOM element matches a CSS-like selector
 */
function matchesSelector(element: DomElement, selector: string): boolean {
  // Basic CSS selector matching
  if (selector.startsWith('.')) {
    // Class selector
    const className = selector.slice(1);
    return element.attributes.some(
      (attr) =>
        (attr as { name: string; source?: string }).name === 'class' &&
        (attr as { source?: string }).source?.includes(className),
    );
  } else if (selector.startsWith('[') && selector.endsWith(']')) {
    // Attribute selector
    const attrName = selector.slice(1, -1);
    return (
      element.attributes.some(
        (attr) => (attr as { name: string }).name === attrName,
      ) ||
      element.events.some(
        (event) => (event as { name: string }).name === attrName,
      ) ||
      element.bindings.some(
        (binding) => (binding as { name: string }).name === attrName,
      )
    );
  } else {
    // Tag selector
    return element.tag === selector;
  }
}

/**
 * Categorize import by path
 */
function categorizeImport(path: string): string {
  if (path.startsWith('@angular/')) return 'angular';
  if (path.startsWith('./') || path.startsWith('../')) return 'local';
  if (path.includes('node_modules') || !path.startsWith('.')) return 'external';
  return 'unknown';
}

/**
 * Basic JSONPath implementation
 */
function evaluateJSONPath(obj: unknown, path: string): unknown {
  // Basic JSONPath implementation - supports simple dot notation and array access
  const parts = path.replace(/^\$\.?/, '').split('.');
  let result: unknown = obj;

  for (const part of parts) {
    if (part === '*') {
      if (typeof result === 'object' && result !== null) {
        result = Object.values(result);
      }
    } else if (part.includes('[') && part.includes(']')) {
      const [key, index] = part.split('[');
      const indexNum = parseInt(index.replace(']', ''));
      const keyResult = (result as Record<string, unknown>)?.[key];
      if (Array.isArray(keyResult)) {
        result = keyResult[indexNum];
      } else {
        result = undefined;
      }
    } else {
      result = (result as Record<string, unknown>)?.[part];
    }
  }

  return result;
}
