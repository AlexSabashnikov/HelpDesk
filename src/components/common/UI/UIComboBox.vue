<template>
  <div class="ui-combobox-wrapper" :class="customClass">
    <span class="ui-combobox-label">{{ label }}</span>
    <input
      ref="inputRef"
      :value="searchValue"
      @input="handleInput"
      @focus="showDropdown = true"
      @blur="handleBlur"
      :placeholder="placeholder"
      class="ui-combobox-input"
    />
    
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
  dropdownMaxHeight: {
    type: String,
    default: '200px'
  },
  customClass: String
})

const emit = defineEmits(['update:modelValue'])

const inputRef = ref(null)
const searchValue = ref('')
const showDropdown = ref(false)

// Получение значения опции
const getOptionValue = (option) => {
  return typeof option === 'object' ? option[props.optionValue] : option
}

// Получение метки опции
const getOptionLabel = (option) => {
  return typeof option === 'object' ? option[props.optionLabel] : option
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
  //const optionValue = getOptionValue(option)
  const optionLabel = getOptionLabel(option)
  
  searchValue.value = optionLabel
  emit('update:modelValue', option)
  showDropdown.value = false
  
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
    
    // Проверяем, соответствует ли введенный текст какой-либо опции
    if (searchValue.value) {
      const matchingOption = props.options.find(option => 
        getOptionLabel(option).toLowerCase() === searchValue.value.toLowerCase()
      )
      
      if (!matchingOption) {
        // Если не соответствует, сбрасываем значение
        searchValue.value = ''
        emit('update:modelValue', null)
      }
    }
  }, 200)
}

// Синхронизация modelValue с searchValue
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    if (typeof newValue === 'object') {
      searchValue.value = getOptionLabel(newValue)
    } else {
      const option = props.options.find(opt => getOptionValue(opt) === newValue)
      searchValue.value = option ? getOptionLabel(option) : newValue
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
}

// Экспортируем методы
defineExpose({
  focus,
  clear
})
</script>

<style scoped>
.ui-combobox-wrapper {
  position: relative;
  width: 100%;
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

.ui-combobox-input::placeholder {
  color: #9a9a9a;
    font-style: italic;
}

.ui-combobox-label {
  font-size: 12px;
  color: #8c8c8c;
  font-weight: 500;
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
</style>