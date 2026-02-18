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
        <div class="user-role">{{ getRoleLabel(userRoleStr) }}</div>
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
import { getUserRole, getRoleLabel } from '@/utils/auth.utils'

// Emit для открытия модалки (MainLayout слушает)
const emit = defineEmits(['openProfile'])

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
  const middle = u.middleName || u.middle_name || u.middle || ''
  const first = u.firstName || u.first_name || u.first || ''
  // Если три есть — возвращаем "Фамилия И.О."
  if (last && first && middle) {
    let initialFirst = (first || '').trim()[0] || ''
    let initialMiddle = (middle || '').trim()[0] || ''
    return `${last} ${initialFirst}.${initialMiddle}`
  }
  // если нет фамилии/имени — попробуем более общие поля
  return u.name || u.login || u.email || 'Пользователь'
})

// Нормализация роли для отображения
const userRoleStr =  getUserRole()

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
  cursor: pointer;
  outline: none;
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px 4px 12px;
  border-radius: 10px;
  transition: background-color 0.2s ease;
  background-color: #031432;;
}

.profile-info:hover {
  background-color: #299f1990;
}

.user-details {
  text-align: right;
}

.user-name {
  font-weight: 500;
  font-size: 14px;
  color: #ffffff;
  line-height: 1.2;
  white-space: nowrap;
  max-width: 170px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 12px;
  color: #bec9d7;
  line-height: 1.2;
  text-align: right;
}

.avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3141d4, #1ec907);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: white;
  font-size: 13px;
  flex-shrink: 0;
  text-transform: uppercase;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
