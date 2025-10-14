<script setup>
import { apiClient } from '@/js/api/manager'
import { bioEndpoints as endpoints } from '@/modules/bio/js/endpoints'
import SearchableDropdown from '@/modules/bio/shared/components/SearchableDropdown.vue'

const props = defineProps({
  modelValue: { type: [Number, String, null], default: null },
  placeholder: { type: String, default: 'Выберите стадию' },
  successionId: { type: [Number, String, null], default: null },
})

const emit = defineEmits(['update:modelValue', 'change'])

const fetchStages = async (query, page) => {
  const params = { page }
  if (query) params.search = query
  if (props.successionId) params.succession_id = props.successionId
  try {
    const r = await apiClient.get(endpoints.bio.successions.stages, params)
    let list = r?.data?.results || r?.data || []
    if (query) {
      const q = String(query).toLowerCase()
      list = list.filter(s =>
        String(s.name || '').toLowerCase().includes(q) ||
        String(s.stage_number || '').toLowerCase().includes(q)
      )
    }
    const items = list.map(s => ({ value: (s.id ?? s.pk), label: (s.name || `Стадия ${s.stage_number || ''}`).trim() }))
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
    :fetchOptions="fetchStages"
  />
</template>

<style scoped></style>


