<!-- 
    Таблица заявок с расширенной функциональностью
    Использует базовый CommonTable.vue, добавляя специфичные колонки
    Колонки: Приоритет, №, Тема, Клиент, Статус, Исполнитель, Дата
    Интеграция с tickets.store для фильтрации и сортировки
-->

<template>
  <div class="ticket-table-wrapper">
    <!-- Общий компонент таблицы -->
    <UITable
      :columns="columns"
      :data="formattedTickets"
      :loading="loading"
      :sortable="true"
      :pagination="true" 
      :page-size="pagination.limit"
      :current-page="currentPage"
      :show-page-size-selector="false" 
      :show-page-jump="false"
      :total-items="props.pagination.total"
      @rowClick="handleRowClick"
      @sortChange="handleSortChange"
      @pageChange="handlePageChange"
    >
      <!-- Кастомный слот для колонки "Приоритет" -->
      <template #cell-priority="{ value }">
        <div :class="`priority-indicator priority-${value}`" :title="getPriorityLabel(value)">
          <!-- Невидимый текст для сохранения высоты строки -->
          <span class="priority-text" aria-hidden="true">&nbsp;</span>
        </div>
      </template>

      <!-- Кастомный слот для колонки "Статус" -->
      <template #cell-status="{ value }">
        <span :class="`status-badge status-${value}`">
          {{ getStatusLabel(value) }}
        </span>
      </template>

      <!-- Кастомный слот для колонки "№ заявки" -->
      <template #cell-number="{ value }">
        <span class="ticket-number">
          {{ value }}
        </span>
      </template>

      <!-- Кастомный слот для колонки "Тема" -->
      <template #cell-subject="{ value }">
        <div class="ticket-subject" :title="value">
          {{ truncateText(value, 50) }}
        </div>
      </template>

      <template #cell-deadline="{ value, row }">
  <span
    :class="['deadline-cell', row.deadlineClass]"
  >
    {{ value }}
    <span v-if="row.deadlineClass === 'deadline-overdue'"></span>
    <span v-if="row.deadlineClass === 'deadline-approaching'"></span>
  </span>
</template>

      <!-- Кастомный слот для колонки "Редактирование" -->
      <template #cell-edit="{ row }">
        <button class="edit-btn" @click.stop="handleEdit(row)" title="Редактировать заявку">
          ✏️
        </button>
      </template>

      <!-- Слот для состояния загрузки -->
      <template #loading>
        <div class="custom-loading">
          <div class="spinner"></div>
          <span>Загрузка заявок...</span>
        </div>
      </template>

      <!-- Слот для пустого состояния -->
      <template #empty>
        <div class="custom-empty">
          <span>Заявки не найдены</span>
          <p>Попробуйте изменить параметры фильтрации</p>
        </div>
      </template>
    </UITable>

    <!-- Модальное окно карточки заявки -->
    <TicketCard
      v-if="selectedTicket"
      :visible="showModal"
      :ticket="selectedTicket"
      :mode="currentMode"
      @close="closeModal"
      @edit="handleEditTicket"
      @save="handleSaveTicket"
    />
  </div>
</template>

<script setup>
import { computed, defineProps, ref } from 'vue'
import UITable from '@/components/common/UI/UITable.vue'
import TicketCard from '@/views/admin/tickets/TicketCard.vue'
import { getUserRole } from '@/utils/auth.utils'
import {
  truncateText,
  getPriorityLabel,
  getStatusLabel,
  formatTicketsForTable
} from '@/utils/ticket.utils'

const props = defineProps({
  tickets: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  pagination: {
    type: Object,
    default: () => ({
      page: 1,
      limit: 0,
      total: 0,
    }),
  },
})

const emit = defineEmits(['rowClick', 'pageChange', 'sortChange', 'edit', 'delete'])

// Локальное состояние для модального окна
const showModal = ref(false)
const selectedTicket = ref(null)
const userRole = getUserRole()

// Преобразуем данные для таблицы с использованием утилит
const formattedTickets = computed(() => {
  return formatTicketsForTable(props.tickets)
})

const currentPage = computed(() => props.pagination.page || 1)

const columns = [
  { key: 'priority', title: '^', width: '10px' },
  { key: 'number', title: '№ заявки', width: '150px' },
  { key: 'subject', title: 'Тема', width: '300px' },
  { key: 'clientName', title: 'Клиент', width: '200px' },
  { key: 'status', title: 'Статус', width: '150px' },
  { key: 'executorName', title: 'Исполнитель', width: '180px' },
  { key: 'createdAt', title: 'Время создания', width: '160px' },
  { key: 'deadline', title: 'Срок', width: '160px' },
  { key: 'edit', title: '', width: '160px' },
]

// Добавляем режим
const currentMode = ref('view') // 'view' или 'edit'

// Обработчик редактирования из кнопки в таблице
const handleEdit = (row) => {
  // Проверяем, имеет ли пользователь права администратора
  if (userRole === 'admin') {
    selectedTicket.value = {
      ...row,
      type: row.type,
      contactPerson: row.contactPerson,
      phone: row.phone,
      email: row.email,
      description: row.description,
      workStart: row.workStart,
      workEnd: row.workEnd,
      workCost: row.workCost,
      requestMethod: row.requestMethod,
      distance: row.distance,
    }
    currentMode.value = 'edit' // Устанавливаем режим редактирования
    showModal.value = true
  } else {
    alert('У вас нет прав для редактирования заявок')
  }
}

// Обработчик клика по строке таблицы
const handleRowClick = (row) => {
  selectedTicket.value = {
    ...row,
    type: row.type,
    contactPerson: row.contactPerson,
    phone: row.phone,
    email: row.email,
    description: row.description,
    workStart: row.workStart,
    workEnd: row.workEnd,
    workCost: row.workCost,
    requestMethod: row.requestMethod,
    distance: row.distance,
  }
  currentMode.value = 'view' // Устанавливаем режим просмотра
  showModal.value = true
  emit('rowClick', row)
}

// Обработчик сохранения
const handleSaveTicket = (updatedTicket) => {
  // Здесь будет логика сохранения изменений
  console.log('Сохранение заявки:', updatedTicket)
  emit('save', updatedTicket)
  currentMode.value = 'view' // Возвращаемся в режим просмотра
}

// При закрытии модального окна сбрасываем режим
const closeModal = () => {
  showModal.value = false
  selectedTicket.value = null
  currentMode.value = 'view'
}

// Обработчик редактирования из модального окна
const handleEditTicket = (ticket) => {
  closeModal()
  emit('edit', ticket)
}

const handleSortChange = (sortOptions) => {
  emit('sortChange', sortOptions)
}

const handlePageChange = (page) => {
  emit('pageChange', page)
}
</script>

<style scoped>
.ticket-table-wrapper {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* Индикатор приоритета (цветные линии) */
.priority-indicator {
  width: 100%;
  height: 100%;
  min-height: 40px; 
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

/* Скрытый текст для сохранения высоты строки */
.priority-text {
  visibility: hidden;
  font-size: 0;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
  text-align: center;
  min-width: 70px;
}

.priority-crit {
  border-left: 10px solid #e90000;
}

.priority-high {
  border-left: 10px solid #e98c00;
}

.priority-medium {
  border-left: 10px solid #e9da00;
}

.priority-low {
  border-left: 10px solid #16bd00;
}

.status-new {
  background: #d0e2ff;
  color: rgb(11, 38, 146);
  border: 2px solid rgb(11, 38, 146);
}

.status-assigned {
  background: #d0f2ff;
  color: #1caae2;
  border: 2px solid #1caae2;
}

.status-inProgress {
  background: #fffbbf;
  color: #938900;
  border: 2px solid #d3c500;
}
.status-stopped {
  background: #f2d0ff;
  color: #8d00c5;
  border: 2px solid #8d00c5;
}
.status-completed {
  background: #d2ffcc;
  color: #16bd00;
  border: 2px solid #16bd00;
}

.status-rejected {
  background: #ffcbcb;
  color: #bd0000;
  border: 2px solid #bd0000;
}

/* Номер заявки */
.ticket-number {
  font-family: 'Courier New', monospace;
  font-weight: bold;
  color: #3b82f6;
}

/* Тема заявки */
.ticket-subject {
  max-width: 250px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Кнопка редактирования */
.edit-btn {
  width: 32px;
  height: 32px;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s;
  padding: 0;
  margin: 0 auto;
}

.edit-btn:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
  transform: scale(1.1);
}

.edit-btn:active {
  transform: scale(0.95);
}

/* Кастомные состояния */
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
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.custom-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 60px;
  color: #6c757d;
}

.custom-empty span {
  font-size: 16px;
  font-weight: 500;
}

.custom-empty p {
  font-size: 14px;
  color: #adb5bd;
}

/* Стили для сроков */

.deadline-overdue {
  color: #dc2626;
  font-weight: 600;
}

.deadline-approaching {
  color: #d97706;
  font-weight: 600;
}
</style>
