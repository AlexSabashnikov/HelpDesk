<!-- 
    Блок местоположения
    Адрес объекта, карта, расстояние, время в пути
    Автоматический расчёт по выбранному адресу
    Только для просмотра
-->

<!-- src/components/tickets/TicketCard/LocationBlock.vue -->
<template>
  <div class="location-section">
    <div class="section-header">
      <h3>Местоположение</h3>
      <button v-if="editable" class="edit-section-btn" @click="$emit('edit', 'location')">
        ✏️
      </button>
    </div>

    <div class="location-info">
      <div class="info-row">
        <span class="info-label">Расстояние до объекта:</span>
        <span class="info-value">{{ ticket.distance || 'Не указано' }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Адрес:</span>
        <span class="info-value">{{ ticket.address || 'Не указан' }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Примерное время в пути:</span>
        <span class="info-value">{{ ticket.estimatedTravelTime || 'Не рассчитано' }}</span>
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

defineEmits(['edit'])
</script>

<style scoped>
.location-section {
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

.location-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.info-row {
  display: flex;
  align-items: center;
  min-height: 32px;
}

.info-label {
  width: 180px;
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

.map-placeholder {
  height: 200px;
  background: #e9ecef;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  font-style: italic;
}

@media (max-width: 768px) {
  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }

  .info-label {
    width: 100%;
  }
}
</style>
