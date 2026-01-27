<!-- 
    Блок исполнения заявки
    Исполнитель, плановое время работ, стоимость
    Материалы и ТМЦ (таблица с добавлением/удалением)
    Доступен для редактирования инженером и администратором
-->

<!-- src/components/tickets/TicketCard/ExecutionBlock.vue -->
<template>
  <div class="execution-section">
    <div class="section-header">
      <h3>Исполнение</h3>
    </div>

    <div class="info-grid">
      <div class="info-row">
        <span class="info-label">Исполнитель:</span>
        <span class="info-value">{{ ticket.executor?.name || 'Не назначен' }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Начало работы:</span>
        <span class="info-value">{{ formatDate(ticket.workStart) || 'Не начато' }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Окончание работы:</span>
        <span class="info-value">{{ formatDate(ticket.workEnd) || 'Не завершено' }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Стоимость работ:</span>
        <span class="info-value">{{
          ticket.workCost ? ticket.workCost + ' р.' : 'Не указана'
        }}</span>
      </div>
    </div>

    <!-- Материалы (статичные данные) -->
    <div class="materials-section" v-if=materialStatus(ticket.status)>
      <strong>Материалы:</strong>
      <div class="materials-table">
        <div class="materials-row">
          <div class="material-name">Роутер TP-Link Archer AX10</div>
          <div class="material-quantity">1 шт.</div>
          <div class="material-price">4975 р.</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

defineProps({
  ticket: {
    type: Object,
    required: true,
  },
  editable: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['edit'])

const formatDate = (dateString) => {
  if (!dateString) return ''

  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Неверный формат'

    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')

    return `${day}.${month}.${year} ${hours}:${minutes}`
  } catch {
    return 'Ошибка даты'
  }
}

//Статусы при которых можно назначить ТМЦ
const materialStatus = (ticketStatus) => {
  if(ticketStatus === 'completed' ||
    ticketStatus === 'inProgress' ||
    ticketStatus === 'assigned' ||
    ticketStatus === 'stopped' ||
    ticketStatus === 'rejected'
  ){
    return true;
  }
}
</script>

<style scoped>
.execution-section {
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-header h3 {
  margin: 0;
  color: #343a40;
  font-size: 16px;
  padding-bottom: 8px;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  align-items: center;
  min-height: 32px;
}

.info-label {
  width: 160px;
  color: #6c757d;
  font-size: 14px;
  flex-shrink: 0;
}

.info-value {
  flex: 1;
  color: #212529;
  font-size: 14px;
  font-weight: 500;
}

.materials-section {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e0e0e0;
}

.materials-table {
  margin-top: 10px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
}

.materials-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  padding: 12px 15px;
  border-bottom: 1px solid #f1f1f1;
}

.materials-row:last-child {
  border-bottom: none;
}

.material-name {
  color: #212529;
}

.material-quantity {
  color: #6c757d;
  text-align: center;
}

.material-price {
  color: #28a745;
  font-weight: 600;
  text-align: right;
}
</style>
