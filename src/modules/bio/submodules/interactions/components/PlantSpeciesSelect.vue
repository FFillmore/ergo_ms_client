<script setup>
import { apiClient } from '@/js/api/manager'
import { bioEndpoints as endpoints } from '@/modules/bio/js/endpoints'
import SearchableDropdown from '@/modules/bio/shared/components/SearchableDropdown.vue'

const props = defineProps({
  modelValue: { type: [Number, String, null], default: null },
  placeholder: { type: String, default: 'Выберите вид растения' },
})

const emit = defineEmits(['update:modelValue', 'change'])

const fetchSpecies = async (query, page) => {
  // Бэкенд поддерживает фильтры title/author; чтобы избежать слишком строгого AND,
  // отправляем только title, а client-side оставим мягкую фильтрацию.
  const params = { page }
  if (query) params.title = query
  try {
    const r = await apiClient.get(endpoints.bio.species, params)
    let list = r?.data?.results || r?.data || []
    if (query) {
      const q = String(query).toLowerCase()
      list = list.filter(s =>
        String(s.title || '').toLowerCase().includes(q) ||
        String(s.author || '').toLowerCase().includes(q)
      )
    }
    const items = list.map(s => ({
      value: (s.species_id),
      label: (s.title ? `${s.title}${s.author ? ' ' + s.author : ''}` : `ID ${s.species_id}`)
    }))
    const hasMore = !!r?.data?.next
    return { items, hasMore }
  } catch {
    return { items: [], hasMore: false }
  }
}

const onChange = (val) => {
  emit('update:modelValue', val)
  emit('change', val)
}
</script>

<template>
  <SearchableDropdown
    :modelValue="modelValue"
    @update:modelValue="val => emit('update:modelValue', val)"
    @change="onChange"
    :placeholder="placeholder"
    :fetchOptions="fetchSpecies"
  />
</template>

<style scoped></style>


