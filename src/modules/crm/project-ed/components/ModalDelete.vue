<template>
  <div 
    v-if="show" 
    class="modal fade show d-block modal-delete" 
    tabindex="-1"
  >
    <div class="modal-dialog modal-dialog-centered" style="z-index: 1000000;">
      <div class="modal-content">
        <div class="modal-header border-0 pb-0">
          <div class="d-flex align-items-center gap-2">
            <AlertTriangle 
              size="24" 
              class="text-danger"
            />
            <h5 class="modal-title mb-0">Удаление проекта</h5>
          </div>
          <button 
            type="button" 
            class="btn-close" 
            @click="handleCancel"
            :disabled="isDeleting"
          ></button>
        </div>
        
        <div class="modal-body pt-2">
          <p class="mb-0">Вы действительно хотите удалить этот проект? Это действие нельзя отменить.</p>
        </div>
        
        <div class="modal-footer border-0 pt-2">
          <button 
            type="button" 
            class="btn btn-secondary" 
            @click="handleCancel"
            :disabled="isDeleting"
          >
            Отмена
          </button>
          <button 
            type="button" 
            class="btn btn-danger"
            @click="handleConfirm"
            :disabled="isDeleting || confirmDisabled"
          >
            <span 
              v-if="isDeleting" 
              class="spinner-border spinner-border-sm me-2" 
              role="status"
            ></span>
            {{ confirmButtonText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { AlertTriangle } from 'lucide-vue-next'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  confirmDisabled: {
    type: Boolean,
    default: false
  },
  confirmText: {
    type: String,
    default: 'Удалить'
  },
  isDeleting: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['confirm', 'cancel', 'close'])

// Динамический текст кнопки
const confirmButtonText = computed(() => {
  if (props.isDeleting) {
    return 'Удаление...'
  }
  return props.confirmText
})

function handleConfirm() {
  if (!props.isDeleting && !props.confirmDisabled) {
    emit('confirm')
  }
}

function handleCancel() {
  if (!props.isDeleting) {
    emit('cancel')
    emit('close')
  }
}
</script>

<style scoped>
.modal-delete {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  z-index: 999999 !important;
  background-color: rgba(0, 0, 0, 0.5) !important;
}

.modal-dialog {
  z-index: 1000000 !important;
  position: relative !important;
}

.modal-content {
  border: none;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  z-index: 1000001 !important;
  position: relative !important;
}

.modal-header, .modal-footer {
  padding: 1.5rem;
}

.modal-body {
  padding: 0 1.5rem 1rem;
  color: #6c757d;
}

.btn {
  border-radius: 8px;
  font-weight: 500;
}

.btn-close:focus {
  box-shadow: none;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}
</style>
