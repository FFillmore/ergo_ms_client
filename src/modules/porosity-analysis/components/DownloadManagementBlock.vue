<template>
  <div class="row g-3">
    <!-- Создание нового архива -->
    <div class="col-12">
      <div class="download-section">
        <label class="form-label d-flex align-items-center gap-2 mb-3">
          <Archive size="16" />
          <span class="fw-semibold">Создание архива отчетов</span>
        </label>
        <div class="row g-3">
          <div class="col-md-6">
            <input
              v-model.trim="archiveName"
              type="text"
              class="form-control"
              placeholder="Название архива (необязательно)"
            />
          </div>
          <div class="col-md-3">
            <select v-model="reportType" class="form-select">
              <option value="docx">Word (DOCX)</option>
              <option value="pdf">PDF</option>
            </select>
          </div>
          <div class="col-md-3">
            <button 
              class="btn btn-primary d-inline-flex align-items-center w-100" 
              :disabled="selectedIds.length === 0 || creatingArchive" 
              @click="createSelectedArchive"
            >
              <Archive class="me-1" size="14" /> 
              Создать из выбранных ({{ selectedIds.length }})
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Фильтры для выбора анализов -->
    <div class="col-12">
      <div class="download-section">
        <label class="form-label d-flex align-items-center gap-2 mb-3">
          <Filter size="16" />
          <span class="fw-semibold">Фильтры для выбора</span>
        </label>
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label">Статус анализа</label>
            <select v-model="statusFilter" class="form-select" @change="onStatusFilterChange">
              <option value="">Все статусы</option>
              <option value="completed">Завершенные</option>
              <option value="failed">С ошибками</option>
              <option value="processing">Обрабатываемые</option>
              <option value="pending">Ожидающие</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label">Группа</label>
            <select v-model="groupFilter" class="form-select" @change="onGroupFilterChange">
              <option value="">Все группы</option>
              <option value="null">Без группы</option>
              <option v-for="group in groups" :key="group.id" :value="group.id.toString()">
                {{ group.name }}
              </option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label">Действия</label>
            <div class="d-flex gap-2">
              <button 
                class="btn btn-outline-primary btn-sm d-inline-flex align-items-center" 
                :disabled="!hasFilters"
                @click="selectByFilters"
              >
                <CheckSquare class="me-1" size="14" /> 
                Выделить по фильтрам
              </button>
              <button 
                class="btn btn-outline-secondary btn-sm d-inline-flex align-items-center" 
                @click="clearFilters"
              >
                <X class="me-1" size="14" /> 
                Очистить
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Список созданных архивов -->
    <div class="col-12">
      <div class="download-section">
        <label class="form-label d-flex align-items-center gap-2 mb-3">
          <Archive size="16" />
          <span class="fw-semibold">Созданные архивы ({{ archives?.length || 0 }})</span>
        </label>
        
        <!-- Загрузка -->
        <div v-if="loadingArchives" class="text-center py-4">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Загрузка...</span>
          </div>
        </div>
        
        <!-- Пустое состояние -->
        <div v-else-if="!archives || archives.length === 0" class="text-center py-4">
          <Archive class="text-muted mb-3" size="48" />
          <h5 class="text-muted">Архивы не найдены</h5>
          <p class="text-muted">Создайте первый архив отчетов, выбрав анализы выше</p>
        </div>
        
        <!-- Список архивов -->
        <div v-else class="archives-list">
          <div class="row g-3">
            <div 
              v-for="archive in archives" 
              :key="archive.id" 
              class="col-md-6 col-lg-4"
            >
              <div class="archive-item">
                <div class="d-flex align-items-start gap-3">
                  <div class="status-indicator" :class="`status-${archive.status}`"></div>
                  <div class="archive-info flex-grow-1">
                    <div class="archive-name">{{ archive.name }}</div>
                    <div class="archive-meta">
                      <div class="archive-details">
                        <span class="archive-type">{{ archive.report_type.toUpperCase() }}</span>
                        <span class="archive-count">{{ archive.analyses_count }} анализов</span>
                        <span class="archive-size">{{ archive.file_size_mb }} МБ</span>
                      </div>
                      <div class="archive-date">{{ formatDate(archive.created_at) }}</div>
                    </div>
                    <div v-if="archive.description" class="archive-description">
                      {{ archive.description }}
                    </div>
                    <div v-if="archive.status === 'failed' && archive.error_message" class="archive-error">
                      <AlertTriangle class="me-1" size="12" />
                      {{ truncateError(archive.error_message) }}
                    </div>
                  </div>
                  <div class="archive-actions">
                    <button 
                      v-if="archive.status === 'completed'"
                      class="btn btn-sm btn-outline-primary" 
                      @click="downloadArchive(archive)"
                      :disabled="downloadingArchive === archive.id"
                    >
                      <Download size="12" />
                    </button>
                    <button 
                      class="btn btn-sm btn-outline-danger" 
                      @click="deleteArchive(archive)"
                      :disabled="deletingArchive === archive.id"
                    >
                      <Trash2 size="12" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Download, Filter, CheckSquare, X, Trash2, Archive, AlertTriangle } from 'lucide-vue-next'

export default {
  name: 'DownloadManagementBlock',
  components: {
    Download,
    Filter,
    CheckSquare,
    X,
    Trash2,
    Archive,
    AlertTriangle
  },
  props: {
    selectedIds: {
      type: Array,
      default: () => []
    },
    selectedAnalyses: {
      type: Array,
      default: () => []
    },
    groups: {
      type: Array,
      default: () => []
    },
    archives: {
      type: Array,
      default: () => []
    },
    loadingArchives: {
      type: Boolean,
      default: false
    },
    creatingArchive: {
      type: Boolean,
      default: false
    },
    downloadingArchive: {
      type: [Boolean, Number],
      default: false
    },
    deletingArchive: {
      type: [Boolean, Number],
      default: false
    }
  },
  data() {
    return {
      archiveName: '',
      reportType: 'docx',
      statusFilter: '',
      groupFilter: ''
    }
  },
  computed: {
    hasFilters() {
      return this.statusFilter || this.groupFilter
    }
  },
  methods: {
    createSelectedArchive() {
      this.$emit('create-archive', {
        selectedIds: this.selectedIds,
        name: this.archiveName,
        reportType: this.reportType,
        type: 'selected'
      })
    },
    downloadArchive(archive) {
      this.$emit('download-archive', archive)
    },
    deleteArchive(archive) {
      this.$emit('delete-archive', archive)
    },
    onStatusFilterChange() {
      this.$emit('status-filter-change', this.statusFilter)
    },
    onGroupFilterChange() {
      // Преобразуем строку в число, если это возможно
      const groupId = this.groupFilter === '' || this.groupFilter === 'null' ? null : Number(this.groupFilter)
      this.$emit('group-filter-change', groupId)
    },
    selectByFilters() {
      // Преобразуем groupFilter в правильный тип
      const group = this.groupFilter === '' || this.groupFilter === 'null' ? null : Number(this.groupFilter)
      this.$emit('select-by-filters', {
        status: this.statusFilter,
        group: group
      })
    },
    clearFilters() {
      this.statusFilter = ''
      this.groupFilter = ''
      this.$emit('clear-filters')
    },
    removeFromSelection(analysisId) {
      this.$emit('remove-from-selection', analysisId)
    },
    clearSelection() {
      this.$emit('clear-selection')
    },
    getStatusText(status) {
      const statusMap = {
        'pending': 'Ожидает',
        'processing': 'Обрабатывается',
        'completed': 'Завершен',
        'failed': 'Ошибка',
        'creating': 'Создается'
      }
      return statusMap[status] || status
    },
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    truncateError(errorMessage) {
      if (!errorMessage) return ''
      const maxLength = 100
      if (errorMessage.length <= maxLength) return errorMessage
      return errorMessage.substring(0, maxLength) + '...'
    }
  }
}
</script>

<style scoped>
.download-section {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  border: 1px solid #e9ecef;
}

.download-section .form-label {
  color: #495057;
  font-weight: 600;
}

.download-section .input-group-text {
  background-color: #f8f9fa;
  border-color: #dee2e6;
  color: #6c757d;
}

.download-section .form-control {
  border-left: 0;
  border-right: 0;
}

.download-section .form-control:focus {
  border-color: #007bff;
  box-shadow: none;
}

.download-section .form-select {
  border-radius: 6px;
}

.download-section .form-select:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.download-section .btn {
  border-radius: 6px;
  font-size: 0.875rem;
  padding: 0.375rem 0.75rem;
}

.download-section .form-text {
  font-size: 0.8rem;
  color: #6c757d;
}

.selected-analyses-list {
  max-height: 300px;
  overflow-y: auto;
}

.archive-item {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.2s ease;
}

.archive-item:hover {
  border-color: #007bff;
  box-shadow: 0 2px 4px rgba(0, 123, 255, 0.1);
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-pending {
  background-color: #ffc107;
}

.status-processing {
  background-color: #17a2b8;
}

.status-completed {
  background-color: #28a745;
}

.status-failed {
  background-color: #dc3545;
}

.status-creating {
  background-color: #17a2b8;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.analysis-info {
  flex-grow: 1;
  min-width: 0;
}

.analysis-name {
  font-weight: 500;
  font-size: 0.875rem;
  color: #495057;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.analysis-meta {
  font-size: 0.75rem;
  color: #6c757d;
  display: flex;
  gap: 0.5rem;
}

.analysis-id {
  font-weight: 500;
}

.archive-info {
  flex-grow: 1;
  min-width: 0;
}

.archive-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: #495057;
  margin-bottom: 0.5rem;
}

.archive-meta {
  font-size: 0.8rem;
  color: #6c757d;
  margin-bottom: 0.5rem;
}

.archive-details {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.25rem;
}

.archive-type {
  background-color: #e9ecef;
  color: #495057;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 500;
}

.archive-count {
  color: #6c757d;
}

.archive-size {
  color: #6c757d;
  font-weight: 500;
}

.archive-date {
  font-size: 0.75rem;
  color: #adb5bd;
}

.archive-description {
  font-size: 0.8rem;
  color: #6c757d;
  margin-bottom: 0.5rem;
  font-style: italic;
}

.archive-error {
  font-size: 0.75rem;
  color: #dc3545;
  background-color: #f8d7da;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
}

.archive-actions {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

@media (max-width: 768px) {
  .download-section {
    padding: 1rem;
  }
  
  .download-section .row .col-md-4 .btn {
    margin-top: 0.5rem;
  }
  
  .selected-analyses-list .row .col-md-6 {
    margin-bottom: 0.5rem;
  }
}
</style>
