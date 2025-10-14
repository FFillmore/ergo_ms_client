<template>
  <div class="project-audit-page">
    <!-- Заголовок страницы -->
    <div class="d-flex align-items-center justify-content-between mb-4">
      <h4 class="mb-0">Активность проекта</h4>
      <div class="d-flex align-items-center gap-2">
        <button 
          class="btn btn-outline-secondary btn-sm"
          @click="refreshAudit"
          :disabled="isLoading"
        >
          <RefreshCw :size="16" class="me-1" :class="{ 'spinning': isLoading }" />
          Обновить
        </button>
      </div>
    </div>

    <!-- Состояние загрузки -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner-border text-primary" role="status" aria-label="Загрузка"></div>
      <div class="loading-text mt-2">Загрузка активности…</div>
    </div>

    <!-- Сообщение об ошибке -->
    <div v-else-if="error" class="alert alert-danger" role="alert">
      <AlertCircle :size="20" class="me-2" />
      {{ error }}
    </div>

    <!-- Пустое состояние -->
    <div v-else-if="!auditData || auditData.length === 0" class="empty-state">
      <Activity :size="48" class="text-muted mb-3" />
      <h5 class="text-muted">Нет активности</h5>
      <p class="text-muted">В проекте пока нет записей активности</p>
    </div>

    <!-- Список активности -->
    <div v-else class="audit-list">
      <AuditUnit
        v-for="(item, index) in auditData"
        :key="`${item.id || index}-${item.timestamp}`"
        :timestamp="item.timestamp"
        :action-display="item.action_display"
        :model-type-display="item.model_type_display"
        :user-name="item.user_name"
        :user-id="item.user_id"
        :avatar-url="item.avatar_url"
        :field-name="item.field_name"
        :old-value="item.old_value"
        :new-value="item.new_value"
        :description="item.description"
        :icon-name="item.icon_name"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { Activity, RefreshCw, AlertCircle } from 'lucide-vue-next'
import AuditUnit from './components/AuditUnit.vue'
import { apiClient } from '@/js/api/manager.js'
import { endpoints } from '@/js/api/endpoints.js'
import { getUserAvatar } from '@/js/userAvatar.js'

const props = defineProps({
  projectData: {
    type: Object,
    required: true
  }
})

const auditData = ref([])
const isLoading = ref(false)
const error = ref(null)

// Функция загрузки данных аудита
async function loadAuditData() {
  if (!props.projectData?.id) return
  
  isLoading.value = true
  error.value = null
  
  try {
    // Используем существующий endpoint для получения аудита проекта
    const response = await apiClient.get(endpoints.project_ed.projects.auditLogs(props.projectData.id))
    auditData.value = response.data?.results || response.data || []
    
    // Отладочная информация
    console.log('ProjectAuditPage: Загружены данные аудита:', auditData.value)
    console.log('ProjectAuditPage: Количество записей:', auditData.value.length)
    if (auditData.value.length > 0) {
      console.log('ProjectAuditPage: Первая запись:', auditData.value[0])
    }
    
    // Аватары теперь приходят с API, предзагрузка не нужна
    // await preloadUserAvatars()
  } catch (err) {
    console.error('Ошибка загрузки аудита проекта:', err)
    error.value = 'Не удалось загрузить данные активности'
    auditData.value = []
  } finally {
    isLoading.value = false
  }
}

// Функция предзагрузки аватаров пользователей
async function preloadUserAvatars() {
  if (!auditData.value || auditData.value.length === 0) return
  
  // Собираем уникальные ID пользователей
  const userIds = [...new Set(
    auditData.value
      .map(item => item.user_id)
      .filter(id => id) // Только если есть ID пользователя
  )]
  
  console.log('ProjectAuditPage: Найдены ID пользователей для предзагрузки:', userIds)
  
  // Предзагружаем аватары параллельно
  const avatarPromises = userIds.map(userId => 
    getUserAvatar(userId).catch(error => {
      console.warn(`Не удалось предзагрузить аватар для пользователя ${userId}:`, error)
      return null
    })
  )
  
  const results = await Promise.allSettled(avatarPromises)
  console.log('ProjectAuditPage: Результаты предзагрузки аватаров:', results)
}

// Функция обновления данных
async function refreshAudit() {
  await loadAuditData()
}

// Загружаем данные при монтировании компонента
onMounted(() => {
  loadAuditData()
})

// Отслеживаем изменения projectData
watch(() => props.projectData?.id, (newId) => {
  if (newId) {
    loadAuditData()
  }
})
</script>

<style scoped lang="scss">
.project-audit-page {
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    color: #6a737d;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    text-align: center;
  }

  // Стили для списка активности теперь в компоненте AuditUnit

  .spinning {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
}
</style>