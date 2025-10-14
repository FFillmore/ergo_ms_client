<template>
    <div class="target-indicators">
        <div class="step-header">
            <h2 class="step-title">2. Целевые показатели</h2>
        </div>

        <div class="form-content">
            <div class="indicators-list">
                <div
                    v-for="(indicator, index) in localIndicators"
                    :key="`indicator-${index}`"
                    class="indicator-row"
                >
                    <div class="indicator-number">{{ index + 1 }}</div>
                    
                    <div class="indicator-fields">
                        <div class="form-group">
                            <label class="form-label">наименование показателя</label>
                            <template v-if="!indicator.isCustom">
                                <SelectBox
                                    v-model="indicator.name"
                                    :options="indicatorOptions"
                                    :valueKey="'value'"
                                    :labelKey="'label'"
                                    :includeAllOption="true"
                                    :allLabel="'Выберите показатель'"
                                    :fullWidth="false"
                                    :maxSelectedChars="40"
                                />
                            </template>
                            <template v-else>
                                <input
                                    v-model.trim="indicator.name"
                                    type="text"
                                    class="form-input"
                                    placeholder="Введите наименование"
                                />
                            </template>
                            <div class="custom-toggle">
                                <input 
                                    class="toggle-input" 
                                    :id="`custom-${index}`" 
                                    type="checkbox" 
                                    :checked="indicator.isCustom"
                                    :disabled="indicatorOptions.length === 0 && !indicator.isCustom"
                                    @change="handleToggleChange($event, index)"
                                />
                                <label 
                                    class="toggle-label" 
                                    :for="`custom-${index}`"
                                    :class="{ 'shake': shakeIndex === index }"
                                >
                                    <span class="toggle-track"></span>
                                    <span class="toggle-text">вручную</span>
                                </label>
                                <div 
                                    v-if="indicatorOptions.length === 0 && shakeIndex === index" 
                                    class="toggle-error"
                                >
                                    Отсутствуют целевые показатели
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">единица измерения</label>
                            <template v-if="!indicator.isCustom">
                                <SelectBox
                                    v-model="indicator.unit"
                                    :options="unitOptions"
                                    :valueKey="'value'"
                                    :labelKey="'label'"
                                    :includeAllOption="true"
                                    :allLabel="'Выберите единицу'"
                                    :fullWidth="false"
                                    :maxSelectedChars="8"
                                />
                            </template>
                            <template v-else>
                                <input
                                    v-model.trim="indicator.unit"
                                    type="text"
                                    class="form-input"
                                    placeholder="Ед. изм. (шт., %, руб. и т.п.)"
                                />
                            </template>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">базовое (текущее) значение</label>
                            <input
                                v-model.number="indicator.baseValue"
                                type="number"
                                class="form-input"
                                placeholder="0"
                                step="0.01"
                            />
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">планируемое значение</label>
                            <input
                                v-model.number="indicator.targetValue"
                                type="number"
                                class="form-input"
                                placeholder="0"
                                step="0.01"
                            />
                        </div>
                    </div>
                    
                    <button
                        type="button"
                        class="btn-remove"
                        @click="removeIndicator(index)"
                        v-if="localIndicators.length > 1"
                    >
                        <X class="icon" :size="16" />
                    </button>
                </div>
            </div>
            
            <button
                type="button"
                class="btn-add"
                @click="addIndicator"
            >
                <Plus class="btn-icon" :size="16" />
                Добавить показатель
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { 
    Plus, 
    X,
    ChevronDown
} from 'lucide-vue-next'
import { apiClient } from '@/js/api/manager.js'
import { endpoints } from '@/js/api/endpoints.js'
import SelectBox from '@/components/SelectBox.vue'

const props = defineProps({
    indicators: {
        type: Array,
        default: () => []
    },
    selectedEvent: {
        type: Object,
        default: null
    }
})

const emit = defineEmits(['update:indicators'])

// Локальные данные
const localIndicators = ref((props.indicators && props.indicators.length) ? JSON.parse(JSON.stringify(props.indicators)) : [])

// Опции для выпадающих списков
const indicatorOptions = ref([])

// Единицы измерения подгружаются из показателей выбранного блока
const unitOptions = ref([])

// Связка показателей и допустимых единиц измерения
const indicatorToUnits = {}

// Анимация тряски
const shakeIndex = ref(null)

// Методы
const addIndicator = () => {
    const next = [
        ...localIndicators.value,
        {
            name: '',
            unit: '',
            baseValue: 0,
            targetValue: 0,
            isCustom: indicatorOptions.value.length === 0
        }
    ]
    localIndicators.value = next
}

const removeIndicator = (index) => {
    localIndicators.value = localIndicators.value.filter((_, i) => i !== index)
}

// Обработка изменения тумблера
const handleToggleChange = (event, index) => {
    // Если нет показателей и пытаемся выключить режим "вручную"
    if (indicatorOptions.value.length === 0 && !event.target.checked) {
        // Предотвращаем изменение - возвращаем чекбокс в исходное состояние
        event.target.checked = true
        // Запускаем анимацию тряски
        shakeIndex.value = index
        setTimeout(() => {
            shakeIndex.value = null
        }, 2000) // Увеличиваем время показа сообщения об ошибке
        return
    }
    
    // Если есть показатели или включаем режим "вручную", разрешаем переключение
    localIndicators.value[index].isCustom = event.target.checked
}

// Инициализация - добавляем один показатель по умолчанию если список пустой
if (localIndicators.value.length === 0) {
    addIndicator()
}

// Следим за изменениями локального списка и обновляем родителя
watch(localIndicators, (newValue) => {
    // Автокоррекция единиц при смене показателя
    newValue.forEach((ind) => {
        if (!ind.isCustom) {
            const allowed = indicatorToUnits[ind.name]
            if (allowed && !allowed.includes(ind.unit)) {
                ind.unit = allowed[0]
            }
            // Если показатель не выбран, не навязываем единицу
            if (!ind.name && ind.unit && !unitOptions.value.find(u => u.value === ind.unit)) {
                ind.unit = ''
            }
        }
    })
    emit('update:indicators', newValue)
}, { deep: true })

// Следим за внешними изменениями пропса и синхронизируем локальное состояние
watch(() => props.indicators, (newVal) => {
    // Избегаем лишних перерисовок, если массивы эквивалентны по длине и ссылке
    if (newVal !== localIndicators.value) {
        localIndicators.value = (newVal && newVal.length) ? JSON.parse(JSON.stringify(newVal)) : []
        if (localIndicators.value.length === 0) {
            // Гарантируем хотя бы одну строку для UX
            addIndicator()
        }
    }
}, { deep: true })

// Загрузка целевых показателей по выбранному БЛОКУ мероприятия (через его подкатегорию)
const loadIndicatorsByEventBlock = async (blockId) => {
    try {
        if (!blockId) {
            indicatorOptions.value = []
            unitOptions.value = []
            return
        }
        // 1) Получаем данные блока, чтобы узнать его подкатегорию
        const blockRes = await apiClient.get(endpoints.project_ed.event_blocks.detail(blockId))
        const block = blockRes?.data || {}
        const subcategoryId = block?.subcategory || block?.subcategory_id || null

        if (!subcategoryId) {
            indicatorOptions.value = []
            unitOptions.value = []
            return
        }

        // 2) Пробуем загрузить целевые показатели напрямую по блоку
        let resp
        try {
            resp = await apiClient.get(endpoints.project_ed.event_blocks.indicators(blockId))
        } catch (_) {
            resp = null
        }
        // 2b) Если отдельного вью нет или вернулся пустой список — грузим по подкатегории
        if (!resp || !Array.isArray(resp?.data) || resp.data.length === 0) {
            resp = await apiClient.get(endpoints.project_ed.target_indicators.list, { subcategory_id: subcategoryId, event_block: blockId })
        }
        let data = Array.isArray(resp?.data) ? resp.data : (resp?.data?.results || [])
        // Показатели могут быть привязаны к конкретному блоку: отфильтруем по нему с приведением типов
        const blockIdNum = Number(blockId)
        let filtered = data.filter(it => {
            const evBlk = (it?.event_block ?? it?.event_block_id ?? null)
            if (evBlk === null || evBlk === undefined || evBlk === '') return false
            const evBlkNum = Number(evBlk)
            return Number.isFinite(blockIdNum) && Number.isFinite(evBlkNum) ? evBlkNum === blockIdNum : String(evBlk) === String(blockId)
        })
        // Если по блоку ничего не нашли, подстрахуемся показателями по подкатегории
        if (!filtered.length) filtered = data
        data = filtered
        indicatorOptions.value = data.map(it => ({ value: it.id || it.code || it.name, label: it.name }))
        const dict = {}
        for (const it of data) {
            if (it.name && it.unit) dict[it.id || it.name] = [it.unit]
        }
        Object.assign(indicatorToUnits, dict)

        // Устанавливаем список доступных единиц измерения из показателей блока
        const uniqueUnits = Array.from(new Set((data || []).map(it => it.unit).filter(Boolean)))
        unitOptions.value = uniqueUnits.map(u => ({ value: u, label: u }))

        // Если нет доступных показателей, включаем режим "вручную" для всех индикаторов
        if (indicatorOptions.value.length === 0) {
            localIndicators.value.forEach(ind => {
                ind.isCustom = true
            })
        }

        // Провалидируем текущие строки: сбросим неподдерживаемые единицы/подставим по умолчанию
        localIndicators.value.forEach(ind => {
            const allowed = indicatorToUnits[ind.name]
            if (allowed && allowed.length) {
                ind.unit = allowed[0]
            } else if (ind.unit && !unitOptions.value.find(u => u.value === ind.unit)) {
                ind.unit = ''
            }
        })
    } catch (e) {
        indicatorOptions.value = []
        unitOptions.value = []
        
        // При ошибке загрузки также включаем режим "вручную" для всех индикаторов
        localIndicators.value.forEach(ind => {
            ind.isCustom = true
        })
    }
}

// Следим за изменениями выбранного мероприятия и подгружаем список показателей для соответствующего блока
watch(() => props.selectedEvent, (ev) => {
    const blockId = ev?.blockId || ev?.block_id || ev?.event_block || ev?.sectionId || null
    loadIndicatorsByEventBlock(blockId)
}, { immediate: true, deep: true })
</script>

<style scoped lang="scss">
.target-indicators {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.step-header {
    text-align: center;
    margin-bottom: 1rem;
}

.step-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #212529;
    margin: 0;
}

.form-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.indicators-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.indicator-row {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 8px;
}

.indicator-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: #0d6efd;
    color: white;
    border-radius: 4px;
    font-weight: 600;
    font-size: 0.875rem;
    flex-shrink: 0;
    line-height: 1;
    text-align: center;
}

.indicator-fields {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    flex: 1;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
}

.form-group {
    display: flex;
    flex-direction: column;
}

.form-label {
    font-size: 0.75rem;
    color: #6c757d;
    margin-bottom: 0.25rem;
    text-transform: lowercase;
}

.select-wrapper {
    position: relative;
}

.form-select {
    width: 100%;
    padding: 0.5rem 2rem 0.5rem 0.75rem;
    border: 1px solid #b3d9ff;
    border-radius: 6px;
    background: #e6f3ff;
    font-size: 0.875rem;
    color: #212529;
    appearance: none;
    cursor: pointer;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: #0d6efd;
        background: #f0f8ff;
    }

    &:hover {
        background: #f0f8ff;
    }
}

.select-icon {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: #6c757d;
    pointer-events: none;
}

.form-input {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 1px solid #b3d9ff;
    border-radius: 6px;
    background: #e6f3ff;
    font-size: 0.875rem;
    color: #212529;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: #0d6efd;
        background: #f0f8ff;
    }

    &:hover {
        background: #f0f8ff;
    }

    &::placeholder {
        color: #6c757d;
    }
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
    flex-shrink: 0;

    &:hover {
        background: #c82333;
    }

    .icon {
        flex-shrink: 0;
    }
}

.btn-add {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: #0d6efd;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;
    align-self: flex-start;

    &:hover {
        background: #0b5ed7;
    }

    .btn-icon {
        flex-shrink: 0;
    }
}

// Адаптивность

@media (max-width: 768px) {
    .indicator-row {
        flex-direction: column;
        gap: 0.75rem;
    }

    .indicator-number {
        align-self: flex-start;
    }

    .btn-remove {
        align-self: flex-end;
    }
}

// Красивая галочка-переключатель "вручную"
.custom-toggle {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
}

.toggle-input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
}

.toggle-label {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    user-select: none;
}

.toggle-track {
    position: relative;
    width: 40px;
    height: 22px;
    background: #e9ecef;
    border-radius: 999px;
    transition: background-color 0.2s ease;
    box-shadow: inset 0 0 0 1px #dee2e6;
}

.toggle-track::after {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    width: 16px;
    height: 16px;
    background: #fff;
    border-radius: 50%;
    box-shadow: 0 1px 2px rgba(0,0,0,0.15);
    transition: transform 0.2s ease;
}

.toggle-input:checked + .toggle-label .toggle-track {
    background: #0d6efd;
    box-shadow: inset 0 0 0 1px #0d6efd;
}

.toggle-input:checked + .toggle-label .toggle-track::after {
    transform: translateX(18px);
}

.toggle-label .toggle-text {
    font-size: 0.8125rem;
    color: #6c757d;
}

// Анимация тряски
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
    20%, 40%, 60%, 80% { transform: translateX(3px); }
}

.toggle-label.shake {
    animation: shake 0.5s ease-in-out;
}

// Сообщение об ошибке
.toggle-error {
    font-size: 0.75rem;
    color: #dc3545;
    margin-top: 0.25rem;
    font-weight: 500;
}

// Удалены локальные ограничения ширины селектов — возвращаем дефолтный размер
</style>
