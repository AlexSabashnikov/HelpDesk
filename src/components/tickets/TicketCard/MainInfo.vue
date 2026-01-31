<!-- 
    Блок основной информации заявки
    Номер, тема, описание, тип, приоритет, срок выполнения
    Редактируемые поля (зависит от роли пользователя)
    Валидация обязательных полей, автосохранение
-->

<template>
  <div class="ticket-section">
    <div class="ticket-section-header">
      <h3>Общая информация</h3>
    </div>

    <!-- Первый блок: Номер, Приоритет, Статус -->
    <div class="info-block">
      <div class="ticket-info-row">
        <div class="ticket-block-twice">
          <span class="ticket-info-label">Номер заявки</span>
          <span class="info-value ticket-number">{{ ticket.number }}</span>
        </div>
      </div>
      <div class="ticket-info-row">
        <div class="ticket-block-twice">
          <span class="ticket-info-label">Приоритет</span>
          <template v-if="mode === 'view'">
            <span :class="`priority-badge priority-${ticket.priority}`">
              {{ getPriorityLabel(ticket.priority) }}
            </span>
          </template>
          <UISelect 
            v-else 
            :modelValue="ticket.priority" 
            @update:modelValue="value => $emit('fieldChange', 'priority', value)"
            :options="priorityOptions"
            :customClass="`info-value priority-badge priority-${ticket.priority}`"
          />
        </div>
      </div>
      <div class="ticket-info-row">
        <div class="ticket-block-twice">
          <span class="ticket-info-label">Статус</span>
          <template v-if="mode === 'view'">
            <span :class="`status-badge status-${ticket.status}`">
              {{ getStatusLabel(ticket.status) }}
            </span>
          </template>
          <UISelect 
            v-else 
            :modelValue="ticket.status" 
            @update:modelValue="value => $emit('fieldChange', 'status', value)"
            :options="statusOptions"
            :customClass="`info-value status-badge status-badge-edit status-${ticket.status}`"
          />
        </div>
      </div>
    </div>

    <!-- Второй блок: Тип, Время создания, Срок выполнения -->
    <div class="info-block">
      <div class="ticket-info-row">
        <div class="ticket-block-twice">
          <span class="ticket-info-label">Тип</span>
          <template v-if="mode === 'view'">
            <span class="info-value ticket-type">{{ getTypeLabel(ticket.type) }}</span>
          </template>
          <UISelect 
            v-else 
            :modelValue="ticket.type" 
            @update:modelValue="value => $emit('fieldChange', 'type', value)"
            :options="typeOptions"
            customClass="info-value ticket-type"
          />
        </div>
      </div>
      <div class="ticket-info-row">
        <div class="ticket-block-twice">
          <span class="ticket-info-label">Время создания</span>
          <span class="info-value time-create">{{ ticket.createdAt }}</span>
        </div>
      </div>
      <div class="ticket-info-row">
        <div class="ticket-block-twice">
          <span class="ticket-info-label">Срок выполнения</span>
          <template v-if="mode === 'view'">
            <span :class="{ 'deadline-overdue': isOverdue }" class="info-value deadline">
              {{ formatDate(ticket.deadline) || 'Не указан' }}
            </span>
          </template>
          <input v-if="mode==='edit'"
            type="datetime-local" 
            :value="formatDateTimeLocal(ticket.deadline)"
            @input="$emit('fieldChange', 'deadline', $event.target.value)"
            :class="{ 'deadline-overdue': isOverdue }"
            class="info-value deadline-edit"
          />
        </div>
      </div>
    </div>

    <!-- Тема -->
    <div class="readonly-block">
      <div class="block-header">
        <span class="block-label">Тема</span>
        <span v-if="getTextLength(ticket.subject) > 100" class="char-count char-count-warning">
          {{ getTextLength(ticket.subject) }}/100
        </span>
        <span v-else class="char-count">
          {{ getTextLength(ticket.subject) }}/100
        </span>
      </div>
      <template v-if="mode === 'view'">
        <div class="block-content subject-content">
          {{ truncateText(ticket.subject, 100) || 'Тема не указана' }}
        </div>
      </template>
      <textarea 
        v-else 
        :value="ticket.subject" 
        @input="$emit('fieldChange', 'subject', $event.target.value)"
        class="block-content edit-textarea subject-content"
        maxlength="100"
        placeholder="Введите тему заявки..."
      ></textarea>
    </div>

    <!-- Описание задачи -->
    <div class="readonly-block">
      <div class="block-header">
        <span class="block-label">Описание</span>
        <span v-if="getTextLength(ticket.description) > 500" class="char-count char-count-warning">
          {{ getTextLength(ticket.description) }}/500
        </span>
        <span v-else class="char-count">
          {{ getTextLength(ticket.description) }}/500
        </span>
      </div>
      <template v-if="mode === 'view'">
        <div class="block-content description-content">
          {{ truncateText(ticket.description, 500) || 'Описание отсутствует' }}
        </div>
      </template>
      <textarea 
        v-else 
        :value="ticket.description" 
        @input="$emit('fieldChange', 'description', $event.target.value)"
        class="block-content edit-textarea description-content"
        maxlength="500"
        placeholder="Введите описание задачи..."
      ></textarea>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue'
import UISelect from '@/components/common/UI/UISelect.vue'
import { getPriorityLabel, getStatusLabel, truncateText } from '@/utils/ticket.utils'
import { formatDate, formatDateTimeLocal, isDeadlineOverdue } from '@/utils/date.utils'

const props = defineProps({
  ticket: {
    type: Object,
    required: true,
  },
  mode: {
    type: String,
    default: 'view',
  },
  userRole: {
    type: String,
    default: 'guest',
  },
})

const emit = defineEmits(['editSection', 'fieldChange'])

const isOverdue = computed(() => {
  return isDeadlineOverdue(props.ticket.deadline)
})

// Локальная функция для обработки изменений
const handleFieldChange = (field, value) => {
  console.log(`Field ${field} changed to:`, value)
  emit('fieldChange', field, value)
}

// Опции для выпадающих списков
const priorityOptions = computed(() => [
  { value: 'crit', label: 'Критический' },
  { value: 'high', label: 'Высокий' },
  { value: 'medium', label: 'Средний' },
  { value: 'low', label: 'Низкий' }
])

const statusOptions = computed(() => [
  { value: 'new', label: 'Новая' },
  { value: 'assigned', label: 'Назначена' },
  { value: 'inProgress', label: 'В работе' },
  { value: 'onSite', label: 'Выехал на объект' },
  { value: 'completed', label: 'Выполнена' },
  { value: 'stopped', label: 'Работа остановлена' },
  { value: 'rejected', label: 'Отказ заказчика' }
])

// Используем утилиты для форматирования
const getTextLength = (text) => {
  return text ? text.length : 0
}

const getTypeLabel = (type) => {
  const labels = {
    onsite: 'Выездная заявка',
    remote: 'Удаленная заявка',
    phone: 'Телефонная заявка',
    web: 'WEB-заявка',
  }
  return labels[type] || type || 'Не указан'
}

const typeOptions = computed(() => [
  { value: 'onsite', label: 'Выездная заявка' },
  { value: 'remote', label: 'Удаленная заявка' },
  { value: 'phone', label: 'Телефонная заявка' },
  { value: 'web', label: 'WEB-заявка' }
])

</script>

<style scoped>
@import '@/assets/styles/ticket-card.css';

/* Блоки информации с сеткой */
.info-block {
  display: grid;
  grid-template-columns: 235px 145px 185px; 
  align-items: stretch;
  padding: 0 10px;
  background: #fcfcfc;
  box-sizing: border-box;
  width: 100%;
  gap: 0;
}

/* Устанавливаем фиксированные ширины для конкретных полей */
.ticket-number {
  min-width: 125px;
  max-width: 125px;
  width: 125px;
}

.ticket-type {
  min-width: 200px;
  max-width: 215px;
  width: 215px;
}

.ticket-type.ui-select {
  min-width: 200px !important;
  max-width: 215px !important;
  width: 215px !important;
}


.time-create{
  min-width: 115px;
  max-width: 125px;
  width: 125px;
}
.deadline {
  min-width: 135px;
  max-width: 135px;
  width: 135px;
}

.deadline-edit {
  width: 100%;
  box-sizing: border-box;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 16px;
  min-width: 160px;
  max-width: 160px;
  width: 160px;
  display: flex;
  align-items: left;
  min-height: 28px;
  height: 28px;
  padding: 2px 50px 2px 8px; /* Уменьшаем правый отступ */
  cursor: pointer;
  outline: none;
  font-family: inherit;
  position: relative;
  background-size: 12px 12px;
}

/* Убираем стандартный индикатор календаря */
.deadline-edit::-webkit-calendar-picker-indicator {
  width: 15px; /* Уменьшаем ширину */
  position: absolute;
  padding-left: 130px; /* Пододвигаем ближе к краю */
  cursor: pointer;
}

/* Бейджи - устанавливаем такую же ширину как у временных полей */
.priority-badge,
.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  border-radius: 8px;
  font-size: 12px !important;
  font-weight: 600 !important;
  min-width: 135px;
  max-width: 135px;
  width: 135px;
  box-sizing: border-box;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 28px;
}

.priority-badge{
  min-width: 115px;
  max-width: 125px;
  width: 125px;
}


.status-badge{
  min-width: 115px;
  max-width: 135px;
  width: 135px;
}

.status-badge-edit{
  min-width: 125px;
  max-width: 160px;
  width: 160px;
}

.info-value {
  color: #212529;
  background-color: #fcfcfc;
  border: 1px solid rgb(152, 152, 152);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 400;
  padding: 2px 6px;
  width: 100%;
  box-sizing: border-box;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 16px;
  display: flex;
  align-items: left;
}

/* Стили для селектов в режиме редактирования */
.info-value.ui-select {
  padding: 2px 6px;
  min-height: 28px;
  height: 28px;
  border-width: 2px !important;
  border-style: solid !important;
  font-size: 14px;
  background-position: calc(100% - 6px) center;
}

/* Сохраняем цвета приоритетов для селектов */
.info-value.ui-select.priority-crit {
  background-color: #ffe3e3 !important;
  color: #e90000 !important;
  border-color: #e90000 !important;
}

.info-value.ui-select.priority-high {
  background-color: #fff3cd !important;
  color: #e98c00 !important;
  border-color: #e98c00 !important;
}

.info-value.ui-select.priority-medium {
  background-color: #fffcd6 !important;
  color: #ccbe00 !important;
  border-color: #e9da00 !important;
}

.info-value.ui-select.priority-low {
  background-color: #d2ffcc !important;
  color: #16bd00 !important;
  border-color: #16bd00 !important;
}

/* Сохраняем цвета статусов для селектов */
.info-value.ui-select.status-new {
  background-color: #d0e2ff !important;
  color: rgb(11, 38, 146) !important;
  border-color: rgb(11, 38, 146) !important;
}

.info-value.ui-select.status-inProgress {
  background-color: #fffbbf !important;
  color: #938900 !important;
  border-color: #d3c500 !important;
}

.info-value.ui-select.status-completed {
  background-color: #d2ffcc !important;
  color: #16bd00 !important;
  border-color: #16bd00 !important;
}

.info-value.ui-select.status-assigned {
  background-color: #d0f2ff !important;
  color: #1caae2 !important;
  border-color: #1caae2 !important;
}

.info-value.ui-select.status-stopped {
  background-color: #f2d0ff !important;
  color: #8d00c5 !important;
  border-color: #8d00c5 !important;
}

.info-value.ui-select.status-rejected {
  background-color: #ffcbcb !important;
  color: #bd0000 !important;
  border-color: #bd0000 !important;
}

.info-value.ui-select.status-onSite {
  background-color: #e6fffa !important;
  color: #008080 !important;
  border-color: #008080 !important;
}

/* Стиль для селекта типа заявки */
.info-value.ui-select.ticket-type {
  min-width: 220px;
  max-width: 245px;
  width: 245px;
  background-color: #fcfcfc !important;
  color: #212529 !important;
  border-color: rgb(152, 152, 152) !important;
  border-width: 1px !important;
  font-weight: 400;
}

/* Цвета приоритетов */
.priority-crit {
  background: #ffe3e3;
  color: #e90000;
  border: 2px solid #e90000;
}

.priority-high {
  background: #fff3cd;
  color: #e98c00;
  border: 2px solid #e98c00;
}

.priority-medium {
  background: #fffcd6;
  color: #ccbe00;
  border: 2px solid #e9da00;
}

.priority-low {
  background: #d2ffcc;
  color: #16bd00;
  border: 2px solid #16bd00;
}

/* Цвета статусов */
.status-new {
  background: #d0e2ff;
  color: rgb(11, 38, 146);
  border: 2px solid rgb(11, 38, 146);
}

.status-inProgress {
  background: #fffbbf;
  color: #938900;
  border: 2px solid #d3c500;
}

.status-completed {
  background: #d2ffcc;
  color: #16bd00;
  border: 2px solid #16bd00;
}

.status-assigned {
  background: #d0f2ff;
  color: #1caae2;
  border: 2px solid #1caae2;
}

.status-stopped {
  background: #f2d0ff;
  color: #8d00c5;
  border: 2px solid #8d00c5;
}

.status-rejected {
  background: #ffcbcb;
  color: #bd0000;
  border: 2px solid #bd0000;
}

.status-onSite {
  background: #e6fffa;
  color: #008080;
  border: 2px solid #008080;
}

/* Только для чтения блоки */
.readonly-block {
  padding-left: 10px;
  padding-right: 10px;
  background: #fcfcfc;
  box-sizing: border-box;
}

.block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 5px;
}

.block-label {
  color: #8c8c8c;
  font-size: 12px;
  font-weight: 500;
}

.char-count {
  color: #6c757d;
  font-size: 8px;
  font-weight: 400;
}

.char-count-warning {
  color: #dc3545;
  font-weight: 400;
}

.block-content {
  color: #212529;
  font-size: 14px;
  padding: 4px 10px;
  border-radius: 10px;
  border: 1px solid rgb(152, 152, 152);
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
  box-sizing: border-box;
  width: 100%;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgb(152, 152, 152) transparent;
  max-height: 200px;
  min-height: 30px;
}

.edit-textarea {
  min-height: 30px !important;
  resize: vertical; /* Только вертикальное изменение размера */
}

.subject-content {
  max-height: 75px;
}

.description-content {
  max-height: 190px;
}

/* Просроченный дедлайн */
.deadline-overdue {
  color: #dc3545 !important;
  font-weight: 600;
}

.overdue-icon {
  margin-left: 5px;
}

/* Кнопка редактирования секции */
.edit-section-btn {
  background: #4dabf7;
  color: white;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.edit-section-btn:hover {
  background: #339af0;
  transform: scale(1.1);
}
</style>

