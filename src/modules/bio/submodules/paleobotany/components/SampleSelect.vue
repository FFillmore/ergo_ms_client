<script setup>
import { apiClient } from '@/js/api/manager'
import { bioEndpoints as endpoints } from '@/modules/bio/js/endpoints'
import SearchableDropdown from '@/modules/bio/shared/components/SearchableDropdown.vue'

const props = defineProps({
  modelValue: { type: [Number, String, null], default: null },
  placeholder: { type: String, default: 'Выберите образец' },
})

const emit = defineEmits(['update:modelValue', 'change'])

const fetchSamples = async (query, page) => {
  const params = { page }
  if (query) params.sample_id = query
  try {
    const r = await apiClient.get(endpoints.bio.paleobotany.samples, params)
    let list = r?.data?.results || r?.data || []
    if (query) {
      const q = String(query).toLowerCase()
      list = list.filter(s => String(s.sample_id || '').toLowerCase().includes(q))
    }
    const items = list.map(s => ({ value: (s.id ?? s.pk), label: s.sample_id || `ID ${s.id ?? s.pk}` }))
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
    :fetchOptions="fetchSamples"
  />
</template>

<style scoped></style>


