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
  latin_name: '',
  title: '',
  author: '',
  taxon_type: '',
  conservation_status: '',
  habitat_type: '',
})

watch(
  () => props.initialData,
  (v) => {
    if (v) {
      form.value = {
        latin_name: v.latin_name || '',
        title: v.title || '',
        author: v.author || '',
        taxon_type: v.taxon_type || '',
        conservation_status: v.conservation_status || '',
        habitat_type: v.habitat_type || '',
      }
    } else {
      reset()
    }
  },
  { immediate: true },
)

const canSubmit = computed(() => !!form.value.latin_name && !!form.value.author)

function reset() {
  error.value = null
  form.value = {
    latin_name: '',
    title: '',
    author: '',
    taxon_type: '',
    conservation_status: '',
    habitat_type: '',
  }
}

function handleSubmit() {
  error.value = null
  if (!canSubmit.value) {
    error.value = 'Укажите латинское название и автора'
    return
  }
  isSubmitting.value = true
  const payload = { ...form.value }
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
  <ModalCenter :modalId="modalId" :title="isEdit ? 'Редактировать вид' : 'Добавить вид'" :showFooter="true">
    <div class="d-flex flex-column gap-3">
      <div v-if="error" class="alert alert-danger">{{ error }}</div>
      <div class="row g-3">
        <div class="col-12 col-md-6">
          <label class="form-label">Латинское название *</label>
          <input class="form-control" v-model="form.latin_name" placeholder="Panthera leo" />
        </div>
        <div class="col-12 col-md-6">
          <label class="form-label">Название</label>
          <input class="form-control" v-model="form.title" placeholder="Лев" />
        </div>
        <div class="col-12 col-md-6">
          <label class="form-label">Автор *</label>
          <input class="form-control" v-model="form.author" />
        </div>
        <div class="col-12 col-md-6">
          <label class="form-label">Таксономическая группа</label>
          <input class="form-control" v-model="form.taxon_type" placeholder="Mammalia / Carnivora / Felidae" />
        </div>
        <div class="col-12 col-md-6">
          <label class="form-label">Статус охраны</label>
          <input class="form-control" v-model="form.conservation_status" placeholder="LC/NT/VU/EN/CR" />
        </div>
        <div class="col-12 col-md-6">
          <label class="form-label">Тип местообитания</label>
          <input class="form-control" v-model="form.habitat_type" placeholder="Леса, саванны…" />
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


