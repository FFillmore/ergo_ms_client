<template>
  <div v-if="shouldShowAudit" class="placeholder-card">
    <div class="placeholder-card__header d-flex align-items-center justify-content-between">
      <h6 class="mb-0">Ход работ</h6>
    </div>
    <div class="placeholder-card__body">
      <div v-if="isLoading" class="text-muted">Загрузка журнала…</div>
      <template v-else>
        <div v-if="!auditLogs.length" class="text-muted">Нет записей аудита.</div>
        <template v-else>
          <ul class="list-unstyled mb-0">
            <AuditUnit
              v-for="item in displayedAuditLogs"
              :key="item.id"
              :timestamp="item.timestamp"
              :action-display="item.action_display"
              :model-type-display="item.model_type_display"
              :user-name="item.user_name"
              :user-id="
                item.user_id ||
                (typeof item.user === 'number' ? item.user : null) ||
                item.user?.id ||
                item.user_id_id ||
                null
              "
              :avatar-url="
                item.user_avatar_url ||
                item.user_avatar ||
                item.avatar_url ||
                item.user?.avatar_url ||
                null
              "
              :field-name="item.field_name"
              :old-value="item.old_value"
              :new-value="item.new_value"
              :description="item.description"
              :expandable="false"
            />
          </ul>
          <div v-if="hasMoreAuditLogs" class="text-center mt-3">
            <button 
              class="btn btn-outline-primary btn-sm"
              @click="navigateToFullAudit"
            >
              Ещё...
            </button>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { useToast } from 'vue-toastification'
import { apiClient } from '@/js/api/manager'
import { endpoints } from '@/js/api/endpoints'
import { useUserStore } from '@/core/cms/js/userStore.js'
import { isProjectManager } from '@/modules/crm/project-ed/js/projectRoles.js'
import AuditUnit from './AuditUnit.vue'

const props = defineProps({
  projectData: {
    type: Object,
    default: null
  }
})

const toast = useToast()
const userStore = useUserStore()
const isLoading = ref(false)
const auditLogs = ref([])
const isGlobalAdmin = ref(false)
const isLoadingRole = ref(true)

// Функция для проверки глобальной роли администратора
async function checkGlobalAdminRole() {
  try {
    const userId = userStore.user?.id
    if (!userId) {
      isGlobalAdmin.value = false
      return
    }

    // Проверяем роль через API профиля ProjectEd
    const resp = await apiClient.get(`/project_ed/profiles/profiles/${userId}/`)
    const profile = resp.data
    if (profile) {
      const roleName = profile?.role_name
      isGlobalAdmin.value = roleName === 'Администратор'
    } else {
      isGlobalAdmin.value = false
    }
  } catch (error) {
    console.error('Ошибка проверки роли администратора:', error)
    isGlobalAdmin.value = false
  } finally {
    isLoadingRole.value = false
  }
}

// Проверяем, является ли пользователь руководителем проекта
const isProjectLeader = computed(() => {
  return isProjectManager(userStore.user, props.projectData)
})

// Проверяем, должен ли компонент отображаться
const shouldShowAudit = computed(() => {
  if (isLoadingRole.value) return false
  return isGlobalAdmin.value || isProjectLeader.value
})

// Ограничиваем количество отображаемых элементов до 5
const displayedAuditLogs = computed(() => {
  return auditLogs.value.slice(0, 5)
})

// Проверяем, есть ли больше элементов для отображения
const hasMoreAuditLogs = computed(() => {
  return auditLogs.value.length > 5
})

async function loadAudit() {
  const id = props.projectData?.id
  if (!id || !shouldShowAudit.value) {
    auditLogs.value = []
    return
  }
  isLoading.value = true
  try {
    const endpoint = endpoints.project_ed.projects.auditLogs(id)
    const resp = await apiClient.get(endpoint)
    // Поддержка как пагинированного ответа, так и обычного списка
    const data = Array.isArray(resp?.data) ? resp.data : (resp?.data?.results || [])
    auditLogs.value = data
    if (process.env.NODE_ENV !== 'production' && Array.isArray(data) && data.length > 0) {
      // Быстрая проверка структуры для маппинга аватаров
      // eslint-disable-next-line no-console
      console.debug('Audit sample item:', data[0])
    }
  } catch (e) {
    toast.error('Не удалось загрузить журнал аудита проекта')
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await checkGlobalAdminRole()
  loadAudit()
})

watch(() => props.projectData?.id, () => {
  if (!isLoadingRole.value) {
    loadAudit()
  }
})

watch(shouldShowAudit, (newValue) => {
  if (newValue && !isLoading.value) {
    loadAudit()
  } else if (!newValue) {
    auditLogs.value = []
  }
})

// Перезагрузка по глобальному событию, инициируемому после сохранения
function handleAuditReload(event) {
  const incomingId = event?.detail?.projectId
  const currentId = props.projectData?.id
  if (!incomingId || !currentId || incomingId === currentId) {
    if (shouldShowAudit.value) {
      loadAudit()
    }
  }
}

// Навигация на вкладку "Активность" в ProjectPage
function navigateToFullAudit() {
  // Отправляем событие для переключения на вкладку "Активность"
  const event = new CustomEvent('switch-to-audit-tab', {
    detail: { tabId: 'activity' }
  })
  window.dispatchEvent(event)
}

onMounted(() => {
  window.addEventListener('project-audit:reload', handleAuditReload)
})

onBeforeUnmount(() => {
  window.removeEventListener('project-audit:reload', handleAuditReload)
})
</script>

<style scoped lang="scss">
.placeholder-card {
  background: var(--color-primary-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
  width: 100%;
  max-width: 100%;
}

.placeholder-card__header {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-secondary-background);
}

.placeholder-card__body {
  padding: 0.75rem 1rem;
}
</style>


