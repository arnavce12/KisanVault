import { apiClient } from './apiClient';
import { mockFields, mockCrops, mockTimelineRecords } from '@/lib/mockData';

// If API is not ready, we use mock data. We wrap it in promises.

export const recordsService = {
  getFields: async () => {
    try {
      return await apiClient('/records/fields');
    } catch {
      return mockFields;
    }
  },
  getCrops: async () => {
    try {
      return await apiClient('/records/crops');
    } catch {
      return mockCrops;
    }
  },
  getTimeline: async () => {
    try {
      return await apiClient('/records/timeline');
    } catch {
      return mockTimelineRecords;
    }
  },
  getFilter: async (filters) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      return await apiClient(`/records/filter?${queryParams}`);
    } catch {
      // Mock filtering
      return mockTimelineRecords.filter(r => !filters.field_id || r.fieldId === filters.field_id);
    }
  },
  createField: async (data) => apiClient('/records/field', { method: 'POST', body: data }).catch(() => data),
  createCrop: async (data) => apiClient('/records/crop', { method: 'POST', body: data }).catch(() => data),
  createActivity: async (data) => apiClient('/records/activity', { method: 'POST', body: data }).catch(() => data),
  createExpense: async (data) => apiClient('/records/expense', { method: 'POST', body: data }).catch(() => data),
  createHarvest: async (data) => apiClient('/records/harvest', { method: 'POST', body: data }).catch(() => data),
};
