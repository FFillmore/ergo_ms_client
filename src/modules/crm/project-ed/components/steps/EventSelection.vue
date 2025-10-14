<template>
    <div class="event-selection">
        <div class="step-header">
            <h2 class="step-title">Выбор мероприятия</h2>
            <p class="step-description">
                Выберите мероприятие, для которого создается проект
            </p>
        </div>

        <div class="form-content">
            <div class="filters-section">
                <div class="filters-row">
                    <div class="filter-group">
                        <label class="filter-label">Наименование политики/ стратегического проекта</label>
                        <SelectBox
                            v-model="selectedPolicy"
                            :options="policies"
                            :valueKey="'id'"
                            :labelKey="'title'"
                            :castToNumber="true"
                            :includeAllOption="true"
                            allLabel="Выберите политику/проект"
                            @change="onPolicyChange"
                        />
                    </div>
                    
                    <div class="filter-group">
                        <label class="filter-label">Наименование блока мероприятий</label>
                        <SelectBox
                            v-model="selectedBlock"
                            :options="availableBlocks"
                            :valueKey="'id'"
                            :labelKey="'title'"
                            :castToNumber="true"
                            :includeAllOption="true"
                            allLabel="Выберите блок мероприятий"
                            :currentLabelFormatter="({ option, label }) => (option?.code ? option.code : label)"
                            @change="onBlockChange"
                        />
                    </div>
                    
                    <div class="filter-group">
                        <label class="filter-label">Годы реализации</label>
                        <div class="years-selects">
                            <SelectBox
                                v-model="selectedStartYear"
                                :options="availableStartYears"
                                :castToNumber="true"
                                :includeAllOption="true"
                                allLabel="Начало"
                                @change="onYearsChange"
                            />
                            <SelectBox
                                v-model="selectedEndYear"
                                :options="availableEndYears"
                                :castToNumber="true"
                                :includeAllOption="true"
                                allLabel="Окончание"
                                @change="onYearsChange"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="filteredEventSections.length > 1" class="sections-tabs">
                <button
                    type="button"
                    class="scroll-btn scroll-btn--left btn btn-outline-secondary btn-sm"
                    v-if="tabsOverflowing"
                    :disabled="!canScrollLeft"
                    @click="scrollTabs('left')"
                    aria-label="Прокрутить влево"
                >
                    <ChevronLeft class="btn-icon" :size="16" />
                </button>

                <div class="sections-tabs__viewport" ref="tabsViewport" @scroll="updateScrollButtons">
                    <div class="sections-tabs__inner">
                        <button
                            v-for="section in filteredEventSections"
                            :key="section.id"
                            class="section-tab"
                            :class="{ 'active': activeSectionId === section.id }"
                            @click="setActiveSection(section.id)"
                        >
                            {{ section.shortTitle || `МП${section.id}` }}
                        </button>
                    </div>
                </div>

                <button
                    type="button"
                    class="scroll-btn scroll-btn--right btn btn-outline-secondary btn-sm"
                    v-if="tabsOverflowing"
                    :disabled="!canScrollRight"
                    @click="scrollTabs('right')"
                    aria-label="Прокрутить вправо"
                >
                    <ChevronRight class="btn-icon" :size="16" />
                </button>
            </div>

            <div class="events-sections">
                <div
                    v-for="section in filteredEventSections"
                    :key="section.id"
                    class="event-section"
                    :class="{ 'active': activeSectionId === section.id }"
                >
                    <div class="section-header">
                        <h2 class="section-title">{{ section.code ? (section.code + '. ') : '' }}{{ section.title }}</h2>
                        <div class="view-toggle-row">
                            <div class="view-toggle btn-group" role="group" aria-label="Переключение вида">
                                <button
                                    type="button"
                                    class="btn btn-outline-secondary btn-sm"
                                    :class="{ active: viewMode === 'grid' }"
                                    @click="viewMode = 'grid'"
                                    title="Плитками"
                                    aria-label="Показать плитками"
                                >
                                    <LayoutGrid class="btn-icon" :size="16" />
                                </button>
                                <button
                                    type="button"
                                    class="btn btn-outline-secondary btn-sm"
                                    :class="{ active: viewMode === 'list' }"
                                    @click="viewMode = 'list'"
                                    title="Строчками"
                                    aria-label="Показать строчками"
                                >
                                    <List class="btn-icon" :size="16" />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="events-grid" :class="{ 'list-view': viewMode === 'list' }">
                        <div
                            v-for="event in section.events"
                            :key="event.id"
                            class="event-card"
                            :class="{ 'selected': selectedEvent?.id === event.id, 'highlighted': event.highlighted, 'list': viewMode === 'list' }"
                            @click="selectEvent(event)"
                        >
                            <div class="event-header">
                                <div class="event-code">{{ event.code }}</div>
                            </div>
                            <h3 class="event-title">{{ event.title }}</h3>
                            
                            <div class="event-details">
                                <div class="event-period">
                                    <Calendar class="icon" :size="16" />
                                    {{ event.period }}
                                </div>
                            </div>
                            
                            <div class="event-content">
                                <p class="event-key-results">{{ event.keyResults }}</p>
                                
                                <div class="event-footer">
                                    <div 
                                        class="event-leaders" 
                                        :ref="el => setLeaderButtonRef(event.id, el)"
                                        :data-event-id="event.id"
                                        @mouseenter="showLeadersTooltip(event, $event)"
                                        @mouseleave="hideLeadersTooltip"
                                    >
                                        <Users class="icon" :size="16" />
                                        {{ event.leadersCount || event.leaders.length }} {{ getLeadersText(event.leadersCount || event.leaders.length) }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="filteredEventSections.length === 0 || filteredEventSections.every(section => section.events.length === 0)" class="no-events">
                <Calendar class="no-events-icon" :size="48" />
                <h3>Мероприятия не найдены</h3>
                <p>Попробуйте изменить поисковый запрос</p>
            </div>
        </div>

        <SimpleTooltip
            :visible="tooltipVisible"
            :target-element="tooltipTarget"
            @mouseenter="handleTooltipMouseEnter"
            @mouseleave="handleTooltipMouseLeave"
        >
            <UsersList 
                :users="hoveredEvent?.leaders || []" 
                type="leaders"
                :max-displayed="3"
                @open-modal="openLeadersModal"
            />
        </SimpleTooltip>

        <UserListModal
            :visible="leadersModalVisible"
            :users="modalLeaders"
            type="leaders"
            modal-id="leadersModal"
            @close="closeLeadersModal"
        />

    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { 
    Calendar, 
    MapPin, 
    Users, 
    ChevronLeft, 
    ChevronRight, 
    LayoutGrid,
    List,
    X
} from 'lucide-vue-next'
import SimpleTooltip from '../SimpleTooltip.vue'
import UsersList from '../UsersList.vue'
import UserListModal from '../UserListModal.vue'
import SelectBox from '@/components/SelectBox.vue'
import { apiClient } from '@/js/api/manager.js'

const props = defineProps({
    // Текущее выбранное мероприятие: допускается объект или числовой ID
    event: {
        type: [Object, Number, String],
        default: null
    }
})

const emit = defineEmits(['update:event'])

// Данные
// Локально выбранное мероприятие (объект). Если из props приходит только ID — найдём объект после загрузки
const selectedEvent = ref(null)
const eventSections = ref([])

// Следим за изменением props.event
watch(() => props.event, (newEvent) => {
    const normalizeId = (val) => {
        const n = Number(val)
        return Number.isFinite(n) && n > 0 ? n : null
    }

    // Если пришёл объект с id
    if (newEvent && typeof newEvent === 'object' && newEvent.id) {
        if (eventSections.value.length > 0) {
            const foundEvent = findEventById(newEvent.id)
            if (foundEvent) {
                selectedEvent.value = foundEvent
                const eventSection = eventSections.value.find(s => s.events.some(e => e.id === foundEvent.id))
                if (eventSection) activeSectionId.value = eventSection.id
                return
            }
        }
        selectedEvent.value = newEvent
        return
    }

    // Если пришёл ID (число/строка)
    const id = normalizeId(newEvent)
    if (id) {
        if (eventSections.value.length > 0) {
            const foundEvent = findEventById(id)
            if (foundEvent) {
                selectedEvent.value = foundEvent
                const eventSection = eventSections.value.find(s => s.events.some(e => e.id === foundEvent.id))
                if (eventSection) activeSectionId.value = eventSection.id
                return
            }
        }
        // Отложенно установим после загрузки данных
        selectedEvent.value = { id }
        return
    }

    // Иначе сбрасываем
    selectedEvent.value = null
}, { immediate: true })

// Вид отображения: 'grid' | 'list'
const viewMode = ref('grid')

// Фильтры
const selectedPolicy = ref('')
const selectedBlock = ref('')
const selectedStartYear = ref('')
const selectedEndYear = ref('')
const activeSectionId = ref(null)

// Прокрутка вкладок
const tabsViewport = ref(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)
const tabsOverflowing = ref(false)

const updateScrollButtons = () => {
    const el = tabsViewport.value
    if (!el) { 
        tabsOverflowing.value = false
        canScrollLeft.value = false
        canScrollRight.value = false
        return 
    }
    const epsilon = 1
    const maxScrollLeft = el.scrollWidth - el.clientWidth
    tabsOverflowing.value = el.scrollWidth > (el.clientWidth + epsilon)
    if (!tabsOverflowing.value) {
        canScrollLeft.value = false
        canScrollRight.value = false
        return
    }
    canScrollLeft.value = el.scrollLeft > 0
    canScrollRight.value = el.scrollLeft < (maxScrollLeft - 1)
}

const scrollTabs = (direction) => {
    const el = tabsViewport.value
    if (!el) return
    const amount = Math.max(200, Math.floor(el.clientWidth * 0.75))
    const delta = direction === 'left' ? -amount : amount
    el.scrollBy({ left: delta, behavior: 'smooth' })
}

// Справочные данные
const policies = ref([])
const blocks = ref([])
const periods = ref([])
const availableYears = ref([])

// Вычисляемые свойства для фильтров
const availableBlocks = computed(() => {
    // Если выбрана политика — берем её блоки, иначе все блоки
    if (selectedPolicy.value) {
        const policy = policies.value.find(p => p.id === selectedPolicy.value)
        return policy ? policy.blocks : []
    }
    return blocks.value
})

const defaultYearsRange = computed(() => {
    // 2023..2032 включительно
    const from = 2023
    const to = 2032
    return Array.from({ length: to - from + 1 }, (_, i) => from + i)
})

const baseYears = computed(() => {
    // Если не выбрана ни политика, ни блок — показываем фиксированный диапазон
    if (!selectedPolicy.value && !selectedBlock.value) {
        return defaultYearsRange.value
    }
    return availableYears.value
})

const availableStartYears = computed(() => baseYears.value)

const availableEndYears = computed(() => {
    if (!selectedStartYear.value) return baseYears.value
    const start = Number(selectedStartYear.value)
    return baseYears.value.filter(y => Number(y) >= start)
})

// Фильтрация мероприятий
const filteredEventSections = computed(() => {
    let sections = eventSections.value
    
    // Фильтр по политике
    if (selectedPolicy.value) {
        sections = sections.filter(section => section.policyId === selectedPolicy.value)
    }
    
    // Фильтр по блоку мероприятий
    if (selectedBlock.value) {
        sections = sections.filter(section => section.blockId === selectedBlock.value)
    }
    
    // Фильтр по диапазону лет
    if (selectedStartYear.value || selectedEndYear.value) {
        const start = selectedStartYear.value ? Number(selectedStartYear.value) : -Infinity
        const end = selectedEndYear.value ? Number(selectedEndYear.value) : Infinity
        sections = sections.filter(section => 
            section.events.some(event => {
                // event.period в формате "YYYY-YYYY" или "YYYY"; запасной вариант — пустая строка
                const p = String(event.period || '').trim()
                let evStart = null
                let evEnd = null
                if (/^\d{4}\s*-\s*\d{4}$/.test(p)) {
                    const [s, e] = p.split('-').map(v => Number(v.trim()))
                    evStart = s
                    evEnd = e
                } else if (/^\d{4}$/.test(p)) {
                    evStart = Number(p)
                    evEnd = Number(p)
                }
                if (evStart == null || evEnd == null) return false
                // Пересечение интервалов [evStart, evEnd] и [start, end]
                return !(evEnd < start || evStart > end)
            })
        )
    }
    
    
    return sections
})

// Методы
const selectEvent = (event) => {
    selectedEvent.value = event
    emit('update:event', event)
}

// Поиск мероприятия по ID в загруженных данных
const findEventById = (eventId) => {
    for (const section of eventSections.value) {
        const foundEvent = section.events.find(event => event.id === eventId)
        if (foundEvent) {
            return foundEvent
        }
    }
    return null
}



// Методы для работы с фильтрами
const onPolicyChange = () => {
    selectedBlock.value = ''
    selectedStartYear.value = ''
    selectedEndYear.value = ''
    // Устанавливаем первую доступную секцию
    if (filteredEventSections.value.length > 0) {
        activeSectionId.value = filteredEventSections.value[0].id
    }
    nextTick(() => updateScrollButtons())
}

const onBlockChange = () => {
    selectedStartYear.value = ''
    selectedEndYear.value = ''
    // Устанавливаем первую доступную секцию
    if (filteredEventSections.value.length > 0) {
        activeSectionId.value = filteredEventSections.value[0].id
    }
    nextTick(() => updateScrollButtons())
}

const onYearsChange = () => {
    // Устанавливаем первую доступную секцию
    if (filteredEventSections.value.length > 0) {
        activeSectionId.value = filteredEventSections.value[0].id
    }
    nextTick(() => updateScrollButtons())
}

const setActiveSection = (sectionId) => {
    activeSectionId.value = sectionId
}

// Тултип для руководителей
const tooltipVisible = ref(false)
const hoveredEvent = ref(null)
const tooltipTarget = ref(null)
const leaderButtonRefs = ref(new Map())
let hideTimeout = null

// Модальное окно для руководителей
const leadersModalVisible = ref(false)
const modalLeaders = ref([])
const savedLeaders = ref([]) // Сохраняем руководителей для модального окна

const getLeadersText = (count) => {
    if (count === 1) return 'руководитель'
    if (count >= 2 && count <= 4) return 'руководителя'
    return 'руководителей'
}

const setLeaderButtonRef = (eventId, el) => {
    if (el) {
        leaderButtonRefs.value.set(eventId, el)
    } else {
        leaderButtonRefs.value.delete(eventId)
    }
}

const showLeadersTooltip = (event, mouseEvent) => {
    // Не показываем тултип, если руководителей нет
    const leadersCount = event?.leadersCount || (event?.leaders ? event.leaders.length : 0)
    if (leadersCount === 0) {
        return
    }
    // Отменяем предыдущий таймер скрытия
    if (hideTimeout) {
        clearTimeout(hideTimeout)
        hideTimeout = null
    }
    
    hoveredEvent.value = event
    
    // Сохраняем руководителей для модального окна
    if (event?.leaders && Array.isArray(event.leaders)) {
        savedLeaders.value = [...event.leaders]
    } else {
        savedLeaders.value = []
    }
    
    // Используем currentTarget - это должен быть элемент event-leaders
    tooltipTarget.value = mouseEvent.currentTarget
    
    tooltipVisible.value = true
}

const hideLeadersTooltip = () => {
    // Устанавливаем задержку для плавного перехода
    hideTimeout = setTimeout(() => {
        tooltipVisible.value = false
        hoveredEvent.value = null
        tooltipTarget.value = null
    }, 150)
}

const handleTooltipMouseEnter = () => {
    // Отменяем скрытие тултипа при наведении на него
    if (hideTimeout) {
        clearTimeout(hideTimeout)
        hideTimeout = null
    }
}

const handleTooltipMouseLeave = () => {
    // Скрываем тултип при уходе с него
    hideTimeout = setTimeout(() => {
        tooltipVisible.value = false
        hoveredEvent.value = null
        tooltipTarget.value = null
    }, 100)
}

// Методы для управления модальным окном руководителей
const openLeadersModal = () => {
    // Используем сохраненных руководителей
    if (savedLeaders.value && Array.isArray(savedLeaders.value) && savedLeaders.value.length > 0) {
        modalLeaders.value = [...savedLeaders.value]
    } else if (hoveredEvent.value?.leaders && Array.isArray(hoveredEvent.value.leaders)) {
        modalLeaders.value = [...hoveredEvent.value.leaders]
    } else {
        modalLeaders.value = []
    }
    leadersModalVisible.value = true
}

const closeLeadersModal = () => {
    leadersModalVisible.value = false
    // Очищаем сохраненные данные о руководителях
    modalLeaders.value = []
}

// Загрузка данных
onMounted(async () => {
    try {
        // Загружаем блоки мероприятий вместе с вложенными мероприятиями
        const resp = await apiClient.get('/project_ed/event-blocks/')
        const list = Array.isArray(resp?.data) ? resp.data : (resp?.data?.results || [])

        // Строим справочник подкатегорий (политик/стратегических проектов) из блоков
        const uniquePoliciesMap = new Map()
        const blocksForSelect = []
        const allPeriods = new Set()
        const sections = []

        for (const b of list) {
            // Политика/подкатегория (используем subcategory, при отсутствии — category)
            const policyId = (b.subcategory ?? b.category) || null
            const policyTitle = b.subcategory_name || b.category_name || (policyId ? `Категория ${policyId}` : 'Без категории')
            if (policyId) {
                if (!uniquePoliciesMap.has(policyId)) {
                    uniquePoliciesMap.set(policyId, { id: policyId, title: policyTitle, blocks: [] })
                }
            }

            // Периоды из мероприятий
            const periodsOfBlock = new Set()
            const events = Array.isArray(b.events) ? b.events : []
            const mappedEvents = events.map(e => {
                if (e.years_display) { periodsOfBlock.add(e.years_display); allPeriods.add(e.years_display) }
                return {
                    id: e.id,
                    code: e.code,
                    title: e.name,
                    keyResults: e.results,
                    period: e.years_display || `${e.start_year || ''}${e.end_year ? '-' + e.end_year : ''}`,
                    highlighted: false,
                    leaders: e.leaders || [],
                    leadersCount: e.unique_leaders_count || 0,
                    // Добавляем связь с блоком мероприятий, чтобы далее можно было фильтровать показатели по блоку
                    blockId: b.id
                }
            })

            // Секция = блок мероприятий
            sections.push({
                id: b.id,
                policyId: (b.subcategory ?? b.category) || null,
                blockId: b.id,
                code: b.code || null,
                title: b.title,
                shortTitle: b.code || b.title,
                events: mappedEvents
            })

            // Элемент для селекта блоков
            blocksForSelect.push({ id: b.id, title: b.title, code: b.code || null, periods: Array.from(periodsOfBlock) })

            // Привяжем блок к политике/подкатегории
            const policyRec = uniquePoliciesMap.get((b.subcategory ?? b.category) || null)
            if (policyRec) policyRec.blocks.push({ id: b.id, title: b.title, code: b.code || null, periods: Array.from(periodsOfBlock) })
        }

        policies.value = Array.from(uniquePoliciesMap.values())
        blocks.value = blocksForSelect
        periods.value = Array.from(allPeriods)
        // Строим плоский список лет для мини-селектов
        const years = new Set()
        for (const sec of sections) {
            for (const ev of sec.events) {
                const p = String(ev.period || '').trim()
                if (/^\d{4}\s*-\s*\d{4}$/.test(p)) {
                    const [s, e] = p.split('-').map(v => Number(v.trim()))
                    if (!Number.isNaN(s)) years.add(s)
                    if (!Number.isNaN(e)) years.add(e)
                } else if (/^\d{4}$/.test(p)) {
                    const y = Number(p)
                    if (!Number.isNaN(y)) years.add(y)
                }
            }
        }
        availableYears.value = Array.from(years).sort((a, b) => a - b)
        eventSections.value = sections

        // Если есть выбранное мероприятие (объект или только id), найдем его в загруженных данных
        const preselectedId = (props.event && typeof props.event === 'object') ? props.event.id : Number(props.event)
        const targetId = (selectedEvent.value && selectedEvent.value.id) ? selectedEvent.value.id : (Number.isFinite(preselectedId) ? preselectedId : null)
        if (targetId) {
            const foundEvent = findEventById(targetId)
            if (foundEvent) {
                selectedEvent.value = foundEvent
                const eventSection = sections.find(s => s.events.some(e => e.id === foundEvent.id))
                if (eventSection) activeSectionId.value = eventSection.id
            }
        } else if (eventSections.value.length > 0) {
            activeSectionId.value = eventSections.value[0].id
        }
    } catch (e) {
        // В случае ошибки пусть интерфейс остаётся пустым
        policies.value = []
        blocks.value = []
        periods.value = []
        eventSections.value = []
    }
    // Инициализируем состояние кнопок прокрутки после рендера
    await nextTick()
    updateScrollButtons()

    const onResize = () => updateScrollButtons()
    window.addEventListener('resize', onResize)
    // Сохраним обработчик для снятия
    tabsViewport.value && tabsViewport.value.addEventListener('scroll', updateScrollButtons)
    ;(onMounted._handlers ||= []).push(onResize)
})

onUnmounted(() => {
    // Снимаем навешанные события
    const handlers = onMounted._handlers || []
    handlers.forEach((h) => window.removeEventListener('resize', h))
    if (tabsViewport.value) tabsViewport.value.removeEventListener('scroll', updateScrollButtons)
})

// Пересчитываем переполнение и кнопки при изменении отфильтрованных секций
watch(filteredEventSections, async () => {
    await nextTick()
    updateScrollButtons()
})
</script>

<style scoped lang="scss">
.event-selection {
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
    color: var(--color-primary-text);
    margin: 0 0 0.5rem 0;
}

.step-description {
    color: var(--color-secondary-text);
    margin: 0;
}

.form-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.filters-section {
    background: var(--color-secondary-background);
    border-radius: 8px;
    padding: 1.5rem;
    border: 1px solid var(--color-border);
}

.filters-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr);
    gap: 1.5rem;
    margin-bottom: 1rem;
    align-items: end; // выравниваем группы по низу, чтобы инпуты были на одной линии
}

.filter-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 0; // критично, чтобы контент мог сжиматься внутри грид-колонки
}

/* Гарантируем, что SelectBox занимает всю ширину колонки и текст не растягивает кнопку */
.filter-group :deep(.select-box) { width: 100%; max-width: 100%; }
.filter-group :deep(.select-trigger) { width: 100%; }
.filter-group :deep(.select-trigger .value-text) {
    display: block;
    flex: 1 1 auto;
    min-width: 0; /* критично для обрезки во flex-контейнере */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.filter-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-primary-text);
    line-height: 1.2;
    min-height: 2.25rem; // обеспечиваем одинаковую высоту области подписи
    display: flex;
    align-items: flex-end; // текст подписи прижат к низу области
}

.years-selects {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
}

.combobox-container {
    position: relative;
}

.combobox {
    width: 100%;
    padding: 0.75rem 2.5rem 0.75rem 1rem;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    font-size: 0.875rem;
    background: var(--color-primary-background);
    cursor: pointer;
    appearance: none;
    transition: border-color 0.2s ease;

    &:focus {
        outline: none;
        border-color: #0d6efd;
        box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
    }

    &:hover {
        border-color: var(--color-hover-background);
    }
}

.combobox-icon {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--color-secondary-text);
    pointer-events: none;
}


.sections-tabs {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    padding: 0 0.5rem;
    border-bottom: 1px solid var(--color-border);
}

.sections-tabs__viewport {
    overflow: hidden;
}

.sections-tabs__inner {
    display: flex;
    gap: 0.5rem;
}

.scroll-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
}

.section-tab {
    padding: 0.75rem 1.5rem;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--color-secondary-text);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;

    &:hover {
        color: #0d6efd;
        background: var(--color-hover-background);
    }

    &.active {
        color: #0d6efd;
        border-bottom-color: #0d6efd;
        background: var(--color-hover-background);
    }
}

.events-sections {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.event-section {
    display: none;
    
    &.active {
        display: block;
    }
    
    .section-header {
        display: block;
        margin: 0 0 1.5rem 0;
    }

    .section-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--color-primary-text);
        margin: 0;
        padding: 1rem;
        background: var(--color-secondary-background);
        border-radius: 8px;
        border-left: 4px solid #0d6efd;
        flex: 1 1 auto;
    }

    .view-toggle-row {
        display: flex;
        justify-content: flex-end;
        margin-top: 0.5rem;
    }

    .view-toggle .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        padding: 0;
    }
}

.events-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 1.5rem;

    &.list-view {
        grid-template-columns: 1fr;
    }
}

.event-card {
    background: var(--color-primary-background);
    border: 2px solid var(--color-border);
    border-radius: 8px;
    padding: 1.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;

    &:hover {
        border-color: #0d6efd;
        box-shadow: 0 4px 12px rgba(13, 110, 253, 0.15);
    }

    &.selected {
        border-color: #0d6efd;
        background: var(--color-hover-background);
        box-shadow: 0 4px 12px rgba(13, 110, 253, 0.2);
    }

    &.list {
        display: grid;
        grid-template-columns: auto auto 1fr;
        grid-template-areas:
            "code code code"
            "title title title"
            "results results results"
            "period leaders .";
        row-gap: 0.5rem;
        column-gap: 0.75rem;
    }
}

.event-header {
    margin-bottom: 0.75rem;

    .list & {
        margin: 0;
        grid-area: code;
        align-self: start;
    }
}

.event-code {
    background: var(--color-secondary-background);
    color: var(--color-primary-text);
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    display: inline-block;
}

.event-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--color-primary-text);
    margin: 0 0 1rem 0;
    line-height: 1.4;

    .list & {
        grid-area: title;
        margin: 0;
        align-self: start;
    }
}

.event-status {
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;

    &.planned {
        background: #cff4fc;
        color: #055160;
    }

    &.active {
        background: #d1e7dd;
        color: #0f5132;
    }

    &.completed {
        background: #d1ecf1;
        color: #0c5460;
    }

    &.cancelled {
        background: #f8d7da;
        color: #721c24;
    }
}

.event-details {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;

    .list & {
        margin: 0;
        grid-area: period;
        align-self: center;
    }
}

.event-period {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--color-secondary-text);
    font-size: 0.75rem;

    .icon {
        flex-shrink: 0;
    }

    .list & {
        font-size: 0.75rem;
    }
}

.event-content {
    display: flex;
    flex-direction: column;
    flex: 1;

    .list & {
        /* делаем детей элементами grid-контейнера карточки */
        display: contents;
    }
}

.event-key-results {
    color: var(--color-primary-text);
    font-size: 0.875rem;
    line-height: 1.5;
    margin: 0 0 1rem 0;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
    flex: 1;

    .list & {
        grid-area: results;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        margin-bottom: 0.25rem;
    }
}

.event-footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    position: relative;
    margin-top: auto;

    .list & {
        grid-area: leaders;
        margin-top: 0;
        justify-content: flex-start;
        justify-self: start;
    }
}

.event-leaders {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    color: var(--color-secondary-text);
    font-size: 0.75rem;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    transition: background-color 0.2s ease;

    &:hover {
        background: var(--color-hover-background);
        color: #0d6efd;
    }

    .icon {
        flex-shrink: 0;
    }
}


.no-events {
    text-align: center;
    padding: 3rem 1rem;
    color: var(--color-secondary-text);

    .no-events-icon {
        margin-bottom: 1rem;
        opacity: 0.5;
    }

    h3 {
        margin: 0 0 0.5rem 0;
        color: var(--color-primary-text);
    }

    p {
        margin: 0;
    }
}


// Адаптивность
@media (max-width: 1200px) {
    .filters-row {
        grid-template-columns: 1fr;
        gap: 1.25rem;
    }
}

@media (max-width: 768px) {
    .filters-row {
        grid-template-columns: 1fr;
        gap: 1rem;
    }
    
    .sections-tabs {
        flex-wrap: wrap;
        gap: 0.25rem;
    }
    
    .section-tab {
        padding: 0.5rem 1rem;
        font-size: 0.8125rem;
    }
    
    .events-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 480px) {
    .filters-section {
        padding: 1rem;
    }
    
    .sections-tabs {
        padding: 0;
    }
    
    .section-tab {
        padding: 0.5rem 0.75rem;
        font-size: 0.75rem;
    }
}

</style>
