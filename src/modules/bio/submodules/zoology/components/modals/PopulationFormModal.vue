<script setup>
import { ref, computed, watch } from 'vue'
import ModalCenter from '@/modules/bio/shared/components/ModalCenter.vue'
import AnimalSpeciesSelect from '@/modules/bio/submodules/zoology/components/AnimalSpeciesSelect.vue'
import SiteSelect from '@/modules/bio/shared/components/SiteSelect.vue'

const props = defineProps({
  modalId: { type: String, required: true },
  initialData: { type: Object, default: () => null },
  isEdit: { type: Boolean, default: false },
})

const emit = defineEmits(['create', 'update'])

const error = ref(null)
const isSubmitting = ref(false)

const form = ref({
  animal_species_id: null,
  site_id: null,
  observation_date: '',
  estimated_count: null,
  density: null,
  notes: '',
})

watch(
  () => props.initialData,
  (v) => {
    if (v) {
      form.value = {
        animal_species_id: (v.animal_species_id ?? v.animal_species) ?? null,
        site_id: (v.site_id ?? v.site) ?? null,
        observation_date: v.observation_date ?? '',
        estimated_count: v.estimated_count ?? null,
        density: v.density ?? null,
        notes: v.notes ?? '',
      }
    } else reset()
  },
  { immediate: true },
)

const canSubmit = computed(() => !!form.value.animal_species_id && !!form.value.site_id)

function reset() {
  error.value = null
  form.value = {
    animal_species_id: null,
    site_id: null,
    observation_date: '',
    estimated_count: null,
    density: null,
    notes: '',
  }
}

function handleSubmit() {
  error.value = null
  if (!canSubmit.value) {
    error.value = 'Выберите вид и площадку'
    return
  }
  isSubmitting.value = true
  // Приводим к ожиданиям backend: animal_species, site, optional observation_date
  const raw = { ...form.value }
  const payload = {
    animal_species: raw.animal_species_id,
    site: raw.site_id,
    observation_date: raw.observation_date || null,
    estimated_count: raw.estimated_count,
    density: raw.density,
    notes: raw.notes,
  }
  // Удаляем пустые значения чтобы не слать '' и null
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
  <ModalCenter :modalId="modalId" :title="isEdit ? 'Редактировать популяцию' : 'Добавить популяцию'" :showFooter="true">
    <div class="d-flex flex-column gap-3">
      <div v-if="error" class="alert alert-danger">{{ error }}</div>
      <div class="row g-3">
        <div class="col-12 col-md-6">
          <label class="form-label">Вид животного *</label>
          <AnimalSpeciesSelect v-model="form.animal_species_id" />
        </div>
        <div class="col-12 col-md-6">
          <label class="form-label">Площадка *</label>
          <SiteSelect v-model="form.site_id" />
        </div>
        <div class="col-12 col-md-6">
          <label class="form-label">Дата</label>
          <input class="form-control" type="date" v-model="form.observation_date" />
        </div>
        <div class="col-12 col-md-3">
          <label class="form-label">Численность</label>
          <input class="form-control" type="number" v-model.number="form.estimated_count" />
        </div>
        <div class="col-12 col-md-3">
          <label class="form-label">Плотность</label>
          <input class="form-control" type="number" step="0.01" v-model.number="form.density" />
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


