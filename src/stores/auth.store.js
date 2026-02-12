/**
 * src/stores/auth.store.js
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '@/api/axios.config'
import router from '@/router'
import { emitAuthEvent, clearAuthData as clearAuthDataUtil } from '@/utils/auth.utils'

export const useAuthStore = defineStore('auth', () => {
  // Состояние
  const user = ref(null)
  const isAuthenticated = computed(() => !!user.value)
  const useMockMode = ref(import.meta.env.DEV) // mock mode in dev

  // Надёжный геттер роли: учитывает, что user может быть null и role — объект или строка.
  const userRole = computed(() => {
    try {
      const r = user.value?.role
      if (!r) return null

      // если объект с name или name в snake_case
      if (typeof r === 'object') {
        const name = r.name || r.name_ru || r.slug || r.id || null
        return roleConversion(name)
      }

      // если строка (slug или human)
      return roleConversion(r)
    } catch {
      return null
    }
  })

  // Методы

  // Mock данные для входа (пример)
  const mockUsers = {
    'admin@test.com': { 
      created_at: "2026-01-31T10:27:16.000000Z",
      email_verified_at: null,
      first_name: "Сергей",
      id: 1, 
      last_name: 'Левченко',
      login: "admin",
      middle_name: "Павлович",
      email: 'admin@test.com',
      role: { id: 1, name: 'Администратор', description: null},
      updated_at: "2026-01-31T10:27:16.000000Z",
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
          const roleLabel = foundUser.role?.name || foundUser.role
          const role = roleConversion(roleLabel)
          // Нормализуем роль в объекте, оставляем original name в поле role.name
          foundUser.role = foundUser.role || {}
          foundUser.role.name = role
          
          // Сохраняем данные
          user.value = foundUser
          localStorage.setItem('user', JSON.stringify(foundUser))
          
          console.log(`✅ Mock login successful as ${role}`)
          // Редирект по роли
          redirectByRole(role)
          emitAuthEvent('loginSuccess')

          resolve({ user: foundUser, expiresIn: 3600 })
        } else {
          reject(new Error('Неверные учетные данные'))
        }
      }, 1000)
    })
  }

  const roleConversion = (role) => {
    if (!role) return null
    const r = String(role).toLowerCase()
    switch (r) {
      case 'администратор':
      case 'admin':
        return 'admin'
      case 'диспетчер':
      case 'dispatcher':
        return 'dispatcher'
      case 'инженер':
      case 'engineer':
        return 'engineer'
      case 'клиент':
      case 'client':
        return 'client'
      default:
        return null
    }
  }

  const login = async (credentials) => {
    try {
      if (useMockMode.value) {
        console.log('🔧 Using mock login mode')
        return await mockLogin(credentials)
      }

      const response = await apiClient.post('/login', credentials)
      const { user: userData } = response.data || {}

      if (!userData) {
        throw new Error('Неверный ответ от сервера')
      }

      // Нормализуем роль ответа
      const roleLabel = userData.role?.name || userData.role
      const role = roleConversion(roleLabel)
      if (role) {
        // Записываем normalized slug в user.role.name чтобы store.userRole мог прочитать slug
        userData.role = userData.role || {}
        userData.role.name = role
      }

      user.value = userData
      localStorage.setItem('user', JSON.stringify(userData))

      console.log('✅ Успешный вход, роль:', userData.role?.name || 'не указана')
      redirectByRole(userData.role?.name)
      emitAuthEvent('loginSuccess')

      return response.data
    } catch (error) {
      console.error('Ошибка входа:', error)
      if (error.response?.status === 422) {
        const errorMessage = error.response?.data?.validator_fails || 
                             error.response?.data?.message ||
                             'Учетная запись не найдена'
        throw new Error(errorMessage)
      }
      throw new Error('Ошибка подключения к серверу')
    }
  }

  const redirectByRole = (roleName) => {
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

  // Выход пользователя
  const logout = async () => {
    try {
      await apiClient.post('/logout')
    } catch (error) {
      console.log(error, ' ℹ️ Выход выполнен')
    } finally {
      user.value = null
      clearAuthDataUtil(true)
      router.push({ name: 'login' })
    }
  }

  const clearAuthData = async () => {
    // очищаем локально
    user.value = null
    localStorage.removeItem('user')
    clearAuthDataUtil(true)
    // Дополнительно можно вызвать logout на сервере
    try { await apiClient.post('/logout') 
    } catch {
      console.log('Вызов logout на сервере')
    }
  }

  const initialize = () => {
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
    user,
    isAuthenticated,
    userRole,
    login,
    logout,
    clearAuthData,
    initialize,
    redirectByRole,
  }
})
