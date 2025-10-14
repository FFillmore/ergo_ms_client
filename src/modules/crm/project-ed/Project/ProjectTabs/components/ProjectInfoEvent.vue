<template>
  <BaseInfoCard 
    title="Блок и мероприятие проекта" 
    :project-data="projectData"
    @edit-click="handleEditClick"
  >
    <dl class="info-list">
        <div class="info-row">
          <dt>Блок мероприятий</dt>
          <dd>
            <div v-if="blockTitle || blockCode">
              <span class="value">
                <template v-if="blockCode">{{ blockCode }}<span v-if="blockTitle">. </span></template>{{ blockTitle || '' }}
              </span>
            </div>
            <span v-else class="text-muted">—</span>
          </dd>
        </div>

        <div class="info-row">
          <dt>Мероприятие</dt>
          <dd>
            <div v-if="eventTitle || eventCode">
              <span class="value">
                <template v-if="eventCode">{{ eventCode }}<span v-if="eventTitle">. </span></template>{{ eventTitle || '' }}
              </span>
            </div>
            <span v-else class="text-muted">—</span>
          </dd>
        </div>

        
    </dl>

    <!-- Единое модальное окно: секция Мероприятие -->
    <ProjectUnifiedEditModal
      :is-open="editModalOpen"
      :project-data="projectData"
      focus-section="event"
      @close="closeEditModal"
      @update:projectData="onUnifiedProjectUpdate"
    />
  </BaseInfoCard>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import { apiClient } from '@/js/api/manager.js'
import { endpoints } from '@/js/api/endpoints.js'
import BaseInfoCard from '@/modules/crm/project-ed/Project/ProjectTabs/components/BaseInfoCard.vue'
import ProjectUnifiedEditModal from '@/modules/crm/project-ed/Project/ProjectTabs/components/ProjectUnifiedEditModal.vue'

const props = defineProps({
  projectData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:projectData'])

const toast = useToast()

// Состояние модального окна
const editModalOpen = ref(false)

// Безопасно достаём объект мероприятия и блока из возможных форм ответа API
const eventObj = computed(() => {
  const p = props.projectData || {}
  return p.event || p.event_data || p.selected_event || null
})

const blockObj = computed(() => {
  const p = props.projectData || {}
  // приоритет явного поля блока, иначе берём из мероприятия
  return p.event_block || p.event_block_data || eventObj.value?.block || null
})

// Локальные данные, загружаемые по id, если в проекте нет вложенных объектов
const fetchedEvent = ref(null)
const fetchedBlock = ref(null)

const eventId = computed(() => {
  const p = props.projectData || {}
  // возможные варианты полей id
  return p.event_id || p.event?.id || p.event || null
})

const blockId = computed(() => {
  const p = props.projectData || {}
  // возможные варианты полей id
  return p.event_block_id || p.event_block?.id || p.event_block || eventObj.value?.blockId || eventObj.value?.block_id || null
})

async function loadEventIfNeeded() {
  if (eventObj.value) {
    fetchedEvent.value = null
    return
  }
  const id = Number(eventId.value)
  if (!id || Number.isNaN(id)) return
  try {
    const { data } = await apiClient.get(endpoints.project_ed.events.detail(id))
    fetchedEvent.value = data || null
  } catch (_) {
    fetchedEvent.value = null
  }
}

async function loadBlockIfNeeded() {
  if (blockObj.value) {
    fetchedBlock.value = null
    return
  }
  const id = Number(blockId.value)
  if (!id || Number.isNaN(id)) return
  try {
    const { data } = await apiClient.get(endpoints.project_ed.event_blocks.detail(id))
    fetchedBlock.value = data || null
  } catch (_) {
    fetchedBlock.value = null
  }
}

onMounted(() => {
  loadEventIfNeeded()
  loadBlockIfNeeded()
})

watch(eventId, () => loadEventIfNeeded())
watch(blockId, () => loadBlockIfNeeded())

const blockCode = computed(() => (blockObj.value?.code || fetchedBlock.value?.code || ''))
const blockTitle = computed(() => (blockObj.value?.title || blockObj.value?.name || fetchedBlock.value?.title || fetchedBlock.value?.name || ''))

const eventCode = computed(() => (eventObj.value?.code || fetchedEvent.value?.code || ''))
const eventTitle = computed(() => (eventObj.value?.name || eventObj.value?.title || fetchedEvent.value?.name || fetchedEvent.value?.title || ''))

// Нормализованное текущее мероприятие для модального окна (поддержка id без вложенного объекта)
const currentSelectedEvent = computed(() => {
  if (eventObj.value) return eventObj.value
  if (fetchedEvent.value) return fetchedEvent.value
  const id = Number(eventId.value)
  if (id && Number.isFinite(id)) {
    const block = Number(blockId.value)
    return block && Number.isFinite(block) ? { id, blockId: block } : { id }
  }
  return null
})

// Методы для работы с модальным окном
const handleEditClick = () => {
  editModalOpen.value = true
}

const closeEditModal = () => {
  editModalOpen.value = false
}

function onUnifiedProjectUpdate(updatedProjectData) {
  emit('update:projectData', updatedProjectData)
  toast.success('Мероприятие успешно обновлено')
  editModalOpen.value = false
}

// Период и результаты по требованию не отображаются
</script>

<style scoped lang="scss">
.info-list {
  margin: 0;
}

.info-row {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 0.75rem;
  padding: 0.5rem 0;
  border-bottom: 1px dashed var(--color-border);
}

dt {
  margin: 0;
  color: var(--color-primary-text);
  font-weight: 500;
}

dd {
  margin: 0;
}

.value {
  color: var(--color-secondary-text);
}

.text-muted {
  color: var(--color-secondary-text);
  font-style: italic;
}
</style>

