<template>
  <div class="number-input-group">
    <label v-if="label" class="form-label d-flex align-items-center gap-2">
      <component v-if="icon" :is="icon" :size="16" />
      <span class="fw-semibold">{{ label }}</span>
    </label>
    <div class="input-group">
      <span class="input-group-text d-inline-flex align-items-center">
        <Hash :size="16" />
      </span>
      <input
        v-model.trim="localValue"
        type="text"
        class="form-control"
        :placeholder="placeholder"
        @keyup.enter="$emit('submit', localValue)"
        @input="onInput"
        @blur="onBlur"
      />
      <button
        v-if="showButton"
        class="btn d-inline-flex align-items-center gap-1 lh-1"
        :class="buttonClass"
        :disabled="!canSubmit || loading"
        @click="$emit('submit', localValue)"
      >
        <component v-if="loading" :is="loadingIcon" :size="16" />
        <component v-else :is="buttonIcon" :size="16" />
        <span v-if="loading">{{ loadingText }}</span>
        <span v-else>{{ buttonText }}</span>
      </button>
    </div>
    <div v-if="helpText" class="form-text text-muted mt-2">
      <Info class="me-1" size="14" />
      {{ helpText }}
    </div>
    <div v-if="parsedNumbers.length > 0" class="parsed-numbers mt-2">
      <small class="text-muted">
        Найдено номеров: {{ parsedNumbers.length }}
        <span v-if="parsedNumbers.length <= 10" class="ms-2">
          ({{ parsedNumbers.join(', ') }})
        </span>
        <span v-else class="ms-2">
          ({{ parsedNumbers.slice(0, 10).join(', ') }}...)
        </span>
      </small>
    </div>
  </div>
</template>

<script>
import { Hash, Info, Loader2 } from 'lucide-vue-next'
import { parseAnalysisNumbers } from '../js/utils.js'

export default {
  name: 'NumberInput',
  components: {
    Hash,
    Info,
    Loader2
  },
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    label: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: 'Введите номера анализов через запятую или тире для диапазонов'
    },
    helpText: {
      type: String,
      default: 'Введите номера анализов через запятую или тире для диапазонов.'
    },
    icon: {
      type: [String, Object],
      default: null
    },
    showButton: {
      type: Boolean,
      default: true
    },
    buttonText: {
      type: String,
      default: 'Выполнить'
    },
    buttonClass: {
      type: String,
      default: 'btn-primary'
    },
    buttonIcon: {
      type: [String, Object],
      default: null
    },
    loading: {
      type: Boolean,
      default: false
    },
    loadingText: {
      type: String,
      default: 'Выполняется...'
    },
    loadingIcon: {
      type: [String, Object],
      default: Loader2
    }
  },
  emits: ['update:modelValue', 'submit', 'input', 'blur'],
  data() {
    return {
      localValue: this.modelValue
    }
  },
  computed: {
    canSubmit() {
      return this.localValue.trim().length > 0 && this.parsedNumbers.length > 0
    },
    parsedNumbers() {
      return parseAnalysisNumbers(this.localValue)
    }
  },
  watch: {
    modelValue(newVal) {
      this.localValue = newVal
    },
    localValue(newVal) {
      this.$emit('update:modelValue', newVal)
    }
  },
  methods: {
    onInput() {
      this.$emit('input', this.localValue)
    },
    onBlur() {
      this.$emit('blur', this.localValue)
    }
  }
}
</script>

<style scoped>
.number-input-group {
  margin-bottom: 1rem;
}

.input-group-text {
  background-color: #f8f9fa;
  border-color: #dee2e6;
  color: #6c757d;
}

.form-control {
  border-left: 0;
  border-right: 0;
}

.form-control:focus {
  border-color: #007bff;
  box-shadow: none;
}

.btn {
  border-radius: 6px;
  font-size: 0.875rem;
  padding: 0.375rem 0.75rem;
}

.form-text {
  font-size: 0.8rem;
  color: #6c757d;
  display: flex;
  align-items: center;
}

.parsed-numbers {
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.parsed-numbers small {
  font-size: 0.75rem;
}
</style>
