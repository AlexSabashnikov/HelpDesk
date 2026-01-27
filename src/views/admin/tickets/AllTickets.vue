<!-- 
    Все заявки (администратор)
    Полная таблица всех заявок системы с фильтрацией и сортировкой
    Быстрые фильтры: Новые, Просроченные, Подходят к сроку
-->

<!-- src/views/admin/tickets/AllTickets.vue -->
<template>
  <!-- Основной контент страницы -->
  <div class="all-tickets-page">
    <!-- Панель с кнопками над таблицей -->
    <div class="table-controls">
      <div class="search-section">
        <UIInput
          v-model="searchQuery"
          placeholder="Поиск по заявкам..."
          @keyup.enter="handleSearch"
          class="search-input"
        />
        <button class="search-btn" @click="handleSearch">
          🔍
        </button>
      </div>

      <!--Быстрые фильтры-->
      <div class="quick-filters">
        <UIButton variant="new" @click="setQuickFilter('new')">Новые: {{countOfNewTickets}}</UIButton>
        <UIButton variant="crit" @click="setQuickFilter('overdue')">Просрочено: {{ countOfOverdueTickets }}</UIButton>
        <UIButton variant="near" @click="setQuickFilter('nearDeadline')">Подходят к сроку: {{ countOfNearDeadlineTickets }}</UIButton>
      </div>
      
      <!-- Кнопка открытия фильтров -->
      <div class="filter-section">
        <TicketFilters
          :filters="activeFilters"
          @applyFilters="handleApplyFilters"
          @resetFilters="handleResetFilters"
        />
      </div>
    </div>

    <!-- Таблица заявок -->
    <div class="table-section">
      <TicketTable
        :tickets="tickets"
        :loading="loading"
        :pagination="pagination"
        @rowClick="handleRowClick"
        @pageChange="handlePageChange"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useTicketsStore } from '@/stores/tickets.store'
import TicketFilters from '@/components/tickets/TicketFilters.vue'
import TicketTable from '@/components/tickets/TicketTable.vue'
import UIButton from '@/components/common/UI/UIButton.vue'
import UIInput from '@/components/common/UI/UIInput.vue'

const ticketsStore = useTicketsStore()
const searchQuery = ref('')

// Состояние
const tickets = ref([])
const loading = ref(false)
const pagination = ref({
  page: 1,
  limit: 10, // ЛИМИТ ПАГИНАЦИИ ТАБЛИЦЫ ЗАЯВОК
  total: 0,
})
const activeFilters = ref({})

// Загрузка заявок
const loadTickets = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      limit: pagination.value.limit,
      ...activeFilters.value,
    }
    const response = await ticketsStore.fetchTickets(params)
    tickets.value = response.data || []
    pagination.value.total = response.total || 0
  } catch (error) {
    console.error('Ошибка загрузки заявок:', error)
  } finally {
    loading.value = false
  }
}

const handleRowClick = (ticket) => {
  console.log('Клик по строке:', ticket)
}

const handleEdit = (ticket) => {
  console.log('Редактирование:', ticket)
}

const handleDelete = (ticketId) => {
  console.log('Удаление:', ticketId)
}

// Обработчик поиска
const handleSearch = () => {
  console.log('Поиск по запросу:', searchQuery.value)
  // Заглушка
  pagination.value.page = 1
  loadTickets()
}

// Обработчики фильтров
const handleApplyFilters = (filters) => {
  activeFilters.value = { ...filters }
  pagination.value.page = 1
  loadTickets()
}

const handleResetFilters = () => {
  activeFilters.value = {}
  loadTickets()
}

const setQuickFilter = (type) => {
  const quickFiltersMap = {
    new: { status: 'new' },
    overdue: { overdue: true },
    nearDeadline: { nearDeadline: true },
  }
  activeFilters.value = { ...quickFiltersMap[type] }
  loadTickets()
}

// Вычисляемые свойства для счетчиков
const countOfNewTickets = computed(() => {
  return tickets.value.filter(ticket => ticket.status === 'new').length
})

const countOfOverdueTickets = computed(() => {
  return tickets.value.filter(ticket => {
    if (!ticket.deadline) return false
    try {
      const deadline = new Date(ticket.deadline)
      const now = new Date()
      return !isNaN(deadline.getTime()) && deadline < now
    } catch {
      return false
    }
  }).length
})

const countOfNearDeadlineTickets = computed(() => {
  return tickets.value.filter(ticket => {
    if (!ticket.deadline || !ticket.createdAt) return false
    
    try {
      const deadline = new Date(ticket.deadline)
      const createdAt = new Date(ticket.createdAt)
      const now = new Date()
      
      if (isNaN(deadline.getTime()) || isNaN(createdAt.getTime())) {
        return false
      }
      
      // Общее время на выполнение (в миллисекундах)
      const totalTime = deadline.getTime() - createdAt.getTime()
      
      // Если срок уже прошел или еще не наступил
      if (totalTime <= 0 || deadline <= now) {
        return false
      }
      
      // Прошедшее время с момента создания
      const elapsedTime = now.getTime() - createdAt.getTime()
      
      // Оставшееся время
      
      // Если прошло более 80% времени (осталось менее 20%)
      const elapsedPercentage = (elapsedTime / totalTime) * 100
      
      return elapsedPercentage >= 80
    } catch {
      return false
    }
  }).length
})

const handlePageChange = (page) => {
  pagination.value.page = page
  loadTickets()
}

// Инициализация
onMounted(() => {
  loadTickets()
})
</script>

<style scoped>

.table-controls {
  display: flex;
  align-items: center;
  gap: 20px;
  border-bottom: 3px solid rgb(210, 210, 210);
  width: 100%;
  padding-bottom: 10px;
}

.filter-section {
  display: flex;
  align-items: center;
}

.table-section {
  padding: 10px;
  margin: 0 20px 0 20px;
}

.quick-filters {
  display: flex;
  gap: 15px;
}

.search-section {
  margin-left:20px;
  display: flex;
  align-items: center;
  flex: 1;
  max-width: 300px;
}

.search-input{
  min-width: 250px;
}

.search-input:focus {
  outline: none;
  border-color: #4dabf7;
}

.search-btn {
  background: #71bfff;
  color: white;
  border: 1px solid #b2b2b2;
  border-left: none;
  border-radius: 0 20px 20px 0;
  padding: 4px 10px;
  cursor: pointer;
  font-size: 12px;
  margin-left: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-btn:hover {
  background: #339af0;
  border-color: #339af0;
}
</style>
