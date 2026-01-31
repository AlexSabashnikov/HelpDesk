<!-- 
    Выпадающий список с поиском
    Используется для выбора компаний, пользователей, статусов
-->

<template>
  <select
    :value="modelValue"
    @change="$emit('update:modelValue', $event.target.value)"
    :class="['ui-select', customClass]"
  >
    <option v-if="placeholder" value="">{{ placeholder }}</option>
    <option v-for="option in options" :key="option.value" :value="option.value">
      {{ option.label }}
    </option>
  </select>
</template>

<script setup>
defineProps({
  modelValue: [String, Number],
  options: Array,
  placeholder: String,
  customClass: String, // Добавляем свойство для кастомных классов
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.ui-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  outline: none;
  padding-right: 30px;
  text-align: left;
  font-weight: 900;
}

.ui-select:hover {
  border-color: #339af0;
}
</style>
