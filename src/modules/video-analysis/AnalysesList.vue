<template>
  <div class="video-analysis-dashboard">
    <!-- Заголовок страницы с современным дизайном -->
    <div class="page-header">
      <div class="header-content">
        <div class="page-title-section">
          <div class="page-icon">
            <Play :size="28" color="white" />
          </div>
          <div class="page-title">
            <h1>Перевод видео</h1>
            <p class="page-subtitle">Обработка и анализ видеоматериалов с автоматической генерацией субтитров</p>
          </div>
        </div>
      </div>
      
      <div class="header-actions">
        <button 
          class="btn btn-primary upload-btn" 
          @click="showUploadModal = true"
        >
          <Upload :size="16" />
          <span>Загрузить видео</span>
        </button>
        <button 
          class="btn btn-danger delete-selected-btn" 
          @click="confirmBulkDelete" 
          :disabled="selectedIds.size === 0"
          title="Удалить выбранные"
        >
          <Trash2 :size="16" />
          <span>Удалить выбранные</span>
        </button>
      </div>
    </div>

    <!-- Фильтры и поиск -->
    <div class="filters-card">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label">
              <Search :size="16" />
              <span>Поиск</span>
            </label>
            <input 
              v-model.trim="search" 
              type="text" 
              class="form-control" 
              placeholder="Название или описание анализа..."
              @input="debouncedSearch"
            />
          </div>
          <div class="col-md-2">
            <label class="form-label">Статус</label>
            <select v-model="statusFilter" class="form-select" @change="load">
              <option value="">Все статусы</option>
              <option value="pending">Ожидает</option>
              <option value="processing">Обрабатывается</option>
              <option value="completed">Завершен</option>
              <option value="failed">Ошибка</option>
              <option value="cancelled">Отменен</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Сортировка</label>
            <select v-model="ordering" class="form-select" @change="load">
              <option value="-created_at">По дате создания ↓</option>
              <option value="created_at">По дате создания ↑</option>
              <option value="title">По названию ↑</option>
              <option value="-title">По названию ↓</option>
              <option value="status">По статусу</option>
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label">На странице</label>
            <select v-model.number="pageSize" class="form-select" @change="load">
              <option :value="5">5</option>
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="50">50</option>
            </select>
          </div>
          <div class="col-md-1 d-grid align-self-end">
            <button class="btn btn-reset-filters" @click="resetFilters" title="Сбросить фильтры и обновить список">
              <RotateCcw :size="16" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Статистические карточки -->
    <div class="row g-4 mb-4">
      <div class="col-xl-3 col-md-6">
        <div class="statistics-card card-primary">
          <div class="card-content">
            <div class="card-icon">
              <BarChart3 :size="24" />
            </div>
            <div class="card-info">
              <h6 class="card-subtitle">Всего анализов</h6>
              <h3 class="card-value">{{ stats.total }}</h3>
              <div class="card-progress">
                <div class="progress">
                  <div class="progress-bar bg-primary" style="width: 100%"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-xl-3 col-md-6" v-for="(count, key) in stats.by_status" :key="key">
        <div class="statistics-card" :class="getStatusCardClass(key)">
          <div class="card-content">
            <div class="card-icon">
              <component :is="getStatusIcon(key)" :size="24" />
            </div>
            <div class="card-info">
              <h6 class="card-subtitle">{{ getStatusLabel(key) }}</h6>
              <h3 class="card-value">{{ count }}</h3>
              <div class="card-progress">
                <div class="progress">
                  <div 
                    class="progress-bar" 
                    :class="getStatusProgressClass(key)"
                    :style="`width: ${getPercentage(count)}%`"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Список анализов -->
    <div v-if="loading" class="loading-state">
      <div class="d-flex flex-column align-items-center justify-content-center py-5">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Загрузка...</span>
        </div>
        <p class="text-muted">Загружаем анализы...</p>
      </div>
    </div>

    <div v-else-if="items.length === 0" class="empty-state">
      <div class="text-center">
        <Video :size="64" class="empty-icon mb-4" />
        <h4 class="text-muted mb-3">Анализы не найдены</h4>
        <p class="text-muted mb-4">Попробуйте изменить фильтры или загрузите первое видео</p>
        <button 
          class="btn btn-primary btn-lg"
          @click="showUploadModal = true"
        >
          <Upload :size="20" />
          <span>Загрузить первое видео</span>
        </button>
      </div>
    </div>

    <div v-else class="analyses-grid">
      <div class="analysis-card" v-for="item in items" :key="item.id" :class="{ selected: selectedIds.has(item.id) }" @click="onCardClick(item, $event)">
        <div class="analysis-header" :class="getAnalysisHeaderClass(item.status)">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <span class="badge" :class="statusClass(item.status)">
              {{ item.status_display }}
            </span>
            <div class="analysis-actions">
              <div class="form-check me-2 delete-check">
                <input class="form-check-input delete-form-check" type="checkbox" :id="'sel_'+item.id" :checked="selectedIds.has(item.id)" @click.stop @change="toggleSelected(item.id)">
              </div>
              <button 
                class="btn btn-sm btn-delete-analysis" 
                @click.stop="showDeleteConfirm(item)"
                title="Удалить анализ"
              >
                <Trash2 :size="14" />
              </button>
            </div>
          </div>
          <h5 class="analysis-title mb-0">{{ item.title || 'Без названия' }}</h5>
        </div>
        
        <div class="analysis-body">
          <!-- Информация об анализе -->
          <div class="analysis-info">
            <div class="info-item">
              <Clock :size="16" class="info-icon" />
              <div class="info-content">
                <span class="info-label">Длительность</span>
                <span class="info-value">{{ item.duration_formatted || '-' }}</span>
              </div>
            </div>

            <div class="info-item" v-if="item.status === 'completed'">
              <Clock :size="16" class="info-icon" />
              <div class="info-content">
                <span class="info-label">Обработка</span>
                <span class="info-value">{{ item.processing_time_formatted || '-' }}</span>
              </div>
            </div>
            
            <div class="info-item">
              <FileText :size="16" class="info-icon" />
              <div class="info-content">
                <span class="info-label">Субтитры</span>
                <span class="info-value">{{ item.segments_count || 0 }} сегментов</span>
              </div>
            </div>
            
            <div class="info-item">
              <Calendar :size="16" class="info-icon" />
              <div class="info-content">
                <span class="info-label">Создан</span>
                <span class="info-value">{{ formatDate(item.created_at) }}</span>
              </div>
            </div>
          </div>
          
          <!-- Прогресс обработки -->
          <div v-if="item.status === 'processing'" class="processing-section">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="text-muted small">Обработка видео...</span>
            </div>
            <div class="progress">
              <div class="progress-bar progress-bar-striped progress-bar-animated bg-primary" style="width: 100%"></div>
            </div>
          </div>
        </div>
        
        <div class="analysis-footer">
          <router-link 
            :to="`/video-analysis/analysis/${item.id}`" 
            class="btn btn-view-analysis"
            @click.stop
          >
            <Eye :size="16" />
            <span>Открыть анализ</span>
          </router-link>
          
          <div class="download-actions" v-if="item.status === 'completed'">
            <button 
              v-if="item.output_video" 
              @click="downloadFile(item.id, 'video')" 
              class="btn btn-download-icon btn-download-video" 
              title="Скачать видео с субтитрами"
              :disabled="downloading[`${item.id}_video`]"
            >
              <Video :size="14" />
              <Loader v-if="downloading[`${item.id}_video`]" :size="12" class="spinner" />
            </button>
            <button 
              v-if="item.subtitles_file" 
              @click="downloadFile(item.id, 'subtitles')" 
              class="btn btn-download-icon btn-download-subtitles" 
              title="Скачать субтитры SRT"
              :disabled="downloading[`${item.id}_subtitles`]"
            >
              <FileText :size="14" />
              <Loader v-if="downloading[`${item.id}_subtitles`]" :size="12" class="spinner" />
            </button>
            <button 
              v-if="item.audio_file" 
              @click="downloadFile(item.id, 'audio')" 
              class="btn btn-download-icon btn-download-audio" 
              title="Скачать аудио"
              :disabled="downloading[item.id + '_audio']"
            >
              <Volume2 :size="14" />
              <Loader v-if="downloading[item.id + '_audio']" :size="12" class="spinner" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Пагинация -->
    <nav v-if="total > pageSize" class="mt-5">
      <ul class="pagination pagination-modern justify-content-center">
        <!-- Кнопка "Первая страница" -->
        <li class="page-item" :class="{ disabled: page === 1 }">
          <button class="page-link" @click="goToFirstPage" :disabled="page === 1" title="Первая страница">
            <ChevronsLeft :size="16" />
          </button>
        </li>
        
        <!-- Кнопка "Предыдущая страница" -->
        <li class="page-item" :class="{ disabled: page === 1 }">
          <button class="page-link" @click="goPrev" :disabled="page === 1" title="Предыдущая страница">
            <ChevronLeft :size="16" />
          </button>
        </li>
        
        <!-- Номера страниц -->
        <li class="page-item" 
            v-for="pageNum in getPageNumbers()" 
            :key="pageNum"
            :class="{ 
              active: pageNum === page,
              disabled: pageNum === '...'
            }">
          <button 
            v-if="pageNum !== '...'"
            class="page-link" 
            @click="goToPage(pageNum)"
          >
            {{ pageNum }}
          </button>
          <span v-else class="page-link page-ellipsis">...</span>
        </li>
        
        <!-- Кнопка "Следующая страница" -->
        <li class="page-item" :class="{ disabled: page === totalPages }">
          <button class="page-link" @click="goNext" :disabled="page === totalPages" title="Следующая страница">
            <ChevronRight :size="16" />
          </button>
        </li>
        
        <!-- Кнопка "Последняя страница" -->
        <li class="page-item" :class="{ disabled: page === totalPages }">
          <button class="page-link" @click="goToLastPage" :disabled="page === totalPages" title="Последняя страница">
            <ChevronsRight :size="16" />
          </button>
        </li>
      </ul>
      
      <div class="pagination-info text-center mt-3">
        <span class="text-muted">
          Показано {{ startIndex + 1 }}–{{ endIndex }} из {{ total }} 
          (страница {{ page }} из {{ totalPages }})
        </span>
      </div>
    </nav>
    
    <!-- Модальное окно для загрузки видео -->
    <div 
      class="modal fade" 
      id="uploadModal" 
      :class="{ show: showUploadModal }" 
      :style="{ display: showUploadModal ? 'block' : 'none' }"
      tabindex="-1" 
      aria-labelledby="uploadModalLabel" 
      :aria-hidden="!showUploadModal"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="uploadModalLabel">
              <Upload :size="20" class="me-2" />
              Загрузка видео для анализа
            </h5>
            <button 
              type="button" 
              class="btn-close" 
              @click="showUploadModal = false"
              :disabled="isUploading"
            ></button>
          </div>
          <div class="modal-body">
            <MultiVideoUploader
              ref="uploaderRef"
              :max-files="10"
              :max-file-size="500 * 1024 * 1024"
              @upload-complete="onUploadComplete"
              @upload-error="onUploadError"
              @files-selected="onFilesSelected"
            />
          </div>
        </div>
      </div>
    </div>
    
    <!-- Backdrop для модального окна -->
    <div 
      v-if="showUploadModal" 
      class="modal-backdrop fade show"
      @click="showUploadModal = false"
    ></div>

    <!-- Модальное окно подтверждения удаления -->
    <ConfirmDialog
      :show="showDeleteModal"
      title="Удаление анализа"
      :message="`Вы уверены, что хотите удалить анализ «${itemToDelete?.title || 'Без названия'}»? Это действие нельзя отменить.`"
      confirm-text="Удалить"
      cancel-text="Отмена"
      variant="danger"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
      @close="cancelDelete"
    />
  </div>
  
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { videoAnalysisAPI } from './js/video-analysis.js'
import { useToast } from 'vue-toastification'
import MultiVideoUploader from './components/MultiVideoUploader.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { 
  Play, Upload, Search, RotateCcw, BarChart3, 
  Clock, Hourglass, CheckCircle, AlertTriangle, Video, 
  FileText, Calendar, Eye, Trash2, Volume2, ChevronLeft, 
  ChevronRight, ChevronsLeft, ChevronsRight, Loader
} from 'lucide-vue-next'

const toast = useToast()

const items = ref([])
const selectedIds = ref(new Set())
const stats = ref({ total: 0, by_status: {} })
const showUploadModal = ref(false)
const showDeleteModal = ref(false)
const itemToDelete = ref(null)
const uploaderRef = ref(null)
const isUploading = ref(false)
const search = ref('')
const statusFilter = ref('')
const ordering = ref('-created_at')
const page = ref(1)
const pageSize = ref(5)
const total = ref(0)
const loading = ref(false)
const downloading = ref({})
let timer = null
let searchTimeout = null

function statusClass(status) {
  switch (status) {
    case 'completed': return 'bg-success'
    case 'processing': return 'bg-warning'
    case 'failed': return 'bg-danger'
    case 'pending': return 'bg-secondary'
    default: return 'bg-light text-dark'
  }
}

function formatDate(iso) {
  if (!iso) return '-'
  try { return new Date(iso).toLocaleString() } catch { return iso }
}

// Методы для работы с новым загрузчиком
function onFilesSelected() {
  // Можно добавить дополнительную логику при выборе файлов
}

function onUploadComplete() {
  showUploadModal.value = false
  page.value = 1
  load()
}

function onUploadError(error) {
  console.error('Upload error:', error)
}

async function downloadFile(id, type) {
  try {
    const downloadKey = `${id}_${type}`
    downloading.value[downloadKey] = true
    
    const result = await videoAnalysisAPI.downloadFile(id, type)
    
    if (result.success && result.data) {
      // Создаем blob URL для скачивания
      const blob = new Blob([result.data])
      const url = window.URL.createObjectURL(blob)
      
      // Создаем временную ссылку для скачивания
      const link = document.createElement('a')
      link.href = url
      
      // Определяем имя файла в зависимости от типа
      let filename = `video_analysis_${id}`
      switch (type) {
        case 'video':
          filename += '_with_subtitles.mp4'
          break
        case 'subtitles':
          filename += '_subtitles.srt'
          break
        case 'audio':
          filename += '_audio.mp3'
          break
        default:
          filename += `_${type}`
      }
      
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Освобождаем память
      window.URL.revokeObjectURL(url)
      
      toast.success('Файл успешно скачан')
    } else {
      toast.error('Ошибка при скачивании файла')
    }
  } catch (error) {
    console.error('Ошибка скачивания:', error)
    toast.error('Ошибка при скачивании файла')
  } finally {
    downloading.value[`${id}_${type}`] = false
  }
}

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))
const startIndex = computed(() => (page.value - 1) * pageSize.value)
const endIndex = computed(() => Math.min(total.value, startIndex.value + items.value.length))
const hasProcessing = computed(() => items.value.some(i => i.status === 'processing' || i.status === 'pending'))

async function load() {
  try {
    loading.value = true
    const params = {
      search: search.value || undefined,
      status: statusFilter.value || undefined,
      ordering: ordering.value || undefined,
      page: page.value,
      page_size: pageSize.value,
    }
    const [listRes, statRes] = await Promise.all([
      videoAnalysisAPI.list(params),
      videoAnalysisAPI.statistics(),
    ])
    if (Array.isArray(listRes.data?.results)) {
      items.value = listRes.data.results
      total.value = listRes.data.count || listRes.data.results.length
    } else if (Array.isArray(listRes.data)) {
      items.value = listRes.data
      total.value = listRes.data.length
    } else {
      items.value = []
      total.value = 0
    }
    stats.value = statRes.data || { total: 0, by_status: {} }
  } catch {
    toast.error('Ошибка загрузки данных')
  } finally {
    loading.value = false
  }
}



function onCardClick(item, event) {
  // Клик по всей карточке переключает выбор, если не по интерактивным элементам
  // Перестраховка: если событие уже остановлено — ничего не делаем
  if (event.defaultPrevented) return
  toggleSelected(item.id)
}

function showDeleteConfirm(item) {
  itemToDelete.value = item
  showDeleteModal.value = true
}

async function confirmDelete() {
  try {
    await videoAnalysisAPI.remove(itemToDelete.value.id)
    toast.success('Анализ удалён')
    await load()
  } catch {
    toast.error('Ошибка удаления')
  } finally {
    showDeleteModal.value = false
    itemToDelete.value = null
  }
}



function cancelDelete() {
  showDeleteModal.value = false
  itemToDelete.value = null
}

function toggleSelected(id) {
  if (selectedIds.value.has(id)) {
    selectedIds.value.delete(id)
  } else {
    selectedIds.value.add(id)
  }
}

async function confirmBulkDelete() {
  if (selectedIds.value.size === 0) return
  try {
    const ids = Array.from(selectedIds.value)
    await videoAnalysisAPI.bulkDelete(ids)
    toast.success(`Удалено ${ids.length} анализов`)
    selectedIds.value.clear()
    await load()
  } catch (e) {
    toast.error('Ошибка массового удаления')
  }
}

function goPrev() {
  if (page.value > 1) {
    page.value -= 1
    load()
  }
}

function goNext() {
  if (page.value < totalPages.value) {
    page.value += 1
    load()
  }
}

function resetFilters() {
  search.value = ''
  statusFilter.value = ''
  ordering.value = '-created_at'
  page.value = 1
  load()
}

const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
    load()
  }, 500)
}

function goToPage(pageNum) {
  if (pageNum >= 1 && pageNum <= totalPages.value) {
    page.value = pageNum
    load()
  }
}

function goToFirstPage() {
  if (page.value > 1) {
    page.value = 1
    load()
  }
}

function goToLastPage() {
  if (page.value < totalPages.value) {
    page.value = totalPages.value
    load()
  }
}

function getPageNumbers() {
  const pages = []
  const current = page.value
  const total = totalPages.value
  
  // Если страниц мало, показываем все
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
    return pages
  }
  
  // Если страниц много, показываем умную пагинацию
  if (current <= 4) {
    // В начале: 1, 2, 3, 4, 5, ..., последняя
    for (let i = 1; i <= 5; i++) {
      pages.push(i)
    }
    if (total > 5) {
      pages.push('...')
      pages.push(total)
    }
  } else if (current >= total - 3) {
    // В конце: 1, ..., предпоследние 5 страниц
    pages.push(1)
    if (total > 5) {
      pages.push('...')
    }
    for (let i = total - 4; i <= total; i++) {
      pages.push(i)
    }
  } else {
    // В середине: 1, ..., текущая-1, текущая, текущая+1, ..., последняя
    pages.push(1)
    pages.push('...')
    for (let i = current - 1; i <= current + 1; i++) {
      pages.push(i)
    }
    pages.push('...')
    pages.push(total)
  }
  
  return pages
}

function getStatusLabel(status) {
  const labels = {
    'pending': 'Ожидает',
    'processing': 'Обрабатывается',
    'completed': 'Завершено',
    'failed': 'Ошибка',
    'cancelled': 'Отменено'
  }
  return labels[status] || status
}

function getStatusIcon(status) {
  const icons = {
    'pending': Hourglass,
    'processing': Loader,
    'completed': CheckCircle,
    'failed': AlertTriangle,
    'cancelled': AlertTriangle
  }
  return icons[status] || Clock
}

function getStatusCardClass(status) {
  const classes = {
    'pending': 'card-secondary',
    'processing': 'card-warning',
    'completed': 'card-success',
    'failed': 'card-danger',
    'cancelled': 'card-info'
  }
  return classes[status] || 'card-secondary'
}

function getStatusProgressClass(status) {
  const classes = {
    'pending': 'bg-secondary',
    'processing': 'bg-warning',
    'completed': 'bg-success',
    'failed': 'bg-danger',
    'cancelled': 'bg-info'
  }
  return classes[status] || 'bg-secondary'
}

function getAnalysisHeaderClass(status) {
  const classes = {
    'pending': 'header-secondary',
    'processing': 'header-warning',
    'completed': 'header-success',
    'failed': 'header-danger',
    'cancelled': 'header-info'
  }
  return classes[status] || 'header-secondary'
}

function getPercentage(value) {
  if (stats.value.total === 0) return 0
  return Math.round((value / stats.value.total) * 100)
}

function setupAutoRefresh() {
  if (timer) clearInterval(timer)
  // Автообновление списка отключено
}

onMounted(async () => {
  await load()
  setupAutoRefresh()
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
  if (searchTimeout) clearTimeout(searchTimeout)
})

watch([statusFilter, ordering, pageSize], () => {
  page.value = 1
  load()
})
</script>

<style scoped lang="scss">
.video-analysis-dashboard {
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
    
    .upload-btn {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1.5rem;
      font-weight: 600;
      border-radius: 10px;
      transition: all 0.2s ease;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(13, 110, 253, 0.3);
      }
      
      svg {
        flex-shrink: 0;
        margin: 0;
      }
      
      span {
        white-space: nowrap;
      }
    }

    .delete-selected-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      svg { align-self: center; margin: 0; }
      span { align-self: center; }
    }
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
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
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

// Секция загрузки
.upload-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  .file-input {
    display: none;
  }
  
  .file-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    margin: 0;
  }
  
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
}

// Карточка фильтров
.filters-card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
  
  .card-body {
    padding: 1.5rem;
  }
  
  .form-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    color: var(--bs-heading-color);
    margin-bottom: 0.5rem;
  }
  
  .form-control,
  .form-select {
    border-radius: 8px;
    border-color: var(--bs-border-color);
    
    &:focus {
      border-color: var(--bs-primary);
      box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
    }
  }
  
  .btn-reset-filters {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 0.75rem;
    background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
    border: none;
    color: white;
    font-weight: 600;
    border-radius: 8px;
    transition: all 0.2s ease;
    
    &:hover {
      background: linear-gradient(135deg, #c82333 0%, #a71e2a 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(220, 53, 69, 0.4);
    }
    
    &:active {
      transform: translateY(0);
    }
  }
}

// Статистические карточки
.statistics-card {
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
    width: 100%;
    height: 5px;
  }

  &.card-primary::before {
    background: linear-gradient(90deg, #007bff 0%, #0056b3 100%);
  }

  &.card-warning::before {
    background: linear-gradient(90deg, #ffc107 0%, #e0a800 100%);
  }

  &.card-success::before {
    background: linear-gradient(90deg, #28a745 0%, #1e7e34 100%);
  }

  &.card-info::before {
    background: linear-gradient(90deg, #17a2b8 0%, #117a8b 100%);
  }

  &.card-danger::before {
    background: linear-gradient(90deg, #dc3545 0%, #c82333 100%);
  }

  &.card-secondary::before {
    background: linear-gradient(90deg, #6c757d 0%, #5a6268 100%);
  }
}

.card-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.card-primary .card-icon {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
}

.card-warning .card-icon {
  background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
}

.card-success .card-icon {
  background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%);
}

.card-info .card-icon {
  background: linear-gradient(135deg, #17a2b8 0%, #117a8b 100%);
}

.card-danger .card-icon {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
}

.card-secondary .card-icon {
  background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
}

.card-info {
  flex: 1;
}

.card-subtitle {
  color: #6c757d;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.card-value {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  color: #2d3436;
}

.card-progress {
  margin-top: 0.5rem;
}

.card-progress .progress {
  height: 5px;
  background-color: #e9ecef;
  border-radius: 5px;
}

// Состояния загрузки и пустого списка
.loading-state,
.empty-state {
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  padding: 3rem 2rem;
  text-align: center;
  
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

// Сетка анализов
.analyses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

.analysis-card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  }

  &.selected {
    box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.35), 0 5px 20px rgba(0, 0, 0, 0.08);
  }
}

.analysis-header {
  padding: 1.5rem;
  background: var(--bs-light);
  border-left: 4px solid;
  
  &.header-primary {
    border-color: var(--bs-primary);
  }
  
  &.header-warning {
    border-color: var(--bs-warning);
  }
  
  &.header-success {
    border-color: var(--bs-success);
  }
  
  &.header-danger {
    border-color: var(--bs-danger);
  }
  
  &.header-info {
    border-color: var(--bs-info);
  }
  
  &.header-secondary {
    border-color: var(--bs-secondary);
  }
  
  .analysis-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--bs-heading-color);
    margin: 0;
  }
  
  .analysis-actions {
    display: flex;
    gap: 0.5rem;
    
    .delete-check {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .delete-form-check {
      border-color: #dc3545;
      width: 18px;
      height: 18px;
      cursor: pointer;
    }
    .delete-form-check:checked {
      background-color: #dc3545;
      border-color: #dc3545;
    }

    .btn-delete-analysis {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
      border: none;
      color: white;
      font-weight: 600;
      border-radius: 6px;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.5rem 0.75rem;
      min-width: 36px;
      min-height: 36px;
      
      &:hover {
        background: linear-gradient(135deg, #c82333 0%, #a71e2a 100%);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
      }
      
      &:active {
        transform: translateY(0);
      }
      
      svg {
        align-self: center;
      }
    }
  }
}

.analysis-body {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  
  .analysis-info {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1.5rem;
    
    .info-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      background: var(--bs-gray-100);
      border-radius: 8px;
      
      .info-icon {
        color: var(--bs-secondary-color);
      }
      
      .info-content {
        display: flex;
        flex-direction: column;
        
        .info-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--bs-secondary-color);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .info-value {
          font-weight: 600;
          color: var(--bs-heading-color);
        }
      }
    }
  }
  
  .processing-section {
    margin-top: auto;
    padding: 1rem;
    background: rgba(255, 193, 7, 0.1);
    border-radius: 8px;
    border: 1px solid rgba(255, 193, 7, 0.3);
  }
}

.analysis-footer {
  padding: 1rem 1.5rem;
  background: var(--bs-gray-100);
  border-top: 1px solid var(--bs-border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .btn-view-analysis {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
    
    &:hover {
      background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(102, 126, 234, 0.4);
      text-decoration: none;
    }
  }
  
  .download-actions {
    display: flex;
    gap: 0.5rem;
  }
  
  .btn-download-icon {
    width: 32px;
    height: 32px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    transition: all 0.2s ease;
    text-decoration: none;
    position: relative;
    border: none;
    font-weight: 600;
    
    &.btn-download-video {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
      color: white;
      
      &:hover:not(:disabled) {
        background: linear-gradient(135deg, #c82333 0%, #a71e2a 100%);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
      }
      
      .spinner {
        color: white;
      }
    }
    
    &.btn-download-subtitles {
      background: linear-gradient(135deg, #fd7e14 0%, #e55a00 100%);
      color: white;
      
      &:hover:not(:disabled) {
        background: linear-gradient(135deg, #e55a00 0%, #cc4a00 100%);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(253, 126, 20, 0.4);
      }
      
      .spinner {
        color: white;
      }
    }
    
    &.btn-download-audio {
      background: linear-gradient(135deg, #6f42c1 0%, #5a2d91 100%);
      color: white;
      
      &:hover:not(:disabled) {
        background: linear-gradient(135deg, #5a2d91 0%, #4a1f7a 100%);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(111, 66, 193, 0.4);
      }
      
      .spinner {
        color: white;
      }
    }
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
    
    &:active:not(:disabled) {
      transform: translateY(0);
    }
  }
  
  .spinner {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
}

// Пагинация
.pagination-modern {
  .page-item {
    margin: 0 2px;
    
    // Все номера страниц делаем скруглёнными
    .page-link {
      border-radius: 9999px;
    }
  }
  
  .page-link {
    border: none;
    background: white;
    color: var(--bs-secondary-color);
    padding: 0.5rem 1rem;
    font-weight: 600;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
    
    &:hover {
      background: var(--bs-primary);
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }
    
    &:focus {
      box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
    }
  }
  
  .page-item.active .page-link {
    background: var(--bs-primary);
    color: white;
  }
  
  .page-item.disabled .page-link {
    background: var(--bs-gray-200);
    opacity: 0.5;
    cursor: not-allowed;
    
    &:hover {
      transform: none;
      background: var(--bs-gray-200);
      color: var(--bs-secondary-color);
    }
  }
  
  .page-ellipsis {
    background: transparent !important;
    color: var(--bs-secondary-color) !important;
    cursor: default !important;
    pointer-events: none;
    
    &:hover {
      transform: none !important;
      background: transparent !important;
      color: var(--bs-secondary-color) !important;
    }
  }
}

.pagination-info {
  margin-top: 1rem;
  
  .text-muted {
    font-size: 0.875rem;
  }
}

// Адаптивность
@media (max-width: 768px) {
  .video-analysis-dashboard {
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
  
  .page-title-section {
    .page-title h1 {
      font-size: 1.5rem;
    }
  }
  
  .analyses-grid {
    grid-template-columns: 1fr;
  }
  
  .upload-section {
    flex-direction: column;
    width: 100%;
    
    .file-label,
    .btn {
      width: 100%;
      justify-content: center;
    }
  }
}

@media (max-width: 576px) {
  .statistics-card {
    .card-content {
      flex-direction: column;
      text-align: center;
      gap: 1rem;
    }
  }
  
  .analysis-footer {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
    
    .btn-view-analysis {
      justify-content: center;
    }
    
    .download-actions {
      justify-content: center;
    }
  }
}

// Модальное окно
.modal {
  z-index: 1050;
  
  &.show {
    display: block !important;
  }
  
  .modal-dialog {
    margin: 1.75rem auto;
    max-width: 800px;
  }
  
  .modal-content {
    border: none;
    border-radius: 15px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  }
  
  .modal-header {
    border-bottom: 1px solid #e9ecef;
    border-radius: 15px 15px 0 0;
    padding: 1.5rem;
    
    .modal-title {
      display: flex;
      align-items: center;
      font-weight: 600;
      color: #495057;
    }
    
    .btn-close {
      font-size: 1.2rem;
      
      &:disabled {
        opacity: 0.3;
      }
    }
  }
  
  .modal-body {
    padding: 2rem;
  }
  
  .modal-footer {
    border-top: 1px solid #e9ecef;
    border-radius: 0 0 15px 15px;
    padding: 1.5rem;
  }
}

.modal-backdrop {
  z-index: 1040;
  background-color: rgba(0, 0, 0, 0.5);
  
  &.show {
    opacity: 1;
  }
}
</style>


