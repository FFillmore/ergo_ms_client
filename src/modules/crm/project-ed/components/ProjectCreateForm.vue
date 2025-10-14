<template>
    <div class="project-create-form">
        <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${(currentStep / steps.length) * 100}%` }"></div>
            <span class="progress-text">
                Шаг {{ currentStep }}. {{ steps[currentStep - 1].title }}
            </span>
        </div>

        <div class="tabs-navigation">
            <button
                v-for="(step, index) in steps"
                :key="step.key"
                class="tab-button"
                :class="{
                    'active': currentStep === index + 1,
                    'completed': isStepCompleted(index + 1),
                    'disabled': !isStepAccessible(index + 1)
                }"
                @click="goToStep(index + 1)"
                :disabled="!isStepAccessible(index + 1)"
            >
                <component :is="step.icon" class="tab-icon" :size="20" />
                <span class="tab-label">{{ step.title }}</span>
            </button>
        </div>

        <div class="form-content">
            <div class="form-container">
                <EventSelection
                    v-if="currentStep === 1"
                    v-model:event="formData.event"
                />

                <BasicProvisions
                    v-if="currentStep === 2"
                    v-model:provisions="formData.basicProvisions"
                    :user-role="userRole"
                    :selected-event="formData.event"
                    :user-info="userInfo"
                    @next="nextStep"
                    @prev="prevStep"
                />

                <TargetIndicators
                    v-if="currentStep === 3"
                    v-model:indicators="formData.targetIndicators"
                    :selected-event="formData.event"
                    @next="nextStep"
                    @prev="prevStep"
                />

                <CalendarPlan
                    v-if="currentStep === 4"
                    v-model:plan="formData.calendarPlan"
                    @next="nextStep"
                    @prev="prevStep"
                />

                <Budget
                    v-if="currentStep === 5"
                    v-model:budget="formData.budget"
                    :plan="formData.calendarPlan"
                    @validation-change="(validation) => stepValidation.budget = validation"
                    @next="nextStep"
                    @prev="prevStep"
                />

                <AdditionalInfo
                    v-if="currentStep === 6"
                    v-model:info="formData.additionalInfo"
                    @next="nextStep"
                    @prev="prevStep"
                />
            </div>
        </div>

        <div class="form-actions">
            <button
                v-if="currentStep > 1"
                type="button"
                class="btn btn-secondary"
                @click="prevStep"
            >
                <ArrowLeft class="btn-icon" :size="16" />
                Назад
            </button>
            
            <div class="actions-spacer"></div>
            
            <button
                v-if="currentStep < steps.length"
                type="button"
                class="btn btn-primary"
                @click="nextStep"
                :disabled="!canProceed"
            >
                Далее
                <ArrowRight class="btn-icon" :size="16" />
            </button>
            
            <button
                v-if="currentStep === steps.length"
                type="button"
                class="btn btn-success"
                @click="submitForm"
                :disabled="!canSubmit"
            >
                <Check class="btn-icon" :size="16" />
                Создать проект
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, reactive, watch, onMounted } from 'vue'
import { generateInitials } from '@/modules/crm/project-ed/components/steps/js/initialsGenerator.js'
import { useUserStore } from '@/core/cms/js/userStore.js'
import { apiClient } from '@/js/api/manager.js'
import { 
    Calendar, 
    FileText, 
    Target, 
    Calendar as CalendarIcon, 
    DollarSign, 
    Info,
    ArrowLeft,
    ArrowRight,
    Check
  } from 'lucide-vue-next'
  import { endpoints } from '@/js/api/endpoints.js'
import { useToast } from 'vue-toastification'

const toast = useToast()

// Получаем данные пользователя из store
const userStore = useUserStore()

// Роль пользователя
const userRole = ref('expert') // Может быть: 'user', 'expert', 'admin', 'supervisor'

// Информация о пользователе из CMS API
const userInfo = ref(null)

// Загружаем данные пользователя из CMS API
async function fetchUserInfo() {
    try {
        const response = await apiClient.get('/cms/adp/profile/')
        const userData = response.data
        
        userInfo.value = {
            id: userData.id,
            first_name: userData.first_name,
            last_name: userData.last_name,
            middle_name: userData.adp_profile?.middle_name,
            username: userData.username,
            email: userData.email,
            name: userData.adp_profile?.full_name || `${userData.first_name || ''} ${userData.last_name || ''}`.trim()
        }
    } catch (error) {
        console.error('Ошибка загрузки данных пользователя:', error)
        // Fallback на данные из store
        const fullName = userStore.fullName
        userInfo.value = {
            id: userStore.user?.id,
            name: fullName,
            initials: generateInitials(fullName)
        }
    }
}

// Импорт компонентов этапов
import EventSelection from './steps/EventSelection.vue'
import BasicProvisions from './steps/BasicProvisions.vue'
import TargetIndicators from './steps/TargetIndicators.vue'
import CalendarPlan from './steps/CalendarPlan.vue'
import Budget from './steps/Budget.vue'
import AdditionalInfo from './steps/AdditionalInfo.vue'

// Определение этапов
const steps = [
    { key: 'event', title: 'Выбор мероприятия', icon: Calendar },
    { key: 'provisions', title: 'Основные положения', icon: FileText },
    { key: 'indicators', title: 'Целевые показатели', icon: Target },
    { key: 'calendar', title: 'Календарный план-график', icon: CalendarIcon },
    { key: 'budget', title: 'Бюджет', icon: DollarSign },
    { key: 'additional', title: 'Дополнительная информация', icon: Info }
]

// Текущий шаг
const currentStep = ref(1)

// Состояние валидации для каждого шага
const stepValidation = reactive({
    budget: { isValid: false, errors: [] }
})

// Данные формы
const formData = reactive({
    event: null,
    basicProvisions: {
        // Основные поля паспорта проекта
        projectName: '',
        projectNameClarification: '',
        shortName: '',
        projectGoal: '',
        projectTasks: ['', ''],
        startDate: '',
        endDate: '',
        curator: null,
        customer: '',
        manager: '',
        executors: [],
        plannedResults: ['', ''],
        budget: 0,
        
        // Комментарии экспертов
        comments: {
            projectName: '',
            shortName: '',
            projectGoal: '',
            projectTasks: '',
            projectDates: '',
            curator: '',
            customer: '',
            manager: '',
            executors: '',
            plannedResults: '',
            budget: ''
        }
    },
    targetIndicators: [],
    calendarPlan: {
        startDate: '',
        endDate: '',
        stages: [],
        milestones: []
    },
    budget: {
        totalAmount: 0,
        items: []
    },
    additionalInfo: {
        risks: '',
        resources: '',
        notes: ''
    }
})

// Валидация
const canProceed = computed(() => {
    switch (currentStep.value) {
        case 1:
            return formData.event !== null
        case 2:
            // Валидация основных положений
            return formData.basicProvisions.projectName.trim() !== '' &&
                   formData.basicProvisions.shortName.trim() !== '' &&
                   formData.basicProvisions.projectGoal.trim() !== '' &&
                   formData.basicProvisions.projectTasks.some(task => task.trim() !== '') &&
                   formData.basicProvisions.startDate !== '' &&
                   formData.basicProvisions.endDate !== '' &&
                   formData.basicProvisions.curator !== null &&
                   formData.basicProvisions.customer !== '' &&
                   formData.basicProvisions.manager !== '' &&
                   formData.basicProvisions.executors && formData.basicProvisions.executors.length > 0 &&
                   formData.basicProvisions.plannedResults.some(result => result.trim() !== '')
        case 3:
            return formData.targetIndicators.length > 0
        case 4:
            return formData.calendarPlan.startDate !== '' && 
                   formData.calendarPlan.endDate !== ''
        case 5:
            return stepValidation.budget.isValid
        case 6:
            return true // Дополнительная информация необязательна
        default:
            return false
    }
})

const canSubmit = computed(() => {
    return canProceed.value && currentStep.value === steps.length
})

// Навигация
const goToStep = (step) => {
    // Разрешаем переход к любой вкладке, если она уже была пройдена
    // или является следующей после последней пройденной
    const maxAllowedStep = getMaxAllowedStep()
    if (step <= maxAllowedStep) {
        currentStep.value = step
    }
}

// Определяем максимально доступный шаг
const getMaxAllowedStep = () => {
    // Проверяем шаги последовательно, начиная с первого
    for (let i = 1; i <= steps.length; i++) {
        if (!isStepCompleted(i)) {
            return i // Возвращаем первый незаполненный шаг
        }
    }
    return steps.length // Если все шаги заполнены, разрешаем все
}

// Проверяем, заполнен ли шаг
const isStepCompleted = (step) => {
    switch (step) {
        case 1:
            return formData.event !== null
        case 2:
            return formData.basicProvisions.projectName.trim() !== '' &&
                   formData.basicProvisions.shortName.trim() !== '' &&
                   formData.basicProvisions.projectGoal.trim() !== '' &&
                   formData.basicProvisions.projectTasks.some(task => task.trim() !== '') &&
                   formData.basicProvisions.startDate !== '' &&
                   formData.basicProvisions.endDate !== '' &&
                   formData.basicProvisions.curator !== null &&
                   formData.basicProvisions.customer !== '' &&
                   formData.basicProvisions.manager !== '' &&
                   formData.basicProvisions.executors && formData.basicProvisions.executors.length > 0 &&
                   formData.basicProvisions.plannedResults.some(result => result.trim() !== '')
        case 3:
            return formData.targetIndicators.length > 0
        case 4:
            return formData.calendarPlan.startDate !== '' && 
                   formData.calendarPlan.endDate !== ''
        case 5:
            return stepValidation.budget.isValid
        case 6:
            return true // Дополнительная информация необязательна
        default:
            return false
    }
}

// Проверяем, доступна ли вкладка для перехода
const isStepAccessible = (step) => {
    // Первая вкладка всегда доступна
    if (step === 1) return true
    
    // Для остальных вкладок проверяем, что все предыдущие шаги заполнены
    for (let i = 1; i < step; i++) {
        if (!isStepCompleted(i)) {
            return false
        }
    }
    return true
}

const nextStep = () => {
    if (currentStep.value < steps.length && canProceed.value) {
        currentStep.value++
    }
}

const prevStep = () => {
    if (currentStep.value > 1) {
        currentStep.value--
    }
}

// Синхронизация бюджета между разделами
watch(() => formData.budget.totals?.withInsurance, (newAmount) => {
    formData.basicProvisions.budget = newAmount || 0
}, { immediate: true })

// Синхронизация дат между BasicProvisions и CalendarPlan
watch(() => [formData.basicProvisions.startDate, formData.basicProvisions.endDate], ([startDate, endDate]) => {
    if (startDate) {
        formData.calendarPlan.startDate = startDate
    }
    if (endDate) {
        formData.calendarPlan.endDate = endDate
    }
}, { immediate: true })

// Обратная синхронизация: если даты изменяются в CalendarPlan, обновляем BasicProvisions
watch(() => [formData.calendarPlan.startDate, formData.calendarPlan.endDate], ([startDate, endDate]) => {
    if (startDate && startDate !== formData.basicProvisions.startDate) {
        formData.basicProvisions.startDate = startDate
    }
    if (endDate && endDate !== formData.basicProvisions.endDate) {
        formData.basicProvisions.endDate = endDate
    }
}, { immediate: true })

// Отправка формы
const emit = defineEmits(['project-created'])

const isSubmitting = ref(false)

const submitForm = async () => {
    if (!canSubmit.value || isSubmitting.value) return

    try {
        isSubmitting.value = true
        // Нормализация данных под ProjectCreateSerializer API
        const normalizedTargetIndicators = (formData.targetIndicators || []).map((ti) => {
            const isIdName = typeof ti.name === 'number'
            return {
                source_indicator_id: isIdName ? ti.name : undefined,
                name: !isIdName ? (ti.name || '') : undefined,
                unit: ti.unit || '',
                baseline: ti.baseline ?? ti.baseValue ?? null,
                planned: ti.planned ?? ti.targetValue ?? null,
            }
        })

        // Фильтруем пустые этапы перед нормализацией, чтобы индексы совпадали с бюджетом
        const normalizedStages = (formData.calendarPlan?.stages || [])
            .filter(st => st?.name && st.name.trim() !== '')
            .map((st, idx) => ({
                id: st.id ?? st.key ?? idx,
                name: st.name || '',
                startDate: st.startDate || st.start || formData.calendarPlan.startDate || '',
                endDate: st.endDate || st.end || formData.calendarPlan.endDate || '',
                plannedResults: st.plannedResults || (st.result ? [st.result] : []),
            }))

        const flattenedBudgetItems = []
        ;(formData.budget?.stages || []).forEach((st, idx) => {
            ;(st.items || []).forEach((it) => {
                const stageId = st.id ?? st.key ?? idx
                flattenedBudgetItems.push({
                    stageId: stageId,
                    article: it.article || it.costArticle || '',
                    source: it.source || it.fundingSource || '',
                    amount: Number(it.amount || 0),
                })
            })
        })

        const normalizedBudget = {
            items: flattenedBudgetItems,
            totals: formData.budget?.totals || {
                withInsurance: Number(formData.basicProvisions.budget || 0),
            },
        }

        const normalizedCalendarPlan = {
            startDate: formData.calendarPlan?.startDate || formData.basicProvisions.startDate || '',
            endDate: formData.calendarPlan?.endDate || formData.basicProvisions.endDate || '',
            stages: normalizedStages,
        }

        const normalizedAdditionalInfo = {
            notes: formData.additionalInfo?.notes || formData.additionalInfo?.additionalInfo || '',
        }

        // Формируем payload под ProjectCreateSerializer
        const payload = {
            short_name: formData.basicProvisions.shortName,
            name: formData.basicProvisions.projectName,
            name_clarification: formData.basicProvisions.projectNameClarification || '',
            start_date: formData.basicProvisions.startDate,
            end_date: formData.basicProvisions.endDate,
            curator_id: formData.basicProvisions.curator ?? null,
            manager_id: userInfo.value?.id || null,
            customer_id: formData.basicProvisions.customerId ?? null,
            customer_name: formData.basicProvisions.customer || '',
            manager_name: formData.basicProvisions.manager || (userInfo.value?.name || ''),
            budget_total: Number(
                (formData.budget?.totals?.withInsurance) ?? formData.basicProvisions.budget ?? 0
            ) || 0,
            event: formData.event || null,
            basic_provisions: formData.basicProvisions,
            target_indicators: normalizedTargetIndicators,
            calendar_plan: normalizedCalendarPlan,
            budget: normalizedBudget,
            additional_info: normalizedAdditionalInfo,
        }

        const res = await apiClient.post(endpoints.project_ed.projects.create, payload)
        if (res?.success) {
            const serverData = res.data
            toast.success('Проект успешно создан')
            emit('project-created', serverData)
        } else {
            toast.error('Не удалось создать проект')
        }
    } catch (e) {
        toast.error('Ошибка при создании проекта')
        console.error('Ошибка создания проекта:', e)
    } finally {
        isSubmitting.value = false
    }
}

// Загружаем данные пользователя при монтировании компонента
onMounted(() => {
    fetchUserInfo()
})
</script>

<style scoped lang="scss">
.project-create-form {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

// Прогресс-бар
.progress-bar {
    width: 100%;
    height: 48px;
    background: var(--color-secondary-background);
    border-radius: 32px;
    overflow: hidden;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #0d6efd, #0b5ed7);
    transition: width 0.3s ease;
    position: absolute;
    top: 0;
    left: 0;
}

.progress-text {
    font-size: 0.875rem;
    font-weight: 700;
    color: var(--bs-body-color);
    text-align: center;
    white-space: nowrap;
    z-index: 2;
    position: relative;
    padding: 0 1rem;
}

// Навигация по вкладкам
.tabs-navigation {
    display: flex;
    gap: 0.25rem;
    padding: 0.5rem;
    background: var(--color-primary-background);
    border-radius: 8px;
    border: 1px solid var(--color-border);
    flex-wrap: wrap;
    justify-content: center;
}

.tab-button {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.5rem 0.75rem;
    background: var(--color-primary-background);
    border: 1px solid var(--color-border);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;
    min-width: fit-content;
    flex: 1;
    max-width: 200px;
    justify-content: center;
    position: relative;

    &:hover:not(.disabled) {
        border-color: #0d6efd;
    }

    &.active {
        background: #0d6efd;
        color: white;
        border-color: #0d6efd;
        box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.25);
        transform: translateY(-1px);
        font-weight: 600;
    }

    &.completed {
        background: #d1e7dd;
        color: #0f5132;
        border-color: #badbcc;
    }

    &.disabled {
        background: var(--color-secondary-background);
        color: var(--color-secondary-text);
        cursor: not-allowed;
        opacity: 0.6;
    }
}

.tab-icon {
    flex-shrink: 0;
    transition: all 0.2s ease;
}

.tab-button.active .tab-icon {
    transform: scale(1.1);
}

.tab-label {
    font-size: 0.75rem;
    font-weight: 500;
    text-align: center;
}

// Контент формы
.form-content {
    background: var(--color-primary-background);
    border-radius: 8px;
    border: 1px solid var(--color-border);
    overflow: hidden;
}

.form-container {
    padding: 2rem;
    min-height: 400px;
}

// Кнопки действий
.form-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.actions-spacer {
    flex: 1;
}

.btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
}

.btn-primary {
    background: #0d6efd;
    color: white;

    &:hover:not(:disabled) {
        background: #0b5ed7;
    }
}

.btn-secondary {
    background: var(--color-secondary-background);
    color: white;

    &:hover:not(:disabled) {
        background: #5c636a;
    }
}

.btn-success {
    background: #198754;
    color: white;

    &:hover:not(:disabled) {
        background: #157347;
    }
}

.btn-icon {
    flex-shrink: 0;
}

// Адаптивность
@media (max-width: 768px) {
    .tabs-navigation {
        flex-direction: column;
        gap: 0.25rem;
    }

    .tab-button {
        justify-content: center;
        max-width: none;
        flex: none;
    }

    .form-actions {
        flex-direction: column;
        gap: 1rem;
    }

    .actions-spacer {
        display: none;
    }
}

@media (max-width: 1200px) {
    .tab-button {
        max-width: 150px;
        padding: 0.4rem 0.5rem;
    }
    
    .tab-label {
        font-size: 0.7rem;
    }
}
</style>
