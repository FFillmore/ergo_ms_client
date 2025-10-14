<template>
    <div class="page-container">
        <HeaderBar />
        <Breadcrumbs :items="breadcrumbItems" class="mt-3" />
        <div class="page-content">
            <div class="d-flex align-items-start justify-content-between mb-2">
                <div>
                    <h3 class="mb-1">{{ titleText }}</h3>
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
                <div class="d-flex align-items-center justify-content-end">
                    <div class="btn-toolbar" role="toolbar" aria-label="Toolbar">
                        <div class="btn-group" role="group" aria-label="Actions" v-if="eventId">
                            <button type="button" class="btn btn-outline-secondary btn-sm d-inline-flex align-items-center" @click="openEditModal">
                                <Pencil :size="14" class="me-2" />
                                Редактировать
                            </button>
                            <button type="button" class="btn btn-outline-danger btn-sm d-inline-flex align-items-center" @click="openDeleteConfirm" :disabled="isDeleting">
                                <Trash :size="14" class="me-2" />
                                <span v-if="!isDeleting">Удалить</span>
                                <span v-else>Удаление…</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div class="card p-3">
                <div class="row g-3">
                    <div class="col-12 col-md-4">
                        <div class="mb-2"><strong>Блок мероприятий</strong></div>
                        <div>
                            <template v-if="eventData?.block">
                                <router-link :to="{ name: 'ProjectEdEventBlock', params: { id: eventData.block } }">
                                    {{ eventData?.block_code || eventData?.block || '—' }}
                                </router-link>
                            </template>
                            <template v-else>—</template>
                        </div>
                    </div>
                    <div class="col-12 col-md-4">
                        <div class="mb-2"><strong>Код</strong></div>
                        <div>{{ eventData?.code || '—' }}</div>
                    </div>
                    <div class="col-12 col-md-4">
                        <div class="mb-2"><strong>Период</strong></div>
                        <div>{{ yearsDisplay }}</div>
                    </div>
                    <div class="col-12">
                        <div class="mb-2"><strong>Наименование</strong></div>
                        <div>{{ eventData?.name || '—' }}</div>
                    </div>
                    <div class="col-12">
                        <div class="mb-2"><strong>Основные результаты</strong></div>
                        <template v-if="resultsItems.length <= 1">
                            <div class="text-prewrap">{{ resultsItems[0] ?? (eventData?.results || '—') }}</div>
                        </template>
                        <ol v-else class="mb-0 ps-3">
                            <li v-for="(item, idx) in resultsItems" :key="idx">{{ item }}</li>
                        </ol>
                    </div>
                </div>
                </div>
            </template>
        </div>
    </div>

    <!-- Модальное окно редактирования мероприятия -->
    <div v-if="isEditModalOpen" class="modal d-block" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Редактирование мероприятия</h5>
                    <button type="button" class="btn-close" aria-label="Close" @click="closeEditModal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label">Наименование мероприятия</label>
                        <input v-model="editName" type="text" class="form-control" placeholder="Название мероприятия" />
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Основные результаты</label>
                        <textarea v-model="editResults" class="form-control" rows="4" placeholder="Каждый результат — с новой строки" style="resize: vertical;"></textarea>
                        <div class="form-text">Вводите каждый результат на новой строке. Пустые строки будут игнорироваться.</div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Срок реализации (годы)</label>
                        <div class="row g-2">
                            <div class="col-6">
                                <select v-model="editStartYear" class="form-select">
                                    <option v-for="year in yearsOptions" :key="`edit-start-` + year" :value="year">{{ year }}</option>
                                </select>
                            </div>
                            <div class="col-6">
                                <select v-model="editEndYear" class="form-select">
                                    <option v-for="year in yearsOptions" :key="`edit-end-` + year" :value="year">{{ year }}</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-text">Выберите годы начала и окончания. Конечный год не раньше начального.</div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-secondary" @click="closeEditModal">Отмена</button>
                    <button type="button" class="btn btn-primary" @click="saveEdit">Сохранить</button>
                </div>
            </div>
        </div>
    </div>
    <div v-if="isEditModalOpen" class="modal-backdrop fade show"></div>

    <!-- Модальное окно подтверждения удаления -->
    <div v-if="isDeleteModalOpen" class="modal d-block" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Удалить мероприятие</h5>
                    <button type="button" class="btn-close" aria-label="Close" @click="closeDeleteConfirm"></button>
                </div>
                <div class="modal-body">
                    Вы уверены, что хотите удалить мероприятие <strong>{{ eventData?.code || '' }}</strong>? Действие необратимо.
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-secondary" @click="closeDeleteConfirm">Отмена</button>
                    <button type="button" class="btn btn-danger" :disabled="isDeleting" @click="confirmDelete">
                        <span v-if="!isDeleting">Удалить</span>
                        <span v-else>Удаление…</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
    <div v-if="isDeleteModalOpen" class="modal-backdrop fade show"></div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { Home, Wrench, Target, Pencil, Trash } from 'lucide-vue-next'
import HeaderBar from '@/modules/crm/project-ed/components/HeaderBar.vue'
import Breadcrumbs from '@/modules/crm/project-ed/components/Breadcrumbs.vue'
import { apiClient } from '@/js/api/manager'
import { endpoints } from '@/js/api/endpoints'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const eventId = computed(() => route.params.id)
const isLoading = ref(false)
const eventData = ref(null)
const isDeleting = ref(false)
const isEditModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const editName = ref('')
const editResults = ref('')
const editStartYear = ref(new Date().getFullYear())
const editEndYear = ref(new Date().getFullYear())

const breadcrumbItems = ref([
    { label: 'Главная', icon: Home, to: { name: 'ProjectEdMain' } },
    { label: 'Служебная страница', icon: Wrench, to: { name: 'ProjectEdTechnical' } },
    { label: 'Программа развития БГТУ', icon: Target, to: { name: 'ProjectEdProgramDevelopment' } },
    { label: 'Мероприятие' }
])

const titleText = computed(() => {
    const code = eventData.value?.code
    const name = eventData.value?.name
    if (!code && !name) return 'Мероприятие'
    return code ? `${code}. ${name || ''}` : (name || 'Мероприятие')
})

const yearsDisplay = computed(() => {
    const s = eventData.value?.start_year
    const e = eventData.value?.end_year
    if (!s && !e) return '—'
    if (s && e) return s === e ? `${s}` : `${s} — ${e}`
    return s || e || '—'
})

const yearsOptions = computed(() => {
    const start = 2023
    const end = new Date().getFullYear() + 10
    const list = []
    for (let y = start; y <= end; y++) list.push(y)
    return list
})

const resultsItems = computed(() => {
    const text = eventData.value?.results
    if (!text) return []
    return String(text)
        .split(/\r?\n/)
        .map(s => s.trim())
        .filter(s => s.length > 0)
})

onMounted(async () => {
    await loadEvent()
})

async function loadEvent() {
    if (!eventId.value) return
    isLoading.value = true
    try {
        const resp = await apiClient.get(endpoints.project_ed.events.detail(eventId.value))
        eventData.value = resp.data || null

        const last = breadcrumbItems.value[breadcrumbItems.value.length - 1]
        if (last) last.label = `Мероприятие ${eventData.value?.code || ''}`.trim()

        // Добавляем ссылку на блок мероприятий в хлебные крошки (перед последним элементом)
        const blockId = eventData.value?.block
        let blockCode = eventData.value?.block_code
        // Если код блока отсутствует в ответе мероприятия, попробуем подтянуть из API блока
        if (blockId && !blockCode) {
            try {
                const blockResp = await apiClient.get(endpoints.project_ed.event_blocks.detail(blockId))
                blockCode = blockResp.data?.code || ''
                // сохраняем в объекте мероприятия для дальнейшего использования в шаблоне
                if (blockCode) {
                    eventData.value.block_code = blockCode
                }
            } catch (_) {}
        }
        if (blockId) {
            const blockCrumb = {
                label: `Блок мероприятий ${blockCode || ''}`.trim(),
                to: { name: 'ProjectEdEventBlock', params: { id: blockId } }
            }
            // Вставляем на позицию перед последним элементом, если еще не вставляли
            const insertIndex = Math.max(breadcrumbItems.value.length - 1, 0)
            const exists = breadcrumbItems.value.some(c => c.to?.name === 'ProjectEdEventBlock' && c.to?.params?.id === blockId)
            if (!exists) breadcrumbItems.value.splice(insertIndex, 0, blockCrumb)
        }
    } catch (error) {
        const apiMsg = error?.response?.data?.detail
            || (typeof error?.response?.data === 'string' ? error.response.data : null)
            || (error?.response?.data && JSON.stringify(error.response.data))
            || error?.message
            || 'Неизвестная ошибка'
        toast.error(`Ошибка загрузки мероприятия: ${apiMsg}`)
    } finally {
        isLoading.value = false
    }
}

function openEditModal() {
    if (!eventData.value) return
    editName.value = eventData.value.name || ''
    editResults.value = (eventData.value.results || '').toString()
    editStartYear.value = Number(eventData.value.start_year) || new Date().getFullYear()
    editEndYear.value = Number(eventData.value.end_year) || new Date().getFullYear()
    isEditModalOpen.value = true
}

function closeEditModal() {
    isEditModalOpen.value = false
}

async function saveEdit() {
    if (!eventId.value) return
    if (!editName.value.trim()) {
        toast.warning('Введите наименование мероприятия')
        return
    }
    if (editEndYear.value < editStartYear.value) {
        toast.warning('Конечный год не может быть раньше начального')
        return
    }

    const resultsNormalized = (editResults.value || '')
        .split(/\r?\n/)
        .map(s => s.trim())
        .filter(Boolean)
        .join('\n')

    const payload = {
        name: editName.value.trim(),
        results: resultsNormalized,
        start_year: Number(editStartYear.value),
        end_year: Number(editEndYear.value),
    }

    try {
        const resp = await apiClient.patch(endpoints.project_ed.events.patch(eventId.value), payload)
        eventData.value = resp.data
        toast.success('Мероприятие обновлено')
        isEditModalOpen.value = false
    } catch (error) {
        const apiMsg = error?.response?.data?.detail
            || (typeof error?.response?.data === 'string' ? error.response.data : null)
            || (error?.response?.data && JSON.stringify(error.response.data))
            || error?.message
            || 'Неизвестная ошибка'
        toast.error(`Ошибка сохранения: ${apiMsg}`)
    }
}

function openDeleteConfirm() {
    isDeleteModalOpen.value = true
}

function closeDeleteConfirm() {
    isDeleteModalOpen.value = false
}

async function confirmDelete() {
    if (!eventId.value) return
    isDeleting.value = true
    try {
        await apiClient.delete(endpoints.project_ed.events.delete(eventId.value))
        toast.success('Мероприятие удалено')
        const blockId = eventData.value?.block
        if (blockId) {
            router.push({ name: 'ProjectEdEventBlock', params: { id: blockId } })
        } else {
            router.push({ name: 'ProjectEdProgramDevelopment' })
        }
    } catch (error) {
        const apiMsg = error?.response?.data?.detail
            || (typeof error?.response?.data === 'string' ? error.response.data : null)
            || (error?.response?.data && JSON.stringify(error.response.data))
            || error?.message
            || 'Неизвестная ошибка'
        toast.error(`Ошибка удаления: ${apiMsg}`)
    } finally {
        isDeleting.value = false
        isDeleteModalOpen.value = false
    }
}
</script>

<style scoped lang="scss">
.page-container { display: flex; flex-direction: column; height: 100%; }
.page-content { flex: 1; display: flex; flex-direction: column; gap: 1rem; }
.text-prewrap { white-space: pre-wrap; }
.modal-backdrop { z-index: 1040; }
.modal.d-block { z-index: 1050; }
</style>