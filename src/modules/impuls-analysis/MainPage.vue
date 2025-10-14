<template>
  <div class="impuls-analysis-main">
    <!-- Заголовок страницы с современным дизайном -->
    <div class="page-header">
      <div class="header-content">
        <div class="page-title-section">
          <div class="page-icon">
            <Zap :size="28" color="white" />
          </div>
          <div class="page-title">
            <h1>Загрузка файлов</h1>
            <p class="page-subtitle">Импорт данных для анализов импульсных нагрузок</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Статистика -->
    <div class="row mb-4">
      <div class="col-12">
        <AnalysisStats :stats="stats" :show-details="false" />
      </div>
    </div>
          
    <!-- Формы -->
    <div class="row g-4">
      <!-- Загрузка файлов для импорта данных -->
      <div class="col-lg-12">
        <div class="action-card upload-card">
          <div class="card-header">
            <div class="card-icon">
              <Upload :size="24" />
            </div>
            <div class="card-title">
              <h3>Загрузить файлы</h3>
              <p>Импорт данных для анализа</p>
            </div>
          </div>
          <div class="card-body">
            <form @submit.prevent="uploadFiles">
              <div class="form-section">
                <label class="form-label">Файлы для импорта данных</label>
                
                <!-- Drag and Drop зоны для разных типов файлов -->
                <div class="file-drop-zones">
                  <div class="drop-zone-section">
                    <h6 class="drop-zone-title">
                      <FileText :size="16" />
                      Расчет силы (Excel)
                    </h6>
                    <FileDropZone
                      ref="forceDropZone"
                      :file-types="['Excel файлы (.xlsx, .xls)']"
                      :accepted-types="'.xlsx,.xls'"
                      :multiple="true"
                      :max-files="5"
                      :is-uploading="isUploading"
                      @files-selected="handleForceFilesSelected"
                      @files-removed="handleForceFilesRemoved"
                    />
                  </div>
                  
                  <div class="drop-zone-section">
                    <h6 class="drop-zone-title">
                      <FileText :size="16" />
                      План эксперимента (Excel)
                    </h6>
                    <FileDropZone
                      ref="planDropZone"
                      :file-types="['Excel файлы (.xlsx, .xls)']"
                      :accepted-types="'.xlsx,.xls'"
                      :multiple="true"
                      :max-files="5"
                      :is-uploading="isUploading"
                      @files-selected="handlePlanFilesSelected"
                      @files-removed="handlePlanFilesRemoved"
                    />
                  </div>
                </div>
                
                <div class="form-help">
                  Перетащите Excel файлы в соответствующие зоны или нажмите для выбора. Можно загружать несколько файлов каждого типа.
                </div>
              </div>
              
              <button 
                type="submit" 
                class="btn btn-primary btn-upload" 
                :disabled="isUploading || (forceFiles.length === 0 && planFiles.length === 0)"
              >
                <Upload :size="16" />
                <span>{{ isUploading ? 'Загрузка...' : `Загрузить файлы (${forceFiles.length + planFiles.length})` }}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
            
      
    </div>
  </div>
</template>

<script>
import { impulsAnalysisAPI } from './js/impuls-analysis.js'
import AnalysisStats from './components/AnalysisStats.vue'
import FileDropZone from './components/FileDropZone.vue'
import { useToast } from 'vue-toastification'
import { FileText, FileCheck, FileX, Plus, Upload, Zap } from 'lucide-vue-next'

const toast = useToast()

export default {
  components: {
    AnalysisStats,
    FileDropZone,
    FileText,
    FileCheck,
    FileX,
    Plus,
    Upload,
    Zap
  },
  name: 'ImpulsAnalysisMainPage',
  data() {
    return {
      newAnalysis: {
        title: '',
        description: ''
      },
      forceFiles: [],
      planFiles: [],
      isUploading: false,
      isCreatingFromProtocol: false,
      stats: {
        total: 0,
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        cancelled: 0
      },
      availableProtocols: [],
      selectedProtocol: '',
      selectedProtocolData: null,
      protocolAnalysis: {
        title: '',
        description: ''
      }
    }
  },
  async mounted() {
    await Promise.all([
      this.loadStats(),
      this.loadAvailableProtocols()
    ])
  },
  methods: {
    handleForceFilesSelected(files) {
      this.forceFiles.push(...files)
    },
    
    handleForceFilesRemoved(files) {
      // Файлы уже удалены из компонента, обновляем локальный массив
      this.forceFiles = this.$refs.forceDropZone.getFiles()
    },
    
    handlePlanFilesSelected(files) {
      this.planFiles.push(...files)
    },
    
    handlePlanFilesRemoved(files) {
      // Файлы уже удалены из компонента, обновляем локальный массив
      this.planFiles = this.$refs.planDropZone.getFiles()
    },
    
    async uploadFiles() {
      if (this.forceFiles.length === 0 && this.planFiles.length === 0) {
        toast.error('Выберите файлы для загрузки')
        return
      }
      
      this.isUploading = true
      try {
        const response = await impulsAnalysisAPI.uploadMultipleFiles(
          this.forceFiles, 
          this.planFiles
        )
        
        if (response && response.success) {
          toast.success(`Загружено ${this.forceFiles.length + this.planFiles.length} файлов! Импорт запущен.`)
          this.resetForm()
          // Обновляем список доступных протоколов
          await this.loadAvailableProtocols()
        } else {
          toast.error(response?.message || 'Ошибка при загрузке файлов')
        }
      } catch (error) {
        let errorMessage = 'Ошибка при загрузке файлов'
        if (error && typeof error === 'object') {
          errorMessage = error.response?.data?.message || error.message || errorMessage
        }
        toast.error(errorMessage)
      } finally {
        this.isUploading = false
      }
    },
    
    async createAnalysisFromProtocol() {
      if (!this.selectedProtocol) {
        toast.error('Выберите протокол')
        return
      }
      
      this.isCreatingFromProtocol = true
      try {
        const response = await impulsAnalysisAPI.createFromProtocol(
          this.selectedProtocol,
          this.protocolAnalysis.title || `Анализ протокола ${this.selectedProtocol}`,
          this.protocolAnalysis.description,
          'standard'
        )
        
        if (response && response.success) {
          toast.success('Анализ создан из протокола успешно!')
          this.resetProtocolForm()
          this.$router.push(`/impuls-analysis/analysis/${response.data.id}`)
        } else {
          toast.error(`Протокол ${this.selectedProtocol}: ${response?.message || 'Неизвестная ошибка'}`)
        }
      } catch (error) {
        console.error('Ошибка при создании анализа из протокола:', error)
        let errorMessage = 'Ошибка при создании анализа из протокола'
        if (error && typeof error === 'object') {
          errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || errorMessage
        }
        toast.error(`Протокол ${this.selectedProtocol}: ${errorMessage}`)
      } finally {
        this.isCreatingFromProtocol = false
      }
    },
    
    onProtocolSelect() {
      if (this.selectedProtocol) {
        this.selectedProtocolData = this.availableProtocols.find(
          p => p.protocol_number === this.selectedProtocol
        )
        this.protocolAnalysis.title = `Анализ протокола ${this.selectedProtocol}`
      } else {
        this.selectedProtocolData = null
      }
    },
    
    resetForm() {
      this.forceFiles = []
      this.planFiles = []
      if (this.$refs.forceDropZone) {
        this.$refs.forceDropZone.clearFiles()
      }
      if (this.$refs.planDropZone) {
        this.$refs.planDropZone.clearFiles()
      }
    },
    
    resetProtocolForm() {
      this.selectedProtocol = ''
      this.selectedProtocolData = null
      this.protocolAnalysis = {
        title: '',
        description: ''
      }
    },
    
    async loadStats() {
      try {
        const response = await impulsAnalysisAPI.getStatistics()
        if (response && response.success) {
          this.stats = response.data
        }
      } catch (error) {
        console.error('Error loading stats:', error)
      }
    },
    
    async loadAvailableProtocols() {
      try {
        const response = await impulsAnalysisAPI.getAvailableProtocols({
          page_size: 1000  // Запрашиваем все протоколы
        })
        if (response && response.success) {
          // Сортируем протоколы по номеру (сначала как числа, потом как строки)
          const protocols = response.data.protocols || []
          this.availableProtocols = protocols.sort((a, b) => {
            const aNum = parseInt(a.protocol_number)
            const bNum = parseInt(b.protocol_number)
            
            // Если оба номера - числа, сортируем как числа
            if (!isNaN(aNum) && !isNaN(bNum)) {
              return aNum - bNum
            }
            
            // Иначе сортируем как строки
            return a.protocol_number.localeCompare(b.protocol_number)
          })
        }
      } catch (error) {
        console.error('Error loading available protocols:', error)
      }
    }
  }
}
</script>

<style scoped lang="scss">
.impuls-analysis-main {
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
}

// Секция заголовка страницы
.page-title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  
  .page-icon {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
    box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
  }
  
  .page-title {
    h1 {
      font-size: 2rem;
      font-weight: 700;
      color: var(--bs-heading-color);
      margin: 0 0 0.5rem 0;
    }
    
    .page-subtitle {
      color: var(--bs-secondary-color);
      margin: 0;
      font-size: 1rem;
    }
  }
}

// Карточки действий
.action-card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
  height: 100%;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  }
  
  .card-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    background: var(--bs-light);
    border-bottom: 1px solid var(--bs-border-color);
    
    .card-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }
    
    .card-title {
      flex: 1;
      
      h3 {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--bs-heading-color);
        margin: 0 0 0.25rem 0;
      }
      
      p {
        color: var(--bs-secondary-color);
        margin: 0;
        font-size: 0.875rem;
      }
    }
  }
  
  .card-body {
    padding: 1.5rem;
  }
}

.upload-card {
  .card-icon {
    background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  }
}

.create-card {
  .card-icon {
    background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%);
  }
}

// Формы
.form-section {
  margin-bottom: 1.5rem;
  
  .form-label {
    display: block;
    font-weight: 600;
    color: var(--bs-heading-color);
    margin-bottom: 0.5rem;
  }
  
  .form-control,
  .form-select {
    border-radius: 8px;
    border: 1px solid var(--bs-border-color);
    transition: border-color 0.2s ease;
    
    &:focus {
      border-color: var(--bs-primary);
      box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
    }
  }
  
  .form-help {
    font-size: 0.875rem;
    color: var(--bs-secondary-color);
    margin-top: 0.5rem;
  }
}

// Drag and Drop зоны
.file-drop-zones {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.drop-zone-section {
  .drop-zone-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    color: var(--bs-heading-color);
    margin-bottom: 0.75rem;
    font-size: 1rem;
  }
}

// Данные протокола
.protocol-data {
  background: var(--bs-gray-100);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  
  h6 {
    font-weight: 600;
    color: var(--bs-heading-color);
    margin-bottom: 0.75rem;
  }
  
  .data-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
    
    .data-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .data-label {
        font-size: 0.875rem;
        color: var(--bs-secondary-color);
      }
      
      .data-value {
        font-weight: 600;
        color: var(--bs-heading-color);
      }
    }
  }
}

// Пустое состояние протоколов
.empty-protocols {
  text-align: center;
  padding: 2rem 1rem;
  
  .empty-icon {
    color: var(--bs-gray-400);
    margin-bottom: 1rem;
  }
  
  h4 {
    color: var(--bs-heading-color);
    margin-bottom: 0.5rem;
  }
  
  p {
    color: var(--bs-secondary-color);
    margin: 0;
  }
}

// Кнопки
.btn {
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
}

.btn-upload {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  border: none;
  color: white;
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
  width: 100%;
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #0056b3 0%, #004085 100%);
    box-shadow: 0 6px 20px rgba(0, 123, 255, 0.4);
  }
}

.btn-create {
  background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%);
  border: none;
  color: white;
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
  width: 100%;
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #1e7e34 0%, #155724 100%);
    box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4);
  }
}

// Адаптивность
@media (max-width: 768px) {
  .impuls-analysis-main {
    padding: 1rem;
  }
  
  .page-title-section {
    .page-title h1 {
      font-size: 1.5rem;
    }
  }
  
  .action-card {
    .card-header {
      flex-direction: column;
      text-align: center;
      gap: 0.75rem;
    }
  }
  
  .protocol-data {
    .data-grid {
      grid-template-columns: 1fr;
    }
  }
}

@media (max-width: 576px) {
  .file-drop-zones {
    gap: 1rem;
  }
  
  .drop-zone-section {
    .drop-zone-title {
      font-size: 0.875rem;
    }
  }
  
  .btn-upload,
  .btn-create {
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
  }
}
</style>
