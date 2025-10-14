<template>
    <div class="page-container">
        <HeaderBar />
        <Breadcrumbs :items="breadcrumbItems" class="mt-3" />
        <div class="page-content">
            <div class="d-flex align-items-center justify-content-between">
                <h3 class="mb-0">Программа развития БГТУ</h3>
            </div>

            <div class="d-flex align-items-center mb-3" v-if="blocks.length > 0">
                <h5 class="mb-0 me-3">Блоки мероприятий</h5>
                <div class="d-flex gap-2">
                    <div 
                        class="button-create" 
                        role="button" 
                        aria-label="Добавить блок"
                        @click="openCreateModal"
                    >
                        <Plus :size="18" />
                        <span>Добавить блок</span>
                    </div>
                </div>
            </div>

            <div v-if="blocks.length > 0" class="card p-3">
                <div class="row g-2 align-items-center w-100">
                    <div class="col-12 col-md-6">
                        <label for="searchQuery" class="form-label mb-1">Поиск</label>
                        <div class="input-group w-100">
                            <span class="input-group-text" id="search-addon" aria-hidden="true">
                                <Search :size="18" />
                            </span>
                            <input
                                id="searchQuery"
                                type="text"
                                class="form-control"
                                v-model.trim="searchQuery"
                                placeholder="Поиск по коду, названию, описанию"
                                aria-label="Строка поиска по коду, названию и описанию"
                                aria-describedby="search-addon"
                            />
                        </div>
                    </div>
                    <div class="col-12 col-md-4">
                        <label for="subcategorySelect" class="form-label mb-1">Наименование политики/стратегического проекта</label>
                        <select
                            id="subcategorySelect"
                            class="form-select policy-select"
                            v-model="selectedSubcategoryId"
                            :disabled="availableSubcategories.length === 0"
                            aria-label="Фильтр по наименованию политики/стратегического проекта"
                        >
                            <option :value="null">Все политики</option>
                            <option
                                v-for="sub in availableSubcategories"
                                :key="sub.id ?? 'null'"
                                :value="sub.id"
                            >
                                {{ sub.name || 'Без политики' }}
                            </option>
                        </select>
                    </div>
                    <div class="col-6 col-md-1">
                        <label for="startYearSelect" class="form-label mb-1">Срок с</label>
                        <select
                            id="startYearSelect"
                            class="form-select"
                            v-model.number="filterStartYear"
                            aria-label="Фильтр по году начала"
                        >
                            <option :value="null">—</option>
                            <option v-for="year in yearsOptions" :key="'s-' + year" :value="year">{{ year }}</option>
                        </select>
                    </div>
                    <div class="col-6 col-md-1">
                        <label for="endYearSelect" class="form-label mb-1">Срок по</label>
                        <select
                            id="endYearSelect"
                            class="form-select"
                            v-model.number="filterEndYear"
                            aria-label="Фильтр по году окончания"
                        >
                            <option :value="null">—</option>
                            <option v-for="year in yearsOptions" :key="'e-' + year" :value="year">{{ year }}</option>
                        </select>
                    </div>
                </div>
            </div>

            <div v-else-if="isLoading" class="card p-4 text-center">
                <div class="d-flex flex-column align-items-center justify-content-center my-2">
                    <div class="spinner-border text-primary mb-3" role="status">
                        <span class="visually-hidden">Загрузка...</span>
                    </div>
                    <h5 class="mb-1">Загрузка данных...</h5>
                </div>
            </div>
            <div v-else class="card p-4 text-center">
                <div class="d-flex flex-column align-items-center justify-content-center my-2">
                    <Inbox :size="48" class="mb-2" />
                    <h5 class="mb-1">Пока нет блоков мероприятий</h5>
                    <p class="text-muted mb-3">Создайте первый блок МП, чтобы начать работу.</p>
                    <div class="d-flex gap-2">
                        <button class="btn btn-primary" @click="openCreateModal">Создать блок</button>
                        <button class="btn btn-outline-primary" @click="goToImport">Импортировать</button>
                    </div>
                </div>
            </div>

            <div v-for="block in filteredBlocks" :key="block.id" class="card p-3 mb-3 block-card block-card-click position-relative" @click="goToBlock(block.id)" role="button" :aria-label="`Открыть блок ${block.code || ''}`.trim()">
                <div class="block-actions-overlay">
                    <div class="d-flex justify-content-end gap-2">
                        <button class="btn btn-secondary btn-sm" @click.stop="editBlockById(block.id)">Редактировать</button>
                        <button class="btn btn-danger btn-sm" @click.stop="removeBlockById(block.id)">Удалить</button>
                    </div>
                </div>
                <div class="d-flex justify-content-between">
                    <div class="flex-grow-1">
                        <div class="text-muted small mb-1">
                            <span 
                                v-if="block.subcategory_name"
                                class="badge subcategory-badge breadcrumb-link-color" 
                                :title="block.subcategory_name"
                            >
                                {{ block.subcategory_name }}
                            </span>
                        </div>
                        <h6 class="mb-0"><router-link :to="{ name: 'ProjectEdEventBlock', params: { id: block.id } }" class="text-decoration-none block-title-link">{{ block.code ? `${block.code}. ${block.title}` : block.title }}</router-link></h6>
                    </div>
                    <div class="d-flex gap-2 align-items-start"></div>
                </div>

                
            </div>
        </div>
    </div>

    <BlockModal
        :is-open="isCreateModalOpen || isEditModalOpen"
        :is-edit-mode="isEditModalOpen"
        :block-data="editingBlockData"
        @close="closeModals"
        @save="handleBlockSave"
    />

    
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { Home, Target, Wrench, Inbox, Plus, Pencil, Trash2, Search } from 'lucide-vue-next'
import HeaderBar from '@/modules/crm/project-ed/components/HeaderBar.vue'
import Breadcrumbs from '@/modules/crm/project-ed/components/Breadcrumbs.vue'
import BlockModal from '@/modules/crm/project-ed/components/BlockModal.vue'
import { apiClient } from '@/js/api/manager'
import { endpoints } from '@/js/api/endpoints'

const router = useRouter()

const breadcrumbItems = ref([
    { label: 'Главная', icon: Home, to: { name: 'ProjectEdMain' } },
    { label: 'Служебная страница', icon: Wrench, to: { name: 'ProjectEdTechnical' } },
    { label: 'Программа развития БГТУ', icon: Target }
])

const blocks = ref([])
const searchQuery = ref('')
const selectedCategoryId = ref(null)
const selectedSubcategoryId = ref(null)
const filterStartYear = ref(null)
const filterEndYear = ref(null)
const isCreateModalOpen = ref(false)
const isEditModalOpen = ref(false)
const editingBlockData = ref({})
const isLoading = ref(false)
// Сортировка блоков по коду (А-Я, 0-9) по возрастанию
function normalizeCode(code) {
    return (code ?? '').toString().trim()
}

function compareBlocksByCode(a, b) {
    const aCode = normalizeCode(a?.code)
    const bCode = normalizeCode(b?.code)
    if (!aCode && !bCode) return 0
    if (!aCode) return 1
    if (!bCode) return -1
    return aCode.localeCompare(bCode, ['ru', 'en'], { numeric: true, sensitivity: 'base' })
}


// Состояние модального окна создания мероприятия
// функционал добавления мероприятий перенесён на страницу блока

const toast = useToast()

// Загрузка данных при монтировании компонента
onMounted(async () => {
    await loadBlocks()
})

// Загрузка блоков мероприятий с сервера
async function loadBlocks() {
    isLoading.value = true
    try {
        // Попробуем загрузить блоки мероприятий
        const apiUrl = endpoints.project_ed.event_blocks.list
        const response = await apiClient.get(apiUrl)
        blocks.value = (response.data || []).slice().sort(compareBlocksByCode)
        // Подгружаем мероприятия для каждого блока, чтобы работала фильтрация по срокам
        const tasks = blocks.value.map(async (b) => {
            if (!b?.id) { b.events = []; return }
            try {
                const evResp = await apiClient.get(endpoints.project_ed.event_blocks.events(b.id))
                const evs = Array.isArray(evResp?.data) ? evResp.data : (evResp?.data?.results || [])
                b.events = evs
            } catch (_) {
                b.events = []
            }
        })
        if (tasks.length) await Promise.allSettled(tasks)
    } catch (error) {
        // Временно показываем пустой массив, чтобы страница загрузилась
        blocks.value = []
        
        if (error.response?.status === 404) {
            toast.error('API эндпоинт не найден. Эндпоинт: ' + (error?.config?.url || ''))
        } else if (error.response?.status === 500) {
            toast.error('Ошибка сервера. Проверьте логи API.')
        } else if (error.response?.status === 403) {
            toast.error('Нет доступа к API. Проверьте авторизацию.')
        } else {
            toast.error(`Ошибка загрузки данных: ${error.response?.data?.detail || error.message}`)
        }
    } finally {
        isLoading.value = false
    }
}

// Доступные категории для фильтра
const availableCategories = computed(() => {
    const map = new Map()
    blocks.value.forEach(b => {
        const id = b?.category ?? null
        const name = b?.category_name ?? (id === null ? 'Без категории' : '')
        const key = id === null ? 'null' : String(id)
        if (!map.has(key)) {
            map.set(key, { id, name })
        }
    })
    // Убираем вариант null, если его не должно быть в списке — но оставим, чтобы пользователь мог видеть «Без категории»
    return Array.from(map.values()).filter(Boolean)
})

// Доступные подкатегории зависят от выбранной категории
const availableSubcategories = computed(() => {
    const filteredByCategory = selectedCategoryId.value == null
        ? blocks.value
        : blocks.value.filter(b => b?.category === selectedCategoryId.value)
    const map = new Map()
    filteredByCategory.forEach(b => {
        const id = b?.subcategory ?? null
        const name = b?.subcategory_name ?? (id === null ? 'Без подкатегории' : '')
        const key = id === null ? 'null' : String(id)
        if (!map.has(key)) {
            map.set(key, { id, name })
        }
    })
    return Array.from(map.values()).filter(Boolean)
})

// Отфильтрованные блоки
const filteredBlocks = computed(() => {
    const q = (searchQuery.value || '').toString().trim().toLowerCase()
    const byCategory = selectedCategoryId.value
    const bySubcategory = selectedSubcategoryId.value
    const fyStart = filterStartYear.value != null ? Number(filterStartYear.value) : null
    const fyEnd = filterEndYear.value != null ? Number(filterEndYear.value) : null

    return blocks.value.filter(b => {
        const matchesCategory = byCategory == null ? true : b?.category === byCategory
        const matchesSubcategory = bySubcategory == null ? true : b?.subcategory === bySubcategory
        const hay = [b?.code, b?.title, b?.description].filter(Boolean).join(' ').toLowerCase()
        const matchesQuery = q === '' ? true : hay.includes(q)
        // Проверка по годам: оставляем блок, если ХОТЯ БЫ ОДНО мероприятие пересекается по срокам с фильтром
        let matchesYears = true
        if (fyStart !== null || fyEnd !== null) {
            const fs = fyStart ?? Number.NEGATIVE_INFINITY
            const fe = fyEnd ?? Number.POSITIVE_INFINITY
            const events = Array.isArray(b?.events) ? b.events : []
            if (events.length === 0) {
                matchesYears = false
            } else {
                matchesYears = events.some(ev => {
                    const es = Number(ev?.start_year)
                    const ee = Number(ev?.end_year)
                    if (Number.isFinite(es) && Number.isFinite(ee)) {
                        return es <= fe && ee >= fs
                    }
                    if (Number.isFinite(es) && !Number.isFinite(ee)) {
                        // если нет конца, считаем событие действующим с es и далее
                        return es <= fe
                    }
                    if (!Number.isFinite(es) && Number.isFinite(ee)) {
                        // если нет начала, считаем событие действующим до ee
                        return ee >= fs
                    }
                    // если нет обоих, попробуем распарсить years_display вида "2024 — 2026"
                    const txt = String(ev?.years_display || '').trim()
                    const m = txt.match(/(\d{4}).*?(\d{4})/)
                    if (m) {
                        const ts = Number(m[1])
                        const te = Number(m[2])
                        if (Number.isFinite(ts) && Number.isFinite(te)) {
                            return ts <= fe && te >= fs
                        }
                    }
                    return false
                })
            }
        }
        return matchesCategory && matchesSubcategory && matchesQuery && matchesYears
    })
})

// Опции лет: с 2023 по текущий + 10
const yearsOptions = computed(() => {
    const start = 2023
    const end = new Date().getFullYear() + 10
    const arr = []
    for (let y = start; y <= end; y++) arr.push(y)
    return arr
})

// Создание блока мероприятий
async function addBlock(blockData) {
    try {
        // Подготавливаем данные для API
        const apiData = {
            code: blockData.code || '',
            title: blockData.title,
            description: blockData.description || '',
            category: blockData.categoryId || null,
            subcategory: blockData.subcategoryId || null
        }
        
        const response = await apiClient.post(endpoints.project_ed.event_blocks.create, apiData)
        blocks.value.push(response.data)
        blocks.value.sort(compareBlocksByCode)
        toast.success('Блок мероприятий создан')
    } catch (error) {
        toast.error('Ошибка создания блока')
    }
}

// Редактирование блока мероприятий
function editBlock(index) {
    const block = blocks.value[index]
    editingBlockData.value = { 
        ...block, 
        index,
        categoryId: block.category || null,
        subcategoryId: block.subcategory || null
    }
    isEditModalOpen.value = true
}

// Удаление блока мероприятий
async function removeBlock(index) {
    const block = blocks.value[index]
    if (!block.id) {
        blocks.value.splice(index, 1)
        return
    }

    try {
        await apiClient.delete(endpoints.project_ed.event_blocks.delete(block.id))
        blocks.value.splice(index, 1)
        toast.success('Блок мероприятий удален')
    } catch (error) {
        toast.error('Ошибка удаления блока')
    }
}

// Удаление мероприятия
async function removeEvent(blockIndex, eventIndex) {
    const block = blocks.value[blockIndex]
    const event = block.events[eventIndex]
    
    if (!event.id) {
        block.events.splice(eventIndex, 1)
        return
    }

    try {
        await apiClient.delete(endpoints.project_ed.events.delete(event.id))
        
        // Удаляем мероприятие из локального состояния
        block.events.splice(eventIndex, 1)
        
        // Перезагружаем данные для синхронизации с сервером
        await loadBlocks()
        
        toast.success('Мероприятие удалено')
    } catch (error) {
        toast.error('Ошибка удаления мероприятия')
    }
}

// Обертки для работы по id с учетом сортировки
function findBlockIndexById(blockId) {
    return blocks.value.findIndex(b => b.id === blockId)
}

function removeEventById(blockId, eventIndex) {
    const index = findBlockIndexById(blockId)
    if (index === -1) return
    removeEvent(index, eventIndex)
}

function editBlockById(blockId) {
    const index = findBlockIndexById(blockId)
    if (index === -1) return
    editBlock(index)
}

async function removeBlockById(blockId) {
    const index = findBlockIndexById(blockId)
    if (index === -1) return
    await removeBlock(index)
}

function openCreateModal() {
    isCreateModalOpen.value = true
}

function closeModals() {
    isCreateModalOpen.value = false
    isEditModalOpen.value = false
    editingBlockData.value = {}
}

async function handleBlockSave(blockData) {
    if (isEditModalOpen.value) {
        // Режим редактирования
        const blockIndex = editingBlockData.value.index
        const block = blocks.value[blockIndex]
        
        if (blockIndex >= 0 && blockIndex < blocks.value.length && block.id) {
            try {
                // Подготавливаем данные для API
                const apiData = {
                    code: blockData.code || '',
                    title: blockData.title,
                    description: blockData.description || '',
                    category: blockData.categoryId || null,
                    subcategory: blockData.subcategoryId || null
                }
                
                const response = await apiClient.patch(endpoints.project_ed.event_blocks.patch(block.id), apiData)
                blocks.value[blockIndex] = response.data
                blocks.value.sort(compareBlocksByCode)
                
                // Перезагружаем данные для получения обновленных кодов мероприятий
                await loadBlocks()
                
                toast.success('Блок мероприятий обновлен')
            } catch (error) {
                toast.error('Ошибка обновления блока')
                return
            }
        }
    } else {
        // Режим создания
        await addBlock(blockData)
    }
    closeModals()
}

// Генерация кода мероприятия на основе кода блока
function generateEventCode(blockId) {
    const blockIndex = findBlockIndexById(blockId)
    if (blockIndex === -1) return ''
    
    const block = blocks.value[blockIndex]
    // Используем поле code блока напрямую
    const blockCode = block.code
    if (!blockCode) return ''
    
    const existingEvents = block.events || []
    
    // Находим максимальный номер мероприятия в блоке
    let maxNumber = 0
    existingEvents.forEach(event => {
        if (event.code) {
            const eventCodeMatch = event.code.match(new RegExp(`^${blockCode}\\.(\\d+)$`))
            if (eventCodeMatch) {
                const number = parseInt(eventCodeMatch[1], 10)
                if (number > maxNumber) {
                    maxNumber = number
                }
            }
        }
    })
    
    // Возвращаем следующий номер
    return `${blockCode}.${maxNumber + 1}`
}

// Работа с модальным окном создания мероприятия
// openCreateEventModal перенесён на страницу блока

// closeCreateEventModal перенесён на страницу блока

// createEventFromModal перенесён на страницу блока

// openEditEventModal перенесён на страницу блока

function goToBlock(id) {
    if (!id) return
    router.push({ name: 'ProjectEdEventBlock', params: { id } })
}

function goToImport() {
    router.push({ name: 'ProjectEdImport' })
}
</script>

<style scoped lang="scss">
.page-container { display: flex; flex-direction: column; height: 100%; }
.page-content { flex: 1; display: flex; flex-direction: column; gap: 1rem; }

.button-create {
    display: inline-flex;
    align-items: center;
    gap: .5rem;
    padding: .375rem .75rem;
    border-radius: 2rem;
    background-color: var(--color-header-background);
    color: var(--bs-body-color, #212529);
    cursor: pointer;
    transition: background-color .15s ease, border-color .15s ease, color .15s ease, box-shadow .15s ease;
}

.button-create:hover {
    background-color: var(--color-hover-background, #f8f9fa);
    border-color: var(--bs-border-color, #ced4da);
}

.category-badge {
    max-width: 250px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-flex;
    align-items: center;
    vertical-align: middle;
}

.subcategory-badge {
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
    vertical-align: middle;
}

.block-card { transition: background-color .15s ease; }
.block-card:hover { background-color: var(--color-hover-background, #f8f9fa); }
.block-title-link { color: var(--color-primary-text, inherit); }
.block-card-click { cursor: pointer; }

/* Оверлей действий, показывается при наведении на карточку */
.block-actions-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    padding: .5rem .75rem;
    background: rgba(255, 255, 255, 0.35); /* легкая вуаль для читаемости */
    backdrop-filter: blur(6px) saturate(120%);
    -webkit-backdrop-filter: blur(6px) saturate(120%);
    display: none;
    z-index: 2;
}

.block-card:hover .block-actions-overlay {
    display: block;
}

.policy-select {
    min-width: 260px;
}

/* Цвет как у ссылок в breadcrumbs */
.breadcrumb-link-color {
    color: var(--color-primary-text, var(--bs-body-color, #212529)) !important;
    background-color: rgba(13, 110, 253, 0.12);
    border: 1px solid rgba(13, 110, 253, 0.25);
}

</style>


