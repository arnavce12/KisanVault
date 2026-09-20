import { apiClient, toBackend, toFrontend } from './apiClient';

export const recordsService = {
  getFields: async () => {
    // Returns list of strings
    const data = await apiClient('/records/fields');
    return data;
  },
  getCrops: async (fieldName) => {
    // Returns list of strings
    const data = await apiClient(`/records/crops?field=${encodeURIComponent(fieldName)}`);
    return data;
  },
  getFilter: async (filters) => {
    // Clean up empty params
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== '' && v !== null && v !== undefined && v !== 'All')
    );
    const queryParams = new URLSearchParams(cleanFilters).toString();
    const data = await apiClient(`/records/filter?${queryParams}`);
    return toFrontend(data);
  },
  addRecord: async (payload) => {
    const response = await apiClient('/records/add', { method: 'POST', body: toBackend(payload) });
    return toFrontend(response);
  },
  // Timeline can just use getFilter with no params
  getTimeline: async () => {
    const data = await apiClient('/records/filter');
    return toFrontend(data);
  }
};
