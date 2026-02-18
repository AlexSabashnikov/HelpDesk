<!-- 
    Поле ввода с валидацией
    Единый стиль для всего приложения
-->

<template>
  <div class="ui-input-wrapper" :class="[customClass, { 'required-field': required }]">
    <div v-if="showHeader" class="ui-input-header">
      <span class="ui-input-label">
        {{ label }}
        <span v-if="required" class="required-asterisk">*</span>
        <!-- Отображение ошибки валидации -->
        <span v-if="showError" class="input-error">{{ errorMessage }}</span>
      </span>
      <span v-if="showCharCount && type === 'text'" class="ui-input-char-count" :class="{ 'char-count-warning': currentLength >= maxLength }">
        {{ currentLength }}/{{ maxLength }}
      </span>
    </div>
    <div class="input-container" :class="{ 'has-error': showError }">
    <input
      ref="inputRef"
      :value="modelValue"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      :type="type"
      :min="min"
      :max="max"
      :step="step"
      :placeholder="placeholder"
      :maxlength="maxLength"
      :required="required"
      :disabled="disabled"
      :style="textStyles"
      class="ui-input"
      :class="{ 'datetime-input': type === 'datetime-local' }"
    />
  </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'text',
    validator: (value) => ['text', 'date', 'number', 'datetime-local', 'email', 'tel'].includes(value)
  },
  maxLength: {
    type: Number,
    default: null
  },
  showCharCount: {
    type: Boolean,
    default: false
  },
  showHeader: {
    type: Boolean,
    default: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  min: {
    type: [Number, String],
    default: null
  },
  max: {
    type: [Number, String],
    default: null
  },
  step: {
    type: [Number, String],
    default: null
  },
  textColor: {
    type: String,
    default: null
  },
  customClass: String,
  required: {
    type: Boolean,
    default: false
  },
  // Кастомные правила валидации
  rules: {
    type: Array,
    default: () => []
  },
  // Показывать ошибку сразу или после потери фокуса
  validateOnBlur: {
    type: Boolean,
    default: true
  },
  // Кастомное сообщение для required
  requiredMessage: {
    type: String,
    default: 'Обязательное поле'
  }
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'valid', 'error'])

const inputRef = ref(null)
const isFocused = ref(false)
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
  
  // Проверка email
  if (props.type === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value.toString())) {
      return 'Введите корректный email адрес'
    }
  }
  
  // Проверка телефона
  if (props.type === 'tel' && value) {
    const digitsOnly = value.toString().replace(/\D/g, '')
    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      return 'Введите корректный номер телефона (10-15 цифр)'
    }
    
    const phoneRegex = /^[\d\s\-+()]+$/
    if (!phoneRegex.test(value.toString())) {
      return 'Телефон может содержать только цифры, пробелы, дефисы, плюс и скобки'
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

const currentLength = computed(() => {
  return props.modelValue ? String(props.modelValue).length : 0
})

const textStyles = computed(() => {
  const styles = {}
  if (props.textColor) {
    styles.color = props.textColor
  }
  return styles
})

const handleInput = (event) => {
  emit('update:modelValue', event.target.value)
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

// Метод для установки внешней ошибки (например, с сервера)
const setError = (message) => {
  isTouched.value = true
  internalError.value = message
  emit('error', message)
}

const handleFocus = (event) => {
  isFocused.value = true
  emit('focus', event)
}

const handleBlur = (event) => {
  isFocused.value = false
  isTouched.value = true
  internalError.value = validate()
  emit('blur', event)
  emit('valid', !internalError.value)
  emit('error', internalError.value)
}

// Метод для фокуса
const focus = () => {
  if (inputRef.value) {
    inputRef.value.focus()
  }
}

// Метод для очистки
const clear = () => {
  emit('update:modelValue', '')
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
.ui-input-wrapper {
  position: relative;
  width: 100%;
  margin-top: 2px;
}

.ui-input-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ui-input-label {
  font-size: 12px;
  color: #8c8c8c;
  font-weight: 500;
}

.required-asterisk {
  color: #b00020;
  margin-left: 2px;
}

.ui-input-char-count {
  font-size: 10px;
  color: #6c757d;
  font-weight: 400;
}

.ui-input-char-count.char-count-warning {
  color: #dc3545;
}

.input-container {
  position: relative;
  width: 100%;
}

.input-container.has-error .ui-input {
  border-color: #b00020;
  background-color: #fff5f5;
}

.ui-input {
  width: 100%;
  padding-top: 2px;
  padding-bottom: 2px;
  padding-left: 6px;
  padding-right: 3px;
  border: 1px solid #c5c5c5;
  border-radius: 6px;
  font-size: 14px;
  color: #141414;
  background-color: white;
  transition: all 0.2s ease;
  box-sizing: border-box;
  min-height: 28px;
  font-family: inherit;
}

/* Стили для стрелок в Chrome, Safari, Edge */
.ui-input[type="number"]::-webkit-outer-spin-button,
.ui-input[type="number"]::-webkit-inner-spin-button {
  position: absolute;
  right: 0;
  height: 75%;
  background-color: #f5f5f500;
  cursor: pointer;
}

.ui-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.ui-input::placeholder {
  color: #9a9a9a;
  font-style: italic;
}

.ui-input:disabled {
  background-color: #f9fafb;
  color: #9ca3af;
  cursor: not-allowed;
  border-color: #e5e7eb;
}

/* Специальные стили для datetime-local */
.ui-input.datetime-input {
  cursor: pointer;
  max-width: 170px;
}


.ui-input.datetime-input::-webkit-calendar-picker-indicator {
  width: 15px; 
  color: #9a9a9a;
  position: absolute;
  padding-left: 130px; /* Пододвигаем ближе к краю */
  cursor: pointer;
}

.ui-input.datetime-input:hover {
  opacity: 1;
  color: rgb(65, 106, 255);
}

/* Стиль для просроченных дедлайнов */
.ui-input.datetime-input.deadline-overdue {
  border-color: #dc3545 !important;
  background-color: #fff5f5 !important;
  color: #dc3545 !important;
}

/* Ошибка */
.input-error {
  font-size: 11px;
  color: #b00020;
  margin-top: 4px;
  padding-left: 4px;
}
</style>