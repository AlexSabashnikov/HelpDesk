/**
 * Хранилище аутентификации
 * Текущий пользователь, токен, роль, права доступа
 * Сохранение в localStorage (токен и основные данные)
 * Хранилище аутентификации с mock-режимом для разработки
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '@/api/axios.config'
import router from '@/router'
import { emitAuthEvent, clearAuthData as clearAuthDataUtil } from '@/utils/auth.utils'

export const useAuthStore = defineStore('auth', () => {
  // Состояние
  const user = ref(null)
  const token = ref(localStorage.getItem('auth_token'))
  const csrfToken = ref(localStorage.getItem('csrf_token'))
  const isAuthenticated = computed(() => !!token.value)
  const userRole = computed(() => user.value?.role || null) 
  const useMockMode = ref(import.meta.env.DEV) // МОК ДАННЫЕ Только в разработке

  // Методы

  // Mock данные для входа
  const mockUsers = {
    'admin@test.com': { 
      id: 1, 
      name: 'Сабашников А.Е.', 
      email: 'admin@test.com',
      role: 'admin',
    },
    'engineer@test.com': { 
      id: 2, 
      name: 'Петров Е.А.', 
      email: 'engineer@test.com',
      role: 'engineer',
    },
    'client@test.com': { 
      id: 3, 
      name: 'Иванов Г.К.', 
      email: 'client@test.com',
      role: 'client',
    }
  }

  // Mock логин
  const mockLogin = async (credentials) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const foundUser = mockUsers[credentials.login]
        
        if (foundUser && credentials.password === 'password') {
          const mockToken = `mock_jwt_${Date.now()}_${Math.random().toString(36).substr(2)}`
          
          // Сохраняем данные
          user.value = foundUser
          token.value = mockToken
          
          // Сохраняем в localStorage
          localStorage.setItem('auth_token', mockToken)
          localStorage.setItem('user', JSON.stringify(foundUser))
          
          console.log(`✅ Mock login successful as ${foundUser.role}`)
          
          // Редирект по роли
          redirectByRole(foundUser.role)
          // Вызываем уведомление
          emitAuthEvent('loginSuccess')

          resolve({ 
            user: foundUser, 
            accessToken: mockToken,
            expiresIn: 3600
          })
        } else {
          reject(new Error('Неверные учетные данные'))
        }
      }, 1000)
    })
  }

  const login = async (credentials) => {
    try {
      // Если включен mock режим или сервер недоступен
      if (useMockMode.value) {
        console.log('🔧 Using mock login mode')
        return await mockLogin(credentials)
      }
      const response = await apiClient.post('/login', credentials)
      
      const { user: userData, accessToken } = response.data
      
      // Сохраняем данные
      user.value = userData
      token.value = accessToken
      
      // Сохраняем в localStorage
      localStorage.setItem('auth_token', accessToken)
      localStorage.setItem('user', JSON.stringify(userData))
      
      // Редирект по роли
      redirectByRole(userData.role)
      // Вызываем уведомление
      emitAuthEvent('loginSuccess')

      return response.data
    } catch (error) {
      console.error('Ошибка входа:', error)
      throw error
    }
  }

  const redirectByRole = (role) => {
    switch (role) {
      case 'admin':
        router.push({ name: 'admin-tickets' })
        break
      case 'engineer':
        router.push({ name: 'engineer-tickets' })
        break
      case 'client':
        router.push({ name: 'client-tickets' })
        break
      default:
        router.push({ name: 'login' })
    }
  }

  // Самостоятельный выход пользователя (пока не используется)
  const logout = async () => {
    try {
      if (token.value) {
        await apiClient.post('/logout')
      }
    } catch (error) {
      console.error('Ошибка при выходе:', error)
    } finally {
      clearAuthData()
      router.push({ name: 'login' })
    }
  }

  const fetchCsrfToken = async () => {
    try {
      // Читаем токен из meta
      const csrfMeta = document.querySelector('meta[name="csrf-token"]')
      if (!csrfMeta) {
        throw new Error('CSRF meta tag not found')
      }
    
      csrfToken.value = csrfMeta.getAttribute('content')
      console.log('✅ CSRF токен загружен из meta:', csrfToken.value)
    
      return csrfToken.value
    } catch (error) {
      console.error('Ошибка получения CSRF токена:', error)
      throw error
    }
  }

  const clearAuthData = () => {
    // Вызываем уведомление
    clearAuthDataUtil(true)
    user.value = null
    token.value = null
    
    //localStorage.removeItem('auth_token')
    //localStorage.removeItem('user')
    
  }

  const initialize = () => {
    // Восстанавливаем данные из localStorage
    const savedToken = localStorage.getItem('auth_token')
    const savedUser = localStorage.getItem('user')
    
    if (savedToken && savedUser) {
      try {
        token.value = savedToken
        user.value = JSON.parse(savedUser)
      } catch (error) {
        console.error('Ошибка инициализации авторизации:', error)
        clearAuthData()
      }
    }
  }

  return {
    // Состояние
    user,
    token,
    csrfToken,
    isAuthenticated,
    userRole,
    useMockMode, // УДАЛИТЬ
    mockUsers, // УДАЛИТЬ
    
    // Действия
    login,
    logout,
    fetchCsrfToken,
    clearAuthData,
    initialize,
    mockLogin, // УДАЛИТЬ
  }
})