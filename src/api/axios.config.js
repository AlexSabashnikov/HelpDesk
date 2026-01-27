
/**
 * Базовая конфигурация axios для работы с Laravel API
 * Все обработки сессий вынесены в session.handler.js
 */

import axios from 'axios'

// Базовый axios клиент 
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
  timeout: 30000,
})

export default apiClient
export { axios as axiosInstance }