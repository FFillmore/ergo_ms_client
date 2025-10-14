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
  population_id: null,
  observation_date: '',
  gender: '',
  age: '',
  behavior: '',
  notes: '',
})

watch(
  () => props.initialData,
  (v) => {
    if (v) {
      form.value = {
        animal_species_id: (v.animal_species_id ?? v.animal_species) ?? null,
        site_id: (v.site_id ?? v.site) ?? null,
        population_id: (v.population_id ?? v.population) ?? null,
        observation_date: v.observation_date ?? '',
        gender: v.gender ?? '',
        age: v.age ?? '',
        behavior: v.behavior ?? '',
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
    population_id: null,
    observation_date: '',
    gender: '',
    age: '',
    behavior: '',
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
  const raw = { ...form.value }
  const payload = {
    animal_species: raw.animal_species_id,
    site: raw.site_id,
    population: raw.population_id,
    observation_date: raw.observation_date || null,
    gender: raw.gender,
    age: raw.age,
    behavior: raw.behavior,
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
  <ModalCenter :modalId="modalId" :title="isEdit ? 'Редактировать наблюдение' : 'Добавить наблюдение'" :showFooter="true">
    <div class="d-flex flex-column gap-3">
      <div v-if="error" class="alert alert-danger">{{ error }}</div>
      <div class="row g-3">
        <div class="col-12 col-md-4">
          <label class="form-label">Вид *</label>
          <AnimalSpeciesSelect v-model="form.animal_species_id" />
        </div>
        <div class="col-12 col-md-4">
          <label class="form-label">Площадка *</label>
          <SiteSelect v-model="form.site_id" />
        </div>
        <div class="col-12 col-md-4">
          <label class="form-label">Популяция (опц.)</label>
          <input class="form-control" placeholder="ID популяции (временная заглушка)" v-model="form.population_id" />
        </div>
        <div class="col-12 col-md-6">
          <label class="form-label">Дата и время</label>
          <input class="form-control" type="datetime-local" v-model="form.observation_date" />
        </div>
        <div class="col-12 col-md-3">
          <label class="form-label">Пол</label>
          <input class="form-control" v-model="form.gender" />
        </div>
        <div class="col-12 col-md-3">
          <label class="form-label">Возраст</label>
          <input class="form-control" v-model="form.age" />
        </div>
        <div class="col-12">
          <label class="form-label">Поведение</label>
          <input class="form-control" v-model="form.behavior" />
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
