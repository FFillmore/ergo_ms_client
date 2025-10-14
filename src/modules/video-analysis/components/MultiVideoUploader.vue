<template>
  <div class="multi-video-uploader">
    <!-- Drag and Drop зона -->
    <div 
      class="drop-zone"
      :class="{ 
        'drop-zone-active': isDragActive, 
        'drop-zone-error': hasError,
        'drop-zone-disabled': isUploading 
      }"
      @dragenter="onDragEnter"
      @dragover="onDragOver" 
      @dragleave="onDragLeave"
      @drop="onDrop"
    >
      <div class="drop-zone-content">
        <div class="drop-zone-icon">
          <Upload v-if="!isUploading" :size="48" />
          <div v-else class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Загрузка...</span>
          </div>
        </div>
        
        <div class="drop-zone-text">
          <h5 v-if="!isUploading">Перетащите видео файлы сюда</h5>
          <h5 v-else>Загрузка видео...</h5>
          <p v-if="!isUploading" class="text-muted">
            или <span class="text-primary cursor-pointer" @click="$refs.fileInput.click()">выберите файлы</span>
          </p>
          <p v-else class="text-muted">
            Пожалуйста, подождите...
          </p>
        </div>
      </div>
      
      <!-- Скрытый input для файлов -->
      <input
        ref="fileInput"
        type="file"
        multiple
        accept="video/*"
        @change="onFileSelect"
        class="d-none"
      />
    </div>
    
    <!-- Список выбранных файлов -->
    <div v-if="selectedFiles.length > 0" class="selected-files mt-3">
      <h6 class="mb-3">
        <FileVideo :size="20" class="me-2" />
        Выбранные файлы ({{ selectedFiles.length }})
      </h6>
      
      <div class="files-list">
        <div 
          v-for="(file, index) in selectedFiles" 
          :key="`${file.name}-${index}`"
          class="file-item"
        >
          <div class="file-info">
            <div class="file-icon">
              <Play :size="16" />
            </div>
            <div class="file-details">
              <div class="file-name">{{ file.name }}</div>
              <div class="file-size">{{ formatFileSize(file.size) }}</div>
            </div>
            <button
              type="button"
              class="btn btn-sm btn-delete-file ms-auto"
              @click="showDeleteConfirm(index)"
              :disabled="isUploading"
            >
              <X :size="14" />
            </button>
          </div>
          
          <div class="file-title-input">
            <div class="input-group">
              <input
                v-model="fileTitles[index]"
                type="text"
                class="form-control form-control-sm"
                placeholder="Название анализа (оставьте пустым для использования названия файла)"
                maxlength="255"
              />
              <div class="input-group-text">
                <small class="text-muted">
                  {{ fileTitles[index] ? 'Пользовательское название' : 'Название файла' }}
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Настройки субтитров -->
      <div class="subtitle-settings mt-3">
        <h6 class="mb-3">
          <Settings :size="20" class="me-2" />
          Настройки субтитров
        </h6>
        
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Количество строк одновременно</label>
            <select v-model="subtitleSettings.linesCount" class="form-select">
              <option :value="1">±1 строка</option>
              <option :value="2">±2 строки</option>
              <option :value="3">±3 строки</option>
            </select>
          </div>
          
          <div class="col-md-6">
            <label class="form-label">Размер шрифта</label>
            <input 
              v-model.number="subtitleSettings.fontSize" 
              type="range" 
              class="form-range" 
              min="12" 
              max="72" 
              step="2"
            />
            <div class="d-flex justify-content-between">
              <small class="text-muted">12px</small>
              <small class="fw-bold">{{ subtitleSettings.fontSize }}px</small>
              <small class="text-muted">72px</small>
            </div>
          </div>
          
          <div class="col-md-6">
            <label class="form-label">Цвет шрифта</label>
            <div class="input-group">
              <input 
                v-model="subtitleSettings.fontColor" 
                type="color" 
                class="form-control form-control-color" 
                title="Выберите цвет шрифта"
              />
              <input 
                v-model="subtitleSettings.fontColor" 
                type="text" 
                class="form-control" 
                placeholder="#FFFFFF"
                maxlength="7"
              />
            </div>
          </div>
          
          <div class="col-md-6">
            <label class="form-label">Цвет фона</label>
            <div class="input-group">
              <input 
                v-model="subtitleSettings.backgroundColor" 
                type="color" 
                class="form-control form-control-color" 
                title="Выберите цвет фона"
                :disabled="subtitleSettings.backgroundTransparent"
              />
              <input 
                v-model="subtitleSettings.backgroundColor" 
                type="text" 
                class="form-control" 
                placeholder="#000000"
                maxlength="7"
                :disabled="subtitleSettings.backgroundTransparent"
              />
            </div>
          </div>
          
          <div class="col-12">
            <div class="form-check">
              <input 
                v-model="subtitleSettings.backgroundTransparent" 
                class="form-check-input" 
                type="checkbox" 
                id="transparentBackground"
              />
              <label class="form-check-label" for="transparentBackground">
                Прозрачный фон
              </label>
            </div>
          </div>
          
          <div class="col-md-6">
            <label class="form-label">Позиция субтитров</label>
            <select v-model="subtitleSettings.alignment" class="form-select">
              <option value="1">Слева снизу</option>
              <option value="2">По центру снизу</option>
              <option value="3">Справа снизу</option>
              <option value="4">Сверху слева</option>
              <option value="5">По центру слева</option>
              <option value="6">Сверху по центру</option>
              <option value="7">Сверху справа</option>
              <option value="8">По центру</option>
              <option value="9">Справа по центру</option>
            </select>
          </div>
          
          <div class="col-md-6">
            <label class="form-label">Отступ по вертикали</label>
            <input 
              v-model.number="subtitleSettings.marginVertical" 
              type="range" 
              class="form-range" 
              min="0" 
              max="200" 
              step="5"
            />
            <div class="d-flex justify-content-between">
              <small class="text-muted">0px</small>
              <small class="fw-bold">{{ subtitleSettings.marginVertical }}px</small>
              <small class="text-muted">200px</small>
            </div>
          </div>
          
          <div class="col-md-6">
            <label class="form-label">Отступ по горизонтали</label>
            <input 
              v-model.number="subtitleSettings.marginHorizontal" 
              type="range" 
              class="form-range" 
              min="-200" 
              max="200" 
              step="10"
            />
            <div class="d-flex justify-content-between">
              <small class="text-muted">-200px</small>
              <small class="fw-bold">{{ subtitleSettings.marginHorizontal }}px</small>
              <small class="text-muted">200px</small>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Настройки озвучки -->
      <div class="tts-settings mt-3">
        <h6 class="mb-3">
          <Volume2 :size="20" class="me-2" />
          Настройки озвучки
        </h6>
        
        <div class="row g-3">
          <div class="col-12">
            <div class="form-check form-switch">
              <input 
                v-model="ttsSettings.enabled" 
                class="form-check-input" 
                type="checkbox" 
                id="ttsEnabled"
              />
              <label class="form-check-label" for="ttsEnabled">
                Включить озвучку
              </label>
            </div>
          </div>
          
          <div v-if="ttsSettings.enabled" class="col-md-6">
            <label class="form-label">Язык озвучки</label>
            <select v-model="ttsSettings.language" class="form-select">
              <option value="ru">Русский</option>
              <option value="fr">Французский</option>
            </select>
          </div>
          
          <div v-if="ttsSettings.enabled" class="col-md-6">
            <label class="form-label">Громкость</label>
            <input 
              v-model.number="ttsSettings.volume" 
              type="range" 
              class="form-range" 
              min="0" 
              max="1" 
              step="0.1"
            />
            <div class="d-flex justify-content-between">
              <small class="text-muted">0%</small>
              <small class="fw-bold">{{ Math.round(ttsSettings.volume * 100) }}%</small>
              <small class="text-muted">100%</small>
            </div>
          </div>
          
          <div v-if="ttsSettings.enabled" class="col-12">
            <label class="form-label">Модель голоса</label>
            <select v-model="ttsSettings.voiceModel" class="form-select">
              <option value="silero_tts">Silero TTS (по умолчанию)</option>
            </select>
          </div>
        </div>
      </div>
      
      <!-- Кнопки управления -->
      <div class="upload-controls mt-3">
        <button
          type="button"
          class="btn btn-primary btn-upload-all"
          @click="uploadFiles"
          :disabled="isUploading || selectedFiles.length === 0"
        >
          <CloudUpload :size="20" class="me-2" />
          <span v-if="!isUploading">Загрузить все файлы</span>
          <span v-else>Загрузка...</span>
        </button>
        
        <button
          type="button"
          class="btn btn-clear-list"
          @click="clearFiles"
          :disabled="isUploading"
        >
          <Trash2 :size="20" class="me-2" />
          Очистить список
        </button>
      </div>
    </div>
    
    <!-- Прогресс загрузки -->
    <div v-if="isUploading && uploadProgress.length > 0" class="upload-progress mt-4">
      <h6 class="mb-3">
        <BarChart3 :size="20" class="me-2" />
        Прогресс загрузки
      </h6>
      
      <div class="progress-list">
        <div 
          v-for="(progress, index) in uploadProgress" 
          :key="`progress-${index}`"
          class="progress-item"
        >
          <div class="d-flex justify-content-between align-items-center mb-1">
            <span class="small">{{ progress.filename }}</span>
            <span class="small text-muted">{{ getStatusLabel(progress.status) }}</span>
          </div>
          <div class="progress">
            <div 
              class="progress-bar"
              :class="{
                'bg-success': progress.status === 'completed',
                'bg-danger': progress.status === 'error',
                'bg-primary': progress.status === 'uploading'
              }"
              :style="`width: ${progress.percent}%`"
            ></div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Модальное окно подтверждения удаления -->
    <div 
      v-if="showDeleteModal" 
      class="modal fade show d-block"
      tabindex="-1"
      style="background-color: rgba(0, 0, 0, 0.5);"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <Trash2 :size="20" class="me-2" />
              Подтверждение удаления
            </h5>
            <button 
              type="button" 
              class="btn-close" 
              @click="showDeleteModal = false"
            ></button>
          </div>
          <div class="modal-body">
            <p>Вы действительно хотите удалить файл <strong>{{ fileToDelete ? fileToDelete.name : '' }}</strong>?</p>
            <p class="text-muted small">Это действие нельзя отменить.</p>
          </div>
          <div class="modal-footer">
            <button 
              type="button" 
              class="btn btn-secondary" 
              @click="showDeleteModal = false"
            >
              Отмена
            </button>
            <button 
              type="button" 
              class="btn btn-danger" 
              @click="confirmDelete"
            >
              <Trash2 :size="16" class="me-2" />
              Удалить
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Backdrop для модального окна -->
    <div 
      v-if="showDeleteModal" 
      class="modal-backdrop fade show"
      @click="showDeleteModal = false"
    ></div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useToast } from 'vue-toastification'
import { 
  Upload, CloudUpload, FileVideo, Play, X, Trash2, BarChart3, Settings, Volume2 
} from 'lucide-vue-next'

const toast = useToast()

// Пропсы
const props = defineProps({
  maxFiles: {
    type: Number,
    default: 10
  },
  maxFileSize: {
    type: Number,
    default: 500 * 1024 * 1024 // 500MB
  },
  acceptedTypes: {
    type: Array,
    default: () => ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/mkv']
  }
})

// События
const emit = defineEmits(['upload-complete', 'upload-error', 'files-selected'])

// Реактивные данные
const selectedFiles = ref([])
const fileTitles = ref([])
const isDragActive = ref(false)
const hasError = ref(false)
const isUploading = ref(false)
const uploadProgress = ref([])
const showDeleteModal = ref(false)
const fileToDelete = ref(null)

function getStatusLabel(status) {
  switch (status) {
    case 'pending':
      return 'Ожидание'
    case 'uploading':
      return 'Загрузка'
    case 'completed':
      return 'Готово'
    case 'error':
      return 'Ошибка'
    default:
      return status
  }
}

// Настройки субтитров
const subtitleSettings = ref({
  linesCount: 1,
  fontSize: 24,
  fontColor: '#FFFFFF',
  backgroundColor: '#000000',
  backgroundTransparent: true,
  alignment: '2',
  marginVertical: 20,
  marginHorizontal: 0
})

// Настройки TTS
const ttsSettings = ref({
  enabled: false,
  volume: 0.7,
  language: 'fr',
  voiceModel: 'silero_tts'
})

let dragCounter = 0

// Методы для drag and drop
function onDragEnter(e) {
  e.preventDefault()
  dragCounter++
  isDragActive.value = true
}

function onDragOver(e) {
  e.preventDefault()
}

function onDragLeave(e) {
  e.preventDefault()
  dragCounter--
  if (dragCounter === 0) {
    isDragActive.value = false
  }
}

function onDrop(e) {
  e.preventDefault()
  dragCounter = 0
  isDragActive.value = false
  
  const files = Array.from(e.dataTransfer.files)
  processFiles(files)
}

function onFileSelect(e) {
  const files = Array.from(e.target.files)
  processFiles(files)
  // Очищаем input для возможности повторного выбора тех же файлов
  e.target.value = ''
}

function processFiles(files) {
  hasError.value = false
  
  // Фильтруем только видео файлы
  const videoFiles = files.filter(file => {
    if (!file.type.startsWith('video/')) {
      toast.warning(`Файл ${file.name} не является видео файлом`)
      return false
    }
    
    return true
  })
  
  if (videoFiles.length === 0) {
    hasError.value = true
    return
  }
  
  // Проверяем лимит файлов
  const totalFiles = selectedFiles.value.length + videoFiles.length
  if (totalFiles > props.maxFiles) {
    toast.warning(`Можно выбрать максимум ${props.maxFiles} файлов`)
    hasError.value = true
    return
  }
  
  // Добавляем файлы к выбранным
  selectedFiles.value.push(...videoFiles)
  
  // Добавляем пустые названия для новых файлов
  const newTitles = videoFiles.map(file => getDefaultTitle(file.name))
  fileTitles.value.push(...newTitles)
  
  emit('files-selected', selectedFiles.value)
  
  toast.success(`Добавлено ${videoFiles.length} файлов`)
}

function getDefaultTitle(filename) {
  // Возвращаем пустую строку, чтобы пользователь мог ввести название анализа
  // Если название не введено, будет использовано название файла
  return ''
}

function showDeleteConfirm(index) {
  fileToDelete.value = { index, name: selectedFiles.value[index].name }
  showDeleteModal.value = true
}

function confirmDelete() {
  if (fileToDelete.value) {
    const index = fileToDelete.value.index
    selectedFiles.value.splice(index, 1)
    fileTitles.value.splice(index, 1)
    emit('files-selected', selectedFiles.value)
    
    // Закрываем модальное окно
    showDeleteModal.value = false
    fileToDelete.value = null
    
    toast.success('Файл удален из списка')
  }
}

function clearFiles() {
  selectedFiles.value = []
  fileTitles.value = []
  uploadProgress.value = []
  hasError.value = false
  emit('files-selected', [])
}

async function uploadFiles() {
  if (selectedFiles.value.length === 0) return
  
  isUploading.value = true
  uploadProgress.value = selectedFiles.value.map((file) => ({
    filename: file.name,
    status: 'pending',
    percent: 0
  }))
  
  try {
    const { videoAnalysisAPI } = await import('../js/video-analysis.js')
    
    // Настройки субтитров / TTS
    const baseSubtitleOptions = {
      subtitle_lines_count: subtitleSettings.value.linesCount,
      subtitle_font_size: subtitleSettings.value.fontSize,
      subtitle_font_color: subtitleSettings.value.fontColor,
      subtitle_background_color: subtitleSettings.value.backgroundColor,
      subtitle_background_transparent: subtitleSettings.value.backgroundTransparent,
      subtitle_alignment: subtitleSettings.value.alignment,
      subtitle_margin_vertical: subtitleSettings.value.marginVertical,
      subtitle_margin_horizontal: subtitleSettings.value.marginHorizontal,
      tts_enabled: ttsSettings.value.enabled,
      tts_volume: ttsSettings.value.volume,
      tts_language: ttsSettings.value.language,
      tts_voice_model: ttsSettings.value.voiceModel
    }
    
    // Пофайловая загрузка с индивидуальным прогрессом
    const results = []
    for (let i = 0; i < selectedFiles.value.length; i++) {
      const file = selectedFiles.value[i]
      const titleInput = (fileTitles.value[i] || '').trim()
      const effectiveTitle = titleInput || file.name
      // Старт статуса
      uploadProgress.value[i].status = 'uploading'
      uploadProgress.value[i].percent = 0
      
      try {
        const res = await videoAnalysisAPI.createWithProgress(
          file,
          effectiveTitle,
          baseSubtitleOptions,
          (percent) => {
            uploadProgress.value[i].percent = percent
          }
        )
        results.push(res.data)
        uploadProgress.value[i].status = 'completed'
        uploadProgress.value[i].percent = 100
      } catch (err) {
        uploadProgress.value[i].status = 'error'
        uploadProgress.value[i].percent = 100
        console.error('Upload error for file:', file.name, err)
        // Продолжаем остальные файлы
      }
    }
    
    if (results.length > 0) {
      emit('upload-complete', results)
      toast.success(`Загружено ${results.length} из ${selectedFiles.value.length} файлов. Обработка началась.`)
      setTimeout(() => {
        clearFiles()
      }, 1500)
    } else {
      emit('upload-error', new Error('Не удалось загрузить файлы'))
      toast.error('Ошибка при загрузке файлов')
    }
  } catch (error) {
    console.error('Upload batch error:', error)
    emit('upload-error', error)
    toast.error('Ошибка при загрузке файлов')
  } finally {
    isUploading.value = false
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Экспортируем методы для родительского компонента
defineExpose({
  clearFiles,
  uploadFiles
})
</script>

<style scoped lang="scss">
.multi-video-uploader {
  .drop-zone {
    border: 3px dashed #dee2e6;
    border-radius: 15px;
    padding: 3rem 2rem;
    text-align: center;
    transition: all 0.3s ease;
    background: #f8f9fa;
    cursor: pointer;
    
    &:hover {
      border-color: #007bff;
      background: #e7f3ff;
    }
    
    &.drop-zone-active {
      border-color: #007bff;
      background: #e7f3ff;
      transform: scale(1.02);
      box-shadow: 0 8px 25px rgba(0, 123, 255, 0.15);
    }
    
    &.drop-zone-error {
      border-color: #dc3545;
      background: #f8d7da;
    }
    
    &.drop-zone-disabled {
      opacity: 0.6;
      cursor: not-allowed;
      
      &:hover {
        border-color: #dee2e6;
        background: #f8f9fa;
        transform: none;
        box-shadow: none;
      }
    }
  }
  
  .drop-zone-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  
  .drop-zone-icon {
    color: #6c757d;
    transition: color 0.3s ease;
    
    .drop-zone:hover & {
      color: #007bff;
    }
    
    .drop-zone-active & {
      color: #007bff;
    }
  }
  
  .drop-zone-text {
    h5 {
      margin: 0 0 0.5rem 0;
      color: #495057;
      font-weight: 600;
    }
    
    p {
      margin: 0;
      font-size: 0.95rem;
    }
    
    .cursor-pointer {
      cursor: pointer;
      text-decoration: underline;
      
      &:hover {
        text-decoration: none;
      }
    }
  }
  
  .selected-files {
    background: white;
    border-radius: 15px;
    padding: 1.5rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
    
    h6 {
      display: flex;
      align-items: center;
      color: #495057;
      font-weight: 600;
      margin-bottom: 1rem;
    }
  }
  
  .subtitle-settings,
  .tts-settings {
    background: white;
    border-radius: 15px;
    padding: 1.5rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
    
    h6 {
      display: flex;
      align-items: center;
      color: #495057;
      font-weight: 600;
      margin-bottom: 1rem;
    }
    
    .form-label {
      font-weight: 600;
      color: #495057;
      margin-bottom: 0.5rem;
    }
    
    .form-select, .form-control {
      border-radius: 8px;
      border: 1px solid #dee2e6;
      transition: all 0.2s ease;
      
      &:focus {
        border-color: #007bff;
        box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
      }
    }
    
    .form-range {
      height: 6px;
      background: #dee2e6;
      border-radius: 3px;
      
      &::-webkit-slider-thumb {
        background: #007bff;
        border: none;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        cursor: pointer;
        transition: all 0.2s ease;
        
        &:hover {
          background: #0056b3;
          transform: scale(1.1);
        }
      }
      
      &::-moz-range-thumb {
        background: #007bff;
        border: none;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        cursor: pointer;
        transition: all 0.2s ease;
        
        &:hover {
          background: #0056b3;
          transform: scale(1.1);
        }
      }
    }
    
    .form-control-color {
      width: 50px;
      height: 38px;
      padding: 0;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      cursor: pointer;
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
    
    .form-check {
      .form-check-input {
        border-radius: 4px;
        border: 2px solid #dee2e6;
        transition: all 0.2s ease;
        
        &:checked {
          background-color: #007bff;
          border-color: #007bff;
        }
        
        &:focus {
          box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
        }
      }
      
      .form-check-label {
        font-weight: 500;
        color: #495057;
        cursor: pointer;
      }
    }
    
    // Специальные стили для переключателя TTS
    .form-switch {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .form-switch .form-check-input {
      width: 3rem;
      height: 1.5rem;
      border-radius: 1rem;
      background-color: #dee2e6;
      border: 1px solid #dee2e6;
      transition: all 0.3s ease;
      vertical-align: middle;
      margin-top: 0;
      
      &:checked {
        background-color: #198754;
        border-color: #198754;
        
        &:focus {
          box-shadow: 0 0 0 0.2rem rgba(25, 135, 84, 0.25);
        }
      }
      
      &:focus {
        box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
      }
    }

    .form-switch .form-check-label {
      margin: 0;
      line-height: 1;
      display: flex;
      align-items: center;
    }
  }
  
  .files-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .file-item {
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 10px;
    border: 1px solid #e9ecef;
    transition: all 0.2s ease;
    &:hover {
      background: #e9ecef;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }
  
  .file-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-width: 0; // Для правильного сокращения текста
    
    .btn-delete-file {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
      border: none;
      color: white;
      border-radius: 6px;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      padding: 0;
      
      &:hover:not(:disabled) {
        background: linear-gradient(135deg, #c82333 0%, #a71e2a 100%);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
      }
      
      &:active:not(:disabled) {
        transform: translateY(0);
      }
      
      svg {
        flex-shrink: 0;
        margin: 0;
        display: block;
      }
    }
  }
  
  .file-title-input {
    margin-top: 0.75rem; // Контролируемый отступ сверху
    margin-bottom: 0; // Убираем лишний отступ снизу
    
    .input-group {
      width: 100%;
      
      .form-control {
        border-radius: 6px 0 0 6px;
      }
      
      .input-group-text {
        background: #f8f9fa;
        border-left: none;
        border-radius: 0 6px 6px 0;
        
        small {
          font-size: 0.75rem;
          white-space: nowrap;
        }
      }
    }
  }
  
  .file-icon {
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
  }
  
  .file-details {
    min-width: 0;
    flex: 1;
    margin-right: auto;
  }
  
  .file-name {
    font-weight: 600;
    color: #495057;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .file-size {
    font-size: 0.85rem;
    color: #6c757d;
  }
  
  .upload-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e9ecef;
    
    .btn {
      display: inline-flex;
      align-items: center;
      font-weight: 600;
      border-radius: 8px;
      transition: all 0.2s ease;
      flex: 1;
      justify-content: center;
      
      &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      }
    }
    
    .btn-upload-all {
      background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
      border: none;
      color: white;
      padding: 0.875rem 1.5rem;
      border-radius: 10px;
      
      &:hover:not(:disabled) {
        background: linear-gradient(135deg, #0056b3 0%, #004085 100%);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 123, 255, 0.4);
      }
      
      &:active:not(:disabled) {
        transform: translateY(0);
      }
      
      svg {
        flex-shrink: 0;
        margin: 0;
      }
    }
    
    .btn-clear-list {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
      border: none;
      color: white;
      padding: 0.875rem 1.5rem;
      border-radius: 10px;
      font-weight: 600;
      
      &:hover:not(:disabled) {
        background: linear-gradient(135deg, #c82333 0%, #a71e2a 100%);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(220, 53, 69, 0.4);
      }
      
      &:active:not(:disabled) {
        transform: translateY(0);
      }
      
      svg {
        flex-shrink: 0;
        margin: 0;
      }
    }
  }
  
  .upload-progress {
    background: white;
    border-radius: 15px;
    padding: 1.5rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
    
    h6 {
      display: flex;
      align-items: center;
      color: #495057;
      font-weight: 600;
      margin-bottom: 1rem;
    }
  }
  
  .progress-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .progress-item {
    .progress {
      height: 8px;
      border-radius: 4px;
    }
  }
  
  // Стили для модального окна
  .modal {
    z-index: 1050;
    
    .modal-content {
      border: none;
      border-radius: 15px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }
    
    .modal-header {
      border-bottom: 1px solid #e9ecef;
      padding: 1.5rem 1.5rem 1rem;
      
      .modal-title {
        display: flex;
        align-items: center;
        color: #495057;
        font-weight: 600;
        margin: 0;
      }
    }
    
    .modal-body {
      padding: 1.5rem;
      
      p {
        margin-bottom: 0.5rem;
        
        &:last-child {
          margin-bottom: 0;
        }
      }
    }
    
    .modal-footer {
      border-top: 1px solid #e9ecef;
      padding: 1rem 1.5rem 1.5rem;
      
      .btn {
        border-radius: 8px;
        font-weight: 600;
        padding: 0.5rem 1rem;
        
        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }
      }
    }
  }
  
  .modal-backdrop {
    z-index: 1040;
  }
  
  .progress-bar {
    border-radius: 4px;
    transition: width 0.3s ease;
  }
}

// Адаптивность
@media (max-width: 768px) {
  .multi-video-uploader {
    .drop-zone {
      padding: 2rem 1rem;
    }
    
    .file-item {
      flex-direction: column;
      align-items: stretch;
      gap: 1rem;
    }
    
    .file-title-input {
      .input-group {
        width: 100%;
        
        .form-control {
          width: 100%;
        }
      }
    }
    
    .upload-controls {
      flex-direction: column;
      align-items: stretch;
      
      .btn {
        justify-content: center;
      }
      
      .ms-auto {
        margin: 0 !important;
        text-align: center;
      }
    }
  }
}
</style>
