<!-- 
    Макет панели администратора
    Боковое меню с полным доступом ко всем разделам
    Шапка с навигационной цепочкой и профилем
-->

<template>
  <div class="admin-layout">
    <!-- Боковое меню -->
    <SidebarMenu class="sidebar" />

    <!-- Основная область -->
    <div class="main-content" :class="{ 'sidebar-hidden': !sidebarVisible }">
      <!-- Шапка -->
      <Header class="header">
        <template #breadcrumbs>
          <slot name="breadcrumbs">
            <Breadcrumbs />
          </slot>
        </template>

        <template #actions>
          <div class="header-actions">
            <NotificationBell />
            <UserProfile />
          </div>
        </template>
      </Header>

      <!-- Контент страницы -->
      <main class="content">
        <slot name="header"></slot>
        <slot></slot>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import SidebarMenu from '@/components/common/AppLayout/SidebarMenu.vue'
import Header from '@/components/common/AppLayout/CommonHeader.vue'
import Breadcrumbs from '@/components/common/AppLayout/BreadCrumbs.vue'
import NotificationBell from '@/components/common/AppLayout/NotificationBell.vue'
import UserProfile from '@/components/common/UI/UIProfile.vue'

const sidebarVisible = ref(true);
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background-color: #eaeaea;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
}

.header {
  background: #031432;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  height: 60px;
}

.content {
  flex: 1;
  margin-top: 10px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}
</style>
