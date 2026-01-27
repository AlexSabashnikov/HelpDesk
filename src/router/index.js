/**
 * Главный роутер приложения Help Desk
 * Объединяет маршруты всех ролей: admin, engineer, client
 * Навигационная охрана - проверка авторизации и ролей
 */

import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'

// Импортируем маршруты из разных файлов
import authRoutes from './auth.routes.js'
import adminRoutes from './admin.routes.js'
import engineerRoutes from './engineer.routes.js'
import clientRoutes from './client.routes.js'

// Объединяем все маршруты
const routes = [

  // Главный редирект
  {
    path: '/',
    redirect: '/auth/login'
  },
  // Публичные маршруты (авторизация)
  ...authRoutes,
  
  // Защищенные маршруты по ролям
  ...adminRoutes,
  ...engineerRoutes,
  ...clientRoutes,
  
  
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/errors/NotFound.vue'),
    meta: { title: 'Страница не найдена' }
  }
]

// Создаем роутер
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

const pinia = createPinia()

// Глобальный навигационный guard
router.beforeEach(async (to, from, next) => {
  console.log(`🔄 Navigation: ${from.path} -> ${to.path}`)
  
  // Устанавливаем заголовок страницы
  if (to.meta.title) {
    document.title = `${to.meta.title}`
  }

  // Получаем auth store
  const { useAuthStore } = await import('@/stores/auth.store')
  const authStore = useAuthStore(pinia)
  
  // Инициализируем store
  await authStore.initialize()
  
  // Определяем публичные маршруты (не требующие авторизации)
  const publicRoutes = ['login', 'forgot-password', 'unauthorized']
  
  // Если маршрут публичный
  if (publicRoutes.includes(to.name)) {
    // Если пользователь уже авторизован и пытается зайти на логин
    if (to.name === 'login' && authStore.isAuthenticated) {
      console.log('✅ User already authenticated, redirecting based on role...')
      // Небольшая задержка для гарантии обновления реактивности
      await new Promise(resolve => setTimeout(resolve, 50))
      // Редирект по роли
      const userRole = authStore.userRole
      switch (userRole) {
        case 'admin':
          return next({ name: 'admin-tickets' })
        case 'engineer':
          return next({ name: 'engineer-tickets' })
        case 'client':
          return next({ name: 'client-tickets' })
        default:
          // Если роль не определена, сбрасываем авторизацию
          authStore.clearAuthData()
          return next()
      }
    }
    return next()
  }
  
  // Если маршрут требует авторизации
  if (to.meta.requiresAuth) {
    console.log('🔐 Маршрут требует авторизации, проверка...')
    
    if (!authStore.isAuthenticated) {
      console.log('❌ Пользователь не авторизован, редирект на логин')
      authStore.clearAuthData()
      return next({ name: 'login' })
    }
      // Проверяем, что данные в AuthStore совпадают с localStorage
    const savedToken = localStorage.getItem('auth_token')
    const savedUser = localStorage.getItem('user')
  
    if (!savedToken || !savedUser) {
      console.log('⚠️ Данные авторизации исчезли из LocalStorage, очищаем сессию')
      authStore.clearAuthData()
      return next({ name: 'login' })
    }
  
    // Проверяем, что пользователь в store совпадает с localStorage
    try {
      const parsedUser = JSON.parse(savedUser)
      if (!authStore.user || authStore.user.id !== parsedUser.id) {
        console.log('⚠️ Данные пользователя из LocalStorage не совпадают с AuthStore, очищаем сессию')
        authStore.clearAuthData()
        return next({ name: 'login' })
      }
    } catch (error) {
      console.error('❌ Error parsing user data:', error)
      authStore.clearAuthData()
      return next({ name: 'login' })
    }

    console.log('✅ Аутентифицирован, проверка роли...')
    
    
    const requiredRole = to.meta.role
    if (requiredRole) {
      const userRole = authStore.userRole
      
      if (userRole !== requiredRole) {
        console.log(`🚫 Пользователь не имеет прав, редирект на unauthorized`)
        return next({ name: 'unauthorized' })
      }
    }
    console.log('✅ Проверка роли прошла успешно')
  }
  next()
})

export default router