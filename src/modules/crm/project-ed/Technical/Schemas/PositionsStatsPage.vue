<template>
    <div class="page-container">
        <div class="page-content">
            <div class="card p-3">
                <div class="d-flex gap-2 align-items-center justify-content-between mb-3">
                    <div class="d-flex gap-2 align-items-center flex-grow-1">
                        <div class="input-group" style="max-width: 420px; flex-grow: 1;">
                            <span class="input-group-text bg-white"><Search class="lucide align-middle" :size="18" /></span>
                            <input v-model.trim="searchTerm" @input="handleSearch" type="text" class="form-control" placeholder="Поиск по названию должности" />
                        </div>
                        <button class="btn btn-outline-secondary d-flex align-items-center" @click="loadData">
                            <RefreshCw class="lucide align-middle me-1" :size="18" /> Обновить
                        </button>
                    </div>
                    <button class="btn btn-primary d-flex align-items-center" @click="openCreateModal">
                        <Plus class="lucide align-middle me-1" :size="18" />Добавить должность
                    </button>
                </div>

                <div v-if="loading" class="d-flex align-items-center gap-2 text-muted">
                    <div class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></div>
                    Загрузка статистики...
                </div>

                <div v-else>
                    <div v-if="filteredStats.length === 0" class="alert alert-light mb-0">
                        Данные отсутствуют.
                    </div>
                    <div v-else class="table-responsive">
                        <table class="table table-hover align-middle mb-0">
                            <thead>
                                <tr>
                                    <th style="width: 56px;">#</th>
                                    <th>Должность</th>
                                    <th class="text-center">Пользователи</th>
                                    <th style="width: 56px;" class="text-end"></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(row, idx) in filteredStats" :key="row.id || row.name" class="table-row-click" @click="openEditModal(row)">
                                    <td class="text-muted">{{ idx + 1 }}</td>
                                    <td>{{ row.name }}</td>
                                    <td class="text-center">
                                        <span class="d-inline-flex align-items-center justify-content-center">
                                            <Users class="lucide align-middle me-1" :size="18" /> {{ row.count }}
                                        </span>
                                    </td>
                                    <td class="text-end">
                                        <button
                                            class="btn btn-sm btn-outline-danger table-row-actions d-inline-flex align-items-center"
                                            title="Удалить"
                                            @click.stop="quickDelete(row)"
                                            :disabled="deleting || deletingId === row.id"
                                        >
                                            <span v-if="deletingId === row.id" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                            <Trash2 v-else class="lucide align-middle" :size="16" />
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <!-- Modal: Create Position -->
            <div v-if="showCreate" class="modal fade show" style="display: block; background: rgba(0,0,0,.5);" tabindex="-1" role="dialog" aria-modal="true">
                <div class="modal-dialog modal-dialog-centered" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">{{ editId ? 'Редактирование должности' : 'Новая должность' }}</h5>
                            <button type="button" class="btn-close" aria-label="Close" @click="closeCreateModal" :disabled="creating"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <label class="form-label">Название должности</label>
                                <input type="text" class="form-control" v-model.trim="newPositionName" :disabled="creating" placeholder="Например: Доцент" @keyup.enter="handleEnter" />
                            </div>
                        </div>
                        <div class="modal-footer d-flex align-items-center justify-content-between">
                            <button v-if="editId" type="button" class="btn btn-outline-danger" @click="openDeleteConfirm(editId, newPositionName)" :disabled="creating || deleting">
                                <span v-if="deleting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Удалить
                            </button>
                            <div class="ms-auto d-flex align-items-center gap-2">
                                <button type="button" class="btn btn-outline-secondary" @click="closeCreateModal" :disabled="creating || deleting">Отмена</button>
                                <button type="button" class="btn btn-primary d-flex align-items-center" @click="savePosition" :disabled="creating || deleting || !canSubmit">
                                    <Save class="lucide align-middle me-1" :size="18" /> {{ creating ? (editId ? 'Сохранение…' : 'Создание…') : (editId ? 'Сохранить' : 'Создать') }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal: Confirm Delete -->
            <div v-if="confirmOpen" class="modal fade show" style="display: block; background: rgba(0,0,0,.5);" tabindex="-1" role="dialog" aria-modal="true">
                <div class="modal-dialog modal-dialog-centered" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Удалить должность</h5>
                            <button type="button" class="btn-close" aria-label="Close" @click="closeDeleteConfirm" :disabled="deleting || deletingId"></button>
                        </div>
                        <div class="modal-body">
                            <p class="mb-0">Вы действительно хотите удалить должность <strong>{{ confirmName }}</strong>? Это действие нельзя отменить.</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-outline-secondary" @click="closeDeleteConfirm" :disabled="deleting || deletingId">Отмена</button>
                            <button type="button" class="btn btn-danger" @click="performDelete" :disabled="deleting || deletingId">
                                <span v-if="deleting || deletingId" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Удалить
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { RefreshCw, Save, Search, Users, Trash2, Plus } from 'lucide-vue-next'
import { apiClient } from '@/js/api/manager'
import { useToast } from 'vue-toastification'

const toast = useToast()

const loading = ref(false)
const stats = ref([])
const searchTerm = ref('')
let searchTimer = null
const filteredStats = computed(() => {
    const term = searchTerm.value.trim().toLowerCase()
    if (!term) return stats.value
    return stats.value.filter(r => (r.name || '').toLowerCase().includes(term))
})
const showCreate = ref(false)
const creating = ref(false)
const deleting = ref(false)
const newPositionName = ref('')
const editId = ref(null)
const canSubmit = computed(() => newPositionName.value.trim().length > 0)
const deletingId = ref(null)
const confirmOpen = ref(false)
const confirmId = ref(null)
const confirmName = ref('')

async function loadData() {
    try {
        loading.value = true
        // Загружаем словарь должностей и агрегированные счётчики параллельно
        const [positionsResp, countsResp] = await Promise.all([
            apiClient.get('/project_ed/positions/'),
            apiClient.get('/project_ed/positions/user_counts/')
        ])
        const positions = Array.isArray(positionsResp.data) ? positionsResp.data : (positionsResp.data?.results || [])
        const countsObj = countsResp.data || {}

        // Формируем итоговый список: все должности из справочника + их количество пользователей
        const rows = positions
            .filter(pos => !!pos?.name)
            .map(pos => ({ id: pos.id, name: pos.name, count: countsObj[pos.id] || 0 }))

        // Сортируем по убыванию количества, затем по названию
        rows.sort((a, b) => (b.count - a.count) || a.name.localeCompare(b.name))
        stats.value = rows
    } catch (e) {
        toast.error('Не удалось загрузить статистику по должностям')
    } finally {
        loading.value = false
    }
}

loadData()

function handleSearch() {
    if (searchTimer) clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
        // фильтрация локальная, просто обновляем computed через изменение searchTerm
        // если понадобится серверная фильтрация, можно дернуть loadData с параметрами
    }, 300)
}

function openCreateModal() {
    newPositionName.value = ''
    editId.value = null
    showCreate.value = true
}

function closeCreateModal() {
    showCreate.value = false
}

function handleEnter() {
    if (canSubmit.value && !creating.value) {
        savePosition()
    }
}

function openEditModal(row) {
    editId.value = row?.id ?? null
    newPositionName.value = row?.name || ''
    showCreate.value = true
}

async function savePosition() {
    const name = newPositionName.value.trim()
    if (!name) return
    try {
        creating.value = true
        if (editId.value) {
            await apiClient.patch(`/project_ed/positions/${editId.value}/`, { name })
            toast.success('Должность обновлена')
        } else {
            await apiClient.post('/project_ed/positions/', { name })
            toast.success('Должность создана')
        }
        // Закрываем модалку сразу после успешного сохранения
        showCreate.value = false
        await loadData()
    } catch (e) {
        const msg = e?.response?.data?.detail || e?.response?.data?.name?.[0] || 'Не удалось создать должность'
        toast.error(msg)
    } finally {
        creating.value = false
    }
}

function openDeleteConfirm(id, name) {
    const targetId = typeof id === 'object' ? (id?.value ?? null) : id
    const targetName = typeof name === 'object' ? (name?.value ?? '') : (name ?? '')
    confirmId.value = targetId
    confirmName.value = targetName
    confirmOpen.value = true
}

function closeDeleteConfirm() {
    if (deleting.value || deletingId.value) return
    confirmOpen.value = false
}

async function performDelete() {
    if (!confirmId.value) return
    try {
        // если удаляем из модалки редактирования
        if (editId.value === confirmId.value) {
            deleting.value = true
        } else {
            deletingId.value = confirmId.value
        }
        await apiClient.delete(`/project_ed/positions/${confirmId.value}/`)
        toast.success('Должность удалена')
        confirmOpen.value = false
        showCreate.value = false
        await loadData()
    } catch (e) {
        const msg = e?.response?.data?.detail || 'Не удалось удалить должность'
        toast.error(msg)
    } finally {
        deleting.value = false
        deletingId.value = null
    }
}

function quickDelete(row) {
    if (!row?.id) return
    openDeleteConfirm(row.id, row.name)
}
</script>

<style scoped lang="scss">
.page-container { display: flex; flex-direction: column; height: 100%; }
.page-content { flex: 1; display: flex; flex-direction: column; gap: 1rem; }
.table-row-click { cursor: pointer; }
.table-row-actions { opacity: 0; visibility: hidden; transition: opacity .15s ease; }
tr.table-row-click:hover .table-row-actions { opacity: 1; visibility: visible; }
</style>


