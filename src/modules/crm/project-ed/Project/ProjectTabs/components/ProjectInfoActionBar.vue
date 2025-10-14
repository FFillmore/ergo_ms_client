<template>
    <div v-if="isProjectManager" class="action-bar">
        <button 
            @click="showConfirmModal" 
            :disabled="isSubmitting || !canSubmit"
            class="btn btn-primary btn-sm w-100"
        >
            <Send v-if="!isSubmitting" class="me-2" size="16" />
            <div v-else class="spinner-border spinner-border-sm me-2" role="status">
                <span class="visually-hidden">Загрузка...</span>
            </div>
            {{ isSubmitting ? 'Отправка...' : 'Отправить на рассмотрение' }}
        </button>
    </div>

    <!-- Модальное окно подтверждения -->
    <ConfirmDialog
        :show="showModal"
        title="Отправка проекта на рассмотрение"
        :message="confirmMessage"
        confirm-text="Да, отправить"
        cancel-text="Отмена"
        variant="warning"
        @confirm="submitForReview"
        @cancel="showModal = false"
        @close="showModal = false"
    />
</template>

<script setup>
import { computed, ref } from 'vue'
import { Send } from 'lucide-vue-next'
import { useToast } from 'vue-toastification'
import { useUserStore } from '@/core/cms/js/userStore.js'
import { apiClient } from '@/js/api/manager.js'
import { isProjectManager as isProjectManagerUtil } from '@/modules/crm/project-ed/js/projectRoles.js'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const props = defineProps({
  projectData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['project-submitted'])

const toast = useToast()
const userStore = useUserStore()

const isSubmitting = ref(false)
const showModal = ref(false)

const confirmMessage = 'После отправки проекта на рассмотрение экспертной группе, проект будет недоступен для редактирования до завершения рассмотрения. Вы уверены, что хотите отправить проект на рассмотрение?'

// Проверяем, является ли текущий пользователь руководителем проекта
const isProjectManager = computed(() => isProjectManagerUtil(userStore.user, props.projectData))

// Проверяем, можно ли отправить проект на рассмотрение
const canSubmit = computed(() => {
  if (!props.projectData) return false
  
  const status = props.projectData.status
  // Можно отправить только если проект в статусе "Черновик"
  return status === 'draft'
})

const showConfirmModal = () => {
  if (!canSubmit.value || isSubmitting.value) return
  showModal.value = true
}

const submitForReview = async () => {
  if (!canSubmit.value || isSubmitting.value) return
  
  try {
    isSubmitting.value = true
    showModal.value = false
    
    // Отправляем запрос на изменение статуса проекта
    const response = await apiClient.patch(
      `project_ed/projects/${props.projectData.id}/`,
      { status: 'pending' }
    )
    
    if (response.data) {
      toast.success('Проект успешно отправлен на рассмотрение')
      emit('project-submitted', response.data)
    }
    
  } catch (error) {
    console.error('Ошибка отправки проекта на рассмотрение:', error)
    toast.error('Ошибка отправки проекта на рассмотрение')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped lang="scss">
.action-bar {
  margin-bottom: 1rem;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}
</style>