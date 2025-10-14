<template>
  <div class="info-card">
    <div class="info-card__header d-flex align-items-center justify-content-between">
      <h6 class="mb-0 d-flex align-items-center">
        {{ title }}
        <button
          type="button"
          class="icon-btn icon-btn--danger ms-1"
          @click="$emit('warnings-click')"
          :title="'Показать комментарии экспертной группы'"
          aria-label="Показать комментарии экспертной группы"
          v-if="isProjectManager"
        >
          <AlertCircle :size="18" />
        </button>
      </h6>
      <div class="info-card__actions d-flex align-items-center" v-if="isProjectManager">
        <button
          type="button"
          class="icon-btn"
          :class="{ 'icon-btn--disabled': !canEdit }"
          @click="handleEditClick"
          :disabled="!canEdit"
          :title="canEdit ? 'Редактировать раздел' : 'Редактирование недоступно во время рассмотрения'"
          aria-label="Редактировать раздел"
        >
          <Pencil :size="18" />
        </button>
      </div>
    </div>
    <div class="info-card__body">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue'
import { Pencil, AlertCircle } from 'lucide-vue-next'
import { useUserStore } from '@/core/cms/js/userStore.js'
import { isProjectManager as isProjectManagerUtil } from '@/modules/crm/project-ed/js/projectRoles.js'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  projectData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['edit-click', 'warnings-click'])

const userStore = useUserStore()

const isProjectManager = computed(() => isProjectManagerUtil(userStore.user, props.projectData))

// Проверяем, можно ли редактировать проект
const canEdit = computed(() => {
  if (!props.projectData) return false
  return props.projectData.status === 'draft'
})

const handleEditClick = () => {
  emit('edit-click')
}
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

.info-card__actions {
  gap: 0.25rem;
}

.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: var(--color-text);
  padding: 0;
  border-radius: 50%;
  transition: background-color 0.15s ease-in-out, transform 0.15s ease-in-out;
}

.icon-btn:hover {
  background-color: var(--color-hover-background);
}

.icon-btn:active {
  transform: scale(0.98);
}

.icon-btn--danger {
  color: var(--bs-danger);
}

.icon-btn--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.icon-btn--disabled:hover {
  background-color: transparent;
  transform: none;
}
</style>


