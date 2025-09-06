import type { QueryResult } from '../models/types.js';

/**
 * Format query results as JSON with metadata
 */
export function formatQueryResult(result: QueryResult): string {
  const { query, results, summary, sectionsSearched } = result;

  let output = `## Query Results\n`;
  output += `**Query**: ${query.query}\n`;
  if (query.sections && query.sections.length > 0) {
    output += `**Sections**: ${query.sections.join(', ')}\n`;
  } else if (sectionsSearched) {
    output += `**Sections**: ${sectionsSearched.join(', ')}\n`;
  }
  if (summary) output += `**Summary**: ${summary}\n\n`;

  return output + `\`\`\`json\n${JSON.stringify(results, null, 2)}\n\`\`\``;
}

