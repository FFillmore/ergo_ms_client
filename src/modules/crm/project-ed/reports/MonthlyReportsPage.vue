<template>
    <div class="monthly-reports-page">
        <div class="months-container">
            <div class="months-list">
                <div
                    v-for="month in months"
                    :key="month.id"
                    class="month-item d-flex align-items-center"
                    :class="{ active: selectedMonth?.id === month.id }"
                    role="button"
                    tabindex="0"
                    @click="selectMonth(month)"
                    @keyup.enter="selectMonth(month)"
                >
                    <Calendar :size="20" class="me-2" />
                    <span class="month-name">{{ month.name }}</span>
                </div>
            </div>
            <div class="month-content">
                <div v-if="selectedMonth" class="selected-month-info">
                    <h5 class="mb-3">{{ selectedMonth.name }}</h5>

                    <!-- Контейнер этапов -->
                    <div class="stages-container">
                        <h5 class="stages-title">Этапы</h5>
                        <div class="stages">
                            <div class="stages-list">
                                <details
                                    v-for="stage in stages"
                                    :key="stage.id"
                                    class="stage-item"
                                >
                                    <summary class="stage-summary d-flex align-items-center">
                                        <span class="icon d-inline-flex align-items-center justify-content-center me-2">
                                            <ChevronDown :size="18" />
                                        </span>
                                        <span class="stage-title">Этап {{ stage.number }}. {{ stage.name }}</span>
                                    </summary>
                                    <div class="stage-body">
                                        <div class="stage-sections">
                                            <!-- Раздел информации -->
                                            <div class="section">
                                                <h6 class="section-title">Информация</h6>
                                                <div class="info-fields">
                                                    <div class="field-group">
                                                        <label class="field-label">Наименование этапа</label>
                                                        <input 
                                                            type="text" 
                                                            class="form-control" 
                                                            v-model="stage.name"
                                                            placeholder="Введите наименование этапа"
                                                        >
                                                    </div>
                                                    <div class="date-fields">
                                                        <div class="field-group">
                                                            <label class="field-label">Дата начала</label>
                                                            <input 
                                                                type="date" 
                                                                class="form-control" 
                                                                v-model="stage.startDate"
                                                            >
                                                        </div>
                                                        <div class="field-group">
                                                            <label class="field-label">Дата окончания</label>
                                                            <input 
                                                                type="date" 
                                                                class="form-control" 
                                                                v-model="stage.endDate"
                                                            >
                                                        </div>
                                                    </div>
                                                    <div class="field-group">
                                                        <label class="field-label">Выполненные работы</label>
                                                        <textarea 
                                                            class="form-control" 
                                                            v-model="stage.plannedResults"
                                                            rows="3"
                                                            placeholder="Опишите планируемые результаты работы"
                                                        ></textarea>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- Раздел исполнителей -->
                                            <div class="section">
                                                <h6 class="section-title">Исполнители</h6>
                                                <div class="executors-section">
                                                    <div class="executors-table-wrapper">
                                                        <table class="executors-table">
                                                            <thead>
                                                                <tr>
                                                                    <th class="executor-column">Исполнитель</th>
                                                                    <th class="salary-column">Заработная плата, руб.</th>
                                                                    <th class="expenses-column">Другие расходы, руб.</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                <tr v-for="(executor, index) in stage.executors" :key="index" class="executor-row">
                                                                    <td class="executor-cell">
                                                                        <div class="executor-info">
                                                                            <DefaultAvatar
                                                                                :size="'medium'"
                                                                                :title="executor.name"
                                                                            />
                                                                            <div class="executor-details">
                                                                                <div class="executor-name">{{ executor.name }}</div>
                                                                                <div class="executor-position">{{ executor.position }}</div>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td class="salary-cell">
                                                                        <div class="budget-row">
                                                                            <div class="budget-item">
                                                                                <span class="budget-label">внебюджет</span>
                                                                                <input 
                                                                                    type="number" 
                                                                                    class="budget-input" 
                                                                                    v-model="executor.salaryOffBudget"
                                                                                    placeholder="0"
                                                                                >
                                                                            </div>
                                                                            <div class="budget-item">
                                                                                <span class="budget-label">бюджет</span>
                                                                                <input 
                                                                                    type="number" 
                                                                                    class="budget-input" 
                                                                                    v-model="executor.salaryBudget"
                                                                                    placeholder="0"
                                                                                >
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td class="expenses-cell">
                                                                        <div class="budget-row">
                                                                            <div class="budget-item">
                                                                                <span class="budget-label">внебюджет</span>
                                                                                <input 
                                                                                    type="number" 
                                                                                    class="budget-input" 
                                                                                    v-model="executor.expensesOffBudget"
                                                                                    placeholder="0"
                                                                                >
                                                                            </div>
                                                                            <div class="budget-item">
                                                                                <span class="budget-label">бюджет</span>
                                                                                <input 
                                                                                    type="number" 
                                                                                    class="budget-input" 
                                                                                    v-model="executor.expensesBudget"
                                                                                    placeholder="0"
                                                                                >
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- Раздел остатков -->
                                            <div class="section">
                                                <h6 class="section-title">Остатки</h6>
                                                <div class="remains-section">
                                                    <div class="remains-group">
                                                        <h6 class="remains-group-title">Остаток бюджета на заработную плату (без учета страховых взносов), руб.</h6>
                                                        <div class="remains-inputs">
                                                            <div class="remains-input-group">
                                                                <span class="remains-label">внебюджет</span>
                                                                    <input 
                                                                        type="number" 
                                                                        class="remains-input" 
                                                                        :value="getSalaryOffBudgetTotal(stage)"
                                                                        readonly
                                                                        placeholder="0"
                                                                    >
                                                            </div>
                                                            <div class="remains-input-group">
                                                                <span class="remains-label">бюджет</span>
                                                                <input 
                                                                    type="number" 
                                                                    class="remains-input" 
                                                                    :value="getSalaryBudgetTotal(stage)"
                                                                    readonly
                                                                    placeholder="0"
                                                                >
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div class="remains-group">
                                                        <h6 class="remains-group-title">Остаток бюджета на другие расходы, руб.</h6>
                                                        <div class="remains-inputs">
                                                            <div class="remains-input-group">
                                                                <span class="remains-label">внебюджет</span>
                                                                <input 
                                                                    type="number" 
                                                                    class="remains-input" 
                                                                    :value="getExpensesOffBudgetTotal(stage)"
                                                                    readonly
                                                                    placeholder="0"
                                                                >
                                                            </div>
                                                            <div class="remains-input-group">
                                                                <span class="remains-label">бюджет</span>
                                                                <input 
                                                                    type="number" 
                                                                    class="remains-input" 
                                                                    :value="getExpensesBudgetTotal(stage)"
                                                                    readonly
                                                                    placeholder="0"
                                                                >
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </details>
                            </div>
                        </div>
                    </div>

                    <!-- Контейнер итого -->
                    <div class="totals-container">
                        <h5 class="totals-title">Итого</h5>
                        <div class="totals-sections">
                            <!-- Итого заработная плата -->
                            <div class="totals-section">
                                <h6 class="totals-section-title">Итого заработная плата</h6>
                                <div class="totals-table-wrapper">
                                    <table class="totals-table">
                                        <thead>
                                            <tr>
                                                <th class="executor-column">Исполнитель</th>
                                                <th class="budget-column">Внебюджет, руб.</th>
                                                <th class="budget-column">Бюджет, руб.</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="(executor, index) in getAllExecutors()" :key="`salary-${executor.id}-${index}`" class="totals-row">
                                                <td class="executor-cell">
                                                    <div class="executor-info">
                                                        <DefaultAvatar
                                                            :size="'medium'"
                                                            :title="executor.name"
                                                        />
                                                        <div class="executor-details">
                                                            <div class="executor-name">{{ executor.name }}</div>
                                                            <div class="executor-position">{{ executor.position }}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td class="budget-cell">
                                                    <div class="budget-total">
                                                        {{ getExecutorSalaryOffBudgetTotal(executor.id) }}
                                                    </div>
                                                </td>
                                                <td class="budget-cell">
                                                    <div class="budget-total">
                                                        {{ getExecutorSalaryBudgetTotal(executor.id) }}
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <!-- Итого другие расходы -->
                            <div class="totals-section">
                                <h6 class="totals-section-title">Итого другие расходы</h6>
                                <div class="totals-table-wrapper">
                                    <table class="totals-table">
                                        <thead>
                                            <tr>
                                                <th class="executor-column">Исполнитель</th>
                                                <th class="budget-column">Внебюджет, руб.</th>
                                                <th class="budget-column">Бюджет, руб.</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="(executor, index) in getAllExecutors()" :key="`expenses-${executor.id}-${index}`" class="totals-row">
                                                <td class="executor-cell">
                                                    <div class="executor-info">
                                                        <DefaultAvatar
                                                            :size="'medium'"
                                                            :title="executor.name"
                                                        />
                                                        <div class="executor-details">
                                                            <div class="executor-name">{{ executor.name }}</div>
                                                            <div class="executor-position">{{ executor.position }}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td class="budget-cell">
                                                    <div class="budget-total">
                                                        {{ getExecutorExpensesOffBudgetTotal(executor.id) }}
                                                    </div>
                                                </td>
                                                <td class="budget-cell">
                                                    <div class="budget-total">
                                                        {{ getExecutorExpensesBudgetTotal(executor.id) }}
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Контейнер целевых показателей -->
                    <div class="target-indicators-container">
                        <h5 class="target-indicators-title">Целевые показатели</h5>
                        <div class="target-indicators-content">
                            <div class="target-indicators-table-wrapper">
                                <table class="target-indicators-table">
                                    <thead>
                                        <tr>
                                            <th class="number-column">№</th>
                                            <th class="name-column">Наименование показателя</th>
                                            <th class="unit-column">Единица измерения</th>
                                            <th class="planned-column">Плановое значение</th>
                                            <th class="actual-column">Фактическое значение</th>
                                            <th class="deviation-column">Отклонение, %</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="(indicator, index) in targetIndicators" :key="`indicator-${index}`" class="target-indicator-row">
                                            <td class="number-cell">
                                                <div class="indicator-number">{{ index + 1 }}</div>
                                            </td>
                                            <td class="name-cell">
                                                <div class="indicator-field">{{ getIndicatorName(indicator.name) }}</div>
                                            </td>
                                            <td class="unit-cell">
                                                <div class="indicator-field">{{ getUnitName(indicator.unit) }}</div>
                                            </td>
                                            <td class="planned-cell">
                                                <div class="indicator-field">{{ indicator.targetValue }}</div>
                                            </td>
                                            <td class="actual-cell">
                                                <div class="indicator-field">{{ indicator.actualValue || 0 }}</div>
                                            </td>
                                            <td class="deviation-cell">
                                                <div class="indicator-field deviation-value" :class="getDeviationClass(indicator)">
                                                    {{ calculateDeviation(indicator) }}%
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <!-- Кнопки действий -->
                    <div class="form-actions">
                        <button type="button" class="print-btn">Распечатать</button>
                        <button type="button" class="save-btn">Сохранить</button>
                    </div>
                </div>
                <div v-else class="no-selection">
                    <h5 class="mb-3 text-muted">Выберите месяц</h5>
                    <div class="text-muted">
                        Выберите месяц из списка слева для просмотра отчёта
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { Calendar, ChevronDown } from 'lucide-vue-next'
import DefaultAvatar from '@/components/DefaultAvatar.vue'

const months = ref([
    { id: 1, name: 'Январь' },
    { id: 2, name: 'Февраль' },
    { id: 3, name: 'Март' },
    { id: 4, name: 'Апрель' },
    { id: 5, name: 'Май' },
    { id: 6, name: 'Июнь' },
    { id: 7, name: 'Июль' },
    { id: 8, name: 'Август' },
    { id: 9, name: 'Сентябрь' },
    { id: 10, name: 'Октябрь' },
    { id: 11, name: 'Ноябрь' },
    { id: 12, name: 'Декабрь' }
])

const selectedMonth = ref(null)

// Данные целевых показателей
const targetIndicators = ref([
    {
        name: 'participants',
        unit: 'чел',
        baseValue: 0,
        targetValue: 100,
        actualValue: 80
    },
    {
        name: 'satisfaction',
        unit: 'балл',
        baseValue: 0,
        targetValue: 4.5,
        actualValue: 4.2
    },
    {
        name: 'completion_rate',
        unit: '%',
        baseValue: 0,
        targetValue: 95,
        actualValue: 90
    }
])

const stages = ref([
    { 
        id: 1, 
        number: 1, 
        name: 'Подготовительный этап',
        startDate: '2025-01-01',
        endDate: '2025-01-31',
        plannedResults: 'Подготовка технического задания и планирование работ',
        executors: [
            {
                id: 1,
                name: 'Иванов И.И.',
                position: 'Руководитель проекта',
                initials: 'И.И.',
                salaryOffBudget: 50000,
                salaryBudget: 0,
                expensesOffBudget: 0,
                expensesBudget: 0
            },
            {
                id: 2,
                name: 'Петров П.П.',
                position: 'Аналитик',
                initials: 'П.П.',
                salaryOffBudget: 35000,
                salaryBudget: 0,
                expensesOffBudget: 5000,
                expensesBudget: 0
            }
        ]
    },
    { 
        id: 2, 
        number: 2, 
        name: 'Сбор и анализ данных',
        startDate: '2025-02-01',
        endDate: '2025-02-28',
        plannedResults: 'Проведение исследований и сбор необходимых данных',
        executors: [
            {
                id: 3,
                name: 'Сидоров С.С.',
                position: 'Исследователь',
                initials: 'С.С.',
                salaryOffBudget: 40000,
                salaryBudget: 0,
                expensesOffBudget: 10000,
                expensesBudget: 0
            },
            {
                id: 4,
                name: 'Козлов К.К.',
                position: 'Статистик',
                initials: 'К.К.',
                salaryOffBudget: 30000,
                salaryBudget: 0,
                expensesOffBudget: 0,
                expensesBudget: 0
            }
        ]
    },
    { 
        id: 3, 
        number: 3, 
        name: 'Разработка материалов',
        startDate: '2025-03-01',
        endDate: '2025-03-31',
        plannedResults: 'Создание методических материалов и документации',
        executors: [
            {
                id: 5,
                name: 'Морозов М.М.',
                position: 'Разработчик',
                initials: 'М.М.',
                salaryOffBudget: 45000,
                salaryBudget: 0,
                expensesOffBudget: 15000,
                expensesBudget: 0
            }
        ]
    },
    { 
        id: 4, 
        number: 4, 
        name: 'Валидация и тестирование',
        startDate: '2025-04-01',
        endDate: '2025-04-30',
        plannedResults: 'Тестирование и проверка качества разработанных материалов',
        executors: [
            {
                id: 6,
                name: 'Волков В.В.',
                position: 'Тестировщик',
                initials: 'В.В.',
                salaryOffBudget: 32000,
                salaryBudget: 0,
                expensesOffBudget: 8000,
                expensesBudget: 0
            },
            {
                id: 7,
                name: 'Новиков Н.Н.',
                position: 'Эксперт',
                initials: 'Н.Н.',
                salaryOffBudget: 55000,
                salaryBudget: 0,
                expensesOffBudget: 0,
                expensesBudget: 0
            }
        ]
    },
    { 
        id: 5, 
        number: 5, 
        name: 'Итоговый отчёт',
        startDate: '2025-05-01',
        endDate: '2025-05-31',
        plannedResults: 'Подготовка итогового отчёта и презентация результатов',
        executors: [
            {
                id: 8,
                name: 'Фёдоров Ф.Ф.',
                position: 'Отчётчик',
                initials: 'Ф.Ф.',
                salaryOffBudget: 38000,
                salaryBudget: 0,
                expensesOffBudget: 12000,
                expensesBudget: 0
            }
        ]
    }
])

function selectMonth(month) {
    selectedMonth.value = month
    console.log('Выбран месяц:', month.name)
    // Здесь будет логика для открытия отчёта за выбранный месяц
}

// Функции для подсчета сумм остатков
function getSalaryOffBudgetTotal(stage) {
    return stage.executors.reduce((total, executor) => {
        return total + (parseInt(executor.salaryOffBudget) || 0)
    }, 0)
}

function getSalaryBudgetTotal(stage) {
    return stage.executors.reduce((total, executor) => {
        return total + (parseInt(executor.salaryBudget) || 0)
    }, 0)
}

function getExpensesOffBudgetTotal(stage) {
    return stage.executors.reduce((total, executor) => {
        return total + (parseInt(executor.expensesOffBudget) || 0)
    }, 0)
}

function getExpensesBudgetTotal(stage) {
    return stage.executors.reduce((total, executor) => {
        return total + (parseInt(executor.expensesBudget) || 0)
    }, 0)
}

// Функции для получения всех исполнителей
function getAllExecutors() {
    const allExecutors = []
    const executorMap = new Map()
    
    stages.value.forEach(stage => {
        stage.executors.forEach(executor => {
            if (!executorMap.has(executor.id)) {
                executorMap.set(executor.id, {
                    id: executor.id,
                    name: executor.name,
                    position: executor.position,
                    initials: executor.initials
                })
            }
        })
    })
    
    return Array.from(executorMap.values())
}

// Функции для подсчета общих сумм по исполнителю
function getExecutorSalaryOffBudgetTotal(executorId) {
    return stages.value.reduce((total, stage) => {
        const executor = stage.executors.find(exec => exec.id === executorId)
        return total + (executor ? (parseInt(executor.salaryOffBudget) || 0) : 0)
    }, 0)
}

function getExecutorSalaryBudgetTotal(executorId) {
    return stages.value.reduce((total, stage) => {
        const executor = stage.executors.find(exec => exec.id === executorId)
        return total + (executor ? (parseInt(executor.salaryBudget) || 0) : 0)
    }, 0)
}

function getExecutorExpensesOffBudgetTotal(executorId) {
    return stages.value.reduce((total, stage) => {
        const executor = stage.executors.find(exec => exec.id === executorId)
        return total + (executor ? (parseInt(executor.expensesOffBudget) || 0) : 0)
    }, 0)
}

function getExecutorExpensesBudgetTotal(executorId) {
    return stages.value.reduce((total, stage) => {
        const executor = stage.executors.find(exec => exec.id === executorId)
        return total + (executor ? (parseInt(executor.expensesBudget) || 0) : 0)
    }, 0)
}

// Опции для показателей и единиц измерения
const indicatorOptions = [
    { value: 'participants', label: 'Количество участников' },
    { value: 'satisfaction', label: 'Уровень удовлетворенности' },
    { value: 'completion_rate', label: 'Процент выполнения' },
    { value: 'revenue', label: 'Доходы' },
    { value: 'costs', label: 'Расходы' },
    { value: 'efficiency', label: 'Эффективность' },
    { value: 'quality', label: 'Качество' },
    { value: 'time', label: 'Время выполнения' }
]

const unitOptions = [
    { value: 'ед', label: 'ед.' },
    { value: '%', label: '%' },
    { value: 'руб', label: 'руб.' },
    { value: 'чел', label: 'чел.' },
    { value: 'м²', label: 'м²' },
    { value: 'балл', label: 'балл' },
    { value: 'синх/нед', label: 'кол-во синхронизаций в неделю' }
]

// Функции для работы с показателями
function getIndicatorName(indicatorValue) {
    const option = indicatorOptions.find(opt => opt.value === indicatorValue)
    return option ? option.label : indicatorValue
}

function getUnitName(unitValue) {
    const option = unitOptions.find(opt => opt.value === unitValue)
    return option ? option.label : unitValue
}

function calculateDeviation(indicator) {
    if (!indicator.targetValue || indicator.targetValue === 0) return 0
    const deviation = ((indicator.actualValue - indicator.targetValue) / indicator.targetValue) * 100
    return Math.round(deviation * 10) / 10 // Округляем до 1 знака после запятой
}

function getDeviationClass(indicator) {
    const deviation = calculateDeviation(indicator)
    if (deviation > 0) return 'positive'
    if (deviation < 0) return 'negative'
    return 'neutral'
}
</script>

<style scoped lang="scss">
.monthly-reports-page {
    padding: 1rem 0.5rem 0;
}

.months-container {
    display: flex;
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.months-list {
    flex: 0 0 250px;
    border: 1px solid rgba(0, 0, 0, 0.15);
    border-radius: 0.5rem;
    background-color: #fff;
    padding: 1rem;
}

.month-item {
    padding: 0.75rem 1rem;
    border-radius: 0.375rem;
    cursor: pointer;
    user-select: none;
    transition: all 0.2s ease;
    margin-bottom: 0.25rem;

    &:hover {
        background-color: #f8f9fa;
    }

    &.active {
        background-color: #e7f1ff;
        color: #0d6efd;
        font-weight: 600;
    }

    &:focus {
        outline: none;
        background-color: #e7f1ff;
        box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.15);
    }

    &:last-child {
        margin-bottom: 0;
    }
}

.month-name {
    font-size: 0.9rem;
}

.month-content {
    flex: 1;
    border: 1px solid rgba(0, 0, 0, 0.15);
    border-radius: 0.5rem;
    background-color: #fff;
    padding: 2rem;
    min-height: 400px;
}

.selected-month-info {
    h5 {
        color: #0d6efd;
    }
}

.no-selection {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    text-align: center;
}

// Контейнеры этапов, итого и целевых показателей
.stages-container,
.totals-container,
.target-indicators-container {
    margin-bottom: 2rem;
}

.stages-title,
.totals-title,
.target-indicators-title {
    color: #0d6efd;
    font-weight: 600;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #e9ecef;
}

// Спойлеры этапов
.stages-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.stage-item {
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 0.375rem;
    background-color: #fff;
    overflow: hidden;
}

.stage-summary {
    list-style: none;
    padding: 0.75rem 1rem;
    cursor: pointer;
    user-select: none;
}

.stage-summary .icon {
    width: 18px;
    height: 18px;
    transition: transform 0.2s ease;
}

details[open] .stage-summary .icon {
    transform: rotate(180deg);
}

.stage-title {
    font-weight: 500;
}

.stage-body {
    padding: 0 1rem 1rem 1rem;
}

// Стили для разделов этапа
.stage-sections {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.section {
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 0.375rem;
    padding: 1rem;
    background-color: #f8f9fa;
}

.section-title {
    font-weight: 600;
    color: #495057;
    margin-bottom: 1rem;
    font-size: 0.95rem;
}

// Стили для полей информации
.info-fields {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.field-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.field-label {
    font-weight: 500;
    color: #495057;
    font-size: 0.9rem;
    margin-bottom: 0.25rem;
}

.date-fields {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

.form-control {
    border: 1px solid #ced4da;
    border-radius: 0.375rem;
    padding: 0.5rem 0.75rem;
    font-size: 0.9rem;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;

    &:focus {
        border-color: #86b7fe;
        outline: 0;
        box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
    }
}

textarea.form-control {
    resize: vertical;
    min-height: 80px;
}

// Стили для разделов исполнителей и остатков
.executors-list,
.remains-list {
    padding: 0.5rem 0;
    min-height: 40px;
    display: flex;
    align-items: center;
}

// Стили для раздела остатков
.remains-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.remains-group {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 0.5rem;
    background-color: #f8f9fa;
}

.remains-group-title {
    font-size: 0.9rem;
    font-weight: 600;
    color: #495057;
    margin: 0;
    line-height: 1.3;
}

.remains-inputs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

.remains-input-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.remains-label {
    font-size: 0.75rem;
    color: #6c757d;
    text-align: left;
    font-weight: 500;
}

.remains-input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ced4da;
    border-radius: 0.375rem;
    font-size: 0.9rem;
    text-align: center;
    font-weight: 600;
    background-color: #e7f1ff;
    cursor: not-allowed;
    
    &:focus {
        outline: none;
        border-color: #ced4da;
        box-shadow: none;
        background-color: #e7f1ff;
    }
}

// Стили для таблицы исполнителей
.executors-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.executors-table-wrapper {
    overflow-x: auto;
    border-radius: 0.5rem;
    border: 1px solid rgba(0, 0, 0, 0.1);
}

.executors-table {
    width: 100%;
    border-collapse: collapse;
    background-color: #fff;
    min-width: 600px;
}

.executors-table th {
    background-color: #f8f9fa;
    padding: 1rem;
    text-align: left;
    font-weight: 600;
    color: #495057;
    border-bottom: 2px solid #dee2e6;
    font-size: 0.9rem;
}

.executor-column {
    width: 30%;
}

.salary-column,
.expenses-column {
    width: 35%;
}

.executor-row {
    border-bottom: 1px solid #e9ecef;
    
    &:last-child {
        border-bottom: none;
    }
}

.executor-cell,
.salary-cell,
.expenses-cell {
    padding: 1rem;
    vertical-align: middle;
}

.executor-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.executor-details {
    flex: 1;
    min-width: 0;
}

.executor-name {
    font-weight: 600;
    color: #212529;
    font-size: 0.95rem;
    line-height: 1.2;
    margin-bottom: 0.25rem;
}

.executor-position {
    font-size: 0.8rem;
    color: #6c757d;
    line-height: 1.2;
}

.budget-row {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.budget-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.budget-input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ced4da;
    border-radius: 0.375rem;
    font-size: 0.9rem;
    text-align: right;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;

    &:focus {
        border-color: #86b7fe;
        outline: 0;
        box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
    }
}

.budget-label {
    font-size: 0.75rem;
    color: #6c757d;
    text-align: left;
    font-weight: 500;
}

// Стили для контейнера итого
.totals-sections {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.totals-section {
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 0.5rem;
    background-color: #f8f9fa;
    padding: 1.5rem;
}

.totals-section-title {
    font-weight: 600;
    color: #495057;
    margin-bottom: 1rem;
    font-size: 1rem;
}

.totals-table-wrapper {
    overflow-x: auto;
    border-radius: 0.5rem;
    border: 1px solid rgba(0, 0, 0, 0.1);
    background-color: #fff;
}

.totals-table {
    width: 100%;
    border-collapse: collapse;
    background-color: #fff;
    min-width: 500px;
}

.totals-table th {
    background-color: #f8f9fa;
    padding: 1rem;
    text-align: left;
    font-weight: 600;
    color: #495057;
    border-bottom: 2px solid #dee2e6;
    font-size: 0.9rem;
}

.budget-column {
    width: 25%;
    text-align: center;
}

.totals-row {
    border-bottom: 1px solid #e9ecef;
    
    &:last-child {
        border-bottom: none;
    }
}

.budget-cell {
    padding: 1rem;
    vertical-align: middle;
    text-align: center;
}

.budget-total {
    font-weight: 600;
    color: #212529;
    font-size: 0.95rem;
    padding: 0.5rem;
    background-color: #e7f1ff;
    border-radius: 0.375rem;
    border: 1px solid #b3d7ff;
}

// Стили для контейнера целевых показателей
.target-indicators-content {
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 0.5rem;
    background-color: #f8f9fa;
    padding: 1.5rem;
}

.target-indicators-table-wrapper {
    overflow-x: auto;
    border-radius: 0.5rem;
    border: 1px solid rgba(0, 0, 0, 0.1);
    background-color: #fff;
}

.target-indicators-table {
    width: 100%;
    border-collapse: collapse;
    background-color: #fff;
    min-width: 600px;
}

.target-indicators-table th {
    background-color: #f8f9fa;
    padding: 1rem;
    text-align: left;
    font-weight: 600;
    color: #495057;
    border-bottom: 2px solid #dee2e6;
    font-size: 0.9rem;
}

.number-column {
    width: 8%;
    text-align: center;
}

.name-column {
    width: 25%;
}

.unit-column {
    width: 15%;
    text-align: center;
}

.planned-column,
.actual-column {
    width: 15%;
    text-align: center;
}

.deviation-column {
    width: 12%;
    text-align: center;
}

.target-indicator-row {
    border-bottom: 1px solid #e9ecef;
    
    &:last-child {
        border-bottom: none;
    }
}

.number-cell,
.name-cell,
.unit-cell,
.planned-cell,
.actual-cell,
.deviation-cell {
    padding: 1rem;
    vertical-align: middle;
}

.indicator-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: #fff;
    color: #212529;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    font-weight: 600;
    font-size: 0.875rem;
    margin: 0 auto;
}

.indicator-field {
    padding: 0.5rem 0.75rem;
    background-color: #e6f3ff;
    border: 1px solid #b3d9ff;
    border-radius: 6px;
    font-size: 0.875rem;
    color: #212529;
    text-align: center;
    min-height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.name-cell .indicator-field {
    text-align: left;
    justify-content: flex-start;
}

.deviation-value {
    font-weight: 600;
    
    &.positive {
        color: #198754;
        background-color: #d1e7dd;
        border-color: #a3cfbb;
    }
    
    &.negative {
        color: #dc3545;
        background-color: #f8d7da;
        border-color: #f1aeb5;
    }
    
    &.neutral {
        color: #6c757d;
        background-color: #e9ecef;
        border-color: #ced4da;
    }
}

// Стили для кнопок действий
.form-actions {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid #dee2e6;
}

.print-btn, .save-btn {
    padding: 0.75rem 2rem;
    border: none;
    border-radius: 0.5rem;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 140px;
}

.print-btn {
    background-color: #f8f9fa;
    color: #6c757d;
    border: 1px solid #dee2e6;
}

.print-btn:hover {
    background-color: #e9ecef;
    border-color: #adb5bd;
}

.save-btn {
    background-color: #0d6efd;
    color: white;
}

.save-btn:hover {
    background-color: #0b5ed7;
}

// Адаптивность для мобильных устройств
@media (max-width: 768px) {
    .months-container {
        flex-direction: column;
        gap: 1rem;
    }
    
    .months-list {
        flex: none;
    }
    
    .month-content {
        min-height: 300px;
        padding: 1.5rem;
    }
    
    .date-fields {
        grid-template-columns: 1fr;
        gap: 0.75rem;
    }
    
    .stage-sections {
        gap: 1rem;
    }
    
    .section {
        padding: 0.75rem;
    }
    
    .executors-table {
        min-width: 500px;
    }
    
    .executor-cell,
    .salary-cell,
    .expenses-cell {
        padding: 0.75rem;
        vertical-align: middle;
    }
    
    .budget-row {
        gap: 0.25rem;
    }
    
    .budget-input {
        padding: 0.375rem;
        font-size: 0.8rem;
    }
    
    
    .remains-group {
        padding: 0.75rem;
    }
    
    .remains-inputs {
        gap: 0.75rem;
    }
    
    .remains-input {
        padding: 0.5rem;
        font-size: 0.8rem;
    }
    
    .totals-section {
        padding: 1rem;
    }
    
    .totals-table {
        min-width: 400px;
    }
    
    .budget-total {
        padding: 0.375rem;
        font-size: 0.8rem;
    }
    
    .target-indicators-content {
        padding: 1rem;
    }
    
    .target-indicators-table {
        min-width: 500px;
    }
    
    .indicator-field {
        padding: 0.375rem 0.5rem;
        font-size: 0.8rem;
        min-height: 32px;
    }
    
    .indicator-number {
        width: 28px;
        height: 28px;
        font-size: 0.8rem;
    }
    
    .form-actions {
        gap: 1rem;
        margin-top: 1.5rem;
        padding-top: 1rem;
    }
    
    .print-btn, .save-btn {
        padding: 0.625rem 1.5rem;
        font-size: 0.9rem;
        min-width: 120px;
    }
}

@media (max-width: 480px) {
    .monthly-reports-page {
        padding: 0.5rem;
    }
    
    .months-container {
        gap: 0.75rem;
    }
    
    .months-list {
        padding: 0.75rem;
    }
    
    .month-item {
        padding: 0.5rem 0.75rem;
    }
    
    .month-content {
        padding: 1rem;
        min-height: 250px;
    }
    
    .form-actions {
        flex-direction: column;
        gap: 0.75rem;
        margin-top: 1rem;
        padding-top: 0.75rem;
    }
    
    .print-btn, .save-btn {
        padding: 0.5rem 1.25rem;
        font-size: 0.85rem;
        min-width: 100px;
        width: 100%;
        max-width: 200px;
    }
}
</style>