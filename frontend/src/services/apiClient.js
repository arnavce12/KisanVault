export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Helper for mapping camelCase to snake_case for Backend
export const toSnakeCase = (str) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
export const toCamelCase = (str) => str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());

const mapKeysDeep = (obj, fn) => {
  if (Array.isArray(obj)) {
    return obj.map(val => mapKeysDeep(val, fn));
  }
  if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    return Object.keys(obj).reduce((acc, key) => {
      acc[fn(key)] = mapKeysDeep(obj[key], fn);
      return acc;
    }, {});
  }
  return obj;
};

export const toBackend = (data) => mapKeysDeep(data, toSnakeCase);
export const toFrontend = (data) => mapKeysDeep(data, toCamelCase);

export async function apiClient(endpoint, { method = 'GET', body, headers = {} } = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('kisanvault_jwt') : null;
  
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401) {
        // Optional: emit event or trigger logout if 401
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('unauthorized'));
        }
      }
      throw { status: response.status, message: data.message || 'API Error', ...data };
    }
    return data;
  } catch (error) {
    console.error(`API Client Error [${method} ${endpoint}]:`, error);
    throw error;
  }
}
