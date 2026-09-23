import axios from 'axios';

// Normalize VITE_API_URL: handles undefined, trailing slashes, and optional /api suffix
const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
const API_BASE = rawApiUrl 
  ? (rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`) 
  : '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('precedentiq_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to handle auth expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token on 401 if not on login/register page
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('precedentiq_token');
        localStorage.removeItem('precedentiq_user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout')
};

export const mattersAPI = {
  list: () => api.get('/matters'),
  create: (data) => api.post('/matters', data),
  get: (matterId) => api.get(`/matters/${matterId}`),
  update: (matterId, data) => api.patch(`/matters/${matterId}`, data),
  delete: (matterId) => api.delete(`/matters/${matterId}`)
};

export const documentsAPI = {
  listByMatter: (matterId) => api.get(`/matters/${matterId}/documents`),
  upload: (matterId, formData) => api.post(`/matters/${matterId}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  get: (documentId) => api.get(`/documents/${documentId}`),
  delete: (documentId) => api.delete(`/documents/${documentId}`),
  reprocess: (documentId) => api.post(`/documents/${documentId}/reprocess`),
  updateCategory: (documentId, category) => api.patch(`/documents/${documentId}/category`, { category })
};

export const researchAPI = {
  query: (matterId, data) => api.post(`/matters/${matterId}/research`, data),
  getHistory: (matterId) => api.get(`/matters/${matterId}/research`),
  getById: (researchId) => api.get(`/research/${researchId}`)
};

export const vulnerabilityAPI = {
  analyze: (matterId, data) => api.post(`/matters/${matterId}/vulnerabilities`, data)
};

export const clauseAPI = {
  compare: (matterId, data) => api.post(`/matters/${matterId}/clauses/compare`, data)
};

export const briefAPI = {
  generate: (matterId, data) => api.post(`/matters/${matterId}/brief`, data)
};

export const evidenceAPI = {
  getChunk: (chunkId) => api.get(`/evidence/${chunkId}`),
  listByMatter: (matterId, params = {}) => api.get(`/matters/${matterId}/evidence`, { params })
};

export const statsAPI = {
  getDashboard: () => api.get('/stats/dashboard')
};

export const auditAPI = {
  list: (params = {}) => api.get('/audit', { params })
};

export default api;
