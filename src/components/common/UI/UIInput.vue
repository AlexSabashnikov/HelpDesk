<!-- 
    Поле ввода с валидацией
    Единый стиль для всего приложения
-->

<template>
  <div class="ui-input-wrapper" :class="customClass">
    <div v-if="showHeader" class="ui-input-header">
      <span class="ui-input-label">{{ label }}</span>
      <span v-if="showCharCount && type === 'text'" class="ui-input-char-count" :class="{ 'char-count-warning': currentLength >= maxLength }">
        {{ currentLength }}/{{ maxLength }}
      </span>
    </div>
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
      :disabled="disabled"
      :style="textStyles"
      class="ui-input"
      :class="{ 'datetime-input': type === 'datetime-local' }"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

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
  customClass: String
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur'])

const inputRef = ref(null)
const isFocused = ref(false)

const currentLength = computed(() => {
  return props.modelValue ? String(props.modelValue).length : 0
})

const textStyles = computed(() => {
  const styles = {}
  if (props.textColor == 'red') {
    styles.color = props.textColor
  }
  return styles
})

const handleInput = (event) => {
  emit('update:modelValue', event.target.value)
}

const handleFocus = (event) => {
  isFocused.value = true
  emit('focus', event)
}

const handleBlur = (event) => {
  isFocused.value = false
  emit('blur', event)
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
}

// Экспортируем методы
defineExpose({
  focus,
  clear
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

.ui-input-char-count {
  font-size: 10px;
  color: #6c757d;
  font-weight: 400;
}

.ui-input-char-count.char-count-warning {
  color: #dc3545;
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
</style>