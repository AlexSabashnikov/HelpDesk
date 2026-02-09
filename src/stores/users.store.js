/**
 * Хранилище пользователей
 * Справочник инженеров, администраторов, контактных лиц
 * Используется для назначения исполнителей на заявки
 * Кэширование и обновление при изменении данных
 */

import { defineStore } from 'pinia'
import { usersApi } from '@/api/users.api'
import apiClient from '@/api/axios.config'

export const useUsersStore = defineStore('users', {
  state: () => ({
    users: [],
    loading: false,
    currentUser: null,
    pagination: null,
  }),

  actions: {
    async fetchUsers(params = {}) {
      this.loading = true
      try {
        // Маршрут для загрузки пользователей (с сервером)
        //const response = await apiClient.get('/users/load_users', { params })

        //Mock данные
        const response = await usersApi.getUsers(params)
        
        
        // Ожидаем структуру Laravel Paginator
        if (response.data) {
          this.users = response.data.data || []
          this.pagination = {
            current_page: response.data.current_page,
            data: response.data.data,
            first_page_url: response.data.first_page_url,
            from: response.data.from,
            last_page: response.data.last_page,
            last_page_url: response.data.last_page_url,
            links: response.data.links,
            next_page_url: response.data.next_page_url,
            path: response.data.path,
            per_page: response.data.per_page,
            prev_page_url: response.data.prev_page_url,
            to: response.data.to,
            total: response.data.total
          }
          console.log(response.data)
          return response
        }

        return {
          data: this.users,
          current_page: 1,
          last_page: 1,
          per_page: params.per_page || 10,
          total: this.users.length,
          links: [],
          from: 1,
          to: this.users.length
        }
      } catch (error) {
        console.error('Ошибка загрузки пользователей:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Получить конкретного пользователя по ID
    async fetchUserById(userId) {
      try {
        const response = await apiClient.get(`/users/${userId}`)
        return response.data
      } catch (error) {
        console.error('Ошибка загрузки пользователя:', error)
        throw error
      }
    },

    // Обновить пользователя
    async updateUser(userId, userData) {
      try {
        const response = await apiClient.put(`/users/${userId}`, userData)
        return response.data
      } catch (error) {
        console.error('Ошибка обновления пользователя:', error)
        throw error
      }
    },

    // Удалить пользователя
    async deleteUser(userId) {
      try {
        const response = await apiClient.delete(`/users/${userId}`)
        return response.data
      } catch (error) {
        console.error('Ошибка удаления пользователя:', error)
        throw error
      }
    },

    // Создать пользователя
    async createUser(userData) {
      try {
        const response = await apiClient.post('/users', userData)
        return response.data
      } catch (error) {
        console.error('Ошибка создания пользователя:', error)
        throw error
      }
    },

    // Поиск пользователей
    async searchUsers(searchTerm, params = {}) {
      try {
        const response = await apiClient.get('/users/search', {
          params: { search: searchTerm, ...params }
        })
        return response.data
      } catch (error) {
        console.error('Ошибка поиска пользователей:', error)
        throw error
      }
    }
  },
})