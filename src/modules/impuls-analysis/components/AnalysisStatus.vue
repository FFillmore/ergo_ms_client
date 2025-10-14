<template>
  <div class="analysis-status">
    <div 
      class="status-badge" 
      :class="statusClass"
      :title="statusTooltip"
    >
      <div class="status-icon">
        <component :is="statusIcon" size="14" />
      </div>
      <span class="status-text">{{ statusText }}</span>
    </div>
    
    <!-- Индикатор обработки для активных задач -->
    <div v-if="isProcessing" class="processing-indicator">
      <div class="processing-spinner">
        <div class="spinner-dot"></div>
        <div class="spinner-dot"></div>
        <div class="spinner-dot"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { 
  Clock, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Ban,
  AlertCircle 
} from 'lucide-vue-next'

export default {
  name: 'AnalysisStatus',
  components: {
    Clock,
    Loader2,
    CheckCircle,
    XCircle,
    Ban,
    AlertCircle
  },
  props: {
    status: {
      type: String,
      required: true,
      validator: (value) => ['pending', 'processing', 'completed', 'failed', 'cancelled'].includes(value)
    },
    taskId: {
      type: String,
      default: null
    }
  },
  computed: {
    statusText() {
      const statusMap = {
        'pending': 'Ожидает',
        'processing': 'Обрабатывается',
        'completed': 'Завершен',
        'failed': 'Ошибка',
        'cancelled': 'Отменен'
      }
      return statusMap[this.status] || 'Неизвестно'
    },
    
    statusClass() {
      const classMap = {
        'pending': 'status-pending',
        'processing': 'status-processing',
        'completed': 'status-completed',
        'failed': 'status-failed',
        'cancelled': 'status-cancelled'
      }
      return classMap[this.status] || 'status-unknown'
    },
    
    statusIcon() {
      const iconMap = {
        'pending': Clock,
        'processing': Loader2,
        'completed': CheckCircle,
        'failed': XCircle,
        'cancelled': Ban
      }
      return iconMap[this.status] || AlertCircle
    },
    
    statusTooltip() {
      const tooltipMap = {
        'pending': 'Анализ ожидает начала обработки',
        'processing': 'Анализ обрабатывается в фоновом режиме',
        'completed': 'Анализ успешно завершен',
        'failed': 'При обработке анализа произошла ошибка',
        'cancelled': 'Анализ был отменен'
      }
      return tooltipMap[this.status] || 'Неизвестный статус'
    },
    
    isProcessing() {
      return this.status === 'processing'
    }
  }
}
</script>

<style scoped lang="scss">
.analysis-status {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

// Бейдж статуса
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover::before {
    opacity: 1;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

// Иконка статуса
.status-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

// Текст статуса
.status-text {
  font-weight: 600;
  letter-spacing: 0.5px;
}

// Цвета статусов
.status-pending {
  background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(255, 193, 7, 0.3);
}

.status-processing {
  background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(23, 162, 184, 0.3);
  
  .status-icon {
    animation: pulse 2s infinite;
  }
}

.status-completed {
  background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
}

.status-failed {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
}

.status-cancelled {
  background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(108, 117, 125, 0.3);
}

.status-unknown {
  background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(108, 117, 125, 0.3);
}

// Индикатор обработки
.processing-indicator {
  display: flex;
  align-items: center;
}

.processing-spinner {
  display: flex;
  gap: 0.25rem;
  align-items: center;
}

.spinner-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--bs-primary);
  animation: bounce 1.4s ease-in-out infinite both;
  
  &:nth-child(1) {
    animation-delay: -0.32s;
  }
  
  &:nth-child(2) {
    animation-delay: -0.16s;
  }
  
  &:nth-child(3) {
    animation-delay: 0s;
  }
}

// Анимации
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

// Адаптивность
@media (max-width: 768px) {
  .analysis-status {
    gap: 0.5rem;
  }
  
  .status-badge {
    padding: 0.375rem 0.75rem;
    font-size: 0.625rem;
  }
  
  .status-icon {
    width: 16px;
    height: 16px;
  }
  
  .processing-indicator {
    display: none; // Скрываем на мобильных для экономии места
  }
}

@media (max-width: 576px) {
  .status-badge {
    padding: 0.25rem 0.5rem;
    font-size: 0.5rem;
  }
  
  .status-icon {
    width: 14px;
    height: 14px;
  }
}
</style>
