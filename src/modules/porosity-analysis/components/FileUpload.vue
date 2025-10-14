<template>
  <div class="file-upload-section">
    <div class="section-header">
      <h3 class="section-title">Изображения</h3>
      <p class="section-subtitle">Загрузите одно или несколько изображений</p>
    </div>

    <div
      class="upload-zone"
      :class="{ 'upload-zone--dragover': dragActive }"
      @dragenter.prevent="onDragEnter"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDropFiles"
      @click="openFileDialog"
      role="button"
      tabindex="0"
    >
      <div class="upload-icon">
        <Upload :size="32" />
      </div>
      <div class="upload-content">
        <div class="upload-title">Перетащите файлы сюда</div>
        <div class="upload-divider">или</div>
        <button type="button" class="btn-upload" @click.stop="openFileDialog">
          Выбрать файлы
        </button>
        <div class="upload-info">PNG, JPG, JPEG • можно выбрать несколько</div>
      </div>
      <input
        type="file"
        class="d-none"
        :id="inputId"
        @change="handleFileUpload"
        accept="image/*"
        multiple
        :ref="inputRef"
      />
    </div>

    <!-- Список выбранных файлов -->
    <div v-if="selectedFiles.length > 0" class="selected-files-section">
      <div class="files-header">
        <h4 class="files-count">Выбрано файлов: {{ selectedFiles.length }}</h4>
      </div>
      <div class="files-list">
        <div
          v-for="(file, index) in selectedFiles"
          :key="index"
          class="file-item"
        >
          <div class="file-info">
            <Image :size="18" class="file-icon" />
            <span class="file-name">{{ file.name }}</span>
            <span class="file-size">{{ formatFileSize(file.size) }}</span>
          </div>
          <button
            type="button"
            class="file-remove"
            @click="removeFile(index)"
            title="Удалить файл"
          >
            <X :size="16" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Upload, Image, X } from 'lucide-vue-next'

export default {
  name: 'FileUpload',
  components: {
    Upload,
    Image,
    X
  },
  props: {
    selectedFiles: {
      type: Array,
      default: () => []
    },
    inputId: {
      type: String,
      default: 'fileInput'
    }
  },
  data() {
    return {
      dragActive: false
    }
  },
  computed: {
    inputRef() {
      return `fileInput_${this.inputId}`
    }
  },
  methods: {
    openFileDialog() {
      if (this.$refs[this.inputRef]) {
        this.$refs[this.inputRef].click()
      }
    },
    onDragEnter() {
      this.dragActive = true
    },
    onDragOver() {
      this.dragActive = true
    },
    onDragLeave() {
      this.dragActive = false
    },
    onDropFiles(event) {
      try {
        const dt = event.dataTransfer
        if (!dt || !dt.files || dt.files.length === 0) return
        const eventLike = { target: { files: dt.files } }
        this.handleFileUpload(eventLike)
      } finally {
        this.dragActive = false
      }
    },
    handleFileUpload(event) {
      const newFiles = Array.from(event.target.files || [])
      const merged = [...this.selectedFiles, ...newFiles]
      // Удаляем дубликаты по ключу (name + size + lastModified)
      const seen = new Set()
      const unique = []
      for (const f of merged) {
        const key = `${f.name}__${f.size}__${f.lastModified}`
        if (!seen.has(key)) {
          seen.add(key)
          unique.push(f)
        }
      }
      this.$emit('update:selectedFiles', unique)
      // Сбрасываем значение инпута, чтобы можно было выбрать те же имена снова
      if (this.$refs[this.inputRef]) {
        this.$refs[this.inputRef].value = ''
      }
    },
    removeFile(index) {
      if (index >= 0 && index < this.selectedFiles.length) {
        const newFiles = [...this.selectedFiles]
        newFiles.splice(index, 1)
        this.$emit('update:selectedFiles', newFiles)
      }
    },
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Б'
      const k = 1024
      const sizes = ['Б', 'КБ', 'МБ', 'ГБ']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
    }
  }
}
</script>

<style scoped>
.file-upload-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section-header {
  margin-bottom: 1rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 0.5rem 0;
}

.section-subtitle {
  font-size: 0.9rem;
  color: #718096;
  margin: 0;
  line-height: 1.4;
}

/* Зона загрузки */
.upload-zone {
  border: 3px dashed #cbd5e0;
  border-radius: 16px;
  padding: 2.5rem 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f8fafc;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.upload-zone:hover {
  border-color: #667eea;
  background: #f0f4ff;
  transform: translateY(-2px);
}

.upload-zone--dragover {
  border-color: #38a169;
  background: #f0fff4;
  transform: scale(1.02);
  box-shadow: 0 8px 32px rgba(56, 161, 105, 0.2);
}

.upload-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.upload-zone--dragover .upload-icon {
  background: linear-gradient(135deg, #38a169 0%, #2f855a 100%);
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.upload-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
}

.upload-divider {
  font-size: 0.9rem;
  color: #a0aec0;
  font-weight: 500;
}

.btn-upload {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  padding: 0.625rem 1.25rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-upload:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
}

.upload-info {
  font-size: 0.85rem;
  color: #718096;
  line-height: 1.4;
}

/* Выбранные файлы */
.selected-files-section {
  margin-top: 1.5rem;
}

.files-header {
  margin-bottom: 1rem;
}

.files-count {
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.files-list {
  max-height: 240px;
  overflow-y: auto;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1rem;
  border-bottom: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.file-item:last-child {
  border-bottom: none;
}

.file-item:hover {
  background: #edf2f7;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
}

.file-icon {
  color: #667eea;
  flex-shrink: 0;
}

.file-name {
  font-weight: 500;
  color: #2d3748;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.file-size {
  font-size: 0.8rem;
  color: #718096;
  margin-left: auto;
  flex-shrink: 0;
}

.file-remove {
  background: none;
  border: none;
  color: #e53e3e;
  padding: 0.25rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-remove:hover {
  background: #fed7d7;
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .upload-zone {
    padding: 2rem 1rem;
    min-height: 160px;
  }
  
  .upload-icon {
    width: 56px;
    height: 56px;
  }
}
</style>
