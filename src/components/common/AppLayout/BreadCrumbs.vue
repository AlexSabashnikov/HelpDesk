<!-- 
    Навигационная цепочка (хлебные крошки)
    Отображает текущий путь в иерархии приложения
    Например: Панель администратора / Заявки / Все заявки
    Автоматически генерируется на основе роутера
-->

<template>
  <nav class="breadcrumbs">
    <span class="breadcrumb-item">Заявки</span>
    <span class="separator">/</span>
    <span class="breadcrumb-item active">Все заявки</span>
  </nav>
</template>

<script setup>
// Здесь будет логика маршрута
</script>

<style scoped>
.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.breadcrumb-item {
  color: #c0c1c2;
  text-decoration: none;
  transition: color 0.2s;
}

.breadcrumb-item:hover:not(.active) {
  color: #3b82f6;
}

.breadcrumb-item.active {
  color: #c0c1c2;
  font-weight: 500;
}

.separator {
  color: #cbd5e1;
}
</style>
