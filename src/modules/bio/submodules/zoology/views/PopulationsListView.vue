<script setup>
import { ref, computed, onMounted } from 'vue'
import { apiClient } from '@/js/api/manager'
import { bioEndpoints as endpoints } from '@/modules/bio/js/endpoints'
import { Plus, Pencil, Trash2, Info } from 'lucide-vue-next'
import BootstrapTable from '@/modules/bio/shared/components/BootstrapTable.vue'
import DeleteConfirmModal from '@/modules/bio/submodules/geobotany/components/modals/DeleteConfirmModal.vue'
import PopulationFormModal from '@/modules/bio/submodules/zoology/components/modals/PopulationFormModal.vue'
import { useToast } from 'vue-toastification'
import { handleApiError } from '@/modules/bio/js/bio-helpers'

const toast = useToast()

const items = ref([])
const isLoading = ref(true)
const error = ref(null)
const search = ref('')
const selectedIds = ref([])
const tableRef = ref(null)

const createModalId = 'z-pop-create'
const editModalId = 'z-pop-edit'
const deleteModalId = 'z-pop-delete'
const isDeleting = ref(false)
const itemToEdit = ref(null)
const itemToDelete = ref(null)

const columns = [
  { field: 'animal_species_title', header: 'Вид', sortable: true },
  { field: 'site_number', header: 'Площадка', sortable: true },
  { field: 'observation_date', header: 'Дата', sortable: true },
  { field: 'estimated_count', header: 'Оценка численности', sortable: true },
  { field: 'density', header: 'Плотность', sortable: true },
]

const filtered = computed(() => {
  if (!search.value) return items.value
  const term = search.value.toLowerCase()
  return items.value.filter((x) =>
    String(x.animal_species || '').toLowerCase().includes(term) ||
    String(x.site || '').toLowerCase().includes(term)
  )
})

const fetchItems = async () => {
  isLoading.value = true
  error.value = null
  try {
    const r = await apiClient.get(endpoints.bio.zoology.populations)
    items.value = r.success ? (r.data.results || r.data || []) : []
    if (!r.success) error.value = handleApiError(r, 'Ошибка загрузки популяций')
  } catch (e) {
    error.value = handleApiError(e, 'Ошибка загрузки популяций')
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
    const r = await apiClient.delete(endpoints.bio.zoology.populationDetail(itemToDelete.value.id))
    if (r.success) {
      toast.success('Популяция удалена')
      await fetchItems()
      closeById(deleteModalId)
    } else {
      handleApiError(r, 'Ошибка удаления популяции', toast)
    }
  } catch (e) {
    handleApiError(e, 'Ошибка удаления популяции', toast)
  } finally {
    isDeleting.value = false
  }
}

function closeById(modalId) {
  const btn = document.querySelector(`#${modalId} [data-bs-dismiss="modal"]`)
  btn && btn.click()
}

const rowsPerPage = ref(10)

// Create / Update handlers
const handleCreate = async (payload, cb) => {
  try {
    const r = await apiClient.post(endpoints.bio.zoology.populations, payload)
    if (r.success) {
      toast.success('Популяция создана')
      await fetchItems()
      closeById(createModalId)
      cb && cb(null)
    } else {
      const err = handleApiError(r, 'Ошибка создания популяции', toast)
      cb && cb(err)
    }
  } catch (e) {
    const err = handleApiError(e, 'Ошибка создания популяции', toast)
    cb && cb(err)
  }
}

const handleUpdate = async (payload, cb) => {
  if (!itemToEdit.value?.id) return
  try {
    const r = await apiClient.put(endpoints.bio.zoology.populationDetail(itemToEdit.value.id), payload)
    if (r.success) {
      toast.success('Популяция обновлена')
      await fetchItems()
      closeById(editModalId)
      cb && cb(null)
    } else {
      const err = handleApiError(r, 'Ошибка обновления популяции', toast)
      cb && cb(err)
    }
  } catch (e) {
    const err = handleApiError(e, 'Ошибка обновления популяции', toast)
    cb && cb(err)
  }
}

onMounted(fetchItems)
</script>

<template>
  <div class="card p-0">
    <div class="card-header custom-card-header border border-bottom-0 text-white d-flex justify-content-between align-items-center">
      <h5 class="mb-0">Зоология — популяции</h5>
      <div class="d-flex gap-2">
        <input type="search" class="form-control form-control-sm" placeholder="Поиск..." @input="e => (search.value = e.target.value)" />
        <button class="btn btn-sm btn-primary text-nowrap" @click="openCreate">
          <Plus :size="16" class="me-1" /> Добавить популяцию
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
        <!-- Fallback rendering for species/site columns -->
        <template #cell-animal_species_title="{ data }">
          {{ data.animal_species || '-' }}
        </template>
        <template #cell-site_number="{ data }">
          {{ data.site || '-' }}
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

    <DeleteConfirmModal :modalId="deleteModalId" :title="`Подтвердите удаление популяции`" :message="`Вы уверены, что хотите удалить популяцию?`" :loading="isDeleting" warningText="Это действие нельзя будет отменить." @confirm="handleDelete" />

    <PopulationFormModal :modalId="createModalId" @create="handleCreate" />
    <PopulationFormModal :modalId="editModalId" :initialData="itemToEdit" :isEdit="true" @update="handleUpdate" />
  </div>
</template>

<style scoped lang="scss">
.actions-column { width: 1%; white-space: nowrap; padding: 0.25rem !important; }
.btn-icon { padding: 0.25rem; line-height: 1; &:hover { background-color: var(--bs-tertiary-bg); border-radius: 0.25rem; } &:focus { box-shadow: none; } }
.card-header { padding: 0.75rem 1rem; }
.card-body { padding: 0; }
.custom-card-header { background-color: var(--bs-secondary); border-bottom: none; [data-bs-theme="dark"] & { background-color: rgba(var(--bs-secondary-rgb), 0.07); } }
</style>


