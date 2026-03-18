// src/router/middleware/auth.js
import { useAuthStore } from '@/stores/auth.store'

export const authMiddleware = (to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  
  // Если маршрут требует авторизации
  if (requiresAuth) {
    if (!authStore.isAuthenticated) {
      // Сохраняем куда хотели пойти
      const redirectPath = to.fullPath !== '/' ? to.fullPath : null
      next({ 
        name: 'login',
        query: redirectPath ? { redirect: redirectPath } : {}
      })
      return
    }
    
    // Проверяем роль если требуется
    const requiredRole = to.meta.role
    if (requiredRole && authStore.userRole !== requiredRole) {
      next({ name: 'forbidden' })
      return
    }
  }
  
  // Если уже авторизован и пытается зайти на логин
  if (to.name === 'login' && authStore.isAuthenticated) {
    // Редирект в зависимости от роли
    switch (authStore.userRole) {
      case 'admin':
        next({ name: 'admin.tickets' })
        break
      case 'engineer':
        next({ name: 'engineer.tickets' })
        break
      case 'client':
        next({ name: 'client.tickets' })
        break
      default:
        next()
    }
    return
  }
  
  next()
}