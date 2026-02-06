<!-- 
    Создание заявки (администратор)
    Расширенная форма с возможностью указания любого исполнителя
    Выбор из всех компаний-клиентов
    Используется для ручного создания заявок от лица администратора
-->

<template>
  <div class="create-ticket-overlay">
    <div class="create-ticket-container">
      <!-- Заголовок страницы -->
      <div class="create-ticket-header">
        <span class="header-text">Создание заявки</span>
        <button class="save-btn" @click="saveChanges" title="Сохранить изменения">
          💾 Сохранить
        </button>
      </div>

      <!-- Блоки заявки -->
      <div class="crate-ticket-body">
        <!-- Основная информация о заявке -->
        <div class="ticket-sections-one">
          <!-- Блок обязательной информации -->
          
          <RequiredBlock
            :ticket="localTicket" 
            :mode="mode"
            :user-role="userRole"
            @fieldChange="handleFieldChange" 
            @validationError="handleValidationError"
            />
        </div>
        <div class="ticket-sections-two">
          <!-- Блок дополнительной информации -->
          <AdditionalBlock 
            :ticket="localTicket"
            :mode="mode"
            :user-role="userRole"
            @fieldChange="handleFieldChange"
            @materialChange="handleMaterialChange"
            @validationError="handleValidationError"
            />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { getUserRole } from '@/utils/auth.utils'
import apiClient from '@/api/axios.config'
import RequiredBlock from '@/components/tickets/TicketCreateBlocks/RequiredBlock.vue'
import AdditionalBlock from '@/components/tickets/TicketCreateBlocks/AdditionalBlock.vue'
import { prepareTicketForSubmit } from '@/utils/form.utils'

const props = defineProps({
  ticket: {
    type: Object,
    default: () => ({
      id: null,
      number: '',
      subject: '',
      description: '',
      priority: '',
      status: 'new',
      type: '',
      client: {},
      executor: {},
      contactPerson: '',
      phone: '',
      email: '',
      createdAt: '',
      deadline: '',
      workStart: '',
      workEnd: '',
      workCost: null,
      materials: [],
      requestMethod: '',
      address: '',
      distance: ''
    }),
  },
  mode: {
    type: String,
    default: 'create',
  },
})

const router = useRouter()
defineEmits(['save'])

// Ключ для localStorage
const STORAGE_KEY = 'ticket_draft_create'

// Флаг для предотвращения рекурсивных вызовов
let isLeaving = false

// Массив для хранения ошибок валидации
const validationErrors = ref([])

// Локальная копия заявки для редактирования
const localTicket = ref({ ...props.ticket })

// Компьютед свойство для автоматического обновления статуса
const autoUpdateStatus = computed(() => {
  const executor = localTicket.value.executor
  
  // Проверяем, назначен ли исполнитель
  const isExecutorAssigned = executor && 
                            executor.id && 
                            executor.name && 
                            executor.name.trim() !== '' && 
                            executor.name !== 'Не назначен'
  
  // Возвращаем соответствующий статус
  return isExecutorAssigned ? 'assigned' : 'new'
})

// Следим за изменением исполнителя и обновляем статус
watch(() => localTicket.value.executor, (newExecutor, oldExecutor) => {
  // Если исполнитель изменился
  if (JSON.stringify(newExecutor) !== JSON.stringify(oldExecutor)) {
    // Ждем следующего тика, чтобы избежать циклических обновлений
    setTimeout(() => {
      const newStatus = autoUpdateStatus.value
      
      // Обновляем статус только если он отличается от текущего
      if (localTicket.value.status !== newStatus) {
        console.log(`Автоматическое изменение статуса с "${localTicket.value.status}" на "${newStatus}"`)
        localTicket.value.status = newStatus
      }
    }, 0)
  }
}, { deep: true })

// Флаг наличия изменений
const hasUnsavedChanges = computed(() => {
  const savedDraft = localStorage.getItem(STORAGE_KEY)
  if (!savedDraft) return false
  
  try {
    const parsedDraft = JSON.parse(savedDraft)
    
    // Проверяем, есть ли хотя бы одно заполненное поле
    const hasAnyFieldFilled = Object.entries(parsedDraft).some(([key, value]) => {
      if (key === 'id' || key === 'createdAt' || key === 'status') return false // Игнорируем служебные поля
      
      if (typeof value === 'object' && value !== null) {
        // Для объектов проверяем, есть ли хоть одно свойство
        return Object.keys(value).length > 0 && 
               Object.values(value).some(v => v && v.toString().trim() !== '')
      }
      
      return value && value.toString().trim() !== ''
    })
    
    return hasAnyFieldFilled
  } catch (error) {
    console.log(error)
    return false
  }
})

// Инициализация данных из localStorage при загрузке
onMounted(() => {
  loadDraftFromStorage()
  
  // Инициализируем статус на основе исполнителя при загрузке
  if (localTicket.value.executor) {
    const initialStatus = autoUpdateStatus.value
    if (localTicket.value.status !== initialStatus) {
      localTicket.value.status = initialStatus
    }
  }
  
  // Автосохранение при изменении данных
  watch(localTicket, (newValue) => {
    saveDraftToStorage(newValue)
  }, { deep: true, immediate: true })
})

// Загрузка черновика из localStorage
const loadDraftFromStorage = () => {
  try {
    const savedDraft = localStorage.getItem(STORAGE_KEY)
    console.log('Перезагрузка началась ', savedDraft)
    if (savedDraft) {
      const parsedDraft = JSON.parse(savedDraft)
      localTicket.value = { ...localTicket.value, ...parsedDraft }
      console.log('Черновик заявки загружен из localStorage')
    }
  } catch (error) {
    console.error('Ошибка при загрузке черновика:', error)
  }
}

// Сохранение черновика в localStorage
const saveDraftToStorage = (ticketData) => {
  try {
    // Убираем пустые строки и null значения для более точного определения изменений
    const cleanData = Object.entries(ticketData).reduce((acc, [key, value]) => {
      if (value === null || value === undefined || 
          (typeof value === 'string' && value.trim() === '') ||
          (typeof value === 'object' && Object.keys(value).length === 0)) {
        return acc
      }
      acc[key] = value
      return acc
    }, {})
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanData))
  } catch (error) {
    console.error('Ошибка при сохранении черновика:', error)
  }
}

// Очистка черновика из localStorage
const clearDraftFromStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Ошибка при очистке черновика:', error)
  }
}

// Обработчик выхода со страницы (при закрытии вкладки/браузера)
const handleBeforeUnload = (event) => {
  if (hasUnsavedChanges.value) {
    event.preventDefault()
    event.returnValue = 'У вас есть несохраненные изменения.'
    return event.returnValue
  }
}

// Добавляем обработчик события beforeunload
onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
})

// Удаляем обработчик события beforeunload
onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

// Обработчик перехода со страницы через Vue Router
onBeforeRouteLeave((to, from, next) => {
  // Если мы уже покидаем страницу (нажали кнопку Отмена), разрешаем переход
  if (isLeaving) {
    next()
    return
  }
  
  if (hasUnsavedChanges.value) {
    const confirmed = confirm('У вас есть несохраненные данные в черновике заявки. Вы уверены, что хотите покинуть страницу создания заявки?')
    
    if (confirmed) {
      // Всегда очищаем localStorage при выходе
      clearDraftFromStorage()
      next()
    } else {
      next(false)
    }
  } else {
    // Нет изменений, но все равно очищаем localStorage
    clearDraftFromStorage()
    next()
  }
})

// Следим за изменениями пропса ticket
watch(() => props.ticket, (newTicket) => {
  localTicket.value = { ...newTicket }
  // Убедимся, что materials всегда массив
  if (!localTicket.value.materials) {
    localTicket.value.materials = []
  }
}, { immediate: true })

// Роль пользователя
const userRole = ref('guest')
userRole.value = getUserRole()

// Обязательные поля для валидации
const requiredFields = [
  'subject',
  'client',
  'contactPerson',
  'phone',
  'priority',
  'status',
  'type',
  'deadline'
]

// Валидация формы
const validateForm = () => {
  const errors = []
  
  requiredFields.forEach(field => {
    const value = localTicket.value[field]
    
    if (field === 'client' || field === 'executor') {
      if (!value || !value.name || value.name.trim() === '') {
        errors.push(getFieldLabel(field))
      }
    } else if (field === 'deadline') {
      if (!value || value.trim() === '') {
        errors.push(getFieldLabel(field))
      }
    } else {
      if (!value || value.toString().trim() === '') {
        errors.push(getFieldLabel(field))
      }
    }
  })
  
  return errors
}

// Получение понятного названия поля
const getFieldLabel = (field) => {
  const labels = {
    subject: 'Тема заявки',
    client: 'Организация-клиент',
    contactPerson: 'Контактное лицо',
    phone: 'Телефон',
    priority: 'Приоритет',
    status: 'Статус',
    type: 'Тип заявки',
    deadline: 'Срок выполнения'
  }
  return labels[field] || field
}

// Вспомогательная функция для проверки, назначен ли исполнитель
const isExecutorAssigned = (executor) => {
  if (!executor) return false
  
  // Проверяем разные форматы объекта исполнителя
  if (typeof executor === 'object') {
    // Если есть ID и имя не "Не назначен"
    if (executor.id && executor.name && executor.name.trim() !== '' && executor.name !== 'Не назначен') {
      return true
    }
    // Если есть только имя (для обратной совместимости)
    if (executor.name && executor.name.trim() !== '' && executor.name !== 'Не назначен') {
      return true
    }
  } else if (typeof executor === 'string') {
    // Если executor передается как строка
    return executor.trim() !== '' && executor !== 'Не назначен'
  }
  
  return false
}

// Обработчик ошибок валидации от дочерних компонентов
const handleValidationError = ({ field, error }) => {
  // Добавляем ошибку в массив или обновляем существующую
  const existingErrorIndex = validationErrors.value.findIndex(e => e.field === field)
  
  if (existingErrorIndex >= 0) {
    validationErrors.value[existingErrorIndex] = { field, error }
  } else {
    validationErrors.value.push({ field, error })
  }
  
  console.warn(`Ошибка валидации поля "${field}":`, error)
}

// Сохранение заявки
const saveChanges = async () => {
  // Проверяем ошибки валидации
  if (validationErrors.value.length > 0) {
    const errorMessages = validationErrors.value.map(e => 
      `• ${getFieldLabel(e.field)}: ${e.error}`
    ).join('\n')
    
    alert(`Пожалуйста, исправьте ошибки в форме:\n\n${errorMessages}`)
    return
  }
  
  // Валидация обязательных полей
  const requiredFieldErrors = validateForm()
  
  if (requiredFieldErrors.length > 0) {
    alert(`Пожалуйста, заполните обязательные поля:\n\n• ${requiredFieldErrors.join('\n• ')}`)
    return
  }
  
  try {
    // Автоматически обновляем статус перед сохранением (на всякий случай)
    const shouldBeAssigned = isExecutorAssigned(localTicket.value.executor)
    const finalStatus = shouldBeAssigned ? 'assigned' : 'new'
    
    if (localTicket.value.status !== finalStatus) {
      localTicket.value.status = finalStatus
      console.log(`Статус перед сохранением изменен на: ${finalStatus}`)
    }
    
    // Подготовка данных для отправки с использованием утилиты
    const ticketData = prepareTicketForSubmit({
      ...localTicket.value,
      // Убедимся, что даты в правильном формате
      createdAt: new Date().toISOString(),
      // Материалы
      materials: localTicket.value.materials || []
    })
    
    // Отправка на сервер
    const response = await apiClient.post('/api/tickets', ticketData)
    
    if (response.data && response.data.success) {
      // Успешное сохранение
      alert('Заявка успешно создана!')
      
      // Очищаем черновик
      clearDraftFromStorage()
      
      // Перенаправляем на список заявок
      isLeaving = true
      router.push('/admin/tickets')
    } else {
      throw new Error('Ошибка при сохранении заявки')
    }
  } catch (error) {
    console.error('Ошибка при сохранении заявки:', error)
    alert(`Ошибка при сохранении заявки: ${error.message || 'Неизвестная ошибка'}`)
  }
}

// Обработчик изменения материалов
const handleMaterialChange = (materials) => {
  localTicket.value = {
    ...localTicket.value,
    materials: materials
  }
}

// Обработчик изменений полей
const handleFieldChange = (field, value) => {
  console.log(`Field ${field} changed to:`, value)
  
  // Удаляем ошибку валидации для этого поля, если она была
  const errorIndex = validationErrors.value.findIndex(e => e.field === field)
  if (errorIndex >= 0) {
    validationErrors.value.splice(errorIndex, 1)
  }
  
  // Специальная обработка для поля исполнителя
  if (field === 'executor') {
    // Сохраняем новое значение исполнителя
    localTicket.value = {
      ...localTicket.value,
      [field]: value
    }
    
    // Определяем новый статус на основе исполнителя
    const isAssigned = isExecutorAssigned(value)
    const newStatus = isAssigned ? 'assigned' : 'new'
    
    // Обновляем статус, если он отличается
    if (localTicket.value.status !== newStatus) {
      setTimeout(() => {
        localTicket.value.status = newStatus
        console.log(`Статус автоматически изменен на "${newStatus}" из-за изменения исполнителя`)
      }, 0)
    }
  } 
  // Обработка других полей
  else if (field === 'workCost') {
    // Убираем "р." из стоимости работ при сохранении
    const numericValue = value.toString().replace(/[^0-9.-]+/g, '')
    localTicket.value = {
      ...localTicket.value,
      [field]: numericValue
    }
  } else if (field === 'client') {
    // Обработка объекта клиента
    localTicket.value = {
      ...localTicket.value,
      [field]: value
    }
  } else {
    localTicket.value = {
      ...localTicket.value,
      [field]: value
    }
  }
}
</script>

<style>
.create-ticket-overlay {
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.create-ticket-container {
  width: 95%;
  max-width: 1200px;
}

.create-ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 5px;
  margin-bottom: 10px;
}

.header-text{
  font-size: 24px;
  font-weight: 600;
  color: rgb(22, 22, 22);
}

.save-btn {
  background: #3cc93a;
  color: white;
  border: none;
  padding: 6px 16px;
  border-radius: 16px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.save-btn:hover {
  background: #28a23e;
  transform: translateY(-1px);
}

.create-ticket-body {
  padding: 20px 15px 15px 15px;
}

.ticket-sections-one {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.ticket-sections-two {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

</style>