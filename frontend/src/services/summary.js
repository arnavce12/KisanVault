import { apiClient } from './apiClient';
import { mockSummaryData } from '@/lib/mockData';

export const summaryService = {
  getSeason: async (seasonId) => {
    try {
      return await apiClient(`/summary/season${seasonId ? `?id=${seasonId}` : ''}`);
    } catch {
      return mockSummaryData;
    }
  },
  getField: async (fieldId) => {
    try {
      return await apiClient(`/summary/field?id=${fieldId}`);
    } catch {
      return mockSummaryData;
    }
  },
  getCrop: async (cropId) => {
    try {
      return await apiClient(`/summary/crop?id=${cropId}`);
    } catch {
      return mockSummaryData;
    }
  }
};
