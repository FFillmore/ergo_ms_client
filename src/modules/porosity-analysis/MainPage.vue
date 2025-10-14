<template>
  <div class="porosity-analysis-main">
    <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <!-- Заголовок в едином стиле -->
          <PageHeader
            title="Анализ пористости"
            subtitle="Создание анализов и загрузка изображений для обработки"
            :icon="microscopeIcon"
          />
          
          <!-- Статистика в едином стиле -->
          <StatisticsCards :stats="stats" />
          
          <!-- Создание анализа с массовой загрузкой -->
          <div class="row g-4">
            <div class="col-12">
              <div class="create-analysis-card">
                <div class="create-analysis-header">
                  <div class="header-icon">
                    <Plus :size="24" />
                  </div>
                  <div class="header-content">
                    <h2 class="header-title">Создать новый анализ</h2>
                    <p class="header-subtitle">Настройте параметры и загрузите изображения для анализа пористости</p>
                  </div>
                </div>
                
                <div class="create-analysis-body">
                  <form @submit.prevent="createAnalyses">
                    <div class="analysis-form-grid">
                      <!-- Левая колонка: параметры -->
                      <div class="parameters-section">
                        <FormSection
                          title="Параметры анализа"
                          subtitle="Основные настройки для обработки изображений"
                        >

                        <div class="form-group">
                          <label for="analysisName" class="form-label">
                            Название анализа
                            <span class="optional-badge">необязательно</span>
                          </label>
                          <input
                            type="text"
                            class="form-control"
                            id="analysisName"
                            v-model="newAnalysis.name"
                            placeholder="Автоматически сгенерируется, если не указано"
                          />
                          <div class="form-help">Если не указать, название будет создано автоматически</div>
                        </div>

                        <div class="form-group">
                          <label for="analysisDescription" class="form-label">Описание</label>
                          <textarea
                            class="form-control"
                            id="analysisDescription"
                            v-model="newAnalysis.description"
                            rows="3"
                            placeholder="Дополнительная информация об анализе..."
                          ></textarea>
                        </div>

                        <!-- Группа (необязательно) -->
                        <GroupSelector
                          v-model="selectedGroupId"
                          :groups="groups"
                          label="Группа"
                          placeholder="Без группы"
                          help-text="Выберите группу для организации анализов"
                          :optional="true"
                        />

                        <div class="parameters-grid">
                          <div class="form-group">
                            <label for="scaleValue" class="form-label">Масштаб</label>
                            <div class="input-group">
                              <input
                                type="number"
                                class="form-control"
                                id="scaleValue"
                                v-model="newAnalysis.scale_value"
                                step="0.01"
                                min="0"
                                placeholder="100.0"
                              />
                              <span class="input-group-text">мкм</span>
                            </div>
                            <div class="form-help">Размер масштабной линейки</div>
                          </div>
                          
                          <div class="form-group">
                            <label for="pixelsPerMicron" class="form-label">Разрешение</label>
                            <div class="input-group">
                              <input
                                type="number"
                                class="form-control"
                                id="pixelsPerMicron"
                                v-model="newAnalysis.pixels_per_micron"
                                step="0.01"
                                min="0"
                                placeholder="1.0"
                              />
                              <span class="input-group-text">пикс/мкм</span>
                            </div>
                            <div class="form-help">Пикселей на микрометр</div>
                          </div>
                        </div>
                        </FormSection>
                      </div>

                      <!-- Правая колонка: загрузка файлов -->
                      <div class="upload-section">
                        <FileUpload
                          :selected-files="selectedAnalysisImages"
                          input-id="analysisImage"
                          @update:selectedFiles="selectedAnalysisImages = $event"
                        />

                        <!-- Кнопка создания и прогресс -->
                        <CreateButton
                          :file-count="selectedAnalysisImages.length"
                          :is-creating="isCreating"
                          :disabled="selectedAnalysisImages.length === 0"
                          :progress="bulkProgress"
                        />
                      </div>
                    </div>
                  </form>
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
import { porosityAnalysisAPI } from './js/porosity-analysis.js'
import { useToast } from 'vue-toastification'
import { Microscope, Plus } from 'lucide-vue-next'
import StatisticsCards from './components/StatisticsCards.vue'
import FileUpload from './components/FileUpload.vue'
import FormSection from './components/FormSection.vue'
import CreateButton from './components/CreateButton.vue'
import PageHeader from './components/PageHeader.vue'
import GroupSelector from './components/GroupSelector.vue'

const toast = useToast()

export default {
  components: {
    Microscope,
    Plus,
    StatisticsCards,
    FileUpload,
    FormSection,
    CreateButton,
    PageHeader,
    GroupSelector
  },
  name: 'PorosityAnalysisMainPage',
  data() {
    return {
      newAnalysis: {
        name: '',
        description: '',
        scale_value: 100,  // Стандартное значение шкалы 100 мкм
        pixels_per_micron: null
      },
      groups: [],
      groupsLoading: false,
      selectedGroupId: null,
      selectedAnalysisImages: [],
      isCreating: false,
      // Прогресс массовой загрузки
      bulkProgress: { total: 0, processed: 0, success: 0, failed: 0 },
      concurrencyLimit: 8,
      stats: {
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0
      }
    }
  },
  computed: {
    microscopeIcon() {
      return Microscope
    }
  },
  async mounted() {
    await Promise.all([
      this.loadStats(),
      this.loadUploadConfig(),
      this.loadGroups()
    ])
  },
  methods: {
    async loadGroups() {
      this.groupsLoading = true
      try {
        const resp = await porosityAnalysisAPI.getGroups()
        if (resp && resp.success) this.groups = resp.data || []
      } finally {
        this.groupsLoading = false
      }
    },
    
    async createAnalyses() {
      const files = this.selectedAnalysisImages
      if (!files || files.length === 0) return
      this.isCreating = true
      this.bulkProgress = { total: files.length, processed: 0, success: 0, failed: 0 }
      const concurrency = Math.max(1, this.concurrencyLimit)

      const fileQueue = files.slice()

      const worker = async () => {
        while (fileQueue.length > 0) {
          const file = fileQueue.shift()
          if (!file) break
          try {
            const analysisPayload = {
              name: this.newAnalysis.name ? `${this.newAnalysis.name} — ${file.name.replace(/\.[^/.]+$/, '')}` : '',
              description: this.newAnalysis.description || `Автоматически созданный анализ для файла ${file.name}`,
              scale_value: this.newAnalysis.scale_value,
              pixels_per_micron: this.newAnalysis.pixels_per_micron,
              // Назначение группы
              ...(this.selectedGroupId ? { group_id: this.selectedGroupId } : {})
            }
            const createResp = await porosityAnalysisAPI.createAnalysis(analysisPayload)
            if (!(createResp && createResp.success)) throw new Error(createResp?.message || 'Не удалось создать анализ')
            let analysisId = null
            if (createResp.data && typeof createResp.data === 'object') analysisId = createResp.data.id
            else if (typeof createResp.data === 'number') analysisId = createResp.data
            if (!analysisId) throw new Error('ID анализа не получен')
            const uploadResp = await porosityAnalysisAPI.uploadImage(analysisId, file)
            if (!(uploadResp && uploadResp.success)) throw new Error(uploadResp?.message || 'Ошибка загрузки изображения')
            this.bulkProgress.success += 1
          } catch (e) {
            this.bulkProgress.failed += 1
          } finally {
            this.bulkProgress.processed += 1
          }
        }
      }

      const workers = Array.from({ length: Math.min(concurrency, files.length) }, () => worker())
      await Promise.all(workers)

      if (this.bulkProgress.success > 0 && this.bulkProgress.failed === 0) {
        toast.success(`Создано ${this.bulkProgress.success} анализов`)
      } else if (this.bulkProgress.success > 0 && this.bulkProgress.failed > 0) {
        toast.warning(`Создано ${this.bulkProgress.success}, ошибок: ${this.bulkProgress.failed}`)
      } else {
        toast.error('Не удалось создать анализы')
      }

      this.resetForm()
      this.$router.push('/porosity-analysis/analyses')
      this.isCreating = false
    },

    
    resetForm() {
      this.newAnalysis = {
        name: '',
        description: '',
        scale_value: 100,  // Стандартное значение шкалы 100 мкм
        pixels_per_micron: null
      }
      this.selectedAnalysisImages = []
      this.selectedGroupId = null
      if (this.$refs.analysisImageInput) {
        this.$refs.analysisImageInput.value = ''
      }
    },
    
    async loadStats() {
      try {
        const response = await porosityAnalysisAPI.getStatistics()
        if (response && response.success) {
          this.stats = response.data
        }
      } catch (error) {
        // Устанавливаем значения по умолчанию при ошибке
        this.stats = {
          pending: 0,
          processing: 0,
          completed: 0,
          failed: 0
        }
      }
    },

    async loadUploadConfig() {
      try {
        const response = await porosityAnalysisAPI.getUploadConfig()
        if (response && response.success && response.data) {
          this.concurrencyLimit = response.data.upload_threads || 8
        }
      } catch (error) {
        this.concurrencyLimit = 8
      }
    },
    
  }
  ,
}
</script>

<style scoped>
@import './styles/common.scss';

.porosity-analysis-main {
  padding: 2rem;
  min-height: 100vh;
  background: var(--bs-gray-100);
}

/* Карточка создания анализа */
.create-analysis-card {
  @extend .card-base;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

.create-analysis-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
}

/* Заголовок карточки */
.create-analysis-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.header-icon {
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  backdrop-filter: blur(10px);
}

.header-content {
  flex: 1;
}

.header-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.5rem 0;
  line-height: 1.2;
}

.header-subtitle {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  line-height: 1.4;
}

/* Тело карточки */
.create-analysis-body {
  padding: 2.5rem;
}

/* Сетка формы */
.analysis-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
}

@media (max-width: 992px) {
  .analysis-form-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}

/* Секции */
.parameters-section,
.upload-section {
  @extend .form-section;
}


/* Сетка параметров */
.parameters-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 768px) {
  .parameters-grid {
    grid-template-columns: 1fr;
  }
}

.input-group-text {
  background: #f1f5f9;
  border: 2px solid #e2e8f0;
  border-left: none;
  color: #64748b;
  font-weight: 500;
  font-size: 0.9rem;
}

/* Адаптивность */
@media (max-width: 576px) {
  .create-analysis-header {
    padding: 1.5rem;
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .header-icon {
    width: 56px;
    height: 56px;
  }
  
  .header-title {
    font-size: 1.5rem;
  }
  
  .create-analysis-body {
    padding: 1.5rem;
  }
  
}
</style> 