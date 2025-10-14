<script setup>
import { ref, computed, watch } from 'vue'
import ModalCenter from '@/modules/bio/shared/components/ModalCenter.vue'
import ProfileSelect from '@/modules/bio/submodules/geomorphology/components/ProfileSelect.vue'

const props = defineProps({
  modalId: { type: String, required: true },
  initialData: { type: Object, default: () => null },
  isEdit: { type: Boolean, default: false },
})

const emit = defineEmits(['create', 'update'])

const error = ref(null)
const isSubmitting = ref(false)

const form = ref({
  profile_id: null,
  depth_from: null,
  depth_to: null,
  color: '',
  texture: '',
  structure: '',
  moisture: '',
  ph_level: null,
  organic_matter: null,
  description: '',
})

watch(
  () => props.initialData,
  (v) => {
    if (v) {
      form.value = {
        profile_id: (v.profile_id ?? v.profile) ?? null,
        depth_from: v.depth_from ?? null,
        depth_to: v.depth_to ?? null,
        color: v.color ?? '',
        texture: v.texture ?? '',
        structure: v.structure ?? '',
        moisture: v.moisture ?? '',
        ph_level: v.ph_level ?? null,
        organic_matter: v.organic_matter ?? null,
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
    profile_id: null,
    depth_from: null,
    depth_to: null,
    color: '',
    texture: '',
    structure: '',
    moisture: '',
    ph_level: null,
    organic_matter: null,
    description: '',
  }
}

function handleSubmit() {
  error.value = null
  if (!canSubmit.value) { error.value = 'Выберите профиль'; return }
  isSubmitting.value = true
  const raw = { ...form.value }
  const payload = {
    profile: raw.profile_id,
    depth_from: raw.depth_from,
    depth_to: raw.depth_to,
    color: raw.color,
    texture: raw.texture,
    structure: raw.structure,
    moisture: raw.moisture,
    ph_level: raw.ph_level,
    organic_matter: raw.organic_matter,
    description: raw.description,
  }
  Object.keys(payload).forEach((k) => { const v = payload[k]; if (v === '' || v === null || v === undefined) delete payload[k] })
  const cb = (err) => { isSubmitting.value = false; if (err) error.value = err; else reset() }
  if (props.isEdit) emit('update', payload, cb)
  else emit('create', payload, cb)
}
</script>

<template>
  <ModalCenter :modalId="modalId" :title="isEdit ? 'Редактировать слой' : 'Добавить слой'" :showFooter="true">
    <div class="d-flex flex-column gap-3">
      <div v-if="error" class="alert alert-danger">{{ error }}</div>
      <div class="row g-3">
        <div class="col-12 col-md-6">
          <label class="form-label">Профиль *</label>
          <ProfileSelect v-model="form.profile_id" />
        </div>
        <div class="col-12 col-md-3">
          <label class="form-label">Глубина от</label>
          <input class="form-control" type="number" step="0.01" v-model.number="form.depth_from" />
        </div>
        <div class="col-12 col-md-3">
          <label class="form-label">Глубина до</label>
          <input class="form-control" type="number" step="0.01" v-model.number="form.depth_to" />
        </div>
        <div class="col-12 col-md-4">
          <label class="form-label">Цвет</label>
          <input class="form-control" v-model="form.color" />
        </div>
        <div class="col-12 col-md-4">
          <label class="form-label">Текстура</label>
          <input class="form-control" v-model="form.texture" />
        </div>
        <div class="col-12 col-md-4">
          <label class="form-label">Структура</label>
          <input class="form-control" v-model="form.structure" />
        </div>
        <div class="col-12 col-md-4">
          <label class="form-label">Влажность</label>
          <input class="form-control" v-model="form.moisture" />
        </div>
        <div class="col-12 col-md-4">
          <label class="form-label">pH</label>
          <input class="form-control" type="number" step="0.01" v-model.number="form.ph_level" />
        </div>
        <div class="col-12 col-md-4">
          <label class="form-label">Орг. вещество</label>
          <input class="form-control" type="number" step="0.01" v-model.number="form.organic_matter" />
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


