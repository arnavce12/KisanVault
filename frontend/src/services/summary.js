import { apiClient, toFrontend } from './apiClient';

// Helper to flatten the backend nested stats object to match frontend UI expectations
const mapSummary = (backendData) => {
  const data = toFrontend(backendData);
  if (!data) return null;
  return {
    ...data,
    totalExpenses: data.stats?.totalExpenses || 0,
    totalRevenue: data.stats?.totalRevenue || 0,
    activityCount: data.stats?.totalActivities || 0,
  };
};

export const summaryService = {
  getSeason: async (season, fieldName, generateAi = false, lang = '') => {
    if (!fieldName) throw new Error("fieldName is required for season summary");
    const langParam = lang ? `&lang=${encodeURIComponent(lang)}` : '';
    const data = await apiClient(`/summary/season?field_name=${encodeURIComponent(fieldName)}&season=${encodeURIComponent(season || 'All')}&generate_ai=${generateAi}${langParam}`);
    return mapSummary(data);
  },
  getField: async (fieldName, generateAi = false, lang = '') => {
    const langParam = lang ? `&lang=${encodeURIComponent(lang)}` : '';
    const data = await apiClient(`/summary/field?field_name=${encodeURIComponent(fieldName)}&generate_ai=${generateAi}${langParam}`);
    return mapSummary(data);
  },
  getCrop: async (cropName, generateAi = false, lang = '') => {
    const langParam = lang ? `&lang=${encodeURIComponent(lang)}` : '';
    const data = await apiClient(`/summary/crop?crop_name=${encodeURIComponent(cropName)}&generate_ai=${generateAi}${langParam}`);
    return mapSummary(data);
  }
};
