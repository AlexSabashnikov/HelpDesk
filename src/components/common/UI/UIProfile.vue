<!-- src/components/common/UI/UIProfile.vue -->
<template>
  <div
    class="user-profile"
    role="button"
    tabindex="0"
    @click="handleClick"
    @keydown.enter.prevent="handleClick"
    :title="userNameDisplay"
  >
    <div class="profile-info">
      <div class="user-details">
        <div class="user-name">{{ userNameDisplay }}</div>
        <div class="user-role">{{ userRoleStr }}</div>
      </div>
      <div class="avatar" aria-hidden="true">
        {{ userInitials }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth.store'

// Emit для открытия модалки (MainLayout слушает)
const emit = defineEmits(['openProfile'])

// Pinia — единый источник правды
const authStore = useAuthStore()

// Надёжный геттер user: сначала из store, затем fallback на localStorage (если нужно)
const userData = computed(() => {
  return authStore.user || (() => {
    try {
      const raw = localStorage.getItem('user')
      if (!raw) return null
      const parsed = JSON.parse(raw)
      // Поддержка двух форматов: { user: {...}, token: '...' } или сам user object
      if (parsed && typeof parsed === 'object') {
        if (parsed.user) return parsed.user
        if (parsed.id || parsed.email || parsed.login) return parsed
      }
      return null
    } catch {
      return null
    }
  })()
})

// Формирование отображаемого имени
const userNameDisplay = computed(() => {
  const u = userData.value
  if (!u) return 'Пользователь'
  const last = u.lastName || u.last_name || ''
  const first = u.firstName || u.first_name || u.first || ''
  // Если оба есть — возвращаем "Фамилия И.О." или "Фамилия Имя" в зависимости от длины
  if (last && first) {
    const initial = (first || '').trim()[0] || ''
    return initial ? `${last} ${initial}.` : `${last} ${first}`
  }
  // если нет фамилии/имени — попробуем более общие поля
  return u.name || u.login || u.email || 'Пользователь'
})

// Нормализация роли для отображения
const userRoleStr = computed(() => {
  const r = userData.value?.role
  if (!r) return ''
  // если роль — объект { name: 'Администратор' }
  if (typeof r === 'object') return r.name || r.slug || ''
  // если роль — строка slug
  const slug = String(r).toLowerCase()
  switch (slug) {
    case 'admin':
    case 'администратор':
      return 'Администратор'
    case 'dispatcher':
    case 'диспетчер':
      return 'Диспетчер'
    case 'engineer':
    case 'инженер':
      return 'Инженер'
    case 'client':
    case 'клиент':
      return 'Клиент'
    default:
      // Вернём original (например "Admin" или "Администратор")
      return String(r)
  }
})

// Формирование инициалов (max 2 буквы)
// Пример: "Иванов С." -> "ИС", "Пользователь" -> "П"
const userInitials = computed(() => {
  const name = userNameDisplay.value || ''
  const parts = name.split(' ').filter(Boolean)
  if (parts.length === 0) return ''
  if (parts.length === 1) return (parts[0][0] || '').toUpperCase()
  return ((parts[0][0] || '') + (parts[1][0] || '')).toUpperCase().slice(0, 2)
})

// Клик — эмитим событие наверх (layout откроет модалку)
function handleClick() {
  emit('openProfile')
}
</script>

<style scoped>
.user-profile {
  position: relative;
  cursor: pointer;
  outline: none;
}
.user-profile:focus .profile-info {
  box-shadow: 0 0 0 3px rgba(37,99,235,0.12);
  border-radius: 8px;
}
.profile-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px;
  border-radius: 8px;
  width: 180px;
  transition: background 0.12s ease;
}
.profile-info:hover {
  background: rgba(0,85,255,0.08);
}
.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: white;
  font-size: 14px;
}
.user-details {
  text-align: left;
  padding-left: 6px;
}
.user-name {
  font-weight: 500;
  font-size: 14px;
  color: #E5E4E2;
}
.user-role {
  font-size: 12px;
  color: #6b7280;
}
</style>
