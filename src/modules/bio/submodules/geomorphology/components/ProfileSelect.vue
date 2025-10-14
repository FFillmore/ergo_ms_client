<script setup>
import { apiClient } from '@/js/api/manager'
import { bioEndpoints as endpoints } from '@/modules/bio/js/endpoints'
import SearchableDropdown from '@/modules/bio/shared/components/SearchableDropdown.vue'

const props = defineProps({
  modelValue: { type: [Number, String, null], default: null },
  placeholder: { type: String, default: 'Выберите профиль' },
})

const emit = defineEmits(['update:modelValue', 'change'])

const fetchProfiles = async (query, page) => {
  const params = { page }
  if (query) params.profile_id = query
  try {
    const r = await apiClient.get(endpoints.bio.geomorphology.profiles, params)
    let list = r?.data?.results || r?.data || []
    if (query) {
      const q = String(query).toLowerCase()
      list = list.filter(s => String(s.profile_id || '').toLowerCase().includes(q))
    }
    const items = list.map(s => ({ value: (s.id ?? s.pk), label: s.profile_id || `ID ${s.id ?? s.pk}` }))
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
    :fetchOptions="fetchProfiles"
  />
</template>

<style scoped></style>


