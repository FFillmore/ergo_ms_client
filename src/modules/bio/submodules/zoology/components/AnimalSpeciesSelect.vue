<script setup>
import { apiClient } from '@/js/api/manager'
import { bioEndpoints as endpoints } from '@/modules/bio/js/endpoints'
import SearchableDropdown from '@/modules/bio/shared/components/SearchableDropdown.vue'

const props = defineProps({
  modelValue: { type: [Number, String, null], default: null },
  placeholder: { type: String, default: 'Выберите вид животного' },
})

const emit = defineEmits(['update:modelValue', 'change'])

const fetchSpecies = async (query, page) => {
  // Отправляем один параметр для мягкого поиска и добавляем client-side матчинг
  const params = { page }
  if (query) params.title = query
  try {
    const r = await apiClient.get(endpoints.bio.zoology.species, params)
    let list = r?.data?.results || r?.data || []
    if (query) {
      const q = String(query).toLowerCase()
      list = list.filter(s =>
        String(s.title || '').toLowerCase().includes(q) ||
        String(s.latin_name || '').toLowerCase().includes(q) ||
        String(s.author || '').toLowerCase().includes(q)
      )
    }
    const items = list.map(s => ({
      value: s.species_id,
      label: (s.latin_name ? `${s.latin_name}${s.author ? ' ' + s.author : ''}` : (s.title || `ID ${s.species_id}`))
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


