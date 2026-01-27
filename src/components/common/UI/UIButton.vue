<!-- 
    Базовая кнопка с несколькими вариантами
    Поддерживает различные варианты, размеры, состояния
    Единый стиль для всего приложения
-->

<template>
  <button :class="['ui-button', `variant-${variant}`]" @click="$emit('click')">
    <slot />
  </button>
</template>

<script setup>
defineProps({
  variant: { type: String, default: 'primary' },
})
</script>

<style scoped>
.ui-button {
  padding: 2px 12px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
}

.ui-button:hover {
  transform: scale(1.02);
}

.variant-primary {
  background: #3b82f6;
  color: white;
}

.variant-crit {
  background: #ffdbdb;
  color: #d80000;
  border-color: #d80000;
}

.variant-new {
  background: #d8dbff;
  color: #08105f;
  border-color: #08105f;
}

.variant-near {
  background: #fff2d8;
  color: #cd8900;
  border-color: #cd8900;
}
</style>
