<!-- 
    Блок информации о клиенте
    Компания-клиент, контактное лицо, телефон, email, договор SLA
    Редактируется только администратором или клиентом
-->

<!-- src/components/tickets/TicketCard/ClientInfo.vue -->
<template>
  <div class="ticket-section">
    <div class="ticket-section-header">
      <h3>Информация о клиенте</h3>
    </div>

    <div class="info-grid">
      <div class="ticket-block-twice">
        <span class="ticket-info-label">Организация:</span>
        <div class="value-with-button">
          <span class="info-value">{{ ticket.client?.name || 'Не указана' }}</span>
          <button 
            class="ticket-profile-button" 
            @click="$emit('goToProfile', 'company', ticket.client.id)"
            title="Перейти в профиль компании"
          >
            →
          </button>
        </div>
      </div>
      <div class="ticket-block-twice">
        <span class="ticket-info-label">Контактное лицо:</span>
        <div class="value-with-button">
          <span class="info-value">{{ ticket.contactPerson || 'Не указано' }}</span>
          <button 
            class="ticket-profile-button" 
            @click="$emit('goToProfile', 'user', ticket.contactPersonId)"
            title="Перейти в профиль контакта"
          >
            →
          </button>
        </div>
      </div>
      <div class="ticket-block-twice">
        <span class="ticket-info-label">Телефон:</span>
        <span class="info-value">{{ ticket.phone || 'Не указан' }}</span>
      </div>
      <div class="ticket-block-twice">
        <span class="ticket-info-label">Email:</span>
        <span class="info-value">{{ ticket.email || 'Не указан' }}</span>
      </div>
      <div class="ticket-block-twice">
        <span class="ticket-info-label">Договор SLA:</span>
        <span class="info-value">
          <a href="#" class="contract-link">Договор.pdf</a>
        </span>
      </div>
      <div class="ticket-block-twice">
        <span class="ticket-info-label">Способ подачи заявки:</span>
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

const emit = defineEmits(['editSection', 'fieldChange','goToProfile'])

// Локальная функция для обработки изменений
const handleFieldChange = (field, value) => {
  console.log(`Field ${field} changed to:`, value)
  emit('fieldChange', field, value)
}
</script>

<style scoped>
@import '@/assets/styles/ticket-card.css';
.info-grid {
  padding-left: 10px;
  padding-right: 10px;
  background: #fcfcfc;
  box-sizing: border-box;
  display: grid;
}

.info-value {
  flex: 1;
  color: #212529;
  background-color: #fcfcfc;
  border: 1px solid rgb(152, 152, 152);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 400;
  padding: 2px 10px;
  min-width: 220px;
  max-width: 490px;
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
  min-width: 220px;
  max-width: 490px;
}

.value-with-button .info-value {
  flex: 1;
  min-width: 0; /* Переопределяем минимальную ширину для правильного flex-сжатия */
  max-width: calc(100% - 170px); /* Учитываем кнопку */
}

.contract-link {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

.contract-link:hover {
  text-decoration: underline;
}
</style>