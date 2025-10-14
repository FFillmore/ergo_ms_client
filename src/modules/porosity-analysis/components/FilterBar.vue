<template>
  <div class="filters-card mb-4">
    <div class="card-body">
      <div class="filters-container">
        <!-- Поиск -->
        <div class="filter-group search-group">
          <label class="form-label">
            <Search :size="16" />
            <span>Поиск</span>
          </label>
          <input 
            v-model.trim="localSearch" 
            type="text" 
            class="form-control" 
            placeholder="Название или описание анализа..."
            @input="onSearchChange"
          />
        </div>
        
        <!-- Статус -->
        <div class="filter-group">
          <label class="form-label">Статус</label>
          <select 
            v-model="localStatus" 
            class="form-select" 
            @change="onStatusChange"
          >
            <option value="all">Все</option>
            <option value="pending">Ожидает</option>
            <option value="processing">Обрабатывается</option>
            <option value="completed">Завершен</option>
            <option value="failed">Ошибка</option>
          </select>
        </div>
        
        <!-- Группа -->
        <div class="filter-group">
          <label class="form-label">Группа</label>
          <select 
            v-model="localGroupId" 
            class="form-select" 
            @change="onGroupChange"
          >
            <option :value="null">Все группы</option>
            <option :value="0">Без группы</option>
            <option v-for="group in groups" :key="group.id" :value="group.id">
              {{ group.name }}
            </option>
          </select>
        </div>
        
        <!-- Сортировка -->
        <div class="filter-group">
          <label class="form-label">Сортировка</label>
          <select 
            v-model="localOrdering" 
            class="form-select"
            @change="onOrderingChange"
          >
            <option value="-created_at">По дате создания ↓</option>
            <option value="created_at">По дате создания ↑</option>
            <option value="-start_time">По дате запуска ↓</option>
            <option value="start_time">По дате запуска ↑</option>
            <option value="name">По названию ↑</option>
            <option value="-name">По названию ↓</option>
            <option value="group">По группе ↑</option>
            <option value="-group">По группе ↓</option>
            <option value="status">По статусу ↑</option>
            <option value="-status">По статусу ↓</option>
          </select>
        </div>
        
        <!-- Размер страницы -->
        <div class="filter-group">
          <label class="form-label">На странице</label>
          <select 
            v-model.number="localPageSize" 
            class="form-select" 
            @change="onPageSizeChange"
          >
            <option :value="5">5</option>
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
          </select>
        </div>
        
        <!-- Кнопка сброса -->
        <div class="filter-group reset-group">
          <button 
            class="btn btn-reset-filters" 
            :disabled="resetting"
            @click="resetFilters" 
            title="Сбросить фильтры и обновить список"
          >
            <RotateCcw v-if="!resetting" :size="16" />
            <div v-else class="spinner-border spinner-border-sm" role="status">
              <span class="visually-hidden">Загрузка...</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { Search, RotateCcw } from 'lucide-vue-next'
import { debounce } from '../js/utils.js'

export default {
  name: 'FilterBar',
  components: {
    Search,
    RotateCcw
  },
  props: {
    search: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      default: 'all'
    },
    groupId: {
      type: Number,
      default: null
    },
    ordering: {
      type: String,
      default: '-created_at'
    },
    pageSize: {
      type: Number,
      default: 10
    },
    groups: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:search', 'update:status', 'update:groupId', 'update:ordering', 'update:pageSize', 'reset'],
  setup(props, { emit }) {
    const localSearch = ref(props.search)
    const localStatus = ref(props.status)
    const localGroupId = ref(props.groupId)
    const localOrdering = ref(props.ordering)
    const localPageSize = ref(props.pageSize)
    const resetting = ref(false)

    const onSearchChange = () => {
      emit('update:search', localSearch.value)
    }

    const onStatusChange = () => {
      emit('update:status', localStatus.value)
    }

    const onGroupChange = () => {
      // Преобразуем строку в число, если это возможно
      const groupId = localGroupId.value === '' || localGroupId.value === null ? null : Number(localGroupId.value)
      emit('update:groupId', groupId)
    }

    const onOrderingChange = () => {
      emit('update:ordering', localOrdering.value)
    }

    const onPageSizeChange = () => {
      emit('update:pageSize', localPageSize.value)
    }

    const resetFilters = async () => {
      resetting.value = true
      try {
        localSearch.value = ''
        localStatus.value = 'all'
        localGroupId.value = null
        localOrdering.value = '-created_at'
        localPageSize.value = 10
        emit('reset')
        // Ждем немного чтобы пользователь увидел индикатор загрузки
        await new Promise(resolve => setTimeout(resolve, 500))
      } finally {
        resetting.value = false
      }
    }

    const debouncedSearch = ref(null)

    onMounted(() => {
      debouncedSearch.value = debounce(onSearchChange, 300)
    })

    // Watch for prop changes
    watch(() => props.search, (newVal) => {
      localSearch.value = newVal
    })

    watch(() => props.status, (newVal) => {
      localStatus.value = newVal
    })

    watch(() => props.groupId, (newVal) => {
      localGroupId.value = newVal
    })

    watch(() => props.ordering, (newVal) => {
      localOrdering.value = newVal
    })

    watch(() => props.pageSize, (newVal) => {
      localPageSize.value = newVal
    })

    return {
      localSearch,
      localStatus,
      localGroupId,
      localOrdering,
      localPageSize,
      resetting,
      onSearchChange,
      onStatusChange,
      onGroupChange,
      onOrderingChange,
      onPageSizeChange,
      resetFilters,
      debouncedSearch
    }
  }
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.filters-card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  border: none;
  margin-bottom: 1.5rem;
}

.card-body {
  padding: 1.5rem;
}

.filters-container {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  flex-wrap: wrap;
  width: 100%;
}

.filter-group {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex-shrink: 0;
  flex: 1;
  min-width: 150px;
}

.search-group {
  flex: 2;
  min-width: 250px;
  max-width: none;
}

.reset-group {
  align-self: flex-end;
  flex: 0 0 auto;
  min-width: auto;
}

.form-label {
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  font-size: 0.9rem;
}

.form-control,
.form-select {
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  height: 38px;
  width: 100%;
  background: white;
  box-sizing: border-box;
  display: flex;
  align-items: center;
}

.form-control:focus,
.form-select:focus {
  border-color: #007bff;
  box-shadow: inset 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  outline: none;
}

.btn-reset-filters {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  border: none;
  color: white;
  font-weight: 600;
  transition: all 0.3s ease;
  border-radius: 8px;
  min-height: 38px;
  height: auto;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  flex-shrink: 0;
  box-sizing: border-box;
}

.btn-reset-filters:hover {
  background: linear-gradient(135deg, #c82333 0%, #bd2130 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
}

.btn-reset-filters:active {
  transform: translateY(0);
}

.btn-reset-filters:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-reset-filters:disabled:hover {
  transform: none;
  box-shadow: none;
}

/* Адаптивность */
@media (max-width: 1200px) {
  .filters-container {
    gap: 0.75rem;
  }
  
  .search-group {
    min-width: 200px;
  }
}

@media (max-width: 992px) {
  .filters-container {
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .search-group {
    flex: 1 1 100%;
    min-width: 200px;
  }
  
  .filter-group:not(.search-group):not(.reset-group) {
    flex: 1 1 calc(50% - 0.5rem);
    min-width: 150px;
  }
  
  .reset-group {
    flex: 1 1 100%;
    min-width: auto;
  }
}

@media (max-width: 768px) {
  .filters-container {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .search-group {
    flex: none;
    width: 100%;
  }
  
  .filter-group {
    width: 100%;
    min-width: auto;
  }
  
  .reset-group {
    align-self: stretch;
  }
  
  .btn-reset-filters {
    width: 100%;
    min-height: 38px;
  }
}

@media (max-width: 576px) {
  .filters-card {
    margin-bottom: 1rem;
  }
  
  .card-body {
    padding: 1rem;
  }
  
  .form-label {
    font-size: 0.85rem;
  }
  
  .form-control,
  .form-select {
    font-size: 0.85rem;
    padding: 0.4rem 0.6rem;
    height: 36px;
  }
  
  .btn-reset-filters {
    min-height: 36px;
  }
}
</style>
