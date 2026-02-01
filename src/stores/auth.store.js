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
  //const csrfToken = ref(localStorage.getItem('csrf_token'))
  const isAuthenticated = computed(() => !!user.value)
  //const userRole = computed(() => roleConversion(user.value.role.name) || null) 
  const useMockMode = ref(import.meta.env.DEV) // МОК ДАННЫЕ Только в разработке
  const userRole = computed(() => roleConversion(user.value.role.name) || null)

  // Методы

  // Mock данные для входа
  const mockUsers = {
    'admin@test.com': { 
      id: 1, 
      name: 'Сабашников А.Е.', 
      email: 'admin@test.com',
      role: { id: 1, name: 'Администратор'},
    },
    'disp@test.com': { 
      id: 2, 
      name: 'Сабашников А.Е.', 
      email: 'disp@test.com',
      role: { id: 2, name: 'Диспетчер'},
    },
    'engineer@test.com': { 
      id: 3, 
      name: 'Петров Е.А.', 
      email: 'engineer@test.com',
      role: { id: 3, name: 'Инженер'},
    },
    'client@test.com': { 
      id: 4, 
      name: 'Иванов Г.К.', 
      email: 'client@test.com',
      role: { id: 4, name: 'Клиент'},
    }
  }

  // Mock логин
  const mockLogin = async (credentials) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const foundUser = mockUsers[credentials.login]
        
        if (foundUser && credentials.password === 'password') {
          //const mockToken = `mock_jwt_${Date.now()}_${Math.random().toString(36).substr(2)}`
          
          const role = roleConversion(foundUser.role.name)
          foundUser.role.name = role 
          // Сохраняем данные
          user.value = foundUser
          localStorage.setItem('user', JSON.stringify(foundUser))
          
          console.log(`✅ Mock login successful as ${role}`)
          // Редирект по роли
          redirectByRole(foundUser.role.name)
          // Вызываем уведомление
          emitAuthEvent('loginSuccess')

          resolve({ 
            user: foundUser, 
            expiresIn: 3600
          })
        } else {
          reject(new Error('Неверные учетные данные'))
        }
      }, 1000)
    })
  }

  const roleConversion = (role) => {
    switch (role) {
      case 'Администратор':
        return 'admin'
      case 'Диспетчер':
        return 'dispatcher'
      case 'Инженер':
        return 'engineer'
      case 'Клиент':
        return 'client'
      default:
        return null
    }
  }

  const login = async (credentials) => {
    try {
      // Если включен mock режим или сервер недоступен
      if (useMockMode.value) {
        console.log('🔧 Using mock login mode')
        return await mockLogin(credentials)
      }

      console.log('Отправляю запрос на /login:', credentials)

      const response = await apiClient.post('/login', credentials)

      console.log('Ответ от сервера:', response.data)
      console.log('Cтруктура ответа:', JSON.stringify(response.data, null, 2))
      
      // Проверяем, есть ли ошибка валидации
      if (response.data?.validator_fails) {
        throw new Error(response.data.validator_fails)
      }

      const { user: userData } = response.data

      if (!userData?.role.name) {
        throw new Error('Неверный ответ от сервера')
      }
      const role = roleConversion(userData.role.name)
      userData.role.name = role

      // Сохраняем данные пользователя
      user.value = userData

      // Сохраняем в localStorage только данные пользователя
      localStorage.setItem('user', JSON.stringify(userData))
      
      console.log('✅ Успешный вход, роль:', userData.role?.name || 'не указана')
      // Редирект по роли
      redirectByRole(userData.role?.name)
      // Вызываем уведомление
      emitAuthEvent('loginSuccess')

      return response.data
    } catch (error) {
      console.error('Ошибка входа:', error)
    
      // Если это уже наша кастомная ошибка (с validator_fails)
      if (error.message && error.message.includes('Учетная запись')) {
        throw error // Просто пробрасываем дальше
      }
    
      // Ошибка 422 - неверные учетные данные
      if (error.response?.status === 422) {
        const errorMessage = error.response?.data?.validator_fails || 
                         error.response?.data?.message ||
                         'Учетная запись не найдена'
        throw new Error(errorMessage)
      }
    
      // Другие ошибки
      throw new Error('Ошибка подключения к серверу')
    }
  }

  const redirectByRole = (roleName) => {
    console.log("РОЛЬ ПЕРЕД РЕДИРЕКТОМ2 ", roleName)
    switch (roleName) {
      case 'admin':
        router.push({ name: 'admin-tickets' })
        break
      case 'dispatcher':
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

  const forceLogout = async () => {
    try {
      await apiClient.post('/logout')
    } catch(error){
      console.log(error, ' ℹ️ Выход выполнен')
    } finally {
      // Очищаем локальные данные (без редиректа)
      user.value = null
      localStorage.removeItem('user')
      console.log('🧹 Локальные данные очищены (без редиректа)')
    }
  }
  // Выход пользователя
  const logout = async () => {
    try {
      await apiClient.post('/logout')
    } catch (error) {
      // Даже если ошибка, все равно очищаем данные
      console.log(error, ' ℹ️ Выход выполнен')
    } finally {
      //clearAuthData()
      router.push({ name: 'login' })
    }
  }

  const clearAuthData = async () => {
    // Вызываем уведомление
    console.log('authStore clearData')
    await logout()
    user.value = null
    clearAuthDataUtil(true)
  }

  const initialize = () => {
    // Восстанавливаем данные из localStorage
    const savedUser = localStorage.getItem('user')
    
    if (savedUser) {
      try {
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
    isAuthenticated,
    userRole,
    //useMockMode, // УДАЛИТЬ
    //mockUsers, // УДАЛИТЬ
    
    // Действия
    login,
    logout,
    forceLogout,
    clearAuthData,
    initialize,
    redirectByRole,
    //mockLogin, // УДАЛИТЬ
  }
})