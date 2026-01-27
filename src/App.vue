<template>
  <!-- Используем разные лейауты в зависимости от маршрута -->
  <div>
    <SessionNotifications />
    
    <AuthLayout v-if="isAuthRoute">
      <RouterView />
    </AuthLayout>
    
    <MainLayout v-else>
      <RouterView />
    </MainLayout>
  </div>
</template>

<script setup>
import { computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import SessionNotifications from '@/components/notifications/SessionNotifications.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import AuthLayout from './layouts/AuthLayout.vue'

const route = useRoute()

const isAuthRoute = computed(() => {
  const authPaths = [
    '/auth/login',
    '/auth/forgot',
    '/unauthorized'
  ]

  return authPaths.includes(route.path)
})

// Для отладки
watch(isAuthRoute, (newValue) => {
  console.log('🔍 App.vue: isAuthRoute changed to', newValue)
  console.log('📊 Current route:', {
    name: route.name,
    path: route.path,
    meta: route.meta,
    fullPath: route.fullPath
  })
}, { immediate: true })

onMounted(() => {
  console.log('App mounted')
  console.log('Initial route check:', {
    name: route.name,
    path: route.path,
    meta: route.meta,
    isAuthRoute: isAuthRoute.value
  })
})
</script>

<style>
/* Импорт глобальных стилей */
@import '@/assets/styles/main.css';
</style>