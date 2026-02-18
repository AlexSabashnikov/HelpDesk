<template>
  <div class="ui-combobox-wrapper" :class="[customClass, { 'required-field': required }]">
    <span class="ui-combobox-label">
      {{ label }}
      <span v-if="required" class="required-asterisk">*</span>
      <span v-if="showError" class="combobox-error">{{ errorMessage }}</span>
    </span>
    <div class="combobox-container" :class="{ 'has-error': showError }">
    <input
      ref="inputRef"
      :value="searchValue"
      @input="handleInput"
      @focus="showDropdown = true"
      @blur="handleBlur"
      :placeholder="placeholder"
      :required="required"
      :maxlength="maxLength"
      class="ui-combobox-input"
    />
    </div>
    <!-- Выпадающий список -->
    <div 
      v-if="showDropdown && filteredOptions.length > 0" 
      class="combobox-dropdown"
      :style="{ maxHeight: dropdownMaxHeight }"
    >
      <div 
        v-for="option in filteredOptions" 
        :key="getOptionValue(option)" 
        class="combobox-option"
        @mousedown="selectOption(option)"
        :class="{ 'combobox-option-selected': isOptionSelected(option) }"
      >
        {{ getOptionLabel(option) }}
      </div>
    </div>
    
    <!-- Если нет результатов поиска -->
    <div 
      v-if="showDropdown && searchValue && filteredOptions.length === 0" 
      class="combobox-dropdown combobox-no-results"
    >
      <div class="combobox-no-results-text">
        Ничего не найдено
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'

const props = defineProps({
  modelValue: [String, Number, Object],
  options: {
    type: Array,
    default: () => []
  },
  maxLength: {  
    type: [Number, String],
    default: null
  },
  placeholder: {
    type: String,
    default: 'Выберите или введите...'
  },
  label: {
    type: String,
    default: ''
  },
  optionLabel: {
    type: String,
    default: 'label'
  },
  optionValue: {
    type: String,
    default: 'id'
  },
  required: {
    type: Boolean,
    default: false
  },
  dropdownMaxHeight: {
    type: String,
    default: '200px'
  },
  customClass: String,
  // Кастомные правила валидации
  rules: {
    type: Array,
    default: () => []
  },
  // Кастомное сообщение для required
  requiredMessage: {
    type: String,
    default: 'Обязательное поле'
  },
  // Показывать ошибку сразу или после потери фокуса
  validateOnBlur: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'blur', 'valid', 'error'])

const inputRef = ref(null)
const searchValue = ref('')
const showDropdown = ref(false)
const isTouched = ref(false)
const internalError = ref('')

// Валидация поля
const validate = () => {
  const value = props.modelValue
  
  // Проверка required
  if (props.required) {
    if (value === null || value === undefined || value === '') {
      return props.requiredMessage
    }
    
    if (typeof value === 'string' && !value.trim()) {
      return props.requiredMessage
    }
  }
  
  // Кастомные правила
  for (const rule of props.rules) {
    if (typeof rule === 'function') {
      const result = rule(value)
      if (typeof result === 'string') {
        return result
      }
    } else if (rule && rule.validator && rule.message) {
      if (!rule.validator(value)) {
        return rule.message
      }
    }
  }
  
  return ''
}

// Обновляем ошибку при изменении значения
watch(() => props.modelValue, () => {
  if (isTouched.value) {
    internalError.value = validate()
    emit('valid', !internalError.value)
    emit('error', internalError.value)
  }
})

const showError = computed(() => {
  return (isTouched.value || !props.validateOnBlur) && internalError.value
})

const errorMessage = computed(() => internalError.value)

// Получение значения опции
const getOptionValue = (option) => {
  return typeof option === 'object' ? option[props.optionValue] : option
}

// Получение метки опции
const getOptionLabel = (option) => {
  return typeof option === 'object' ? option[props.optionLabel] : String(option)
}

// Проверка, выбрана ли опция
const isOptionSelected = (option) => {
  const optionValue = getOptionValue(option)
  const currentValue = props.modelValue
  
  if (typeof currentValue === 'object') {
    return currentValue && getOptionValue(currentValue) === optionValue
  }
  return currentValue === optionValue
}

// Отфильтрованные опции для поиска
const filteredOptions = computed(() => {
  if (!searchValue.value.trim()) return props.options
  
  const searchTerm = searchValue.value.toLowerCase().trim()
  return props.options.filter(option => {
    const label = getOptionLabel(option).toLowerCase()
    const value = String(getOptionValue(option)).toLowerCase()
    return label.includes(searchTerm) || value.includes(searchTerm)
  })
})

// Обработчик ввода
const handleInput = (event) => {
  searchValue.value = event.target.value
  showDropdown.value = true
}

// Обработчик выбора опции
const selectOption = (option) => {
  const optionLabel = getOptionLabel(option)
  
  searchValue.value = optionLabel
  emit('update:modelValue', option)
  showDropdown.value = false
  isTouched.value = true
  internalError.value = validate()
  emit('valid', !internalError.value)
  emit('error', internalError.value)
  
  // Фокус на инпуте после выбора
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.focus()
    }
  })
}

// Обработчик потери фокуса
const handleBlur = () => {
  setTimeout(() => {
    showDropdown.value = false
    isTouched.value = true
    
    // Проверяем, соответствует ли введенный текст какой-либо опции
    if (searchValue.value && props.options.length > 0) {
      const matchingOption = props.options.find(option => 
        getOptionLabel(option).toLowerCase() === searchValue.value.toLowerCase()
      )
      
      if (!matchingOption) {
        // Если не соответствует, сбрасываем значение
        searchValue.value = ''
        emit('update:modelValue', null)
      }
    }
    
    internalError.value = validate()
    emit('blur')
    emit('valid', !internalError.value)
    emit('error', internalError.value)
  }, 200)
}

// Метод для принудительной валидации
const validateField = () => {
  isTouched.value = true
  internalError.value = validate()
  emit('valid', !internalError.value)
  emit('error', internalError.value)
  return !internalError.value
}

// Метод для сброса ошибки
const clearError = () => {
  internalError.value = ''
  isTouched.value = false
  emit('error', '')
}

// Метод для установки внешней ошибки
const setError = (message) => {
  isTouched.value = true
  internalError.value = message
  emit('error', message)
}

// Синхронизация modelValue с searchValue
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    if (typeof newValue === 'object') {
      searchValue.value = getOptionLabel(newValue)
    } else {
      const option = props.options.find(opt => getOptionValue(opt) === newValue)
      searchValue.value = option ? getOptionLabel(option) : String(newValue)
    }
  } else {
    searchValue.value = ''
  }
}, { immediate: true })

// Метод для фокуса на инпут
const focus = () => {
  if (inputRef.value) {
    inputRef.value.focus()
  }
}

// Метод для очистки
const clear = () => {
  searchValue.value = ''
  emit('update:modelValue', null)
  clearError()
}

// Экспортируем методы
defineExpose({
  focus,
  clear,
  validate: validateField,
  clearError,
  setError,
  isValid: computed(() => !internalError.value)
})
</script>

<style scoped>
.ui-combobox-wrapper {
  position: relative;
  width: 100%;
}

.combobox-container {
  position: relative;
  width: 100%;
}

.combobox-container.has-error .ui-combobox-input {
  border-color: #b00020;
  background-color: #fff5f5;
}

.ui-combobox-input {
  width: 100%;
  padding: 4px 6px;
  border: 1px solid #c5c5c5;
  border-radius: 6px;
  font-size: 14px;
  color: #141414;
  background-color: white;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.ui-combobox-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.combobox-container.has-error .ui-combobox-input:focus {
  border-color: #b00020;
  box-shadow: 0 0 0 2px rgba(176, 0, 32, 0.1);
}


.ui-combobox-input::placeholder {
  color: #9a9a9a;
    font-style: italic;
}

.ui-combobox-label {
  font-size: 12px;
  color: #8c8c8c;
  font-weight: 500;
}

.required-asterisk {
  color: #b00020;
  margin-left: 2px;
}

/* Выпадающий список */
.combobox-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 9;
  margin-top: 2px;
  overflow-y: auto;
}

/* Опции выпадающего списка */
.combobox-option {
  padding: 8px 12px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.combobox-option:hover {
  background-color: #f3f4f6;
}

.combobox-option-selected {
  background-color: #eff6ff;
  color: #1d4ed8;
  font-weight: 500;
}

.combobox-option:not(:last-child) {
  border-bottom: 1px solid #f3f4f6;
}

/* Стили для отсутствия результатов */
.combobox-no-results {
  padding: 12px;
  color: #6b7280;
  font-size: 14px;
  text-align: center;
}

.combobox-no-results-text {
  font-style: italic;
}

/* Ошибка */
.combobox-error {
  font-size: 11px;
  color: #b00020;
  margin-top: 4px;
  padding-left: 4px;
}
</style>