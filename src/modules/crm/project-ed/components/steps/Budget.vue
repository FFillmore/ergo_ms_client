<template>
    <div class="budget">
        <div class="step-header">
            <h2 class="step-title">Бюджет проекта</h2>
            <p class="step-description">Заполните расходы по этапам. Итоги считаются автоматически.</p>
        </div>

        <div class="form-content">
            <div class="stages-container">
                <div
                    class="stage-block"
                    v-for="(stage, sIndex) in localStages"
                    :key="`stage-${sIndex}`"
                >
                    <div class="stage-header">
                        <h3 class="stage-title">Этап {{ sIndex + 1 }}. {{ stage.name }}</h3>
                    </div>
                    
                    <div class="stage-content">
                        <div class="stage-items">
                            <div
                                class="stage-item"
                                v-for="(row, rIndex) in stage.items"
                                :key="`item-${sIndex}-${rIndex}`"
                            >
                                <div class="input-row single-row">
                                    <div class="input-group">
                                        <label class="input-label">Статья расходов</label>
                                        <div class="select-wrapper">
                                            <select 
                                                class="form-select" 
                                                v-model="row.article"
                                                @change="onArticleChange(sIndex, rIndex, $event)"
                                            >
                                                <option 
                                                    v-for="article in getAvailableArticles(sIndex, rIndex)" 
                                                    :key="article.value" 
                                                    :value="article.value"
                                                >
                                                    {{ article.label }}
                                                </option>
                                            </select>
                                            <ChevronDown class="select-icon" :size="16" />
                                        </div>
                                    </div>
                                    <div class="input-group">
                                        <label class="input-label">Источник финансирования</label>
                                        <div class="select-wrapper">
                                            <select 
                                                class="form-select" 
                                                v-model="row.source"
                                                @change="onSourceChange(sIndex, rIndex, $event)"
                                            >
                                                <option 
                                                    v-for="source in getAvailableSources(sIndex, rIndex, row.article)" 
                                                    :key="source.value" 
                                                    :value="source.value"
                                                >
                                                    {{ source.label }}
                                                </option>
                                            </select>
                                            <ChevronDown class="select-icon" :size="16" />
                                        </div>
                                    </div>
                                    <div class="input-group">
                                        <label class="input-label">Сумма, руб.</label>
                                        <input 
                                            type="text"
                                            inputmode="decimal"
                                            class="form-input amount-input" 
                                            :class="{ 'input-error': hasAmountError(sIndex, rIndex) }"
                                            :value="row.amount"
                                            @keydown="onAmountKeydown($event)"
                                            @paste="onAmountPaste(sIndex, rIndex, $event)"
                                            @input="onAmountInput(sIndex, rIndex, $event)"
                                        />
                                        <div v-if="hasAmountError(sIndex, rIndex)" class="input-error-message">
                                            Сумма некорректна
                                        </div>
                                    </div>
                                    <div class="input-group input-group-actions" v-if="stage.items.length > 1">
                                        <button 
                                            type="button" 
                                            class="btn-remove" 
                                            title="Удалить строку" 
                                            @click="removeRow(sIndex, rIndex)"
                                        >
                                            <Trash2 :size="16" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="stage-total">
                            <button 
                                type="button" 
                                class="btn btn-outline-primary btn-sm" 
                                :disabled="stage.items.length >= MAX_ITEMS_PER_STAGE || getAvailableCombinations(sIndex).length === 0"
                                @click="addRow(sIndex)"
                            >
                                {{ stage.items.length >= MAX_ITEMS_PER_STAGE ? 'Максимум статей достигнут' : 'Добавить статью расходов' }}
                            </button>
                            <div class="stage-total-info">
                                <div class="stage-total-label">Итого по этапу, руб.</div>
                                <div class="stage-total-display">{{ formatCurrency(stageTotal(stage)) }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="form-section totals">
                <h3 class="section-title">Итоги</h3>

                <div class="totals-grid">
                    <div class="totals-row">
                        <div class="label">Итого бюджет проекта с учетом страховых взносов, руб.</div>
                        <div class="value">{{ formatCurrency(totalWithInsurance) }}</div>
                    </div>

                    <div class="sub-title">Из них:</div>

                    <div class="two-cols">
                        <div>
                            <div class="totals-row">
                                <div class="label">Заработная плата, руб.</div>
                                <div class="value">{{ formatCurrency(totalSalary) }}</div>
                            </div>
                            <div class="subgrid">
                                <div class="totals-row">
                                    <div class="label sm">внебюджетные источники финансирования</div>
                                    <div class="value">{{ formatCurrency(totalBy('salary','nonbudget')) }}</div>
                                </div>
                                <div class="totals-row">
                                    <div class="label sm">бюджетные источники финансирования</div>
                                    <div class="value">{{ formatCurrency(totalBy('salary','budget')) }}</div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div class="totals-row">
                                <div class="label">Другие расходы, руб.</div>
                                <div class="value">{{ formatCurrency(totalOther) }}</div>
                            </div>
                            <div class="subgrid">
                                <div class="totals-row">
                                    <div class="label sm">внебюджетные источники финансирования</div>
                                    <div class="value">{{ formatCurrency(totalBy('other','nonbudget')) }}</div>
                                </div>
                                <div class="totals-row">
                                    <div class="label sm">бюджетные источники финансирования</div>
                                    <div class="value">{{ formatCurrency(totalBy('other','budget')) }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ChevronDown, Trash2 } from 'lucide-vue-next'

const INSURANCE_COEFF = 1.302

const props = defineProps({
    // календарный план для получения количества и названий этапов
    plan: { type: Object, required: true },
    // внешнее состояние бюджета (сохраняемость между шагами)
    budget: { type: Object, required: false, default: () => ({}) }
})

const emit = defineEmits(['update:budget', 'validation-change'])

// Локальная модель по этапам
const localStages = ref([])

const normalizeFromPlan = () => {
    const stages = Array.isArray(props?.plan?.stages) ? props.plan.stages : []
    
    // Фильтруем только этапы с валидными названиями
    const validStages = stages.filter(s => s?.name && s.name.trim() !== '')
    
    // переносим существующие суммы, если бюджет уже был
    const byName = new Map()
    if (Array.isArray(props?.budget?.stages)) {
        props.budget.stages.forEach(s => byName.set(s.name, s))
    }
    localStages.value = validStages.map((s, filteredIndex) => {
        const name = s.name.trim()
        const existing = byName.get(name)
        return {
            name,
            filteredIndex, // Индекс в отфильтрованном массиве (совпадает с normalizedStages на бэкенде)
            items: existing?.items?.length ? existing.items.map(r => ({
                article: r.article === 'salary' ? 'salary' : r.article === 'other' ? 'other' : 'other',
                source: r.source === 'budget' ? 'budget' : 'nonbudget',
                amount: Number(r.amount) || 0
            })) : [ { article: 'salary', source: 'budget', amount: 0 } ]
        }
    })
}

normalizeFromPlan()

watch(() => props.plan, normalizeFromPlan, { deep: true })

// Максимальное количество статей расходов
const MAX_ITEMS_PER_STAGE = 4

// Получить доступные комбинации для этапа
const getAvailableCombinations = (stageIndex) => {
    const stage = localStages.value[stageIndex]
    if (!stage) return []
    
    const usedCombinations = new Set()
    stage.items.forEach(item => {
        usedCombinations.add(`${item.article}-${item.source}`)
    })
    
    const allCombinations = [
        { article: 'salary', source: 'budget' },
        { article: 'salary', source: 'nonbudget' },
        { article: 'other', source: 'budget' },
        { article: 'other', source: 'nonbudget' }
    ]
    
    return allCombinations.filter(combo => 
        !usedCombinations.has(`${combo.article}-${combo.source}`)
    )
}

// Получить доступные статьи расходов для селектора
const getAvailableArticles = (stageIndex, currentRowIndex) => {
    const stage = localStages.value[stageIndex]
    if (!stage) return []
    
    const usedCombinations = new Set()
    stage.items.forEach((item, index) => {
        if (index !== currentRowIndex) {
            usedCombinations.add(`${item.article}-${item.source}`)
        }
    })
    
    const articles = [
        { value: 'salary', label: 'заработная плата' },
        { value: 'other', label: 'другие расходы' }
    ]
    
    return articles.filter(article => {
        const budgetUsed = usedCombinations.has(`${article.value}-budget`)
        const nonbudgetUsed = usedCombinations.has(`${article.value}-nonbudget`)
        return !(budgetUsed && nonbudgetUsed)
    })
}

// Получить доступные источники финансирования для селектора
const getAvailableSources = (stageIndex, currentRowIndex, selectedArticle) => {
    const stage = localStages.value[stageIndex]
    if (!stage) return []
    
    const usedCombinations = new Set()
    stage.items.forEach((item, index) => {
        if (index !== currentRowIndex) {
            usedCombinations.add(`${item.article}-${item.source}`)
        }
    })
    
    const sources = [
        { value: 'budget', label: 'бюджетные источники финансирования' },
        { value: 'nonbudget', label: 'внебюджетные источники финансирования' }
    ]
    
    return sources.filter(source => 
        !usedCombinations.has(`${selectedArticle}-${source.value}`)
    )
}

// действия с строками
const addRow = (stageIndex) => {
    const stage = localStages.value[stageIndex]
    if (stage.items.length >= MAX_ITEMS_PER_STAGE) {
        return // Не добавляем, если уже достигнут лимит
    }
    
    const availableCombinations = getAvailableCombinations(stageIndex)
    if (availableCombinations.length === 0) {
        return // Нет доступных комбинаций
    }
    
    // Берем первую доступную комбинацию
    const newItem = { ...availableCombinations[0], amount: 0 }
    stage.items.push(newItem)
}

const removeRow = (stageIndex, rowIndex) => {
    const items = localStages.value[stageIndex].items
    items.splice(rowIndex, 1)
    if (items.length === 0) {
        items.push({ article: 'salary', source: 'budget', amount: 0 })
    }
}

// Обработчики изменений селекторов
const onArticleChange = (stageIndex, rowIndex, event) => {
    const newArticle = event.target.value
    const stage = localStages.value[stageIndex]
    const item = stage.items[rowIndex]
    
    // Проверяем, доступна ли текущая комбинация с новым источником
    const availableSources = getAvailableSources(stageIndex, rowIndex, newArticle)
    
    if (availableSources.length === 0) {
        // Если нет доступных источников, выбираем первый доступный
        const availableCombinations = getAvailableCombinations(stageIndex)
        if (availableCombinations.length > 0) {
            item.article = availableCombinations[0].article
            item.source = availableCombinations[0].source
        }
    } else if (!availableSources.some(s => s.value === item.source)) {
        // Если текущий источник недоступен, выбираем первый доступный
        item.source = availableSources[0].value
    }
}

const onSourceChange = (stageIndex, rowIndex, event) => {
    const newSource = event.target.value
    const stage = localStages.value[stageIndex]
    const item = stage.items[rowIndex]
    
    // Проверяем, доступна ли текущая комбинация с новым источником
    const availableArticles = getAvailableArticles(stageIndex, rowIndex)
    
    if (availableArticles.length === 0) {
        // Если нет доступных статей, выбираем первую доступную комбинацию
        const availableCombinations = getAvailableCombinations(stageIndex)
        if (availableCombinations.length > 0) {
            item.article = availableCombinations[0].article
            item.source = availableCombinations[0].source
        }
    } else if (!availableArticles.some(a => a.value === item.article)) {
        // Если текущая статья недоступна, выбираем первую доступную
        item.article = availableArticles[0].value
    }
}

// суммы
const stageTotal = (stage) => stage.items.reduce((s, r) => s + (Number(r.amount) || 0), 0)

const flatItems = computed(() => localStages.value.flatMap(s => s.items))

const totalBy = (article, source) => flatItems.value
    .filter(r => r.article === article && r.source === source)
    .reduce((s, r) => s + (Number(r.amount) || 0), 0)

const totalSalary = computed(() => flatItems.value
    .filter(r => r.article === 'salary')
    .reduce((s, r) => s + (Number(r.amount) || 0), 0))

const totalOther = computed(() => flatItems.value
    .filter(r => r.article === 'other')
    .reduce((s, r) => s + (Number(r.amount) || 0), 0))

const totalWithInsurance = computed(() => totalSalary.value * INSURANCE_COEFF + totalOther.value)

// Валидация данных бюджета
const validationErrors = ref([])

const isBudgetValid = computed(() => {
    const errors = []
    
    // Проверяем, что есть хотя бы один этап с валидным названием
    if (localStages.value.length === 0) {
        errors.push('Необходимо создать хотя бы один этап в календарном плане')
    }
    
    // Проверяем, что все этапы имеют хотя бы одну статью расходов
    localStages.value.forEach((stage, stageIndex) => {
        if (!stage.items || stage.items.length === 0) {
            errors.push(`Этап "${stage.name}" должен содержать хотя бы одну статью расходов`)
        }
    })
    
    // Проверяем на дублирование комбинаций статья+источник
    localStages.value.forEach((stage, stageIndex) => {
        const combinations = new Set()
        stage.items.forEach((item, itemIndex) => {
            const combination = `${item.article}-${item.source}`
            if (combinations.has(combination)) {
                errors.push(`В этапе "${stage.name}" дублируется комбинация "статья расходов + источник финансирования"`)
            }
            combinations.add(combination)
        })
    })
    
    // Проверяем, что есть хотя бы одна сумма больше 0
    const hasAnyAmount = localStages.value.some(stage => 
        stage.items.some(item => (Number(item.amount) || 0) > 0)
    )
    
    if (!hasAnyAmount) {
        errors.push('Необходимо заполнить хотя бы одну сумму расходов')
    }
    
    // Проверяем, что заполненные суммы корректны
    localStages.value.forEach((stage, stageIndex) => {
        stage.items.forEach((item, itemIndex) => {
            const amount = Number(item.amount) || 0
            if (amount > 0 && amount > 999999999) {
                errors.push(`В этапе "${stage.name}" статья расходов №${itemIndex + 1} имеет слишком большую сумму`)
            }
        })
    })
    
    // Проверяем, что общий бюджет не превышает разумные пределы
    if (totalWithInsurance.value > 1000000000) {
        errors.push('Общий бюджет проекта не должен превышать 1 млрд рублей')
    }
    
    validationErrors.value = errors
    return errors.length === 0
})

// Функция для проверки ошибки в конкретном поле суммы
const hasAmountError = (stageIndex, rowIndex) => {
    const item = localStages.value[stageIndex]?.items?.[rowIndex]
    if (!item) return false
    const amount = Number(item.amount) || 0
    // Показываем ошибку только если поле было заполнено, но сумма некорректна
    return amount < 0 || amount > 999999999
}

// Эмитим изменения валидации
watch(isBudgetValid, (isValid) => {
    emit('validation-change', {
        isValid,
        errors: validationErrors.value
    })
}, { immediate: true })

// валидация и нормализация суммы
const sanitizeAmount = (raw) => {
    if (raw == null) return 0
    const str = String(raw)
        .replace(/\s+/g, '')
        .replace(/,/g, '.')
        .replace(/[^0-9.\-]/g, '')
    // оставляем только одну точку и один минус в начале
    const parts = str.split('.')
    let joined = parts.length > 1 ? parts[0] + '.' + parts.slice(1).join('') : parts[0]
    
    // Ограничиваем дробную часть до 2 цифр
    if (parts.length > 1) {
        const integerPart = parts[0]
        const decimalPart = parts.slice(1).join('').slice(0, 2)
        joined = integerPart + '.' + decimalPart
    }
    
    const normalized = joined.replace(/(?!^)-/g, '')
    const num = Number(normalized)
    return isFinite(num) && !isNaN(num) ? (num < 0 ? 0 : num) : 0
}

const onAmountInput = (stageIndex, rowIndex, evt) => {
    const raw = evt?.target?.value ?? ''
    // Нормализуем для отображения: убираем пробелы, заменяем запятую на точку,
    // оставляем только цифры и один разделитель
    const stripped = String(raw)
        .replace(/\s+/g, '')
        .replace(/,/g, '.')
        .replace(/[^0-9.]/g, '')

    const firstDotIndex = stripped.indexOf('.')
    let display = stripped
    
    if (firstDotIndex !== -1) {
        // Ограничиваем дробную часть до 2 цифр
        const integerPart = stripped.slice(0, firstDotIndex)
        const decimalPart = stripped.slice(firstDotIndex + 1).replace(/\./g, '').slice(0, 2)
        display = integerPart + '.' + decimalPart
    }

    // Если пользователь только что ввёл разделитель и ещё не набрал дробную часть,
    // не конвертируем в число, чтобы точка/запятая не пропадала визуально
    const endsWithDot = display.endsWith('.')

    if (evt && evt.target) {
        evt.target.value = display
    }

    if (endsWithDot || display === '') {
        // Не обновляем числовую модель, пока дробная часть не введена
        // или поле пустое. Для пустого поля храним 0, но не переписываем ввод.
        localStages.value[stageIndex].items[rowIndex].amount = display === '' ? 0 : localStages.value[stageIndex].items[rowIndex].amount
        return
    }

    const parsed = Number(display)
    localStages.value[stageIndex].items[rowIndex].amount = (isFinite(parsed) && !isNaN(parsed) && parsed >= 0) ? parsed : 0
}

const onAmountKeydown = (evt) => {
    const allowedControl = [
        'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Tab'
    ]
    // Разрешаем сочетания Ctrl/Cmd: C, V, X, A, Z, Y
    const allowedWithMeta = ['a', 'c', 'v', 'x', 'z', 'y']
    if (evt.ctrlKey || evt.metaKey) {
        if (allowedWithMeta.includes(evt.key.toLowerCase())) return
    }
    if (allowedControl.includes(evt.key)) return

    const isDigit = /[0-9]/.test(evt.key)
    const isPointKey = evt.key === '.' || evt.key === ',' || evt.key === 'Decimal' || evt.code === 'NumpadDecimal'

    if (isDigit) return

    if (isPointKey) {
        const input = evt.target
        const value = String(input.value || '')
        const selectionStart = input.selectionStart ?? value.length
        const selectionEnd = input.selectionEnd ?? value.length
        
        // Симулируем вставку символа
        const newValue = value.slice(0, selectionStart) + '.' + value.slice(selectionEnd)
        const separatorCount = (newValue.match(/[.,]/g) || []).length
        
        // Разрешаем, если разделителей будет не больше одного
        if (separatorCount <= 1) return
    }

    evt.preventDefault()
}

const onAmountPaste = (stageIndex, rowIndex, evt) => {
    const text = (evt.clipboardData || window.clipboardData)?.getData('text') || ''
    const sanitized = sanitizeAmount(text)
    evt.preventDefault()
    localStages.value[stageIndex].items[rowIndex].amount = sanitized
    if (evt && evt.target) {
        evt.target.value = String(sanitized)
    }
}

// форматирование
const formatCurrency = (value) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 2, minimumFractionDigits: 0 }).format(value || 0)

// эмит наружу
watch(localStages, (val) => {
    emit('update:budget', {
        stages: val.map((s, idx) => ({ 
            id: s.filteredIndex,  // Используем индекс из отфильтрованного массива (совпадает с normalizedStages)
            key: s.filteredIndex, // Используем тот же индекс для совместимости
            name: s.name, 
            items: s.items 
        })),
        totals: {
            salary: totalSalary.value,
            other: totalOther.value,
            withInsurance: totalWithInsurance.value,
            byArticleSource: {
                salary: { budget: totalBy('salary','budget'), nonbudget: totalBy('salary','nonbudget') },
                other: { budget: totalBy('other','budget'), nonbudget: totalBy('other','nonbudget') }
            }
        }
    })
}, { deep: true, immediate: true })
</script>

<style scoped lang="scss">
.budget {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.step-header {
    text-align: center;
}

.step-title { font-size: 1.5rem; font-weight: 600; margin: 0 0 0.5rem 0; color: #212529; }
.step-description { color: #6c757d; margin: 0; }

.form-section { background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 12px; padding: 1rem; }
.section-title { font-size: 1.125rem; font-weight: 600; color: #212529; margin: 0 0 1rem 0; border-bottom: 2px solid #0d6efd; padding-bottom: .5rem; }

/* Контейнер этапов */
.stages-container { display: flex; flex-direction: column; gap: 1.5rem; }

/* Блок этапа */
.stage-block { background: #fff; border: 1px solid #e6e9ef; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.04); }

.stage-header { background: #f8f9fa; border-bottom: 1px solid #dee2e6; padding: 1rem 1.25rem; }
.stage-title { font-size: 1.125rem; font-weight: 600; color: #212529; margin: 0; }

.stage-content { padding: 1.25rem; }
.stage-items { display: flex; flex-direction: column; gap: 1rem; }

.stage-item { 
    background: #fdfdfd; 
    border: 1px solid #e6e9ef; 
    border-radius: 10px; 
    padding: 1rem; 
    transition: background .15s ease, box-shadow .15s ease; 
}
.stage-item:hover { background: #fff; box-shadow: 0 2px 10px rgba(0,0,0,.04); }

/* Строки с полями ввода */
.input-row { 
    display: grid; 
    gap: 1rem; 
    margin-bottom: 1rem; 
    align-items: start;
    overflow: visible;
}
.input-row.single-row { grid-template-columns: 0.8fr 1.2fr 1fr auto; }

.input-group { 
    display: flex; 
    flex-direction: column; 
    gap: .5rem; 
    min-height: fit-content;
    overflow: visible;
}

.input-group-actions {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    min-width: 42px;
    padding-top: 1.5rem;
}
.input-label { font-size: .875rem; font-weight: 600; color: #495057; margin: 0; }

.form-input, .form-select { 
    padding: .6rem .7rem; 
    border: 1px solid #dbe0e7; 
    border-radius: 8px !important;
    font-size: 0.95rem; 
    background: #fff; 
    transition: border-color .15s ease, box-shadow .15s ease;
    min-height: 42px;
    box-sizing: border-box;
    width: 100%;
}
.form-input:focus, .form-select:focus { 
    outline: none; 
    border-color: #0d6efd; 
    box-shadow: 0 0 0 0.2rem rgba(13,110,253,.25); 
}

.form-input.input-error {
    border-color: #dc3545;
    box-shadow: 0 0 0 0.2rem rgba(220,53,69,.25);
}

.input-error-message {
    color: #dc3545;
    font-size: 0.8rem;
    margin-top: 0.25rem;
    font-weight: 500;
}

/* Обертка для select с иконкой */
.select-wrapper { position: relative; }
.select-wrapper .form-select { appearance: none; padding-right: 2rem; }
.select-icon { 
    position: absolute; 
    right: 0.6rem; 
    top: 50%; 
    transform: translateY(-50%); 
    color: #6c757d; 
    pointer-events: none; 
}

/* Итого по этапу */
.stage-total {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 2px solid #e6e9ef;
}

.stage-total-info {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.stage-total-label {
    font-size: 1rem;
    font-weight: 600;
    color: #495057;
}

.stage-total-display { 
    padding: .6rem .7rem; 
    background: #f1f3f5; 
    border: 1px solid #dee2e6; 
    border-radius: 8px !important; 
    font-weight: 700; 
    color: #212529; 
    text-align: right;
    min-height: 42px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    white-space: nowrap;
    min-width: 150px;
}

.form-content {
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
}


/* Действия с элементами */
.item-actions { 
    display: flex; 
    justify-content: flex-start; 
    align-items: center; 
    gap: .75rem; 
    margin-top: .5rem; 
    padding-top: .75rem; 
    border-top: 1px solid #e6e9ef; 
}

.btn { 
    border: 1px solid #0d6efd; 
    color: #0d6efd; 
    background: #fff; 
    padding: .38rem .64rem; 
    border-radius: 8px; 
    cursor: pointer; 
    font-weight: 600; 
    font-size: .875rem;
    transition: background .15s ease;
}
.btn:hover { background: #eef5ff; }
.btn:disabled {
    border-color: #dee2e6;
    color: #6c757d;
    background: #f8f9fa;
    cursor: not-allowed;
}
.btn:disabled:hover {
    background: #f8f9fa;
}
.btn-remove { 
    width: 32px; 
    height: 32px; 
    border-radius: 6px; 
    border: 1px solid #dc3545; 
    background: #fff; 
    color: #dc3545; 
    cursor: pointer; 
    box-shadow: 0 1px 2px rgba(0,0,0,.06); 
    transition: all .15s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}
.btn-remove:hover { 
    background: #dc3545; 
    color: #fff;
    transform: scale(1.05);
}

.totals-grid { display: flex; flex-direction: column; gap: .75rem; }
.totals-row { display: flex; justify-content: space-between; gap: 1rem; background: #fff; border: 1px solid #dee2e6; border-radius: 8px; padding: .6rem .8rem; }
.label { color: #495057; }
.label.sm { font-size: .9rem; }
.value { font-weight: 700; color: #212529; }
.sub-title { margin: .5rem 0 .25rem; color: #6c757d; font-weight: 600; }
.two-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.subgrid { display: flex; flex-direction: column; gap: .5rem; margin-top: .35rem; }

@media (max-width: 900px) {
    .input-row.single-row { 
        grid-template-columns: 1fr; 
        gap: 0.75rem;
    }
    .input-group-actions {
        align-items: center;
        justify-content: flex-end;
        min-width: auto;
    }
    .two-cols { grid-template-columns: 1fr; }
    .stage-content { padding: 1rem; }
    .stage-total { 
        flex-direction: column; 
        align-items: stretch; 
        gap: 0.5rem; 
    }
    .stage-total-info {
        flex-direction: column;
        align-items: stretch;
        gap: 0.5rem;
    }
    .stage-total-display { min-width: auto; }
}
</style>
