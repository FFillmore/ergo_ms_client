<template>
  <div class="porosity-analyses-list">
    <!-- Заголовок страницы -->
    <PageHeader
      title="Мои анализы пористости"
      subtitle="Управление, перезапуск, скачивание результатов и отчетов"
      :icon="microscopeIcon"
    >
      <template #actions>
        <div class="dropdown d-inline-block">
          <button
            type="button"
            class="btn btn-danger d-inline-flex align-items-center dropdown-toggle"
            data-bs-toggle="dropdown"
            data-bs-display="static"
            aria-expanded="false"
            title="Выделить карточки по статусу"
          >
            <Clock class="me-1" size="16" /> Выделить по статусу
          </button>
          <ul class="dropdown-menu dropdown-menu-end">
            <li v-for="status in statusOptions" :key="status.value">
              <a 
                class="dropdown-item" 
                :class="{ 'status-selected': selectedStatus === status.value }" 
                href="#" 
                @click.prevent="selectByStatus(status.value)"
              >
                <component :is="status.icon" class="me-2" size="16" /> 
                {{ status.label }}
              </a>
            </li>
            <li><hr class="dropdown-divider"></li>
            <li>
              <a class="dropdown-item" href="#" @click.prevent="clearSelection()">
                <Trash2 class="me-2" size="16" /> Снять выделение
              </a>
            </li>
          </ul>
        </div>
      </template>
    </PageHeader>

    <!-- Модальные окна -->
    <ConfirmDialog
      :show="showDeleteConfirm"
      title="Удаление анализа"
      message="Вы уверены, что хотите удалить этот анализ? Это действие нельзя отменить."
      confirm-text="Удалить"
      cancel-text="Отмена"
      variant="danger"
      @confirm="confirmDeleteAnalysis"
      @cancel="cancelDeleteAnalysis"
      @close="cancelDeleteAnalysis"
    />

    <ConfirmDialog
      :show="showBulkDeleteConfirm"
      title="Массовое удаление анализов"
      :message="bulkDeleteMessage"
      confirm-text="Удалить выбранные"
      cancel-text="Отмена"
      variant="danger"
      @confirm="confirmBulkDelete"
      @cancel="cancelBulkDelete"
      @close="cancelBulkDelete"
    />

    <ConfirmDialog
      :show="showDeleteGroupConfirm"
      title="Удаление группы"
      :message="deleteGroupMessage"
      confirm-text="Удалить группу"
      cancel-text="Отмена"
      variant="danger"
      @confirm="confirmDeleteGroup"
      @close="cancelDeleteGroup"
    />

    <ConfirmDialog
      :show="showDeleteArchiveConfirm"
      title="Удаление архива"
      :message="deleteArchiveMessage"
      confirm-text="Удалить архив"
      cancel-text="Отмена"
      variant="danger"
      @confirm="confirmDeleteArchive"
      @cancel="cancelDeleteArchive"
      @close="cancelDeleteArchive"
    />
    
    <div class="row">
      <div class="col-12">
        <!-- Управление группами -->
        <CollapsibleCard
          title="Управление группами"
          :badge-text="`${groups?.length || 0} групп`"
          badge-class="bg-primary"
          :icon="hashIcon"
          card-class="group-management-card"
          :default-collapsed="groupManagementCollapsed"
          @toggle="groupManagementCollapsed = $event"
        >
          <GroupManagementBlock
            :groups="groups"
            :group-manager="groupManager"
            @group-select="onGroupSelect"
            @select-all-by-group="selectAllByGroup"
            @ungroup-all-in-selected="ungroupAllInSelected"
            @create-group="createGroup"
            @rename-selected-group="renameSelectedGroup"
            @request-delete-group="requestDeleteGroup"
          />
        </CollapsibleCard>

        <!-- Управление анализами -->
        <CollapsibleCard
          title="Управление анализами"
          :badge-text="`${filteredAnalyses?.length || 0} анализов`"
          badge-class="bg-success"
          :icon="microscopeIcon"
          card-class="analysis-management-card"
          :default-collapsed="analysisManagementCollapsed"
          @toggle="analysisManagementCollapsed = $event"
        >
          <AnalysisManagementBlock
            :selected-ids="selectedIds"
            :number-input="restartInput"
            :bulk-delete-input="bulkInput"
            :restarting-multiple="restartingMultiple"
            :bulk-deleting="bulkDeleting"
            @update:numberInput="restartInput = $event"
            @update:bulkDeleteInput="bulkInput = $event"
            @restart-multiple-by-numbers="restartByInput"
            @restart-selected-multiple="restartSelected"
            @preview-bulk-delete="requestBulkDeleteByInput"
            @preview-bulk-delete-selected="requestBulkDeleteSelected"
          />
        </CollapsibleCard>

        <!-- Управление скачиванием результатов анализов -->
        <CollapsibleCard
          title="Управление скачиванием результатов анализов"
          :badge-text="`${archives?.length || 0} архивов`"
          badge-class="bg-info"
          :icon="downloadIcon"
          card-class="download-management-card"
          :default-collapsed="downloadManagementCollapsed"
          @toggle="downloadManagementCollapsed = $event"
        >
          <DownloadManagementBlock
            :selected-ids="selectedIds"
            :selected-analyses="selectedAnalyses"
            :groups="groups"
            :archives="archives"
            :loading-archives="loadingArchives"
            :creating-archive="creatingArchive"
            :downloading-archive="downloadingArchive"
            :deleting-archive="deletingArchive"
            @create-archive="createArchive"
            @download-archive="downloadArchive"
            @delete-archive="requestDeleteArchive"
            @status-filter-change="onStatusFilterChange"
            @group-filter-change="onGroupFilterChange"
            @select-by-filters="selectByFilters"
            @clear-filters="clearFilters"
            @remove-from-selection="removeFromSelection"
            @clear-selection="clearSelection"
          />
        </CollapsibleCard>

        <!-- Фильтры и поиск -->
        <FilterBar
          v-model:search="search"
          v-model:status="currentFilter"
          v-model:groupId="currentGroupId"
          v-model:ordering="ordering"
          v-model:pageSize="pagination.page_size"
          :groups="groups"
          @reset="resetFilters"
        />

        <!-- Статистические карточки -->
        <StatisticsCards :stats="stats" />

        <!-- Загрузка -->
        <div v-if="loading" class="text-center py-4">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Загрузка...</span>
          </div>
        </div>
        
        <!-- Пустое состояние -->
        <div v-else-if="!filteredAnalyses || filteredAnalyses.length === 0" class="text-center py-4">
          <Inbox class="text-muted mb-3" size="48" />
          <h5 class="text-muted">Анализы не найдены</h5>
          <p class="text-muted">Попробуйте изменить параметры фильтрации/сортировки или создайте новый анализ</p>
        </div>

        <!-- Список анализов -->
        <div v-else class="analyses-grid">
          <AnalysisCard
            v-for="analysis in paginatedAnalyses"
            :key="analysis.id"
            :analysis="analysis"
            :is-selected="selectedIds.includes(analysis.id)"
            @toggle-selection="toggleSelection"
            @download-report="downloadReport"
            @download-pdf="downloadPDF"
            @download-word="downloadWord"
            @download-original="downloadOriginal"
            @restart-analysis="restartAnalysis"
            @delete-analysis="requestDeleteAnalysis"
          />
        </div>

        <!-- Пагинация -->
        <Pagination
          :current-page="pagination.page"
          :total-pages="totalPages"
          :total-items="totalItems"
          :items-per-page="pagination.page_size"
          @page-change="changePage"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { porosityAnalysisAPI } from './js/porosity-analysis.js'
import { useToast } from 'vue-toastification'
import { 
  Microscope, Clock, Loader2, CheckCircle, AlertTriangle, Trash2, 
  Hash, Download, Inbox 
} from 'lucide-vue-next'

// Компоненты
import PageHeader from './components/PageHeader.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import CollapsibleCard from './components/CollapsibleCard.vue'
import GroupManagementBlock from './components/GroupManagementBlock.vue'
import AnalysisManagementBlock from './components/AnalysisManagementBlock.vue'
import DownloadManagementBlock from './components/DownloadManagementBlock.vue'
import FilterBar from './components/FilterBar.vue'
import StatisticsCards from './components/StatisticsCards.vue'
import AnalysisCard from './components/AnalysisCard.vue'
import Pagination from './components/Pagination.vue'

// Утилиты
import { formatDate, getStatusText } from './js/utils.js'

const toast = useToast()

export default {
  name: 'PorosityAnalysisListOptimized',
  components: {
    Microscope,
    Clock,
    Loader2,
    CheckCircle,
    AlertTriangle,
    Trash2,
    Hash,
    Download,
    Inbox,
    PageHeader,
    ConfirmDialog,
    CollapsibleCard,
    GroupManagementBlock,
    AnalysisManagementBlock,
    DownloadManagementBlock,
    FilterBar,
    StatisticsCards,
    AnalysisCard,
    Pagination
  },
  data() {
    return {
      // Данные
      analyses: [],
      groups: [],
      archives: [],
      loading: false,
      
      // Фильтры и поиск
      search: '',
      currentFilter: 'all',
      currentGroupId: null,
      ordering: '-created_at',
      
      // Пагинация
      pagination: {
        page: 1,
        page_size: 10,
        total: 0
      },
      
      // Выбор
      selectedIds: [],
      selectedStatus: null,
      
      // Состояния загрузки
      restartingMultiple: false,
      bulkDeleting: false,
      downloadingArchive: false,
      deletingAnalysis: null,
      loadingArchives: false,
      creatingArchive: false,
      deletingArchive: null,
      
      // Модальные окна
      showDeleteConfirm: false,
      showBulkDeleteConfirm: false,
      showDeleteGroupConfirm: false,
      showDeleteArchiveConfirm: false,
      bulkDeleteMessage: '',
      deleteGroupMessage: '',
      deleteArchiveMessage: '',
      deletingArchive: null,
      
      // Сворачиваемые блоки
      groupManagementCollapsed: true,
      analysisManagementCollapsed: true,
      downloadManagementCollapsed: true,
      
      // Управление группами
      groupManager: {
        selectedId: null,
        name: ''
      },
      
      // Входные данные для массовых операций
      restartInput: '',
      bulkInput: '',
      
      // Статистика
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
    },
    hashIcon() {
      return Hash
    },
    downloadIcon() {
      return Download
    },
    statusOptions() {
      return [
        { value: 'pending', label: 'Ожидает', icon: Clock },
        { value: 'processing', label: 'Обрабатывается', icon: Loader2 },
        { value: 'completed', label: 'Завершен', icon: CheckCircle },
        { value: 'failed', label: 'Ошибка', icon: AlertTriangle }
      ]
    },
    filteredAnalyses() {
      let filtered = [...this.analyses]
      
      // Поиск
      if (this.search) {
        const searchLower = this.search.toLowerCase()
        filtered = filtered.filter(analysis => 
          analysis.name?.toLowerCase().includes(searchLower) ||
          analysis.description?.toLowerCase().includes(searchLower)
        )
      }
      
      // Фильтр по статусу
      if (this.currentFilter !== 'all') {
        filtered = filtered.filter(analysis => analysis.status === this.currentFilter)
      }
      
      // Фильтр по группе
      if (this.currentGroupId !== null) {
        if (this.currentGroupId === 0) {
          filtered = filtered.filter(analysis => !analysis.group)
        } else {
          filtered = filtered.filter(analysis => analysis.group?.id === this.currentGroupId)
        }
      }
      
      // Сортировка
      filtered.sort((a, b) => {
        const [field, direction] = this.ordering.startsWith('-') 
          ? [this.ordering.slice(1), -1] 
          : [this.ordering, 1]
        
        let aVal = a[field]
        let bVal = b[field]
        
        if (field === 'group') {
          aVal = a.group?.name || ''
          bVal = b.group?.name || ''
        }
        
        if (aVal < bVal) return -1 * direction
        if (aVal > bVal) return 1 * direction
        return 0
      })
      
      return filtered
    },
    paginatedAnalyses() {
      const start = (this.pagination.page - 1) * this.pagination.page_size
      const end = start + this.pagination.page_size
      return this.filteredAnalyses.slice(start, end)
    },
    totalPages() {
      return Math.ceil(this.filteredAnalyses.length / this.pagination.page_size)
    },
    totalItems() {
      return this.filteredAnalyses.length
    },
    selectedAnalyses() {
      return this.analyses.filter(analysis => this.selectedIds.includes(analysis.id))
    }
  },
  async mounted() {
    await this.loadData()
  },
  methods: {
    // Загрузка данных
    async loadData() {
      this.loading = true
      try {
        await Promise.all([
          this.loadAnalyses(),
          this.loadGroups(),
          this.loadStats(),
          this.loadArchives()
        ])
      } finally {
        this.loading = false
      }
    },
    
    async loadAnalyses() {
      try {
        const response = await porosityAnalysisAPI.getAnalyses({
          page: this.pagination.page,
          page_size: this.pagination.page_size,
          ordering: this.ordering,
          status: this.currentFilter !== 'all' ? this.currentFilter : undefined,
          group: this.currentGroupId
        })
        
        if (response && response.success) {
          // Проверяем формат данных - массив или объект с пагинацией
          if (Array.isArray(response.data)) {
            // API возвращает массив напрямую
            this.analyses = response.data
            this.pagination.total = response.data.length
          } else if (response.data && response.data.results) {
            // API возвращает объект с пагинацией
            this.analyses = response.data.results || []
            this.pagination.total = response.data.count || 0
          } else {
            this.analyses = []
            this.pagination.total = 0
          }
        } else {
          this.analyses = []
          this.pagination.total = 0
        }
      } catch (error) {
        console.error('Ошибка загрузки анализов:', error)
        toast.error('Не удалось загрузить анализы')
        this.analyses = []
        this.pagination.total = 0
      }
    },
    
    async loadGroups() {
      try {
        const response = await porosityAnalysisAPI.getGroups()
        if (response && response.success) {
          this.groups = response.data || []
        }
      } catch (error) {
        console.error('Ошибка загрузки групп:', error)
      }
    },
    
    async loadStats() {
      try {
        const response = await porosityAnalysisAPI.getStatistics()
        if (response && response.success) {
          this.stats = response.data
        }
      } catch (error) {
        console.error('Ошибка загрузки статистики:', error)
      }
    },
    
    async loadArchives() {
      this.loadingArchives = true
      try {
        const response = await porosityAnalysisAPI.getArchives()
        if (response && response.success) {
          this.archives = response.data || []
        }
      } catch (error) {
        console.error('Ошибка загрузки архивов:', error)
        toast.error('Не удалось загрузить архивы')
      } finally {
        this.loadingArchives = false
      }
    },
    
    // Утилиты
    formatDate,
    getStatusText,
    
    
    getGroupAnalysesCount(groupId) {
      return this.analyses.filter(a => a.group?.id === groupId).length
    },
    
    getGroupColor(groupId) {
      const colors = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#20c997', '#fd7e14', '#e83e8c']
      return colors[groupId % colors.length]
    },
    
    // Выбор
    toggleSelection(analysisId) {
      const index = this.selectedIds.indexOf(analysisId)
      if (index > -1) {
        this.selectedIds.splice(index, 1)
      } else {
        this.selectedIds.push(analysisId)
      }
    },
    
    selectByStatus(status) {
      this.selectedStatus = status
      this.selectedIds = this.analyses
        .filter(analysis => analysis.status === status)
        .map(analysis => analysis.id)
    },
    
    clearSelection() {
      this.selectedIds = []
      this.selectedStatus = null
    },
    
    // Фильтры
    async resetFilters() {
      this.search = ''
      this.currentFilter = 'all'
      this.currentGroupId = null
      this.ordering = '-created_at'
      this.pagination.page = 1
      // Принудительно перезагружаем данные с сервера
      await this.loadData()
    },
    
    onStatusFilterChange(status) {
      this.currentFilter = status
      this.pagination.page = 1
      this.loadAnalyses()
    },
    
    onGroupFilterChange(groupId) {
      this.currentGroupId = groupId
      this.pagination.page = 1
      this.loadAnalyses()
    },
    
    onOrderingChange() {
      this.pagination.page = 1
      this.loadAnalyses()
    },
    
    // Пагинация
    changePage(page) {
      this.pagination.page = page
      this.loadAnalyses()
    },
    
    // Группы
    onGroupSelect(groupId) {
      this.groupManager.selectedId = groupId
    },
    
    selectAllByGroup(groupId) {
      const groupAnalyses = this.analyses.filter(a => a.group?.id === groupId)
      this.selectedIds = groupAnalyses.map(a => a.id)
    },
    
    ungroupAllInSelected(groupId) {
      // Реализация снятия группы
    },
    
    async createGroup(name) {
      try {
        const response = await porosityAnalysisAPI.createGroup({ name })
        if (response && response.success) {
          toast.success('Группа создана')
          this.groupManager.name = ''
          await this.loadGroups()
        } else {
          toast.error(response?.message || 'Ошибка создания группы')
        }
      } catch (error) {
        toast.error('Ошибка создания группы')
      }
    },
    
    async renameSelectedGroup({ id, name }) {
      try {
        const response = await porosityAnalysisAPI.updateGroup(id, { name })
        if (response && response.success) {
          toast.success('Группа переименована')
          this.groupManager.name = ''
          await this.loadGroups()
        } else {
          toast.error(response?.message || 'Ошибка переименования группы')
        }
      } catch (error) {
        toast.error('Ошибка переименования группы')
      }
    },
    
    requestDeleteGroup(groupId) {
      const group = this.groups.find(g => g.id === groupId)
      this.deleteGroupMessage = `Вы уверены, что хотите удалить группу "${group?.name}"? Все анализы в этой группе будут перемещены в "Без группы".`
      this.groupManager.selectedId = groupId
      this.showDeleteGroupConfirm = true
    },
    
    async confirmDeleteGroup() {
      try {
        const response = await porosityAnalysisAPI.deleteGroup(this.groupManager.selectedId)
        if (response && response.success) {
          toast.success('Группа удалена')
          this.groupManager.selectedId = null
          await this.loadGroups()
        } else {
          toast.error(response?.message || 'Ошибка удаления группы')
        }
      } catch (error) {
        toast.error('Ошибка удаления группы')
      } finally {
        this.showDeleteGroupConfirm = false
        this.groupManager.selectedId = null
      }
    },
    
    cancelDeleteGroup() {
      this.showDeleteGroupConfirm = false
      this.groupManager.selectedId = null
    },
    
    // Анализы
    async restartAnalysis(analysisId) {
      try {
        const response = await porosityAnalysisAPI.restartAnalysis(analysisId)
        if (response && response.success) {
          toast.success('Анализ перезапущен')
          await this.loadAnalyses()
        } else {
          toast.error(response?.message || 'Ошибка перезапуска анализа')
        }
      } catch (error) {
        toast.error('Ошибка перезапуска анализа')
      }
    },
    
    async downloadReport(analysisId) {
      try {
        const analysis = this.analyses.find(a => a.id === analysisId)
        
        const filename = this.generateFilename(analysis, 'docx')
        const response = await porosityAnalysisAPI.downloadReportWithProgress(analysisId, 'docx', filename)
        
        if (response && response.success) {
          toast.success('Скачивание отчета начато')
        } else {
          console.error('Ошибка скачивания отчета:', response)
          toast.error(response?.message || 'Ошибка скачивания отчета')
        }
      } catch (error) {
        console.error('Ошибка скачивания отчета:', error)
        toast.error('Ошибка скачивания отчета')
      }
    },
    
    async downloadPDF(analysisId) {
      try {
        const analysis = this.analyses.find(a => a.id === analysisId)
        
        const filename = this.generateFilename(analysis, 'pdf')
        const response = await porosityAnalysisAPI.downloadReportWithProgress(analysisId, 'pdf', filename)
        
        if (response && response.success) {
          toast.success('Скачивание PDF отчета начато')
        } else {
          console.error('Ошибка скачивания PDF:', response)
          toast.error(response?.message || 'Ошибка скачивания PDF отчета')
        }
      } catch (error) {
        console.error('Ошибка скачивания PDF:', error)
        toast.error('Ошибка скачивания PDF отчета')
      }
    },
    
    async downloadWord(analysisId) {
      try {
        const analysis = this.analyses.find(a => a.id === analysisId)
        
        const filename = this.generateFilename(analysis, 'docx')
        const response = await porosityAnalysisAPI.downloadReportWithProgress(analysisId, 'docx', filename)
        
        if (response && response.success) {
          toast.success('Скачивание Word отчета начато')
        } else {
          console.error('Ошибка скачивания Word:', response)
          toast.error(response?.message || 'Ошибка скачивания Word отчета')
        }
      } catch (error) {
        console.error('Ошибка скачивания Word:', error)
        toast.error('Ошибка скачивания Word отчета')
      }
    },
    
    async downloadOriginal(analysisId) {
      try {
        const analysis = this.analyses.find(a => a.id === analysisId)
        const response = await porosityAnalysisAPI.downloadOriginal(analysisId)
        if (response && response.success) {
          const filename = this.generateFilename(analysis, 'png', 'original')
          this.downloadBlob(response.data, filename)
          toast.success('Исходное изображение скачано')
        } else {
          toast.error(response?.message || 'Ошибка скачивания исходного изображения')
        }
      } catch (error) {
        console.error('Ошибка скачивания исходного изображения:', error)
        toast.error('Ошибка скачивания исходного изображения')
      }
    },
    
    // Вспомогательный метод для генерации имени файла
    generateFilename(analysis, extension, type = 'report') {
      if (!analysis) {
        return `analysis_${Date.now()}.${extension}`
      }
      
      // Получаем название анализа или используем ID
      let baseName = analysis.name || `Анализ_${analysis.id}`
      
      // Очищаем название от недопустимых символов для имени файла
      baseName = baseName
        .replace(/[<>:"/\\|?*]/g, '_') // Заменяем недопустимые символы на подчеркивания
        .replace(/\s+/g, '_') // Заменяем пробелы на подчеркивания
        .replace(/_+/g, '_') // Убираем множественные подчеркивания
        .replace(/^_|_$/g, '') // Убираем подчеркивания в начале и конце
        .trim()
      
      // Если название пустое после очистки, используем ID
      if (!baseName) {
        baseName = `Анализ_${analysis.id}`
      }
      
      // Добавляем тип файла если это не отчет
      if (type === 'original') {
        return `${baseName}_исходное_изображение.${extension}`
      } else {
        return `${baseName}_отчет.${extension}`
      }
    },
    
    // Вспомогательный метод для скачивания blob
    downloadBlob(blob, filename) {
      try {
        // Создаем URL для blob
        const url = window.URL.createObjectURL(blob)
        
        // Создаем временную ссылку
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        
        // Добавляем ссылку в DOM, кликаем и удаляем
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        // Освобождаем память
        window.URL.revokeObjectURL(url)
      } catch (error) {
        console.error('Ошибка при создании ссылки для скачивания:', error)
        toast.error('Ошибка при скачивании файла')
      }
    },
    
    
    requestDeleteAnalysis(analysisId) {
      this.deletingAnalysis = analysisId
      this.showDeleteConfirm = true
    },
    
    async confirmDeleteAnalysis() {
      try {
        const response = await porosityAnalysisAPI.deleteAnalysis(this.deletingAnalysis)
        if (response && response.success) {
          toast.success('Анализ удален')
          await this.loadAnalyses()
        } else {
          toast.error(response?.message || 'Ошибка удаления анализа')
        }
      } catch (error) {
        toast.error('Ошибка удаления анализа')
      } finally {
        this.showDeleteConfirm = false
        this.deletingAnalysis = null
      }
    },
    
    cancelDeleteAnalysis() {
      this.showDeleteConfirm = false
      this.deletingAnalysis = null
    },
    
    // Массовые операции
    async restartByInput(input) {
      // Реализация перезапуска по номерам
    },
    
    async restartSelected(selectedIds) {
      // Реализация перезапуска выбранных
    },
    
    async requestBulkDeleteByInput(input) {
      // Реализация массового удаления по номерам
    },
    
    async requestBulkDeleteSelected(selectedIds) {
      // Реализация массового удаления выбранных
    },
    
    
    async downloadAnalysesArchive({ selectedIds, type }) {
      this.downloadingArchive = true
      
      try {
        let params = {}
        
        if (type === 'selected' && selectedIds && selectedIds.length > 0) {
          // Скачивание выбранных анализов
          params = { analysis_ids: selectedIds }
        } else {
          toast.error('Не выбраны анализы для скачивания')
          return
        }
        
        const response = await porosityAnalysisAPI.downloadAnalysesArchive(params)
        
        if (response && response.success && response.data instanceof Blob) {
          // Генерируем имя файла для архива
          const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
          const filename = `analyses_archive_${timestamp}.zip`
          
          this.downloadBlob(response.data, filename)
          toast.success('Архив анализов скачан')
        } else {
          toast.error(response?.message || 'Ошибка скачивания архива')
        }
      } catch (error) {
        console.error('Ошибка скачивания архива:', error)
        toast.error('Ошибка скачивания архива')
      } finally {
        this.downloadingArchive = false
      }
    },
    
    // Фильтры для выбора
    selectByFilters({ status, group }) {
      // Очищаем текущий выбор
      this.selectedIds = []
      
      // Фильтруем анализы по переданным параметрам
      let filtered = [...this.analyses]
      
      // Фильтр по статусу
      if (status && status !== '') {
        filtered = filtered.filter(analysis => analysis.status === status)
      }
      
      // Фильтр по группе
      if (group !== null && group !== undefined && group !== '') {
        if (group === 'null' || group === 0) {
          // Анализы без группы
          filtered = filtered.filter(analysis => !analysis.group)
        } else {
          // Анализы в конкретной группе
          const groupId = typeof group === 'string' ? parseInt(group) : group
          filtered = filtered.filter(analysis => analysis.group?.id === groupId)
        }
      }
      
      // Выбираем отфильтрованные анализы
      this.selectedIds = filtered.map(analysis => analysis.id)
      
      // Показываем уведомление
      if (this.selectedIds.length > 0) {
        toast.success(`Выбрано ${this.selectedIds.length} анализов по фильтрам`)
      } else {
        toast.warning('По заданным фильтрам анализы не найдены')
      }
    },
    
    clearFilters() {
      // Очищаем фильтры в основном компоненте
      this.currentFilter = 'all'
      this.currentGroupId = null
      this.search = ''
      this.ordering = '-created_at'
      this.pagination.page = 1
      
      // Перезагружаем данные
      this.loadAnalyses()
      
      // Очищаем выбор
      this.selectedIds = []
      
      toast.info('Фильтры очищены')
    },
    
    removeFromSelection(analysisId) {
      const index = this.selectedIds.indexOf(analysisId)
      if (index > -1) {
        this.selectedIds.splice(index, 1)
      }
    },
    
    
    // Методы для массового удаления
    async confirmBulkDelete() {
      try {
        // Здесь должна быть логика массового удаления
        
        // TODO: Реализовать логику массового удаления через API
        // const response = await porosityAnalysisAPI.bulkDeleteAnalyses(this.selectedIds)
        // if (response && response.success) {
        //   toast.success('Анализы удалены')
        //   this.selectedIds = []
        //   await this.loadAnalyses()
        // }
        
        this.selectedIds = []
      } catch (error) {
        console.error('Ошибка массового удаления:', error)
        toast.error('Ошибка массового удаления')
      } finally {
        this.showBulkDeleteConfirm = false
      }
    },
    
    cancelBulkDelete() {
      this.showBulkDeleteConfirm = false
    },
    
    // Методы для работы с архивами
    async createArchive({ selectedIds, name, reportType, type }) {
      this.creatingArchive = true
      
      try {
        let analysisIds = []
        
        if (type === 'selected' && selectedIds && selectedIds.length > 0) {
          analysisIds = [...selectedIds]
        }
        
        if (analysisIds.length === 0) {
          toast.error('Не выбраны анализы для архива')
          return
        }
        
        // Генерируем название архива, если не указано
        const archiveName = name || `Архив_${new Date().toLocaleDateString('ru-RU')}_${analysisIds.length}_анализов`
        
        const response = await porosityAnalysisAPI.createArchive({
          name: archiveName,
          description: `Архив создан ${new Date().toLocaleString('ru-RU')}`,
          report_type: reportType,
          analysis_ids: analysisIds
        })
        
        if (response && response.success) {
          toast.success('Архив создается...')
          await this.loadArchives()
        } else {
          toast.error(response?.message || 'Ошибка создания архива')
        }
      } catch (error) {
        console.error('Ошибка создания архива:', error)
        toast.error('Ошибка создания архива')
      } finally {
        this.creatingArchive = false
      }
    },
    
    async downloadArchive(archive) {
      this.downloadingArchive = archive.id
      
      try {
        // Используем метод с временными ссылками для показа прогресса в браузере
        const filename = `${archive.name}.zip`
        const response = await porosityAnalysisAPI.downloadArchiveWithProgress(archive.id, filename)
        
        if (response && response.success) {
          toast.success('Скачивание архива начато')
        } else {
          console.error('Ошибка скачивания архива:', response)
          toast.error(response?.message || 'Ошибка скачивания архива')
        }
      } catch (error) {
        console.error('Ошибка скачивания архива:', error)
        toast.error('Ошибка скачивания архива')
      } finally {
        this.downloadingArchive = false
      }
    },
    
    requestDeleteArchive(archive) {
      this.deletingArchive = archive.id
      this.deleteArchiveMessage = `Вы уверены, что хотите удалить архив "${archive.name}"? Это действие нельзя отменить.`
      this.showDeleteArchiveConfirm = true
    },
    
    async confirmDeleteArchive() {
      try {
        const response = await porosityAnalysisAPI.deleteArchive(this.deletingArchive)
        if (response && response.success) {
          toast.success('Архив удален')
          await this.loadArchives()
        } else {
          toast.error(response?.message || 'Ошибка удаления архива')
        }
      } catch (error) {
        console.error('Ошибка удаления архива:', error)
        toast.error('Ошибка удаления архива')
      } finally {
        this.showDeleteArchiveConfirm = false
        this.deletingArchive = null
      }
    },
    
    cancelDeleteArchive() {
      this.showDeleteArchiveConfirm = false
      this.deletingArchive = null
    }
  }
}
</script>

<style scoped>
@import './styles/common.scss';

.porosity-analyses-list {
  padding: 2rem;
  min-height: 100vh;
  background: var(--bs-gray-100);
}

.analyses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  position: relative;
  z-index: 1;
}

.analyses-grid .analysis-card {
  z-index: 1;
}

@media (max-width: 768px) {
  .analyses-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

.status-selected {
  background-color: #e3f2fd !important;
  color: #1976d2 !important;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dropdown-item svg {
  flex-shrink: 0;
}
</style>
