<template>
    <div class="info-card">
        <div class="info-card__header">
            <h6 class="mb-0">Информация о проекте</h6>
        </div>
        <div class="info-card__body">
            <dl class="info-list">
                <div class="info-row">
                    <dt>Статус</dt>
                    <dd style="display: flex; align-items: center;">
                        <span v-if="statusLabel" class="badge" :class="`bg-${statusVariant}`">{{ statusLabel }}</span>
                        <span v-else class="text-muted">—</span>
                    </dd>
                </div>
                <div class="info-row">
                    <dt>Руководитель</dt>
                    <dd>
                        <div v-if="projectRoles.manager" class="role-person" @mouseenter="onHoverPerson(projectRoles.manager, $event)" @mouseleave="onLeavePerson" @click="onClickPerson(projectRoles.manager)">
                            <UserAvatar 
                                size="small" 
                                :custom-avatar-url="projectRoles.manager.avatar_url"
                                :title="projectRoles.manager.full_name"
                            />
                            <span class="role-person__name">{{ formatNameWithInitials(projectRoles.manager) }}</span>
                        </div>
                        <span v-else class="text-muted">—</span>
                    </dd>
                </div>
                <div class="info-row">
                    <dt>Заказчик</dt>
                    <dd>
                        <div v-if="projectRoles.client" class="role-person" @mouseenter="onHoverPerson(projectRoles.client, $event)" @mouseleave="onLeavePerson" @click="onClickPerson(projectRoles.client)">
                            <UserAvatar 
                                size="small" 
                                :custom-avatar-url="projectRoles.client.avatar_url"
                                :title="projectRoles.client.full_name"
                            />
                            <span class="role-person__name">{{ formatNameWithInitials(projectRoles.client) }}</span>
                        </div>
                        <span v-else class="text-muted">—</span>
                    </dd>
                </div>
                <div class="info-row">
                    <dt>Куратор</dt>
                    <dd>
                        <div v-if="projectRoles.curator" class="role-person" @mouseenter="onHoverPerson(projectRoles.curator, $event)" @mouseleave="onLeavePerson" @click="onClickPerson(projectRoles.curator)">
                            <UserAvatar 
                                size="small" 
                                :custom-avatar-url="projectRoles.curator.avatar_url"
                                :title="projectRoles.curator.full_name"
                            />
                            <span class="role-person__name">{{ formatNameWithInitials(projectRoles.curator) }}</span>
                        </div>
                        <span v-else class="text-muted">—</span>
                    </dd>
                </div>
                
                <div class="info-row">
                    <dt>Старт проекта</dt>
                    <dd>
                        <span v-if="startDate">{{ formatDate(startDate) }}</span>
                        <span v-else class="text-muted">—</span>
                    </dd>
                </div>
                <div class="info-row">
                    <dt>Конец проекта</dt>
                    <dd>
                        <span v-if="endDate">{{ formatDate(endDate) }}</span>
                        <span v-else class="text-muted">—</span>
                    </dd>
                </div>
                <div class="info-row">
                    <dt>Исполнители</dt>
                    <dd>
                        <div v-if="performers && performers.length" class="contributors">
                            <div class="contributors__list">
                                <div
                                    v-for="(person, idx) in performers"
                                    :key="person.id || idx"
                                    class="contributors__item"
                                    @mouseenter="onHoverPerson(person, $event)"
                                    @mouseleave="onLeavePerson"
                                    @click="onClickPerson(person)"
                                >
                                    <UserAvatar
                                        size="small"
                                        :custom-avatar-url="person.avatar_url"
                                        :title="formatNameWithInitials(person)"
                                    />
                                </div>
                            </div>
                        </div>
                        <span v-else class="text-muted">—</span>
                    </dd>
                </div>
            </dl>
        </div>
    </div>

    <SimpleTooltip
      :visible="tooltipVisible"
      :target-element="tooltipTarget"
      placement="top"
      :offset="6"
      @mouseenter="onTooltipEnter"
      @mouseleave="onTooltipLeave"
    >
      <ProfileTooltip
        :userId="tooltipProfile.userId"
        :username="tooltipProfile.username"
        :fullName="tooltipProfile.fullName"
        :position="tooltipProfile.position"
        :faculty="tooltipProfile.faculty"
        :department="tooltipProfile.department"
        :avatarUrl="tooltipProfile.avatarUrl"
      />
    </SimpleTooltip>
    
    <p v-if="isCurrentUserManager && isDraftStatus" class="text-delete-project">
        Вы можете 
        <a href="#" @click.prevent="showDeleteConfirm = true" class="delete-link">
            удалить
        </a> 
        проект.
    </p>
    
    <ModalDelete
        :show="showDeleteConfirm"
        :confirm-text="deleteButtonText"
        :confirm-disabled="deleteTimer > 0"
        :is-deleting="isDeleting"
        @confirm="handleDeleteConfirm"
        @cancel="handleDeleteCancel"
        @close="handleDeleteCancel"
    />
</template>

<script setup>
import { defineProps, defineEmits, ref, onMounted, onBeforeUnmount, watch, nextTick, computed } from 'vue'
import { useRouter } from 'vue-router'
import SimpleTooltip from '@/modules/crm/project-ed/components/SimpleTooltip.vue'
import ProfileTooltip from '@/modules/crm/project-ed/components/ProfileTooltip.vue'
import UserAvatar from '@/modules/crm/project-ed/components/UserAvatar.vue'
import ModalDelete from '@/modules/crm/project-ed/components/ModalDelete.vue'
import { useUserStore } from '@/core/cms/js/userStore.js'
import { isProjectManager as isProjectManagerUtil } from '@/modules/crm/project-ed/js/projectRoles.js'
import { formatNameWithInitials } from '@/modules/crm/project-ed/js/nameUtils.js'
import { apiClient } from '@/js/api/manager'
import { projectEdEndpoints as endpoints } from '@/modules/crm/project-ed/js/endpoints.js'
import { useNotifications } from '@/modules/lms/composables/useNotifications'

const props = defineProps({
  projectData: {
    type: Object,
    required: true
  },
  projectRoles: {
    type: Object,
    default: () => ({
      manager: null,
      client: null,
      curator: null
    })
  },
  statusLabel: {
    type: String,
    default: ''
  },
  statusVariant: {
    type: String,
    default: 'secondary'
  },
  startDate: {
    type: [String, Number, Date],
    default: ''
  },
  endDate: {
    type: [String, Number, Date],
    default: ''
  },
  performers: {
    type: Array,
    default: () => []
  },
  projectData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['project-deleted'])

// убрано: старый тултип на исполнителях
const tooltipVisible = ref(false)
const tooltipTarget = ref(null)
const tooltipProfile = ref({
  userId: null,
  username: '',
  fullName: '',
  position: '',
  faculty: '',
  department: '',
  avatarUrl: null
})
const router = useRouter()
let hideTimer = null
const userStore = useUserStore()
const { showSuccess, showError } = useNotifications()
const showDeleteConfirm = ref(false)
const deleteTimer = ref(5)
const isDeleting = ref(false)
let timerInterval = null

// убрано: инициализация/хранение bootstrap поповеров

function onHoverPerson(person, evt) {
  tooltipTarget.value = evt?.currentTarget || evt?.target || null
  if (hideTimer) { clearTimeout(hideTimer); hideTimer = null }
  tooltipProfile.value = {
    userId: person?.id ?? person?.user_id ?? null,
    username: person?.username || '',
    fullName: person?.full_name || '',
    position: person?.position_name || person?.position || '',
    faculty: person?.faculty_name || '',
    department: person?.department_name || '',
    avatarUrl: person?.avatar_url || null
  }
  tooltipVisible.value = true
}

function onLeavePerson() {
  if (hideTimer) { clearTimeout(hideTimer) }
  hideTimer = setTimeout(() => { tooltipVisible.value = false }, 180)
}

function onClickPerson(person) {
  const userId = person?.id ?? person?.user_id ?? null
  if (!userId) return
  router.push({ path: `/project-ed/profile/${userId}` })
}

function onTooltipEnter() {
  if (hideTimer) { clearTimeout(hideTimer); hideTimer = null }
  tooltipVisible.value = true
}

function onTooltipLeave() {
  if (hideTimer) { clearTimeout(hideTimer) }
  hideTimer = setTimeout(() => { tooltipVisible.value = false }, 150)
}

// Проверка, является ли текущий пользователь руководителем проекта
const isCurrentUserManager = computed(() => isProjectManagerUtil(userStore.user, props.projectData))

// Доступность удаления только в статусе draft
const isDraftStatus = computed(() => {
  return !!props.projectData && props.projectData.status === 'draft'
})

// Обработчики модального окна удаления
async function handleDeleteConfirm() {
  // Блокируем удаление, пока таймер работает
  if (deleteTimer.value > 0) {
    return
  }
  
  if (!props.projectData?.id) {
    showError('Ошибка: ID проекта не найден')
    return
  }
  
  isDeleting.value = true
  showDeleteConfirm.value = false
  
  try {
    // Вызываем API для удаления проекта
    await apiClient.delete(endpoints.project_ed.projects.delete(props.projectData.id))
    
    // Показываем уведомление об успешном удалении
    showSuccess('Проект успешно удален')
    
    // Эмитим событие о том, что проект удален
    emit('project-deleted', props.projectData.id)
    
  } catch (error) {
    console.error('Ошибка при удалении проекта:', error)
    
    // Показываем уведомление об ошибке
    const errorMessage = error.response?.data?.detail || 
                        error.response?.data?.message || 
                        error.message || 
                        'Произошла ошибка при удалении проекта'
    showError(errorMessage)
    
    // Возвращаем модальное окно обратно
    showDeleteConfirm.value = true
  } finally {
    isDeleting.value = false
  }
}

function handleDeleteCancel() {
  showDeleteConfirm.value = false
  clearDeleteTimer()
  // Сбрасываем таймер только при отмене
  deleteTimer.value = 5
}

function startDeleteTimer() {
  deleteTimer.value = 5
  timerInterval = setInterval(() => {
    deleteTimer.value--
    console.log('Таймер:', deleteTimer.value) // Отладка
    if (deleteTimer.value <= 0) {
      clearDeleteTimer()
    }
  }, 1000)
}

function clearDeleteTimer() {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
  // Не сбрасываем таймер на 5, оставляем текущее значение
}

// Запуск таймера при открытии модального окна
watch(showDeleteConfirm, (newValue) => {
  if (newValue) {
    startDeleteTimer()
  } else {
    clearDeleteTimer()
    // Сбрасываем таймер только при закрытии модального окна
    deleteTimer.value = 5
  }
})

onBeforeUnmount(() => {
  clearDeleteTimer()
})

function formatDate(value) {
  if (!value) return ''
  try {
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return String(value)
    const months = [
      'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
      'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ]
    const dd = String(d.getDate()).padStart(2, '0')
    const monthName = months[d.getMonth()]
    const yyyy = d.getFullYear()
    return `${dd} ${monthName} ${yyyy}`
  } catch (_) {
    return String(value)
  }
}

// Динамический текст кнопки удаления с таймером
const deleteButtonText = computed(() => {
  if (deleteTimer.value > 0) {
    return `Удалить (${deleteTimer.value})`
  }
  return 'Удалить'
})
</script>

<style scoped lang="scss">
.info-card {
  background: var(--color-primary-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
}

.info-card__header {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-secondary-background);
}

.info-card__body {
  padding: 0.75rem 1rem;
}

.info-list {
  margin: 0;
}

.info-row {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 0.75rem;
  padding: 0.5rem 0;
  border-bottom: 1px dashed var(--color-border);
}

dt {
  margin: 0;
  color: var(--color-secondary-text);
  font-weight: 500;
  font-size: clamp(0.75rem, 2vw, 1rem);
}

dd {
  margin: 0;
  font-size: clamp(0.75rem, 2vw, 1rem);
}

.role-person {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  border-radius: 6px;
}

.role-person:hover {
  background-color: var(--color-hover-background);
}

.role-person__avatar {
  flex-shrink: 0;
}

.role-person__name {
  font-weight: 500;
  color: var(--color-primary-text);
  font-size: clamp(0.75rem, 2.5vw, 1rem);
}

.contributors__list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.contributors__item {
  width: 32px;
  height: 32px;
  cursor: pointer;
}


.text-delete-project {
  padding: .5rem;
  margin: 0;
  color: var(--color-secondary-text);
  font-size: clamp(0.75rem, 2.5vw, 1rem);
}

.delete-link {
  color: #dc3545;
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s ease;
}

.delete-link:hover {
  color: #c82333;
  text-decoration: underline;
}

</style>