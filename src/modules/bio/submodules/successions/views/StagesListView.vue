<script setup>
import { ref, computed, onMounted } from 'vue'
import { apiClient } from '@/js/api/manager'
import { bioEndpoints as endpoints } from '@/modules/bio/js/endpoints'
import { Plus, Pencil, Trash2, Info } from 'lucide-vue-next'
import BootstrapTable from '@/modules/bio/shared/components/BootstrapTable.vue'
import DeleteConfirmModal from '@/modules/bio/submodules/geobotany/components/modals/DeleteConfirmModal.vue'
import StageFormModal from '@/modules/bio/submodules/successions/components/modals/StageFormModal.vue'
import { useToast } from 'vue-toastification'
import { handleApiError } from '@/modules/bio/js/bio-helpers'

const toast = useToast()

const items = ref([])
const isLoading = ref(true)
const error = ref(null)
const search = ref('')
const selectedIds = ref([])
const tableRef = ref(null)

const createModalId = 'stage-create'
const editModalId = 'stage-edit'
const deleteModalId = 'stage-delete'
const isDeleting = ref(false)
const itemToEdit = ref(null)
const itemToDelete = ref(null)

const columns = [
  { field: 'succession_name', header: 'Сукцессия', sortable: true },
  { field: 'stage_number', header: '№', sortable: true },
  { field: 'name', header: 'Название', sortable: true },
  { field: 'start_date', header: 'Начало', sortable: true },
  { field: 'end_date', header: 'Конец', sortable: true },
  { field: 'duration_years', header: 'Длительность', sortable: true },
]

const filtered = computed(() => {
  if (!search.value) return items.value
  const term = search.value.toLowerCase()
  return items.value.filter((x) =>
    String(x.name || '').toLowerCase().includes(term) ||
    String(x.succession || '').toLowerCase().includes(term)
  )
})

const fetchItems = async () => {
  isLoading.value = true
  error.value = null
  try {
    const r = await apiClient.get(endpoints.bio.successions.stages)
    const list = r.success ? (r.data.results || r.data || []) : []
    items.value = list.map(x => ({ ...x, id: x.id ?? x.pk }))
    if (!r.success) error.value = handleApiError(r, 'Ошибка загрузки стадий')
  } catch (e) {
    error.value = handleApiError(e, 'Ошибка загрузки стадий')
  } finally {
    isLoading.value = false
  }
}

const openCreate = () => { itemToEdit.value = null; openModal(createModalId) }
const openEdit = (row) => { itemToEdit.value = { ...row }; openModal(editModalId) }
const openDelete = (row) => { itemToDelete.value = row }

function openModal(modalId) {
  const b = document.createElement('button')
  b.setAttribute('data-bs-toggle', 'modal')
  b.setAttribute('data-bs-target', `#${modalId}`)
  b.style.display = 'none'
  document.body.appendChild(b)
  b.click()
  document.body.removeChild(b)
}

const handleSelectionChange = (ids) => { selectedIds.value = ids }

const handleDelete = async () => {
  if (!itemToDelete.value) return
  isDeleting.value = true
  try {
    const r = await apiClient.delete(endpoints.bio.successions.stageDetail(itemToDelete.value.id))
    if (r.success) {
      toast.success('Стадия удалена')
      await fetchItems()
      closeById(deleteModalId)
    } else {
      handleApiError(r, 'Ошибка удаления стадии', toast)
    }
  } catch (e) {
    handleApiError(e, 'Ошибка удаления стадии', toast)
  } finally {
    isDeleting.value = false
  }
}

function closeById(modalId) {
  const btn = document.querySelector(`#${modalId} [data-bs-dismiss=\"modal\"]`)
  btn && btn.click()
}

const rowsPerPage = ref(10)

const handleCreate = async (payload, cb) => {
  try {
    const r = await apiClient.post(endpoints.bio.successions.stages, payload)
    if (r.success) {
      toast.success('Стадия создана')
      await fetchItems()
      closeById(createModalId)
      cb && cb(null)
    } else {
      const err = handleApiError(r, 'Ошибка создания стадии', toast)
      cb && cb(err)
    }
  } catch (e) {
    const err = handleApiError(e, 'Ошибка создания стадии', toast)
    cb && cb(err)
  }
}

const handleUpdate = async (payload, cb) => {
  if (!itemToEdit.value?.id) return
  try {
    const r = await apiClient.put(endpoints.bio.successions.stageDetail(itemToEdit.value.id), payload)
    if (r.success) {
      toast.success('Стадия обновлена')
      await fetchItems()
      closeById(editModalId)
      cb && cb(null)
    } else {
      const err = handleApiError(r, 'Ошибка обновления стадии', toast)
      cb && cb(err)
    }
  } catch (e) {
    const err = handleApiError(e, 'Ошибка обновления стадии', toast)
    cb && cb(err)
  }
}

onMounted(fetchItems)
</script>

<template>
  <div class="card p-0">
    <div class="card-header custom-card-header border border-bottom-0 text-white d-flex justify-content-between align-items-center">
      <h5 class="mb-0">Стадии сукцессий</h5>
      <div class="d-flex gap-2">
        <input type="search" class="form-control form-control-sm" placeholder="Поиск..." @input="e => (search.value = e.target.value)" />
        <button class="btn btn-sm btn-primary text-nowrap" @click="openCreate">
          <Plus :size="16" class="me-1" /> Добавить стадию
        </button>
      </div>
    </div>

    <div class="card-body">
      <div v-if="error" class="alert alert-danger mb-3">
        <div class="d-flex align-items-center gap-2"><Info :size="18" /> <span>{{ error }}</span></div>
      </div>

      <BootstrapTable
        ref="tableRef"
        :data="filtered"
        :loading="isLoading"
        :rowsPerPage="rowsPerPage"
        emptyMessage="Нет данных"
        :columns="columns"
        :selectable="true"
        @selection-change="handleSelectionChange"
      >
        <template #cell-succession_name="{ data }">
          {{ data.succession || '-' }}
        </template>
        <template #header>
          <th scope="col" class="fw-bold text-dark-emphasis text-center">Действия</th>
        </template>

        <template #row-actions="{ row }">
          <td class="actions-column">
            <div class="d-flex gap-1 justify-content-center">
              <button class="btn btn-icon text-success" @click="openEdit(row)" v-tooltip title="Редактировать">
                <Pencil :size="16" />
              </button>
              <button class="btn btn-icon text-danger" @click="openDelete(row)" data-bs-toggle="modal" :data-bs-target="`#${deleteModalId}`" v-tooltip title="Удалить">
                <Trash2 :size="16" />
              </button>
            </div>
          </td>
        </template>
      </BootstrapTable>
    </div>

    <DeleteConfirmModal :modalId="deleteModalId" :title="`Подтвердите удаление стадии`" :message="`Вы уверены, что хотите удалить стадию?`" :loading="isDeleting" warningText="Это действие нельзя будет отменить." @confirm="handleDelete" />

    <StageFormModal :modalId="createModalId" @create="handleCreate" />
    <StageFormModal :modalId="editModalId" :initialData="itemToEdit" :isEdit="true" @update="handleUpdate" />
  </div>
</template>

<style scoped lang="scss">
.actions-column { width: 1%; white-space: nowrap; padding: 0.25rem !important; }
.btn-icon { padding: 0.25rem; line-height: 1; &:hover { background-color: var(--bs-tertiary-bg); border-radius: 0.25rem; } &:focus { box-shadow: none; } }
.card-header { padding: 0.75rem 1rem; }
.card-body { padding: 0; }
.custom-card-header { background-color: var(--bs-secondary); border-bottom: none; [data-bs-theme="dark"] & { background-color: rgba(var(--bs-secondary-rgb), 0.07); } }
</style>


