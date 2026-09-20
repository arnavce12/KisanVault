import { apiClient } from './apiClient';

export const authService = {
  login: async (credentials) => {
    // API contract explicitly says TBD for shape. We'll send standard fields.
    // credentials: { identifier, password }
    return apiClient('/auth/login', {
      method: 'POST',
      body: credentials,
    });
  },

  register: async (userData) => {
    // userData: { name, mobile, location, password }
    return apiClient('/auth/register', {
      method: 'POST',
      body: userData,
    });
  },

  getMe: async () => {
    return apiClient('/auth/me', {
      method: 'GET',
    });
  }
};
