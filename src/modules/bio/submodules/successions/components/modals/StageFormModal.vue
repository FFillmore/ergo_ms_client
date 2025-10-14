<script setup>
import { ref, computed, watch } from 'vue'
import ModalCenter from '@/modules/bio/shared/components/ModalCenter.vue'
import SuccessionSelect from '@/modules/bio/submodules/successions/components/SuccessionSelect.vue'

const props = defineProps({
  modalId: { type: String, required: true },
  initialData: { type: Object, default: () => null },
  isEdit: { type: Boolean, default: false },
})

const emit = defineEmits(['create', 'update'])

const error = ref(null)
const isSubmitting = ref(false)

const form = ref({
  succession_id: null,
  stage_number: null,
  name: '',
  description: '',
  start_date: '',
  end_date: '',
  duration_years: null,
})

watch(
  () => props.initialData,
  (v) => {
    if (v) {
      form.value = {
        succession_id: (v.succession_id ?? v.succession) ?? null,
        stage_number: v.stage_number ?? null,
        name: v.name ?? '',
        description: v.description ?? '',
        start_date: v.start_date ?? '',
        end_date: v.end_date ?? '',
        duration_years: v.duration_years ?? null,
      }
    } else reset()
  },
  { immediate: true },
)

const canSubmit = computed(() => !!form.value.succession_id && !!form.value.stage_number)

function reset() {
  error.value = null
  form.value = {
    succession_id: null,
    stage_number: null,
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    duration_years: null,
  }
}

function handleSubmit() {
  error.value = null
  if (!canSubmit.value) {
    error.value = 'Укажите сукцессию и номер стадии'
    return
  }
  isSubmitting.value = true
  const raw = { ...form.value }
  const payload = {
    succession: raw.succession_id,
    stage_number: raw.stage_number,
    name: raw.name,
    description: raw.description,
    start_date: raw.start_date || null,
    end_date: raw.end_date || null,
    duration_years: raw.duration_years,
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
  <ModalCenter :modalId="modalId" :title="isEdit ? 'Редактировать стадию' : 'Добавить стадию'" :showFooter="true">
    <div class="d-flex flex-column gap-3">
      <div v-if="error" class="alert alert-danger">{{ error }}</div>
      <div class="row g-3">
        <div class="col-12 col-md-6">
          <label class="form-label">Сукцессия *</label>
          <SuccessionSelect v-model="form.succession_id" />
        </div>
        <div class="col-12 col-md-6">
          <label class="form-label">Номер стадии *</label>
          <input class="form-control" type="number" v-model.number="form.stage_number" />
        </div>
        <div class="col-12 col-md-6">
          <label class="form-label">Название</label>
          <input class="form-control" v-model="form.name" />
        </div>
        <div class="col-12 col-md-6">
          <label class="form-label">Длительность (лет)</label>
          <input class="form-control" type="number" v-model.number="form.duration_years" />
        </div>
        <div class="col-12 col-md-6">
          <label class="form-label">Начало</label>
          <input class="form-control" type="date" v-model="form.start_date" />
        </div>
        <div class="col-12 col-md-6">
          <label class="form-label">Окончание</label>
          <input class="form-control" type="date" v-model="form.end_date" />
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


