/**
 * Центральный файл для всех API запросов
 * Все AJAX запросы должны идти через этот файл
 */

import apiClient from './axios.config'

// Auth API
export const authApi = {
  login: (credentials) => apiClient.post('/login', credentials),
  logout: () => apiClient.post('/logout'),
  refreshCsrf: () => apiClient.get('/csrf-token'),
}

// Tickets API
export const ticketsApi = {
  getAll: (params) => apiClient.get('/tickets', { params }),
  getById: (id) => apiClient.get(`/tickets/${id}`),
  create: (data) => apiClient.post('/tickets', data),
  update: (id, data) => apiClient.put(`/tickets/${id}`, data),
  delete: (id) => apiClient.delete(`/tickets/${id}`),
}

// Companies API
export const companiesApi = {
  getAll: (params) => apiClient.get('/companies', { params }),
  getById: (id) => apiClient.get(`/companies/${id}`),
  create: (data) => apiClient.post('/companies', data),
}

// Users API
export const usersApi = {
  getAll: (params) => apiClient.get('/users', { params }),
  getById: (id) => apiClient.get(`/users/${id}`),
}

// Analytics API
export const analyticsApi = {
  getDashboard: () => apiClient.get('/analytics/dashboard'),
  getReports: (params) => apiClient.get('/analytics/reports', { params }),
}
