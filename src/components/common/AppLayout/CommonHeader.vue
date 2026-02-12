<!-- src/components/common/AppLayout/CommonHeader.vue -->
<template>
  <header class="app-header" role="banner">
    <div class="interface-and-crumbs" aria-hidden="true">
      <!-- Имя панели по роли -->
      <div class="name-of-interface">
        <span v-if="userRole === 'admin'">Панель администратора</span>
        <span v-else-if="userRole === 'dispatcher'">Панель диспетчера</span>
        <span v-else-if="userRole === 'engineer'">Панель инженера</span>
        <span v-else-if="userRole === 'client'">Клиентский портал</span>
        <span v-else>Панель</span>
      </div>

      <!-- Навигационная цепочка -->
      <div class="breadcrumbs">
        <slot name="breadcrumbs"></slot>
      </div>
    </div>

    <!-- Правая часть: уведомления и профиль -->
    <div class="header-right">
      <slot name="actions"></slot>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth.store'

const authStore = useAuthStore()
const userRole = computed(() => authStore.userRole || null)
</script>

<style scoped>
:root {
  --sidebar-header-height: 55px;
}

/* Основной контейнер шапки */
.app-header {
  position: fixed;
  top: 0;
  left: var(--sidebar-width, 250px);
  width: calc(100% - var(--sidebar-width, 250px));
  height: 55px;
  min-height: var(--sidebar-header-height);
  line-height: 1;
  display: flex;
  align-items: center; /* вертикальное центрирование */
  justify-content: space-between;
  padding: 0 20px; /* уменьшим padding, чтобы не увеличивать высоту визуально */
  box-sizing: border-box; /* учтём padding в вычислениях высоты */
  background: rgb(255,255,255);
  border-bottom: 1px solid #e0e0e0;
  z-index: 1199;
  gap: 12px;
}

/* Убираем внешние отступы у внутренних блоков — это частая причина "прыжка" высоты */
.interface-and-crumbs,
.interface-and-crumbs > * {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Название интерфейса: ограничиваем высоту и выравниваем по центру */
.name-of-interface {
  display: block;
  margin: 0;
  padding: 0;
  font-size: 18px;
  font-weight: 500;
  color: #E5E4E2;
  line-height: var(--sidebar-header-height); /* гарантируем центровку текста */
  height: var(--sidebar-header-height);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Breadcrumbs: делаем компактнее, убираем лишние отступы */
.breadcrumbs {
  margin: 0;
  padding: 0;
  font-size: 13px;
  color: #6d6d6d;
  line-height: 1;
}

/* Правая часть — сдерживаем высоту и используем flex */
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-right: 8px;
  height: 100%;
  box-sizing: border-box;
}

/* Делаем так, чтобы элементы внутри header-right не увеличивали высоту (например, большие кнопки) */
.header-right > * {
  max-height: calc(var(--sidebar-header-height) - 8px);
  display: inline-flex;
  align-items: center;
}

/* Мелкая адаптация при сжатии экрана */
@media (max-width: 1200px) {
  .app-header {
    left: var(--sidebar-width-collapsed, 80px);
    width: calc(100% - var(--sidebar-width-collapsed, 80px));
    padding: 0 14px;
  }
  .name-of-interface { font-size: 16px; }
  .breadcrumbs { font-size: 12px; }
}

/* Мобильный режим — сайдбар скрыт, шапка занимает всю ширину */
@media (max-width: 768px) {
  .app-header {
    left: 0;
    width: 100%;
    padding: 0 12px;
  }
  .breadcrumbs { display: none; }
  .name-of-interface { font-size: 16px; line-height: var(--sidebar-header-height); }
}
</style>
