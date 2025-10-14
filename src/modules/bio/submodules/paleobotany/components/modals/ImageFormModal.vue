<script setup>
import { ref, computed, watch } from 'vue'
import ModalCenter from '@/modules/bio/shared/components/ModalCenter.vue'
import SampleSelect from '@/modules/bio/submodules/paleobotany/components/SampleSelect.vue'

const props = defineProps({
  modalId: { type: String, required: true },
  initialData: { type: Object, default: () => null },
  isEdit: { type: Boolean, default: false },
})

const emit = defineEmits(['create', 'update'])

const error = ref(null)
const isSubmitting = ref(false)

const form = ref({
  sample_id: null,
  magnification: '',
  description: '',
})
const file = ref(null)

watch(
  () => props.initialData,
  (v) => {
    if (v) {
      form.value = {
        sample_id: (v.sample_id ?? v.sample) ?? null,
        magnification: v.magnification ?? '',
        description: v.description ?? '',
      }
      file.value = null
    } else reset()
  },
  { immediate: true },
)

const canSubmit = computed(() => {
  if (props.isEdit) return true
  return !!form.value.sample_id && !!file.value
})

function reset() {
  error.value = null
  form.value = {
    sample_id: null,
    magnification: '',
    description: '',
  }
  file.value = null
}

function handleFileChange(e) {
  const f = e?.target?.files?.[0] || null
  file.value = f
}

function handleSubmit() {
  error.value = null
  if (!canSubmit.value) {
    error.value = props.isEdit ? 'Заполните обязательные поля' : 'Выберите образец и файл изображения'
    return
  }
  isSubmitting.value = true
  let payload
  let isMultipart = false
  if (!props.isEdit || file.value) {
    // create или update с заменой файла
    const fd = new FormData()
    if (form.value.sample_id != null) fd.append('sample', form.value.sample_id)
    if (file.value) fd.append('file', file.value)
    if (form.value.magnification) fd.append('magnification', form.value.magnification)
    if (form.value.description) fd.append('description', form.value.description)
    payload = fd
    isMultipart = true
  } else {
    payload = {
      sample: form.value.sample_id,
      magnification: form.value.magnification || undefined,
      description: form.value.description || undefined,
    }
  }
  const cb = (err) => {
    isSubmitting.value = false
    if (err) error.value = err
    else reset()
  }
  if (props.isEdit) emit('update', payload, cb, isMultipart)
  else emit('create', payload, cb, isMultipart)
}
</script>

<template>
  <ModalCenter :modalId="modalId" :title="isEdit ? 'Редактировать изображение' : 'Добавить изображение'" :showFooter="true">
    <div class="d-flex flex-column gap-3">
      <div v-if="error" class="alert alert-danger">{{ error }}</div>
      <div class="row g-3">
        <div class="col-12 col-md-6">
          <label class="form-label">Образец *</label>
          <SampleSelect v-model="form.sample_id" />
        </div>
        <div class="col-12 col-md-6">
          <label class="form-label">Файл изображения</label>
          <input class="form-control" type="file" accept="image/*" @change="handleFileChange" />
        </div>
        <div class="col-12 col-md-6">
          <label class="form-label">Увеличение</label>
          <input class="form-control" v-model="form.magnification" />
        </div>
        <div class="col-12">
          <label class="form-label">Описание</label>
          <textarea class="form-control" rows="2" v-model="form.description" />
        </div>
      </div>
    </div>
    <template #footer>
      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
      <button type="button" class="btn btn-primary" :disabled="isSubmitting" @click="handleSubmit">
        <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-1"></span>
        Сохранить
      </button>
    </template>
  </ModalCenter>
</template>

<style scoped></style>


