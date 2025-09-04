import type { QueryResult } from '../models/types.js';

/**
 * Format query results based on the specified format
 */
export function formatQueryResult(result: QueryResult): string {
  const { query, results, summary } = result;

  let output = `## Query Results\n`;
  output += `**Query Type**: ${query.type}\n`;
  if (query.query) output += `**Query**: ${query.query}\n`;
  if (query.filter) output += `**Filter**: ${query.filter}\n`;
  if (summary) output += `**Summary**: ${summary}\n\n`;

  switch (query.format) {
    case 'table':
      return output + formatAsTable(results);
    case 'list':
      return output + formatAsList(results);
    case 'tree':
      return output + formatAsTree(results);
    case 'json':
    default:
      return output + `\`\`\`json\n${JSON.stringify(results, null, 2)}\n\`\`\``;
  }
}

/**
 * Format results as a markdown table
 */
function formatAsTable(data: unknown): string {
  if (!Array.isArray(data) || data.length === 0) {
    return 'No data to display in table format.\n';
  }

  const keys = Object.keys(data[0] as Record<string, unknown>);
  let table = `| ${keys.join(' | ')} |\n`;
  table += `| ${keys.map(() => '---').join(' | ')} |\n`;

  data.slice(0, 20).forEach((item) => {
    // Limit to 20 rows
    const values = keys.map((key) =>
      String((item as Record<string, unknown>)[key] || '')
        .replace(/\|/g, '\\|')
        .replace(/\n/g, ' '),
    );
    table += `| ${values.join(' | ')} |\n`;
  });

  if (data.length > 20) {
    table += `\n... and ${data.length - 20} more items\n`;
  }

  return table;
}

/**
 * Format results as a numbered list
 */
function formatAsList(data: unknown): string {
  if (Array.isArray(data)) {
    return data
      .map((item, index) => `${index + 1}. ${formatItem(item)}`)
      .join('\n');
  }
  return formatItem(data);
}

/**
 * Format results as a tree structure (JSON)
 */
function formatAsTree(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Format individual items for display
 */
function formatItem(item: unknown): string {
  if (typeof item === 'string') return item;
  if (typeof item === 'object' && item !== null) {
    const obj = item as Record<string, unknown>;
    if (obj.name) return String(obj.name);
    if (obj.path) return String(obj.path);
    if (obj.selector) return String(obj.selector);
    return JSON.stringify(item);
  }
  return String(item);
}
