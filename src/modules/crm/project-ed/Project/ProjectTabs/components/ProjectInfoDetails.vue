<template>
  <BaseInfoCard 
    title="Основная информация" 
    :project-data="projectData"
    @edit-click="openEditModal"
  >
    
    <div class="info-section">
      <h5 class="section-title">
        <Edit class="section-icon" />
        Уточняющее название
      </h5>
      <div class="section-content">
        <p v-if="clarifyingTitle" class="clarifying-title-text">{{ clarifyingTitle }}</p>
        <p v-else class="text-muted">Уточняющее название не указано</p>
      </div>
    </div>

    <div class="info-section">
      <h5 class="section-title">
        <Target class="section-icon" />
        Цель проекта
      </h5>
      <div class="section-content">
        <p v-if="projectGoal" class="goal-text">{{ projectGoal }}</p>
        <p v-else class="text-muted">Цель проекта не указана</p>
      </div>
    </div>

    <div class="info-section">
      <h5 class="section-title">
        <List class="section-icon" />
        Задачи проекта
      </h5>
      <div class="section-content">
        <div v-if="loadingTasks" class="loading-state">
          <div class="spinner-border spinner-border-sm text-primary" role="status">
            <span class="visually-hidden">Загрузка...</span>
          </div>
          <span class="ms-2">Загрузка задач...</span>
        </div>
        <div v-else-if="projectTasks && projectTasks.length > 0" class="tasks-list">
          <div 
            v-for="(task, index) in projectTasks" 
            :key="task.id || index"
            class="task-item"
          >
            <span class="task-number">{{ index + 1 }}.</span>
            <div class="task-content">
              <span class="task-text">{{ task.title }}</span>
              <span v-if="task.description" class="task-description">{{ task.description }}</span>
            </div>
          </div>
        </div>
        <p v-else class="text-muted">Задачи проекта не найдены</p>
      </div>
    </div>

    <div class="info-section">
      <h5 class="section-title">
        <CheckCircle class="section-icon" />
        Планируемые результаты
      </h5>
      <div class="section-content">
        <div v-if="projectResults && projectResults.length > 0" class="results-list">
          <div 
            v-for="(result, index) in projectResults" 
            :key="index"
            class="result-item"
          >
            <Check class="result-icon" />
            <span class="result-text">{{ result }}</span>
          </div>
        </div>
        <p v-else class="text-muted">Планируемые результаты не указаны</p>
      </div>
    </div>

    
  </BaseInfoCard>
  <ProjectUnifiedEditModal
    :is-open="unifiedModalOpen"
    :project-data="projectData"
    :user-role="userRole"
    :user-info="userInfo"
    :rector-info="rectorInfo"
    focus-section="details"
    @close="unifiedModalOpen = false"
    @saved="onUnifiedSaved"
    @update:projectData="onUnifiedProjectUpdate"
  />
</template>

<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { Target, List, CheckCircle, Check, Edit } from 'lucide-vue-next'
import { useToast } from 'vue-toastification'
import BaseInfoCard from '@/modules/crm/project-ed/Project/ProjectTabs/components/BaseInfoCard.vue'
import BasicProvisions from '@/modules/crm/project-ed/components/steps/BasicProvisions.vue'
import { apiClient } from '@/js/api/manager.js'
import { endpoints } from '@/js/api/endpoints.js'
import ProjectUnifiedEditModal from '@/modules/crm/project-ed/Project/ProjectTabs/components/ProjectUnifiedEditModal.vue'

const props = defineProps({
  projectData: {
    type: Object,
    default: null
  },
  userRole: {
    type: String,
    default: null
  },
  userInfo: {
    type: Object,
    default: null
  },
  rectorInfo: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['project-updated'])

const toast = useToast()

// Единое модальное окно
const unifiedModalOpen = ref(false)
const isSaving = ref(false)
const basicProvisionsRef = ref(null)

// Данные для редактирования
const editProvisions = ref({})
const selectedEvent = ref(null)

const projectTasks = ref([])
const loadingTasks = ref(false)

const clarifyingTitle = computed(() => {
  if (!props.projectData) return ''
  
  // Используем поле name_clarification из модели Project
  return props.projectData.name_clarification || ''
})

const projectGoal = computed(() => {
  if (!props.projectData) return ''
  
  // Пробуем разные возможные поля для цели проекта
  return props.projectData.goal || 
         props.projectData.objective || 
         props.projectData.description || 
         props.projectData.purpose || 
         ''
})

const projectResults = computed(() => {
  if (!props.projectData) return []
  
  // Используем данные из project_ed API
  if (props.projectData.planned_results && Array.isArray(props.projectData.planned_results)) {
    return props.projectData.planned_results.map(result => result.description)
  }
  
  // Fallback на другие возможные поля
  const results = props.projectData.results || 
                  props.projectData.expected_results || 
                  props.projectData.deliverables || 
                  props.projectData.outcomes || 
                  []
  
  // Если это строка, разделяем по переносам строк или запятым
  if (typeof results === 'string') {
    return results.split(/[\n,;]/).map(result => result.trim()).filter(result => result)
  }
  
  // Если это массив, возвращаем как есть
  return Array.isArray(results) ? results : []
})

// Раздел "Дополнительная информация" перенесен в отдельный компонент ProjectInfoAdditionalInfo

// Загружаем задачи проекта из данных (они уже приходят с проектом)
const loadProjectTasks = () => {
  if (!props.projectData?.tasks) {
    projectTasks.value = []
    return
  }
  
  // Преобразуем задачи из project_ed API в нужный формат
  projectTasks.value = props.projectData.tasks.map(task => ({
    id: task.id,
    title: task.description,
    description: '' // У project_ed задач нет отдельного описания
  }))
}


// Загружаем задачи при изменении данных проекта
watch(() => props.projectData?.tasks, () => {
  loadProjectTasks()
}, { immediate: true })

// Загружаем задачи при монтировании компонента
onMounted(() => {
  loadProjectTasks()
})

onUnmounted(() => {})

// Методы для работы с модальным окном
const openEditModal = async () => { unifiedModalOpen.value = true }
const closeEditModal = () => { unifiedModalOpen.value = false }

const updateEditProvisions = (newProvisions) => {
  editProvisions.value = { ...newProvisions }
}

const saveChanges = async () => {}

function onUnifiedSaved(payload) {
  if (payload?.section === 'details') {
    emit('project-updated')
    unifiedModalOpen.value = false
  }
}

function onUnifiedProjectUpdate(updated) {
  // Пробрасываем наверх, если родитель ожидает синхронизацию данных проекта
  // Здесь компонент не принимает v-model, поэтому просто закрываем модалку
  unifiedModalOpen.value = false
}
</script>

<style scoped lang="scss">
.info-section {
  margin-bottom: 2rem;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-primary-text);
  line-height: 1.2;
}

.section-icon {
  width: 18px;
  height: 18px;
  color: var(--color-primary-text);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-content {
  margin-left: 1.5rem;
}

.clarifying-title-text {
  line-height: 1.6;
  color: var(--color-primary-text);
  margin-bottom: 0;
  font-weight: 500;
}

.goal-text {
  line-height: 1.6;
  color: var(--color-primary-text);
  margin-bottom: 0;
}

.loading-state {
  display: flex;
  align-items: center;
  color: var(--color-secondary-text);
  padding: 1rem 0;
}

.tasks-list {
  display: flex;
  justify-content: center;
  flex-direction: column;
  gap: 1rem;
}

.task-item {
  display: flex;
  align-items: center;
}

.task-number {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: var(--color-primary-text);
  min-width: 1.5rem;
  flex-shrink: 0;
}

.task-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.task-text {
  color: var(--color-primary-text);
  font-weight: 500;
  line-height: 1.4;
}

.task-description {
  color: var(--color-secondary-text);
  font-size: 0.875rem;
  line-height: 1.4;
}


.results-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  line-height: 1.5;
}

.result-icon {
  width: 16px;
  height: 16px;
  color: var(--color-success);
  margin-top: 0.125rem;
  flex-shrink: 0;
}

.result-text {
  color: var(--color-primary-text);
  flex: 1;
}

.text-muted {
  color: var(--color-secondary-text);
  font-style: italic;
  margin-bottom: 0;
}

.additional-info-text {
  line-height: 1.6;
  color: var(--color-primary-text);
  margin-bottom: 0;
  white-space: pre-wrap;
}

/* Стили для модального окна */
.modal-content {
  background-color: var(--color-primary-background);
}

.modal-body {
  background-color: var(--color-primary-background);
}
</style>
