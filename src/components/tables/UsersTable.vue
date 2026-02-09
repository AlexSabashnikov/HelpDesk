<!-- 
    Таблица пользователей с использованием базового UITable
    Отображение списка пользователей с сортировкой и пагинацией через Laravel Paginator
-->

<template>
  <div class="users-table-wrapper">
    <!-- Общий компонент таблицы -->
    <UITable
      :columns="columns"
      :data="users"
      :loading="loading"
      :sortable="true"
      :pagination="true"
      :page-size="pagination.per_page"
      :current-page="pagination.current_page"
      :show-page-size-selector="false"
      :show-page-jump="false"
      :total-items="pagination.total"
      @rowClick="handleRowClick"
      @sortChange="handleSortChange"
      @pageChange="handlePageChange"
    >
      <template #cell-full_name="{ row }">
        <div class="full-name-cell">
          <div class="full-name-text">
            {{ formatFullName(row.last_name, row.first_name, row.middle_name) }}
          </div>
        </div>
      </template>

      <!-- Кастомный слот для колонки "Роль" -->
      <template #cell-role="{ value }">
        <span class="role-badge" :class="getRoleClass(value?.name || value)">
          {{ getRoleLabel(value?.name || value) }}
        </span>
      </template>

      <!-- Кастомный слот для колонки "Организация" -->
      <template #cell-organization="{ value }">
        <div class="organization-cell" :title="value?.name">
          {{ truncateText(value?.name, 30) || '—' }}
        </div>
      </template>

      <!-- Кастомный слот для колонки "Объект" -->
      <template #cell-object="{ value }">
        <div class="object-cell" :title="value?.name">
          {{ truncateText(value?.name, 30) || '—' }}
        </div>
      </template>

      <!-- Кастомный слот для колонки "Дата создания" -->
      <template #cell-created_at="{ value }">
        <span class="date-cell">
          {{ formatDate(value) }}
        </span>
      </template>

      <!-- Слот для состояния загрузки -->
      <template #loading>
        <div class="custom-loading">
          <div class="spinner"></div>
          <span>Загрузка пользователей...</span>
        </div>
      </template>

      <!-- Слот для пустого состояния -->
      <template #empty>
        <div class="custom-empty">
          <div class="empty-icon">👤</div>
          <h3>Пользователи не найдены</h3>
          <p>Попробуйте изменить критерии поиска или фильтры</p>
        </div>
      </template>
    </UITable>

    <!-- Дополнительная пагинация Laravel (если нужно показать ссылки) -->
    <div v-if="showLaravelPagination && pagination.links && pagination.links.length > 3" class="laravel-pagination-wrapper">
      <nav class="pagination-nav" aria-label="Навигация по страницам">
        <ul class="pagination-list">
          <!-- Предыдущая страница -->
          <li v-if="pagination.current_page > 1" class="page-item">
            <button 
              class="page-link prev-link" 
              @click="$emit('pageChange', pagination.current_page - 1)"
            >
              &laquo; Назад
            </button>
          </li>

          <!-- Ссылки на страницы -->
          <li 
            v-for="link in pagination.links" 
            :key="link.label"
            class="page-item"
            :class="{
              'active': link.active,
              'disabled': !link.url
            }"
          >
            <button 
              v-if="link.url"
              class="page-link"
              :class="{ 'current-page': link.active }"
              @click="$emit('pageChange', extractPageNumber(link.url))"
              v-html="link.label"
            ></button>
            <span v-else class="page-link disabled" v-html="link.label"></span>
          </li>

          <!-- Следующая страница -->
          <li v-if="pagination.current_page < pagination.last_page" class="page-item">
            <button 
              class="page-link next-link" 
              @click="$emit('pageChange', pagination.current_page + 1)"
            >
              Вперед &raquo;
            </button>
          </li>
        </ul>
      </nav>

      <!-- Информация о страницах -->
      <div class="pagination-info">
        Показано {{ pagination.from || 0 }} - {{ pagination.to || 0 }} из {{ pagination.total || 0 }} записей
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import UITable from '@/components/common/UI/UITable.vue'

defineProps({
  users: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  pagination: {
    type: Object,
    default: () => ({
      current_page: 1,
      last_page: 1,
      per_page: 10,
      total: 0,
      links: [],
      from: 0,
      to: 0
    })
  },
  showLaravelPagination: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['rowClick', 'pageChange', 'sortChange'])

// Столбцы таблицы
const columns = [
  { key: 'full_name', title: 'ФИО', width: '200px' },
  { key: 'email', title: 'Email', width: '150px' },
  { key: 'role', title: 'Роль', width: '140px' },
  { key: 'organization', title: 'Организация', width: '180px' },
  { key: 'object', title: 'Объект', width: '180px' },
]

// Форматирование ФИО
const formatFullName = (lastName, firstName, middleName) => {
  const parts = []
  if (lastName) parts.push(lastName)
  if (firstName) parts.push(firstName)
  if (middleName) parts.push(middleName)
  
  return parts.length > 0 ? parts.join(' ') : '—'
}

// Извлечение номера страницы из URL
const extractPageNumber = (url) => {
  if (!url) return 1
  const match = url.match(/[?&]page=(\d+)/)
  return match ? parseInt(match[1]) : 1
}

// Обработчик клика по строке
const handleRowClick = (user) => {
  emit('rowClick', user)
}

// Обработчик изменения страницы
const handlePageChange = (page) => {
  emit('pageChange', page)
}

// Обработчик сортировки
const handleSortChange = (sortOptions) => {
  emit('sortChange', sortOptions)
}

// Утилиты для форматирования
const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// Форматирование даты
const formatDate = (dateString) => {
  if (!dateString) return '—'
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch (error) {
    console.log(error)
    return '—'
  }
}

// Классы для ролей
const getRoleClass = (roleName) => {
  switch (roleName) {
    case 'Администратор':
    case 'admin':
      return 'role-admin'
    case 'Диспетчер':
    case 'dispatcher':
      return 'role-dispatcher'
    case 'Инженер':
    case 'engineer':
      return 'role-engineer'
    case 'Клиент':
    case 'client':
      return 'role-client'
    default:
      return 'role-default'
  }
}

// Метки для ролей
const getRoleLabel = (roleName) => {
  switch (roleName) {
    case 'Администратор':
    case 'admin':
      return 'Администратор'
    case 'Диспетчер':
    case 'dispatcher':
      return 'Диспетчер'
    case 'Инженер':
    case 'engineer':
      return 'Инженер'
    case 'Клиент':
    case 'client':
      return 'Клиент'
    default:
      return roleName || '—'
  }
}
</script>

<style scoped>
.users-table-wrapper {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* Стили для бейджей ролей */
.role-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  min-width: 100px;
}

.role-admin {
  background-color: #dc3545;
  color: white;
}

.role-dispatcher {
  background-color: #17a2b8;
  color: white;
}

.role-engineer {
  background-color: #28a745;
  color: white;
}

.role-client {
  background-color: #6c757d;
  color: white;
}

.role-default {
  background-color: #adb5bd;
  color: white;
}

/* Ячейки с обрезанным текстом */
.organization-cell,
.object-cell {
  max-width: 170px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Ячейка с датой */
.date-cell {
  font-size: 13px;
  color: #666;
}

/* Кастомные состояния загрузки и пустого состояния */
.custom-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 60px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.custom-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 60px;
  color: #666;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.custom-empty h3 {
  margin-bottom: 10px;
  color: #333;
}

.custom-empty p {
  color: #777;
}

/* Laravel Pagination Styles */
.laravel-pagination-wrapper {
  margin-top: 20px;
  padding: 15px 20px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  background: #f8f9fa;
}

.pagination-nav {
  display: flex;
  justify-content: center;
}

.pagination-list {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
  gap: 2px;
}

.page-item {
  margin: 0;
}

.page-link {
  display: inline-block;
  padding: 8px 12px;
  margin: 0;
  color: #007bff;
  background-color: #fff;
  border: 1px solid #dee2e6;
  text-decoration: none;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  min-width: 40px;
  text-align: center;
}

.page-link:hover:not(.disabled):not(.current-page) {
  background-color: #e9ecef;
  border-color: #dee2e6;
  color: #0056b3;
}

.page-link.current-page {
  background-color: #007bff;
  border-color: #007bff;
  color: white;
  font-weight: 600;
  cursor: default;
}

.page-link.disabled {
  color: #6c757d;
  pointer-events: none;
  background-color: #fff;
  border-color: #dee2e6;
}

.prev-link, .next-link {
  min-width: 80px;
}

.pagination-info {
  font-size: 14px;
  color: #6c757d;
  text-align: center;
}

/* Адаптивность */
@media (max-width: 1200px) {
  .role-badge {
    min-width: 80px;
    padding: 3px 8px;
    font-size: 11px;
  }
  
  .organization-cell,
  .object-cell {
    max-width: 120px;
  }
  
  .page-link {
    padding: 6px 8px;
    min-width: 35px;
    font-size: 13px;
  }
}

@media (max-width: 768px) {
  .users-table-wrapper {
    font-size: 12px;
  }
  
  .role-badge {
    font-size: 10px;
    padding: 2px 6px;
    min-width: 70px;
  }
  
  .pagination-list {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .page-link {
    padding: 4px 6px;
    min-width: 30px;
    font-size: 12px;
  }
  
  .prev-link, .next-link {
    min-width: 60px;
  }
}
</style>