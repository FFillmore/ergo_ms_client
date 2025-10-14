<template>
  <BaseInfoCard title="Бюджет проекта" :project-data="projectData" @edit-click="openEditModal">
      <div class="info-section">
        <div class="section-content" v-if="!isUpdating">
          <div v-if="loadingBudget" class="loading-state">
            <div class="spinner-border spinner-border-sm text-primary" role="status">
              <span class="visually-hidden">Загрузка...</span>
            </div>
            <span class="ms-2">Загрузка бюджета...</span>
          </div>
           <div v-else-if="budgetData || budgetItemsByStage.length > 0" class="budget-content">
             <!-- Детализация по этапам -->
             <div v-if="budgetItemsByStage && budgetItemsByStage.length > 0" class="budget-stages">
               <div class="stages-list">
                 <div 
                   v-for="(stageData, index) in budgetItemsByStage" 
                   :key="stageData.stageId || index"
                   class="stage-budget-card"
                 >
                   <div class="stage-budget-header">
                     <h6 class="stage-budget-title">
                       <a href="#" class="stage-link" @click.prevent="navigateToStage(stageData)">
                         {{ stageData.stageName || `Этап №${index + 1}` }}
                       </a>
                     </h6>
                     <span class="stage-budget-total">
                       {{ formatCurrency(stageData.totalAmount) }}
                     </span>
                   </div>
                   <div class="stage-budget-table">
                     <div class="budget-table-header">
                       <div class="budget-table-cell">Статья расхода</div>
                       <div class="budget-table-cell">Источник финансирования</div>
                       <div class="budget-table-cell budget-table-cell-amount">Сумма</div>
                     </div>
                     <div 
                       v-for="item in stageData.items" 
                       :key="item.id"
                       class="budget-table-row"
                     >
                       <div class="budget-table-cell">{{ translateBudgetTerms(item.cost_article) }}</div>
                       <div class="budget-table-cell">{{ translateBudgetTerms(item.funding_source) }}</div>
                       <div class="budget-table-cell budget-table-cell-amount">{{ formatCurrency(item.amount) }}</div>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
             <div v-else class="no-budget-items">
               <span class="text-muted">Детализация бюджета по этапам не найдена</span>
             </div>

             <!-- Итоги по бюджету -->
             <div v-if="budgetData" class="budget-totals">
               <div class="totals-card">
                 <h6 class="totals-title">
                   Итоги по бюджету
                 </h6>
                 <div class="totals-grid">
                   <div class="total-item">
                     <span class="total-label">Зарплата (бюджет):</span>
                     <span class="total-value budget">{{ formatCurrency(budgetData.salary_budget) }}</span>
                   </div>
                   <div class="total-item">
                     <span class="total-label">Зарплата (внебюджет):</span>
                     <span class="total-value off-budget">{{ formatCurrency(budgetData.salary_off_budget) }}</span>
                   </div>
                   <div class="total-item">
                     <span class="total-label">Другие расходы (бюджет):</span>
                     <span class="total-value budget">{{ formatCurrency(budgetData.other_budget) }}</span>
                   </div>
                   <div class="total-item">
                     <span class="total-label">Другие расходы (внебюджет):</span>
                     <span class="total-value off-budget">{{ formatCurrency(budgetData.other_off_budget) }}</span>
                   </div>
                   <div class="total-item total-final">
                     <span class="total-label">Итого с страховыми взносами:</span>
                     <span class="total-value final">{{ formatCurrency(budgetData.total_with_insurance) }}</span>
                   </div>
                 </div>
               </div>
             </div>
           </div>
          <p v-else class="text-muted">Данные о бюджете не найдены</p>
        </div>
        <div class="section-content d-flex align-items-center justify-content-center py-4" v-else>
          <div class="d-flex flex-column align-items-center text-center">
            <div class="spinner-border text-primary mb-2" role="status" aria-label="Загрузка">
              <span class="visually-hidden">Загрузка...</span>
            </div>
            <div class="text-muted">Обновляем данные...</div>
          </div>
        </div>
      </div>
  </BaseInfoCard>
  <ProjectUnifiedEditModal
    :is-open="unifiedModalOpen"
    :project-data="projectData"
    focus-section="budget"
    @close="unifiedModalOpen = false"
    @saved="onUnifiedSaved"
  />
</template>

<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import BaseInfoCard from '@/modules/crm/project-ed/Project/ProjectTabs/components/BaseInfoCard.vue'
import { apiClient } from '@/js/api/manager'
import { endpoints } from '@/js/api/endpoints'
import { useToast } from 'vue-toastification'
import Budget from '@/modules/crm/project-ed/components/steps/Budget.vue'
import ProjectUnifiedEditModal from '@/modules/crm/project-ed/Project/ProjectTabs/components/ProjectUnifiedEditModal.vue'

const props = defineProps({
  projectData: {
    type: Object,
    default: null
  }
})

const budgetData = ref(null)
const budgetItems = ref([])
const loadingBudget = ref(false)
const isUpdating = ref(false)
const unifiedModalOpen = ref(false)
const isSaving = ref(false)
const toast = useToast()
const emit = defineEmits(['saved', 'cancelled'])

// Локальный снимок этапов проекта для отображения имен в бюджете
const stagesSnapshot = ref([])

// Локальная модель для Budget.vue
const localBudget = ref({
  stages: [],
  totals: {
    salary: 0,
    other: 0,
    withInsurance: 0,
    byArticleSource: {
      salary: { budget: 0, nonbudget: 0 },
      other: { budget: 0, nonbudget: 0 }
    }
  }
})

// План этапов для Budget.vue
const planForBudget = computed(() => ({
  stages: Array.isArray(props.projectData?.stages)
    ? props.projectData.stages.map(s => ({ name: s.name || '' }))
    : []
}))

// Валидация от дочернего компонента
const isBudgetValid = ref(true)
const onValidation = (state) => { isBudgetValid.value = !!state?.isValid }

// При изменении формы бюджета
const onBudgetUpdate = (val) => {
  localBudget.value = { ...val }
}

// Загружаем данные бюджета из данных проекта
const loadBudgetData = () => {
  if (!props.projectData) {
    budgetData.value = null
    budgetItems.value = []
    stagesSnapshot.value = []
    return
  }
  
  // Загружаем итоги бюджета
  if (props.projectData.budget_totals) {
    budgetData.value = props.projectData.budget_totals
  }
  
  // Загружаем позиции бюджета
  if (props.projectData.budget_items) {
    budgetItems.value = props.projectData.budget_items
  }

  // Снимок этапов для корректного отображения названий
  if (Array.isArray(props.projectData.stages)) {
    stagesSnapshot.value = props.projectData.stages.map(s => ({
      id: s.id,
      name: s.name,
      order: s.order
    }))
  }
}

// Группируем позиции бюджета по этапам
const budgetItemsByStage = computed(() => {
  if (!budgetItems.value || budgetItems.value.length === 0) {
    return []
  }
  
  const stageMap = new Map()
  
  // Сначала добавляем все этапы проекта, если они есть
  if (Array.isArray(stagesSnapshot.value)) {
    stagesSnapshot.value.forEach((stage, index) => {
      const stageId = stage.id || `stage-${index}`
      const stageName = stage.name ? `Этап №${index + 1}. ${stage.name}` : `Этап №${index + 1}`
      stageMap.set(stageId, {
        stageId,
        stageName,
        items: [],
        totalAmount: 0
      })
    })
  }
  
  // Затем добавляем позиции бюджета к соответствующим этапам
  budgetItems.value.forEach(item => {
    const stageId = item.stage_id
    
    // Если позиция привязана к этапу, добавляем к нему
    if (stageId && stageMap.has(stageId)) {
      const stageData = stageMap.get(stageId)
      stageData.items.push(item)
      stageData.totalAmount += parseFloat(item.amount) || 0
    }
    // Если позиция не привязана к этапу, создаем секцию "Без этапа" только если есть такие позиции
    else if (!stageId) {
      const noStageId = 'no-stage'
      if (!stageMap.has(noStageId)) {
        stageMap.set(noStageId, {
          stageId: noStageId,
          stageName: 'Этап №?. Без этапа',
          items: [],
          totalAmount: 0
        })
      }
      const stageData = stageMap.get(noStageId)
      stageData.items.push(item)
      stageData.totalAmount += parseFloat(item.amount) || 0
    }
  })
  
  // Фильтруем этапы, оставляя только те, у которых есть позиции бюджета
  const stagesWithItems = Array.from(stageMap.values()).filter(stage => stage.items.length > 0)
  
  // Сортируем этапы по порядку (order) или по ID
  return stagesWithItems.sort((a, b) => {
    // Если есть этапы проекта, сортируем по их порядку
    if (Array.isArray(stagesSnapshot.value)) {
      const stageA = stagesSnapshot.value.find(s => s.id === a.stageId)
      const stageB = stagesSnapshot.value.find(s => s.id === b.stageId)
      
      if (stageA && stageB) {
        return (stageA.order || 0) - (stageB.order || 0)
      }
    }
    
    // Fallback: сортируем по ID (конвертируем в строки)
    const idA = String(a.stageId || '')
    const idB = String(b.stageId || '')
    return idA.localeCompare(idB)
  })
})

// Форматирование валюты
const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '0 ₽'
  
  const num = parseFloat(amount)
  if (isNaN(num)) return '0 ₽'
  
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(num)
}

const translateBudgetTerms = (text) => {
  if (!text) return text
  
  const translations = {
    // Статьи расходов
    'salary': 'Заработная плата',
    'other': 'Другие расходы',
    
    // Источники финансирования
    'budget': 'Бюджетные источники финансирования',
    'nonbudget': 'Внебюджетные источники финансирования'
  }
  
  let translatedText = text.toLowerCase().trim()
  
  // Ищем точные совпадения
  for (const [key, value] of Object.entries(translations)) {
    if (translatedText === key) {
      return value
    }
  }
  
  // Ищем частичные совпадения
  for (const [key, value] of Object.entries(translations)) {
    if (translatedText.includes(key)) {
      return translatedText.replace(new RegExp(key, 'gi'), value)
    }
  }
  
  return text
}

// Загружаем данные при изменении данных проекта
watch(() => props.projectData?.budget_totals, () => {
  loadBudgetData()
}, { immediate: true })

watch(() => props.projectData?.budget_items, () => {
  loadBudgetData()
}, { immediate: true })

// Следим за этапами проекта в пропсах, чтобы синхронизировать локальный снимок
watch(() => props.projectData?.stages, () => {
  if (Array.isArray(props.projectData?.stages)) {
    stagesSnapshot.value = props.projectData.stages.map(s => ({ id: s.id, name: s.name, order: s.order }))
  }
}, { immediate: true })

// Загружаем данные при монтировании компонента
onMounted(() => {
  loadBudgetData()
  try {
    window.addEventListener('project-budget:reload', handleExternalReload)
  } catch (e) { /* no-op */ }
})

// Навигация к этапу проекта
const navigateToStage = (stageData) => {
  // TODO: Реализовать переход на страницу этапа проекта
  // Например: router.push(`/projects/${props.projectData.id}/stages/${stageData.stageId}`)
  console.log('Переход к этапу:', stageData)
}

function openEditModal() { unifiedModalOpen.value = true }
function closeModal() { unifiedModalOpen.value = false }
function handleCancel() { emit('cancelled'); closeModal() }

// Подбор id этапа по имени (если не найдено — null)
const resolveStageIdByName = (name) => {
  if (!Array.isArray(props.projectData?.stages)) return null
  const found = props.projectData.stages.find(s => (s.name || '') === name)
  return found ? found.id : null
}

async function handleSave() {}

// Блокируем прокрутку страницы, пока модалка открыта
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
  } catch (e) {
    // no-op
  }
})

onUnmounted(() => {
  try {
    const body = document?.body
    const html = document?.documentElement
    if (body) body.style.overflow = ''
    if (html) html.style.overflow = ''
  } catch (e) {
    // no-op
  }
  try {
    window.removeEventListener('project-budget:reload', handleExternalReload)
  } catch (e) { /* no-op */ }
})

function onUnifiedSaved(payload) {
  if (payload?.section === 'budget') {
    // обновим локально, если пришли данные
    const d = payload?.data
    if (d?.budget_totals) budgetData.value = d.budget_totals
    if (Array.isArray(d?.budget_items)) budgetItems.value = d.budget_items
    unifiedModalOpen.value = false
  }
}

function handleExternalReload(event) {
  const incomingId = event?.detail?.projectId
  const currentId = props.projectData?.id
  if (!currentId || !incomingId || incomingId === currentId) {
    const items = event?.detail?.budget_items
    const totals = event?.detail?.budget_totals
    if (Array.isArray(items) || (totals && typeof totals === 'object')) {
      if (Array.isArray(items)) budgetItems.value = items
      if (totals && typeof totals === 'object') budgetData.value = totals
      // Даже если пришли данные в событии, дополнительно синхронизируемся с сервером
      setTimeout(() => reloadBudgetFromServer(currentId), 150)
    } else {
      // Если данных нет в событии — подтянем актуальные с сервера
      reloadBudgetFromServer(currentId)
    }
  }
}

async function reloadBudgetFromServer(projectId) {
  if (!projectId) return
  try {
    loadingBudget.value = true
    const bust = `?_ts=${Date.now()}`
    const resp = await apiClient.get(endpoints.project_ed.projects.detail(projectId) + bust)
    const data = resp?.data || {}
    if (data.budget_totals) budgetData.value = data.budget_totals
    if (Array.isArray(data.budget_items)) budgetItems.value = data.budget_items
    if (Array.isArray(data.stages)) {
      stagesSnapshot.value = data.stages.map(s => ({ id: s.id, name: s.name, order: s.order }))
    }
    else {
      // Повторная попытка через короткую задержку (бек может не успеть отдать обновлённые данные)
      setTimeout(async () => {
        try {
          const resp2 = await apiClient.get(endpoints.project_ed.projects.detail(projectId) + `?_ts=${Date.now()}`)
          const d2 = resp2?.data || {}
          if (d2.budget_totals) budgetData.value = d2.budget_totals
          if (Array.isArray(d2.budget_items)) budgetItems.value = d2.budget_items
          if (Array.isArray(d2.stages)) {
            stagesSnapshot.value = d2.stages.map(s => ({ id: s.id, name: s.name, order: s.order }))
          }
        } catch (_) { /* no-op */ }
      }, 250)
    }
  } catch (e) {
    // no-op
  } finally {
    loadingBudget.value = false
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

.budget-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.budget-totals {
  .totals-card {
    border: 1px solid var(--color-border);
    background-color: var(--color-primary-background);
    border-radius: 12px;
    overflow: hidden;
    
    .totals-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem 1.25rem;
      background-color: var(--color-secondary-background);
      border-bottom: 1px solid var(--color-border);
      border-radius: 12px 12px 0 0;
      font-size: 1rem;
      font-weight: 600;
      color: var(--color-primary-text);
    }
    
    .totals-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
      padding: 1rem;
      
      .total-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 0;
        border-bottom: 1px solid var(--color-border);
        
        &:last-child {
          border-bottom: none;
        }
        
        .total-label {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
          font-weight: 500;
        }
        
        .total-value {
          font-weight: 600;
          font-size: 0.875rem;
          
          &.budget {
            color: var(--color-primary-text);
          }
          
          &.off-budget {
            color: var(--color-warning);
          }
          
          &.final {
            color: var(--color-success);
            font-size: 1rem;
          }
        }
        
        &.total-final {
          grid-column: 1 / -1;
          margin-top: 0.5rem;
          padding-top: 0.75rem;
          border-top: 2px solid var(--color-primary);
          background: rgba(var(--color-primary-rgb), 0.05);
          border-radius: 6px;
          padding: 0.75rem;
          
          .total-label {
            font-weight: 600;
            font-size: 1rem;
            color: var(--color-text-primary);
          }
        }
      }
    }
  }
}

.budget-stages {
  
  .stages-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
}

.stage-budget-card {
  background: var(--color-primary-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }
  
  .stage-budget-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.25rem;
    background: var(--color-secondary-background);
    border-bottom: 1px solid var(--color-border);
    
    .stage-budget-title {
      margin: 0;
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--color-primary-text);
      
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
    
    .stage-budget-total {
      font-weight: 700;
      font-size: 1rem;
      color: var(--color-primary-text);
    }
  }
  
  .stage-budget-table {
    padding: 0.75rem 1.25rem;
    
    .budget-table-header {
      display: grid;
      grid-template-columns: 0.8fr 1.2fr auto;
      gap: 1rem;
      padding: 0.75rem 0;
      border-bottom: 1px solid var(--color-border);
      font-weight: 600;
      font-size: 0.875rem;
      color: var(--color-primary-text);
      
      .budget-table-cell {
        padding: 0.25rem 0;
        
        &.budget-table-cell-amount {
          text-align: right;
        }
      }
    }
    
    .budget-table-row {
      display: grid;
      grid-template-columns: 0.8fr 1.2fr auto;
      gap: 1rem;
      padding: 0.75rem 0;
      border-bottom: 1px solid var(--color-border);
      
      &:last-child {
        border-bottom: none;
      }
      
      .budget-table-cell {
        padding: 0.25rem 0;
        font-size: 0.875rem;
        
        &.budget-table-cell-amount {
          text-align: right;
          font-weight: 600;
          color: var(--color-primary-text);
        }
        
        &:first-child {
          font-weight: 500;
          color: var(--color-primary-text);
        }
        
        &:nth-child(2) {
          color: var(--color-secondary-text);
          font-style: italic;
        }
      }
    }
  }
}

.no-budget-items {
  padding: 1rem 0;
  text-align: center;
}

.text-muted {
  color: var(--color-secondary-text);
  font-style: italic;
  margin-bottom: 0;
}

// Адаптивность для мобильных устройств
@media (max-width: 768px) {
  .budget-totals .totals-card .totals-grid {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    
    .total-item.total-final {
      grid-column: 1;
    }
  }
  
  .stage-budget-card {
    .stage-budget-header {
      padding: 0.75rem 1rem;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
      
      .stage-budget-title {
        font-size: 0.9rem;
      }
      
      .stage-budget-total {
        font-size: 0.9rem;
      }
    }
    
    .stage-budget-table {
      padding: 0.75rem 1rem;
      
      .budget-table-header,
      .budget-table-row {
        grid-template-columns: 1fr;
        gap: 0.5rem;
        
        .budget-table-cell {
          padding: 0.5rem 0;
          
          &.budget-table-cell-amount {
            text-align: left;
            font-weight: 700;
            border-top: 1px solid rgba(0, 0, 0, 0.1);
            margin-top: 0.25rem;
            padding-top: 0.5rem;
          }
        }
      }
      
      .budget-table-header {
        .budget-table-cell:not(:first-child) {
          display: none;
        }
      }
      
      .budget-table-row {
        .budget-table-cell:not(:first-child) {
          font-size: 0.8rem;
          margin-left: 1rem;
        }
      }
    }
  }
}
</style>
