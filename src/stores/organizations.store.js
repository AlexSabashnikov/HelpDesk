/**
 * Хранилище компаний-клиентов
 * Справочник компаний для выбора при создании заявок
 * Поиск и автодополнение в формах
 */

import { defineStore } from 'pinia'
import { organizationsApi } from '@/api/companies.api'
import { useCache } from '@/utils/cashe.utils'
//import globalApiClient from '@/api/axios.config'

export const useOrganizationsStore = defineStore('organizations', {
  state: () => ({
    organizations: [],
    loading: false,
    currentOrganization: null,
    pagination: null,
    cacheInstance: null,
    lastParams: null
  }),

  actions: {
    // Инициализация кэша (вызывается при первом использовании)
    initCache() {
      if (!this.cacheInstance) {
        const { 
          getCacheKey, 
          isCacheValid, 
          getFromCache, 
          saveToCache,
          invalidateCacheKey,
          clearCache,
          cache
        } = useCache(5 * 60 * 1000)
        
        this.cacheInstance = {
          getCacheKey,
          isCacheValid,
          getFromCache,
          saveToCache,
          invalidateCacheKey,
          clearCache,
          cache 
        }
      }
      return this.cacheInstance
    },

    async fetchOrganizations(params = {}) {
      this.loading = true
      
      // Получаем методы кэша
      const cache = this.initCache()

      // Генерируем ключ для кэша
      const cacheKey = cache.getCacheKey('orgs', params)
      
      // Проверяем, изменились ли параметры по сравнению с последним запросом
      const paramsChanged = this.lastParams && (
        this.lastParams.search !== params.search ||
        JSON.stringify(this.lastParams.types) !== JSON.stringify(params.types) ||
        this.lastParams.page !== params.page
      )
      
      // Если параметры НЕ изменились и есть валидный кэш - используем его
      if (!paramsChanged && cache.isCacheValid(cacheKey)) {
        console.log('📦 Используем кэшированные данные для ключа: ', cacheKey)
        const cached = cache.getFromCache(cacheKey)
        
        // Восстанавливаем данные из кэша
        this.organizations = cached.data.data || []
        this.pagination = cached.pagination
        
        this.loading = false
        return cached.response
      }
      
      try {
        // Формируем тело запроса
        const requestBody = {
          organization_search: params.search || '',
          type: params.types || (params.type ? [params.type] : []),
        }
      
        console.log('📤 Отправка запроса /companies/load_companies:', requestBody)
      
        //const response = await globalApiClient.post('/companies/load_companies', requestBody)
        const response = await organizationsApi.getOrganizations()
        console.log('📥 Ответ от сервера:', response)
      
        if (response.data) {
          this.organizations = response.data.data || []
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
          
          // Если параметры изменились, очищаем старый кэш ПЕРЕД сохранением нового
          if (paramsChanged) {
            console.log('🔄 Параметры запроса изменились, очищаем старый кэш')
            this.clearCacheByPrefix('orgs')
          }
          
          // Сохраняем новые данные в кэш
          cache.saveToCache(cacheKey, response.data, this.pagination, response)

          // Сохраняем текущие параметры
          this.lastParams = { ...params }
        }
        return response
      } catch (error) {
        console.error('❌ Ошибка загрузки организаций:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // метод для очистки кэша по префиксу
    clearCacheByPrefix(prefix) {
      const cache = this.initCache()
      if (cache.cache?.value) {
        const keysToDelete = []
        cache.cache.value.forEach((_, key) => {
          if (key.startsWith(prefix)) {
            keysToDelete.push(key)
          }
        })
        keysToDelete.forEach(key => cache.cache.value.delete(key))
        if (keysToDelete.length > 0) {
          console.log(`🗑️ Удалено ${keysToDelete.length} ключей с префиксом ${prefix}:`, keysToDelete)
        }
      }
    },
    
    invalidateCacheKey(params) {
      const cache = this.initCache()
      const cacheKey = cache.getCacheKey('orgs', params)
      cache.invalidateCacheKey(cacheKey)
    },
    
    clearCache() {
      const cache = this.initCache()
      cache.clearCache()
      this.lastParams = null
    }
  }
})