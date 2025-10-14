<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number, Object, null], default: null },
  placeholder: { type: String, default: 'Выберите…' },
  fetchOptions: { type: Function, required: false }, // async (query, page) => { items, hasMore }
  options: { type: Array, default: () => [] },
  labelKey: { type: String, default: 'label' },
  valueKey: { type: String, default: 'value' },
  debounceMs: { type: Number, default: 350 },
  disabled: { type: Boolean, default: false },
  clearable: { type: Boolean, default: true },
})

const emit = defineEmits(['update:modelValue', 'change'])

const isOpen = ref(false)
const query = ref('')
const loading = ref(false)
const items = ref([])
const selectedLabel = ref('')
const page = ref(1)
const hasMore = ref(false)
let t = null

const reset = () => {
  items.value = []
  page.value = 1
  hasMore.value = false
}

const load = async (isLoadMore = false) => {
  if (!props.fetchOptions) return
  loading.value = true
  try {
    const currentPage = isLoadMore ? page.value + 1 : 1
    const res = await props.fetchOptions(query.value.trim(), currentPage)
    const nextItems = Array.isArray(res?.items) ? res.items : []
    items.value = isLoadMore ? [...items.value, ...nextItems] : nextItems
    hasMore.value = !!res?.hasMore
    page.value = currentPage
  } finally {
    loading.value = false
  }
}

const onInput = (val) => {
  query.value = val
  if (t) clearTimeout(t)
  t = setTimeout(async () => {
    reset()
    await load(false)
  }, props.debounceMs)
}

const selectItem = (item) => {
  const value = props.valueKey ? item?.[props.valueKey] : item
  const label = props.labelKey ? item?.[props.labelKey] : String(item ?? '')
  selectedLabel.value = label || ''
  emit('update:modelValue', value)
  emit('change', value)
  isOpen.value = false
}

const clear = () => {
  if (!props.clearable) return
  emit('update:modelValue', null)
  emit('change', null)
  selectedLabel.value = ''
}

const onToggle = async () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  if (isOpen.value && props.fetchOptions && items.value.length === 0) {
    reset()
    await load(false)
  }
}

const loadMore = async () => {
  if (!hasMore.value || loading.value) return
  await load(true)
}

onMounted(() => {
  if (!props.fetchOptions) {
    items.value = props.options
  }
})

watch(() => props.options, (v) => {
  if (!props.fetchOptions) items.value = Array.isArray(v) ? v : []
})

watch(() => props.modelValue, (val) => {
  if (val == null) { selectedLabel.value = ''; return }
  // try to derive label from current items/options
  const list = items.value
  const found = list.find(it => (props.valueKey ? it?.[props.valueKey] : it) === val)
  if (found) {
    selectedLabel.value = props.labelKey ? (found?.[props.labelKey] ?? '') : String(found ?? '')
  }
})
</script>

<template>
  <div class="searchable-dropdown" :class="{ disabled }">
    <div class="sd-toggle" @click="onToggle">
      <span class="sd-value">
        <slot name="selected" :value="modelValue" :label="selectedLabel">
          {{ selectedLabel || modelValue || placeholder }}
        </slot>
      </span>
      <span class="sd-caret" />
    </div>

    <div v-if="isOpen" class="sd-menu">
      <div class="sd-input">
        <input :placeholder="placeholder" type="text" :disabled="disabled" @input="onInput($event.target.value)" />
        <button v-if="clearable" class="btn-clear" @click.stop="clear">×</button>
      </div>

      <div class="sd-items">
        <template v-if="loading && items.length === 0">
          <div class="sd-empty">Загрузка…</div>
        </template>
        <template v-else-if="items.length === 0">
          <div class="sd-empty">Ничего не найдено</div>
        </template>
        <template v-else>
          <a v-for="it in items" :key="it[valueKey] ?? it" href="#" class="sd-item" @click.prevent="selectItem(it)">
            <slot name="item" :item="it">
              {{ it[labelKey] ?? it }}
            </slot>
          </a>
          <button v-if="hasMore" class="sd-more" :disabled="loading" @click="loadMore">Загрузить ещё…</button>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.searchable-dropdown {
  position: relative;
  width: 100%;
  &.disabled { opacity: .6; pointer-events: none; }

  .sd-toggle {
    display: flex; align-items: center; justify-content: space-between;
    min-height: 36px; padding: 0.5rem; cursor: pointer; border: 1px solid var(--color-border);
    .sd-caret { width: 0; height: 0; border-left: 4px solid transparent; border-right: 4px solid transparent; border-top: 6px solid var(--color-secondary-text); }
  }

  .sd-menu {
    position: absolute; z-index: 1050; left: 0; right: 0; background: var(--color-primary-background);
    border: 1px solid var(--color-border); border-top: none; box-shadow: 0 4px 10px rgba(0,0,0,.1);
  }

  .sd-input { display: flex; align-items: center; gap: .25rem; padding: .5rem;
    input { width: 100%; border: 1px solid var(--color-border); padding: .35rem .5rem; }
    .btn-clear { border: none; background: transparent; font-size: 16px; line-height: 1; color: var(--color-secondary-text); }
  }

  .sd-items { max-height: 220px; overflow: auto; }
  .sd-item { display: block; padding: .4rem .75rem; color: var(--color-primary-text); text-decoration: none; &:hover { background: var(--color-hover-background); } }
  .sd-empty { padding: .75rem; color: var(--color-secondary-text); }
  .sd-more { width: 100%; text-align: center; background: transparent; border: none; padding: .5rem; color: var(--bs-primary); }
}
</style>


