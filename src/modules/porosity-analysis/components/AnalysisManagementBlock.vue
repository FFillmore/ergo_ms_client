<template>
  <div class="row g-3">
    <!-- Перезапуск по номерам -->
    <div class="col-12">
      <div class="analysis-section">
        <label class="form-label d-flex align-items-center gap-2 mb-3">
          <RefreshCw size="16" />
          <span class="fw-semibold">Перезапуск по номерам</span>
        </label>
        <div class="row g-3">
          <div class="col-md-8">
            <div class="input-group">
              <span class="input-group-text d-inline-flex align-items-center">
                <Hash size="16" />
              </span>
              <input
                v-model.trim="localNumberInput"
                type="text"
                class="form-control"
                placeholder="Введите номера анализов через запятую или тире для диапазонов"
                @keyup.enter="restartMultipleByNumbers"
                @input="updateNumberInput"
              />
              <button
                class="btn btn-warning d-inline-flex align-items-center gap-1 lh-1"
                :disabled="!canRestartByInput || restartingMultiple"
                @click="restartMultipleByNumbers"
              >
                <RefreshCw size="16" />
                <span v-if="restartingMultiple">Перезапуск...</span>
                <span v-else>Перезапустить</span>
              </button>
            </div>
            <div class="form-text text-muted mt-2">
              <Info class="me-1" size="14" />
              Введите номера анализов через запятую или тире для диапазонов.
            </div>
          </div>
          <div class="col-md-4">
            <button 
              class="btn btn-warning d-inline-flex align-items-center w-100" 
              :disabled="selectedIds.length === 0 || restartingMultiple" 
              @click="restartSelectedMultiple"
            >
              <RefreshCw class="me-1" size="14" /> 
              Перезапустить выбранные ({{ selectedIds.length }})
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Массовое удаление -->
    <div class="col-12">
      <div class="analysis-section">
        <label class="form-label d-flex align-items-center gap-2 mb-3">
          <Trash2 size="16" />
          <span class="fw-semibold">Массовое удаление</span>
        </label>
        <div class="row g-3">
          <div class="col-md-8">
            <div class="input-group">
              <span class="input-group-text d-inline-flex align-items-center">
                <Hash size="16" />
              </span>
              <input
                v-model.trim="localBulkDeleteInput"
                type="text"
                class="form-control"
                placeholder="Введите номера анализов для удаления"
                @keyup.enter="previewBulkDelete"
                @input="updateBulkDeleteInput"
              />
              <button
                class="btn btn-outline-danger d-inline-flex align-items-center gap-1 lh-1"
                :disabled="!canBulkDeleteByInput || bulkDeleting"
                @click="previewBulkDelete"
              >
                <Eye size="16" />
                Предварительный просмотр
              </button>
            </div>
            <div class="form-text text-muted mt-2">
              <Info class="me-1" size="14" />
              Введите номера анализов через запятую или тире для диапазонов.
            </div>
          </div>
          <div class="col-md-4">
            <button 
              class="btn btn-danger d-inline-flex align-items-center w-100" 
              :disabled="selectedIds.length === 0 || bulkDeleting" 
              @click="previewBulkDeleteSelected"
            >
              <Trash2 class="me-1" size="14" /> 
              Удалить выбранные ({{ selectedIds.length }})
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { RefreshCw, Trash2, Hash, Info, Eye } from 'lucide-vue-next'

export default {
  name: 'AnalysisManagementBlock',
  components: {
    RefreshCw,
    Trash2,
    Hash,
    Info,
    Eye
  },
  props: {
    selectedIds: {
      type: Array,
      default: () => []
    },
    numberInput: {
      type: String,
      default: ''
    },
    bulkDeleteInput: {
      type: String,
      default: ''
    },
    restartingMultiple: {
      type: Boolean,
      default: false
    },
    bulkDeleting: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      localNumberInput: this.numberInput,
      localBulkDeleteInput: this.bulkDeleteInput
    }
  },
  watch: {
    numberInput(newVal) {
      this.localNumberInput = newVal
    },
    bulkDeleteInput(newVal) {
      this.localBulkDeleteInput = newVal
    },
  },
  computed: {
    canRestartByInput() {
      return this.localNumberInput.trim().length > 0
    },
    canBulkDeleteByInput() {
      return this.localBulkDeleteInput.trim().length > 0
    },
  },
  methods: {
    updateNumberInput() {
      this.$emit('update:numberInput', this.localNumberInput)
    },
    updateBulkDeleteInput() {
      this.$emit('update:bulkDeleteInput', this.localBulkDeleteInput)
    },
    restartMultipleByNumbers() {
      this.$emit('restart-multiple-by-numbers', this.localNumberInput)
    },
    restartSelectedMultiple() {
      this.$emit('restart-selected-multiple', this.selectedIds)
    },
    previewBulkDelete() {
      this.$emit('preview-bulk-delete', this.localBulkDeleteInput)
    },
    previewBulkDeleteSelected() {
      this.$emit('preview-bulk-delete-selected', this.selectedIds)
    },
  }
}
</script>

<style scoped>
.analysis-section {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  border: 1px solid #e9ecef;
}

.analysis-section .form-label {
  color: #495057;
  font-weight: 600;
}

.analysis-section .input-group-text {
  background-color: #f8f9fa;
  border-color: #dee2e6;
  color: #6c757d;
}

.analysis-section .form-control {
  border-left: 0;
  border-right: 0;
}

.analysis-section .form-control:focus {
  border-color: #007bff;
  box-shadow: none;
}

.analysis-section .form-select {
  border-left: 0;
  border-right: 0;
}

.analysis-section .form-select:focus {
  border-color: #007bff;
  box-shadow: none;
}

.analysis-section .btn {
  border-radius: 6px;
  font-size: 0.875rem;
  padding: 0.375rem 0.75rem;
}

.analysis-section .form-text {
  font-size: 0.8rem;
  color: #6c757d;
}

@media (max-width: 768px) {
  .analysis-section {
    padding: 1rem;
  }
  
  .analysis-section .row .col-md-4 .btn {
    margin-top: 0.5rem;
  }
}
</style>
