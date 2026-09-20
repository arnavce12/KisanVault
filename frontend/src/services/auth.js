import { apiClient, BASE_URL } from './apiClient';

export const authService = {
  login: async (credentials) => {
    // credentials from UI: { identifier, password }
    // Backend expects: OAuth2 form data { username, password }
    const email = credentials.identifier.includes('@') 
      ? credentials.identifier 
      : `${credentials.identifier}@kisanvault.com`;
      
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', credentials.password);

    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw { status: response.status, message: data.message || 'API Error', ...data };
    }
    return data;
  },

  register: async (userData) => {
    // userData from UI: { name, mobile, location, password }
    // Backend expects: { name, email, password }
    const email = `${userData.mobile}@kisanvault.com`;
    
    return apiClient('/auth/register', {
      method: 'POST',
      body: { name: userData.name, email, password: userData.password },
    });
  },

  getMe: async () => {
    return apiClient('/auth/me', {
      method: 'GET',
    });
  }
};
