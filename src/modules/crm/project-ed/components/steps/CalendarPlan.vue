<template>
    <div class="calendar-plan">
        <div class="step-header">
            <h2 class="step-title">Календарный план-график</h2>
            <p class="step-description">
                Определите временные рамки проекта и ключевые этапы
            </p>
        </div>

        <div class="form-content">
            <form class="calendar-form">
                <div class="form-section">
                    <div class="section-header">
                        <div class="actions">
                            <button type="button" class="btn btn-outline-primary btn-sm" @click="addStage">
                                <Plus class="btn-icon" :size="16" />
                                Добавить этап
                            </button>
                        </div>
                    </div>

                    <div class="stages-grid">
                        <div
                            v-for="(stage, index) in localPlan.stages"
                            :key="`stage-${index}`"
                            class="stage-card"
                        >
                            <div class="stage-card__inner" :class="{ 'is-blurred': confirmDeleteIndex === index }">
                            <div class="stage-card__header">
                                <div class="stage-index">Этап {{ index + 1 }}</div>
                                <button
                                    v-if="localPlan.stages.length > 1"
                                    type="button"
                                    class="btn-remove stage-remove"
                                    @click="requestRemoveStage(index)"
                                    aria-label="Удалить этап"
                                >
                                    <X class="icon" :size="16" />
                                </button>
                            </div>

                            <div class="stage-row-1">
                                <div class="field">
                                    <div class="field-caption">Наименование этапа</div>
                                    <input
                                        v-model="stage.name"
                                        type="text"
                                        class="form-input"
                                        placeholder="Введите текст"
                                    />
                                </div>
                            </div>

                            <div class="stage-row-2">
                                <div class="field field--with-icon" :class="{ 'is-readonly': index === 0 }">
                                    <div class="field-caption">Дата начала</div>
                                    <div class="date-input-wrapper">
                                        <input
                                            v-model="stage.start"
                                            @click="openNativePicker"
                                            @change="syncStageDates(index, 'start')"
                                            type="date"
                                            class="form-input"
                                            :readonly="index === 0"
                                            :min="normalizedStartDate"
                                            :max="normalizedEndDate"
                                        />
                                        <div v-if="index === 0" class="info-icon" @mouseenter="showInfo('start', index, $event)" @mouseleave="hideInfo">
                                            <CircleQuestionMark :size="18" />
                                        </div>
                                    </div>
                                </div>

                                <div class="field field--with-icon" :class="{ 'is-readonly': index === localPlan.stages.length - 1 }">
                                    <div class="field-caption">Дата окончания</div>
                                    <div class="date-input-wrapper">
                                        <input
                                            v-model="stage.end"
                                            @click="openNativePicker"
                                            @change="syncStageDates(index, 'end')"
                                            type="date"
                                            class="form-input"
                                            :readonly="index === localPlan.stages.length - 1"
                                            :min="normalizedStartDate"
                                            :max="normalizedEndDate"
                                        />
                                        <div v-if="index === localPlan.stages.length - 1" class="info-icon" @mouseenter="showInfo('end', index, $event)" @mouseleave="hideInfo">
                                            <CircleQuestionMark :size="18" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="stage-row-3">
                                <div class="field">
                                    <div class="field-caption">Планируемые результаты работы</div>
                                    <textarea
                                        v-model="stage.result"
                                        class="form-textarea"
                                        placeholder="Введите текст"
                                    ></textarea>
                                </div>
                            </div>
                            </div>

                            <!-- Подтверждение удаления (только при редактировании и наличии индикаторов) -->
                            <div v-if="confirmDeleteIndex === index" class="confirm-overlay">
                                <div class="confirm-card">
                                    <div class="confirm-content">
                                        <div class="confirm-icon">
                                            <AlertCircle class="icon-alert" :size="48" />
                                        </div>
                                        <div class="confirm-text">
                                        Вы уверены, что хотите удалить этот этап? К этому этапу привязаны статьи бюджета, которые в случае удаления тоже будут удалены.
                                        </div>
                                    </div>
                                    <div class="confirm-actions">
                                        <button type="button" class="btn btn-danger"
                                                :disabled="confirmCountdown > 0"
                                                @click="confirmDelete()">
                                            <span v-if="confirmCountdown > 0">Да, я хочу удалить ({{ confirmCountdown }})</span>
                                            <span v-else>Да, я хочу удалить</span>
                                        </button>
                                        <button type="button" class="btn btn-secondary" @click="cancelConfirm()">Отмена</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-if="localPlan.stages.length === 0" class="empty-state">
                        <Calendar class="empty-icon" :size="48" />
                        <h4>Нет этапов</h4>
                        <p>Добавьте этапы проекта</p>
                        <button type="button" class="btn btn-primary" @click="addStage">
                            <Plus class="btn-icon" :size="16" /> Добавить первый этап
                        </button>
                    </div>
                </div>
            </form>
        </div>

    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick, onUnmounted } from 'vue'
import { 
    Calendar, 
    Plus, 
    X,
    CircleHelp as CircleQuestionMark,
    AlertCircle
} from 'lucide-vue-next'

const props = defineProps({
    plan: {
        type: Object,
        required: true
    },
    isEdit: {
        type: Boolean,
        default: false
    },
    hasIndicatorsForStage: {
        type: Function,
        default: () => false
    }
})

const emit = defineEmits(['update:plan'])

// Нормализация дат к формату YYYY-MM-DD (поддержка старых структур)
const toISODate = (value) => {
    if (!value) return ''
    if (typeof value === 'string') {
        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
        const parsed = new Date(value)
        if (!isNaN(parsed)) {
            const y = parsed.getFullYear()
            const m = String(parsed.getMonth() + 1).padStart(2, '0')
            const d = String(parsed.getDate()).padStart(2, '0')
            return `${y}-${m}-${d}`
        }
        return ''
    }
    if (value instanceof Date && !isNaN(value)) {
        const y = value.getFullYear()
        const m = String(value.getMonth() + 1).padStart(2, '0')
        const d = String(value.getDate()).padStart(2, '0')
        return `${y}-${m}-${d}`
    }
    if (typeof value === 'object' && value.day && value.month && value.year) {
        const y = value.year
        const m = String(value.month).padStart(2, '0')
        const d = String(value.day).padStart(2, '0')
        return `${y}-${m}-${d}`
    }
    return ''
}

// Локальные данные
const localPlan = ref({
    startDate: toISODate(props.plan.startDate) || '',
    endDate: toISODate(props.plan.endDate) || '',
    stages: props.plan.stages ? [...props.plan.stages] : [
        { name: '', start: '', end: '', result: '' },
        { name: '', start: '', end: '', result: '' },
        { name: '', start: '', end: '', result: '' }
    ]
})

// Вычисляемые свойства
const normalizedStartDate = computed(() => toISODate(localPlan.value.startDate))
const normalizedEndDate = computed(() => toISODate(localPlan.value.endDate))

// Методы
const addStage = () => {
    const newStage = { name: '', start: '', end: '', result: '' }
    
    // Если это не первый этап, устанавливаем дату начала на основе предыдущего этапа
    if (localPlan.value.stages.length > 0) {
        const lastStage = localPlan.value.stages[localPlan.value.stages.length - 1]
        if (lastStage.end) {
            newStage.start = lastStage.end
        }
    }
    
    localPlan.value.stages.push(newStage)
}

const removeStage = (index) => {
    localPlan.value.stages.splice(index, 1)
    
    // После удаления этапа синхронизируем оставшиеся этапы
    if (localPlan.value.stages.length > 1) {
        for (let i = 0; i < localPlan.value.stages.length - 1; i++) {
            const currentStage = localPlan.value.stages[i]
            const nextStage = localPlan.value.stages[i + 1]
            
            if (currentStage.end && !nextStage.start) {
                nextStage.start = currentStage.end
            }
        }
    }
}

// --- Подтверждение удаления при редактировании и наличии индикаторов ---
const confirmDeleteIndex = ref(null)
const confirmCountdown = ref(0)
let confirmTimer = null

const requestRemoveStage = (index) => {
    if (props.isEdit && props.hasIndicatorsForStage(index, localPlan.value.stages[index])) {
        confirmDeleteIndex.value = index
        startConfirmCountdown()
        return
    }
    removeStage(index)
}

const startConfirmCountdown = () => {
    confirmCountdown.value = 5
    clearInterval(confirmTimer)
    confirmTimer = setInterval(() => {
        if (confirmCountdown.value > 0) {
            confirmCountdown.value -= 1
        } else {
            clearInterval(confirmTimer)
        }
    }, 1000)
}

const cancelConfirm = () => {
    clearInterval(confirmTimer)
    confirmTimer = null
    confirmDeleteIndex.value = null
    confirmCountdown.value = 0
}

const confirmDelete = () => {
    if (confirmDeleteIndex.value === null) return
    const idx = confirmDeleteIndex.value
    cancelConfirm()
    removeStage(idx)
}

// Функция для добавления одного дня к дате
const addOneDay = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    date.setDate(date.getDate() + 1)
    return toISODate(date)
}

// Функция для вычитания одного дня от даты
const subtractOneDay = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    date.setDate(date.getDate() - 1)
    return toISODate(date)
}

// Синхронизация дат при изменении конкретного этапа
const syncStageDates = (changedIndex, field) => {
    const stages = localPlan.value.stages
    
    if (field === 'start' && changedIndex > 0) {
        // Если изменилась дата начала, обновляем дату окончания предыдущего этапа
        const prevStage = stages[changedIndex - 1]
        const currentStage = stages[changedIndex]
        
        if (currentStage.start) {
            // Предыдущий этап заканчивается на день раньше начала текущего
            prevStage.end = subtractOneDay(currentStage.start)
        }
    }
    
    if (field === 'end' && changedIndex < stages.length - 1) {
        // Если изменилась дата окончания, обновляем дату начала следующего этапа
        const currentStage = stages[changedIndex]
        const nextStage = stages[changedIndex + 1]
        
        if (currentStage.end) {
            // Следующий этап начинается на день после окончания текущего
            nextStage.start = addOneDay(currentStage.end)
        }
    }
}

// Обработчики больше не нужны — используем v-model у инпутов дат

// Открыть нативный пикер даты по клику/фокусу
const openNativePicker = (e) => {
    const el = e?.target
    // Блокируем не пользовательские вызовы и readonly инпуты
    if (!e?.isTrusted || !el || el.readOnly) return
    if (typeof el.showPicker === 'function') {
        try {
            el.showPicker()
        } catch (_) {
            // в браузерах без поддержки или без активации пользователя — просто игнорируем
        }
    }
}

// Поповер как в BasicProvisions
const datePopover = ref(null)
let popoverTarget = null

const ensureDatePopover = () => {
    if (!datePopover.value) {
        const popover = document.createElement('div')
        popover.className = 'custom-popover'
        popover.innerHTML = `
            <div class="custom-popover-arrow"></div>
            <div class="custom-popover-content"></div>
        `
        document.body.appendChild(popover)
        datePopover.value = popover

        const handleResize = () => repositionPopover()
        window.addEventListener('resize', handleResize)
        window.addEventListener('scroll', handleResize)
        popover._resizeHandler = handleResize
    }
}

const repositionPopover = () => {
    if (!datePopover.value || !popoverTarget) return
    const rect = popoverTarget.getBoundingClientRect()
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft
    const scrollY = window.pageYOffset || document.documentElement.scrollTop
    const pop = datePopover.value
    pop.style.display = 'block'
    // позиционируем над центром иконки
    const left = rect.left + scrollX + rect.width / 2 - pop.offsetWidth / 2
    const top = rect.top + scrollY - pop.offsetHeight - 8
    pop.style.left = Math.max(10, left) + 'px'
    pop.style.top = Math.max(10, top) + 'px'
}

const showInfo = (type, index, evt) => {
    ensureDatePopover()
    const target = evt?.currentTarget
    if (!datePopover.value || !target) return
    popoverTarget = target
    const content = datePopover.value.querySelector('.custom-popover-content')
    if (content) {
        content.textContent = type === 'start' ? 'Дата берётся из даты начала проекта' : 'Дата берётся из даты окончания проекта'
    }
    repositionPopover()
}

const hideInfo = () => {
    if (datePopover.value) {
        datePopover.value.style.display = 'none'
    }
    popoverTarget = null
}

onUnmounted(() => {
    if (datePopover.value) {
        if (datePopover.value._resizeHandler) {
            window.removeEventListener('resize', datePopover.value._resizeHandler)
            window.removeEventListener('scroll', datePopover.value._resizeHandler)
        }
        datePopover.value.remove()
        datePopover.value = null
    }
    clearInterval(confirmTimer)
})



// Синхронизация дат: начало первого этапа и окончание последнего
watch(() => [normalizedStartDate.value, normalizedEndDate.value, localPlan.value.stages.length], () => {
    if (localPlan.value.stages.length > 0) {
        // проставляем значения прямо в модели этапов, в ISO-формате
        localPlan.value.stages[0].start = normalizedStartDate.value || ''
        localPlan.value.stages[localPlan.value.stages.length - 1].end = normalizedEndDate.value || ''
    }
}, { immediate: true })

// Синхронизация между этапами: конец предыдущего = начало следующего
watch(() => localPlan.value.stages, (newStages) => {
    if (newStages && newStages.length > 1) {
        for (let i = 0; i < newStages.length - 1; i++) {
            const currentStage = newStages[i]
            const nextStage = newStages[i + 1]
            
            // Если у текущего этапа есть дата окончания, устанавливаем дату начала следующего на следующий день
            if (currentStage.end && !nextStage.start) {
                nextStage.start = addOneDay(currentStage.end)
            }
            
            // Если у следующего этапа есть дата начала, устанавливаем дату окончания текущего на предыдущий день
            if (nextStage.start && !currentStage.end) {
                currentStage.end = subtractOneDay(nextStage.start)
            }
        }
    }
}, { deep: true })

// При изменении входных данных плана снаружи (выбор мероприятия), подтягиваем даты в первый/последний этап
watch(() => props.plan, (newPlan) => {
    if (!newPlan) return
    
    const newStartDate = toISODate(newPlan.startDate)
    const newEndDate = toISODate(newPlan.endDate)
    
    // Обновляем даты только если они действительно изменились
    if (newStartDate && newStartDate !== localPlan.value.startDate) {
        localPlan.value.startDate = newStartDate
    }
    if (newEndDate && newEndDate !== localPlan.value.endDate) {
        localPlan.value.endDate = newEndDate
    }
    
    // Обновляем даты в этапах после изменения дат проекта
    nextTick(() => {
        if (localPlan.value.stages.length > 0) {
            localPlan.value.stages[0].start = normalizedStartDate.value
            localPlan.value.stages[localPlan.value.stages.length - 1].end = normalizedEndDate.value
        }
    })
}, { deep: true, immediate: true })

// Следим за изменениями и обновляем родительский компонент
watch(localPlan, (newValue) => {
    emit('update:plan', newValue)
}, { deep: true })

// Инициализация дат в этапах
onMounted(() => {
    nextTick(() => {
        // Притянуть даты в этапы
        if (localPlan.value.stages.length > 0) {
            localPlan.value.stages[0].start = normalizedStartDate.value
            localPlan.value.stages[localPlan.value.stages.length - 1].end = normalizedEndDate.value
        }
    })
})
</script>

<style scoped lang="scss">
.calendar-plan {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.step-header {
    text-align: center;
    margin-bottom: 1rem;
}

.step-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #212529;
    margin: 0 0 0.5rem 0;
}

.step-description {
    color: #6c757d;
    margin: 0;
}

.form-content {
    flex: 1;
}

.calendar-form {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.form-section {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 1.5rem;
    border: 1px solid #dee2e6;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}


.form-input,
.form-textarea {
    padding: 0.75rem;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;

    &:focus {
        outline: none;
        border-color: #0d6efd;
        box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
    }
}
.form-input[type='date'] {

    &::-webkit-calendar-picker-indicator {
        position: absolute;
        right: 12px;
    }

    &::-moz-calendar-picker-indicator {
        position: absolute;
        right: 12px;
    }
}


.form-textarea {
    resize: vertical;
    min-height: 80px;
}

// Сетка этапов
.stages-grid {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.stage-card {
    background: #f1f3f5;
    border: 1px solid #dee2e6;
    border-radius: 10px;
    padding: 1rem;
    position: relative;
}

.stage-card__inner.is-blurred {
    filter: blur(3px);
    pointer-events: none;
}

.stage-card__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;
}

.stage-index {
    font-weight: 600;
    color: #495057;
}

.stage-row-1,
.stage-row-3 {
    display: block;
}

.stage-row-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
}

@media (max-width: 768px) {
    .stage-row-2 {
        grid-template-columns: 1fr;
    }
}

.stage-card .stage-remove {
    height: 32px;
    width: 32px;
    margin: 0;
}


.field {
    display: flex;
    flex-direction: column;
}

.field-caption {
    margin-bottom: 0.35rem;
    font-size: 0.75rem;
    color: #6c757d;
}

.field--with-icon .date-input-wrapper {
    position: relative;
    width: 100%;
}

.field--with-icon .info-icon {
    position: absolute;
    right: 16px; // оставляем место под нативную иконку календаря
    top: 50%;
    transform: translateY(-50%);
    color: var(--color-secondary-text);
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: auto; // позволяем hover
    cursor: help;
    z-index: 2;
}


// Чтобы иконка не перекрывала текст
.field--with-icon .form-input {
    width: 100%;
}

.stage-remove {
    align-self: start;
    margin-top: 8px; // выравнивание относительно высоты инпута, а не всей строки
}

.form-input[readonly] {
    background: #e9ecef;
    cursor: not-allowed;
}

// Оверлей подтверждения удаления
.confirm-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.15);
    border-radius: 10px;
    padding: 1rem;
}

.confirm-card {
    background: #fff;
    border: 1px solid #dee2e6;
    border-radius: 10px;
    padding: 1rem;
    max-width: 520px;
    width: 100%;
    box-shadow: 0 10px 30px rgba(0,0,0,0.15);
}

.confirm-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.confirm-icon .icon-alert {
    color: #dc3545; // красный
}

.confirm-text {
    color: #343a40;
    margin-bottom: 1rem;
}

.confirm-actions {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
}


.btn-remove {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: #dc3545;
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
        background: #c82333;
    }

    .icon {
        flex-shrink: 0;
    }
}


.empty-state {
    text-align: center;
    padding: 3rem 1rem;
    color: #6c757d;

    .empty-icon {
        margin-bottom: 1rem;
        opacity: 0.5;
    }

    h4 {
        margin: 0 0 0.5rem 0;
        color: #495057;
    }

    p {
        margin: 0 0 1.5rem 0;
    }
}



// Адаптивность
@media (max-width: 768px) {
    .section-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
    }
}
</style>
