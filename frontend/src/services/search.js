import { apiClient, toFrontend } from './apiClient';

export const searchService = {
  query: async (question) => {
    const data = await apiClient('/search/query', { method: 'POST', body: { query: question } });
    return toFrontend(data);
  }
};
