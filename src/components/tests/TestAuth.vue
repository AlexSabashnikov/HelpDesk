<!-- src/components/TestAuth.vue -->
<template>
  <div class="test-auth">
    <h3>Тестирование авторизации</h3>
    
    <div v-if="authStore.isAuthenticated">
      <p>✅ Вы авторизованы как: {{ authStore.user?.name }} ({{ authStore.user?.role }})</p>
      <button @click="handleLogout">Выйти</button>
      <button @click="quickLogin(authStore.user?.role)">На главную</button>
    </div>
    
    <div v-else>
      <p>❌ Не авторизован</p>
      
      <div class="quick-login-buttons">
        <h4>Быстрый вход (demo):</h4>
        <button @click="quickLogin('admin')">Войти как Админ</button>
        <button @click="quickLogin('engineer')">Войти как Инженер</button>
        <button @click="quickLogin('client')">Войти как Клиент</button>
      </div>
      
      <div class="manual-login">
        <h4>Ручной вход:</h4>
        <input v-model="email" placeholder="Email" type="email">
        <input v-model="password" placeholder="Пароль" type="password">
        <button @click="handleLogin">Войти</button>
        <small>Используйте: admin@test.com / password</small>
      </div>
    </div>
    
    <div class="debug-info">
      <h4>Отладочная информация:</h4>
      <p>Токен: {{ authStore.token ? '✓ Присутствует' : '✗ Отсутствует' }}</p>
      <p>Mock режим: {{ authStore.useMockMode ? 'Включен' : 'Выключен' }}</p>
      <p>Бэкенд доступен: {{ authStore.isBackendAvailable ? 'Да' : 'Нет' }}</p>
      <button @click="toggleMockMode">
        {{ authStore.useMockMode ? 'Выключить' : 'Включить' }} mock режим
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth.store'

const authStore = useAuthStore()
const email = ref('admin@test.com')
const password = ref('password')

const handleLogin = async () => {
  try {
    await authStore.login({
      email: email.value,
      password: password.value
    })
    alert('Вход выполнен успешно!')
  } catch (error) {
    alert(`Ошибка входа: ${error.message}`)
  }
}

const handleLogout = async () => {
  await authStore.logout()
  alert('Вы вышли из системы')
}

const quickLogin = (role) => {
  const result = authStore.quickLogin(role)
  if (result) {
    alert(`Быстрый вход как ${role} выполнен!`)
  }
}

const toggleMockMode = () => {
  authStore.setMockMode(!authStore.useMockMode)
}
</script>

<style scoped>
.test-auth {
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin: 20px;
}

.quick-login-buttons,
.manual-login,
.debug-info {
  margin: 15px 0;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 4px;
}

button {
  margin: 5px;
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #0056b3;
}

input {
  display: block;
  margin: 5px 0;
  padding: 8px;
  width: 200px;
}
</style>