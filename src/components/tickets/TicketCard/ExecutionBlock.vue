<!-- 
    Блок исполнения заявки
    Исполнитель, плановое время работ, стоимость
    Материалы и ТМЦ (таблица с добавлением/удалением)
    Доступен для редактирования инженером и администратором
-->

<template>
  <div class="ticket-section">
    <div class="ticket-section-header">
      <h3>Исполнение</h3>
    </div>

    <!-- Первый блок: Исполнитель, Начало работы -->
    <div class="info-block">
      <div class="ticket-info-row">
        <div class="ticket-block-twice">
          <span class="ticket-info-label">Исполнитель</span>
          <div class="value-with-button">
            <template  v-if="mode === 'view'">
              <span class="info-value">{{ ticket.executor?.name || 'Не указан' }}</span>
            </template>
            <UISelect v-else 
              :modelValue="ticket.executor?.name" 
              @update:modelValue="value => $emit('fieldChange', 'executor', value)"
              :options="executorOptions"
              customClass="info-value executor-name"
          />
          <button 
            class="ticket-profile-button" 
            @click="$emit('goToProfile', 'user', ticket.executor.id)"
            title="Перейти в профиль исполнителя"
          >
            →
          </button>
        </div>
        </div>
      </div>
      <div class="ticket-info-row">
        <div class="ticket-block-twice">
          <span class="ticket-info-label">Начало работы</span>
          <template v-if="mode==='view'">
            <span class="info-value work-start">{{ formatDate(ticket.workStart) || 'Не начато' }}</span>
          </template>
          <input v-if="mode==='edit'"
            type="datetime-local" 
            :value="formatDateTimeLocal(ticket.workStart)"
            @input="$emit('fieldChange', 'workStart', $event.target.value)"
            class="info-value work-end-edit"
          />
        </div>
      </div>
      
      
    </div>

    <!-- Второй блок: Окончание работы, Стоимость работ -->
    <div class="info-block">
      <div class="ticket-info-row">
        <div class="ticket-block-twice">
          <span class="ticket-info-label">Стоимость работ</span>
          <template v-if="mode==='view'">
          <span  class="info-value work-cost">{{ 
            ticket.workCost ? `${ticket.workCost} р.` : 'Не указана' 
          }}</span>
          </template>
          <input v-else
            :type="text"
            :value="ticket.workCost" 
            @input="$emit('fieldChange', 'workCost', $event.target.value)"
            class="info-value work-cost"
            placeholder="Введите стоимость..."
          />
        </div>
      </div>
      <div class="ticket-info-row">
        <div class="ticket-block-twice">
          <span class="ticket-info-label">Окончание работы</span>
          <template v-if="mode==='view'">
            <span class="info-value work-end">{{ formatDate(ticket.workEnd) || 'Не завершено' }}</span>
          </template>
          <input v-if="mode==='edit'"
            type="datetime-local" 
            :value="formatDateTimeLocal(ticket.workEnd)"
            @input="$emit('fieldChange', 'workEnd', $event.target.value)"
            class="info-value work-end-edit"
          />
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
          <div class="material-col price-one-col">Цена шт.</div>
          <div class="material-col quantity-col">Кол-во</div>
          <div class="material-col price-col">Сумма</div>
        </div>
        <div class="materials-row">
          <div class="material-col name-col">Роутер TP-Link Archer AX10</div>
          <div class="material-col name-col">4975 р.</div>
          <div class="material-col quantity-col">1 шт.</div>
          <div class="material-col price-col">4975 р.</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue'
import UISelect from '@/components/common/UI/UISelect.vue'
import { formatDate, formatDateTimeLocal } from '@/utils/date.utils'

defineProps({
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

// Локальная функция для обработки изменений
const handleFieldChange = (field, value) => {
  console.log(`Field ${field} changed to:`, value)
  emit('fieldChange', field, value)
}

const executorOptions = computed(() => [
  { value: 'Иванов И.И.', label: 'Иванов И.И.' },
])

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
@import '@/assets/styles/ticket-card.css';
/* Блоки информации с сеткой */
.info-block {
  display: grid;
  grid-template-columns: 364px 200px;
  align-items: stretch;
  padding-left: 10px;
  padding-right: 10px;
  background: #fcfcfc;
  box-sizing: border-box;
  width: 100%;
  gap: 0;
}

/* Фиксированные ширины для полей */
.work-start,
.work-end {
  min-width: 180px;
  max-width: 180px;
  width: 180px;
}

.executor,
.work-cost{
  min-width: 170px;
  max-width: 200px;
  width: 170px;
}

.info-value {
  color: #212529;
  background-color: #fcfcfc;
  border: 1px solid rgb(152, 152, 152);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 400;
  padding: 2px 10px;
  box-sizing: border-box;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 16px;
  display: flex;
  align-items: center;
}

/* Контейнер для значения с кнопкой */
.value-with-button {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.value-with-button .info-value {
  flex: 1;
  min-width: 0; /* Переопределяем минимальную ширину для правильного flex-сжатия */
  max-width: calc(100% - 60px); /* Учитываем кнопку */
}

/* Блок материалов */
.materials-block {
  padding-left: 10px;
  padding-right: 10px;
  padding-bottom: 10px;
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

/* Таблица материалов */
.materials-table {
  border: 1px solid rgb(152, 152, 152);
  border-radius: 10px;
  overflow: hidden;
  background: white;
  box-sizing: border-box;
  overflow: auto;
  scrollbar-width: thin;
  scrollbar-color: rgb(152, 152, 152) rgba(0, 0, 0, 0);
  max-height: 300px;
}

.materials-row {
  display: grid;
  grid-template-columns: 4fr 1fr 1fr 1fr;
  font-size: 14px;
  align-items: center;
  min-height: 36px;
  padding: 6px 8px;
  border-bottom: 1px solid rgb(152, 152, 152);
  box-sizing: border-box;
  position: relative;
}

.materials-row:last-child {
  border-bottom: none;
}

.header-row {
  background-color: #f8f9fa;
  font-weight: 500;
  color: #031432;
  border-bottom: 2px solid #031432;
  position: sticky;
  z-index: 10;
  top: 0;
}

.material-col {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.name-col {
  color: #212529;
}

.price-one-col {
  color: #212529;
  text-align: left;
}

.quantity-col {
  color: #212529;
  text-align: left;
}

.price-col {
  color: #28a745;
  font-weight: 500;
  text-align: left;
}

.work-end-edit {
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
.work-end-edit::-webkit-calendar-picker-indicator {
  width: 15px; /* Уменьшаем ширину */
  position: absolute;
  padding-left: 130px; /* Пододвигаем ближе к краю */
  cursor: pointer;
}
</style>
