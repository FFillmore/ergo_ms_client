<template>
  <div class="action-section">
    <button 
      type="submit" 
      class="btn-create" 
      :disabled="disabled || isCreating"
      :class="{ 'btn-create--loading': isCreating }"
    >
      <Plus :size="18" />
      <span>
        {{ isCreating 
          ? 'Создание анализов...'
          : (fileCount === 1 ? 'Создать анализ' : `Создать ${fileCount} анализов`) }}
      </span>
    </button>

    <!-- Прогресс-бар -->
    <div v-if="isCreating" class="progress-section">
      <div class="progress-header">
        <span class="progress-label">Создание анализов</span>
        <span class="progress-counter">{{ progress.processed }} / {{ progress.total }}</span>
      </div>
      <div class="progress-bar-container">
        <div class="progress-bar" :style="`width: ${progressPercent}%`"></div>
      </div>
      <div class="progress-stats">
        <span class="stat-success">Успешно: {{ progress.success }}</span>
        <span class="stat-failed">Ошибки: {{ progress.failed }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { Plus } from 'lucide-vue-next'

export default {
  name: 'CreateButton',
  components: {
    Plus
  },
  props: {
    fileCount: {
      type: Number,
      default: 0
    },
    isCreating: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    progress: {
      type: Object,
      default: () => ({
        total: 0,
        processed: 0,
        success: 0,
        failed: 0
      })
    }
  },
  computed: {
    progressPercent() {
      if (!this.progress.total) return 0
      return Math.round((this.progress.processed / this.progress.total) * 100)
    }
  }
}
</script>

<style scoped>
.action-section {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.btn-create {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  border: none;
  color: white;
  padding: 1rem 2rem;
  border-radius: 14px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 56px;
}

.btn-create:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(72, 187, 120, 0.3);
}

.btn-create:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-create--loading {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Прогресс */
.progress-section {
  background: #f7fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.25rem;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.progress-label {
  font-weight: 600;
  color: #2d3748;
  font-size: 0.9rem;
}

.progress-counter {
  font-size: 0.85rem;
  color: #718096;
  font-weight: 500;
}

.progress-bar-container {
  background: #e2e8f0;
  border-radius: 8px;
  height: 8px;
  overflow: hidden;
  margin-bottom: 0.75rem;
}

.progress-section .progress-bar {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  height: 100%;
  border-radius: 8px;
  transition: width 0.3s ease;
}

.progress-stats {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  font-weight: 500;
}

.stat-success {
  color: #38a169;
}

.stat-failed {
  color: #e53e3e;
}

@media (max-width: 576px) {
  .btn-create {
    padding: 0.875rem 1.5rem;
    font-size: 0.95rem;
  }
}
</style>
