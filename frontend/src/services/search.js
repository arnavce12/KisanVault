import { apiClient } from './apiClient';
import { mockSearchResponse } from '@/lib/mockData';

export const searchService = {
  query: async (question) => {
    try {
      return await apiClient('/search/query', { method: 'POST', body: { query: question } });
    } catch {
      return new Promise(resolve => setTimeout(() => resolve(mockSearchResponse), 1500));
    }
  }
};
