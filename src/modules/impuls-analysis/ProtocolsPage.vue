<template>
  <div class="protocols-page">
    <!-- Заголовок страницы с современным дизайном -->
    <div class="page-header">
      <div class="header-content">
        <div class="page-title-section">
          <div class="page-icon">
            <FileCheck :size="28" color="white" />
          </div>
          <div class="page-title">
            <h1>Протоколы анализа импульсов</h1>
            <p class="page-subtitle">Управление протоколами и создание анализов</p>
          </div>
        </div>
      </div>
      
    </div>
    
    <!-- Статистика протоколов -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card stat-available">
          <div class="stat-icon">
            <FileCheck size="20" />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ pagination.totalItems }}</div>
            <div class="stat-label">Доступных протоколов</div>
          </div>
          <div class="stat-progress">
            <div class="progress-bar" :style="{ width: '100%' }"></div>
          </div>
        </div>
        
        <div class="stat-card stat-completed">
          <div class="stat-icon">
            <CheckCircle size="20" />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ completedAnalyses }}</div>
            <div class="stat-label">Созданных анализов</div>
          </div>
          <div class="stat-progress">
            <div class="progress-bar" :style="{ width: getPercentage(completedAnalyses) + '%' }"></div>
          </div>
        </div>
        
        <div class="stat-card stat-processing">
          <div class="stat-icon">
            <Loader2 size="20" />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ processingAnalyses }}</div>
            <div class="stat-label">В обработке</div>
          </div>
          <div class="stat-progress">
            <div class="progress-bar" :style="{ width: getPercentage(processingAnalyses) + '%' }"></div>
          </div>
        </div>
        
        <div class="stat-card stat-pending">
          <div class="stat-icon">
            <Clock size="20" />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ pendingAnalyses }}</div>
            <div class="stat-label">Ожидают</div>
          </div>
          <div class="stat-progress">
            <div class="progress-bar" :style="{ width: getPercentage(pendingAnalyses) + '%' }"></div>
          </div>
        </div>
      </div>
    </div>
    <!-- Список протоколов -->
    <div class="protocols-section">
      <div class="section-header">
        <h3 class="section-title">Доступные протоколы</h3>
        <p class="section-subtitle">Выберите протоколы для создания анализов или введите номера вручную</p>
        
        <!-- Сортировка -->
        <SortComponent
          v-if="pagination.totalItems > 0"
          :current-sort="sort"
          @sort-change="onSortChange"
        />

        <!-- Панель групповых действий -->
        <div class="bulk-actions mt-3">
          <div class="bulk-card">
            <div class="bulk-header">
              <label class="bulk-title d-flex align-items-center gap-2 mb-0">
                <Plus size="18" />
                <span>Групповое создание анализов</span>
              </label>
              <button
                class="btn btn-primary d-inline-flex align-items-center gap-2 lh-1 bulk-action-btn"
                :disabled="isBulkCreating || selectedCount === 0"
                @click="createAnalysesForSelected"
                title="Создать анализы по выбранным протоколам"
              >
                <Plus size="16" />
                <span>{{ isBulkCreating ? 'Создание...' : 'Создать выбранные' }}</span>
              </button>
            </div>

            <div class="row g-3 align-items-start">
              <div class="col-12">
                <div class="input-group mb-2">
                  <span class="input-group-text d-inline-flex align-items-center">
                    <Hash size="16" />
                  </span>
                  <input
                    type="text"
                    class="form-control"
                    v-model="protocolsInput"
                    placeholder="Например: 1,2,5-10; 12 14-16"
                    :disabled="isBulkCreating"
                    aria-label="Номера протоколов"
                  />
                  <button
                    class="btn btn-outline-primary d-inline-flex align-items-center gap-2 lh-1 bulk-action-btn"
                    :disabled="isBulkCreating || !parsedInputNumbers.length"
                    @click="createAnalysesFromInput"
                  >
                    <Plus size="16" />
                    <span>{{ isBulkCreating ? 'Создание...' : 'Создать введенные' }}</span>
                  </button>
                </div>
                <div class="form-text text-muted mt-1">
                  Указывайте номера через запятую, пробел или точку с запятой. Диапазоны — через тире (например: 12-15).
                </div>
                <div v-if="parsedInputNumbers.length" class="chips mt-2">
                  <span v-for="n in parsedInputNumbers" :key="`chip-${n}`" class="chip">{{ n }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="isLoading" class="loading-state">
        <div class="loading-content">
          <Loader2 class="spinning loading-icon" size="48" />
          <h5 class="loading-title">Загрузка протоколов...</h5>
          <p class="loading-text">Пожалуйста, подождите</p>
        </div>
      </div>
      
      <div v-else-if="availableProtocols.length === 0" class="empty-state">
        <div class="empty-content">
          <FileX class="empty-icon" size="64" />
          <h4 class="empty-title">Нет доступных протоколов</h4>
          <p class="empty-text">Загрузите файлы для создания протоколов</p>
          <router-link to="/impuls-analysis/create" class="btn btn-primary btn-empty">
            <Plus class="me-2" size="16" />
            Создать анализ
          </router-link>
        </div>
      </div>
      
      <div v-else class="protocols-grid">
        <div 
          v-for="protocol in availableProtocols" 
          :key="protocol.protocol_number"
          class="protocol-card"
          :class="{ selected: isSelected(protocol.protocol_number) }"
          @click="toggleSelect(protocol.protocol_number)"
        >
          <div class="protocol-header">
            <div class="protocol-number">
              <span class="protocol-badge">Протокол</span>
              <span class="protocol-id">{{ protocol.protocol_number }}</span>
            </div>
            <div class="protocol-status">
              <span class="status-badge status-ready">
                <CheckCircle class="me-1" size="12" />
                Готов
              </span>
              <!-- Индикатор существующего анализа -->
              <span 
                v-if="protocol.analysis_info && protocol.analysis_info.has_analysis" 
                class="status-badge status-analysis-exists"
                :title="`Анализ уже создан (${protocol.analysis_info.analyses_count} шт.)`"
              >
                <FileCheck class="me-1" size="12" />
                Анализ создан
              </span>
            </div>
          </div>
          
          <div class="protocol-content">
            <div class="data-section">
              <h6 class="data-title">
                <Zap class="me-2" size="16" />
                Данные расчета силы
              </h6>
              <div class="data-grid">
                <div class="data-item">
                  <span class="data-label">Pст:</span>
                  <span class="data-value">{{ formatNumber(protocol.force_data.pct_static) }}%</span>
                </div>
                <div class="data-item">
                  <span class="data-label">Энергия:</span>
                  <span class="data-value">{{ formatNumber(protocol.force_data.energy_j) }} Дж</span>
                </div>
                <div class="data-item">
                  <span class="data-label">Скорость:</span>
                  <span class="data-value">{{ formatNumber(protocol.force_data.velocity_ms) }} м/с</span>
                </div>
                <div class="data-item">
                  <span class="data-label">Сила:</span>
                  <span class="data-value">{{ formatNumber(protocol.force_data.force_n) }} Н</span>
                </div>
              </div>
            </div>
            
            <div class="data-section">
              <h6 class="data-title">
                <Target class="me-2" size="16" />
                Данные плана эксперимента
              </h6>
              <div class="data-grid">
                <div class="data-item">
                  <span class="data-label">Pст:</span>
                  <span class="data-value">{{ formatNumber(protocol.plan_data.p_static) }}%</span>
                </div>
                <div class="data-item">
                  <span class="data-label">L1/L2:</span>
                  <span class="data-value">{{ formatNumber(protocol.plan_data.l1_l2_ratio) }}</span>
                </div>
                <div class="data-item">
                  <span class="data-label">L1:</span>
                  <span class="data-value">{{ formatNumber(protocol.plan_data.l1_m) }} м</span>
                </div>
                <div class="data-item">
                  <span class="data-label">m1:</span>
                  <span class="data-value">{{ formatNumber(protocol.plan_data.m1_kg) }} кг</span>
                </div>
              </div>
            </div>
            
            <!-- Информация о существующем анализе -->
            <div v-if="protocol.analysis_info && protocol.analysis_info.has_analysis" class="analysis-info-section">
              <h6 class="data-title">
                <BarChart3 class="me-2" size="16" />
                Информация об анализе
              </h6>
              <div class="analysis-info-content">
                <div class="analysis-info-item">
                  <span class="analysis-info-label">Количество анализов:</span>
                  <span class="analysis-info-value">{{ protocol.analysis_info.analyses_count }}</span>
                </div>
                <div v-if="protocol.analysis_info.latest_analysis" class="analysis-info-item">
                  <span class="analysis-info-label">Крайний анализ:</span>
                  <span class="analysis-info-value">{{ protocol.analysis_info.latest_analysis.title }}</span>
                </div>
                <div v-if="protocol.analysis_info.latest_analysis" class="analysis-info-item">
                  <span class="analysis-info-label">Статус:</span>
                  <span class="analysis-info-value">
                    <span class="analysis-status-badge" :class="getAnalysisStatusClass(protocol.analysis_info.latest_analysis.status)">
                      {{ getAnalysisStatusLabel(protocol.analysis_info.latest_analysis.status) }}
                    </span>
                  </span>
                </div>
                <div v-if="protocol.analysis_info.latest_analysis" class="analysis-info-item">
                  <span class="analysis-info-label">Создан:</span>
                  <span class="analysis-info-value">{{ formatDate(protocol.analysis_info.latest_analysis.created_at) }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="protocol-actions">
            <button 
              class="btn btn-primary btn-action"
              @click.stop="createAnalysisFromProtocol(protocol)"
              title="Создать анализ"
            >
              <Plus size="16" />
              Создать анализ
            </button>
            <button 
              class="btn btn-primary btn-action btn-details"
              @click.stop="viewProtocolDetails(protocol)"
              title="Подробности"
            >
              <Eye size="16" />
              Подробности
            </button>
          </div>
          <div class="selected-check" v-if="isSelected(protocol.protocol_number)">
            <CheckCircle size="18" />
          </div>
        </div>
      </div>
      
      <!-- Пагинация -->
      <div class="pagination-wrapper" v-if="pagination.totalItems > 0">
        <PaginationComponent
          :current-page="pagination.currentPage"
          :total-pages="pagination.totalPages"
          :total-items="pagination.totalItems"
          :page-size="pagination.pageSize"
          :has-next="pagination.hasNext"
          :has-previous="pagination.hasPrevious"
          :next-page="pagination.nextPage"
          :previous-page="pagination.previousPage"
          @page-change="onPageChange"
          @page-size-change="onPageSizeChange"
        />
      </div>
    </div>
    
    <!-- Модальное окно создания анализа из протокола -->
    <div 
      class="modal fade" 
      id="createAnalysisModal" 
      tabindex="-1" 
      aria-labelledby="createAnalysisModalLabel" 
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content modern-modal">
          <div class="modal-header modern-header">
            <div class="modal-title-section">
              <div class="modal-icon">
                <Plus size="24" />
              </div>
              <div class="modal-title-content">
                <h5 class="modal-title" id="createAnalysisModalLabel">
                  Создать анализ из протокола {{ selectedProtocol?.protocol_number }}
                </h5>
                <p class="modal-subtitle">Заполните данные для создания нового анализа</p>
              </div>
            </div>
            <button type="button" class="btn-close modern-close" data-bs-dismiss="modal" aria-label="Close">
              <X size="20" />
            </button>
          </div>
          <div class="modal-body modern-body">
            <form @submit.prevent="submitCreateAnalysis">
              <div class="form-group">
                <label for="analysisTitle" class="form-label modern-label">Название анализа</label>
                <input
                  type="text"
                  class="form-control modern-input"
                  id="analysisTitle"
                  v-model="newAnalysis.title"
                  required
                  :placeholder="`Анализ протокола ${selectedProtocol?.protocol_number}`"
                />
              </div>
              
              <div class="form-group">
                <label for="analysisDescription" class="form-label modern-label">Описание</label>
                <textarea
                  class="form-control modern-input"
                  id="analysisDescription"
                  v-model="newAnalysis.description"
                  rows="3"
                  placeholder="Описание анализа из протокола"
                ></textarea>
              </div>
              
            </form>
          </div>
          <div class="modal-footer modern-footer">
            <button 
              type="button" 
              class="btn btn-primary modern-btn create-analysis-btn"
              @click="submitCreateAnalysis"
              :disabled="isCreating"
            >
              <Plus size="16" />
              {{ isCreating ? 'Создание...' : 'Создать анализ' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Модальное окно деталей протокола -->
    <div 
      class="modal fade" 
      id="protocolDetailsModal" 
      tabindex="-1" 
      aria-labelledby="protocolDetailsModalLabel" 
      aria-hidden="true"
    >
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content modern-modal">
          <div class="modal-header modern-header">
            <div class="modal-title-section">
              <div class="modal-icon">
                <Eye size="24" />
              </div>
              <div class="modal-title-content">
                <h5 class="modal-title" id="protocolDetailsModalLabel">
                  Детали протокола {{ selectedProtocol?.protocol_number }}
                </h5>
                <p class="modal-subtitle">Подробная информация о протоколе</p>
              </div>
            </div>
            <button type="button" class="btn-close modern-close" data-bs-dismiss="modal" aria-label="Close">
              <X size="20" />
            </button>
          </div>
          <div class="modal-body modern-body">
            <div v-if="selectedProtocol" class="protocol-details-content">
              <div class="details-grid">
                <div class="details-section">
                  <div class="section-header">
                    <div class="section-icon">
                      <Zap size="20" />
                    </div>
                    <h6 class="section-title">Данные расчета силы</h6>
                  </div>
                  <div class="details-list">
                    <div class="detail-item">
                      <span class="detail-label">Pст:</span>
                      <span class="detail-value">{{ formatNumber(selectedProtocol.force_data.pct_static) }}%</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Энергия удара:</span>
                      <span class="detail-value">{{ formatNumber(selectedProtocol.force_data.energy_j) }} Дж</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Скорость удара:</span>
                      <span class="detail-value">{{ formatNumber(selectedProtocol.force_data.velocity_ms) }} м/с</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Сила удара:</span>
                      <span class="detail-value">{{ formatNumber(selectedProtocol.force_data.force_n) }} Н</span>
                    </div>
                  </div>
                </div>
                
                <div class="details-section">
                  <div class="section-header">
                    <div class="section-icon">
                      <Target size="20" />
                    </div>
                    <h6 class="section-title">Данные плана эксперимента</h6>
                  </div>
                  <div class="details-list">
                    <div class="detail-item">
                      <span class="detail-label">Pст:</span>
                      <span class="detail-value">{{ formatNumber(selectedProtocol.plan_data.p_static) }}%</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Pст значение:</span>
                      <span class="detail-value">{{ formatNumber(selectedProtocol.plan_data.p_static_value) }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">L1/L2:</span>
                      <span class="detail-value">{{ formatNumber(selectedProtocol.plan_data.l1_l2_ratio) }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">L1:</span>
                      <span class="detail-value">{{ formatNumber(selectedProtocol.plan_data.l1_m) }} м</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">d1:</span>
                      <span class="detail-value">{{ formatNumber(selectedProtocol.plan_data.d1_m) }} м</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">m1:</span>
                      <span class="detail-value">{{ formatNumber(selectedProtocol.plan_data.m1_kg) }} кг</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">L2:</span>
                      <span class="detail-value">{{ formatNumber(selectedProtocol.plan_data.l2_m) }} м</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">d2:</span>
                      <span class="detail-value">{{ formatNumber(selectedProtocol.plan_data.d2_m) }} м</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Т:</span>
                      <span class="detail-value">{{ formatNumber(selectedProtocol.plan_data.t_s) }} с</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">А:</span>
                      <span class="detail-value">{{ formatNumber(selectedProtocol.plan_data.a_j) }} Дж</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">V:</span>
                      <span class="detail-value">{{ formatNumber(selectedProtocol.plan_data.v_ms) }} м/с</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">С1,2:</span>
                      <span class="detail-value">{{ formatNumber(selectedProtocol.plan_data.c12_kg_s) }} кг/с</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Р:</span>
                      <span class="detail-value">{{ formatNumber(selectedProtocol.plan_data.p_n) }} Н</span>
                    </div>
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
import { impulsAnalysisAPI } from './js/impuls-analysis.js'
import PaginationComponent from './components/PaginationComponent.vue'
import SortComponent from './components/SortComponent.vue'
import { useToast } from 'vue-toastification'
import { Modal } from 'bootstrap'
import { 
  Plus, FileCheck, CheckCircle, Loader2, Clock, Hash,
  FileX, Eye, Info, Zap, Target, X, BarChart3 
} from 'lucide-vue-next'

const toast = useToast()

export default {
  components: {
    PaginationComponent,
    SortComponent,
    Plus,
    CheckCircle,
    FileCheck,
    Loader2,
    Clock,
    FileX,
    Eye,
    Info,
    Zap,
    Target,
    X,
    Hash,
    BarChart3
  },
  name: 'ProtocolsPage',
  data() {
    return {
      availableProtocols: [],
      isLoading: false,
      selectedProtocol: null,
      selectedProtocols: new Set(),
      newAnalysis: {
        title: '',
        description: ''
      },
      isCreating: false,
      isBulkCreating: false,
      protocolsInput: '',
      stats: {
        total: 0,
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        cancelled: 0
      },
      // Пагинация
      pagination: {
        currentPage: 1,
        pageSize: 5,
        totalPages: 0,
        totalItems: 0,
        hasNext: false,
        hasPrevious: false,
        nextPage: null,
        previousPage: null
      },
      // Сортировка
      sort: {
        field: 'protocol_number',
        direction: 'asc'
      }
    }
  },
  computed: {
    completedAnalyses() {
      return this.stats.completed || 0
    },
    processingAnalyses() {
      return this.stats.processing || 0
    },
    pendingAnalyses() {
      return this.stats.pending || 0
    },
    selectedCount() {
      return this.selectedProtocols.size
    },
    parsedInputNumbers() {
      return this.parseProtocolNumbers(this.protocolsInput)
    }
  },
  async mounted() {
    await Promise.all([
      this.loadAvailableProtocols(),
      this.loadStats()
    ])
  },
  methods: {
    getPercentage(value) {
      const total = this.completedAnalyses + this.processingAnalyses + this.pendingAnalyses
      if (!total || total === 0) return 0
      return Math.round((value / total) * 100)
    },
    
    // Умное форматирование чисел - показывает только значимые цифры после запятой
    formatNumber(value) {
      if (value === null || value === undefined || value === '') {
        return '—'
      }
      
      const num = parseFloat(value)
      if (isNaN(num)) {
        return '—'
      }
      
      // Если число целое, возвращаем как есть
      if (Number.isInteger(num)) {
        return num.toString()
      }
      
      // Для дробных чисел находим количество значимых цифр после запятой
      const str = num.toString()
      const decimalIndex = str.indexOf('.')
      
      if (decimalIndex === -1) {
        return str
      }
      
      const decimalPart = str.substring(decimalIndex + 1)
      
      // Если после запятой только нули, возвращаем целое число
      if (decimalPart.match(/^0+$/)) {
        return Math.floor(num).toString()
      }
      
      // Находим первую ненулевую цифру после запятой
      const firstNonZeroIndex = decimalPart.search(/[1-9]/)
      
      if (firstNonZeroIndex === -1) {
        return Math.floor(num).toString()
      }
      
      // Показываем максимум 2 значащие цифры после запятой
      const significantDigits = Math.min(2, decimalPart.length - firstNonZeroIndex)
      const precision = firstNonZeroIndex + significantDigits
      
      return num.toFixed(precision)
    },
    
    async loadAvailableProtocols() {
      this.isLoading = true
      try {
        const params = {
          page: this.pagination.currentPage,
          page_size: this.pagination.pageSize,
          sort_field: this.sort.field,
          sort_direction: this.sort.direction
        }
        
        const response = await impulsAnalysisAPI.getAvailableProtocols(params)
        if (response && response.success) {
          this.availableProtocols = response.data.protocols || []
          
          // Обновляем информацию о пагинации
          this.pagination = {
            currentPage: response.data.page || 1,
            pageSize: response.data.page_size || 5,
            totalPages: response.data.total_pages || 0,
            totalItems: response.data.count || 0,
            hasNext: response.data.has_next || false,
            hasPrevious: response.data.has_previous || false,
            nextPage: response.data.next_page || null,
            previousPage: response.data.previous_page || null
          }
        }
      } catch (error) {
        console.error('Error loading available protocols:', error)
        toast.error('Ошибка при загрузке протоколов')
      } finally {
        this.isLoading = false
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
    
    async refreshProtocols() {
      await Promise.all([
        this.loadAvailableProtocols(),
        this.loadStats()
      ])
    },
    
    createAnalysisFromProtocol(protocol) {
      this.selectedProtocol = protocol
      this.newAnalysis.title = `Анализ протокола ${protocol.protocol_number}`
      this.newAnalysis.description = ''
      
      // Показываем модальное окно
      this.$nextTick(() => {
        const modalElement = document.getElementById('createAnalysisModal')
        if (modalElement) {
          const modal = new Modal(modalElement)
          modal.show()
        }
      })
    },
    toggleSelect(protocolNumber) {
      if (this.selectedProtocols.has(protocolNumber)) {
        this.selectedProtocols.delete(protocolNumber)
      } else {
        this.selectedProtocols.add(protocolNumber)
      }
      // force update since Set is not reactive by default in Vue2 options API
      this.selectedProtocols = new Set(this.selectedProtocols)
    },
    isSelected(protocolNumber) {
      return this.selectedProtocols.has(protocolNumber)
    },
    clearSelection() {
      this.selectedProtocols = new Set()
    },
    parseProtocolNumbers(input) {
      if (!input) return []
      const parts = input.split(/[,;\s]+/).filter(Boolean)
      const numbers = new Set()
      for (const part of parts) {
        if (/^\d+-\d+$/.test(part)) {
          const [start, end] = part.split('-').map(n => parseInt(n, 10))
          if (!isNaN(start) && !isNaN(end)) {
            const [from, to] = start <= end ? [start, end] : [end, start]
            for (let i = from; i <= to; i++) numbers.add(i)
          }
        } else {
          const n = parseInt(part, 10)
          if (!isNaN(n)) numbers.add(n)
        }
      }
      return Array.from(numbers)
    },
    async createAnalysesForSelected() {
      const list = Array.from(this.selectedProtocols)
      if (!list.length) return
      this.isBulkCreating = true
      let successCount = 0
      let errorCount = 0
      try {
        for (const protocolNumber of list) {
          const title = `Анализ протокола ${protocolNumber}`
          const description = ''
          const response = await impulsAnalysisAPI.createFromProtocol(protocolNumber, title, description)
          if (!response || !response.success) {
            errorCount++
            toast.error(`Протокол ${protocolNumber}: ${response?.message || 'Неизвестная ошибка'}`)
          } else {
            successCount++
          }
        }
        
        if (successCount > 0) {
          toast.success(`Успешно создано ${successCount} из ${list.length} анализов`)
        }
        if (errorCount > 0) {
          toast.warning(`Не удалось создать ${errorCount} из ${list.length} анализов`)
        }
        
        this.clearSelection()
        await this.loadStats()
      } catch (error) {
        console.error('Ошибка при массовом создании анализов:', error)
        toast.error('Ошибка при массовом создании анализов')
      } finally {
        this.isBulkCreating = false
      }
    },
    async createAnalysesFromInput() {
      const list = this.parsedInputNumbers
      if (!list.length) return
      this.isBulkCreating = true
      let successCount = 0
      let errorCount = 0
      try {
        for (const protocolNumber of list) {
          const title = `Анализ протокола ${protocolNumber}`
          const description = ''
          const response = await impulsAnalysisAPI.createFromProtocol(protocolNumber, title, description)
          if (!response || !response.success) {
            errorCount++
            toast.error(`Протокол ${protocolNumber}: ${response?.message || 'Неизвестная ошибка'}`)
          } else {
            successCount++
          }
        }
        
        if (successCount > 0) {
          toast.success(`Успешно создано ${successCount} из ${list.length} анализов`)
        }
        if (errorCount > 0) {
          toast.warning(`Не удалось создать ${errorCount} из ${list.length} анализов`)
        }
        
        this.protocolsInput = ''
        await this.loadStats()
      } catch (error) {
        console.error('Ошибка при создании по номерам:', error)
        toast.error('Ошибка при создании по номерам')
      } finally {
        this.isBulkCreating = false
      }
    },
    
    async submitCreateAnalysis() {
      if (!this.selectedProtocol) return
      
      this.isCreating = true
      try {
        const response = await impulsAnalysisAPI.createFromProtocol(
          this.selectedProtocol.protocol_number,
          this.newAnalysis.title,
          this.newAnalysis.description
        )
        
        if (response && response.success) {
          toast.success('Анализ создан из протокола успешно!')
          
          // Закрываем модальное окно
          const modalElement = document.getElementById('createAnalysisModal')
          if (modalElement) {
            const modal = Modal.getInstance(modalElement)
            if (modal) modal.hide()
          }
          
          // Переходим к созданному анализу
          this.$router.push(`/impuls-analysis/analysis/${response.data.id}`)
        } else {
          toast.error(`Протокол ${this.selectedProtocol.protocol_number}: ${response?.message || 'Неизвестная ошибка'}`)
        }
      } catch (error) {
        console.error('Ошибка при создании анализа из протокола:', error)
        let errorMessage = 'Ошибка при создании анализа из протокола'
        if (error && typeof error === 'object') {
          errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || errorMessage
        }
        toast.error(`Протокол ${this.selectedProtocol.protocol_number}: ${errorMessage}`)
      } finally {
        this.isCreating = false
      }
    },
    
    viewProtocolDetails(protocol) {
      this.selectedProtocol = protocol
      
      // Показываем модальное окно
      this.$nextTick(() => {
        const modalElement = document.getElementById('protocolDetailsModal')
        if (modalElement) {
          const modal = new Modal(modalElement)
          modal.show()
        }
      })
    },
    
    // Методы пагинации
    onPageChange(page) {
      this.pagination.currentPage = page
      this.loadAvailableProtocols()
    },
    
    onPageSizeChange(newPageSize) {
      this.pagination.pageSize = newPageSize
      this.pagination.currentPage = 1 // Сбрасываем на первую страницу
      this.loadAvailableProtocols()
    },
    
    // Методы сортировки
    onSortChange(newSort) {
      this.sort = { ...newSort }
      this.pagination.currentPage = 1 // Сбрасываем на первую страницу при изменении сортировки
      this.loadAvailableProtocols()
    },
    
    // Методы для работы со статусами анализов
    getAnalysisStatusLabel(status) {
      const labels = {
        'pending': 'Ожидает',
        'processing': 'Обрабатывается',
        'completed': 'Завершен',
        'failed': 'Ошибка',
        'cancelled': 'Отменен'
      }
      return labels[status] || status
    },
    
    getAnalysisStatusClass(status) {
      const classes = {
        'pending': 'status-pending',
        'processing': 'status-processing',
        'completed': 'status-completed',
        'failed': 'status-failed',
        'cancelled': 'status-cancelled'
      }
      return classes[status] || 'status-pending'
    },
    
    formatDate(dateString) {
      if (!dateString) return '—'
      const date = new Date(dateString)
      return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }
}
</script>

<style scoped lang="scss">
.protocols-page {
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
  
}

// Информационная панель
.info-panel {
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  border-left: 4px solid #17a2b8;
  
  .info-content {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    
    .info-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #17a2b8, #138496);
      color: white;
      flex-shrink: 0;
    }
    
    .info-text {
      flex: 1;
      
      .info-title {
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--bs-heading-color);
        margin: 0 0 0.5rem 0;
      }
      
      .info-description {
        color: var(--bs-secondary-color);
        margin: 0;
        line-height: 1.6;
      }
    }
  }
}

// Секция статистики
.stats-section {
  margin-bottom: 2rem;
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
  }
}

// Карточки статистики
.stat-card {
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: var(--card-color);
  }
}

// Цвета карточек статистики
.stat-available {
  --card-color: #6c757d;
}

.stat-completed {
  --card-color: #28a745;
}

.stat-processing {
  --card-color: #17a2b8;
}

.stat-pending {
  --card-color: #ffc107;
}

// Иконки статистики
.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 1rem;
  background: var(--card-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

// Контент статистики
.stat-content {
  margin-bottom: 1rem;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 0.5rem;
  color: var(--bs-heading-color);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--bs-secondary-color);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

// Прогресс-бар
.stat-progress {
  height: 4px;
  background: var(--bs-gray-200);
  border-radius: 2px;
  overflow: hidden;
  
  .progress-bar {
    height: 100%;
    background: var(--card-color);
    border-radius: 2px;
    transition: width 0.3s ease;
  }
}

// Секция протоколов
.protocols-section {
  .section-header {
    margin-bottom: 2rem;
    
    .section-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--bs-heading-color);
      margin: 0 0 0.5rem 0;
    }
    
    .section-subtitle {
      color: var(--bs-secondary-color);
      margin: 0 0 1.5rem 0;
      font-size: 1rem;
    }
  }
  
  .pagination-wrapper {
    margin-top: 2rem;
    width: 100%;
    
    // Адаптивность для мобильных устройств
    @media (max-width: 768px) {
      margin-top: 1.5rem;
    }
    
    @media (max-width: 576px) {
      margin-top: 1rem;
    }
  }
}

// Состояния загрузки и пустого списка
.loading-state,
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  
  .loading-content,
  .empty-content {
    text-align: center;
    
    .loading-icon,
    .empty-icon {
      color: var(--bs-gray-400);
      margin-bottom: 1.5rem;
    }
    
    .loading-title,
    .empty-title {
      color: var(--bs-heading-color);
      margin-bottom: 0.5rem;
      font-weight: 600;
    }
    
    .loading-text,
    .empty-text {
      color: var(--bs-secondary-color);
      margin-bottom: 1.5rem;
    }
    
    .btn-empty {
      border-radius: 10px;
      font-weight: 600;
      padding: 0.75rem 1.5rem;
    }
  }
}

// Сетка протоколов
.protocols-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 2rem;
}

// Карточки протоколов
.protocol-card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  }

  &.selected {
    outline: 3px solid #0d6efd;
  }
}

// Заголовок протокола
.protocol-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: var(--bs-light);
  border-bottom: 1px solid var(--bs-border-color);
  
  .protocol-number {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    .protocol-badge {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--bs-secondary-color);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .protocol-id {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--bs-primary);
    }
  }
  
  .protocol-status {
    .status-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.375rem 0.75rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      
      &.status-ready {
        background: rgba(40, 167, 69, 0.1);
        color: #28a745;
        border: 1px solid rgba(40, 167, 69, 0.2);
      }
      
      &.status-analysis-exists {
        background: rgba(13, 110, 253, 0.1);
        color: #0d6efd;
        border: 1px solid rgba(13, 110, 253, 0.2);
        margin-left: 0.5rem;
      }
    }
  }
}

.selected-check {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #0d6efd;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(13, 110, 253, 0.4);
}

// Контент протокола
.protocol-content {
  padding: 1.5rem;
  
  .data-section {
    margin-bottom: 1.5rem;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .data-title {
      display: flex;
      align-items: center;
      font-size: 1rem;
      font-weight: 600;
      color: var(--bs-heading-color);
      margin-bottom: 1rem;
    }
    
    .data-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      
      .data-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem;
        background: var(--bs-gray-100);
        border-radius: 8px;
        
        .data-label {
          font-size: 0.875rem;
          color: var(--bs-secondary-color);
          font-weight: 500;
        }
        
        .data-value {
          font-weight: 600;
          color: var(--bs-heading-color);
        }
      }
    }
  }
  
  // Секция информации об анализе
  .analysis-info-section {
    margin-top: 1.5rem;
    padding: 1rem;
    background: rgba(13, 110, 253, 0.05);
    border-radius: 8px;
    border: 1px solid rgba(13, 110, 253, 0.1);
    
    .analysis-info-content {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      
      .analysis-info-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 0.75rem;
        background: white;
        border-radius: 6px;
        border: 1px solid rgba(13, 110, 253, 0.1);
        
        .analysis-info-label {
          font-size: 0.875rem;
          color: var(--bs-secondary-color);
          font-weight: 500;
        }
        
        .analysis-info-value {
          font-weight: 600;
          color: var(--bs-heading-color);
          font-size: 0.875rem;
          
          .analysis-status-badge {
            display: inline-block;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            
            &.status-pending {
              background: rgba(108, 117, 125, 0.1);
              color: #6c757d;
              border: 1px solid rgba(108, 117, 125, 0.2);
            }
            
            &.status-processing {
              background: rgba(23, 162, 184, 0.1);
              color: #17a2b8;
              border: 1px solid rgba(23, 162, 184, 0.2);
            }
            
            &.status-completed {
              background: rgba(40, 167, 69, 0.1);
              color: #28a745;
              border: 1px solid rgba(40, 167, 69, 0.2);
            }
            
            &.status-failed {
              background: rgba(220, 53, 69, 0.1);
              color: #dc3545;
              border: 1px solid rgba(220, 53, 69, 0.2);
            }
            
            &.status-cancelled {
              background: rgba(255, 193, 7, 0.1);
              color: #ffc107;
              border: 1px solid rgba(255, 193, 7, 0.2);
            }
          }
        }
      }
    }
  }
}

// Действия протокола
.protocol-actions {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--bs-light);
  border-top: 1px solid var(--bs-border-color);
  
  .btn-action {
    flex: 1;
    border-radius: 8px;
    font-weight: 600;
    padding: 0.75rem 1rem;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }
    
    // Специальные стили для кнопки "Подробности"
    &.btn-details {
      background: linear-gradient(135deg, #007bff, #0056b3);
      border: none;
      color: white;
      
      &:hover {
        background: linear-gradient(135deg, #0056b3, #004085);
        color: white;
        box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
      }
      
      &:focus {
        background: linear-gradient(135deg, #0056b3, #004085);
        color: white;
        box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
      }
    }
    
    // Исправляем центрирование иконок
    svg {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
  }
}

// Единый класс для центрирования контента кнопок групповых действий
.bulk-action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  line-height: 1;
  min-width: 200px;
  height: 38px;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  padding-left: 0.75rem;
  padding-right: 0.75rem;
  svg {
    display: block;
    transform: translateY(1px);
  }
  span {
    display: inline-block;
    line-height: 1;
    transform: translateY(-1px);
  }
}

// Анимации
.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

// Адаптивность
@media (max-width: 768px) {
  .protocols-page {
    padding: 1rem;
  }
  
  .page-header {
    padding: 1.5rem;
    
    .header-content {
      flex: 1;
    }
    
    .page-title-section {
      flex-direction: column;
      gap: 1rem;
      
      .page-title h1 {
        font-size: 1.5rem;
      }
    }
    
    .header-actions {
      flex-direction: column;
      gap: 0.75rem;
      
      .btn {
        width: 100%;
      }
    }
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .protocols-grid {
    grid-template-columns: 1fr;
  }
  
  .protocol-content {
    .data-grid {
      grid-template-columns: 1fr;
    }
  }
  
  .protocol-actions {
    flex-direction: column;
  }
}

@media (max-width: 576px) {
  .page-header {
    flex-direction: column;
    gap: 1rem;
    
    .page-title-section {
      .page-title h1 {
        font-size: 1.5rem;
      }
    }
  }
  
  .stat-card {
    padding: 1rem;
  }
  
  .stat-number {
    font-size: 2rem;
  }
  
  .stat-icon {
    width: 40px;
    height: 40px;
  }
}

// Стили модальных окон
.modern-modal {
  border: none;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.modern-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  padding: 2rem;
  
  .modal-title-section {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex: 1;
    
    .modal-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      color: white;
    }
    
    .modal-title-content {
      flex: 1;
      
      .modal-title {
        color: white;
        font-size: 1.5rem;
        font-weight: 700;
        margin: 0 0 0.25rem 0;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      
      .modal-subtitle {
        color: rgba(255, 255, 255, 0.9);
        margin: 0;
        font-size: 0.875rem;
      }
    }
  }
  
  .modern-close {
    background: rgba(255, 255, 255, 0.2) !important;
    border: none !important;
    border-radius: 8px;
    width: 36px !important;
    height: 36px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    color: white !important;
    opacity: 1 !important;
    transition: all 0.2s ease;
    padding: 0 !important;
    margin: 0 !important;
    
    &:hover {
      background: rgba(255, 255, 255, 0.3) !important;
      transform: scale(1.1);
    }
    
    // Стили для SVG иконки
    svg {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      flex-shrink: 0 !important;
    }
    
    // Убираем стандартные стили Bootstrap
    &::before,
    &::after {
      display: none !important;
    }
  }
}

.modern-body {
  padding: 2rem;
  
  .form-group {
    margin-bottom: 1.5rem;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .modern-label {
      display: block;
      font-weight: 600;
      color: var(--bs-heading-color);
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .modern-input {
      border: 2px solid var(--bs-gray-200);
      border-radius: 10px;
      padding: 0.75rem 1rem;
      font-size: 1rem;
      transition: all 0.2s ease;
      
      &:focus {
        border-color: #667eea;
        box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
        outline: none;
      }
      
      &::placeholder {
        color: var(--bs-gray-600);
        opacity: 1;
      }
    }
  }
}

.modern-footer {
  background: var(--bs-light);
  border: none;
  padding: 1.5rem 2rem;
  display: flex;
  gap: 1rem;
  justify-content: center;
  
  .modern-btn {
    border-radius: 10px;
    font-weight: 600;
    padding: 0.75rem 1.5rem;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }
    
    // Специальные стили для кнопки создания анализа
    &.create-analysis-btn {
      svg {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
    }
  }
}

// Детали протокола в модальном окне
.protocol-details-content {
  .details-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }
  
  .details-section {
    .section-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
      padding-bottom: 0.75rem;
      border-bottom: 2px solid var(--bs-gray-200);
      
      .section-icon {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
      }
      
      .section-title {
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--bs-heading-color);
        margin: 0;
      }
    }
    
    .details-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      
      .detail-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background: var(--bs-gray-100);
        border-radius: 10px;
        transition: all 0.2s ease;
        
        &:hover {
          background: var(--bs-gray-200);
          transform: translateX(4px);
        }
        
        .detail-label {
          font-size: 0.875rem;
          color: var(--bs-secondary-color);
          font-weight: 500;
        }
        
        .detail-value {
          font-weight: 600;
          color: var(--bs-heading-color);
          font-size: 0.875rem;
        }
      }
    }
  }
}

// Адаптивность модальных окон
@media (max-width: 768px) {
  .modern-header {
    padding: 1.5rem;
    
    .modal-title-section {
      flex-direction: column;
      text-align: center;
      gap: 0.75rem;
    }
  }
  
  .modern-body {
    padding: 1.5rem;
  }
  
  .modern-footer {
    padding: 1rem 1.5rem;
    flex-direction: column;
    
    .modern-btn {
      width: 100%;
    }
  }
  
  .protocol-details-content {
    .details-grid {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
  }
}

// Панель групповых действий (улучшенный UI)
.bulk-actions {
  .bulk-card {
    background: white;
    border-radius: 12px;
    border: 1px solid var(--bs-border-color);
    padding: 1rem;
    box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  }

  .bulk-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;
  }

  .bulk-title {
    font-weight: 600;
    color: var(--bs-heading-color);
  }

  .bulk-counters {
    display: flex;
    gap: 0.5rem;
    .badge {
      font-weight: 600;
      border: 1px solid var(--bs-border-color);
    }
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .chip {
    background: var(--bs-light);
    border: 1px solid var(--bs-border-color);
    border-radius: 999px;
    padding: 0.25rem 0.6rem;
    font-size: 0.85rem;
    color: var(--bs-heading-color);
  }
}
</style>


