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

const form = ref({ name: '', description: '' })

watch(
  () => props.initialData,
  (v) => {
    if (v) {
      form.value = { name: v.name ?? '', description: v.description ?? '' }
    } else reset()
  },
  { immediate: true },
)

const canSubmit = computed(() => !!form.value.name)

function reset() {
  error.value = null
  form.value = { name: '', description: '' }
}

function handleSubmit() {
  error.value = null
  if (!canSubmit.value) { error.value = 'Укажите название списка'; return }
  isSubmitting.value = true
  const payload = { name: form.value.name, description: form.value.description }
  Object.keys(payload).forEach(k => { const v = payload[k]; if (v === '' || v == null) delete payload[k] })
  const cb = (err) => { isSubmitting.value = false; if (err) error.value = err; else reset() }
  if (props.isEdit) emit('update', payload, cb)
  else emit('create', payload, cb)
}
</script>

<template>
  <ModalCenter :modalId="modalId" :title="isEdit ? 'Редактировать список' : 'Добавить список'" :showFooter="true">
    <div class="d-flex flex-column gap-3">
      <div v-if="error" class="alert alert-danger">{{ error }}</div>
      <div class="row g-3">
        <div class="col-12 col-md-6">
          <label class="form-label">Название *</label>
          <input class="form-control" v-model="form.name" />
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


