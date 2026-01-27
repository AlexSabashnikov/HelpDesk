<!-- 
    Шаблон профиля пользователя
    Адаптируется под роли: Администратор, Инженер, Клиент
    Отображает: аватар, ФИО, должность, контактную информацию
    Ссылки на редактирование профиля и настройки
-->

<template>
  <div class="user-profile" @click="toggleDropdown">
    <div class="profile-info">
      <div class="user-details">
        <div class="user-name">{{ userName }}</div>
        <div class="user-role">{{ userRoleStr }}</div>
      </div>
      <div class="avatar">
        {{ userInitials }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const showDropdown = ref(false)

// Заглушка данных пользователя
const userName = 'Левченко С.П.'
let userRoleStr = null
let userRole = null;

const userStr = localStorage.getItem('user')
      
if (userStr) {
  try {
    const user = JSON.parse(userStr)
    userRole = user.role
    switch (userRole) {
      case 'admin':
        userRoleStr = "Администратор"
        break
      case 'engineer':
        userRoleStr = "Инженер"
        break
      case 'client':
        userRoleStr = "Клиент"
        break
}
  } catch (e) {
    console.error('Error parsing user for role check:', e)
  }
}

const userInitials = computed(() => {
  return userName
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
})

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}
</script>

<style scoped>
.user-profile {
  position: relative;
  cursor: pointer;
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px;
  border-radius: 8px;
  width: 180px;
  transition: background 0.2s;
}

.profile-info:hover {
  background: #0055ff36;
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
  padding-left: 10px;
}

.user-name {
  font-weight: 500;
  font-size: 16px;
  color: #ffffff;
}

.user-role {
  font-size: 12px;
  color: #ffffff;
}
</style>
