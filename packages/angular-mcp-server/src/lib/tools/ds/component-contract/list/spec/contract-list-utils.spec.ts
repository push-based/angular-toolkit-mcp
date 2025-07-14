/* eslint-disable prefer-const */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import {
  extractComponentNameFromFile,
  formatBytes,
  getTimeAgo,
  formatContractsByComponent,
} from '../utils/contract-list-utils.js';

import type { ContractFileInfo } from '../models/types.js';

function advanceSystemTimeTo(fixed: Date) {
  vi.useFakeTimers();
  vi.setSystemTime(fixed);
}

function restoreSystemTime() {
  vi.useRealTimers();
}

describe('contract-list-utils', () => {
  afterEach(() => {
    restoreSystemTime();
  });

  describe('extractComponentNameFromFile', () => {
    it('extracts simple component names', () => {
      expect(
        extractComponentNameFromFile('foo-20240208T123456.contract.json'),
      ).toBe('foo');
      expect(extractComponentNameFromFile('bar.contract.json')).toBe('bar');
    });

    it('handles multi-part component names', () => {
      const file = 'my-super-button-20240208T123456.contract.json';
      expect(extractComponentNameFromFile(file)).toBe('my');
    });
  });

  describe('formatBytes', () => {
    it('formats bytes into readable units', () => {
      expect(formatBytes(0)).toBe('0 B');
      expect(formatBytes(512)).toBe('512 B');
      expect(formatBytes(2048)).toBe('2 KB');
      expect(formatBytes(1024 * 1024)).toBe('1 MB');
    });
  });

  describe('getTimeAgo', () => {
    beforeEach(() => {
      advanceSystemTimeTo(new Date('2024-02-10T12:00:00Z'));
    });

    it('returns minutes ago for <1h', () => {
      const ts = new Date('2024-02-10T11:45:00Z').toISOString();
      expect(getTimeAgo(ts)).toBe('15m ago');
    });

    it('returns hours ago for <24h', () => {
      const ts = new Date('2024-02-10T08:00:00Z').toISOString();
      expect(getTimeAgo(ts)).toBe('4h ago');
    });

    it('returns days ago for <7d', () => {
      const ts = new Date('2024-02-07T12:00:00Z').toISOString();
      expect(getTimeAgo(ts)).toBe('3d ago');
    });

    it('returns locale date for older timestamps', () => {
      const ts = new Date('2023-12-25T00:00:00Z').toISOString();
      expect(getTimeAgo(ts)).toContain('2023');
    });
  });

  describe('formatContractsByComponent', () => {
    beforeEach(() => {
      advanceSystemTimeTo(new Date('2024-02-10T12:00:00Z'));
    });

    it('groups contracts by component and formats output', () => {
      const contracts: ContractFileInfo[] = [
        {
          fileName: 'foo-20240210T090000.contract.json',
          filePath: '/contracts/foo-20240210T090000.contract.json',
          componentName: 'foo',
          timestamp: new Date('2024-02-10T09:00:00Z').toISOString(),
          hash: 'abcdef1234567890',
          size: '5 KB',
        },
        {
          fileName: 'foo-20240209T090000.contract.json',
          filePath: '/contracts/foo-20240209T090000.contract.json',
          componentName: 'foo',
          timestamp: new Date('2024-02-09T09:00:00Z').toISOString(),
          hash: '123456abcdef7890',
          size: '4 KB',
        },
        {
          fileName: 'bar-20240210T090000.contract.json',
          filePath: '/contracts/bar-20240210T090000.contract.json',
          componentName: 'bar',
          timestamp: new Date('2024-02-10T09:00:00Z').toISOString(),
          hash: 'fedcba9876543210',
          size: '6 KB',
        },
      ];

      const output = formatContractsByComponent(contracts);

      expect(output).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/^🎯 foo:/),
          expect.stringMatching(/^🎯 bar:/),
        ]),
      );

      expect(output).toEqual(
        expect.arrayContaining([
          expect.stringContaining('foo-20240210T090000.contract.json'),
          expect.stringContaining('bar-20240210T090000.contract.json'),
        ]),
      );
    });
  });
});
