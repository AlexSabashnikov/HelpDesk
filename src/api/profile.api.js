// src/api/profile.api.js
import apiClient from '@/api/axios.config'

const profileApi = {
  // Получить профиль текущего пользователя
  async getProfile() {
    try {
      const res = await apiClient.get('/profile')
      return res.data
    } catch (err) {
      console.warn('profileApi.getProfile: network error, falling back to localStorage', err)
      // fallback: try localStorage shape { user: {...}, token: '...' } or raw user
      const raw = localStorage.getItem('user')
      if (raw) {
        try {
          return { user: JSON.parse(raw) }
        } catch (parseErr) {
          console.error('profileApi.getProfile fallback parse error', parseErr)
        }
      }
      throw err
    }
  },

  // Обновить профиль текущего пользователя
  async updateProfile(payload) {
    try {
      const res = await apiClient.put('/profile', payload)
      return res.data
    } catch (err) {
      console.warn('profileApi.updateProfile: network error, falling back to localStorage', err)
      // fallback: merge into localStorage user
      try {
        const raw = localStorage.getItem('user')
        if (raw) {
          const current = JSON.parse(raw)
          const updated = { ...current, ...payload }
          localStorage.setItem('user', JSON.stringify(updated))
          return { user: updated }
        }
      } catch (fallbackErr) {
        console.error('profileApi.updateProfile fallback error', fallbackErr)
      }
      throw err
    }
  },

  // Получить пользователя по id (для справочника)
  async getUserById(id) {
    try {
      const res = await apiClient.get(`/users/${id}`)
      return res.data
    } catch (err) {
      console.warn('profileApi.getUserById: network error, falling back to localStorage or stub', err)
      // fallback: return current local user if ids match; otherwise minimal stub
      try {
        const raw = localStorage.getItem('user')
        if (raw) {
          const localUser = JSON.parse(raw)
          if (+localUser.id === +id) return { user: localUser }
        }
      } catch (e) {
        console.error('profileApi.getUserById fallback parse error', e)
      }
      // minimal offline stub
      return {
        user: {
          id,
          firstName: 'Имя',
          lastName: 'Фамилия',
          middleName: '',
          email: 'user@example.com',
          role: { id: null, name: 'Клиент' }
        }
      }
    }
  },

  // Обновить пользователя по id (для админ-панели)
  async updateUserById(id, payload) {
    try {
      const res = await apiClient.put(`/users/${id}`, payload)
      return res.data
    } catch (err) {
      console.warn('profileApi.updateUserById: network error, falling back to localStorage', err)
      try {
        const raw = localStorage.getItem('user')
        if (raw) {
          const localUser = JSON.parse(raw)
          if (+localUser.id === +id) {
            const updated = { ...localUser, ...payload }
            localStorage.setItem('user', JSON.stringify(updated))
            return { user: updated }
          }
        }
      } catch (e) {
        console.error('profileApi.updateUserById fallback error', e)
      }
      throw err
    }
  }
}

export default profileApi
