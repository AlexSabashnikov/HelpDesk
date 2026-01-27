<!-- 
    Базовая таблица с сортировкой и пагинацией
    Используется для отображения списков заявок, компаний, пользователей
-->

<template>
  <div class="ui-table">
    <table class="table">
      <thead>
        <tr>
          <th v-for="column in columns" :key="column.key">
            <div class="column-header" @click="() => handleSort(column.key)">
              <span>{{ column.title }}</span>
              <span v-if="sortBy === column.key" class="sort-icon">
                {{ sortDirection === 'asc' ? '▲' : '▼' }}
              </span>
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, index) in data"
          :key="row.id || index"
          @click="() => $emit('rowClick', row)"
          :class="{ clickable: rowClickable, hoverable: hoverable }"
        >
          <td v-for="column in columns" :key="column.key">
            <slot :name="`cell-${column.key}`" :value="row[column.key]" :row="row" :column="column">
              {{ row[column.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Состояние загрузки -->
    <div v-if="loading" class="loading-state">
      <slot name="loading"> Загрузка данных... </slot>
    </div>

    <!-- Пустое состояние -->
    <div v-if="!loading && (!data || data.length === 0)" class="empty-state">
      <slot name="empty"> Данные отсутствуют </slot>
    </div>
  </div>
  <!-- Пагинация (если включена и есть данные) -->
    <UIPagination v-if="pagination && totalItems > 0 && totalItems > pageSize"
    :current-page="currentPage"
    :total="totalItems"
    :page-size="pageSize"
    :show-info="showPaginationInfo"
    :show-page-size-selector="showPageSizeSelector"
    :show-page-jump="showPageJump"
    :compact="compactPagination"
    :no-border="paginationNoBorder"
    @pageChange="handlePageChange"
    class="table-pagination"
  />
</template>

<script setup>
import { ref, defineProps, defineEmits, watch, computed  } from 'vue'
import UIPagination from '@/components/common/UI/UIPagination.vue'

const props = defineProps({
  columns: {
    type: Array,
    required: true,
    default: () => [],
  },
  data: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  sortable: {
    type: Boolean,
    default: false,
  },
  rowClickable: {
    type: Boolean,
    default: true,
  },
  hoverable: {
    type: Boolean,
    default: true,
  },
  pagination: {
    type: Boolean,
    default: false,
  },
  pageSize: {
    type: Number,
    default: 0, // ФИКСИРОВАННОЕ ЗНАЧЕНИЕ 20
  },
  currentPage: {
    type: Number,
    default: 1,
  },
  showPaginationInfo: {
    type: Boolean,
    default: true,
  },
  showPageSizeSelector: {
    type: Boolean,
    default: false,
  },
  showPageJump: {
    type: Boolean,
    default: false,
  },
  compactPagination: {
    type: Boolean,
    default: false,
  },
  paginationNoBorder: {
    type: Boolean,
    default: false,
  },
  totalItems: { 
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['rowClick', 'sortChange', 'pageChange'])

const sortBy = ref('')
const sortDirection = ref('asc')
const localCurrentPage = ref(props.currentPage)

const data = computed(() => {
  return props.data 
})

const handleSort = (columnKey) => {
  if (!props.sortable) return

  if (sortBy.value === columnKey) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = columnKey
    sortDirection.value = 'asc'
  }

  emit('sortChange', {
    sortBy: sortBy.value,
    sortDirection: sortDirection.value,
  })
}
const handlePageChange = (page) => {
  localCurrentPage.value = page
  emit('pageChange', page)
}

watch(() => props.currentPage, (newPage) => {
  localCurrentPage.value = newPage
})

watch(() => props.data, () => {
  // Сбрасываем на первую страницу при изменении данных
  localCurrentPage.value = 1
}, { deep: true })
</script>

<style scoped>
.ui-table {
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.table th {
  background-color: #f8f9fa;
  padding: 8px 16px;
  text-align: left;
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1d;
  border-bottom: 2px solid #dee2e6;
  white-space: nowrap;
}

.column-header {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.sort-icon {
  font-size: 10px;
  color: #6c757d;
}

.table td {
  padding: 0px 16px;
  height: 40px;
  border-bottom: 1px solid #e0e0e0;
  color: #212529;
}

.clickable {
  cursor: pointer;
}

.hoverable:hover {
  background-color: #ebedf4;
}

.loading-state,
.empty-state {
  padding: 40px;
  text-align: center;
  color: #6c757d;
  background: white;
}

.empty-state {
  font-style: italic;
}
</style>
