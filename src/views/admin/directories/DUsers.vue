<!-- 
    Справочник пользователей
    Администраторы, инженеры, клиенты
    Управление ролями, правами доступа, блокировка аккаунтов
-->

<!-- src/views/admin/directories/DUsers.vue -->
<template>
  <!-- Основной контент страницы -->
  <div class="all-users-page">
    <!-- Панель с кнопками над таблицей -->
    <div class="table-controls">
      <div class="search-section">
        <!-- ваш поиск -->
      </div>
      <div class="quick-filters">
        <!-- фильтры -->
      </div>
    </div>

    <!-- Таблица пользователей -->
    <!-- добавлено: кнопка Profile будет эмитить это событие -->
    <div class="table-section">
      <UsersTable
        :users="users"
        :loading="loading"
        :pagination="paginationData"
        :show-laravel-pagination="false"
        @rowClick="handleRowClick"
        @openProfile="handleRowClick"        
        @pageChange="handlePageChange"
        @sortChange="handleSortChange"
      />
    </div>

    <!-- Модалка профиля (берёт данные из selectedUser) -->
    <UserProfileModal
      v-model="modalVisible"
      mode="user"
      :user="selectedUser"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUsersStore } from '@/stores/users.store'
import UsersTable from '@/components/tables/UsersTable.vue'
import UserProfileModal from '@/components/common/UI/UserProfileModal.vue' // <-- импорт модалки

const usersStore = useUsersStore()
const searchQuery = ref('')

// Состояние
const users = ref([])
const loading = ref(false)
const paginationData = ref({
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  links: [],
  from: 0,
  to: 0
})

const activeFilters = ref({})
const activeSort = ref({})

// Модальное окно
const selectedUser = ref(null)
const modalVisible = ref(false)

// Загрузка пользователей для таблицы (с фильтрацией и пагинацией)
const loadUsers = async () => {
  loading.value = true
  try {
    const params = {
      page: paginationData.value.current_page,
      per_page: paginationData.value.per_page,
      search: searchQuery.value,
      ...activeFilters.value,
      ...activeSort.value,
    }

    const response = await usersStore.fetchUsers(params)
    // Ожидаем структуру Laravel Paginator или похожую
    // Поддерживаем два варианта: 1) response.data (Laravel) или 2) response (если store возвращает уже data)
    const payload = response.data || response

    if (Array.isArray(payload)) {
      users.value = payload
      // pagination остаётся прежним (если нет мета)
    } else if (payload.data && Array.isArray(payload.data)) {
      users.value = payload.data
      // обновляем пагинацию (защитно — берём поля от payload.meta или напрямую)
      paginationData.value = {
        current_page: payload.current_page || payload.meta?.page || paginationData.value.current_page,
        last_page: payload.last_page || payload.meta?.last_page || paginationData.value.last_page,
        per_page: payload.per_page || payload.meta?.per_page || paginationData.value.per_page,
        total: payload.total || payload.meta?.total || paginationData.value.total,
        links: payload.links || payload.meta?.links || paginationData.value.links,
        from: payload.from || paginationData.value.from,
        to: payload.to || paginationData.value.to
      }
    } else {
      // fallback: если usersStore.fetchUsers вернул объект с data на верхнем уровне
      if (response.data && Array.isArray(response.data)) {
        users.value = response.data
      } else {
        users.value = response // попытка использовать то, что пришло
      }
    }
  } catch (error) {
    console.error('Ошибка загрузки пользователей:', error)
  } finally {
    loading.value = false
  }
}

// Обработчик клика по строке (открытие модального окна)
const handleRowClick = (user) => {
  // На всякий случай убедимся, что у нас объект пользователя (и нет ссылок/ID)
  if (!user) return
  // Если row пришёл не в "полном" формате, можно запросить по id из usersStore.getUserById
  // но по заданию — берем из таблицы. Если надо — можно добавить fallback:
  // if (!user.email && user.id) user = await usersStore.getUserById(user.id)
  selectedUser.value = user
  modalVisible.value = true
}

// Остальные обработчики (без изменений)
const handleSortChange = (sortOptions) => {
  const { sortBy, sortDirection } = sortOptions
  activeSort.value = {
    sort_by: sortBy,
    sort_direction: sortDirection
  }
  loadUsers()
}

const handlePageChange = (page) => {
  paginationData.value.current_page = page
  loadUsers()
}

// Инициализация
onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.all-users-page {
  padding: 20px;
}

.table-controls {
  display: flex;
  align-items: center;
  gap: 20px;
  border-bottom: 3px solid rgb(210, 210, 210);
  width: 100%;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.filter-section {
  display: flex;
  align-items: center;
  margin-left: auto;
}

.table-section {
  padding: 10px;
}

.quick-filters {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.search-section {
  display: flex;
  align-items: center;
  flex: 1;
  max-width: 300px;
}

.search-ui-input :deep(.ui-input) {
  padding-top: 2px !important;
  padding-left: 10px !important;
  padding-bottom: 2px !important;
  border-radius: 20px 0 0 20px !important; 
  font-size: 14px !important;
  margin-bottom: 2px !important;
}

.search-btn {
  background: #71bfff;
  color: white;
  border: 1px solid #1296e8;
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

.reset-btn {
  padding: 6px 15px;
  font-size: 14px;
}

/* Адаптивность */
@media (max-width: 1200px) {
  .table-controls {
    flex-wrap: wrap;
    gap: 15px;
  }
  
  .quick-filters {
    order: 3;
    width: 100%;
    justify-content: center;
    margin-top: 10px;
  }
  
  .search-section {
    order: 1;
    max-width: 250px;
  }
  
  .filter-section {
    order: 2;
    margin-left: 0;
  }
}

@media (max-width: 768px) {
  .all-users-page {
    padding: 10px;
  }
  
  .quick-filters {
    gap: 5px;
  }
  
  .quick-filters button {
    font-size: 12px;
    padding: 4px 8px;
  }
}
</style>