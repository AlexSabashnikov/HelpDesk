
/**
 * Базовая конфигурация axios для работы с Laravel API
 * Все обработки сессий вынесены в session.handler.js
 */

// axios.config.js
import { globalApiClient } from '@/utils/session.handler'

// Экспортируем глобальный клиент
const apiClient = globalApiClient

export const getAxiosInstance = () => globalApiClient

export default apiClient
export { apiClient as axiosInstance }