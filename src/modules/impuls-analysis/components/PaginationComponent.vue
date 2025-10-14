<template>
  <div class="pagination-container">
    <!-- Информация о пагинации -->
    <div class="pagination-info">
      <div class="pagination-stats">
        <span class="stats-text">
          Показано {{ startItem }}-{{ endItem }} из {{ totalItems }} элементов
        </span>
      </div>
      
      <!-- Настройка размера страницы -->
      <div class="page-size-selector">
        <label for="pageSizeSelect" class="page-size-label">Элементов на странице:</label>
        <select
          id="pageSizeSelect"
          class="form-select page-size-select"
          :value="pageSize"
          @change="onPageSizeChange"
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
      </div>
    </div>

    <!-- Навигация по страницам -->
    <div class="pagination-nav" v-if="totalPages > 1">
      <nav aria-label="Навигация по страницам">
        <ul class="pagination">
          <!-- Кнопка "В начало" -->
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <button
              class="page-link"
              @click="goToPage(1)"
              :disabled="currentPage === 1"
              aria-label="Первая страница"
              title="В начало"
            >
              <ChevronsLeft :size="16" />
            </button>
          </li>

          <!-- Кнопка "Предыдущая" -->
          <li class="page-item" :class="{ disabled: !hasPrevious }">
            <button
              class="page-link"
              @click="goToPage(previousPage)"
              :disabled="!hasPrevious"
              aria-label="Предыдущая страница"
            >
              <ChevronLeft :size="16" />
            </button>
          </li>

          <!-- Номера страниц -->
          <li
            v-for="pageNum in visiblePages"
            :key="pageNum"
            class="page-item"
            :class="{ active: pageNum === currentPage }"
          >
            <button
              class="page-link"
              @click="goToPage(pageNum)"
              :disabled="pageNum === currentPage"
            >
              {{ pageNum }}
            </button>
          </li>

          <!-- Кнопка "Следующая" -->
          <li class="page-item" :class="{ disabled: !hasNext }">
            <button
              class="page-link"
              @click="goToPage(nextPage)"
              :disabled="!hasNext"
              aria-label="Следующая страница"
            >
              <ChevronRight :size="16" />
            </button>
          </li>

          <!-- Кнопка "В конец" -->
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <button
              class="page-link"
              @click="goToPage(totalPages)"
              :disabled="currentPage === totalPages"
              aria-label="Последняя страница"
              title="В конец"
            >
              <ChevronsRight :size="16" />
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script>
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-vue-next'

export default {
  name: 'PaginationComponent',
  components: {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight
  },
  props: {
    currentPage: {
      type: Number,
      required: true
    },
    totalPages: {
      type: Number,
      required: true
    },
    totalItems: {
      type: Number,
      required: true
    },
    pageSize: {
      type: Number,
      required: true
    },
    hasNext: {
      type: Boolean,
      default: false
    },
    hasPrevious: {
      type: Boolean,
      default: false
    },
    nextPage: {
      type: Number,
      default: null
    },
    previousPage: {
      type: Number,
      default: null
    }
  },
  computed: {
    startItem() {
      return (this.currentPage - 1) * this.pageSize + 1
    },
    endItem() {
      const end = this.currentPage * this.pageSize
      return Math.min(end, this.totalItems)
    },
    visiblePages() {
      const pages = []
      const maxVisible = 5
      
      if (this.totalPages <= maxVisible) {
        // Показываем все страницы
        for (let i = 1; i <= this.totalPages; i++) {
          pages.push(i)
        }
      } else {
        // Показываем страницы вокруг текущей
        let start = Math.max(1, this.currentPage - 2)
        let end = Math.min(this.totalPages, start + maxVisible - 1)
        
        // Корректируем начало, если конец слишком близко к концу
        if (end - start < maxVisible - 1) {
          start = Math.max(1, end - maxVisible + 1)
        }
        
        for (let i = start; i <= end; i++) {
          pages.push(i)
        }
      }
      
      return pages
    }
  },
  methods: {
    goToPage(page) {
      if (page && page !== this.currentPage && page >= 1 && page <= this.totalPages) {
        this.$emit('page-change', page)
      }
    },
    onPageSizeChange(event) {
      const newPageSize = parseInt(event.target.value)
      this.$emit('page-size-change', newPageSize)
    }
  }
}
</script>

<style scoped lang="scss">
.pagination-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.pagination-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.pagination-stats {
  .stats-text {
    color: var(--bs-secondary-color);
    font-size: 0.875rem;
    font-weight: 500;
  }
}

.page-size-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  .page-size-label {
    font-size: 0.875rem;
    color: var(--bs-secondary-color);
    font-weight: 500;
    white-space: nowrap;
  }
  
  .page-size-select {
    min-width: 80px;
    border-radius: 6px;
    border: 1px solid var(--bs-border-color);
    padding: 0.375rem 0.5rem;
    font-size: 0.875rem;
    
    &:focus {
      border-color: var(--bs-primary);
      box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
    }
  }
}

.pagination-nav {
  display: flex;
  justify-content: center;
  
  .pagination {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
    gap: 0.25rem;
    
    .page-item {
      &.active {
        .page-link {
          background: var(--bs-primary);
          border-color: var(--bs-primary);
          color: white;
        }
      }
      
      &.disabled {
        .page-link {
          color: var(--bs-gray-400);
          background: var(--bs-gray-100);
          border-color: var(--bs-border-color);
          cursor: not-allowed;
        }
      }
      
      .page-link {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 40px;
        height: 40px;
        padding: 0.5rem;
        border: 1px solid var(--bs-border-color);
        background: white;
        color: var(--bs-body-color);
        text-decoration: none;
        border-radius: 6px;
        font-size: 0.875rem;
        font-weight: 500;
        transition: all 0.2s ease;
        cursor: pointer;
        
        &:hover:not(:disabled) {
          background: var(--bs-gray-100);
          border-color: var(--bs-primary);
          color: var(--bs-primary);
          transform: translateY(-1px);
        }
        
        &:focus {
          outline: none;
          box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
        }
        
        &:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }
      }
    }
  }
}

// Адаптивность
@media (max-width: 768px) {
  .pagination-container {
    padding: 1rem;
  }
  
  .pagination-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .page-size-selector {
    width: 100%;
    justify-content: space-between;
  }
  
  .pagination-nav {
    .pagination {
      .page-item {
        .page-link {
          min-width: 36px;
          height: 36px;
          font-size: 0.8rem;
        }
      }
    }
  }
}

@media (max-width: 576px) {
  .pagination-nav {
    .pagination {
      gap: 0.125rem;
      
      .page-item {
        .page-link {
          min-width: 32px;
          height: 32px;
          padding: 0.25rem;
          font-size: 0.75rem;
        }
      }
    }
  }
}
</style>
