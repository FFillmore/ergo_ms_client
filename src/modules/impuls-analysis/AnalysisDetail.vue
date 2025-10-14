<template>
  <div class="analysis-detail-page" v-if="analysis">
    <!-- Заголовок страницы -->
    <div class="page-header">
      <div class="header-content">
        <nav aria-label="breadcrumb" class="breadcrumb-nav">
          <ol class="breadcrumb">
            <li class="breadcrumb-item">
              <router-link to="/impuls-analysis/analyses" class="breadcrumb-link">
                <Zap :size="16" />
                <span>Анализ импульсов</span>
              </router-link>
            </li>
            <li class="breadcrumb-item active">
              {{ analysis.title || 'Детали анализа' }}
            </li>
          </ol>
        </nav>
        
        <div class="analysis-title-section">
          <div class="analysis-icon" :class="getAnalysisIconClass(analysis.status)">
            <component :is="getStatusIcon(analysis.status)" :size="24" color="white" />
          </div>
          <div class="analysis-title">
            <h1>{{ analysis.title || 'Анализ импульсов' }}</h1>
            <div class="analysis-meta-badges">
              <span class="badge status-badge" :class="statusClass(analysis.status)">
                {{ getStatusLabel(analysis.status) }}
              </span>
            </div>
            <p class="analysis-description" v-if="analysis.description">
              {{ analysis.description }}
            </p>
          </div>
        </div>
      </div>
      
      <div class="header-actions">
        <button 
          class="btn btn-refresh"
          @click="refreshAnalysis"
          :disabled="isLoading"
        >
          <RefreshCw :size="16" :class="{ 'spinning': isLoading }" />
          <span>Обновить</span>
        </button>
        <button 
          v-if="analysis.status === 'failed'"
          class="btn btn-outline-warning"
          @click="restartAnalysis"
          :disabled="isRestarting"
        >
          <RefreshCw :size="16" />
          <span>{{ isRestarting ? 'Перезапуск...' : 'Перезапустить' }}</span>
        </button>
        <button 
          class="btn btn-delete-analysis"
          @click="showDeleteConfirm"
          :disabled="isDeleting"
        >
          <Trash2 :size="16" />
          <span>{{ isDeleting ? 'Удаление...' : 'Удалить' }}</span>
        </button>
      </div>
    </div>
          
    <!-- Основной контент -->
    <div class="analysis-content">
      <div class="info-section">
        <div class="row g-3 g-lg-4 align-items-stretch">
          <div class="col-12">
            <div class="info-card combined-info">
              <div class="card-header">
                <Info :size="20" />
                <h3>Информация об анализе</h3>
              </div>
              <div class="card-body">
                <div class="meta-grid mb-3">
                  <div class="meta-item" v-if="analysis.number || analysis.id">
                    <div class="meta-icon">
                      <Hash :size="16" />
                    </div>
                    <div class="meta-content">
                      <span class="meta-label">Номер анализа</span>
                      <span class="meta-value">№{{ analysis.number || analysis.id }}</span>
                    </div>
                  </div>
                  <div class="meta-item">
                    <div class="meta-icon">
                      <Calendar :size="16" />
                    </div>
                    <div class="meta-content">
                      <span class="meta-label">Создан</span>
                      <span class="meta-value">{{ formatDateTime(analysis.created_at) }}</span>
                    </div>
                  </div>
                  <div class="meta-item" v-if="analysis.started_at">
                    <div class="meta-icon">
                      <Play :size="16" />
                    </div>
                    <div class="meta-content">
                      <span class="meta-label">Начало обработки</span>
                      <span class="meta-value">{{ formatDateTime(analysis.started_at) }}</span>
                    </div>
                  </div>
                  <div class="meta-item" v-if="analysis.completed_at">
                    <div class="meta-icon">
                      <CheckCircle :size="16" />
                    </div>
                    <div class="meta-content">
                      <span class="meta-label">Завершен</span>
                      <span class="meta-value">{{ formatDateTime(analysis.completed_at) }}</span>
                    </div>
                  </div>
                  <div class="meta-item" v-if="analysis.protocol_number">
                    <div class="meta-icon">
                      <FileText :size="16" />
                    </div>
                    <div class="meta-content">
                      <span class="meta-label">Номер протокола</span>
                      <span class="meta-value">{{ analysis.protocol_number }}</span>
                    </div>
                  </div>
                  <div class="meta-item" v-if="analysis.p_static">
                    <div class="meta-icon">
                      <Zap :size="16" />
                    </div>
                    <div class="meta-content">
                      <span class="meta-label">Pст</span>
                      <span class="meta-value">{{ analysis.p_static }}%</span>
                    </div>
                  </div>
                  <div class="meta-item" v-if="analysis.energy_j">
                    <div class="meta-icon">
                      <Activity :size="16" />
                    </div>
                    <div class="meta-content">
                      <span class="meta-label">Энергия удара</span>
                      <span class="meta-value">{{ analysis.energy_j }} Дж</span>
                    </div>
                  </div>
                </div>

                <div v-if="analysis.status === 'completed'" class="downloads-card">
                  <div class="download-actions">
                    <button @click="downloadResults" class="download-btn download-results">
                      <div class="download-icon"><Download :size="20" /></div>
                      <div class="download-info">
                        <span class="download-title">Результаты анализа</span>
                        <span class="download-subtitle">Все файлы результатов</span>
                      </div>
                    </button>
                    <button v-if="analysis.protocols && analysis.protocols.length > 0" @click="downloadAllProtocols" class="download-btn download-protocols">
                      <div class="download-icon"><FileText :size="20" /></div>
                      <div class="download-info">
                        <span class="download-title">Протоколы</span>
                        <span class="download-subtitle">Сгенерированные протоколы</span>
                      </div>
                    </button>
                  </div>
                </div>

                <div class="error-card mt-3" v-if="analysis.error_message">
                  <div class="error-message">
                    <pre>{{ analysis.error_message }}</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Состояние загрузки -->
  <div v-else-if="isLoading" class="loading-state">
    <div class="d-flex flex-column align-items-center justify-content-center py-5">
      <div class="spinner-border text-primary mb-3" role="status">
        <span class="visually-hidden">Загрузка...</span>
      </div>
      <p class="text-muted">Загружаем анализ...</p>
    </div>
  </div>

  <!-- Состояние ошибки -->
  <div v-else class="error-state">
    <div class="text-center py-5">
      <FileX :size="64" class="error-icon mb-4" />
      <h3 class="text-muted mb-3">Анализ не найден</h3>
      <p class="text-muted mb-4">Возможно, анализ был удален или у вас нет доступа к нему</p>
      <router-link to="/impuls-analysis/analyses" class="btn btn-primary">
        <ArrowLeft :size="16" />
        <span>Вернуться к списку</span>
      </router-link>
    </div>
  </div>

  <!-- Модальное окно подтверждения удаления -->
  <ConfirmDialog
    ref="deleteDialog"
    :show="showDeleteModal"
    title="Удаление анализа"
    message="Вы уверены, что хотите удалить этот анализ? Это действие нельзя отменить."
    confirm-text="Удалить"
    cancel-text="Отмена"
    variant="danger"
    @confirm="deleteAnalysisConfirmed"
    @cancel="cancelDeleteAnalysis"
    @close="cancelDeleteAnalysis"
  />
</template>

<script>
import { impulsAnalysisAPI } from './js/impuls-analysis.js'
import AnalysisStatus from './components/AnalysisStatus.vue'
import { useToast } from 'vue-toastification'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { 
  RefreshCw, Trash2, FileX, Loader2, Download, FileText, 
  File, FileCheck, CheckCircle, Zap, Info, Calendar, 
  Play, Activity, ArrowLeft, Hourglass, AlertTriangle, Hash
} from 'lucide-vue-next'

const toast = useToast()

export default {
  components: {
    AnalysisStatus,
    ConfirmDialog,
    RefreshCw,
    Trash2,
    FileX,
    Loader2,
    Download,
    FileText,
    File,
    FileCheck,
    CheckCircle,
    Zap,
    Info,
    Calendar,
    Play,
    Activity,
    ArrowLeft,
    Hourglass,
    AlertTriangle,
    Hash
  },
  name: 'AnalysisDetail',
  data() {
    return {
      analysis: null,
      isLoading: false,
      isRestarting: false,
      isDeleting: false,
      showFiles: false,
      showProtocols: false,
      showDeleteModal: false
    }
  },
  async mounted() {
    await this.loadAnalysis()
  },
  methods: {
    async loadAnalysis() {
      this.isLoading = true
      try {
        const analysisId = this.$route.params.id
        const response = await impulsAnalysisAPI.getAnalysis(analysisId)
        if (response && response.success && response.data) {
          this.analysis = response.data
        } else if (!this.analysis) {
          // Только если данных еще не было — показываем пустое состояние
          this.analysis = null
        }
      } catch (error) {
        console.error('Error loading analysis:', error)
        // Не обнуляем уже загруженный анализ при временной ошибке
        if (!this.analysis) {
          this.analysis = null
        }
      } finally {
        this.isLoading = false
      }
    },
    
    async refreshAnalysis() {
      await this.loadAnalysis()
    },
    
    async restartAnalysis() {
      if (!confirm('Вы уверены, что хотите перезапустить этот анализ?')) {
        return
      }
      
      this.isRestarting = true
      try {
        const response = await impulsAnalysisAPI.restartAnalysis(this.analysis.id)
        if (response && response.success) {
          toast.success('Анализ перезапущен')
          await this.loadAnalysis()
        } else {
          toast.error(response?.message || 'Ошибка при перезапуске анализа')
        }
      } catch (error) {
        toast.error('Ошибка при перезапуске анализа')
      } finally {
        this.isRestarting = false
      }
    },
    
    showDeleteConfirm() {
      this.$refs.deleteDialog?.open?.() // на случай, если ConfirmDialog предоставляет метод open
      this.showDeleteModal = true
    },
    async deleteAnalysisConfirmed() {
      this.isDeleting = true
      try {
        const response = await impulsAnalysisAPI.deleteAnalysis(this.analysis.id)
        if (response && response.success) {
          toast.success('Анализ удален')
          this.$router.push('/impuls-analysis/analyses')
        } else {
          toast.error(response?.message || 'Ошибка при удалении анализа')
        }
      } catch (error) {
        toast.error('Ошибка при удалении анализа')
      } finally {
        this.isDeleting = false
        this.showDeleteModal = false
      }
    },
    cancelDeleteAnalysis() {
      this.showDeleteModal = false
    },
    
    async downloadProtocol(protocolId) {
      try {
        const response = await impulsAnalysisAPI.downloadProtocol(this.analysis.id, protocolId)
        if (response && response.success) {
          const blob = response.data
          // Пытаемся извлечь имя файла из Content-Disposition
          let filename = `protocol_${this.analysis.title || 'analysis'}.docx`
          const disposition = response.headers && (response.headers['content-disposition'] || response.headers['Content-Disposition'])
          if (disposition && disposition.includes('filename=')) {
            const match = disposition.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/)
            const name = decodeURIComponent(match?.[1] || match?.[2] || '').trim()
            if (name) filename = name
          }
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = filename
          document.body.appendChild(a)
          a.click()
          a.remove()
          window.URL.revokeObjectURL(url)
          toast.success('Протокол скачан')
        } else {
          toast.error(response?.message || 'Ошибка при скачивании протокола')
        }
      } catch (error) {
        toast.error('Ошибка при скачивании протокола')
      }
    },
    
    async downloadResults() {
      try {
        const response = await impulsAnalysisAPI.downloadResults(this.analysis.id)
        if (response && response.success) {
          const files = response.data?.files || []
          if (!files.length) {
            toast.info('Нет файлов результатов для скачивания')
            return
          }
          // Скачиваем каждый файл как blob и сохраняем через якорь
          for (const f of files) {
            if (!f.url) continue
            try {
              const dl = await impulsAnalysisAPI.downloadByUrl(f.url)
              if (dl && dl.success) {
                const blob = dl.data
                let filename = f.filename || 'result'
                const disposition = dl.headers && (dl.headers['content-disposition'] || dl.headers['Content-Disposition'])
                if (disposition && disposition.includes('filename=')) {
                  const match = disposition.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/)
                  const name = decodeURIComponent(match?.[1] || match?.[2] || '').trim()
                  if (name) filename = name
                }
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = filename
                document.body.appendChild(a)
                a.click()
                a.remove()
                window.URL.revokeObjectURL(url)
              }
            } catch (e) {
              console.error('Ошибка скачивания файла результата:', f.url, e)
            }
          }
          toast.success('Результаты анализа скачаны')
        } else {
          toast.error(response?.message || 'Ошибка при получении результатов')
        }
      } catch (error) {
        toast.error('Ошибка при получении результатов')
      }
    },
    
    async downloadAllProtocols() {
      try {
        const list = (this.analysis?.protocols || []).slice()
        if (!list.length) {
          toast.info('Нет протоколов для скачивания')
          return
        }
        for (const p of list) {
          try {
            const resp = await impulsAnalysisAPI.downloadProtocol(this.analysis.id, p.id)
            if (resp && resp.success) {
              const blob = resp.data
              let filename = `protocol_${this.analysis.title || 'analysis'}_${new Date(p.generated_at || Date.now()).toISOString().replace(/[:.]/g,'-')}.docx`
              const disposition = resp.headers && (resp.headers['content-disposition'] || resp.headers['Content-Disposition'])
              if (disposition && disposition.includes('filename=')) {
                const match = disposition.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/)
                const name = decodeURIComponent(match?.[1] || match?.[2] || '').trim()
                if (name) filename = name
              }
              const url = window.URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = filename
              document.body.appendChild(a)
              a.click()
              a.remove()
              window.URL.revokeObjectURL(url)
            }
          } catch (e) {
            console.error('Ошибка скачивания протокола:', p?.id, e)
          }
        }
        toast.success('Протоколы скачаны')
      } catch (error) {
        toast.error('Ошибка при скачивании протоколов')
      }
    },
    
    getTypeBadgeClass(type) {
      const classes = {
        'standard': 'bg-primary',
        'advanced': 'bg-info',
        'custom': 'bg-secondary'
      }
      return classes[type] || 'bg-secondary'
    },
    
    formatDateTime(dateString) {
      if (!dateString) return '—'
      const date = new Date(dateString)
      return date.toLocaleString('ru-RU')
    },
    
    formatDate(dateString) {
      if (!dateString) return '—'
      const date = new Date(dateString)
      return date.toLocaleDateString('ru-RU')
    },
    
    statusClass(status) {
      switch (status) {
        case 'completed': return 'bg-success'
        case 'processing': return 'bg-warning'
        case 'failed': return 'bg-danger'
        case 'pending': return 'bg-secondary'
        default: return 'bg-light text-dark'
      }
    },
    
    getStatusLabel(status) {
      const labels = {
        'pending': 'Ожидает',
        'processing': 'Обрабатывается',
        'completed': 'Завершен',
        'failed': 'Ошибка',
        'cancelled': 'Отменен'
      }
      return labels[status] || status
    },
    
    getStatusIcon(status) {
      const icons = {
        'pending': Hourglass,
        'processing': Loader2,
        'completed': CheckCircle,
        'failed': AlertTriangle,
        'cancelled': AlertTriangle
      }
      return icons[status] || Calendar
    },
    
    getAnalysisIconClass(status) {
      const classes = {
        'pending': 'icon-secondary',
        'processing': 'icon-warning',
        'completed': 'icon-success',
        'failed': 'icon-danger',
        'cancelled': 'icon-info'
      }
      return classes[status] || 'icon-secondary'
    }
  }
}
</script>

<style scoped lang="scss">
.analysis-detail-page {
  padding: 2rem;
  min-height: 100vh;
  background: var(--bs-gray-100);
}

// Заголовок страницы
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  background: white;
  padding: 1.5rem;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  
  .header-content {
    flex: 1;
  }
  
  .header-actions {
    display: flex;
    gap: 0.75rem;
    margin-left: 2rem;
  }
}

// Хлебные крошки
.breadcrumb-nav {
  margin-bottom: 1rem;
  
  .breadcrumb {
    background: transparent;
    padding: 0;
    margin: 0;
    
    .breadcrumb-item {
      font-size: 0.875rem;
      
      .breadcrumb-link {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--bs-secondary-color);
        text-decoration: none;
        transition: color 0.2s ease;
        
        &:hover {
          color: var(--bs-primary);
        }
      }
      
      &.active {
        color: var(--bs-heading-color);
        font-weight: 600;
      }
    }
  }
}

// Секция заголовка анализа
.analysis-title-section {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  
  .analysis-icon {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    
    &.icon-primary {
      background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
    }
    
    &.icon-warning {
      background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
    }
    
    &.icon-success {
      background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%);
    }
    
    &.icon-danger {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
    }
    
    &.icon-info {
      background: linear-gradient(135deg, #17a2b8 0%, #117a8b 100%);
    }
    
    &.icon-secondary {
      background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
    }
  }
  
  .analysis-title {
    flex: 1;
    
    h1 {
      font-size: 2rem;
      font-weight: 700;
      color: var(--bs-heading-color);
      margin: 0 0 0.5rem 0;
    }
    
    .analysis-meta-badges {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
      
      .badge {
        padding: 0.375rem 0.75rem;
        font-size: 0.75rem;
        font-weight: 600;
        border-radius: 6px;
        
        &.type-badge {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
      }
    }
    
    .analysis-description {
      color: var(--bs-secondary-color);
      margin: 0;
      font-size: 1rem;
      line-height: 1.5;
    }
  }
}

// Кнопки в заголовке
.header-actions {
  .btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    font-weight: 600;
    border-radius: 8px;
    transition: all 0.2s ease;
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }
  }
  
  .btn-refresh {
    background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
    border: none;
    color: white;
    font-weight: 600;
    border-radius: 10px;
    padding: 0.875rem 1.5rem;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #c82333 0%, #a71e2a 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(220, 53, 69, 0.4);
      color: white;
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    svg { flex-shrink: 0; margin: 0; align-self: center; }

    span {
      white-space: nowrap;
    }
  }

  .btn-delete-analysis {
    background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
    border: none;
    color: white;
    font-weight: 600;
    border-radius: 10px;
    padding: 0.875rem 1.5rem;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #5a6268 0%, #495057 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(108, 117, 125, 0.4);
      color: white;
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    svg { flex-shrink: 0; margin: 0; align-self: center; }

    span {
      white-space: nowrap;
    }
  }
}

// Основной контент
.analysis-content {
  .info-section {
    margin-bottom: 2rem;
  }
}

// Карточки информации
.info-card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  }
  
  .card-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
    background: var(--bs-light);
    border-bottom: 1px solid var(--bs-border-color);
    
    h3 {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--bs-heading-color);
      margin: 0;
    }
  }
  
  .card-body {
    padding: 1rem 1.25rem;
  }
}

// Сетка метаданных
.meta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  
  .meta-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    background: var(--bs-gray-100);
    border-radius: 10px;
    
    .meta-icon { color: var(--bs-secondary-color); display: flex; align-items: center; }
    
    .meta-content {
      display: flex;
      flex-direction: column;
      
      .meta-label {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--bs-secondary-color);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 0.25rem;
      }
      
      .meta-value {
        font-weight: 600;
        color: var(--bs-heading-color);
      }
    }
  }
}

// Карточка загрузок
.downloads-card {
  .download-actions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-width: 500px;
  }
  
  .download-btn {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem 1rem;
    background: var(--bs-gray-100);
    border-radius: 10px;
    text-decoration: none;
    color: inherit;
    transition: all 0.2s ease;
    border: none;
    cursor: pointer;
    width: 100%;
    text-align: left;
    
    &:hover:not(:disabled) {
      background: var(--bs-primary);
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      text-decoration: none;
    }
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
    
    .download-icon { 
      width: 40px; 
      height: 40px; 
      border-radius: 8px; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      background: white; 
      color: var(--bs-primary); 
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); 
      flex-shrink: 0;
      svg { align-self: center; } 
    }
    
    .download-info {
      display: flex;
      flex-direction: column;
      flex: 1;
      text-align: left;
      
      .download-title {
        font-weight: 600;
        margin-bottom: 0.25rem;
        text-align: left;
      }
      
      .download-subtitle {
        font-size: 0.875rem;
        color: var(--bs-secondary-color);
        text-align: left;
      }
    }
    
    &:hover:not(:disabled) .download-icon {
      background: white;
      color: var(--bs-primary);
    }
    
    &:hover:not(:disabled) .download-subtitle {
      color: rgba(255, 255, 255, 0.8);
    }
  }
}

// Карточка ошибок
.error-card {
  .error-message {
    pre {
      background: var(--bs-gray-100);
      border: 1px solid var(--bs-border-color);
      border-radius: 8px;
      padding: 1rem;
      margin: 0;
      white-space: pre-wrap;
      word-break: break-word;
      font-size: 0.875rem;
      color: var(--bs-danger);
    }
  }
}

// Состояния загрузки и пустого списка
.loading-state,
.error-state {
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  padding: 3rem 2rem;
  text-align: center;
  
  .error-icon {
    color: var(--bs-gray-400);
    margin-bottom: 1rem;
  }
  
  h3 {
    color: var(--bs-heading-color);
    margin-bottom: 0.5rem;
  }
  
  p {
    color: var(--bs-secondary-color);
    margin-bottom: 1.5rem;
  }
  
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 2rem;
    font-weight: 600;
    border-radius: 8px;
  }
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

// Адаптивность
@media (max-width: 768px) {
  .analysis-detail-page {
    padding: 1rem;
  }
  
  .page-header {
    flex-direction: column;
    gap: 1rem;
    
    .header-actions {
      margin-left: 0;
      width: 100%;
      justify-content: flex-end;
    }
  }
  
  .analysis-title-section {
    .analysis-title h1 {
      font-size: 1.5rem;
    }
  }
  
  .meta-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 576px) {
  .analysis-meta-badges {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 0.5rem !important;
  }
  
  .download-btn {
    flex-direction: column;
    text-align: center;
    
    .download-icon {
      margin-bottom: 0.5rem;
    }
  }
}
</style>
