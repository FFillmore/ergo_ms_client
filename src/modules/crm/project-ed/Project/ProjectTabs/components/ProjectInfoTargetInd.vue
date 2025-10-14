<template>
  <BaseInfoCard title="Целевые показатели" :project-data="projectData" @edit-click="openEditModal">
      <div class="info-section">
        <div class="section-content">
          <div v-if="loadingIndicators" class="loading-state">
            <div class="spinner-border spinner-border-sm text-primary" role="status">
              <span class="visually-hidden">Загрузка...</span>
            </div>
            <span class="ms-2">Загрузка показателей...</span>
          </div>
          <div v-else-if="targetIndicators && targetIndicators.length > 0" class="indicators-list">
            <div 
              v-for="(indicator, index) in targetIndicators" 
              :key="indicator.id || index"
              class="indicator-card"
            >
              <div class="indicator-header">
                <h6 class="indicator-title">
                  <Target class="indicator-icon" />
                  {{ indicator.name }}
                </h6>
                <div v-if="indicator.unit" class="indicator-unit">
                  {{ indicator.unit }}
                </div>
              </div>
              <div class="indicator-body">
                <div class="indicator-values">
                  <div v-if="indicator.baseline !== null && indicator.baseline !== undefined" class="value-item">
                    <span class="value-label">Базовое значение:</span>
                    <span class="value-number">{{ formatValue(indicator.baseline) }}</span>
                  </div>
                  <div v-if="indicator.planned !== null && indicator.planned !== undefined" class="value-item">
                    <span class="value-label">Планируемое значение:</span>
                    <span class="value-number planned">{{ formatValue(indicator.planned) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p v-else class="text-muted">Целевые показатели не указаны</p>
        </div>
      </div>
  </BaseInfoCard>

  <ProjectUnifiedEditModal
    :is-open="showUnified"
    :project-data="projectData"
    :user-role="null"
    :user-info="null"
    :rector-info="null"
    focus-section="indicators"
    @close="() => (showUnified = false)"
    @saved="onUnifiedSaved"
  />
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { Target } from 'lucide-vue-next'
import BaseInfoCard from '@/modules/crm/project-ed/Project/ProjectTabs/components/BaseInfoCard.vue'
import ProjectUnifiedEditModal from '@/modules/crm/project-ed/Project/ProjectTabs/components/ProjectUnifiedEditModal.vue'
import { apiClient } from '@/js/api/manager.js'
import { endpoints } from '@/js/api/endpoints.js'
import { useToast } from 'vue-toastification'

const props = defineProps({
  projectData: {
    type: Object,
    default: null
  }
})

const targetIndicators = ref([])
const loadingIndicators = ref(false)
const toast = useToast()

const showUnified = ref(false)

const selectedEventForIndicators = computed(() => {
  const blockId = props.projectData?.event_block_id || props.projectData?.event_block || null
  const eventId = props.projectData?.event_id || props.projectData?.event || null
  return { blockId, eventId }
})

// Загружаем целевые показатели проекта из данных
const loadTargetIndicators = () => {
  if (!props.projectData?.target_indicators) {
    targetIndicators.value = []
    return
  }
  
  targetIndicators.value = props.projectData.target_indicators.map(indicator => ({
    id: indicator.id,
    name: indicator.display_name || indicator.name || 'Не указано',
    unit: indicator.display_unit || indicator.unit || '',
    baseline: indicator.baseline,
    planned: indicator.planned,
    source_indicator: indicator.source_indicator
  }))
}

// Форматирование числового значения
const formatValue = (value) => {
  if (value === null || value === undefined) return ''
  
  // Если это число, форматируем с разделителями тысяч
  if (typeof value === 'number') {
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value)
  }
  
  // Если это строка, пытаемся преобразовать в число
  const numValue = parseFloat(value)
  if (!isNaN(numValue)) {
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(numValue)
  }
  
  return String(value)
}


// Загружаем показатели при изменении данных проекта
watch(() => props.projectData?.target_indicators, () => {
  loadTargetIndicators()
}, { immediate: true })

// Загружаем показатели при монтировании компонента
onMounted(() => {
  loadTargetIndicators()
})

function openEditModal() {
  showUnified.value = true
}

function onUnifiedSaved(evt) {
  try {
    if (!evt || evt.section !== 'indicators') return
    const data = evt.data || {}
    const latest = Array.isArray(data?.target_indicators) ? data.target_indicators : (data?.target_indicators_rel || [])
    if (Array.isArray(latest)) {
      targetIndicators.value = latest.map(indicator => ({
        id: indicator.id,
        name: indicator.display_name || indicator.name || 'Не указано',
        unit: indicator.display_unit || indicator.unit || '',
        baseline: indicator.baseline,
        planned: indicator.planned,
        source_indicator: indicator.source_indicator
      }))
    }
  } catch (_) {}
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
  color: var(--color-secondary-text);
  padding: 1rem 0;
}

.indicators-list {
  display: grid;
  gap: 1rem;
}

.indicator-card {
  background: var(--color-primary-background);
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

.indicator-header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-secondary-background);
  display: flex;
  justify-content: space-between;
  align-items: center;
  
    .indicator-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      line-height: 1.3;
      color: var(--color-primary-text);
      
      .indicator-icon {
        width: 16px;
        height: 16px;
        color: var(--color-primary-text);
        flex-shrink: 0;
      }
      
    }
  
  .indicator-unit {
    color: var(--color-primary-text);
    padding: 0.25rem 0.15rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 500;
    flex-shrink: 0;
  }
}

.indicator-body {
  padding: 1rem 1.25rem;
}

.indicator-values {
  display: grid;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.value-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .value-label {
    color: var(--color-secondary-text);
    font-size: 0.875rem;
    font-weight: 500;
  }
  
  .value-number {
    color: var(--color-primary-text);
    font-size: 0.875rem;
    font-weight: 600;
    
    &.planned {
      color: var(--color-primary-text);
    }
  }
}


.text-muted {
  color: var(--color-secondary-text);
  font-style: italic;
  margin-bottom: 0;
}

// Адаптивность для мобильных устройств
@media (max-width: 768px) {
  .indicator-card {
    border-radius: 8px;
  }
  
  .indicator-header {
    padding: 0.75rem 1rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    
    .indicator-title {
      font-size: 0.9rem;
    }
    
    .indicator-unit {
      font-size: 0.7rem;
    }
  }
  
  .indicator-body {
    padding: 0.75rem 1rem;
  }
  
  .indicator-values {
    gap: 0.5rem;
  }
  
  .value-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
    
    .value-label,
    .value-number {
      font-size: 0.8rem;
    }
  }
  
}
</style>
