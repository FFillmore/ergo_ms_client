<template>
    <div class="page-container">
        <div class="page-content">
            <div class="card p-3">
                <div class="d-flex gap-2 align-items-center justify-content-between mb-3">
                    <div class="d-flex gap-2 align-items-center flex-grow-1">
                        <div class="input-group" style="max-width: 420px; flex-grow: 1;">
                            <span class="input-group-text bg-white"><Search class="lucide align-middle" :size="18" /></span>
                            <input v-model.trim="searchTerm" @input="handleSearch" type="text" class="form-control" placeholder="Поиск по названию факультета, короткому имени, названию кафедры" />
                        </div>
                        <button class="btn btn-outline-secondary d-flex align-items-center" @click="loadFaculties">
                            <RefreshCw class="lucide align-middle me-1" :size="18" /> Обновить
                        </button>
                    </div>
                    <button class="btn btn-primary d-flex align-items-center" @click="openCreate">
                        <Plus class="lucide align-middle me-1" :size="18" />Добавить факультет
                    </button>
                </div>

                <div v-if="loading" class="d-flex align-items-center gap-2 text-muted">
                    <div class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></div>
                    Загрузка факультетов...
                </div>

                <div v-else>
                    <div v-if="faculties.length === 0" class="alert alert-light mb-0">
                        Факультеты не найдены.
                    </div>
                    <div v-else class="table-responsive">
                        <table class="table table-hover align-middle mb-0">
                            <thead>
                                <tr>
                                    <th style="width: 56px;">#</th>
                                    <th>Название</th>
                                    <th class="text-center">Короткое имя</th>
                                    <th class="text-center">Кафедры</th>
                                    <th class="text-center">Пользователи</th>
                                    <th style="width: 56px;" class="text-end"></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(f, idx) in faculties" :key="f.id" class="table-row-click" @click="openEdit(f)">
                                    <td class="text-muted">{{ idx + 1 }}</td>
                                    <td>{{ f.name }}</td>
                                    <td class="text-center">{{ f.short_name || '—' }}</td>
                                    <td class="text-center">
                                        <span class="d-inline-flex align-items-center justify-content-end">
                                            <Building2 class="lucide align-middle me-1" :size="18" /> {{ deptCounts[f.id] || 0 }}
                                        </span>
                                    </td>
                                    <td class="text-center">
                                        <span class="d-inline-flex align-items-center justify-content-end">
                                            <Users class="lucide align-middle me-1" :size="18" /> {{ userCounts[f.id] || 0 }}
                                        </span>
                                    </td>
                                    <td class="text-end">
                                        <button
                                            class="btn btn-sm btn-outline-danger table-row-actions d-inline-flex align-items-center"
                                            title="Удалить"
                                            @click.stop="quickDelete(f)"
                                            :disabled="saving || deletingId === f.id"
                                        >
                                            <span v-if="deletingId === f.id" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                            <Trash2 v-else class="lucide align-middle" :size="16" />
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <teleport to="body">
            <div v-if="isModalOpen">
                <div class="modal fade show d-block project-ed-modal" tabindex="-1" role="dialog" aria-modal="true">
                    <div class="modal-dialog modal-dialog-centered" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">{{ editId ? 'Редактирование факультета' : 'Создание факультета' }}</h5>
                                <button type="button" class="btn-close" aria-label="Close" @click="closeModal"></button>
                            </div>
                            <div class="modal-body">
                                <div class="mb-3">
                                    <label class="form-label">Название</label>
                                    <input v-model.trim="form.name" type="text" class="form-control" placeholder="Название факультета" />
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Короткое имя</label>
                                    <input v-model.trim="form.short_name" type="text" class="form-control" placeholder="Напр.: ФИТ" />
                                </div>
                            </div>
                            <div class="modal-footer d-flex align-items-center justify-content-between">
                                <button v-if="editId" type="button" class="btn btn-outline-danger" @click="openDeleteConfirm(editId, form.name)" :disabled="saving || deletingId">
                                    <span v-if="deletingId" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Удалить
                                </button>
                                <div class="ms-auto d-flex align-items-center gap-2">
                                    <button type="button" class="btn btn-outline-secondary" @click="closeModal" :disabled="saving || deletingId">Отмена</button>
                                    <button type="button" class="btn btn-primary" :disabled="saving" @click="saveFaculty">
                                        <span v-if="saving" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Сохранить
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-backdrop fade show project-ed-backdrop" @click="closeModal"></div>
            </div>
            <div v-if="confirmOpen">
                <div class="modal fade show d-block project-ed-modal" tabindex="-1" role="dialog" aria-modal="true">
                    <div class="modal-dialog modal-dialog-centered" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Удалить факультет</h5>
                                <button type="button" class="btn-close" aria-label="Close" @click="closeDeleteConfirm" :disabled="deletingId"></button>
                            </div>
                            <div class="modal-body">
                                <p class="mb-0">Вы действительно хотите удалить факультет <strong>{{ confirmName }}</strong>? Это действие нельзя отменить.</p>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-outline-secondary" @click="closeDeleteConfirm" :disabled="deletingId">Отмена</button>
                                <button type="button" class="btn btn-danger" @click="performDelete" :disabled="deletingId">
                                    <span v-if="deletingId" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Удалить
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-backdrop fade show project-ed-backdrop" @click="closeDeleteConfirm"></div>
            </div>
        </teleport>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { RefreshCw, Search, Users, Trash2, Plus, Building2 } from 'lucide-vue-next'
import { apiClient } from '@/js/api/manager'
import { useToast } from 'vue-toastification'

const toast = useToast()

const loading = ref(false)
const faculties = ref([])
const searchTerm = ref('')
let searchTimer = null

const isModalOpen = ref(false)
const saving = ref(false)
const form = ref({ name: '', short_name: '' })
const editId = ref(null)
const deletingId = ref(null)
const confirmOpen = ref(false)
const confirmId = ref(null)
const confirmName = ref('')

const deptCounts = ref({})
const userCounts = ref({})

async function loadFaculties() {
    try {
        loading.value = true
        const params = {}
        if (searchTerm.value) params.search = searchTerm.value
        const resp = await apiClient.get('/project_ed/faculties/', params)
        const data = Array.isArray(resp.data) ? resp.data : (resp.data?.results || [])
        faculties.value = data.map(f => ({
            id: f.id,
            name: f.name,
            short_name: f.short_name ?? f.short ?? null
        }))
        // после загрузки факультетов перезагружаем счётчики
        await loadCounts()
    } catch (e) {
        toast.error('Не удалось загрузить список факультетов')
    } finally {
        loading.value = false
    }
}

function handleSearch() {
    if (searchTimer) clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
        loadFaculties()
    }, 350)
}

function openCreate() {
    form.value = { name: '', short_name: '' }
    editId.value = null
    isModalOpen.value = true
}

function closeModal() {
    if (saving.value) return
    isModalOpen.value = false
}

function openEdit(row) {
    form.value = {
        name: row.name || '',
        short_name: row.short_name || ''
    }
    editId.value = row.id
    isModalOpen.value = true
}

async function saveFaculty() {
    try {
        if (!form.value.name?.trim()) {
            toast.error('Укажите название факультета')
            return
        }
        saving.value = true
        const payload = {
            name: form.value.name,
            short_name: form.value.short_name || null
        }
        if (editId.value) {
            await apiClient.patch(`/project_ed/faculties/${editId.value}/`, payload)
            toast.success('Факультет обновлен')
        } else {
            await apiClient.post('/project_ed/faculties/', payload)
            toast.success('Факультет создан')
        }
        isModalOpen.value = false
        await loadFaculties()
    } catch (e) {
        toast.error('Не удалось сохранить факультет')
    } finally {
        saving.value = false
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
    if (deletingId.value) return
    confirmOpen.value = false
}

async function performDelete() {
    if (!confirmId.value) return
    try {
        deletingId.value = confirmId.value
        await apiClient.delete(`/project_ed/faculties/${confirmId.value}/`)
        toast.success('Факультет удален')
        confirmOpen.value = false
        isModalOpen.value = false
        await loadFaculties()
    } catch (e) {
        const msg = e?.response?.data?.detail || 'Не удалось удалить факультет'
        toast.error(msg)
    } finally {
        deletingId.value = null
    }
}

function quickDelete(row) {
    if (!row?.id) return
    openDeleteConfirm(row.id, row.name)
}

loadFaculties()

async function loadCounts() {
    try {
        // Загружаем счетчики кафедр и пользователей по факультетам
        const [deptResp, usersResp] = await Promise.all([
            apiClient.get('/project_ed/faculties/department_counts/').catch(() => ({ data: {} })),
            apiClient.get('/project_ed/faculties/user_counts/').catch(() => ({ data: {} }))
        ])
        deptCounts.value = deptResp.data || {}
        userCounts.value = usersResp.data || {}
    } catch (e) {
        // не блокируем страницу, просто тихо игнорируем
        deptCounts.value = {}
        userCounts.value = {}
    }
}
</script>

<style scoped lang="scss">
.page-container { display: flex; flex-direction: column; height: 100%; }
.page-content { flex: 1; display: flex; flex-direction: column; gap: 1rem; }
.project-ed-modal { z-index: 1060; }
.project-ed-backdrop { z-index: 1055; position: fixed; inset: 0; }
.table-row-click { cursor: pointer; }
.table-row-actions { opacity: 0; visibility: hidden; transition: opacity .15s ease; }
tr.table-row-click:hover .table-row-actions { opacity: 1; visibility: visible; }
</style>
