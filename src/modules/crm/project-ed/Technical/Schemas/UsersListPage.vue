<template>
    <div class="card p-3">
                <div class="d-flex flex-column gap-3">
                    <div class="d-flex flex-wrap gap-2 align-items-center">
                        <div class="input-group" style="max-width: 420px;">
                            <span class="input-group-text bg-white"><Search class="lucide align-middle" :size="18" /></span>
                            <input
                                v-model.trim="searchTerm"
                                @input="handleSearch"
                                type="text"
                                class="form-control"
                                placeholder="Поиск по ФИО, роли или должности"
                            />
                        </div>
                        <button class="btn btn-outline-secondary d-flex align-items-center" @click="loadUsers">
                            <RefreshCw class="lucide align-middle me-1" :size="18" /> Обновить
                        </button>
                    </div>

                    <div v-if="loading" class="d-flex align-items-center gap-2 text-muted">
                        <div class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></div>
                        Загрузка пользователей...
                    </div>

                    <div v-else>
                        <div v-if="users.length === 0" class="alert alert-light mb-0">
                            Пользователи не найдены.
                        </div>
                        <div v-else class="table-responsive">
                            <table class="table table-hover align-middle mb-0">
                                <thead>
                                    <tr>
                                        <th>ФИО</th>
                                        <th class="text-center">Роль</th>
                                        <th class="text-center">Должность</th>
                                        <th class="text-center">Факультет</th>
                                        <th class="text-center">Кафедра</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="u in filteredUsers" :key="u.id" class="table-row-click" @click="openEdit(u)">
                                        <td>
                                            <div class="d-flex align-items-center">
                                                <template v-if="u.avatar_url">
                                                    <img :src="u.avatar_url" alt="avatar" class="rounded-circle align-middle me-2" style="width:28px;height:28px;object-fit:cover;" />
                                                </template>
                                                <template v-else>
                                                    <DefaultAvatar size="small" class="me-2" style="width:28px;height:28px;border-width:0;" />
                                                </template>
                                                <span class="align-middle">{{ fullName(u) }}</span>
                                            </div>
                                        </td>
                                        <td class="text-center">{{ u.role || 'N/A' }}</td>
                                        <td class="text-center">{{ u.position || 'N/A' }}</td>
                                        <td class="text-center">
                                            <span 
                                                v-if="u.faculty_short_name" 
                                                :title="u.faculty || u.faculty_short_name"
                                            >
                                                {{ u.faculty_short_name }}
                                            </span>
                                            <span v-else>N/A</span>
                                        </td>
                                        <td class="text-center">
                                            <span 
                                                v-if="departmentShort(u)" 
                                                :title="u.department || departmentShort(u)"
                                            >
                                                {{ departmentShort(u) }}
                                            </span>
                                            <span v-else>N/A</span>
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
                    <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Редактирование пользователя</h5>
                                <button type="button" class="btn-close" aria-label="Close" @click="closeEdit"></button>
                            </div>
                            <div class="modal-body">
                                <div class="mb-3">
                                    <label class="form-label">Пользователь</label>
                                    <div class="form-control bg-light">
                                        {{ editModel.displayName }}
                                    </div>
                                </div>
                                <div class="row g-3">
                                    <div class="col-md-6">
                                        <SelectBox
                                            v-model="editModel.role_ref"
                                            :options="roleOptions"
                                            label="Роль"
                                            value-key="id"
                                            label-key="name"
                                            all-label="— Не выбрано —"
                                        />
                                    </div>
                                    <div class="col-md-6">
                                        <SelectBox
                                            v-model="editModel.position_ref"
                                            :options="positionOptions"
                                            label="Должность"
                                            value-key="id"
                                            label-key="name"
                                            all-label="— Не выбрано —"
                                        />
                                    </div>
                                    <div class="col-md-6">
                                        <SelectBox
                                            v-model="editModel.faculty_ref"
                                            :options="facultyOptions"
                                            label="Факультет"
                                            value-key="id"
                                            label-key="name"
                                            all-label="— Не выбрано —"
                                        />
                                    </div>
                                    <div class="col-md-6">
                                        <SelectBox
                                            v-model="editModel.department_ref"
                                            :options="filteredDepartmentOptions"
                                            label="Кафедра"
                                            value-key="id"
                                            label-key="name"
                                            all-label="— Не выбрано —"
                                            :disabled="!editModel.faculty_ref"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-outline-secondary" @click="closeEdit">Отмена</button>
                                <button type="button" class="btn btn-primary d-flex align-items-center" :disabled="saving" @click="saveEdit">
                                    <span v-if="saving" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Сохранить
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-backdrop fade show project-ed-backdrop" @click="closeEdit"></div>
            </div>
        </teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Search, RefreshCw } from 'lucide-vue-next'
import { apiClient } from '@/js/api/manager'
import { useToast } from 'vue-toastification'
import DefaultAvatar from '@/components/DefaultAvatar.vue'
import SelectBox from '@/components/SelectBox.vue'
import { formatNameWithInitials } from '@/modules/crm/project-ed/js/nameUtils.js'

const toast = useToast()
const users = ref([])
const filteredUsers = computed(() => {
    const term = (searchTerm.value || '').toString().trim().toLowerCase()
    if (!term) return users.value
    return users.value.filter(u => {
        const values = [
            u.displayName,
            u.first_name,
            u.middle_name,
            u.last_name,
            u.role,
            u.position,
            u.faculty,
            u.faculty_short_name,
            u.department,
            u.department_short_name
        ].filter(Boolean).map(v => v.toString().toLowerCase())
        return values.some(v => v.includes(term))
    })
})
const loading = ref(false)
const searchTerm = ref('')
const isModalOpen = ref(false)
const saving = ref(false)
const editModel = ref({ id: null, displayName: '', role_ref: null, position_ref: null, faculty_ref: null, department_ref: null, profileId: null })

const roleOptions = ref([])
const positionOptions = ref([])
const facultyOptions = ref([])
const departmentOptions = ref([])
const filteredDepartmentOptions = computed(() => {
    const fid = editModel.value.faculty_ref
    if (!fid) return departmentOptions.value
    return departmentOptions.value.filter(d => (d.faculty ?? d.faculty_ref ?? null) === fid)
})
const dictsLoading = ref(false)

function fullName(u) {
    if (u.displayName) return u.displayName
    return formatNameWithInitials(u)
}

function departmentShort(u) {
    // Если из профиля пришло короткое имя — используем его
    if (u.department_short_name) return u.department_short_name
    const deptId = u.department_ref
    if (!deptId) return u.department || null
    const dep = Array.isArray(departmentOptions.value) ? departmentOptions.value.find(d => d.id === deptId) : null
    return dep?.short_name || u.department || null
}

async function loadDicts() {
    try {
        dictsLoading.value = true
        const [rolesResp, positionsResp, facultiesResp, departmentsResp] = await Promise.all([
            apiClient.get('/project_ed/roles/'),
            apiClient.get('/project_ed/positions/'),
            apiClient.get('/project_ed/faculties/'),
            apiClient.get('/project_ed/departments/')
        ])
        const norm = (resp) => Array.isArray(resp.data) ? resp.data : (resp.data?.results || [])
        roleOptions.value = norm(rolesResp)
        positionOptions.value = norm(positionsResp)
        facultyOptions.value = norm(facultiesResp)
        departmentOptions.value = norm(departmentsResp).map(d => ({
            id: d.id,
            name: d.name,
            short_name: d.short_name ?? d.short ?? null,
            faculty: d.faculty ?? d.faculty_ref ?? null
        }))
    } catch (e) {
        toast.error('Не удалось загрузить справочники')
    } finally {
        dictsLoading.value = false
    }
}

async function loadUsers() {
    try {
        loading.value = true
        const params = {}
        if (searchTerm.value) params.search = searchTerm.value
        const [usersResp, profilesResp] = await Promise.all([
            apiClient.get('/crm/users/', params),
            apiClient.get('/project_ed/profiles/profiles/', params)
        ])
        const usersData = Array.isArray(usersResp.data) ? usersResp.data : (usersResp.data?.results || [])
        const profilesData = Array.isArray(profilesResp.data) ? profilesResp.data : (profilesResp.data?.results || [])

        const profileByUserId = new Map(profilesData.map(p => [p.id, p]))
        users.value = usersData.map(u => {
            const prof = profileByUserId.get(u.id)
            return {
                id: u.id,
                username: u.username,
                first_name: u.first_name,
                last_name: u.last_name,
                middle_name: u.middle_name || null,
                avatar_url: u.avatar_url || null,
                displayName: `${u.last_name || ''} ${u.first_name || ''} ${u.middle_name || ''}`.trim() || u.username,
                role: prof?.role_name || null,
                position: prof?.position_name || null,
                faculty: prof?.faculty_name || null,
                faculty_short_name: prof?.faculty_short_name ?? null,
                department: prof?.department_name || null,
                department_short_name: prof?.department_short_name ?? null,
                profileId: prof?.profile_id || null,
                role_ref: prof?.role_ref ?? null,
                position_ref: prof?.position_ref ?? null,
                faculty_ref: prof?.faculty_ref ?? null,
                department_ref: prof?.department_ref ?? null,
            }
        })
    } catch (e) {
        toast.error('Не удалось загрузить пользователей')
    } finally {
        loading.value = false
    }
}

function handleSearch() {
    // Фильтрация выполняется на клиенте в computed: filteredUsers
}

// Первичная загрузка
loadDicts()
loadUsers()

function openEdit(u) {
    editModel.value = {
        id: u.id,
        displayName: fullName(u),
        role_ref: u.role_ref ?? null,
        position_ref: u.position_ref ?? null,
        faculty_ref: u.faculty_ref ?? null,
        department_ref: u.department_ref ?? null,
        profileId: u.profileId || null
    }
    // Сбросить кафедру, если она не принадлежит выбранному факультету
    if (editModel.value.department_ref) {
        const exists = filteredDepartmentOptions.value.some(d => d.id === editModel.value.department_ref)
        if (!exists) editModel.value.department_ref = null
    }
    isModalOpen.value = true
}

// Отслеживание изменений факультета для сброса кафедры
watch(() => editModel.value.faculty_ref, (newFacultyRef, oldFacultyRef) => {
    // Если факультет изменился или был сброшен, сбрасываем кафедру
    if (newFacultyRef !== oldFacultyRef && (!newFacultyRef || !filteredDepartmentOptions.value.some(d => d.id === editModel.value.department_ref))) {
        editModel.value.department_ref = null
    }
})

function closeEdit() {
    if (saving.value) return
    isModalOpen.value = false
}

async function saveEdit() {
    try {
        saving.value = true
        const payload = {
            user: editModel.value.id,
            role_ref: editModel.value.role_ref,
            position_ref: editModel.value.position_ref,
            faculty_ref: editModel.value.faculty_ref,
            department_ref: editModel.value.department_ref
        }
        if (editModel.value.profileId) {
            await apiClient.patch(`/project_ed/profiles/settings/${editModel.value.profileId}/`, payload)
        } else {
            const created = await apiClient.post('/project_ed/profiles/settings/', payload)
            const newId = created?.data?.id
            if (newId) editModel.value.profileId = newId
        }
        toast.success('Данные пользователя сохранены')
        isModalOpen.value = false
        await loadUsers()
    } catch (e) {
        toast.error('Не удалось сохранить данные пользователя')
    } finally {
        saving.value = false
    }
}
</script>

<style scoped lang="scss">
.page-container { display: flex; flex-direction: column; height: 100%; }
.page-content { flex: 1; display: flex; flex-direction: column; }
.table-row-click { cursor: pointer; }
.table-row-click:hover { background-color: rgba(0,0,0,0.03); }
.project-ed-modal { z-index: 1060; }
.project-ed-backdrop { z-index: 1055; position: fixed; inset: 0; }

/* Вкладки: только нижняя граница, активная — с цветным подчёркиванием */
.tabs-underline { border-bottom: 1px solid var(--bs-border-color); }
.tabs-underline .nav-link {
  border: none !important;
  background: transparent !important;
  margin-bottom: -1px;
  padding-bottom: 0.5rem;
  color: #0d6efd !important;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.15s ease;
}
.tabs-underline .nav-link:hover { 
  color: #0a58ca !important;
}
.tabs-underline .nav-link.active {
  border: none !important;
  color: #0d6efd !important;
  background: transparent !important;
  border-bottom: 3px solid #0d6efd !important;
  font-weight: 600;
}

/* Стили для кнопок-вкладок */
.tabs-underline .nav-link {
  border: none !important;
  background: transparent !important;
  margin-bottom: -1px;
  padding-bottom: 0.5rem;
  color: #0d6efd !important;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.15s ease;
  cursor: pointer;
}
.tabs-underline .nav-link:hover { 
  color: #0a58ca !important;
}
</style>