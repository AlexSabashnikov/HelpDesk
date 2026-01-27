
/**
 * Обработчик сессий для отслеживания AJAX запросов
 * Реагирует на 419 (CSRF) и 401 (токен) ошибки
 * Не обновляет токены автоматически, только реагирует на ошибки
 */

import axios from 'axios'
import router from '@/router'

class SessionHandler {
  constructor() {
    this.activeRequests = new Set()
    this.isRefreshingCsrf = false
    this.csrfQueue = []
    this.isInitialized = false
  }

  /**
   * Инициализирует обработчик сессий
   */
  async init() {
    if (this.isInitialized) {
      return
    }
    
    console.log('🔧 Initializing session handler...')
    
    // Перехватчики для всех axios запросов
    this.setupInterceptors()
    
    this.isInitialized = true
    console.log('✅ Session handler initialized')
  }

  /**
   * Настраивает перехватчики для axios
   */
  setupInterceptors() {
    // Перехватчик запросов
    axios.interceptors.request.use(
      (config) => {
        // Отслеживаем активные запросы
        const requestId = this.generateRequestId(config)
        this.activeRequests.add(requestId)
        
        // Добавляем CSRF токен из localStorage
        const csrfToken = localStorage.getItem('csrf_token')
        if (csrfToken) {
          config.headers['X-CSRF-TOKEN'] = csrfToken
        }
        
        // Добавляем Authorization токен из localStorage
        const authToken = localStorage.getItem('auth_token')
        if (authToken) {
          config.headers['Authorization'] = `Bearer ${authToken}`
        }
        
        config._requestId = requestId
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Перехватчик ответов
    axios.interceptors.response.use(
      (response) => {
        // Удаляем завершенный запрос из отслеживания
        if (response.config._requestId) {
          this.activeRequests.delete(response.config._requestId)
        }
        return response
      },
      async (error) => {
        // Удаляем запрос из отслеживания
        if (error.config?._requestId) {
          this.activeRequests.delete(error.config._requestId)
        }

        await this.handleResponseError(error)
        return Promise.reject(error)
      }
    )
  }

  /**
   * Обрабатывает ошибки ответов
   */
  async handleResponseError(error) {
    const { config, response } = error
    
    // Ошибка 419 - CSRF токен истек
    if (response?.status === 419) {
      console.log('🔄 CSRF token expired (419), refreshing...')
      return await this.handleCsrfError(config)
    }
    
    // Ошибка 401 - Не авторизован (токен истек)
    if (response?.status === 401) {
      console.log('🔒 Unauthorized (401), logging out...')
      return await this.handleAuthError()
    }
    
    // Ошибка 403 - Доступ запрещен
    if (response?.status === 403) {
      console.warn('🚫 Доступ запрещен (403)')
      router.push({ name: 'unauthorized' })
    }
    
    // Ошибка 429 - Слишком много запросов
    if (response?.status === 429) {
      const retryAfter = response.headers['retry-after'] || 5
      console.warn(`⏳ Слишком много запросов. Повтор через ${retryAfter} секунд`)
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000))
      return axios(config)
    }
    
    // Сетевая ошибка (сервер не доступен)
    if (!response && error.code === 'ERR_NETWORK') {
      console.error('🌐 Network error:', error.message)
      // Можно показать уведомление пользователю
    }
  }

  /**
   * Обрабатывает ошибку CSRF (419)
   */
  async handleCsrfError(originalConfig) {
    // Если уже обновляем CSRF, добавляем запрос в очередь
    if (this.isRefreshingCsrf) {
      return new Promise((resolve) => {
        this.csrfQueue.push({ resolve })
      }).then(() => {
        return axios(originalConfig)
      })
    }

    this.isRefreshingCsrf = true
    console.log('🔄 Refreshing CSRF token...')
    
    try {
      // Обновляем CSRF токен через API запрос
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const response = await axios.get('/api/csrf-token', {
        baseURL,
        withCredentials: true,
        timeout: 5000
      })
      
      const csrfToken = response.data.csrf_token
      
      // Сохраняем новый токен в localStorage
      localStorage.setItem('csrf_token', csrfToken)
      
      console.log('✅ CSRF token refreshed')
      
      // Повторяем оригинальный запрос с новым токеном
      originalConfig.headers['X-CSRF-TOKEN'] = csrfToken
      
      this.isRefreshingCsrf = false
      
      // Выполняем запросы из очереди
      this.processCsrfQueue()
      
      return axios(originalConfig)
    } catch (refreshError) {
      this.isRefreshingCsrf = false
      this.csrfQueue = []
      
      console.error('❌ Failed to refresh CSRF token:', refreshError.message)
      
      // Если не удалось обновить CSRF - выходим
      await this.handleAuthError()
      
      return Promise.reject(refreshError)
    }
  }

  /**
   * Обрабатывает ошибку авторизации (401)
   */
  async handleAuthError() {
    console.log('🚪 Logging out due to auth error...')
    
    // Очищаем данные авторизации
    this.clearAuthData()
    
    // Редирект на страницу входа
    router.push({ name: 'login' })
  }

  /**
   * Очищает данные авторизации
   */
  clearAuthData() {
    // Очищаем localStorage
    localStorage.removeItem('auth_token')
    localStorage.removeItem('csrf_token')
    localStorage.removeItem('user')
    localStorage.removeItem('refresh_token')
    
    console.log('🧹 Auth data cleared')
  }

  /**
   * Обрабатывает очередь запросов после обновления CSRF
   */
  processCsrfQueue() {
    this.csrfQueue.forEach(promise => {
      promise.resolve()
    })
    this.csrfQueue = []
  }

  /**
   * Генерирует уникальный ID для запроса
   */
  generateRequestId(config) {
    return `${config.method}_${config.url}_${Date.now()}_${Math.random()}`
  }

  /**
   * Получает количество активных запросов
   */
  getActiveRequestsCount() {
    return this.activeRequests.size
  }

  /**
   * Сбрасывает все флаги и очереди
   */
  reset() {
    this.activeRequests.clear()
    this.isRefreshingCsrf = false
    this.csrfQueue = []
    this.isInitialized = false
  }
}

// Создаем и экспортируем синглтон
export const sessionHandler = new SessionHandler()
export default sessionHandler