<script setup>
import { apiClient } from '@/js/api/manager'
import { bioEndpoints as endpoints } from '@/modules/bio/js/endpoints'
import SearchableDropdown from '@/modules/bio/shared/components/SearchableDropdown.vue'

const props = defineProps({
  modelValue: { type: [Number, String, null], default: null },
  placeholder: { type: String, default: 'Выберите площадку' },
})

const emit = defineEmits(['update:modelValue', 'change'])

const fetchSites = async (query, page) => {
  const params = { page }
  if (query) params.search = query
  try {
    const r = await apiClient.get(endpoints.bio.sites, params)
    let list = r?.data?.results || r?.data || []
    if (query) {
      const q = String(query).toLowerCase()
      list = list.filter(s =>
        String(s.site_number || '').toLowerCase().includes(q) ||
        String(s.zone_type || '').toLowerCase().includes(q) ||
        String(s.district || '').toLowerCase().includes(q)
      )
    }
    const items = list.map((s) => ({
      value: s.id,
      label: `№${s.site_number} • ${s.zone_type}${s.district ? ' • ' + s.district : ''}`,
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
    :fetchOptions="fetchSites"
  />
  
</template>

<style scoped></style>


