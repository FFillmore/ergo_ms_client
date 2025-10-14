<template>
  <!-- Фон с плавной анимацией -->
  <Transition name="backdrop-fade">
    <div v-if="showBackdrop" class="modal-backdrop fade show"></div>
  </Transition>
  
  <!-- Модальное окно с анимацией -->
  <Transition name="modal-fade">
    <ModalCenter
      v-if="showModal"
      :modal-id="'projectUnifiedEditModal'"
      :custom-class="'show d-block'"
      :title="sectionTitle"
      :dialog-class="dialogClass"
      @closemodal="closeModal"
    >
    <div class="px-0 pt-0">
      <div class="p-4" ref="contentScrollRef">
            <!-- Раздел: Мероприятие -->
            <div ref="eventSectionRef" v-if="showSection('event')">
              <EventSelection :event="normalizedCurrentEvent" @update:event="onEventChange" />
            </div>

            <!-- Раздел: Целевые показатели -->
            <div class="mt-4" ref="indicatorsSectionRef" v-if="showSection('indicators')">
              <form @submit.prevent="saveIndicators">
                <TargetIndicators
                  :indicators="editIndicators"
                  :selectedEvent="selectedEventForIndicators"
                  @update:indicators="val => (editIndicators = val)"
                />
                <!-- Кнопки вынесены в общий футер; форма нужна для отправки по Enter -->
              </form>
            </div>

            <!-- Раздел: Основная информация -->
            <div class="mt-4" ref="detailsSectionRef" v-if="showSection('details')">
              <BasicProvisions
                ref="basicProvisionsRef"
                :provisions="editProvisions"
                :user-role="userRole"
                :selected-event="selectedEvent || normalizedCurrentEvent"
                :user-info="userInfo"
                :rector-info="rectorInfo"
                @update:provisions="onProvisionsUpdate"
              />
            </div>

            <!-- Раздел: Календарь -->
            <div class="mt-4" ref="calendarSectionRef" v-if="showSection('calendar')">
              <CalendarPlan :plan="localPlan" :isEdit="true" :hasIndicatorsForStage="hasIndicatorsForStage" @update:plan="v => (localPlan = { ...v })" />
            </div>

            <!-- Раздел: Бюджет -->
            <div class="mt-4" ref="budgetSectionRef" v-if="showSection('budget')">
              <Budget :plan="planForBudget" :budget="localBudget" @update:budget="v => (localBudget = { ...v })" @validation-change="onBudgetValidation" />
            </div>

            <!-- Раздел: Доп. информация -->
            <div class="mt-4" ref="additionalSectionRef" v-if="showSection('additional')">
              <AdditionalInfo v-model:info="additionalInfoModel" />
            </div>
      </div>
      <div class="px-4 pb-3 d-flex justify-content-end gap-2">
        <button type="button" class="btn btn-outline-secondary" @click="closeModal">Отмена</button>
        <button type="button" class="btn btn-primary" :disabled="isSaveDisabled" @click="onSaveClick">
          <span v-if="currentSaving" class="spinner-border spinner-border-sm me-2"></span>
          Сохранить
        </button>
      </div>
    </div>
    </ModalCenter>
  </Transition>
  <ConfirmDialog ref="confirmRef" />
  <NotificationProvider />
  <NotificationToast />
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useToast } from 'vue-toastification'
import { Target } from 'lucide-vue-next'
import ModalCenter from '@/components/ModalCenter.vue'
import EventSelection from '@/modules/crm/project-ed/components/steps/EventSelection.vue'
import TargetIndicators from '@/modules/crm/project-ed/components/steps/TargetIndicators.vue'
import BasicProvisions from '@/modules/crm/project-ed/components/steps/BasicProvisions.vue'
import CalendarPlan from '@/modules/crm/project-ed/components/steps/CalendarPlan.vue'
import Budget from '@/modules/crm/project-ed/components/steps/Budget.vue'
import AdditionalInfo from '@/modules/crm/project-ed/components/steps/AdditionalInfo.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import NotificationProvider from '@/components/NotificationProvider.vue'
import NotificationToast from '@/components/NotificationToast.vue'
import { apiClient } from '@/js/api/manager.js'
import { endpoints } from '@/js/api/endpoints.js'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  projectData: { type: Object, default: null },
  userRole: { type: String, default: null },
  userInfo: { type: Object, default: null },
  rectorInfo: { type: Object, default: null },
  // Какой раздел фокусировать при открытии: 'event' | 'indicators' | 'details' | 'calendar' | 'budget' | 'additional'
  focusSection: { type: String, default: '' }
})

const emit = defineEmits(['close', 'saved', 'update:projectData'])

const toast = useToast()
const confirmRef = ref(null)

// Управление отображением фона и модального окна
const showBackdrop = ref(false)
const showModal = ref(false)
const contentScrollRef = ref(null)
const eventSectionRef = ref(null)
const indicatorsSectionRef = ref(null)
const detailsSectionRef = ref(null)
const calendarSectionRef = ref(null)
const budgetSectionRef = ref(null)
const additionalSectionRef = ref(null)

// Табы удалены — выводим секции последовательно

// Общие состояния сохранения
const saving = ref({ indicators: false, details: false, calendar: false, budget: false, additional: false })

// Видимость секций и заголовок модалки
const normalizedFocus = computed(() => String(props.focusSection || '').trim())
const showSection = (key) => {
  const f = normalizedFocus.value
  return !f || f === key
}
const sectionTitle = computed(() => {
  const titles = {
    event: 'Редактирование: Мероприятие',
    indicators: 'Редактирование: Целевые показатели',
    details: 'Редактирование: Основная информация',
    calendar: 'Редактирование: Календарный план',
    budget: 'Редактирование: Бюджет',
    additional: 'Редактирование: Дополнительная информация'
  }
  return titles[normalizedFocus.value] || 'Редактирование проекта'
})

// Кнопки нижнего футера
const currentSaving = computed(() => {
  const key = normalizedFocus.value
  if (!key) return false
  if (key === 'event') return false
  return Boolean(saving.value[key])
})
const isSaveDisabled = computed(() => {
  const key = normalizedFocus.value
  switch (key) {
    case 'event':
      return !selectedEvent.value
    case 'indicators':
      return saving.value.indicators
    case 'details':
      return saving.value.details
    case 'calendar':
      return saving.value.calendar
    case 'budget':
      return saving.value.budget || !isBudgetValid.value
    case 'additional':
      return saving.value.additional
    default:
      return true
  }
})
const onSaveClick = () => {
  const key = normalizedFocus.value
  switch (key) {
    case 'event':
      return saveEvent()
    case 'indicators':
      return saveIndicators()
    case 'details':
      return saveDetails()
    case 'calendar':
      return saveCalendar()
    case 'budget':
      return saveBudget()
    case 'additional':
      return saveAdditional()
    default:
      return
  }
}

// Режим редактирования бюджета — ограничиваем высоту модалки и делаем прокрутку тела
const isBudgetMode = computed(() => normalizedFocus.value === 'budget')
const dialogClass = computed(() => {
  const base = 'modal-xl'
  return isBudgetMode.value ? `${base} scrollable-budget` : base
})

// ======== Вкладка "Мероприятие" ========
const selectedEvent = ref(null)
const normalizedCurrentEvent = computed(() => {
  const p = props.projectData || {}
  const ev = p.event || p.event_data || p.selected_event || null
  if (ev) return ev
  const id = p.event_id || p.event || null
  const blockId = p.event_block_id || p.event_block || null
  if (id) return blockId ? { id, blockId } : { id }
  return null
})
const onEventChange = (evt) => { selectedEvent.value = evt }
const saveEvent = async () => {
  try {
    if (!selectedEvent.value) { toast.warning('Выберите мероприятие'); return }
    const updated = {
      ...props.projectData,
      event: selectedEvent.value,
      event_id: selectedEvent.value.id,
      event_block: selectedEvent.value.block || selectedEvent.value.blockId,
      event_block_id: selectedEvent.value.blockId || selectedEvent.value.block?.id
    }
    emit('update:projectData', updated)
    toast.success('Мероприятие обновлено')
  } catch (e) {
    toast.error('Ошибка при сохранении мероприятия')
  }
}

// ======== Вкладка "Целевые показатели" ========
const editIndicators = ref([])
const selectedEventForIndicators = computed(() => {
  const p = props.projectData || {}
  const blockId = p.event_block_id || p.event_block || null
  const eventId = p.event_id || p.event || null
  return { blockId, eventId }
})
const mapIndicatorsToPayload = (items) => {
  return (items || []).map(it => {
    const maybeId = Number(it.name)
    const source_indicator_id = (!it.isCustom && Number.isFinite(maybeId)) ? maybeId : null
    return {
      source_indicator_id,
      name: it.isCustom ? String(it.name || '') : '',
      unit: String(it.unit || ''),
      baseline: it.baseValue != null && it.baseValue !== '' ? Number(it.baseValue) : null,
      planned: it.targetValue != null && it.targetValue !== '' ? Number(it.targetValue) : null,
    }
  })
}
const initIndicatorsFromProject = () => {
  const src = Array.isArray(props.projectData?.target_indicators) ? props.projectData.target_indicators : []
  editIndicators.value = src.map(it => ({
    name: (Number.isFinite(Number(it.source_indicator)) ? String(Number(it.source_indicator)) : String(it.name || '')),
    unit: it.unit || '',
    baseValue: it.baseline != null ? Number(it.baseline) : 0,
    targetValue: it.planned != null ? Number(it.planned) : 0,
    isCustom: !(Number.isFinite(Number(it.source_indicator)) && Number(it.source_indicator) > 0),
  }))
  if (!editIndicators.value.length) {
    editIndicators.value = [{ name: '', unit: '', baseValue: 0, targetValue: 0, isCustom: true }]
  }
}
const saveIndicators = async () => {
  if (!props.projectData?.id) return
  try {
    saving.value.indicators = true
    const payload = { target_indicators: mapIndicatorsToPayload(editIndicators.value) }
    const resp = await apiClient.patch(endpoints.project_ed.projects.update(props.projectData.id), payload)
    const data = resp?.data || {}
    // эмитим минимальные данные для синхронизации
    emit('saved', { section: 'indicators', data })
    window.dispatchEvent(new CustomEvent('project-audit:reload', { detail: { projectId: props.projectData.id } }))
    toast.success('Целевые показатели обновлены')
  } catch (e) {
    toast.error('Не удалось сохранить целевые показатели')
  } finally {
    saving.value.indicators = false
  }
}

// ======== Вкладка "Основная информация" ========
const basicProvisionsRef = ref(null)
const editProvisions = ref({})
const initProvisionsFromProject = () => {
  const p = props.projectData || {}
  editProvisions.value = {
    projectName: p.name || '',
    projectNameClarification: p.name_clarification || '',
    shortName: p.short_name || '',
    projectGoal: p.goal || p.objective || p.description || '',
    projectTasks: Array.isArray(p.tasks) ? p.tasks.map(t => t.description || t.title || '') : ['', ''],
    startDate: p.start_date || '',
    endDate: p.end_date || '',
    curator: p.curator_id || null,
    customer: p.customer_name || '',
    customerId: p.customer_id || null,
    manager: p.manager_name || '',
    executors: Array.isArray(p.performers) ? p.performers.map(x => (x && typeof x === 'object' ? x.id : x)).filter(Boolean) : [],
    plannedResults: Array.isArray(p.planned_results) ? p.planned_results.map(r => r.description || r) : ['', ''],
    comments: { projectName: '', shortName: '', projectGoal: '', projectTasks: '', projectDates: '', curator: '', customer: '', manager: '', executors: '', plannedResults: '' }
  }
}
const onProvisionsUpdate = (v) => { editProvisions.value = { ...v } }
const saveDetails = async () => {
  if (!props.projectData?.id) return
  try {
    saving.value.details = true
    const p = editProvisions.value
    const payload = {
      name: p.projectName,
      name_clarification: p.projectNameClarification,
      short_name: p.shortName,
      goal: p.projectGoal,
      start_date: p.startDate,
      end_date: p.endDate,
      curator_id: p.curator,
      customer_id: p.customerId,
      planned_results: Array.isArray(p.plannedResults)
        ? p.plannedResults.map((res, idx) => ({ description: String(typeof res === 'string' ? res : (res?.description || '')).trim(), order: idx })).filter(x => x.description)
        : [],
      tasks: Array.isArray(p.projectTasks)
        ? p.projectTasks.map((t, idx) => ({ description: String(typeof t === 'string' ? t : (t?.description || t?.title || '')).trim(), order: idx })).filter(x => x.description)
        : [],
      executors: Array.isArray(p.executors) ? p.executors.map(Number).filter(n => Number.isFinite(n)) : []
    }
    await apiClient.patch(endpoints.project_ed.projects.update(props.projectData.id), payload)
    emit('saved', { section: 'details', data: payload })
    toast.success('Основная информация обновлена')
  } catch (e) {
    toast.error('Ошибка при сохранении основной информации')
  } finally {
    saving.value.details = false
  }
}

// ======== Вкладка "Календарь" ========
const localPlan = ref({ startDate: '', endDate: '', stages: [] })
const hasIndicatorsForStage = () => true
const initPlanFromProject = () => {
  const p = props.projectData || {}
  localPlan.value = {
    startDate: p.start_date || '',
    endDate: p.end_date || '',
    stages: Array.isArray(p.stages) ? p.stages.map(s => ({ name: s.name || '', start: s.start_date || '', end: s.end_date || '', result: s.planned_results || '' })) : []
  }
}
const saveCalendar = async () => {
  if (!props.projectData?.id) return
  try {
    saving.value.calendar = true
    const updatedStages = (localPlan.value.stages || []).map((s, idx) => ({
      id: props.projectData?.stages?.[idx]?.id,
      name: s.name || '',
      start_date: s.start || '',
      end_date: s.end || '',
      planned_results: s.result || '',
      order: idx
    }))
    const payload = { start_date: localPlan.value.startDate, end_date: localPlan.value.endDate, stages: updatedStages }
    // пересчёт бюджета при возможном удалении этапов – см. ProjectInfoCalendar.vue
    try {
      const existingItems = Array.isArray(props.projectData?.budget_items) ? props.projectData.budget_items : []
      const keptStageIds = new Set(updatedStages.map(s => s.id).filter(Boolean))
      const remainingItems = existingItems.filter(it => it?.stage_id && keptStageIds.has(it.stage_id))
      const INSURANCE_COEFF = 1.302
      const sumBy = (pred) => remainingItems.filter(pred).reduce((s, it) => s + (Number(it.amount) || 0), 0)
      const salary_budget = sumBy(it => it.cost_article === 'salary' && it.funding_source === 'budget')
      const salary_off_budget = sumBy(it => it.cost_article === 'salary' && it.funding_source === 'nonbudget')
      const other_budget = sumBy(it => it.cost_article === 'other' && it.funding_source === 'budget')
      const other_off_budget = sumBy(it => it.cost_article === 'other' && it.funding_source === 'nonbudget')
      const total_with_insurance = (salary_budget + salary_off_budget) * INSURANCE_COEFF + (other_budget + other_off_budget)
      payload.budget_items = remainingItems
      payload.budget_totals = { salary_budget, salary_off_budget, other_budget, other_off_budget, total_with_insurance }
    } catch (_) {}
    await apiClient.patch(endpoints.project_ed.projects.update(props.projectData.id), payload)
    emit('saved', { section: 'calendar', data: payload })
    window.dispatchEvent(new CustomEvent('project-audit:reload', { detail: { projectId: props.projectData.id } }))
    window.dispatchEvent(new CustomEvent('project-budget:reload', { detail: { projectId: props.projectData.id } }))
    toast.success('Календарный план обновлён')
  } catch (e) {
    toast.error('Ошибка при сохранении календаря')
  } finally {
    saving.value.calendar = false
  }
}

// ======== Вкладка "Бюджет" ========
const localBudget = ref({ stages: [], totals: { salary: 0, other: 0, withInsurance: 0, byArticleSource: { salary: { budget: 0, nonbudget: 0 }, other: { budget: 0, nonbudget: 0 } } } })
const isBudgetValid = ref(true)
const onBudgetValidation = (state) => { isBudgetValid.value = !!state?.isValid }
const planForBudget = computed(() => ({ stages: Array.isArray(props.projectData?.stages) ? props.projectData.stages.map(s => ({ name: s.name || '' })) : [] }))
const initBudgetFromProject = () => {
  const items = Array.isArray(props.projectData?.budget_items) ? props.projectData.budget_items : []
  const totals = props.projectData?.budget_totals || {}
  const stageIdToName = new Map()
  if (Array.isArray(props.projectData?.stages)) props.projectData.stages.forEach((s, idx) => stageIdToName.set(s.id, s.name || `Этап ${idx + 1}`))
  const byStageName = new Map()
  items.forEach(it => {
    const stageName = stageIdToName.get(it.stage_id) || 'Без этапа'
    if (!byStageName.has(stageName)) byStageName.set(stageName, { name: stageName, items: [] })
    byStageName.get(stageName).items.push({ article: it.cost_article === 'salary' ? 'salary' : 'other', source: it.funding_source === 'budget' ? 'budget' : 'nonbudget', amount: Number(it.amount) || 0 })
  })
  localBudget.value = {
    stages: Array.from(byStageName.values()),
    totals: {
      salary: Number(totals?.salary_budget) || 0,
      other: Number(totals?.other_budget) || 0,
      withInsurance: Number(totals?.total_with_insurance) || 0,
      byArticleSource: {
        salary: { budget: Number(totals?.salary_budget) || 0, nonbudget: Number(totals?.salary_off_budget) || 0 },
        other: { budget: Number(totals?.other_budget) || 0, nonbudget: Number(totals?.other_off_budget) || 0 }
      }
    }
  }
}
const resolveStageIdByName = (name) => {
  if (!Array.isArray(props.projectData?.stages)) return null
  const found = props.projectData.stages.find(s => (s.name || '') === name)
  return found ? found.id : null
}
const saveBudget = async () => {
  if (!props.projectData?.id) return
  try {
    saving.value.budget = true
    const totals = localBudget.value?.totals || {}
    const by = totals?.byArticleSource || { salary: {}, other: {} }
    const payload = {
      budget_totals: {
        salary_budget: Number(by?.salary?.budget) || 0,
        salary_off_budget: Number(by?.salary?.nonbudget) || 0,
        other_budget: Number(by?.other?.budget) || 0,
        other_off_budget: Number(by?.other?.nonbudget) || 0,
        total_with_insurance: Number(totals?.withInsurance) || 0
      },
      budget_items: (localBudget.value?.stages || []).flatMap(stg => (stg.items || []).map(row => ({
        cost_article: row.article === 'salary' ? 'salary' : 'other',
        funding_source: row.source === 'budget' ? 'budget' : 'nonbudget',
        amount: Number(row.amount) || 0,
        stage_id: resolveStageIdByName(stg.name)
      })))
    }
    await apiClient.patch(endpoints.project_ed.projects.update(props.projectData.id), payload)
    emit('saved', { section: 'budget', data: payload })
    window.dispatchEvent(new CustomEvent('project-audit:reload', { detail: { projectId: props.projectData.id } }))
    toast.success('Бюджет обновлён')
  } catch (e) {
    toast.error('Ошибка при сохранении бюджета')
  } finally {
    saving.value.budget = false
  }
}

// ======== Вкладка "Доп. информация" ========
const additionalInfoModel = ref({ additionalInfo: '' })
const initAdditionalFromProject = () => {
  const info = props.projectData?.additional_info || props.projectData?.additionalInfo || ''
  additionalInfoModel.value = { additionalInfo: info || '' }
}
const saveAdditional = async () => {
  if (!props.projectData?.id) return
  try {
    saving.value.additional = true
    const payload = { additional_info: additionalInfoModel.value.additionalInfo || '' }
    await apiClient.patch(endpoints.project_ed.projects.update(props.projectData.id), payload)
    emit('saved', { section: 'additional', data: payload })
    window.dispatchEvent(new CustomEvent('project-audit:reload', { detail: { projectId: props.projectData.id } }))
    toast.success('Дополнительная информация обновлена')
  } catch (e) {
    toast.error('Ошибка при сохранении дополнительной информации')
  } finally {
    saving.value.additional = false
  }
}

// ======== Модалка: общие вещи ========
const disableBodyScroll = () => { document.body.style.overflow = 'hidden' }
const enableBodyScroll = () => { document.body.style.overflow = '' }
const handleKeydown = (event) => { if (event.key === 'Escape' && props.isOpen) closeModal() }
const closeModal = async () => {
  // Подтверждение закрытия, если есть несохранённые изменения (простая проверка: всегда спрашиваем)
  try {
    const ok = await (confirmRef.value?.open?.({ title: 'Закрыть без сохранения?', text: 'Несохранённые изменения будут потеряны.' }) || Promise.resolve(true))
    if (!ok) return
  } catch (_) {}
  
  // Одновременно скрываем модальное окно и фон с анимацией
  showModal.value = false
  showBackdrop.value = false
  
  // Эмитим событие закрытия после завершения анимации
  setTimeout(() => {
    emit('close')
  }, 300) // 300ms - время анимации
}

const initAllTabs = () => {
  initIndicatorsFromProject()
  initProvisionsFromProject()
  initPlanFromProject()
  initBudgetFromProject()
  initAdditionalFromProject()
}

const scrollToSection = () => {
  const map = {
    event: eventSectionRef.value,
    indicators: indicatorsSectionRef.value,
    details: detailsSectionRef.value,
    calendar: calendarSectionRef.value,
    budget: budgetSectionRef.value,
    additional: additionalSectionRef.value,
  }
  const el = map[props.focusSection]
  if (!el) return
  const container = contentScrollRef.value
  if (container && typeof container.scrollTo === 'function') {
    const targetTop = el.offsetTop - container.offsetTop
    try {
      container.scrollTo({ top: targetTop, behavior: 'smooth' })
      return
    } catch (_) {
      container.scrollTop = targetTop
      return
    }
  }
  if (typeof el.scrollIntoView === 'function') {
    try { el.scrollIntoView({ behavior: 'smooth', block: 'start' }) } catch (_) { el.scrollIntoView() }
  }
}

watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    disableBodyScroll()
    document.addEventListener('keydown', handleKeydown)
    
    // Одновременно показываем фон и модальное окно с анимацией
    nextTick(() => {
      initAllTabs()
      // Инициализируем выбранное мероприятие текущим значением, чтобы кнопка "Сохранить" была активна
      selectedEvent.value = normalizedCurrentEvent.value || null
      showBackdrop.value = true
      showModal.value = true
      setTimeout(scrollToSection, 50)
    })
  } else {
    enableBodyScroll()
    document.removeEventListener('keydown', handleKeydown)
    showBackdrop.value = false
    showModal.value = false
  }
})

onMounted(() => { 
  if (props.isOpen) { 
    disableBodyScroll(); 
    document.addEventListener('keydown', handleKeydown); 
    initAllTabs(); 
    selectedEvent.value = normalizedCurrentEvent.value || null; 
    showBackdrop.value = true
    showModal.value = true
    setTimeout(scrollToSection, 50)
  } 
})

watch(() => props.focusSection, () => {
  nextTick(() => setTimeout(scrollToSection, 30))
})
onUnmounted(() => { enableBodyScroll(); document.removeEventListener('keydown', handleKeydown) })

// Открытие конкретного раздела извне
const openSection = (section) => {
  try {
    const allowed = ['event', 'indicators', 'details', 'calendar', 'budget', 'additional']
    if (!allowed.includes(section)) return
    // меняем фокус и прокручиваем к разделу
    // props.focusSection реактивный проп, его меняет родитель; здесь инициируем скролл
    nextTick(() => setTimeout(scrollToSection, 30))
  } catch (_) {}
}
defineExpose({ openSection })
</script>

<style scoped lang="scss">
.tab-icon {
  width: 16px;
  height: 16px;
}

.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

.modal.show { display: block !important; }

.modal-xl { max-width: 95vw; width: 95vw; }

// Анимации для плавного появления
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.3s ease;
}

.modal-fade-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(-20px);
}

.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-20px);
}

.modal-fade-enter-to,
.modal-fade-leave-from {
  opacity: 1;
  transform: scale(1) translateY(0);
}

// Анимации для фона
.backdrop-fade-enter-active,
.backdrop-fade-leave-active {
  transition: opacity 0.3s ease;
}

.backdrop-fade-enter-from,
.backdrop-fade-leave-to {
  opacity: 0;
}

.backdrop-fade-enter-to,
.backdrop-fade-leave-from {
  opacity: 1;
}


// Ограничение высоты и прокрутка для режима бюджета
.scrollable-budget {
  max-height: 90vh;
  display: flex;
  align-items: center;
  
  .modal-content {
    max-height: 85vh;
    display: flex;
    flex-direction: column;
  }

  .modal-body {
    overflow: auto;
  }
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
  color: #000;
  opacity: 0.5;
  cursor: pointer;
  &:hover { opacity: 0.75; }
  &::before { content: "×"; }
}
</style>


