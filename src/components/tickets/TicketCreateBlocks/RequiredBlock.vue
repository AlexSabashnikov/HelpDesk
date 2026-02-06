<!-- 
    Блок обязательной информации заявки в режиме создания
    Обязательные поля администратора: (Тема, Описание, Тип, Приоритет, Организация-клиент, офис)
    Обязательные поля клиента: (Тема, Описание, Тип, Приоритет)
    Поля дедлайн, местоположение, статус подставляются автоматически
-->

<template>
  <div class="ticket-section">
    <div class="ticket-section-header">
      <h3>Обязательный блок</h3>
    </div>

    <div class="ticket-create-block-content">
        <!-- Столбец 1: Тема и Описание -->
      <div class="column column-1">
        <div class="horizontal-row">
          <div class="info-block-create horizontal-item">
            <UISelect 
              :modelValue="ticket.type" 
              @update:modelValue="value => onFieldChange('type', value)"
              :options="typeOptions"
              placeholder="Выберите тип..."
              label="Тип"
            />
          </div>
          <div class="info-block-create horizontal-item">
            <UISelect 
              :modelValue="ticket.priority" 
              @update:modelValue="value => onFieldChange('priority', value)"
              :options="priorityOptions"
              placeholder="Выберите приоритет..."
              label="Приоритет"
              :backgroundColor="priorityColors.background"
              :textColor="priorityColors.color"
              :borderColor="priorityColors.border"
            />
          </div>
          <div class="info-block-create horizontal-item">
            <UIComboBox 
              :modelValue="ticket.client.name"
              @update:modelValue="value => onFieldChange('client', value)"
              :options="clientOptions"
              optionLabel="name"
              optionValue="id"
              placeholder="Выберите организацию..."
              label="Организация"
            />
          </div>
        </div>
        
        <div class="info-block-create">
          <UITextarea 
            :modelValue="ticket.subject" 
            @update:modelValue="value => onFieldChange('subject', value)"
            placeholder="Введите тему заявки..."
            label="Тема"
            :maxLength="100"
            :showCharCount="true"
            :rows="1"
            :minHeight="'30px'"
            :maxHeight="'60px'"
          />
        </div>

        <div class="info-block-create">
          <UITextarea 
            :modelValue="ticket.description" 
            @update:modelValue="value => onFieldChange('description', value)"
            placeholder="Введите описание задачи..."
            label="Описание"
            :maxLength="1000"
            :showCharCount="true"
            :rows="7"
            :minHeight="'45px'"
            :maxHeight="'180px'"
          />
        </div>
      </div>
        
      
      <!-- Столбец 2: Статус, Срок выполнения, Контактное лицо, телефон, email, Договор -->
      <div class="column column-2">
        <div class="info-block-create">
          <UILabel 
            :modelValue="getStatusLabel(ticket.status)"
            label="Статус"
            emptyText="Не указан"
            :backgroundColor="statusColors.background"
            :textColor="statusColors.color"
          />
        </div>
        
        <div class="info-block-create">
          <UIInput 
            :modelValue="formatDateTimeLocal(ticket.deadline)"
            @update:modelValue="value => onFieldChange('deadline', value)"
            label="Срок выполнения"
            type="datetime-local"
            :textColor="invalidColors(ticket.deadline).color"
          />
        </div>
        
        <div class="info-block-create">
          <UILabel 
            :modelValue="ticket.contactPerson"
            label="Контактное лицо"
            emptyText="Автоматическое поле"
          />
        </div>
        
        <div class="info-block-create">
          <UILabel 
            :modelValue="ticket.phone"
            label="Телефон"
            emptyText="Автоматическое поле"
          />
        </div>
        
        <div class="info-block-create">
          <UILabel 
            :modelValue="ticket.email"
            label="Email"
            emptyText="Автоматическое поле"
          />
        </div>
        
        <div class="info-block-create">
          <UILabel 
            :modelValue="ticket.contract"
            label="Договор SLA"
            emptyText="Автоматическое поле"
            :isLink="true"
          >
            <template #append>
              <a v-if="ticket.contract" href="#" class="contract-link" @click.prevent="openContract">Договор.pdf</a>
            </template>
          </UILabel>
        </div>
      </div>
    </div>
    </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue'
import UISelect from '@/components/common/UI/UISelect.vue'
import UIComboBox from '@/components/common/UI/UIComboBox.vue'
import UITextarea from '@/components/common/UI/UITextarea.vue'
import UIInput from '@/components/common/UI/UIInput.vue'
import UILabel from '@/components/common/UI/UILabel.vue'

// Импорт утилит
import { 
  getStatusLabel,
  getStatusColors,
  getPriorityColors
} from '@/utils/ticket.utils'
import { formatDateTimeLocal, isInvalidDate } from '@/utils/date.utils'
import { 
  getTicketTypeOptions, 
  getTicketPriorityOptions, 
  getClientOptions
} from '@/utils/select.options.utils'
import { handleFieldChange, createTicketValidators } from '@/utils/form.utils'

//import { getStatusLabel } from '@/utils/ticket.utils'
//import { formatDateTimeLocal, isDeadlineOverdue } from '@/utils/date.utils'

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

const emit = defineEmits(['fieldChange'])

// Получаем цвета статуса из утилиты
const statusColors = computed(() => {
  return getStatusColors(props.ticket.status)
})

const priorityColors = computed(() => {
  return getPriorityColors(props.ticket.priority)
})

const validators = createTicketValidators(props.ticket)

const onFieldChange = (field, value) => {
  handleFieldChange(emit, field, value, validators)
}

// Используем функции для получения опций
const typeOptions = getTicketTypeOptions()
const priorityOptions = getTicketPriorityOptions()
const clientOptions = getClientOptions()
console.log(clientOptions)

const isOverdue = (date) => {
  return isInvalidDate(date)
}

const invalidColors = (date) => {
  if(isOverdue(date)){
    return { color: 'red' }
  }
  else{
    return { color: '#141414' }
  }
}

</script>

<style scoped>
/* Общие стили для всех блоков заявки */
.ticket-section {
  background: #fcfcfc;
  border: 1px solid #031432;
  border-radius: 12px;
  overflow: hidden;
  box-sizing: border-box;
}

/* Заголовок секции */
.ticket-section-header {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 15px;
  color: white;
  border-radius: 10px 10px 0 0;
  background: #031432;
  box-sizing: border-box;
}

.ticket-section-header h3 {
  margin: 0;
  color: #ffffff;
  font-size: 16px;
}

/* Контейнер для содержимого - сетка из 2 столбцов */
.ticket-create-block-content {
  display: grid;
  grid-template-columns: 5fr 2fr;
  padding: 15px;
  gap: 40px;
  align-items: start;
  min-height: 200px;
}

/* Общие стили для всех столбцов */
.column {
  display: flex;
  flex-direction: column;
  gap: 15px;
  height: 100%;
}

/* Столбец 1: Тема и Описание (шире) */
.column-1 {
  grid-column: 1;
}

/* Столбец 2: Приоритет, Тип, Организация */
.column-2 {
  grid-column: 2;
}

/* Горизонтальная строка для типа, приоритета и организации */
.horizontal-row {
  display: flex;
  gap: 15px;
  width: 100%;
}

.horizontal-row .horizontal-item {
  flex: 1;
  min-width: 0;
}

/* Общие стили для внутренних блоков */
.info-block-create {
  display: flex;
  flex-direction: column;
  width: 100%;
  flex: 0;
  min-height: 50px;
}

/* Ссылка на договор */
.contract-link {
  color: #007bff;
  text-decoration: none;
  cursor: pointer;
  font-size: 12px;
  margin-left: 8px;
}

.contract-link:hover {
  text-decoration: underline;
}

/* Стили для статусного бейджа */
.statusLabel{
  max-width: 140px !important;
}
</style>