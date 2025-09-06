import { readFileSync, existsSync } from 'fs';
import { ComponentContract } from '../../shared/models/types.js';
import type {
  ContractQuery,
  QueryResult,
  ContractSection,
  SearchResult,
} from '../models/types.js';

/**
 * Execute a query against a component contract with section filtering
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

  return queryContractWithSections(contract, query);
}

/**
 * Query a component contract with section filtering
 */
function queryContractWithSections(
  contract: ComponentContract,
  query: ContractQuery,
): QueryResult {
  const sections = query.sections && query.sections.length > 0 
    ? query.sections 
    : ['meta', 'publicApi', 'dom', 'styles'] as ContractSection[];

  const filteredContract = filterContractBySections(contract, sections);
  
  const searchResults = performSearch(filteredContract, query.query, sections);

  return {
    query,
    results: searchResults,
    count: Array.isArray(searchResults) ? searchResults.length : 1,
    summary: generateSummary(query.query, searchResults, sections),
    sectionsSearched: sections,
  };
}

/**
 * Filter contract to only include specified sections
 */
function filterContractBySections(
  contract: ComponentContract,
  sections: ContractSection[],
): Partial<ComponentContract> {
  const filtered: Partial<ComponentContract> = {};
  
  if (sections.includes('meta')) {
    filtered.meta = contract.meta;
  }
  if (sections.includes('publicApi')) {
    filtered.publicApi = contract.publicApi;
  }
  if (sections.includes('dom')) {
    filtered.dom = contract.dom;
  }
  if (sections.includes('styles')) {
    filtered.styles = contract.styles;
  }
  
  return filtered;
}

/**
 * Perform search across filtered contract sections
 */
function performSearch(
  contract: Partial<ComponentContract>,
  searchQuery: string,
  sections: ContractSection[],
): SearchResult[] {
  const searchTerm = searchQuery.toLowerCase();
  const results: SearchResult[] = [];

  function searchObject(obj: unknown, path = '', section = '') {
    if (typeof obj === 'string' && obj.toLowerCase().includes(searchTerm)) {
      results.push({ path, value: obj, type: 'string', section });
    } else if (typeof obj === 'object' && obj !== null) {
      Object.entries(obj).forEach(([key, value]) => {
        const newPath = path ? `${path}.${key}` : key;
        if (key.toLowerCase().includes(searchTerm)) {
          results.push({ path: newPath, value, type: 'key', section });
        }
        searchObject(value, newPath, section);
      });
    }
  }

  sections.forEach(section => {
    if (contract[section]) {
      searchObject(contract[section], section, section);
    }
  });

  return results.slice(0, 100);
}


/**
 * Generate summary for search results
 */
function generateSummary(
  searchQuery: string,
  results: SearchResult[] | unknown,
  sections: ContractSection[],
): string {
  const resultsArray = Array.isArray(results) ? results : [results];
  const count = resultsArray.length;
  const sectionsText = sections.length === 4 ? 'all sections' : sections.join(', ');
  
  if (count === 0) {
    return `No matches found for "${searchQuery}" in ${sectionsText}`;
  }
  
  const sectionBreakdown = sections.map(section => {
    const sectionCount = resultsArray.filter(r => (r as SearchResult).section === section).length;
    return sectionCount > 0 ? `${section}(${sectionCount})` : null;
  }).filter(Boolean).join(', ');
  
  return `Found ${count} matches for "${searchQuery}" in ${sectionsText}${sectionBreakdown ? ` - ${sectionBreakdown}` : ''}`;
}