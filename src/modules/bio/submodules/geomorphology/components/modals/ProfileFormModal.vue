<script setup>
import { ref, computed, watch } from 'vue'
import ModalCenter from '@/modules/bio/shared/components/ModalCenter.vue'
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
  profile_id: '',
  site_id: null,
  latitude: null,
  longitude: null,
  depth: null,
  collection_date: '',
  soil_type: '',
  description: '',
})

watch(
  () => props.initialData,
  (v) => {
    if (v) {
      form.value = {
        profile_id: v.profile_id ?? '',
        site_id: (v.site_id ?? v.site) ?? null,
        latitude: v.latitude ?? null,
        longitude: v.longitude ?? null,
        depth: v.depth ?? null,
        collection_date: v.collection_date ?? '',
        soil_type: v.soil_type ?? '',
        description: v.description ?? '',
      }
    } else reset()
  },
  { immediate: true },
)

const canSubmit = computed(() => !!form.value.profile_id)

function reset() {
  error.value = null
  form.value = {
    profile_id: '',
    site_id: null,
    latitude: null,
    longitude: null,
    depth: null,
    collection_date: '',
    soil_type: '',
    description: '',
  }
}

function handleSubmit() {
  error.value = null
  if (!canSubmit.value) { error.value = 'Укажите идентификатор профиля'; return }
  isSubmitting.value = true
  const raw = { ...form.value }
  const payload = {
    profile_id: raw.profile_id,
    site: raw.site_id,
    latitude: raw.latitude,
    longitude: raw.longitude,
    depth: raw.depth,
    collection_date: raw.collection_date || null,
    soil_type: raw.soil_type,
    description: raw.description,
  }
  Object.keys(payload).forEach((k) => { const v = payload[k]; if (v === '' || v === null || v === undefined) delete payload[k] })
  const cb = (err) => { isSubmitting.value = false; if (err) error.value = err; else reset() }
  if (props.isEdit) emit('update', payload, cb)
  else emit('create', payload, cb)
}
</script>

<template>
  <ModalCenter :modalId="modalId" :title="isEdit ? 'Редактировать профиль' : 'Добавить профиль'" :showFooter="true">
    <div class="d-flex flex-column gap-3">
      <div v-if="error" class="alert alert-danger">{{ error }}</div>
      <div class="row g-3">
        <div class="col-12 col-md-6">
          <label class="form-label">Идентификатор профиля *</label>
          <input class="form-control" v-model="form.profile_id" />
        </div>
        <div class="col-12 col-md-6">
          <label class="form-label">Площадка</label>
          <SiteSelect v-model="form.site_id" />
        </div>
        <div class="col-12 col-md-4">
          <label class="form-label">Широта</label>
          <input class="form-control" type="number" step="0.000001" v-model.number="form.latitude" />
        </div>
        <div class="col-12 col-md-4">
          <label class="form-label">Долгота</label>
          <input class="form-control" type="number" step="0.000001" v-model.number="form.longitude" />
        </div>
        <div class="col-12 col-md-4">
          <label class="form-label">Глубина</label>
          <input class="form-control" type="number" step="0.01" v-model.number="form.depth" />
        </div>
        <div class="col-12 col-md-6">
          <label class="form-label">Дата отбора</label>
          <input class="form-control" type="date" v-model="form.collection_date" />
        </div>
        <div class="col-12 col-md-6">
          <label class="form-label">Тип почвы</label>
          <input class="form-control" v-model="form.soil_type" />
        </div>
        <div class="col-12">
          <label class="form-label">Описание</label>
          <textarea class="form-control" rows="2" v-model="form.description" />
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


