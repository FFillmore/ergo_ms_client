<template>
  <BaseInfoCard title="Календарный план-график" :project-data="projectData" @edit-click="openEditModal">
      <div class="info-section">
        <div class="section-content">
          <div v-if="loadingStages" class="loading-state">
            <div class="spinner-border spinner-border-sm text-primary" role="status">
              <span class="visually-hidden">Загрузка...</span>
            </div>
            <span class="ms-2">Загрузка этапов...</span>
          </div>
          <div v-else-if="projectStages && projectStages.length > 0" class="stages-timeline">
            <div class="timeline-container">
              <div 
                v-for="(stage, index) in projectStages" 
                :key="stage.id || index"
                class="timeline-item"
              >
                <div class="timeline-marker">
                  <div class="stage-number">{{ index + 1 }}</div>
                </div>
                <div class="timeline-content">
                  <div class="stage-card">
                    <div class="stage-header">
                      <h6 class="stage-title">
                        <a href="#" class="stage-link" @click.prevent="navigateToStage(stage)">
                          Этап №{{ index + 1 }}. {{ stage.name }}
                        </a>
                      </h6>
                      <div class="stage-dates">
                        <Calendar class="date-icon" />
                        <span class="date-range">
                          {{ formatDate(stage.start_date) }} — {{ formatDate(stage.end_date) }}
                        </span>
                      </div>
                    </div>
                    <div class="stage-body">
                      <div v-if="stage.planned_results" class="stage-results">
                        <h6 class="results-title">
                          <Target class="results-icon" />
                          Планируемые результаты
                        </h6>
                        <p class="results-text">{{ stage.planned_results }}</p>
                      </div>
                      <div v-else class="no-results">
                        <span class="text-muted">Результаты не указаны</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p v-else class="text-muted">Этапы проекта не найдены</p>
        </div>
      </div>
  </BaseInfoCard>
  <ProjectUnifiedEditModal
    :is-open="unifiedModalOpen"
    :project-data="projectData"
    focus-section="calendar"
    @close="unifiedModalOpen = false"
    @saved="onUnifiedSaved"
  />
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { Calendar, Target } from 'lucide-vue-next'
import BaseInfoCard from '@/modules/crm/project-ed/Project/ProjectTabs/components/BaseInfoCard.vue'
import ProjectUnifiedEditModal from '@/modules/crm/project-ed/Project/ProjectTabs/components/ProjectUnifiedEditModal.vue'

const props = defineProps({
  projectData: {
    type: Object,
    default: null
  }
})

const projectStages = ref([])
const loadingStages = ref(false)
const unifiedModalOpen = ref(false)
const emit = defineEmits(['saved', 'cancelled'])

// Локальная модель плана для редактирования
const localPlan = ref({
  startDate: '',
  endDate: '',
  stages: []
})

// Загружаем этапы проекта из данных
const loadProjectStages = () => {
  if (!props.projectData?.stages) {
    projectStages.value = []
    return
  }
  
  // Этапы уже приходят отсортированными из API (ordering = ['order', 'start_date', 'id'])
  projectStages.value = props.projectData.stages.map(stage => ({
    id: stage.id,
    name: stage.name,
    start_date: stage.start_date,
    end_date: stage.end_date,
    planned_results: stage.planned_results,
    order: stage.order
  }))
}

// Форматирование даты
const formatDate = (dateString) => {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString)
    const day = date.getDate()
    const year = date.getFullYear()
    
    // Получаем месяц в родительном падеже для корректного склонения
    const monthNames = [
      'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
      'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ]
    
    const month = monthNames[date.getMonth()]
    return `${day} ${month} ${year} года`
  } catch (error) {
    return dateString
  }
}

// Загружаем этапы при изменении данных проекта
watch(() => props.projectData?.stages, () => {
  loadProjectStages()
}, { immediate: true })

// Загружаем этапы при монтировании компонента
onMounted(() => {
  loadProjectStages()
})

// Навигация к этапу проекта
const navigateToStage = (stage) => {
  // TODO: Реализовать переход на страницу этапа проекта
  // Например: router.push(`/projects/${props.projectData.id}/stages/${stage.id}`)
  console.log('Переход к этапу:', stage)
}

// Открытие/закрытие модалки
function openEditModal() { unifiedModalOpen.value = true }

// Блокируем прокрутку страницы при открытой модалке
watch(unifiedModalOpen, (isOpen) => {
  try {
    const body = document?.body
    const html = document?.documentElement
    if (!body || !html) return
    if (isOpen) {
      body.style.overflow = 'hidden'
      html.style.overflow = 'hidden'
    } else {
      body.style.overflow = ''
      html.style.overflow = ''
    }
  } catch (e) { /* no-op */ }
})

onUnmounted(() => {
  try {
    const body = document?.body
    const html = document?.documentElement
    if (body) body.style.overflow = ''
    if (html) html.style.overflow = ''
  } catch (e) { /* no-op */ }
})

function onUnifiedSaved(payload) {
  if (payload?.section === 'calendar') {
    // перерисуем локально данные этапов при необходимости
    if (Array.isArray(payload?.data?.stages)) {
      projectStages.value = payload.data.stages
    }
    unifiedModalOpen.value = false
  }
}
</script>

<style scoped lang="scss">
.info-section {
  margin-bottom: 2rem;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.loading-state {
  display: flex;
  align-items: center;
  color: var(--color-text-muted);
  padding: 1rem 0;
}

.stages-timeline {
  margin-top: 0.5rem;
}

.timeline-container {
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    left: 1rem;
    top: 2rem;
    bottom: 2rem;
    width: 2px;
    background: linear-gradient(
      to bottom,
      var(--color-primary),
      var(--color-primary-light, rgba(var(--color-primary-rgb), 0.3))
    );
    border-radius: 1px;
  }
}

.timeline-item {
  position: relative;
  margin-bottom: 1rem;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.timeline-marker {
  position: absolute;
  left: -2rem;
  top: 0.5rem;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary);
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(var(--color-primary-rgb), 0.3);
  z-index: 2;
  
  .stage-number {
    color: white;
    font-weight: 600;
    font-size: 0.875rem;
    line-height: 1;
  }
}

.timeline-content {
  margin-left: 0;
}

.stage-card {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }
}

.stage-header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--color-border);
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  
  .stage-title {
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.3;
    
    .stage-link {
      color: #0d6efd;
      text-decoration: none;
      transition: all 0.2s ease;
      
      &:hover {
        color: #0a58ca;
      }
      
      &:focus {
        outline: 2px solid #0d6efd;
        outline-offset: 2px;
        border-radius: 2px;
      }
    }
  }
  
  .stage-dates {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    .date-icon {
      width: 16px;
      height: 16px;
      color: var(--color-primary);
      flex-shrink: 0;
    }
    
    .date-range {
      color: var(--color-text-secondary);
      font-size: 0.8rem;
      font-weight: 500;
    }
  }
}

.stage-body {
  padding: 1rem 1.25rem;
}

.stage-results {
  .results-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0 0 0.75rem 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text-primary);
    
    .results-icon {
      width: 14px;
      height: 14px;
      color: var(--color-success);
      flex-shrink: 0;
    }
  }
  
  .results-text {
    margin: 0;
    color: var(--color-text-secondary);
    line-height: 1.5;
    font-size: 0.875rem;
  }
}

.no-results {
  padding: 0.5rem 0;
}

.text-muted {
  color: var(--color-text-muted);
  font-style: italic;
  margin-bottom: 0;
}

// Адаптивность для мобильных устройств
@media (max-width: 768px) {
  .timeline-container {
    padding-left: 1.5rem;
    
    &::before {
      left: 0.75rem;
    }
  }
  
  .timeline-marker {
    left: -1.5rem;
    width: 1.5rem;
    height: 1.5rem;
    
    .stage-number {
      font-size: 0.75rem;
    }
  }
  
  .stage-card {
    border-radius: 8px;
  }
  
  .stage-header {
    padding: 0.75rem 1rem;
    
    .stage-title {
      font-size: 0.9rem;
    }
    
    .stage-dates {
      .date-range {
        font-size: 0.75rem;
      }
    }
  }
  
  .stage-body {
    padding: 0.75rem 1rem;
  }
  
  .stage-results {
    .results-title {
      font-size: 0.8rem;
    }
    
    .results-text {
      font-size: 0.8rem;
    }
  }
}
</style>
