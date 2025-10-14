<template>
  <div class="sort-container">
    <div class="sort-controls">
      <div class="sort-field">
        <label for="sortField" class="sort-label">
          <ArrowUpDown :size="16" />
          <span>Сортировать по:</span>
        </label>
        <select
          id="sortField"
          class="form-select sort-select"
          :value="currentSort.field"
          @change="onFieldChange"
        >
          <option value="protocol_number">Номер протокола</option>
          <option value="force_data.pct_static">Pст (сила)</option>
          <option value="force_data.energy_j">Энергия удара</option>
          <option value="force_data.velocity_ms">Скорость удара</option>
          <option value="force_data.force_n">Сила удара</option>
          <option value="plan_data.l1_l2_ratio">L1/L2</option>
          <option value="plan_data.l1_m">L1 (м)</option>
          <option value="plan_data.m1_kg">m1 (кг)</option>
        </select>
      </div>
      
      <div class="sort-direction">
        <label for="sortDirection" class="sort-label">
          <span>Направление:</span>
        </label>
        <div class="sort-direction-buttons">
          <button
            class="btn btn-outline-secondary sort-btn"
            :class="{ active: currentSort.direction === 'asc' }"
            @click="setDirection('asc')"
            title="По возрастанию"
          >
            <ArrowUp :size="16" />
          </button>
          <button
            class="btn btn-outline-secondary sort-btn"
            :class="{ active: currentSort.direction === 'desc' }"
            @click="setDirection('desc')"
            title="По убыванию"
          >
            <ArrowDown :size="16" />
          </button>
        </div>
      </div>
      
      <div class="sort-actions">
        <button
          class="sort-reset"
          @click="resetSort"
          title="Сбросить сортировку"
        >
          <RotateCcw :size="16" />
          <span>Сбросить</span>
        </button>
      </div>
    </div>
    
    <div class="sort-info" v-if="currentSort.field !== 'protocol_number' || currentSort.direction !== 'asc'">
      <span class="sort-info-text">
        Сортировка: {{ getSortFieldName() }} 
        <span class="sort-direction-text">
          ({{ currentSort.direction === 'asc' ? 'по возрастанию' : 'по убыванию' }})
        </span>
      </span>
    </div>
  </div>
</template>

<script>
import { ArrowUpDown, ArrowUp, ArrowDown, RotateCcw } from 'lucide-vue-next'

export default {
  name: 'SortComponent',
  components: {
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    RotateCcw
  },
  props: {
    currentSort: {
      type: Object,
      required: true,
      default: () => ({
        field: 'protocol_number',
        direction: 'asc'
      })
    }
  },
  methods: {
    onFieldChange(event) {
      const newField = event.target.value
      this.$emit('sort-change', {
        field: newField,
        direction: this.currentSort.direction
      })
    },
    
    setDirection(direction) {
      this.$emit('sort-change', {
        field: this.currentSort.field,
        direction: direction
      })
    },
    
    resetSort() {
      this.$emit('sort-change', {
        field: 'protocol_number',
        direction: 'asc'
      })
    },
    
    getSortFieldName() {
      const fieldNames = {
        'protocol_number': 'Номер протокола',
        'force_data.pct_static': 'Pст (сила)',
        'force_data.energy_j': 'Энергия удара',
        'force_data.velocity_ms': 'Скорость удара',
        'force_data.force_n': 'Сила удара',
        'plan_data.l1_l2_ratio': 'L1/L2',
        'plan_data.l1_m': 'L1 (м)',
        'plan_data.m1_kg': 'm1 (кг)'
      }
      return fieldNames[this.currentSort.field] || this.currentSort.field
    }
  }
}
</script>

<style scoped lang="scss">
.sort-container {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--bs-border-color);
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.sort-field {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 200px;
  
  .sort-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--bs-heading-color);
    white-space: nowrap;
    margin: 0;
  }
  
  .sort-select {
    min-width: 180px;
    border-radius: 6px;
    border: 1px solid var(--bs-border-color);
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
    
    &:focus {
      border-color: var(--bs-primary);
      box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
    }
  }
}

.sort-direction {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  .sort-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--bs-heading-color);
    white-space: nowrap;
    margin: 0;
  }
  
  .sort-direction-buttons {
    display: flex;
    gap: 0.25rem;
    
    .sort-btn {
      width: 36px;
      height: 36px;
      padding: 0;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      background: white;
      border: 2px solid #e9ecef;
      color: #6c757d;
      
      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        border-color: #adb5bd;
        color: #495057;
        background: #f8f9fa;
      }
      
      &.active {
        background: linear-gradient(135deg, #007bff, #0056b3);
        border-color: #007bff;
        color: white;
        box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
        
        &:hover {
          background: linear-gradient(135deg, #0056b3, #004085);
          border-color: #0056b3;
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.4);
          transform: translateY(-2px);
        }
      }
    }
  }
}

.sort-actions {
  margin-left: auto;
  
  .sort-reset {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    border-radius: 8px;
    padding: 0.75rem 1.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    transition: all 0.2s ease;
    background: linear-gradient(135deg, #dc3545, #c82333);
    border: none;
    color: white;
    box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
    
    &:hover {
      background: linear-gradient(135deg, #c82333, #bd2130);
      box-shadow: 0 6px 20px rgba(220, 53, 69, 0.4);
      transform: translateY(-2px);
      color: white;
    }
    
    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 10px rgba(220, 53, 69, 0.3);
    }
    
    &:focus {
      background: linear-gradient(135deg, #c82333, #bd2130);
      color: white;
      box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
    }
  }
}

.sort-info {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--bs-border-color);
  
  .sort-info-text {
    font-size: 0.875rem;
    color: var(--bs-secondary-color);
    
    .sort-direction-text {
      font-weight: 600;
      color: var(--bs-primary);
    }
  }
}

// Адаптивность
@media (max-width: 768px) {
  .sort-container {
    padding: 1rem;
  }
  
  .sort-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .sort-field {
    min-width: auto;
    
    .sort-select {
      min-width: auto;
      width: 100%;
    }
  }
  
  .sort-direction {
    justify-content: space-between;
  }
  
  .sort-actions {
    margin-left: 0;
    
    .sort-reset {
      width: 100%;
      justify-content: center;
    }
  }
}

@media (max-width: 576px) {
  .sort-controls {
    gap: 0.75rem;
  }
  
  .sort-field,
  .sort-direction {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
  
  .sort-direction-buttons {
    justify-content: center;
  }
}
</style>
