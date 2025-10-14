<template>
    <div class="page-container">
        <HeaderBar />
        <Breadcrumbs :items="breadcrumbItems" class="mt-3" />
        <div class="page-content">
            <div class="d-flex align-items-start justify-content-between mb-1">
                <div>
                    <h3 class="mb-1">{{ blockTitle || 'Блок мероприятий' }}</h3>
                    <div v-if="blockData?.subcategory_name" class="mt-1">
                        <span class="badge subcategory-badge breadcrumb-link-color">{{ blockData.subcategory_name }}</span>
                    </div>
                </div>
            </div>

            <div v-if="isLoading" class="card p-4 text-center">
                <div class="d-flex flex-column align-items-center justify-content-center my-2">
                    <div class="spinner-border text-primary mb-3" role="status">
                        <span class="visually-hidden">Загрузка...</span>
                    </div>
                    <h5 class="mb-1">Загрузка данных...</h5>
                </div>
            </div>

            <template v-else>
                <div class="d-flex align-items-center justify-content-between">
                    <div class="btn-toolbar w-100" role="toolbar" aria-label="Toolbar">
                        <div class="input-group input-group-sm me-2 flex-grow-1">
                            <span class="input-group-text d-inline-flex align-items-center justify-content-center">
                                <Search :size="14" />
                            </span>
                            <input type="text" class="form-control" v-model="searchQuery" placeholder="Код или наименование" />
                        </div>
                        <div class="d-flex align-items-center me-2 gap-2" aria-label="Year filters">
                            <select class="form-select form-select-sm" v-model="filterStartYear">
                                <option :value="null">с года</option>
                                <option v-for="year in yearsOptions" :key="'f-start-' + year" :value="year">{{ year }}</option>
                            </select>
                            <select class="form-select form-select-sm" v-model="filterEndYear">
                                <option :value="null">по год</option>
                                <option v-for="year in yearsOptions" :key="'f-end-' + year" :value="year">{{ year }}</option>
                            </select>
                        </div>
                        <div class="btn-group ms-auto" role="group" aria-label="Actions">
                            <button class="btn btn-outline-primary btn-sm d-inline-flex align-items-center" @click="openCreateEventModal()">
                                <Plus :size="14" class="me-2" />
                                Создать мероприятие
                            </button>
                        </div>
                    </div>
                </div>

                <div class="card p-3">
                    <div class="table-responsive">
                        <table class="table table-hover align-middle">
                            <thead>
                                <tr>
                                    <th>Наименование мероприятия</th>
                                    <th style="width: 120px;" class="text-end"></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-if="events.length === 0">
                                    <td colspan="2" class="text-center text-muted py-4">Здесь еще пока нет мероприятий</td>
                                </tr>
                                <tr v-for="ev in sortedEvents" :key="ev.id || ev.code" class="table-row-link table-row-actions" @click="openEvent(ev)">
                                    <td>
                                        <div class="fw-semibold">{{ ev.name || '—' }}</div>
                                        <div class="small" :style="{ color: 'var(--color-secondary-text, #6c757d)' }">
                                            <span>{{ ev.code || '—' }}</span>
                                            <span v-if="ev.code && (ev.start_year || ev.end_year || ev.years_display)"> · </span>
                                            <span>{{ ev.years_display || formatYears(ev.start_year, ev.end_year) }}</span>
                                        </div>
                                    </td>
                                    <td class="text-end">
                                        <div class="row-actions d-inline-flex gap-2">
                                            <button class="btn btn-outline-secondary btn-sm d-inline-flex align-items-center justify-content-center" @click.stop="openEditEventModal(ev)" :title="'Редактировать'" aria-label="Редактировать">
                                                <Pencil :size="16" />
                                            </button>
                                            <button class="btn btn-outline-danger btn-sm d-inline-flex align-items-center justify-content-center" @click.stop="removeEvent(ev)" :title="'Удалить'" aria-label="Удалить">
                                                <Trash2 :size="16" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </template>
        </div>
    </div>

    <!-- Модальное окно создания мероприятия -->
    <div v-if="isCreateEventModalOpen" class="modal d-block" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Создание мероприятия</h5>
                    <button type="button" class="btn-close" aria-label="Close" @click="closeCreateEventModal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label">Код мероприятия</label>
                        <input v-model="generatedEventCode" type="text" class="form-control" readonly />
                        <div class="form-text">Код генерируется автоматически на основе кода блока</div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Наименование мероприятия</label>
                        <input v-model="newEventName" type="text" class="form-control" placeholder="Название мероприятия" />
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Основные результаты</label>
                        <textarea v-model="newEventResults" class="form-control" rows="4" placeholder="Каждый результат — с новой строки" style="resize: vertical;"></textarea>
                        <div class="form-text">Вводите каждый результат на новой строке. Пустые строки будут игнорироваться.</div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Срок реализации (годы)</label>
                        <div class="row g-2">
                            <div class="col-6">
                                <select v-model="selectedStartYear" class="form-select">
                                    <option v-for="year in yearsOptions" :key="`start-` + year" :value="year">{{ year }}</option>
                                </select>
                            </div>
                            <div class="col-6">
                                <select v-model="selectedEndYear" class="form-select">
                                    <option v-for="year in yearsOptions" :key="`end-` + year" :value="year">{{ year }}</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-text">Выберите годы начала и окончания. Конечный год не раньше начального.</div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-secondary" @click="closeCreateEventModal">Отмена</button>
                    <button type="button" class="btn btn-primary" @click="createEventFromModal">Создать</button>
                </div>
            </div>
        </div>
    </div>
    <div v-if="isCreateEventModalOpen" class="modal-backdrop fade show"></div>

    <!-- Модальное окно редактирования мероприятия -->
    <div v-if="isEditEventModalOpen" class="modal d-block" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Редактирование мероприятия</h5>
                    <button type="button" class="btn-close" aria-label="Close" @click="closeEditEventModal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label">Код мероприятия</label>
                        <input v-model="editEventCode" type="text" class="form-control" readonly />
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Наименование мероприятия</label>
                        <input v-model="editEventName" type="text" class="form-control" placeholder="Название мероприятия" />
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Основные результаты</label>
                        <textarea v-model="editEventResults" class="form-control" rows="4" placeholder="Каждый результат — с новой строки" style="resize: vertical;"></textarea>
                        <div class="form-text">Вводите каждый результат на новой строке. Пустые строки будут игнорироваться.</div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Срок реализации (годы)</label>
                        <div class="row g-2">
                            <div class="col-6">
                                <select v-model="editSelectedStartYear" class="form-select">
                                    <option v-for="year in yearsOptions" :key="`edit-start-` + year" :value="year">{{ year }}</option>
                                </select>
                            </div>
                            <div class="col-6">
                                <select v-model="editSelectedEndYear" class="form-select">
                                    <option v-for="year in yearsOptions" :key="`edit-end-` + year" :value="year">{{ year }}</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-text">Выберите годы начала и окончания. Конечный год не раньше начального.</div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-secondary" @click="closeEditEventModal">Отмена</button>
                    <button type="button" class="btn btn-primary" @click="updateEventFromModal">Сохранить</button>
                </div>
            </div>
        </div>
    </div>
    <div v-if="isEditEventModalOpen" class="modal-backdrop fade show"></div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { Home, Wrench, Target, Plus, Pencil, Trash2, Search } from 'lucide-vue-next'
import Breadcrumbs from '@/modules/crm/project-ed/components/Breadcrumbs.vue'
import HeaderBar from '@/modules/crm/project-ed/components/HeaderBar.vue'
import { apiClient } from '@/js/api/manager'
import { endpoints } from '@/js/api/endpoints'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const blockId = computed(() => route.params.id)
const isLoading = ref(false)
const blockData = ref(null)
const events = ref([])
const isCreateEventModalOpen = ref(false)
const newEventName = ref('')
const newEventResults = ref('')
const selectedStartYear = ref(new Date().getFullYear())
const selectedEndYear = ref(new Date().getFullYear())
const generatedEventCode = ref('')
// Редактирование мероприятия
const isEditEventModalOpen = ref(false)
const editingEvent = ref(null)
const editEventCode = ref('')
const editEventName = ref('')
const editEventResults = ref('')
const editSelectedStartYear = ref(new Date().getFullYear())
const editSelectedEndYear = ref(new Date().getFullYear())
const yearsOptions = computed(() => {
    const start = 2023
    const end = new Date().getFullYear() + 10
    const list = []
    for (let y = start; y <= end; y++) list.push(y)
    return list
})

// Поиск и фильтры
const searchQuery = ref('')
const filterStartYear = ref(null)
const filterEndYear = ref(null)

const filteredEvents = computed(() => {
    const list = Array.isArray(events.value) ? events.value : []
    const q = String(searchQuery.value || '').trim().toLowerCase()
    const fs = filterStartYear.value ? Number(filterStartYear.value) : null
    const fe = filterEndYear.value ? Number(filterEndYear.value) : null

    return list.filter(ev => {
        const name = String(ev?.name || '').toLowerCase()
        const code = String(ev?.code || '').toLowerCase()
        const matchesQuery = q ? (name.includes(q) || code.includes(q)) : true

        const es = Number(ev?.start_year) || null
        const ee = Number(ev?.end_year) || null
        // условие пересечения интервалов [es, ee] и [fs, fe]
        let matchesYears = true
        if (fs !== null && fe !== null) {
            if (es !== null && ee !== null) {
                matchesYears = es <= fe && ee >= fs
            } else if (es !== null && ee === null) {
                matchesYears = es <= fe
            } else if (es === null && ee !== null) {
                matchesYears = ee >= fs
            } else {
                matchesYears = true
            }
        } else if (fs !== null && fe === null) {
            if (ee !== null) {
                matchesYears = ee >= fs
            } else if (es !== null) {
                matchesYears = es >= fs
            } else {
                matchesYears = true
            }
        } else if (fs === null && fe !== null) {
            if (es !== null) {
                matchesYears = es <= fe
            } else if (ee !== null) {
                matchesYears = ee <= fe
            } else {
                matchesYears = true
            }
        }

        return matchesQuery && matchesYears
    })
})

// Отсортированный список мероприятий по возрастанию номера (П1.1, П1.2, ...)
const sortedEvents = computed(() => {
    const list = [...filteredEvents.value]
    const blockCode = blockData.value?.code || ''
    return list.sort((a, b) => {
        const na = extractEventOrder(a?.code, blockCode)
        const nb = extractEventOrder(b?.code, blockCode)
        if (na !== nb) return na - nb
        // fallback по имени, затем по id
        const an = (a?.name || '').localeCompare(b?.name || '')
        if (an !== 0) return an
        return (a?.id || 0) - (b?.id || 0)
    })
})

const breadcrumbItems = ref([
    { label: 'Главная', icon: Home, to: { name: 'ProjectEdMain' } },
    { label: 'Служебная страница', icon: Wrench, to: { name: 'ProjectEdTechnical' } },
    { label: 'Программа развития БГТУ', icon: Target, to: { name: 'ProjectEdProgramDevelopment' } },
    { label: 'Блок мероприятий' }
])

const blockTitle = computed(() => {
    const code = blockData.value?.code
    const title = blockData.value?.title
    if (!code && !title) return ''
    return code ? `${code}. ${title || ''}` : (title || '')
})

onMounted(async () => {
    await loadBlock()
})

async function loadBlock() {
    if (!blockId.value) return
    isLoading.value = true
    try {
        const [blockResp, eventsResp] = await Promise.all([
            apiClient.get(endpoints.project_ed.event_blocks.detail(blockId.value)),
            apiClient.get(endpoints.project_ed.event_blocks.events(blockId.value))
        ])
        blockData.value = blockResp.data || null
        events.value = Array.isArray(eventsResp.data) ? eventsResp.data : (eventsResp.data?.results || [])

        // Обновляем последний элемент хлебных крошек: "Блок мероприятий КОД"
        const last = breadcrumbItems.value[breadcrumbItems.value.length - 1]
        if (last) {
            const code = blockData.value?.code
            last.label = code ? `Блок мероприятий ${code}` : 'Блок мероприятий'
        }
    } catch (error) {
        const apiMsg = error?.response?.data?.detail
            || (typeof error?.response?.data === 'string' ? error.response.data : null)
            || (error?.response?.data && JSON.stringify(error.response.data))
            || error?.message
            || 'Неизвестная ошибка'
        toast.error(`Ошибка загрузки блока: ${apiMsg}`)
    } finally {
        isLoading.value = false
    }
}

function formatYears(start, end) {
    if (!start && !end) return '—'
    if (start && end) return `${start} — ${end}`
    return start || end || '—'
}

function openEvent(ev) {
    if (!ev || !ev.id) return
    router.push({ name: 'ProjectEdEvent', params: { id: ev.id } })
}

function openEditEventModal(ev) {
    if (!ev || !ev.id) return
    editingEvent.value = ev
    editEventCode.value = ev.code || ''
    editEventName.value = ev.name || ''
    editEventResults.value = (ev.results || '').toString()
    editSelectedStartYear.value = Number(ev.start_year) || new Date().getFullYear()
    editSelectedEndYear.value = Number(ev.end_year) || new Date().getFullYear()
    isEditEventModalOpen.value = true
}

function closeEditEventModal() {
    isEditEventModalOpen.value = false
    editingEvent.value = null
}

async function updateEventFromModal() {
    if (!editingEvent.value?.id) return
    if (!editEventName.value.trim()) {
        toast.warning('Введите наименование мероприятия')
        return
    }
    if (editSelectedEndYear.value < editSelectedStartYear.value) {
        toast.warning('Конечный год не может быть раньше начального')
        return
    }

    const resultsNormalized = (editEventResults.value || '')
        .split(/\r?\n/)
        .map(s => s.trim())
        .filter(Boolean)
        .join('\n')

    const payload = {
        name: editEventName.value.trim(),
        results: resultsNormalized,
        start_year: Number(editSelectedStartYear.value),
        end_year: Number(editSelectedEndYear.value),
    }

    try {
        const resp = await apiClient.patch(endpoints.project_ed.events.patch(editingEvent.value.id), payload)
        const idx = events.value.findIndex(e => e.id === editingEvent.value.id)
        if (idx !== -1) {
            events.value[idx] = resp.data
        }
        toast.success('Мероприятие обновлено')
        isEditEventModalOpen.value = false
        editingEvent.value = null
    } catch (error) {
        const apiMsg = error?.response?.data?.detail
            || (typeof error?.response?.data === 'string' ? error.response.data : null)
            || (error?.response?.data && JSON.stringify(error.response.data))
            || error?.message
            || 'Неизвестная ошибка'
        toast.error(`Ошибка сохранения: ${apiMsg}`)
    }
}

async function removeEvent(ev) {
    if (!ev || !ev.id) return
    try {
        await apiClient.delete(endpoints.project_ed.events.delete(ev.id))
        const idx = events.value.findIndex(e => e.id === ev.id)
        if (idx !== -1) events.value.splice(idx, 1)
        toast.success('Мероприятие удалено')
    } catch (error) {
        const apiMsg = error?.response?.data?.detail
            || (typeof error?.response?.data === 'string' ? error.response.data : null)
            || (error?.response?.data && JSON.stringify(error.response.data))
            || error?.message
            || 'Неизвестная ошибка'
        toast.error(`Ошибка удаления: ${apiMsg}`)
    }
}

function extractEventOrder(code, blockCode) {
    if (!code) return Number.POSITIVE_INFINITY
    // ожидаемый формат: `${blockCode}.N` -> берем N
    if (blockCode && code.startsWith(blockCode + '.')) {
        const part = code.slice(blockCode.length + 1)
        const num = parseInt(part, 10)
        return Number.isFinite(num) ? num : Number.POSITIVE_INFINITY
    }
    // общий случай: ищем последнее число в коде
    const m = String(code).match(/(\d+)(?!.*\d)/)
    if (m) {
        const num = parseInt(m[1], 10)
        return Number.isFinite(num) ? num : Number.POSITIVE_INFINITY
    }
    return Number.POSITIVE_INFINITY
}

// Создание мероприятия
function openCreateEventModal() {
    if (!blockData.value?.id) return
    newEventName.value = ''
    newEventResults.value = ''
    const nowYear = new Date().getFullYear()
    selectedStartYear.value = nowYear
    selectedEndYear.value = nowYear
    generatedEventCode.value = generateNextEventCode()
    isCreateEventModalOpen.value = true
}

function closeCreateEventModal() {
    isCreateEventModalOpen.value = false
}

function generateNextEventCode() {
    const code = blockData.value?.code
    if (!code) return ''
    let maxNum = 0
    for (const ev of events.value || []) {
        if (!ev?.code) continue
        const m = String(ev.code).match(new RegExp(`^${code}\\\.(\\d+)$`))
        if (m) {
            const num = parseInt(m[1], 10)
            if (Number.isFinite(num)) maxNum = Math.max(maxNum, num)
        }
    }
    return `${code}.${maxNum + 1}`
}

async function createEventFromModal() {
    if (!blockData.value?.id) return
    if (!newEventName.value.trim()) {
        toast.warning('Введите наименование мероприятия')
        return
    }
    if (selectedEndYear.value < selectedStartYear.value) {
        toast.warning('Конечный год не может быть раньше начального')
        return
    }

    // Нормализуем результаты: по строкам, без пустых
    const resultsNormalized = (newEventResults.value || '')
        .split(/\r?\n/)
        .map(s => s.trim())
        .filter(Boolean)
        .join('\n')

    const eventData = {
        block: blockData.value.id,
        code: (generatedEventCode.value || '').trim(),
        name: newEventName.value.trim(),
        results: resultsNormalized,
        start_year: Number(selectedStartYear.value),
        end_year: Number(selectedEndYear.value)
    }

    try {
        const response = await apiClient.post(endpoints.project_ed.events.create, eventData)
        events.value.push(response.data)
        toast.success('Мероприятие создано')
        closeCreateEventModal()
    } catch (error) {
        const apiMsg = error?.response?.data?.detail
            || (typeof error?.response?.data === 'string' ? error.response.data : null)
            || (error?.response?.data && JSON.stringify(error.response.data))
            || error?.message
            || 'Неизвестная ошибка'
        toast.error(`Ошибка сохранения мероприятия: ${apiMsg}`)
    }
}
</script>

<style scoped lang="scss">
.page-container { display: flex; flex-direction: column; height: 100%; }
.page-content { flex: 1; display: flex; flex-direction: column; gap: 1rem; }
.table-row-link { cursor: pointer; transition: background-color .15s ease; }
.table-row-link:hover { background-color: var(--color-hover-background, #f8f9fa); }
.modal-backdrop { z-index: 1040; }
.modal.d-block { z-index: 1050; }

/* Кнопки действий в строке показываются только при наведении */
.table-row-actions .row-actions { visibility: hidden; opacity: 0; transition: opacity .15s ease; }
.table-row-actions:hover .row-actions { visibility: visible; opacity: 1; }

/* Стили баджа подкатегории в одном стиле с ProgramDevelopmentPage.vue */
.subcategory-badge {
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
    vertical-align: middle;
}

.breadcrumb-link-color {
    color: var(--color-primary-text, var(--bs-body-color, #212529)) !important;
    background-color: rgba(13, 110, 253, 0.12);
    border: 1px solid rgba(13, 110, 253, 0.25);
}
</style>