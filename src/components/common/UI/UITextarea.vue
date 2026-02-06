<template>
  <div class="ui-textarea-wrapper" :class="customClass">
    <div v-if="showHeader" class="ui-textarea-header">
      <span class="ui-textarea-label">{{ label }}</span>
      <span v-if="showCharCount" class="ui-textarea-char-count" :class="{ 'char-count-warning': currentLength >= maxLength }">
        {{ currentLength }}/{{ maxLength }}
      </span>
    </div>
    <textarea
      ref="textareaRef"
      :value="modelValue"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      :placeholder="placeholder"
      :maxlength="maxLength"
      :rows="rows"
      :disabled="disabled"
      :readonly="readonly"
      class="ui-textarea"
      :style="{ minHeight: minHeight, maxHeight: maxHeight }"
    ></textarea>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Введите текст...'
  },
  maxLength: {
    type: Number,
    default: null
  },
  rows: {
    type: Number,
    default: 3
  },
  minHeight: {
    type: String,
    default: '80px'
  },
  maxHeight: {
    type: String,
    default: '200px'
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
  readonly: {
    type: Boolean,
    default: false
  },
  customClass: String
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur'])

const textareaRef = ref(null)
const isFocused = ref(false)

const currentLength = computed(() => {
  return props.modelValue ? props.modelValue.length : 0
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
  if (textareaRef.value) {
    textareaRef.value.focus()
  }
}

// Метод для очистки
const clear = () => {
  emit('update:modelValue', '')
}

// Автоматическое изменение высоты
const autoResize = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    const newHeight = Math.min(textareaRef.value.scrollHeight, parseInt(props.maxHeight))
    textareaRef.value.style.height = newHeight + 'px'
  }
}

// Экспортируем методы
defineExpose({
  focus,
  clear,
  autoResize
})
</script>

<style scoped>
.ui-textarea-wrapper {
  position: relative;
  width: 100%;
}

.ui-textarea-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ui-textarea-label {
  font-size: 12px;
  color: #8c8c8c;
  font-weight: 500;
}

.ui-textarea-char-count {
  font-size: 10px;
  color: #6c757d;
  font-weight: 400;
}

.ui-textarea-char-count.char-count-warning {
  color: #dc3545;
}

.ui-textarea {
  width: 100%;
  padding: 4px 6px;
  border: 1px solid #c5c5c5;
  border-radius: 6px;
  font-size: 14px;
  color: #141414;
  background-color: white;
  transition: all 0.2s ease;
  box-sizing: border-box;
  font-family: inherit;
  resize: none;
  min-height: v-bind(minHeight);
  max-height: v-bind(maxHeight);
  overflow-y: auto;
  scrollbar-width: thin;
}

.ui-textarea.has-readonly{
  border-color: #9a9a9a !important;
}

.ui-textarea:hover{
  border-color: #3b82f6;
}

.ui-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.ui-textarea::placeholder {
  color: #9a9a9a;
    font-style: italic;
}

.ui-textarea:disabled {
  background-color: #f9fafb;
  color: #9ca3af;
  cursor: not-allowed;
  border-color: #e5e7eb;
}
</style>