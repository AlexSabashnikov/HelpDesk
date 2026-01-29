<!-- 
    Блок исполнения заявки
    Исполнитель, плановое время работ, стоимость
    Материалы и ТМЦ (таблица с добавлением/удалением)
    Доступен для редактирования инженером и администратором
-->

<template>
  <div class="execution-section">
    <div class="section-header">
      <h3>Исполнение</h3>
    </div>

    <!-- Первый блок: Исполнитель, Начало работы -->
    <div class="info-block">
      <div class="info-row">
        <div class="block-twice">
          <span class="info-label">Исполнитель</span>
          <span class="info-value executor">{{ ticket.executor?.name || 'Не назначен' }}</span>
        </div>
      </div>
      <div class="info-row">
        <div class="block-twice">
          <span class="info-label">Начало работы</span>
          <span class="info-value work-start">{{ formatDate(ticket.workStart) || 'Не начато' }}</span>
        </div>
      </div>
    </div>

    <!-- Второй блок: Окончание работы, Стоимость работ -->
    <div class="info-block">
      <div class="info-row">
        <div class="block-twice">
          <span class="info-label">Окончание работы</span>
          <span class="info-value work-end">{{ formatDate(ticket.workEnd) || 'Не завершено' }}</span>
        </div>
      </div>
      <div class="info-row">
        <div class="block-twice">
          <span class="info-label">Стоимость работ</span>
          <span class="info-value work-cost">{{ 
            ticket.workCost ? `${ticket.workCost} р.` : 'Не указана' 
          }}</span>
        </div>
      </div>
    </div>

    <!-- Материалы (статичные данные) -->
    <div v-if="materialStatus(ticket.status)" class="materials-block">
      <div class="block-header">
        <span class="block-label">Материалы</span>
      </div>
      <div class="materials-table">
        <div class="materials-row header-row">
          <div class="material-col name-col">Наименование</div>
          <div class="material-col quantity-col">Количество</div>
          <div class="material-col price-col">Стоимость</div>
        </div>
        <div class="materials-row">
          <div class="material-col name-col">Роутер TP-Link Archer AX10</div>
          <div class="material-col quantity-col">1 шт.</div>
          <div class="material-col price-col">4975 р.</div>
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

// Статусы при которых можно назначить ТМЦ
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
  background: #fcfcfc;
  border: 1px solid #031432;
  border-radius: 12px;
  overflow: hidden;
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
  grid-template-columns: repeat(2, 1fr);
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

/* Фиксированные ширины для полей */
.executor,
.work-start,
.work-end,
.work-cost {
  min-width: 180px;
  max-width: 180px;
  width: 180px;
}

.info-row {
  display: flex;
  align-items: center;
  min-height: 40px;
  box-sizing: border-box;
  overflow: hidden;
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

/* Блок материалов */
.materials-block {
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

/* Таблица материалов */
.materials-table {
  border: 1px solid rgb(152, 152, 152);
  border-radius: 10px;
  overflow: hidden;
  background: white;
  box-sizing: border-box;
}

.materials-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  align-items: center;
  min-height: 36px;
  padding: 8px 10px;
  border-bottom: 1px solid rgb(152, 152, 152);
  box-sizing: border-box;
}

.materials-row:last-child {
  border-bottom: none;
}

.header-row {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #031432;
  border-bottom: 2px solid #031432;
}

.material-col {
  padding: 0 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.name-col {
  color: #212529;
}

.quantity-col {
  color: #6c757d;
  text-align: center;
}

.price-col {
  color: #28a745;
  font-weight: 500;
  text-align: right;
}
</style>
