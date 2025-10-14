<template>
    <div class="overview-grid">
        <div class="overview-main">
            <ProjectReviewSummary :project-data="projectData" />
            <ProjectDashboard v-if="canSeePrivileged" :project-data="projectData" />
            <ProjectAudit :project-data="projectData" />

            <ProjectInfoEvent 
              :project-data="projectData" 
              @update:project-data="onProjectUpdated"
            />
            <ProjectInfoDetails 
              :project-data="projectData" 
              :user-role="userRole"
              :user-info="userInfo"
              :rector-info="rectorInfo"
              @project-updated="onProjectUpdated"
            />
            <ProjectInfoTargetInd :project-data="projectData" />
            <ProjectInfoCalendar :project-data="projectData" />
            <ProjectInfoBudget :project-data="projectData" />
            <ProjectInfoAdditionalInfo :project-data="projectData" />
        </div>
        <aside class="overview-aside">
            <ProjectInfoActionBar 
              :project-data="projectData"
              @project-submitted="onProjectSubmitted"
            />
            <ProjectInfo 
              :project-roles="projectRoles" 
              :status-label="projectStatusLabel" 
              :status-variant="projectStatusVariant"
              :start-date="projectStartDate"
              :end-date="projectEndDate"
              :performers="projectPerformers"
              :project-data="projectData"
              @project-deleted="onProjectDeleted"
            />
        </aside>
    </div>
    
    
</template>

<script setup>
import { computed } from 'vue'
import ProjectReviewSummary from '@/modules/crm/project-ed/Project/ProjectTabs/components/ProjectReviewSummary.vue'
import ProjectDashboard from '@/modules/crm/project-ed/Project/ProjectTabs/components/ProjectDashboard.vue'
import ProjectAudit from '@/modules/crm/project-ed/Project/ProjectTabs/components/ProjectAudit.vue'
import ProjectInfo from '@/modules/crm/project-ed/Project/ProjectTabs/components/ProjectInfo.vue'
import ProjectInfoActionBar from '@/modules/crm/project-ed/Project/ProjectTabs/components/ProjectInfoActionBar.vue'
import ProjectInfoDetails from '@/modules/crm/project-ed/Project/ProjectTabs/components/ProjectInfoDetails.vue'
import ProjectInfoEvent from '@/modules/crm/project-ed/Project/ProjectTabs/components/ProjectInfoEvent.vue'
import ProjectInfoCalendar from '@/modules/crm/project-ed/Project/ProjectTabs/components/ProjectInfoCalendar.vue'
import ProjectInfoBudget from '@/modules/crm/project-ed/Project/ProjectTabs/components/ProjectInfoBudget.vue'
import ProjectInfoTargetInd from '@/modules/crm/project-ed/Project/ProjectTabs/components/ProjectInfoTargetInd.vue'
import ProjectInfoAdditionalInfo from '@/modules/crm/project-ed/Project/ProjectTabs/components/ProjectInfoAdditionalInfo.vue'

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

const projectRoles = computed(() => {
  if (!props.projectData) {
    return {
      manager: null,
      client: null,
      curator: null
    }
  }
  
  return {
    manager: props.projectData.manager_data ? {
      ...props.projectData.manager_data,
      full_name: `${props.projectData.manager_data.first_name || ''} ${props.projectData.manager_data.last_name || ''}`.trim() || props.projectData.manager_data.username
    } : null,
    client: props.projectData.customer_data ? {
      ...props.projectData.customer_data,
      full_name: `${props.projectData.customer_data.first_name || ''} ${props.projectData.customer_data.last_name || ''}`.trim() || props.projectData.customer_data.username
    } : null,
    curator: props.projectData.curator_data ? {
      ...props.projectData.curator_data,
      full_name: `${props.projectData.curator_data.first_name || ''} ${props.projectData.curator_data.last_name || ''}`.trim() || props.projectData.curator_data.username
    } : null
  }
})

const projectStatusLabel = computed(() => {
  if (!props.projectData) return ''
  const map = {
    draft: 'Черновик',
    pending: 'На утверждении',
    rejected: 'Отклонен',
    active: 'В работе',
    completed: 'Завершен'
  }
  const raw = props.projectData.status
  return map[raw] || raw || ''
})

const projectStatusVariant = computed(() => {
  if (!props.projectData) return 'secondary'
  const map = {
    draft: 'secondary',
    pending: 'warning',
    rejected: 'danger',
    active: 'primary',
    completed: 'success'
  }
  const raw = props.projectData.status
  return map[raw] || 'secondary'
})

const projectStartDate = computed(() => {
  if (!props.projectData) return ''
  const d = props.projectData.start_date || props.projectData.start_at || props.projectData.start || props.projectData.startDate
  return d || ''
})

const projectEndDate = computed(() => {
  if (!props.projectData) return ''
  const d = props.projectData.end_date || props.projectData.end_at || props.projectData.end || props.projectData.endDate || props.projectData.deadline
  return d || ''
})

const projectPerformers = computed(() => {
  return Array.isArray(props.projectData?.performers) ? props.projectData.performers : []
})

// Доступ к дашборду проекта: только руководитель, куратор или заказчик проекта
const canSeePrivileged = computed(() => {
  const currentUserId = props.userInfo?.id
  const pd = props.projectData
  if (!currentUserId || !pd) return false
  return pd.manager_id === currentUserId || pd.curator_id === currentUserId || pd.customer_id === currentUserId
})

// Обработчик события отправки проекта на рассмотрение
const onProjectSubmitted = (updatedProjectData) => {
  // Эмитим событие наверх для обновления данных проекта
  emit('project-updated', updatedProjectData)
}

// Обработчик события обновления основной информации проекта
const onProjectUpdated = (updatedProjectData) => {
  // Эмитим событие наверх для обновления данных проекта
  emit('project-updated', updatedProjectData)
}

const emit = defineEmits(['project-updated', 'project-deleted'])

// Обработчик удаления проекта
function onProjectDeleted(projectId) {
  // Эмитим событие наверх для обработки удаления проекта
  emit('project-deleted', projectId)
}
</script>

<style scoped lang="scss">
.overview-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 1rem;
}

.overview-main {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.placeholder-card {
  background: var(--color-primary-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
}

.placeholder-card__header {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-secondary-background);
}

.placeholder-card__body {
  padding: 0.75rem 1rem;
}

.overview-aside {
  position: sticky;
  top: 0.75rem;
  align-self: start;
}
</style>