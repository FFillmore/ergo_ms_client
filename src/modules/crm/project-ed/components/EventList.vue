<template>
    <div class="events-table">
        <div class="filters card p-3 mb-3">
            <div class="row g-2 align-items-end">
                <div class="col-12 col-lg-3">
                    <SelectBox
                        label="Наименование политики/проекта"
                        v-model="filters.name"
                        :options="nameOptions"
                        :includeAllOption="true"
                        allLabel="Все"
                    />
                </div>
                <div class="col-12 col-lg-3">
                    <SelectBox
                        label="Блок мероприятий"
                        v-model="filters.blockId"
                        :options="blockOptions"
                        :valueKey="'id'"
                        :labelKey="'name'"
                        :includeAllOption="true"
                        allLabel="Все"
                        :castToNumber="true"
                    />
                </div>
                <div class="col-6 col-lg-3">
                    <SelectBox
                        label="Срок реализации: с"
                        v-model="filters.yearFrom"
                        :options="yearOptions"
                        :includeAllOption="true"
                        allLabel="Все"
                        :castToNumber="true"
                    />
                </div>
                <div class="col-6 col-lg-3">
                    <SelectBox
                        label="по"
                        v-model="filters.yearTo"
                        :options="yearOptions"
                        :includeAllOption="true"
                        allLabel="Все"
                        :castToNumber="true"
                    />
                </div>
            </div>
        </div>

        <div class="block-list">
            <div v-if="isLoading" class="p-4 text-center">Загрузка...</div>
            <template v-else>
                <div v-for="block in visibleBlocks" :key="block.id" class="card block-card mb-3">
                    <div class="card-header d-flex align-items-center justify-content-between gap-2 header-toggle" role="button" @click="toggleBlock(block)">
                        <div class="d-flex flex-column">
                            <div class="d-flex align-items-center gap-2">
                                <span class="badge text-bg-secondary rounded-pill code-badge">{{ block.code || block.short_code || '—' }}</span>
                                <div class="title-text">{{ block.name || block.title || 'Без названия' }}</div>
                            </div>
                            <div class="small text-secondary-custom mt-1 d-flex align-items-center gap-3 flex-wrap">
                                    <span class="d-inline-flex align-items-center gap-1">
                                        <Users class="icon-center" />
                                        <span>{{ getLeadersCount(block) }} руководителей</span>
                                    </span>
                                    <span class="d-inline-flex align-items-center gap-1">
                                        <ListChecks class="icon-center" />
                                        <span>{{ getEventsCount(block) }} {{ pluralizeEvents(getEventsCount(block)) }}</span>
                                    </span>
                            </div>
                        </div>
                        <div class="d-flex align-items-center gap-2">
                            <component :is="block._expanded ? ChevronUp : ChevronDown" class="icon-center" />
                        </div>
                    </div>

                    <div v-if="block._expanded" class="card-body pt-3 pb-3">
                        <div v-if="block._loading" class="p-2 text-center">Загрузка мероприятий...</div>
                        <div v-else>
                            <div v-if="(block.events || []).length === 0" class="empty-hint">Мероприятий нет</div>

                            <div class="list-group">
                                <div v-for="ev in block.events" :key="ev.id" class="list-group-item event-item px-0">
                                    <div :class="['event-item-header','d-flex','align-items-center','justify-content-between', { 'is-open': ev._showResults }]" role="button" @click="ev._showResults = !ev._showResults">
                                        <div class="d-flex flex-column flex-grow-1 event-item-main">
                                            <div class="d-flex align-items-center gap-3">
                                                <span class="badge text-bg-secondary rounded-pill code-badge">{{ ev.code ?? ev.id ?? '-' }}</span>
                                                <div class="event-title-link">{{ ev.name || ev.kpiName || 'Без названия' }}</div>
                                            </div>
                                            <div v-if="ev.start_year || ev.end_year" class="event-item-meta text-muted small d-flex align-items-center gap-1 mt-1">
                                                <Calendar class="icon-center" />
                                                <span>
                                                    {{ ev.start_year && ev.end_year ? (ev.start_year === ev.end_year ? ev.start_year : (ev.start_year + ' — ' + ev.end_year)) : (ev.start_year || ev.end_year) }}
                                                </span>
                                            </div>
                                        </div>
                                        <div class="d-flex align-items-center gap-2">
                                            <component :is="ev._showResults ? ChevronUp : ChevronDown" class="icon-center chevron" />
                                        </div>
                                    </div>

                                    <div v-if="ev._showResults" class="mt-2 ps-3 pe-2 pb-2">
                                        <div class="text-muted mb-1 years-th">Основные результаты:</div>
                                        <template v-if="splitResults(ev.results || ev.description).length <= 1">
                                            <div class="cell text-prewrap px-3 py-2">{{ splitResults(ev.results || ev.description)[0] ?? (ev.results || ev.description || '—') }}</div>
                                        </template>
                                        <ol v-else class="mb-0 ps-3">
                                            <li v-for="(item, idx) in splitResults(ev.results || ev.description)" :key="idx">{{ item }}</li>
                                        </ol>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="visibleBlocks.length === 0" class="empty-hint">Нет данных</div>
            </template>
        </div>
    </div>
    
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { apiClient } from '@/js/api/manager'
import { endpoints } from '@/js/api/endpoints'
import { useToast } from 'vue-toastification'
import { ChevronDown, ChevronUp, Users, ListChecks, Calendar } from 'lucide-vue-next'
import SelectBox from '@/components/SelectBox.vue'

const props = defineProps({
    projects: { type: Array, default: () => [] },
})

const toast = useToast()

const projects = computed(() => props.projects)
const filters = ref({ projectId: null, name: null, blockId: null, yearFrom: null, yearTo: null })

const isLoading = ref(false)
const blocksData = ref([])

function getCategoryLabel(block) {
    const c = block.category ?? block.project_category ?? block.project?.category
    const cName = block.category_name ?? block.project?.category_name
    if (typeof c === 'object' && c) {
        return c.name ?? c.title ?? c.label ?? String(c.id ?? '')
    }
    return cName ?? (typeof c === 'number' ? String(c) : c)
}

function getSubcategoryLabel(block) {
    const s = block.subcategory ?? block.project_subcategory ?? block.project?.subcategory
    const sName = block.subcategory_name ?? block.project?.subcategory_name
    if (typeof s === 'object' && s) {
        return s.name ?? s.title ?? s.label ?? String(s.id ?? '')
    }
    return sName ?? (typeof s === 'number' ? String(s) : s)
}

const nameOptions = computed(() => {
    const set = new Set()
    for (const b of blocksData.value) {
        const label = getSubcategoryLabel(b)
        if (label) set.add(label)
    }
    return Array.from(set)
})

const blockOptions = computed(() => {
    return blocksData.value.map(b => ({ id: b.id, name: b.name || b.title || (b.code || b.short_code || 'Без названия') }))
})

const yearOptions = computed(() => {
    const current = new Date().getFullYear()
    const start = current - 5
    const end = current + 10
    const arr = []
    for (let y = start; y <= end; y++) arr.push(y)
    return arr
})

function rangesOverlap(s, e, from, to) {
    if (!Number.isFinite(s) || !Number.isFinite(e)) return false
    const hasFrom = Number.isFinite(from)
    const hasTo = Number.isFinite(to)
    const left = hasFrom ? from : s
    const right = hasTo ? to : e
    return s <= right && left <= e
}

function toNumberOrNaN(value) {
    return (value === null || value === undefined || value === '') ? NaN : Number(value)
}

const visibleBlocks = computed(() => {
    let list = blocksData.value

    // фильтр по проекту
    if (filters.value.projectId) {
        list = list.filter((b) => {
            const pid = b.project_id || b.projectId || b.project?.id
            return !pid || pid === filters.value.projectId
        })
    }

    // фильтр по наименованию (ранее подкатегория)
    if (filters.value.name) {
        list = list.filter((b) => getSubcategoryLabel(b) === filters.value.name)
    }

    // фильтр по блоку
    if (filters.value.blockId) {
        list = list.filter((b) => b.id === filters.value.blockId)
    }

    // фильтр по периоду: показываем только те блоки, у которых есть мероприятия,
    // диапазон которых пересекается с выбранным
    if (filters.value.yearFrom !== null && filters.value.yearFrom !== undefined ||
        filters.value.yearTo !== null && filters.value.yearTo !== undefined) {
        const from = toNumberOrNaN(filters.value.yearFrom)
        const to = toNumberOrNaN(filters.value.yearTo)
        list = list.filter((b) => {
            const events = Array.isArray(b._allEvents) ? b._allEvents : Array.isArray(b.events) ? b.events : []
            return events.some((ev) => rangesOverlap(Number(ev.start_year || ev.startYear), Number(ev.end_year || ev.endYear), from, to))
        })
    }

    return list
})

function normalizeArray(data) {
    if (Array.isArray(data)) return data
    if (Array.isArray(data?.results)) return data.results
    if (data?.data && Array.isArray(data.data)) return data.data
    return []
}

async function fetchBlocks() {
    try {
        isLoading.value = true
        const resp = await apiClient.get(endpoints.project_ed.event_blocks.list)
        const list = normalizeArray(resp.data)
        blocksData.value = list.map((b) => ({ ...b, _expanded: false, _loading: false, events: [] }))
    } catch {
        toast.error('Не удалось загрузить блоки мероприятий')
    } finally {
        isLoading.value = false
    }
}

async function fetchBlockEvents(block) {
    try {
        block._loading = true
        const resp = await apiClient.get(endpoints.project_ed.event_blocks.events(block.id))
        const list = normalizeArray(resp.data)
        block._allEvents = list.map((ev) => ({ ...ev, _showResults: false }))
        applyEventFilterToBlock(block)
    } catch {
        toast.error('Не удалось загрузить мероприятия блока')
    } finally {
        block._loading = false
    }
}

async function toggleBlock(block) {
    block._expanded = !block._expanded
    if (block._expanded) {
        if ((block.events || []).length === 0) {
            if (Array.isArray(block._allEvents)) {
                // если фильтра нет, восстановим список мероприятий
                if (filters.value.yearFrom == null && filters.value.yearTo == null) {
                    block.events = block._allEvents
                } else {
                    applyEventFilterToBlock(block)
                }
            } else {
                await fetchBlockEvents(block)
            }
        } else {
            // синхронизируем с текущим фильтром
            applyEventFilterToBlock(block)
        }
    }
}

function applyEventFilterToBlock(block) {
    const all = Array.isArray(block._allEvents) ? block._allEvents : []
    const from = toNumberOrNaN(filters.value.yearFrom)
    const to = toNumberOrNaN(filters.value.yearTo)
    const hasPeriod = (filters.value.yearFrom !== null && filters.value.yearFrom !== undefined) || (filters.value.yearTo !== null && filters.value.yearTo !== undefined)
    block.events = hasPeriod
        ? all.filter(ev => rangesOverlap(Number(ev.start_year || ev.startYear), Number(ev.end_year || ev.endYear), from, to))
        : all
}

async function ensureEventsLoadedForAllBlocks() {
    const promises = []
    for (const b of blocksData.value) {
        if (!Array.isArray(b._allEvents)) {
            promises.push(fetchBlockEvents(b))
        } else {
            applyEventFilterToBlock(b)
        }
    }
    if (promises.length) {
        await Promise.allSettled(promises)
        // после загрузки применим фильтр ещё раз
        for (const b of blocksData.value) applyEventFilterToBlock(b)
    }
}

function splitResults(text) {
    if (!text) return []
    return String(text)
        .split(/\r?\n/)
        .map(s => s.trim())
        .filter(Boolean)
}

function getLeadersCount(block) {
    const leaders = block.leaders || block.managers || block.heads || []
    if (Array.isArray(leaders)) return leaders.length
    if (typeof leaders === 'number') return leaders
    if (typeof leaders === 'string') {
        const n = Number(leaders)
        return Number.isFinite(n) ? n : 0
    }
    return Number(block.leaders_count || block.managers_count || block.heads_count) || 0
}

function getEventsCount(block) {
    // показываем уже загруженное число, иначе пробуем из возможных полей
    const loaded = (block.events || []).length
    if (loaded > 0) return loaded
    const candidates = [block.events_count, block.count, block.total_events]
    for (const v of candidates) {
        const n = Number(v)
        if (Number.isFinite(n) && n > 0) return n
    }
    return 0
}

function pluralizeEvents(n) {
    const num = Math.abs(Number(n)) || 0
    const mod10 = num % 10
    const mod100 = num % 100
    if (mod10 === 1 && mod100 !== 11) return 'мероприятие'
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'мероприятия'
    return 'мероприятий'
}

onMounted(fetchBlocks)
// Подписка на смену периода: загружаем мероприятия для всех блоков и фильтруем
watch(() => [filters.value.yearFrom, filters.value.yearTo], async () => {
    await ensureEventsLoadedForAllBlocks()
})
</script>

<style scoped lang="scss">
.block-list { display: block; }
.block-card {
    border: 1px solid var(--color-border);
    border-radius: .75rem;
    background-color: var(--color-primary-background);
    overflow: hidden;
}
.block-card .card-header { background-color: var(--color-primary-background); }
.block-card .card-header.header-toggle { cursor: pointer; user-select: none; }
.code-badge { font-variant-numeric: tabular-nums; }
.title-text { font-weight: 600; }
.cell {
    width: 100%;
    min-height: 40px;
    display: flex;
    align-items: center;
    height: 100%;
    flex: 1 1 auto;
    padding: .5rem .75rem;
    border-radius: .5rem;
    background-color: var(--color-secondary-background);
    border: 1px solid var(--color-border);
    white-space: normal;
    word-break: break-word;
}
.cell.text-center { justify-content: center; text-align: center; }
.empty-hint { padding: 1rem; text-align: center; color: var(--color-secondary-text); }
.filters.card { background-color: var(--color-primary-background); border-color: var(--bs-border-color, #dee2e6); }
.years-th { font-weight: 600; }
.icon-center {
    width: 18px;
    height: 18px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    vertical-align: middle;
}
.list-group-item { background: transparent; }
.event-item {
    background: var(--color-primary-background);
    border: 1px solid var(--color-border);
    border-radius: .5rem;
    overflow: hidden;
    padding: 0; /* убираем внутренний отступ list-group-item */
    margin-bottom: .5rem; /* добавляем зазор для видимости нижней границы */
}
.list-group .event-item:last-child { margin-bottom: .5rem; }
.block-card .card-body { padding-bottom: 1rem; }
.event-item-header { padding: .75rem .75rem .5rem .75rem; }
.event-item-header:hover { background-color: var(--color-hover-background); }
.event-item-header.is-open { background-color: var(--bs-secondary-bg, #f8f9fa); border-bottom-color: var(--color-border); }
.event-item-meta { padding: 0 .75rem .5rem 0; }
/* hover только на шапке элемента */
.chevron { transition: transform .15s ease-in-out; }
.event-title-link { text-decoration: none; cursor: pointer; font-weight: 400; }
.text-secondary-custom { color: var(--color-secondary-text); }
</style>


