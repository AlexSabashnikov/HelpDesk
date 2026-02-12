<!-- src/views/admin/directories/DUsers.vue -->
<template>
  <!-- Основной контент страницы -->
  <div class="all-users-page">
    <!-- Панель с кнопками над таблицей -->
    <div class="table-controls">
      <div class="search-section">
        <UIInput
          v-model="searchQuery"
          placeholder="Поиск по пользователям (ФИО, email, логин)..."
          @keyup.enter="handleSearch"
          class="search-input"
          customClass="search-ui-input"
        />
        <button class="search-btn" @click="handleSearch">🔍</button>
      </div>

      <div class="quick-filters">
      <UIButton
        class="filter-btn filter-btn--admin"
        :class="{ 'filter-btn--active': activeFilters.role === 'admin' }"
        @click="setQuickFilter('admin')"
      >
        Администраторы: {{ countAdmin }}
      </UIButton>

      <UIButton
        class="filter-btn filter-btn--dispatcher"
        :class="{ 'filter-btn--active': activeFilters.role === 'dispatcher' }"
        @click="setQuickFilter('dispatcher')"
      >
        Диспетчеры: {{ countDispatcher }}
      </UIButton>

      <UIButton
        class="filter-btn filter-btn--engineer"
        :class="{ 'filter-btn--active': activeFilters.role === 'engineer' }"
        @click="setQuickFilter('engineer')"
      >
        Инженеры: {{ countEngineer }}
      </UIButton>

      <UIButton
        class="filter-btn filter-btn--client"
        :class="{ 'filter-btn--active': activeFilters.role === 'client' }"
        @click="setQuickFilter('client')"
      >
        Клиенты: {{ countClient }}
      </UIButton>
    </div>


      <!-- Кнопка открытия фильтров -->
      <div class="filter-section">
        <UsersFilters
          :filters="activeFilters"
          @applyFilters="handleApplyFilters"
          @resetFilters="handleResetFilters"
        />
      </div>
    </div>

    <!-- Таблица пользователей -->
    <div class="table-section">
      <UsersTable
        :users="users"
        :loading="loading"
        :pagination="paginationData"
        :show-laravel-pagination="false"
        @rowClick="handleRowClick"
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
import { ref, onMounted, computed } from 'vue'
import { useUsersStore } from '@/stores/users.store'
import UsersTable from '@/components/tables/UsersTable.vue'
import UserProfileModal from '@/components/common/UI/UserProfileModal.vue'
import UIInput from '@/components/common/UI/UIInput.vue'
import UIButton from '@/components/common/UI/UIButton.vue'
import UsersFilters from '@/components/common/Filters/UsersFilters.vue' // <-- новый импорт
const usersStore = useUsersStore()

// Поиск
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
      search: searchQuery.value || '',
      ...activeFilters.value,
      ...activeSort.value,
    }

    const response = await usersStore.fetchUsers(params)
    // Поддерживаем разные форматы (Laravel paginator или "data")
    const payload = response.data || response

    if (Array.isArray(payload)) {
      users.value = payload
      // pagination остаётся прежним (если нет мета)
    } else if (payload.data && Array.isArray(payload.data)) {
      users.value = payload.data
      paginationData.value = {
        current_page: payload.current_page || payload.meta?.current_page || paginationData.value.current_page,
        last_page: payload.last_page || payload.meta?.last_page || paginationData.value.last_page,
        per_page: payload.per_page || payload.meta?.per_page || paginationData.value.per_page,
        total: payload.total || payload.meta?.total || paginationData.value.total,
        links: payload.links || payload.meta?.links || paginationData.value.links,
        from: payload.from || paginationData.value.from,
        to: payload.to || paginationData.value.to
      }
    } else {
      // fallback
      users.value = Array.isArray(response) ? response : (response.data || [])
    }
  } catch (error) {
    console.error('Ошибка загрузки пользователей:', error)
  } finally {
    loading.value = false
  }
}

// Обработчик клика по строке (открытие модального окна)
const handleRowClick = (user) => {
  if (!user) return
  selectedUser.value = user
  modalVisible.value = true
}

// Поиск
const handleSearch = () => {
  // сбрасываем страницу на первую
  paginationData.value.current_page = 1
  loadUsers()
}

// Быстрые фильтры (по роли)
const setQuickFilter = (roleSlug) => {
  // Тогглим: если уже установлено — снимем
  if (activeFilters.value.role === roleSlug) {
    activeFilters.value = { ...activeFilters.value, role: '' }
  } else {
    activeFilters.value = { ...activeFilters.value, role: roleSlug }
  }
  // При изменении фильтров возвращаемся на 1-ю страницу
  paginationData.value.current_page = 1
  loadUsers()
}

// Обработчики фильтров от боковой панели
const handleApplyFilters = (filters) => {
  activeFilters.value = { ...activeFilters.value, ...filters }
  paginationData.value.current_page = 1
  loadUsers()
}

const handleResetFilters = () => {
  activeFilters.value = {}
  paginationData.value.current_page = 1
  loadUsers()
}

// Пагинация / сортировка
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

// Вычисляемые счётчики по ролям (локально по текущему набору users)
const countAdmin = computed(() => users.value.filter(u => normalizeRoleFromRow(u) === 'admin').length)
const countDispatcher = computed(() => users.value.filter(u => normalizeRoleFromRow(u) === 'dispatcher').length)
const countEngineer = computed(() => users.value.filter(u => normalizeRoleFromRow(u) === 'engineer').length)
const countClient = computed(() => users.value.filter(u => normalizeRoleFromRow(u) === 'client').length)

function normalizeRoleFromRow(u) {
  // поддерживаем разные представления роли (object или string)
  const r = u?.role
  if (!r) return ''
  if (typeof r === 'string') return r.toLowerCase()
  if (typeof r === 'object') {
    const name = (r.name || r.slug || '').toString().toLowerCase()
    if (name.includes('админ') || name.includes('admin')) return 'admin'
    if (name.includes('диспетчер') || name.includes('dispatcher')) return 'dispatcher'
    if (name.includes('инженер') || name.includes('engineer')) return 'engineer'
    if (name.includes('клиент') || name.includes('client')) return 'client'
  }
  return ''
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
  max-width: 420px; /* чуть шире для пользователей */
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
  padding: 6px 12px;
  cursor: pointer;
  font-size: 14px;
  margin-left: 6px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 28px;
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
    max-width: 100%;
  }
  
  .filter-section {
    order: 2;
    margin-left: 0;
  }
}

  /* Общая кнопка */
  .filter-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    border-radius: 10px;
    font-weight: 300;
    font-size: 12px;
    color: #ffffff;
    border: none;
    cursor: pointer;
    transition: transform .06s ease, box-shadow .12s ease, filter .06s ease;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 36px;
    line-height: 1;
    white-space: nowrap;
  }

  /* Цвета по ролям (фон) */
  .filter-btn--admin { background: #dc3545; }         /* красный */
  .filter-btn--dispatcher { background: #2ecc71; }    /* салатовый (яркий зелёный) */
  .filter-btn--engineer { background: #195698; }      /* синий (тёмный) */
  .filter-btn--client { background: #16a34a; }        /* трава / насыщенная зелень */

  /* hover/active */
  .filter-btn:hover { filter: brightness(0.95); transform: translateY(-1px); }
  .filter-btn:active { transform: translateY(0); }

  /* Активный (включённый) фильтр — более заметный эффект */
  .filter-btn--active {
    box-shadow: 0 6px 18px rgba(0,0,0,0.12);
    outline: 3px solid rgba(255,255,255,0.12);
    transform: translateY(-2px);
  }

  /* Дополнительный тон для доступности — светлый текст и контраст */
  .filter-btn--admin,
  .filter-btn--dispatcher,
  .filter-btn--engineer,
  .filter-btn--client {
    color: #ffffff;
  }

  /* Фокус-кейсы (keyboard accessible) */
  .filter-btn:focus {
    box-shadow: 0 0 0 4px rgba(59,130,246,0.18);
    outline: none;
  }

  /* Если нужно — уменьшить минимальную высоту под ваш UIInput */
  .filter-btn { min-height: 38px; padding: 6px 14px; }


@media (max-width: 768px) {
  .all-users-page {
    padding: 10px;
  }
  
  .quick-filters {
    gap: 6px;
  }
  
  .quick-filters button {
    font-size: 12px;
    padding: 6px 10px;
  }
}
</style>
