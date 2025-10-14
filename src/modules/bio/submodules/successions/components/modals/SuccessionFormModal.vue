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
  name: '',
  succession_type: '',
  description: '',
  start_date: '',
  site_id: null,
})

watch(
  () => props.initialData,
  (v) => {
    if (v) {
      form.value = {
        name: v.name ?? '',
        succession_type: v.succession_type ?? '',
        description: v.description ?? '',
        start_date: v.start_date ?? '',
        site_id: (v.site_id ?? v.site) ?? null,
      }
    } else reset()
  },
  { immediate: true },
)

const canSubmit = computed(() => !!form.value.name)

function reset() {
  error.value = null
  form.value = {
    name: '',
    succession_type: '',
    description: '',
    start_date: '',
    site_id: null,
  }
}

function handleSubmit() {
  error.value = null
  if (!canSubmit.value) {
    error.value = 'Укажите название сукцессии'
    return
  }
  isSubmitting.value = true
  const raw = { ...form.value }
  const payload = {
    name: raw.name,
    succession_type: raw.succession_type,
    description: raw.description,
    start_date: raw.start_date || null,
    site: raw.site_id,
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
  <ModalCenter :modalId="modalId" :title="isEdit ? 'Редактировать сукцессию' : 'Добавить сукцессию'" :showFooter="true">
    <div class="d-flex flex-column gap-3">
      <div v-if="error" class="alert alert-danger">{{ error }}</div>
      <div class="row g-3">
        <div class="col-12 col-md-6">
          <label class="form-label">Название *</label>
          <input class="form-control" v-model="form.name" />
        </div>
        <div class="col-12 col-md-6">
          <label class="form-label">Тип сукцессии</label>
          <input class="form-control" v-model="form.succession_type" />
        </div>
        <div class="col-12 col-md-6">
          <label class="form-label">Площадка</label>
          <SiteSelect v-model="form.site_id" />
        </div>
        <div class="col-12 col-md-6">
          <label class="form-label">Начальная дата</label>
          <input class="form-control" type="date" v-model="form.start_date" />
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


