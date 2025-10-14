<template>
  <div class="dropdown d-inline-block report-dropdown">
    <button
      type="button"
      class="btn btn-sm btn-primary dropdown-toggle"
      data-bs-toggle="dropdown"
      data-bs-auto-close="true"
      aria-expanded="false"
      title="Скачать отчет"
      @click.stop
    >
      <Download :size="14" class="me-1" />
      Скачать
    </button>
    <div class="dropdown-menu dropdown-menu-end">
      <a 
        class="dropdown-item" 
        href="#" 
        @click.prevent="downloadPDF"
        :class="{ 'disabled': downloading }"
      >
        <FileText :size="16" class="me-2" />
        PDF отчет
      </a>
      <a 
        class="dropdown-item" 
        href="#" 
        @click.prevent="downloadWord"
        :class="{ 'disabled': downloading }"
      >
        <FileText :size="16" class="me-2" />
        Word отчет
      </a>
      <div class="dropdown-divider"></div>
      <a 
        class="dropdown-item" 
        href="#" 
        @click.prevent="downloadOriginal"
        :class="{ 'disabled': downloading }"
      >
        <Image :size="16" class="me-2" />
        Исходное изображение
      </a>
    </div>
  </div>
</template>

<script>
import { Download, FileText, Image } from 'lucide-vue-next'

export default {
  name: 'ReportDropdown',
  components: {
    Download,
    FileText,
    Image
  },
  props: {
    analysisId: {
      type: [Number, String],
      required: true
    },
    downloading: {
      type: Boolean,
      default: false
    }
  },
  emits: [
    'download-pdf',
    'download-word', 
    'download-original'
  ],
  mounted() {
    // Bootstrap проверка не нужна, так как мы используем data-bs-* атрибуты
  },
  methods: {
    downloadPDF() {
      if (this.downloading) return
      this.$emit('download-pdf', this.analysisId)
    },
    
    downloadWord() {
      if (this.downloading) return
      this.$emit('download-word', this.analysisId)
    },
    
    downloadOriginal() {
      if (this.downloading) return
      this.$emit('download-original', this.analysisId)
    }
  }
}
</script>

<style>
.report-dropdown {
  position: relative;
  z-index: 10000;
}

.report-dropdown .dropdown-menu {
  z-index: 10000 !important;
  background-color: white !important;
  border: 1px solid rgba(0, 0, 0, 0.15) !important;
  border-radius: 0.375rem !important;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.175) !important;
  min-width: 200px;
  padding: 0.5rem 0;
  margin-top: 0.125rem;
}

.report-dropdown .dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  color: #212529 !important;
  background-color: transparent !important;
  border: none !important;
  width: 100%;
  text-align: left;
  transition: background-color 0.15s ease-in-out;
}

.report-dropdown .dropdown-item svg {
  flex-shrink: 0;
}

.report-dropdown .dropdown-item.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

.report-dropdown .dropdown-item:hover:not(.disabled) {
  background-color: #f8f9fa !important;
  color: #495057 !important;
}

.report-dropdown .dropdown-item:focus {
  background-color: #f8f9fa !important;
  color: #495057 !important;
  outline: none;
}

.report-dropdown .dropdown-divider {
  height: 0;
  margin: 0.5rem 0;
  overflow: hidden;
  border-top: 1px solid #e9ecef;
}

.report-dropdown .btn {
  border-radius: 6px;
  font-size: 0.8rem;
  padding: 0.375rem 0.75rem;
  font-weight: 500;
  position: relative;
  z-index: 10001;
}

.report-dropdown .btn:focus {
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

/* Убеждаемся, что выпадающий список отображается поверх других элементов */
.report-dropdown .dropdown-menu.show {
  display: block !important;
  z-index: 10000 !important;
}
</style>
