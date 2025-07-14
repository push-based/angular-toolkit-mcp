/**
 * Utility functions for contract listing and file operations
 */

import type { ContractFileInfo } from '../models/types.js';

/**
 * Extracts component name from contract filename
 * Handles pattern: componentName-timestamp.contract.json
 */
export function extractComponentNameFromFile(fileName: string): string {
  const baseName = fileName.replace('.contract.json', '');
  const parts = baseName.split('-');

  if (parts.length > 2) {
    let timestampStartIndex = -1;
    for (let i = 1; i < parts.length; i++) {
      if (/^\d{4}$/.test(parts[i])) {
        timestampStartIndex = i;
        break;
      }
    }

    if (timestampStartIndex > 0) {
      return parts.slice(0, timestampStartIndex).join('-');
    }
  }

  return parts[0] || 'unknown';
}

/**
 * Formats byte size into human-readable format
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Converts timestamp to human-readable "time ago" format
 */
export function getTimeAgo(timestamp: string): string {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now.getTime() - past.getTime();

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return past.toLocaleDateString();
}

/**
 * Groups contracts by component name and formats them for display output
 */
export function formatContractsByComponent(
  contracts: ContractFileInfo[],
): string[] {
  const output: string[] = [];

  const contractsByComponent = new Map<string, ContractFileInfo[]>();
  contracts.forEach((contract) => {
    const componentContracts =
      contractsByComponent.get(contract.componentName) || [];
    componentContracts.push(contract);
    contractsByComponent.set(contract.componentName, componentContracts);
  });

  contractsByComponent.forEach((componentContracts, componentName) => {
    output.push(`🎯 ${componentName}:`);

    componentContracts.forEach((contract) => {
      const timeAgo = getTimeAgo(contract.timestamp);
      output.push(`   📄 ${contract.fileName}`);
      output.push(`      🔗 ${contract.filePath}`);
      output.push(`      ⏱️  ${timeAgo}`);
      output.push(`      🔑 ${contract.hash.substring(0, 12)}...`);
      output.push(`      📊 ${contract.size}`);
    });

    output.push('');
  });

  return output;
}
