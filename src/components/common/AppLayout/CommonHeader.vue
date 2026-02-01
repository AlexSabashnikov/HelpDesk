<!-- 
    Шапка страницы (верхняя панель)
    Заголовок раздела, хлебные крошки (навигационная цепочка)
    ФИО пользователя, кнопка профиля, уведомления
    Интегрирован с auth.store для отображения данных пользователя
-->

<template>
  <header class="app-header">
    <div class="interface-and-crumbs">
      <!-- Имя панель администратора -->
      <div class="name-of-interface">
        <slot v-if="userRole ==='admin'">Панель администратора</slot>
        <slot v-if="userRole ==='dispatcher'">Панель диспетчера</slot>
        <slot v-if="userRole ==='client'">Клиентский портал</slot>
        <slot v-if="userRole ==='engineer'">Панель инженера</slot>
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
import { getUserRole } from '@/utils/auth.utils'

const userRole = getUserRole()
</script>

<style scoped>
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  width: 85%;
  padding: 0 24px;
  margin-left: 15%;
  height: 60px;
  max-height: 60px;
  background: rgb(255, 255, 255);
  border-bottom: 1px solid #e0e0e0;
}

.interface-and-crumbs {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  margin-left: 5%;
  gap: 2px;
  line-height: 1.2;
}

.name-of-interface {
  font-size: 24px;
  font-weight: 550;
  color: #ffffff;
}

.breadcrumbs {
  font-size: 14px;
  color: #6d6d6d;
}

.header-right {
  margin-right: 10px;
  display: flex;
  align-items: center;
  gap: 16px;
  max-height: 20px;
}
</style>
