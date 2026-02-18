<!-- 
    Справочник пользователей
    Администраторы, инженеры, клиенты
    Управление ролями, правами доступа, блокировка аккаунтов
-->

<template>
  <!-- Основной контент страницы -->
  <UIIcons ref="uiIcons" />
  <div class="all-users-page">
    <!-- Панель с кнопками над таблицей -->
    <div class="table-controls">
      <div class="search-section">
        <UIInput
          v-model="searchQuery"
          placeholder="Поиск по пользователям..."
          type="text"
          :max-length="30"
          @keyup.enter="handleSearch"
          class="search-input"
          customClass="search-ui-input"
        />
        <button class="search-btn" @click="handleSearch">
          <Icon :icon="uiIcons?.icons.userSearch" width="24" height="24"/>
        </button>
      </div>
      <div class="quick-filters">
        <UIButton
        class="filter-btn"
        :class="{ 'filter-btn--admin--active': selectedRoles.includes('admin') }"
        @click="setQuickFilter('admin')"
      >
        Администраторы
      </UIButton>

      <UIButton
        class="filter-btn"
        :class="{ 'filter-btn--dispatcher--active': selectedRoles.includes('dispatcher') }"
        @click="setQuickFilter('dispatcher')"
      >
        Диспетчеры
      </UIButton>

      <UIButton
        class="filter-btn"
        :class="{ 'filter-btn--engineer--active': selectedRoles.includes('engineer') }"
        @click="setQuickFilter('engineer')"
      >
        Инженеры
      </UIButton>

      <UIButton
        class="filter-btn"
        :class="{ 'filter-btn--client--active': selectedRoles.includes('client') }"
        @click="setQuickFilter('client')"
      >
        Клиенты
      </UIButton>
    </div>
      <UIButton 
        class="create-user-btn"
        @click="openCreateModal"
        v-if="canCreateUser"
      >
        <span class="btn-content">
          <Icon :icon="uiIcons?.icons.userCreate" width="20" height="20"/>
          <span>Создать пользователя</span>
        </span>
      </UIButton>



      <!-- Кнопка открытия фильтров 
      <div class="filter-section">
        <UsersFilters
          :filters="activeFilters"
          @applyFilters="handleApplyFilters"
          @resetFilters="handleResetFilters"
        />
      </div>-->
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
      />
    </div>

    <!-- Модалка профиля (берёт данные из selectedUser) -->
    <UserProfileModal
      v-model="modalVisible"
      :mode="modalMode"
      :user="selectedUser"
      @saved="handleUserSaved"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getUserRole } from '@/utils/auth.utils'
import { useUsersStore } from '@/stores/users.store'
import UsersTable from '@/components/tables/UsersTable.vue'
import UIInput from '@/components/common/UI/UIInput.vue'
import UIButton from '@/components/common/UI/UIButton.vue'
import UserProfileModal from '@/components/modal/UserProfileModal.vue'
import { Icon } from '@iconify/vue'
import UIIcons from '@/components/common/UI/UIIcons.vue'
//import UsersFilters from '@/components/common/Filters/UsersFilters.vue'

const uiIcons = ref()
const usersStore = useUsersStore()
const searchQuery = ref('')
const selectedRoles = ref([])  // массив выбранных ролей
const users = ref([])
const loading = ref(false)
const activeFilters = ref({})

// Модальное окно
const selectedUser = ref(null)
const modalVisible = ref(false)
const modalMode = ref('user')
// Проверка прав на создание пользователя
const canCreateUser = computed(() => {
  return getUserRole() === 'admin'
})

const roleIdMap = {
  'admin': 1,
  'dispatcher': 2,
  'engineer': 3,
  'client': 4
}

const paginationData = ref({
  current_page: 1,
  last_page: 1,
  per_page: 1,
  total: 0,
  links: [],
  from: 0,
  to: 0
})

// Храним параметры последнего запроса для сравнения
const lastRequestParams = ref({
  search: '',
  roles: [],
  page: 1
})


// Загрузка пользователей для таблицы (с фильтрацией и пагинацией)
const loadUsers = async () => {
  loading.value = true
  try {
    const params = {
      search: searchQuery.value,
      roles: activeFilters.value.role || [],
    }
    const currentPage = paginationData.value.current_page

    // Проверяем, не совпадает ли с последним запросом
    if (isSameRequest(params, currentPage)) {
      console.log('Запрос пропущен (параметры не изменились)')
      return
    }
  
    // Сохраняем параметры текущего запроса
    lastRequestParams.value = {
      search: params.search,
      roles: [...params.roles],
      page: currentPage
    }
    
    const response = await usersStore.fetchUsers(params)
    
    // Сервер возвращает данные в поле data.data
    // response.data.data - массив пользователей
    if (response?.data && Array.isArray(response.data.data)) {
      users.value = response.data.data
      
      // Обновляем пагинацию из response.data
      paginationData.value = {
        current_page: response.data.current_page || 1,
        last_page: response.data.last_page || 1,
        per_page: response.data.per_page || 20,
        total: response.data.total || 0,
        links: response.data.links || [],
        from: response.data.from || 0,
        to: response.data.to || 0
      }
      
      console.log('Загружено пользователей:', users.value.length)
    } else {
      console.warn('Неожиданный формат ответа:', response)
      users.value = []
    }
  } catch (error) {
    console.error('Ошибка загрузки пользователей:', error)
  } finally {
    loading.value = false
  }
}

// Функция для сравнения параметров
const isSameRequest = (params, page) => {
  return lastRequestParams.value.search === params.search &&
        JSON.stringify(lastRequestParams.value.roles) === JSON.stringify(params.roles) &&
        lastRequestParams.value.page === page
}

const openCreateModal = () => {
  selectedUser.value = null
  modalMode.value = 'create'
  modalVisible.value = true
}

const handleUserSaved = () => {
  // Перезагружаем список после сохранения
  loadUsers()
}

const handleRowClick = (user) => {
  if (!user) return
  
  // Создаем безопасную копию объекта с правильными полями
  const safeUser = {
    id: user.id,
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    middle_name: user.middle_name || '',
    email: user.email || '',
    phone: user.phone || '',
    role_id: user.role_id || null,
    name: user.name || getRoleNameFromId(user.role_id) // Добавляем name если есть
  }
  
  console.log('handleRowClick: передаем пользователя', safeUser)
  selectedUser.value = safeUser
  modalVisible.value = true
}

// Вспомогательная функция для получения названия роли по ID
const getRoleNameFromId = (roleId) => {
  switch (Number(roleId)) {
    case 1: return 'Администратор'
    case 2: return 'Диспетчер'
    case 3: return 'Инженер'
    case 4: return 'Клиент'
    default: return null
  }
}

const handlePageChange = (page) => {
  console.log('📄 handlePageChange', page)
  paginationData.value.current_page = page
  loadUsers()
}

const handleSearch = () => {
  // сбрасываем страницу на первую
  paginationData.value.current_page = 1
  loadUsers()
}

const setQuickFilter = (roleSlug) => {
  // Если роль уже выбрана - убираем, если нет - добавляем
  if (selectedRoles.value.includes(roleSlug)) {
    selectedRoles.value = selectedRoles.value.filter(r => r !== roleSlug)
  } else {
    selectedRoles.value = [...selectedRoles.value, roleSlug]
  }
  
  // Преобразуем slug в ID и сохраняем
  activeFilters.value.role = selectedRoles.value.map(slug => roleIdMap[slug])
  
  paginationData.value.current_page = 1
  loadUsers()
}

// Инициализация
onMounted(() => {
  activeFilters.value.role = [1, 2, 3, 4]
  selectedRoles.value = [] // для визуального отображения активных кнопок
  loadUsers()
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
  gap: 10px;
  flex-wrap: wrap;
}

.search-section {
  display: flex;
  margin-left:20px;
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
  background: #319ef8;
  color: white;
  border: 1px solid #1296e8;
  border-radius: 0 20px 20px 0;
  padding: 1px 6px;
  cursor: pointer;
  font-size: 12px;
  margin-left: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-btn:hover {
  background: #299eff;
  border-color: #339af0;
  transform: scale(1.05);
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
    max-width: 100%;
  }
}

  /* Общая кнопка */
  .filter-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 5px;
    font-weight: 300;
    font-size: 12px;
    border: 1px solid #144da8;
    background-color: #f1f9ff; 
    color: #144da8;
    cursor: pointer;
    transition: transform .06s ease, box-shadow .12s ease, filter .06s ease;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 36px;
    line-height: 1;
    white-space: nowrap;
  }    

  /* hover/active */
  .filter-btn:hover { 
    background: #dbe4ff;
    border-color: #0056e9;
    transform: scale(1.02);
  }

  /* Активный (включённый) фильтр — более заметный эффект */
  .filter-btn--admin--active {
    background-color: #dc3545;
    color: white;
    transform: scale(1.02);
    border: none;
  }
  .filter-btn--dispatcher--active {
    background-color: #0fa873;
    color: white;
    transform: scale(1.02);
    border: none;
  }
  .filter-btn--engineer--active {
    background-color: #195698;
    color: white;
    transform: scale(1.02);
    border: none;
  }
  .filter-btn--client--active {
    background-color: #16961a;
    color: white;
    transform: scale(1.02);
    border: none;
  }

  .filter-btn--admin--active:hover {
    background-color: #ba1c2b;
    color: white;
    transform: scale(1.05);
    border: none;
  }
  .filter-btn--dispatcher--active:hover {
    background-color: #0e875d;
    color: white;
    transform: scale(1.05);
    border: none;
  }
  .filter-btn--engineer--active:hover {
    background-color: #114985;
    color: white;
    transform: scale(1.05);
    border: none;
  }
  .filter-btn--client--active:hover {
    background-color: #117b15;
    color: white;
    transform: scale(1.05);
    border: none;
  }

  /* Фокус-кейсы (keyboard accessible) */
  .filter-btn:focus {
    box-shadow: 0 0 0 2px rgba(56, 145, 255, 0.334);
    outline: none;
  }

  .create-user-btn {
  background: #3cc93a;
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 20px;
  font-weight: 400 !important;
  font-size: 14px;
  margin-left: 32%;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
}

.create-user-btn:hover {
  background: #28a23e;
  transform: scale(1.015);
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 8px;
  line-height: 1;
}

.btn-content .iconify {
  display: flex;
  align-items: center;
  justify-content: center;
}


@media (max-width: 768px) {
  
  .quick-filters {
    gap: 5px;
    gap: 6px;
  }
  
  .quick-filters button {
    font-size: 12px;
    padding: 4px 8px;
    padding: 6px 10px;
  }
}
</style>