<!-- 
    Компонент-хранилище иконок из библиотеки Iconify
    Используется во всем приложении для единообразия иконок
    Иконки соответствуют макетам из Figma
-->

<template>
  <!-- Этот компонент не рендерит ничего сам, только предоставляет иконки -->
  <slot></slot>
</template>

<script setup>

// Словарь всех иконок проекта
const icons = {
  // Навигация и стрелки
  arrowRight: 'mdi:chevron-right',
  arrowLeft: 'mdi:chevron-left',
  arrowDown: 'mdi:chevron-down',
  arrowUp: 'mdi:chevron-up',
  arrowDoubleRight: 'mdi:chevron-double-right',
  arrowDoubleLeft: 'mdi:chevron-double-left',
  menu: 'mdi:menu',
  menuOpen: 'mdi:menu-open',
  menuClose: 'mdi:menu-close',
  
  // Разделы меню
  tickets: 'mdi:ticket-confirmation-outline',
  directories: 'mdi:folder-multiple-outline',
  analytics: 'mdi:graph-line',
  calendar: 'mdi:calendar-outline',
  
  // Подразделы
  allTickets: 'mdi:format-list-bulleted',
  createTicket: 'mdi:plus-circle-outline',
  companies: 'mdi:briefcase-variant',
  users: 'mdi:account-group-outline',
  generalAnalytics: 'mdi:chart-bar',
  reports: 'mdi:file-document-outline',
  
  // UI элементы
  usersLoadEmpty: 'mdi:account-off-outline',
  userCreate: 'mdi:account-plus-outline',
  userSearch: 'mdi:account-search-outline',
  ticketSearch: 'mdi:email-search-outline',
  filter: 'mdi-filter-outline',
  notificationsBell: 'mdi:notifications',
  
  // Действия
  ticketEdit: 'mdi:email-edit-outline',
  edit: 'mdi:pencil',
  delete: 'mdi:delete',
  add: 'mdi:plus',
  search: 'mdi:magnify',
  download: 'mdi:download',
  upload: 'mdi:upload',
  refresh: 'mdi:refresh',
}

// Просто экспортируем объект с иконками
defineExpose({
  icons
})
</script>
