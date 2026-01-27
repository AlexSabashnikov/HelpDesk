<!-- 
    Компонент пагинации
    Может использоваться отдельно или внутри таблиц
-->

<template>
  <div class="ui-pagination" :class="{ compact, 'no-border': noBorder }">
    <!-- Информация о записях -->
    <div class="pagination-info" v-if="showInfo">
      {{ startItem }}-{{ endItem }} из {{ total }}
    </div>

    <div class="pagination-controls">
      <!-- Кнопка "Назад" -->
      <button
        class="pagination-btn"
        :disabled="currentPage === 1"
        @click="handlePageChange(currentPage - 1)"
        :title="prevButtonTitle"
      >
        {{ prevButtonText }}
      </button>

      <!-- Номера страниц -->
      <div class="page-numbers">
        <!-- Все страницы если их немного -->
        <template v-if="totalPages <= maxVisiblePages">
          <button
            v-for="page in totalPages"
            :key="page"
            class="page-btn"
            :class="{ active: page === currentPage, 'ellipsis': false }"
            @click="handlePageChange(page)"
            :aria-label="`Страница ${page}`"
          >
            {{ page }}
          </button>
        </template>

        <!-- Сложная логика с точками если много страниц -->
        <template v-else>
          <!-- Первая страница -->
          <button
            class="page-btn"
            :class="{ active: 1 === currentPage }"
            @click="handlePageChange(1)"
            aria-label="Первая страница"
          >
            1
          </button>

          <!-- Точки если нужно -->
          <span v-if="currentPage > 3" class="page-dots">...</span>

          <!-- Средние страницы -->
          <button
            v-for="page in middlePages"
            :key="page"
            class="page-btn"
            :class="{ active: page === currentPage }"
            @click="handlePageChange(page)"
            :aria-label="`Страница ${page}`"
          >
            {{ page }}
          </button>

          <!-- Точки если нужно -->
          <span v-if="currentPage < totalPages - 2" class="page-dots">...</span>

          <!-- Последняя страница -->
          <button
            class="page-btn"
            :class="{ active: totalPages === currentPage }"
            @click="handlePageChange(totalPages)"
            aria-label="Последняя страница"
          >
            {{ totalPages }}
          </button>
        </template>
      </div>

      <!-- Кнопка "Вперед" -->
      <button
        class="pagination-btn"
        :disabled="currentPage === totalPages"
        @click="handlePageChange(currentPage + 1)"
        :title="nextButtonTitle"
      >
        {{ nextButtonText }}
      </button>
    </div>

    <!-- Селектор количества элементов на странице -->
    <div class="page-size-selector" v-if="showPageSizeSelector">
      <span class="selector-label">{{ pageSizeLabel }}</span>
      <select 
        v-model="localPageSize" 
        @change="handlePageSizeChange"
        class="page-size-select"
        :aria-label="pageSizeLabel"
      >
      </select>
    </div>

    <!-- Прыжок на конкретную страницу -->
    <div class="page-jump" v-if="showPageJump">
      <span>Перейти:</span>
      <input
        type="number"
        v-model.number="jumpPage"
        @keyup.enter="handleJumpPage"
        :min="1"
        :max="totalPages"
        class="jump-input"
        aria-label="Номер страницы для перехода"
      />
      <button @click="handleJumpPage" class="jump-btn" title="Перейти">
        →
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  // Основные пропсы
  currentPage: {
    type: Number,
    default: 1,
    required: true
  },
  total: {
    type: Number,
    default: 0,
    required: true
  },
  pageSize: {
    type: Number,
    default: 0,
    required: true
  },
  
  // Настройки отображения
  maxVisiblePages: {
    type: Number,
    default: 5
  },
  compact: {
    type: Boolean,
    default: false
  },
  noBorder: {
    type: Boolean,
    default: false
  },
  showInfo: {
    type: Boolean,
    default: true
  },
  showPageSizeSelector: {
    type: Boolean,
    default: false
  },
  showPageJump: {
    type: Boolean,
    default: false
  },
  
  // Тексты
  prevButtonText: {
    type: String,
    default: '←'
  },
  nextButtonText: {
    type: String,
    default: '→'
  },
  prevButtonTitle: {
    type: String,
    default: 'Предыдущая страница'
  },
  nextButtonTitle: {
    type: String,
    default: 'Следующая страница'
  },
  pageSizeLabel: {
    type: String,
    default: 'Показать:'
  },
})

const emit = defineEmits(['pageChange', 'pageSizeChange'])

// Локальные состояния
const localPageSize = ref(props.pageSize)
const jumpPage = ref(props.currentPage)

// Вычисляемые свойства
const totalPages = computed(() => {
  if (props.total === 0) return 1
  return Math.max(1, Math.ceil(props.total / props.pageSize))
})

const startItem = computed(() => {
  if (props.total === 0) return 0
  return (props.currentPage - 1) * props.pageSize + 1
})

const endItem = computed(() => {
  if (props.total === 0) return 0
  const end = props.currentPage * props.pageSize
  return Math.min(end, props.total)
})

const middlePages = computed(() => {
  const pages = []
  
  if (totalPages.value <= props.maxVisiblePages) {
    return pages
  }
  
  let start = Math.max(2, props.currentPage - 1)
  let end = Math.min(totalPages.value - 1, props.currentPage + 1)
  
  // Корректируем если находимся слишком близко к началу или концу
  if (props.currentPage <= 3) {
    end = Math.min(4, totalPages.value - 1)
  }
  
  if (props.currentPage >= totalPages.value - 2) {
    start = Math.max(totalPages.value - 3, 2)
  }
  
  for (let i = start; i <= end; i++) {
    if (i > 1 && i < totalPages.value) {
      pages.push(i)
    }
  }
  
  return pages
})

// Обработчики событий
const handlePageChange = (page) => {
  if (page >= 1 && page <= totalPages.value && page !== props.currentPage) {
    emit('pageChange', page)
    jumpPage.value = page 
  }
}

const handleJumpPage = () => {
  const page = Math.max(1, Math.min(jumpPage.value, totalPages.value))
  handlePageChange(page)
}

watch(() => props.currentPage, (newPage) => {
  jumpPage.value = newPage
})

watch(() => props.pageSize, (newSize) => {
  localPageSize.value = newSize
})

// Сбрасываем пагинацию при изменении total
watch(() => props.total, () => {
  jumpPage.value = 1
})
</script>

<style scoped>
.ui-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background-color: #ffffff;
  flex-wrap: wrap;
  gap: 16px;
}

.ui-pagination.compact {
  padding: 12px 16px;
}

.ui-pagination.no-border {
  border-top: none;
}

.pagination-info {
  font-size: 14px;
  color: #6c757d;
  white-space: nowrap;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.pagination-btn {
  min-width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  color: #495057;
  transition: all 0.2s;
  user-select: none;
  padding: 0 8px;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #e9ecef;
  border-color: #adb5bd;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.page-btn {
  min-width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  color: #495057;
  transition: all 0.2s;
  user-select: none;
}

.page-btn:hover:not(.active) {
  background-color: #e9ecef;
  border-color: #adb5bd;
}

.page-btn.active {
  background-color: #3b82f6;
  border-color: #3b82f6;
  color: #ffffff;
  font-weight: 600;
  cursor: default;
}

.page-btn.ellipsis {
  cursor: default;
  background: none;
  border: none;
  min-width: auto;
}

.page-dots {
  padding: 0 8px;
  color: #6c757d;
  user-select: none;
  font-size: 14px;
}

.page-size-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6c757d;
  white-space: nowrap;
}

.selector-label {
  font-weight: 500;
}

.page-size-select {
  padding: 4px 8px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  background-color: #ffffff;
  color: #495057;
  cursor: pointer;
  font-size: 14px;
  min-width: 60px;
}

.page-size-select:focus {
  outline: none;
  border-color: #3b82f6;
}

.page-jump {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6c757d;
  white-space: nowrap;
}

.jump-input {
  width: 60px;
  padding: 4px 8px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  text-align: center;
  font-size: 14px;
}

.jump-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.jump-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  color: #495057;
  transition: all 0.2s;
}

.jump-btn:hover {
  background-color: #e9ecef;
  border-color: #adb5bd;
}

/* Адаптивность */
@media (max-width: 768px) {
  .ui-pagination {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .pagination-info,
  .pagination-controls,
  .page-size-selector,
  .page-jump {
    justify-content: center;
    width: 100%;
  }
  
  .pagination-controls {
    justify-content: center;
  }
}
</style>