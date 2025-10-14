<script setup>
import { ref, computed, watch } from 'vue'
import ModalCenter from '@/modules/bio/shared/components/ModalCenter.vue'
import ListSelect from '@/modules/bio/submodules/floristics/components/ListSelect.vue'
import PlantSpeciesSelect from '@/modules/bio/submodules/interactions/components/PlantSpeciesSelect.vue'
import { abundanceOptions } from '@/modules/bio/js/bio-constants'

const props = defineProps({
  modalId: { type: String, required: true },
  initialData: { type: Object, default: () => null },
  isEdit: { type: Boolean, default: false },
})

const emit = defineEmits(['create', 'update'])

const error = ref(null)
const isSubmitting = ref(false)

const form = ref({
  list_id: null,
  plant_species_id: null,
  abundance: 'r',
  notes: '',
})

watch(
  () => props.initialData,
  (v) => {
    if (v) {
      form.value = {
        list_id: (v.list_id ?? v.list) ?? null,
        plant_species_id: (v.species_id ?? v.species ?? v.plant_species_id ?? v.plant_species) ?? null,
        abundance: v.abundance ?? 'r',
        notes: v.notes ?? '',
      }
    } else reset()
  },
  { immediate: true },
)

const canSubmit = computed(() => !!form.value.list_id && !!form.value.plant_species_id)

function reset() {
  error.value = null
  form.value = {
    list_id: null,
    plant_species_id: null,
    abundance: 'r',
    notes: '',
  }
}

function handleSubmit() {
  error.value = null
  if (!canSubmit.value) {
    error.value = 'Укажите список и вид'
    return
  }
  isSubmitting.value = true
  const raw = { ...form.value }
  const payload = {
    list: raw.list_id,
    species: raw.plant_species_id,
    abundance: raw.abundance,
    notes: raw.notes,
  }
  Object.keys(payload).forEach((k) => {
    const v = payload[k]
    if (v === '' || v === null || v === undefined) delete payload[k]
  })
  const cb = (err) => {
    isSubmitting.value = false
    if (err) error.value = err
    else reset()
  }
  if (props.isEdit) emit('update', payload, cb)
  else emit('create', payload, cb)
}
</script>

<template>
  <ModalCenter :modalId="modalId" :title="isEdit ? 'Редактировать элемент списка' : 'Добавить элемент списка'" :showFooter="true">
    <div class="d-flex flex-column gap-3">
      <div v-if="error" class="alert alert-danger">{{ error }}</div>
      <div class="row g-3">
        <div class="col-12 col-md-6">
          <label class="form-label">Список *</label>
          <ListSelect v-model="form.list_id" />
        </div>
        <div class="col-12 col-md-6">
          <label class="form-label">Вид растения *</label>
          <PlantSpeciesSelect v-model="form.plant_species_id" />
        </div>
        <div class="col-12 col-md-6">
          <label class="form-label">Балл обилия *</label>
          <select class="form-select" v-model="form.abundance">
            <option v-for="opt in abundanceOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </div>
        <div class="col-12">
          <label class="form-label">Примечания</label>
          <textarea class="form-control" rows="2" v-model="form.notes" />
        </div>
      </div>
    </div>
    <template #footer>
      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
      <button type="button" class="btn btn-primary" :disabled="!canSubmit || isSubmitting" @click="handleSubmit">
        <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-1"></span>
        Сохранить
      </button>
    </template>
  </ModalCenter>
</template>

<style scoped></style>


