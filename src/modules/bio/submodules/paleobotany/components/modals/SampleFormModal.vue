<script setup>
import { ref, computed, watch } from 'vue'
import ModalCenter from '@/modules/bio/shared/components/ModalCenter.vue'

const props = defineProps({
  modalId: { type: String, required: true },
  initialData: { type: Object, default: () => null },
  isEdit: { type: Boolean, default: false },
})

const emit = defineEmits(['create', 'update'])

const error = ref(null)
const isSubmitting = ref(false)

const form = ref({
  sample_id: '',
  collection_date: '',
  depth: null,
  age: null,
  latitude: null,
  longitude: null,
})

watch(
  () => props.initialData,
  (v) => {
    if (v) {
      form.value = {
        sample_id: v.sample_id ?? '',
        collection_date: v.collection_date ?? '',
        depth: v.depth ?? null,
        age: v.age ?? null,
        latitude: v.latitude ?? null,
        longitude: v.longitude ?? null,
      }
    } else reset()
  },
  { immediate: true },
)

const canSubmit = computed(() => !!form.value.sample_id)

function reset() {
  error.value = null
  form.value = {
    sample_id: '',
    collection_date: '',
    depth: null,
    age: null,
    latitude: null,
    longitude: null,
  }
}

function handleSubmit() {
  error.value = null
  if (!canSubmit.value) {
    error.value = 'Укажите идентификатор образца'
    return
  }
  isSubmitting.value = true
  const raw = { ...form.value }
  const payload = {
    sample_id: raw.sample_id,
    collection_date: raw.collection_date || null,
    depth: raw.depth,
    age: raw.age,
    latitude: raw.latitude,
    longitude: raw.longitude,
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
  <ModalCenter :modalId="modalId" :title="isEdit ? 'Редактировать образец' : 'Добавить образец'" :showFooter="true">
    <div class="d-flex flex-column gap-3">
      <div v-if="error" class="alert alert-danger">{{ error }}</div>
      <div class="row g-3">
        <div class="col-12 col-md-6">
          <label class="form-label">Идентификатор образца *</label>
          <input class="form-control" v-model="form.sample_id" />
        </div>
        <div class="col-12 col-md-6">
          <label class="form-label">Дата отбора</label>
          <input class="form-control" type="date" v-model="form.collection_date" />
        </div>
        <div class="col-12 col-md-4">
          <label class="form-label">Глубина</label>
          <input class="form-control" type="number" step="0.01" v-model.number="form.depth" />
        </div>
        <div class="col-12 col-md-4">
          <label class="form-label">Возраст</label>
          <input class="form-control" type="number" v-model.number="form.age" />
        </div>
        <div class="col-12 col-md-4">
          <label class="form-label">Широта</label>
          <input class="form-control" type="number" step="0.000001" v-model.number="form.latitude" />
        </div>
        <div class="col-12 col-md-4">
          <label class="form-label">Долгота</label>
          <input class="form-control" type="number" step="0.000001" v-model.number="form.longitude" />
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


