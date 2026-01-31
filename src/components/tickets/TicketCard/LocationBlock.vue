<!-- 
    Блок местоположения
    Адрес объекта, карта, расстояние, время в пути
    Автоматический расчёт по выбранному адресу
    Только для просмотра
-->

<!-- src/components/tickets/TicketCard/LocationBlock.vue -->
<template>
  <div class="ticket-section">
    <div class="ticket-section-header">
      <h3>Местоположение</h3>
    </div>

    <div class="location-info">
      <div class="ticket-block-twice">
        <span class="ticket-info-label">Адрес объекта:</span>
        <span class="info-value">{{ ticket.address || 'Не указан' }}</span>
      </div>
      <div class="info-block">
      <div class="ticket-block-twice">
        <span class="ticket-info-label">Расстояние до объекта:</span>
        <span class="info-value">{{ ticket.distance || 'Не указано' }}</span>
      </div>
      <div class="ticket-block-twice">
        <span class="ticket-info-label">Примерное время в пути:</span>
        <span class="info-value">{{ ticket.estimatedTravelTime || 'Не рассчитано' }}</span>
      </div>
    </div>
    </div>

    <div class="map-placeholder" v-if="!showMap">
      <span>Карта не отображается в данном режиме</span>
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
  editable: {
    type: Boolean,
    default: false,
  },
  showMap: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['editSection', 'fieldChange'])

// Локальная функция для обработки изменений
const handleFieldChange = (field, value) => {
  console.log(`Field ${field} changed to:`, value)
  emit('fieldChange', field, value)
}
</script>

<style scoped>
@import '@/assets/styles/ticket-card.css';
.location-info {
  padding-left: 10px;
  padding-right: 10px;
  background: #fcfcfc;
  box-sizing: border-box;
  display: grid;
}

.info-block {
  display: grid;
  grid-template-columns: 200px 200px; 
  align-items: stretch;
  background: #fcfcfc;
  box-sizing: border-box;
  width: 100%;
  gap: 0;
}

.info-value {
  flex: 1;
  color: #212529;
  background-color: #fcfcfc;
  border: 1px solid rgb(152, 152, 152);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 400;
  min-width: 160px;
  max-width: 545px;
  max-height: 50px;
  min-height: 20px;
  padding: 2px 10px;
  box-sizing: border-box;
  white-space: pre-wrap;
  overflow: hidden;
  text-overflow: ellipsis;

  display: flex;
  align-items: center;
}

.map-placeholder {
  margin: 10px 10px 0 10px;
  min-height: 200px;
  max-height: 220px;
  background: #e9ecef;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  font-style: italic;
  border: 1px solid #031432;
}
</style>