<script setup>
import { ref, computed, watch } from 'vue'
import ModalCenter from '@/modules/bio/shared/components/ModalCenter.vue'
import PlantSpeciesSelect from '@/modules/bio/submodules/interactions/components/PlantSpeciesSelect.vue'
import AnimalSpeciesSelect from '@/modules/bio/submodules/zoology/components/AnimalSpeciesSelect.vue'
import SiteSelect from '@/modules/bio/shared/components/SiteSelect.vue'
import { interactionTypeOptions } from '@/modules/bio/js/bio-constants'

const props = defineProps({
  modalId: { type: String, required: true },
  initialData: { type: Object, default: () => null },
  isEdit: { type: Boolean, default: false },
})

const emit = defineEmits(['create', 'update'])

const error = ref(null)
const isSubmitting = ref(false)

const form = ref({
  plant_species_id: null,
  animal_species_id: null,
  site_id: null,
  interaction_type: '',
  notes: '',
})

watch(
  () => props.initialData,
  (v) => {
    if (v) {
      form.value = {
        plant_species_id: (v.plant_species_id ?? v.plant_species) ?? null,
        animal_species_id: (v.animal_species_id ?? v.animal_species) ?? null,
        site_id: (v.site_id ?? v.site) ?? null,
        interaction_type: v.interaction_type ?? '',
        notes: v.notes ?? '',
      }
    } else reset()
  },
  { immediate: true },
)

const canSubmit = computed(() => !!form.value.plant_species_id && !!form.value.animal_species_id && !!form.value.interaction_type)

function reset() {
  error.value = null
  form.value = {
    plant_species_id: null,
    animal_species_id: null,
    site_id: null,
    interaction_type: '',
    notes: '',
  }
}

function handleSubmit() {
  error.value = null
  if (!canSubmit.value) {
    error.value = 'Заполните обязательные поля: вид растения, вид животного, тип взаимодействия'
    return
  }
  isSubmitting.value = true
  const raw = { ...form.value }
  const payload = {
    plant_species: raw.plant_species_id,
    animal_species: raw.animal_species_id,
    site: raw.site_id,
    interaction_type: raw.interaction_type,
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
  <ModalCenter :modalId="modalId" :title="isEdit ? 'Редактировать взаимодействие' : 'Добавить взаимодействие'" :showFooter="true">
    <div class="d-flex flex-column gap-3">
      <div v-if="error" class="alert alert-danger">{{ error }}</div>
      <div class="row g-3">
        <div class="col-12 col-md-6">
          <label class="form-label">Вид растения *</label>
          <PlantSpeciesSelect v-model="form.plant_species_id" />
        </div>
        <div class="col-12 col-md-6">
          <label class="form-label">Вид животного *</label>
          <AnimalSpeciesSelect v-model="form.animal_species_id" />
        </div>
        <div class="col-12 col-md-6">
          <label class="form-label">Площадка (опц.)</label>
          <SiteSelect v-model="form.site_id" />
        </div>
        <div class="col-12 col-md-6">
          <label class="form-label">Тип взаимодействия *</label>
          <select class="form-select" v-model="form.interaction_type" required>
            <option value="" disabled>Выберите тип</option>
            <option v-for="opt in interactionTypeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
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


