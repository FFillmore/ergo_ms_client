<template>
  <div 
    class="file-drop-zone"
    :class="{
      'is-dragover': isDragOver,
      'has-files': files.length > 0,
      'is-uploading': isUploading
    }"
    @dragover.prevent="handleDragOver"
    @dragleave.prevent="handleDragLeave"
    @drop.prevent="handleDrop"
    @click="triggerFileInput"
  >
    <input
      ref="fileInput"
      type="file"
      :accept="acceptedTypes"
      :multiple="multiple"
      @change="handleFileSelect"
      style="display: none"
    />
    
    <div class="drop-zone-content">
      <div v-if="files.length === 0" class="empty-state">
        <div class="drop-icon">
          <Upload :size="48" />
        </div>
        <h4>Перетащите файлы сюда</h4>
        <p>или <span class="click-text">нажмите для выбора</span></p>
        <div class="file-types">
          <span v-for="type in fileTypes" :key="type" class="file-type-badge">
            {{ type }}
          </span>
        </div>
      </div>
      
      <div v-else class="files-list">
        <div class="files-header">
          <h5>Загруженные файлы ({{ files.length }})</h5>
          <button 
            type="button" 
            class="btn btn-sm btn-outline-primary"
            @click.stop="triggerFileInput"
          >
            <Plus :size="16" />
            Добавить файлы
          </button>
        </div>
        
        <div class="files-grid">
          <div 
            v-for="(file, index) in files" 
            :key="`${file.name}-${index}`"
            class="file-item"
          >
            <div class="file-info">
              <div class="file-icon">
                <FileText :size="20" />
              </div>
              <div class="file-details">
                <div class="file-name">{{ file.name }}</div>
                <div class="file-size">{{ formatFileSize(file.size) }}</div>
              </div>
            </div>
            <button 
              type="button" 
              class="btn btn-sm btn-outline-danger"
              @click.stop="removeFile(index)"
              :disabled="isUploading"
            >
              <X :size="16" />
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="isUploading" class="upload-overlay">
      <div class="upload-spinner">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Загрузка...</span>
        </div>
        <p>Загрузка файлов...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Upload, FileText, Plus, X } from 'lucide-vue-next'

const props = defineProps({
  fileTypes: {
    type: Array,
    default: () => ['Excel файлы (.xlsx, .xls)']
  },
  acceptedTypes: {
    type: String,
    default: '.xlsx,.xls'
  },
  multiple: {
    type: Boolean,
    default: true
  },
  maxFiles: {
    type: Number,
    default: 10
  },
  maxFileSize: {
    type: Number,
    default: 50 * 1024 * 1024 // 50MB
  },
  isUploading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['files-selected', 'files-removed'])

const fileInput = ref(null)
const isDragOver = ref(false)
const files = ref([])

const handleDragOver = (e) => {
  e.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = (e) => {
  e.preventDefault()
  isDragOver.value = false
}

const handleDrop = (e) => {
  e.preventDefault()
  isDragOver.value = false
  
  const droppedFiles = Array.from(e.dataTransfer.files)
  addFiles(droppedFiles)
}

const handleFileSelect = (e) => {
  const selectedFiles = Array.from(e.target.files)
  addFiles(selectedFiles)
  
  // Очищаем input для возможности повторного выбора тех же файлов
  e.target.value = ''
}

const addFiles = (newFiles) => {
  const validFiles = []
  
  for (const file of newFiles) {
    // Проверяем размер файла
    if (file.size > props.maxFileSize) {
      console.warn(`Файл ${file.name} слишком большой (${formatFileSize(file.size)}). Максимальный размер: ${formatFileSize(props.maxFileSize)}`)
      continue
    }
    
    // Проверяем тип файла
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
    if (!props.acceptedTypes.includes(fileExtension)) {
      console.warn(`Файл ${file.name} имеет неподдерживаемый тип. Поддерживаемые типы: ${props.acceptedTypes}`)
      continue
    }
    
    // Проверяем, не загружен ли уже такой файл
    const isDuplicate = files.value.some(existingFile => 
      existingFile.name === file.name && existingFile.size === file.size
    )
    
    if (!isDuplicate) {
      validFiles.push(file)
    }
  }
  
  // Проверяем лимит файлов
  if (files.value.length + validFiles.length > props.maxFiles) {
    console.warn(`Превышен лимит файлов. Максимум: ${props.maxFiles}`)
    return
  }
  
  files.value.push(...validFiles)
  emit('files-selected', validFiles)
}

const removeFile = (index) => {
  const removedFile = files.value.splice(index, 1)[0]
  emit('files-removed', [removedFile])
}

const triggerFileInput = () => {
  if (!props.isUploading) {
    fileInput.value?.click()
  }
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Методы для внешнего использования
const clearFiles = () => {
  files.value = []
}

const getFiles = () => {
  return files.value
}

defineExpose({
  clearFiles,
  getFiles
})
</script>

<style scoped lang="scss">
.file-drop-zone {
  position: relative;
  border: 2px dashed var(--bs-border-color);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--bs-body-bg);
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    border-color: var(--bs-primary);
    background: var(--bs-primary-bg-subtle);
  }
  
  &.is-dragover {
    border-color: var(--bs-primary);
    background: var(--bs-primary-bg-subtle);
    transform: scale(1.02);
  }
  
  &.has-files {
    min-height: auto;
    padding: 1.5rem;
  }
  
  &.is-uploading {
    pointer-events: none;
    opacity: 0.7;
  }
}

.drop-zone-content {
  width: 100%;
}

.empty-state {
  .drop-icon {
    color: var(--bs-primary);
    margin-bottom: 1rem;
  }
  
  h4 {
    color: var(--bs-heading-color);
    margin-bottom: 0.5rem;
    font-weight: 600;
  }
  
  p {
    color: var(--bs-secondary-color);
    margin-bottom: 1rem;
    
    .click-text {
      color: var(--bs-primary);
      font-weight: 500;
    }
  }
  
  .file-types {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
    
    .file-type-badge {
      background: var(--bs-gray-100);
      color: var(--bs-secondary-color);
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 500;
    }
  }
}

.files-list {
  text-align: left;
  
  .files-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    
    h5 {
      margin: 0;
      color: var(--bs-heading-color);
      font-weight: 600;
    }
  }
  
  .files-grid {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .file-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background: var(--bs-gray-100);
    border-radius: 8px;
    border: 1px solid var(--bs-border-color);
    
    .file-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex: 1;
      
      .file-icon {
        color: var(--bs-success);
        flex-shrink: 0;
      }
      
      .file-details {
        min-width: 0;
        
        .file-name {
          font-weight: 500;
          color: var(--bs-heading-color);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .file-size {
          font-size: 0.875rem;
          color: var(--bs-secondary-color);
        }
      }
    }
  }
}

.upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  
  .upload-spinner {
    text-align: center;
    
    p {
      margin-top: 1rem;
      color: var(--bs-primary);
      font-weight: 500;
    }
  }
}

// Адаптивность
@media (max-width: 768px) {
  .file-drop-zone {
    padding: 1.5rem;
    min-height: 150px;
  }
  
  .files-list {
    .files-header {
      flex-direction: column;
      gap: 0.75rem;
      align-items: stretch;
    }
    
    .file-item {
      .file-info {
        .file-details {
          .file-name {
            font-size: 0.875rem;
          }
        }
      }
    }
  }
}
</style>
