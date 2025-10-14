<template>
  <div class="analysis-card" :class="cardClass" @click="toggleSelection">
    <div class="card-header">
      <div class="analysis-info">
        <div class="analysis-title">
          <h6 class="mb-1">{{ analysis.name || `Анализ #${analysis.id}` }}</h6>
          <p v-if="analysis.description" class="analysis-description mb-0">{{ analysis.description }}</p>
        </div>
        <div class="analysis-meta">
          <span class="analysis-id">#{{ analysis.id }}</span>
          <StatusBadge :status="analysis.status" size="sm" />
          <span v-if="analysis.group" class="group-badge">
            <Users :size="12" class="me-1" />
            {{ analysis.group.name }}
          </span>
        </div>
      </div>
    </div>
    
    <div class="card-body">
      <div class="analysis-details">
        <div class="detail-row">
          <span class="detail-label">
            <Calendar :size="14" class="me-1" />
            Создан:
          </span>
          <span class="detail-value">{{ formatDate(analysis.created_at) }}</span>
        </div>
        <div v-if="analysis.start_time" class="detail-row">
          <span class="detail-label">
            <Play :size="14" class="me-1" />
            Запущен:
          </span>
          <span class="detail-value">{{ formatDate(analysis.start_time) }}</span>
        </div>
        <div v-if="analysis.completed_at" class="detail-row">
          <span class="detail-label">
            <CheckCircle :size="14" class="me-1" />
            Завершен:
          </span>
          <span class="detail-value">{{ formatDate(analysis.completed_at) }}</span>
        </div>
        <div v-if="analysis.scale_value" class="detail-row">
          <span class="detail-label">
            <Ruler :size="14" class="me-1" />
            Масштаб:
          </span>
          <span class="detail-value">{{ analysis.scale_value }} мкм</span>
        </div>
        <div v-if="analysis.pixels_per_micron" class="detail-row">
          <span class="detail-label">
            <Monitor :size="14" class="me-1" />
            Разрешение:
          </span>
          <span class="detail-value">{{ analysis.pixels_per_micron }} пикс/мкм</span>
        </div>
        <div v-if="analysis.duration_seconds" class="detail-row">
          <span class="detail-label">
            <Clock :size="14" class="me-1" />
            Длительность:
          </span>
          <span class="detail-value">{{ formatDuration(analysis.duration_seconds) }}</span>
        </div>
      </div>
    </div>
    
    <div class="card-footer">
      <div class="d-flex justify-content-between align-items-center">
        <div class="analysis-status-info">
          <span v-if="analysis.status === 'processing'" class="processing-info">
            <Loader2 :size="14" class="me-1" />
            Обрабатывается...
          </span>
          <span v-else-if="analysis.status === 'failed'" class="error-info">
            <AlertTriangle :size="14" class="me-1" />
            Ошибка обработки
          </span>
          <span v-else-if="analysis.status === 'completed'" class="success-info">
            <CheckCircle :size="14" class="me-1" />
            Готов к скачиванию
          </span>
          <span v-else class="pending-info">
            <Clock :size="14" class="me-1" />
            Ожидает обработки
          </span>
        </div>
        
        <div class="analysis-buttons" @click.stop>
          <ReportDropdown
            v-if="analysis.status === 'completed'"
            :analysis-id="analysis.id"
            :downloading="downloading"
            @download-pdf="$emit('download-pdf', $event)"
            @download-word="$emit('download-word', $event)"
            @download-original="$emit('download-original', $event)"
          />
          
          <button 
            v-if="analysis.status === 'failed'"
            class="btn btn-sm btn-warning me-2"
            @click.stop="$emit('restart-analysis', analysis.id)"
            title="Перезапустить анализ"
          >
            <RefreshCw :size="14" class="me-1" />
            Перезапустить
          </button>
          
          <button 
            class="btn btn-sm btn-outline-danger"
            @click.stop="$emit('delete-analysis', analysis.id)"
            title="Удалить анализ"
          >
            <Trash2 :size="14" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { 
  Users, Loader2, AlertTriangle, CheckCircle, Clock, 
  Download, RefreshCw, Trash2, Calendar, Play, Ruler, Monitor
} from 'lucide-vue-next'
import StatusBadge from './StatusBadge.vue'
import ReportDropdown from './ReportDropdown.vue'
import { formatDate } from '../js/utils.js'

export default {
  name: 'AnalysisCard',
  components: {
    Users,
    Loader2,
    AlertTriangle,
    CheckCircle,
    Clock,
    Download,
    RefreshCw,
    Trash2,
    Calendar,
    Play,
    Ruler,
    Monitor,
    StatusBadge,
    ReportDropdown
  },
  props: {
    analysis: {
      type: Object,
      required: true
    },
    isSelected: {
      type: Boolean,
      default: false
    },
    downloading: {
      type: Boolean,
      default: false
    }
  },
  emits: [
    'toggle-selection', 
    'download-report', 
    'download-pdf',
    'download-word',
    'download-original',
    'restart-analysis', 
    'delete-analysis'
  ],
  computed: {
    cardClass() {
      const classes = ['analysis-card']
      if (this.isSelected) classes.push('selected')
      if (this.analysis.status === 'completed') classes.push('completed')
      if (this.analysis.status === 'failed') classes.push('failed')
      return classes.join(' ')
    }
  },
  methods: {
    formatDate,
    formatDuration(seconds) {
      if (!seconds) return 'Неизвестно'
      
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const secs = seconds % 60
      
      if (hours > 0) {
        return `${hours}ч ${minutes}м ${secs}с`
      } else if (minutes > 0) {
        return `${minutes}м ${secs}с`
      } else {
        return `${secs}с`
      }
    },
    toggleSelection() {
      this.$emit('toggle-selection', this.analysis.id)
    }
  }
}
</script>

<style scoped>
.analysis-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.08);
  border: 2px solid transparent;
  transition: all 0.3s ease;
  margin-bottom: 0.75rem;
  cursor: pointer;
  position: relative;
  z-index: 1;
}

.analysis-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.analysis-card.selected {
  border-color: #007bff;
  box-shadow: 0 8px 32px rgba(0, 123, 255, 0.2);
  background-color: #f8f9ff;
}

.analysis-card.completed {
  border-left: 4px solid #28a745;
}

.analysis-card.failed {
  border-left: 4px solid #dc3545;
}

.card-header {
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  border-radius: 12px 12px 0 0;
  padding: 0.75rem 1rem;
}

.analysis-title h6 {
  font-weight: 600;
  color: #2d3748;
  margin: 0;
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}

.analysis-description {
  font-size: 0.9rem;
  color: #718096;
  line-height: 1.4;
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}

.analysis-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
  min-height: 1.5rem;
}

.analysis-meta > * {
  display: flex;
  align-items: center;
}

.analysis-meta svg {
  flex-shrink: 0;
  vertical-align: middle;
  transform: translateY(-0.5px);
}

.analysis-id {
  font-weight: 600;
  color: #6c757d;
  font-size: 0.85rem;
}

.group-badge {
  display: inline-flex;
  align-items: center;
  background: #e3f2fd;
  color: #1976d2;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.group-badge svg {
  flex-shrink: 0;
  vertical-align: middle;
  transform: translateY(-0.5px);
}


.card-body {
  padding: 1rem;
}


.analysis-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-row {
  display: flex;
  align-items: center;
  padding: 0.25rem 0;
  gap: 0.5rem;
  min-height: 1.5rem;
}

.detail-label {
  font-weight: 500;
  color: #6c757d;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  min-width: fit-content;
}

.detail-label svg {
  flex-shrink: 0;
  vertical-align: middle;
  transform: translateY(-0.5px);
}

.detail-value {
  color: #2d3748;
  font-size: 0.85rem;
  font-weight: 600;
}

.card-footer {
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  border-radius: 0 0 12px 12px;
  padding: 0.75rem 1rem;
}

.analysis-status-info {
  display: flex;
  align-items: center;
  font-size: 0.85rem;
  font-weight: 500;
  min-height: 1.5rem;
}

.analysis-status-info svg {
  flex-shrink: 0;
  vertical-align: middle;
  transform: translateY(-0.5px);
}

.processing-info {
  color: #17a2b8;
}

.error-info {
  color: #dc3545;
}

.success-info {
  color: #28a745;
}

.pending-info {
  color: #ffc107;
}

.analysis-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
}

.btn {
  border-radius: 6px;
  font-size: 0.8rem;
  padding: 0.375rem 0.75rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  min-height: 2rem;
}

.btn svg {
  flex-shrink: 0;
  vertical-align: middle;
  transform: translateY(-0.5px);
}

@media (max-width: 768px) {
  .analysis-card .row {
    flex-direction: column;
  }
  
  .analysis-image {
    height: 120px;
  }
  
  .analysis-buttons {
    flex-direction: column;
    width: 100%;
  }
  
  .analysis-buttons .btn {
    width: 100%;
    margin-bottom: 0.5rem;
  }
}
</style>
