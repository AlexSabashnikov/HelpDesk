<!-- 
    Поле ввода с валидацией
    Единый стиль для всего приложения
-->

<template>
  <input
    :type="type"
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
    :placeholder="placeholder"
    class="ui-input"
  />
</template>

<script setup>
defineProps({
  modelValue: [String, Number],
  type: { type: String, default: 'text' },
  placeholder: String,
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.ui-input {
  padding: 4px 12px;
  border: 1px solid #b2b2b2;
  font-size: 12px;
  color: rgb(56, 56, 56);
  border-radius: 20px 0 0 20px;
}
</style>
