<!-- 
    Блок информации о клиенте
    Компания-клиент, контактное лицо, телефон, email, договор SLA
    Редактируется только администратором или клиентом
-->

<!-- src/components/tickets/TicketCard/ClientInfo.vue -->
<template>
  <div class="client-info-section">
    <div class="section-header">
      <h3>Информация о клиенте</h3>
      <button v-if="editable" class="edit-section-btn" @click="$emit('edit', 'client')">✏️</button>
    </div>

    <div class="info-grid">
      <div class="info-row">
        <span class="info-label">Организация:</span>
        <span class="info-value">{{ ticket.client?.name || 'Не указана' }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Контактное лицо:</span>
        <span class="info-value">{{ ticket.contactPerson || 'Не указано' }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Телефон:</span>
        <span class="info-value">{{ ticket.phone || 'Не указан' }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Email:</span>
        <span class="info-value">{{ ticket.email || 'Не указан' }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Договор SIA:</span>
        <span class="info-value">
          <a href="#" class="contract-link">Договор.pdf</a>
        </span>
      </div>
      <div class="info-row">
        <span class="info-label">Способ подачи заявки:</span>
        <span class="info-value">{{ ticket.requestMethod || 'WEB-портал' }}</span>
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
</script>

<style scoped>
.client-info-section {
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

.contract-link {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
}

.contract-link:hover {
  text-decoration: underline;
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
