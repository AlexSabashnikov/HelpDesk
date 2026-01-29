
/**
 * Обработчик сессий для отслеживания AJAX запросов
 * Реагирует на 419 (CSRF) и 401 (токен) ошибки
 * Не обновляет токены автоматически, только реагирует на ошибки
 */

import axios from 'axios'
import router from '@/router'
import { clearAuthData } from '@/utils/auth.utils'

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

  // Настройка перехватчиков для axios
  setupInterceptors() {
    // Перехватчик запросов
    axios.interceptors.request.use(
      (config) => {
        // Отслеживаем активные запросы
        const requestId = this.generateRequestId(config)
        this.activeRequests.add(requestId)
        
        // CSRF токен из meta тега
        const csrfToken = this.getCsrfTokenFromMeta()
        if (csrfToken && this.requiresCsrfToken(config)) {
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

  // Получает CSRF токен из meta тега
  getCsrfTokenFromMeta() {
    const metaTag = document.querySelector('meta[name="csrf-token"]')
    return metaTag?.getAttribute('content') || null
  }

  //Проверяет, нужен ли CSRF токен для запроса
  requiresCsrfToken(config) {
    // CSRF токен нужен для POST, PUT, DELETE, PATCH
    const methodsRequiringCsrf = ['POST', 'PUT', 'DELETE', 'PATCH']
    return methodsRequiringCsrf.includes(config.method?.toUpperCase())
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
    
    // Ошибка 401 - не авторизован (токен истек)
    if (response?.status === 401) {
      console.log('🔒 Unauthorized (401), logging out...')
      return await this.handleAuthError()
    }
    
    // Ошибка 403 - доступ запрещен
    if (response?.status === 403) {
      console.warn('🚫 Доступ запрещен (403)')
      router.push({ name: 'unauthorized' })
    }
    
    // Ошибка 429 - слишком много запросов
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

  // Обрабатывает ошибку CSRF (419)
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
    console.log('🔄 CSRF токен истек, получаем новый из meta...')
    
    try {
      const newCsrfToken = this.getCsrfTokenFromMeta()
      
      if (!newCsrfToken) {
        throw new Error('CSRF токен не найден в meta')
      }
      
      console.log('✅ Новый CSRF токен найден в meta: ', newCsrfToken)
      
      // Обновляем заголовок в оригинальном запросе
      originalConfig.headers['X-CSRF-TOKEN'] = newCsrfToken
      
      this.isRefreshingCsrf = false
      
      // Выполняем запросы из очереди
      this.processCsrfQueue()
      
      // Повторяем оригинальный запрос с новым токеном
      return axios(originalConfig)
    } catch (error) {
      this.isRefreshingCsrf = false
      this.csrfQueue = []
      
      console.error('❌ Ошибка получения CSRF токена из meta:', error.message)
      
      // Если не удалось получить CSRF - выходим
      await this.handleAuthError()
      
      return Promise.reject(error)
    }
  }

  // Обработка ошибки авторизации (401)
  async handleAuthError() {
    // Очищаем данные авторизации
    clearAuthData(true)

    // Эмитируем событие для уведомлений
    const event = new CustomEvent('auth-notification', {
      detail: { type: 'sessionExpired' }
    })
    window.dispatchEvent(event)
    
    // Редирект на страницу входа
    router.push({ name: 'login' })
  }

  // Очищает данные авторизации
  clearAuthData() {
    // Очищаем localStorage
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    localStorage.removeItem('refresh_token')
    
    console.log('🧹 Данные авторизации очищены')
  }

  // Обработка очереди запросов после обновления CSRF
  processCsrfQueue() {
    this.csrfQueue.forEach(promise => {
      promise.resolve()
    })
    this.csrfQueue = []
  }

  // Генерирует уникальный ID для запроса
  generateRequestId(config) {
    return `${config.method}_${config.url}_${Date.now()}_${Math.random()}`
  }

  // Получает количество активных запросов
  getActiveRequestsCount() {
    return this.activeRequests.size
  }

  // Сбрасывает все флаги и очереди
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