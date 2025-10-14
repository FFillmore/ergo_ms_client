<template>
    <div class="events-table">
        <!-- Панель фильтров в стиле SelectBox -->
        <div class="filters card p-3 mb-3">
            <div class="row g-2 align-items-end">
                <div class="col-12 col-lg-6 col-xl-4">
                    <SelectBox
                        label="Политика/проект"
                        v-model="filters.projectId"
                        :options="projectOptions"
                        :valueKey="'id'"
                        :labelKey="'name'"
                        :includeAllOption="true"
                        allLabel="Все"
                        :castToNumber="true"
                    />
                </div>
                <div class="col-6 col-lg-3 col-xl-2">
                    <SelectBox
                        label="Срок реализации (год)"
                        v-model="filters.year"
                        :options="years"
                        :includeAllOption="true"
                        allLabel="Все"
                        :castToNumber="true"
                    />
                </div>
                <div class="col-6 col-lg-3 col-xl-2">
                    <SelectBox
                        label="Категория"
                        v-model="filters.category"
                        :options="categories"
                        :includeAllOption="true"
                        allLabel="Все"
                    />
                </div>
                <div class="col-6 col-lg-3 col-xl-2">
                    <SelectBox
                        label="Единица измерения"
                        v-model="filters.unit"
                        :options="unitOptions"
                        :includeAllOption="true"
                        allLabel="Все"
                    />
                </div>
                <div class="col-6 col-lg-3 col-xl-2">
                    <SelectBox
                        label="Ответственный"
                        v-model="filters.responsibleId"
                        :options="responsibleOptions"
                        :valueKey="'id'"
                        :labelKey="'name'"
                        :includeAllOption="true"
                        allLabel="Все"
                        :castToNumber="true"
                    />
                </div>
            </div>
        </div>

        <!-- Карточки показателей в стиле EventList -->
        <div class="indicator-list">
            <div v-if="isLoading" class="p-4 text-center">Загрузка...</div>
            <template v-else>
                <div v-for="it in filteredItems" :key="it.id" class="card indicator-card mb-3">
                    <div class="card-header d-flex align-items-center justify-content-between gap-2 header-toggle" role="button" @click="toggleIndicator(it)">
                        <div class="d-flex flex-column flex-grow-1">
                            <div class="d-flex align-items-center gap-3 flex-wrap">
                                <div class="title-text flex-grow-1" :title="it.kpiName">{{ it.kpiName }}</div>
                            </div>
                            <div class="meta-row mt-1 d-flex align-items-center gap-3 flex-wrap">
                                <span class="d-inline-flex align-items-center gap-1">
                                    <Calendar class="icon-center" :title="'Срок реализации'" />
                                    <span class="meta-link" :title="'Срок реализации'" @click.stop="onClickYearRange(it)" role="button">{{ durationRange(it) }}</span>
                                </span>
                                <span class="d-inline-flex align-items-center gap-1">
                                    <Target class="icon-center" :title="'Блок мероприятий'" />
                                    <span class="meta-link" :title="'Блок мероприятий'" @click.stop="onClickBlock(it)" role="button">{{ it.block || 'Блок не указан' }}</span>
                                </span>
                                <span class="d-inline-flex align-items-center gap-1">
                                    <Bookmark class="icon-center" :title="'Категория целевых показателей'" />
                                    <span class="meta-link" :title="'Категория целевых показателей'" @click.stop="onClickCategory(it)" role="button">{{ it.description || it.categoryName || it.subcategoryName || '—' }}</span>
                                </span>
                                <span class="d-inline-flex align-items-center gap-1">
                                    <Ruler class="icon-center" :title="'Единица измерения'" />
                                    <span class="meta-link" :title="'Единица измерения'" @click.stop="onClickUnit(it)" role="button">{{ it.unit || '—' }}</span>
                                </span>
                                <span class="d-inline-flex align-items-center gap-2">
                                    <template v-if="it.responsibleAvatar">
                                        <img :src="it.responsibleAvatar" alt="avatar" class="avatar-img-small" :title="'Ответственный'" />
                                    </template>
                                    <template v-else>
                                        <DefaultAvatar :size="'small'" :title="'Ответственный'" />
                                    </template>
                                    <span class="meta-link" :title="'Ответственный'" @click.stop="onClickResponsible(it)" role="button">{{ it.responsibleName || 'Не указан' }}</span>
                                </span>
                            </div>
                        </div>
                        <div class="d-flex align-items-center gap-2">
                            <component :is="it._expanded ? ChevronUp : ChevronDown" class="icon-center" />
                        </div>
                    </div>

                    <div v-if="it._expanded" class="card-body pt-3 pb-3">
                        <div class="text-muted mb-2 years-th">Значения по годам:</div>
                        <template v-if="nonZeroYears(it).length">
                            <div class="row gx-1 gy-3">
                                <div v-for="year in nonZeroYears(it)" :key="year" class="col-4 col-sm-3 col-md-2 col-lg-2 d-flex flex-column align-items-center">
                                    <div class="year-label" :title="'Срок реализации'">{{ year }}</div>
                                    <div class="year-circle d-flex align-items-center justify-content-center" :title="'Срок реализации'">
                                        <span class="year-value">{{ displayYearValue(it, year) }}</span>
                                    </div>
                                </div>
                            </div>
                        </template>
                        <div v-else class="text-muted">Нет значений</div>
                    </div>
                </div>

                <div v-if="filteredItems.length === 0" class="empty-hint">Нет показателей по выбранным фильтрам</div>
            </template>
        </div>
    </div>
    
</template>

<script setup>
import { computed, ref } from 'vue'
import { onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import { apiClient } from '@/js/api/manager'
import { endpoints } from '@/js/api/endpoints'
import { ChevronDown, ChevronUp, Calendar, Target, Ruler, Bookmark } from 'lucide-vue-next'
import SelectBox from '@/components/SelectBox.vue'
import DefaultAvatar from '@/components/DefaultAvatar.vue'
import { getUserAvatar } from '@/js/userAvatar'

const props = defineProps({
    items: { type: Array, default: () => [] },
    yearsRange: { type: Array, default: () => [2023, 2032] },
    projects: { type: Array, default: () => [] },
    categories: { type: Array, default: () => ['Категория'] },
})

const projects = ref([])
const categories = computed(() => {
    const cats = Array.from(new Set(sourceItems.value.map(it => it.category).filter(Boolean)))
    return cats.length ? cats : ['А', 'Б']
})

const [startYear, endYear] = props.yearsRange
const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i)
const headerYears = years

const filters = ref({ projectId: null, year: null, category: null, unit: null, responsibleId: null })
// Доп. быстрые фильтры внутри списка
const quickFilters = ref({ block: null, unit: null })

const toast = useToast()
const internalItems = ref([])
const isLoading = ref(false)

const sourceItems = computed(() => internalItems.value)

const projectOptions = computed(() => {
    return projects.value.map(p => ({ id: p.id, name: p.name || p.title || 'Без названия' }))
})

const unitOptions = computed(() => {
    const set = new Set()
    for (const it of sourceItems.value) {
        if (it.unit) set.add(it.unit)
    }
    return Array.from(set)
})

const responsibleOptions = computed(() => {
    const map = new Map()
    for (const it of sourceItems.value) {
        const id = it.responsibleId
        const name = it.responsibleName
        if (id && name && !map.has(id)) map.set(id, name)
    }
    return Array.from(map, ([id, name]) => ({ id, name }))
})

function mapIndicatorToItem(it) {
    return {
        id: it.id,
        kpiName: it.name,
        description: it.description || it.category_description || it.category?.description || '',
        categoryName: it.category_name || it.category?.name || '',
        subcategoryName: it.subcategory_name || it.subcategory?.name || '',
        unit: it.unit,
        responsibleId: typeof it.responsible === 'object' ? (it.responsible?.id ?? null) : it.responsible ?? null,
        responsibleName: it.responsible_name || it.responsible?.name || null,
        responsibleAvatar: null,
        block: it.event_block_short_name || it.event_block?.code || it.event_block?.title || '—',
        values: it.values_by_year || {},
        category: it.category_letter || it.category?.code || 'Б',
        projectId: it.project || it.project_id || null,
    }
}

async function loadIndicatorsFromApi() {
    try {
        isLoading.value = true
        const resp = await apiClient.get(endpoints.project_ed.target_indicators.list)
        const data = Array.isArray(resp?.data) ? resp.data : (resp?.results || [])
        internalItems.value = data.map(mapIndicatorToItem)
        // Подтягиваем аватары ответственных
        const tasks = []
        for (const it of internalItems.value) {
            if (it.responsibleId) {
                tasks.push(
                    getUserAvatar(it.responsibleId).then(url => { it.responsibleAvatar = url || null }).catch(() => {})
                )
            }
        }
        if (tasks.length) await Promise.allSettled(tasks)
    } catch (e) {
        internalItems.value = []
        toast.error('Не удалось загрузить целевые показатели')
    } finally {
        isLoading.value = false
    }
}

onMounted(async () => {
    // всегда подгружаем из API актуальные данные
    await Promise.allSettled([
        loadIndicatorsFromApi(),
        (async () => {
            try {
                const resp = await apiClient.get(endpoints.project_ed.projects.list)
                projects.value = Array.isArray(resp?.data) ? resp.data : (resp?.results || [])
            } catch (_) { projects.value = [] }
        })()
    ])
})

const durationRange = (ev) => {
    const keys = Object.keys(ev.values || {}).map((k) => Number(k)).filter((n) => !Number.isNaN(n))
    if (keys.length) {
        return `${Math.min(...keys)} — ${Math.max(...keys)}`
    }
    return `${headerYears[0]} — ${headerYears[headerYears.length - 1]}`
}

function nonZeroYears(item) {
    const vals = item.values || {}
    const years = Object.keys(vals)
        .map(y => Number(y))
        .filter(y => Number.isFinite(y))
        .filter(y => {
            const v = vals[y]
            // скрываем нули и пустые строки
            if (v === '' || v === null || v === undefined) return false
            const num = Number(v)
            return !(Number.isFinite(num) && num === 0)
        })
    return years.sort((a, b) => a - b)
}

function displayYearValue(item, year) {
    const v = (item.values || {})[year]
    if (v === '' || v === null || v === undefined) return '—'
    return v
}

const filteredItems = computed(() => {
    return sourceItems.value.filter((ev) => {
        const byProject = !filters.value.projectId || ev.projectId === filters.value.projectId
        const byCategory = !filters.value.category || ev.category === filters.value.category
        const byYear = !filters.value.year || ev.values?.[filters.value.year] !== undefined
        const byBlock = !quickFilters.value.block || (ev.block && ev.block === quickFilters.value.block)
        const byUnit = !quickFilters.value.unit || (ev.unit && ev.unit === quickFilters.value.unit)
        const byUnitSelect = !filters.value.unit || ev.unit === filters.value.unit
        const byResponsible = !filters.value.responsibleId || ev.responsibleId === filters.value.responsibleId
        return byProject && byCategory && byYear && byBlock && byUnit && byUnitSelect && byResponsible
    })
})

function toggleIndicator(item) {
    item._expanded = !item._expanded
}

function onClickYearRange(item) {
    const keys = Object.keys(item.values || {}).map(k => Number(k)).filter(n => Number.isFinite(n))
    if (!keys.length) return
    const minY = Math.min(...keys)
    // если уже выбран этот год, сбросим, иначе установим начальный год
    filters.value.year = filters.value.year === minY ? null : minY
}

function onClickBlock(item) {
    if (!item.block) return
    quickFilters.value.block = quickFilters.value.block === item.block ? null : item.block
}

function onClickCategory(item) {
    const cat = item.category || item.categoryName || null
    if (!cat) return
    filters.value.category = filters.value.category === cat ? null : cat
}

function onClickUnit(item) {
    const u = item.unit || null
    if (!u) return
    quickFilters.value.unit = quickFilters.value.unit === u ? null : u
}

function onClickResponsible(item) {
    const rid = item.responsibleId || null
    if (!rid) return
    filters.value.responsibleId = filters.value.responsibleId === rid ? null : rid
}
</script>

<style scoped lang="scss">
.table-card {
    border: 1px solid var(--bs-border-color, #dee2e6);
    border-radius: .75rem;
    background-color: var(--color-primary-background);
}
.table-header { padding: .5rem; }
.th {
    width: 100%;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: .5rem .75rem;
    border-radius: .5rem;
    background-color: var(--color-primary-background);
    border: 1px solid var(--bs-border-color, #dee2e6);
    font-weight: 600;
}
.table-row { padding: .25rem .5rem .75rem .5rem; }
.cell {
    width: 100%;
    height: 44px;
    display: flex;
    align-items: center;
    padding: .5rem .75rem;
    border-radius: .5rem;
    background-color: var(--bs-secondary-bg, #f8f9fa);
    border: 1px solid var(--bs-border-color, #dee2e6);
}
.cell.text-center { justify-content: center; text-align: center; }
.empty-hint { padding: 1rem; text-align: center; color: var(--color-secondary-text); }
.filters.card { background-color: var(--color-primary-background); border-color: var(--bs-border-color, #dee2e6); }
.filters .select-box, .filters .form-select { font-size: 0.9rem; }
.years-th span { font-weight: 600; }
/* Перенос длинных заголовков показателей */
.title-text {
    font-weight: 600;
    overflow: hidden;
    white-space: normal;
    word-break: break-word;
}
.meta-row { font-size: 14px; color: var(--color-secondary-text); }
.meta-row .icon-center { width: 14px; height: 14px; }
.meta-link { cursor: pointer; text-decoration: none; border-bottom: 1px dashed transparent; }
.meta-link:hover { text-decoration: underline; }
.avatar-img-small { width: 20px; height: 20px; border-radius: 50%; object-fit: cover; }

/* Кружки для значений по годам */
.year-label { font-size: 12px; color: var(--color-secondary-text); margin-bottom: .15rem; }
.year-circle {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background-color: var(--bs-secondary-bg, #f8f9fa);
    border: 1px solid var(--bs-border-color, #dee2e6);
}
.year-value { font-weight: 600; font-size: 12px; }
</style>