<template>
  <nav v-if="totalPages > 1" class="pagination-nav">
    <ul class="pagination justify-content-center">
      <!-- Первая страница -->
      <li class="page-item" :class="{ disabled: currentPage === 1 }">
        <button 
          class="page-link" 
          @click="goToPage(1)"
          :disabled="currentPage === 1"
          title="Первая страница"
        >
          <ChevronsLeft :size="16" />
        </button>
      </li>
      
      <!-- Предыдущая страница -->
      <li class="page-item" :class="{ disabled: currentPage === 1 }">
        <button 
          class="page-link" 
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
          title="Предыдущая страница"
        >
          <ChevronLeft :size="16" />
        </button>
      </li>
      
      <!-- Номера страниц -->
      <template v-for="page in visiblePages" :key="page">
        <li v-if="page === '...'" class="page-item disabled">
          <span class="page-link">...</span>
        </li>
        <li v-else class="page-item" :class="{ active: page === currentPage }">
          <button 
            class="page-link" 
            @click="goToPage(page)"
            :class="{ 'active': page === currentPage }"
          >
            {{ page }}
          </button>
        </li>
      </template>
      
      <!-- Следующая страница -->
      <li class="page-item" :class="{ disabled: currentPage === totalPages }">
        <button 
          class="page-link" 
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          title="Следующая страница"
        >
          <ChevronRight :size="16" />
        </button>
      </li>
      
      <!-- Последняя страница -->
      <li class="page-item" :class="{ disabled: currentPage === totalPages }">
        <button 
          class="page-link" 
          @click="goToPage(totalPages)"
          :disabled="currentPage === totalPages"
          title="Последняя страница"
        >
          <ChevronsRight :size="16" />
        </button>
      </li>
    </ul>
    
    <!-- Информация о страницах -->
    <div class="pagination-info">
      <span class="text-muted">
        Страница {{ currentPage }} из {{ totalPages }}
        ({{ totalItems }} {{ totalItemsText }})
      </span>
    </div>
  </nav>
</template>

<script>
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-vue-next'

export default {
  name: 'Pagination',
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
    itemsPerPage: {
      type: Number,
      default: 10
    },
    maxVisiblePages: {
      type: Number,
      default: 5
    }
  },
  emits: ['page-change'],
  computed: {
    totalItemsText() {
      const lastDigit = this.totalItems % 10
      const lastTwoDigits = this.totalItems % 100
      
      if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
        return 'элементов'
      }
      
      if (lastDigit === 1) {
        return 'элемент'
      } else if (lastDigit >= 2 && lastDigit <= 4) {
        return 'элемента'
      } else {
        return 'элементов'
      }
    },
    visiblePages() {
      const pages = []
      const total = this.totalPages
      const current = this.currentPage
      const maxVisible = this.maxVisiblePages
      
      if (total <= maxVisible) {
        // Показываем все страницы
        for (let i = 1; i <= total; i++) {
          pages.push(i)
        }
      } else {
        // Показываем страницы с многоточием
        const half = Math.floor(maxVisible / 2)
        let start = Math.max(1, current - half)
        let end = Math.min(total, start + maxVisible - 1)
        
        // Корректируем начало, если конец слишком близко к последней странице
        if (end - start + 1 < maxVisible) {
          start = Math.max(1, end - maxVisible + 1)
        }
        
        // Добавляем первую страницу и многоточие
        if (start > 1) {
          pages.push(1)
          if (start > 2) {
            pages.push('...')
          }
        }
        
        // Добавляем видимые страницы
        for (let i = start; i <= end; i++) {
          pages.push(i)
        }
        
        // Добавляем многоточие и последнюю страницу
        if (end < total) {
          if (end < total - 1) {
            pages.push('...')
          }
          pages.push(total)
        }
      }
      
      return pages
    }
  },
  methods: {
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
        this.$emit('page-change', page)
      }
    }
  }
}
</script>

<style scoped>
.pagination-nav {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.pagination {
  margin: 0;
  gap: 0.5rem;
}

.page-item {
  border-radius: 8px;
  overflow: visible;
}

.page-link {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0.75rem;
  min-width: 40px;
  height: 40px;
  border: 2px solid #e2e8f0;
  background: white;
  color: #6c757d;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  border-radius: 8px;
  position: relative;
  z-index: 1;
}

.page-link:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: #007bff;
  color: #007bff;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.15);
  z-index: 2;
}

.page-item.active .page-link {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  border-color: #007bff;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
  z-index: 2;
}

.page-item.disabled .page-link {
  background: #f8f9fa;
  border-color: #e9ecef;
  color: #adb5bd;
  cursor: not-allowed;
  opacity: 0.6;
}

.page-item.disabled .page-link:hover {
  transform: none;
  box-shadow: none;
  background: #f8f9fa;
  border-color: #e9ecef;
  color: #adb5bd;
}

/* Синяя обводка при фокусе */
.page-link:focus {
  outline: none !important;
  border-color: #007bff !important;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25) !important;
}

.page-link:focus-visible {
  outline: none !important;
  border-color: #007bff !important;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25) !important;
}

.page-link:active {
  outline: none !important;
  border-color: #007bff !important;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25) !important;
}

.pagination-info {
  font-size: 0.85rem;
  text-align: center;
}

@media (max-width: 768px) {
  .pagination {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .page-link {
    min-width: 36px;
    height: 36px;
    padding: 0.375rem 0.5rem;
    font-size: 0.8rem;
  }
  
  .pagination-info {
    font-size: 0.8rem;
  }
}

@media (max-width: 576px) {
  .page-link {
    min-width: 32px;
    height: 32px;
    padding: 0.25rem 0.375rem;
    font-size: 0.75rem;
  }
}
</style>
