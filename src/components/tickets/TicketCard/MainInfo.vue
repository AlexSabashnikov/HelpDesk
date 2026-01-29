<!-- 
    Блок основной информации заявки
    Номер, тема, описание, тип, приоритет, срок выполнения
    Редактируемые поля (зависит от роли пользователя)
    Валидация обязательных полей, автосохранение
-->

<template>
  <div class="main-info-section">
    <div class="section-header">
      <h3>Общая информация</h3>
    </div>

    <!-- Первый блок: Номер, Приоритет, Статус -->
    <div class="info-block">
      <div class="info-row">
        <div class="block-twice">
          <span class="info-label">Номер заявки</span>
          <span class="info-value ticket-number">{{ ticket.number }}</span>
        </div>
      </div>
      <div class="info-row">
        <div class="block-twice">
          <span class="info-label">Приоритет</span>
          <span :class="`priority-badge priority-${ticket.priority}`">
            {{ getPriorityLabel(ticket.priority) }}
          </span>
        </div>
      </div>
      <div class="info-row">
        <div class="block-twice">
          <span class="info-label">Статус</span>
          <span :class="`status-badge status-${ticket.status}`">
            {{ getStatusLabel(ticket.status) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Второй блок: Тип, Время создания, Срок выполнения -->
    <div class="info-block">
      <div class="info-row">
        <div class="block-twice">
          <span class="info-label">Тип</span>
          <span class="info-value ticket-type">{{ getTypeLabel(ticket.type) }}</span>
        </div>
      </div>
      <div class="info-row">
        <div class="block-twice">
          <span class="info-label">Время создания</span>
          <span class="info-value time-create">{{ ticket.createdAt }}</span>
        </div>
      </div>
      <div class="info-row">
        <div class="block-twice">
          <span class="info-label">Срок выполнения</span>
          <span :class="{ 'deadline-overdue': isOverdue }" class="info-value deadline">
            {{ ticket.deadline }}
            <span v-if="isOverdue" class="overdue-icon">⚠️</span>
          </span>
        </div>
      </div>
    </div>

    <!-- Тема (только для чтения) -->
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
      <div class="block-content subject-content">
        {{ truncateText(ticket.subject, 100) || 'Тема не указана' }}
      </div>
    </div>

    <!-- Описание задачи (только для чтения) -->
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
      <div class="block-content description-content">
        {{ truncateText(ticket.description, 500) || 'Описание отсутствует' }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

// Только объявление, без присваивания переменной
defineProps({
  ticket: {
    type: Object,
    required: true,
  },
  isOverdue: {
    type: Boolean,
    default: false,
  },
  editable: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['edit'])

const getPriorityLabel = (priority) => {
  const labels = {
    crit: 'Критический',
    high: 'Высокий',
    medium: 'Средний',
    low: 'Низкий',
  }
  return labels[priority] || priority
}

const getStatusLabel = (status) => {
  const labels = {
    new: 'Новая',
    inProgress: 'В работе',
    completed: 'Выполнена',
    stopped: 'Работа остановлена',
    assigned: 'Назначена',
    waitingPayment: 'Ждет оплаты',
    rejected: 'Отказ заказчика',
    onSite: 'Выехал на объект',
  }
  return labels[status] || status
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

const getTextLength = (text) => {
  return text ? text.length : 0
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
</script>

<style scoped>
.main-info-section {
  background: #fcfcfc;
  border: 1px solid #031432;
  border-radius: 12px;
  overflow: hidden; /* Предотвращает выход элементов за границы */
  box-sizing: border-box;
}

.section-header {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 10px;
  color: white;
  border-radius: 10px 10px 0 0;
  background: #031432;
  box-sizing: border-box;
}

.section-header h3 {
  margin: 0;
  color: #ffffff;
  font-size: 16px;
  padding-bottom: 2px;
}

/* Блоки информации с сеткой */
.info-block {
  display: grid;
  grid-template-columns: 250px 150px 150px; 
  align-items: stretch;
  padding: 0 10px;
  background: #fcfcfc;
  box-sizing: border-box;
  width: 100%;
  gap: 0;
}

.info-block > .info-row {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}

.block-twice {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
  box-sizing: border-box;
  padding: 5px 0 0 0;
}

/* Устанавливаем фиксированные ширины для конкретных полей */
.ticket-number {
  min-width: 125px;
  max-width: 125px;
  width: 125px;
}

.ticket-type {
  min-width: 220px;
  max-width: 220px;
  width: 220px;
}

.time-create,
.deadline {
  min-width: 135px;
  max-width: 135px;
  width: 135px;
}

/* Бейджи - устанавливаем такую же ширину как у временных полей */
.priority-badge,
.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 16px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  min-width: 135px;
  max-width: 135px;
  width: 135px;
  box-sizing: border-box;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 28px;
}

.info-row {
  display: flex;
  align-items: center;
  min-height: 40px;
  box-sizing: border-box;
  overflow: hidden; /* Предотвращает выход текста за границы */
}

.info-label {
  color: #8c8c8c;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.info-value {
  color: #212529;
  background-color: #fcfcfc;
  border: 1px solid rgb(152, 152, 152);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 400;
  padding: 2px 10px;
  width: 100%;
  box-sizing: border-box;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 16px;
  display: flex;
  align-items: center;
}

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
  padding: 10px;
  background: #fcfcfc;
  box-sizing: border-box;
}

.block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 5px;
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
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid rgb(152, 152, 152);
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
  box-sizing: border-box;
  width: 100%;
  overflow: auto;
  max-height: 200px; /* Ограничение высоты с прокруткой */
}

.subject-content {
  max-height: 75px; /* Меньшая высота для темы */
}

.description-content {
  max-height: 200px; /* Большая высота для описания */
}

/* Просроченный дедлайн */
.deadline-overdue {
  color: #dc3545 !important;
  font-weight: 600;
}

.overdue-icon {
  margin-left: 5px;
}
</style>
