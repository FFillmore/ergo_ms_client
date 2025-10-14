<template>
  <div class="group-selector">
    <label v-if="label" class="form-label d-flex align-items-center gap-2">
      <Users :size="16" />
      <span class="fw-semibold">{{ label }}</span>
      <span v-if="optional" class="optional-badge">необязательно</span>
    </label>
    <div class="group-select-container">
      <select 
        v-model.number="localValue" 
        class="form-select group-select" 
        @change="onChange"
      >
        <option :value="null">{{ placeholder }}</option>
        <option v-for="group in groups" :key="group.id" :value="group.id">
          {{ group.name }}
          <span v-if="showCount">({{ getGroupCount(group.id) }} анализов)</span>
        </option>
      </select>
      <div class="group-select-icon">
        <ChevronDown :size="16" />
      </div>
    </div>
    <div v-if="helpText" class="form-help">
      {{ helpText }}
    </div>
    <div v-if="selectedGroup && showInfo" class="selected-group-info mt-2">
      <div class="d-flex align-items-center gap-2 text-muted">
        <div class="group-color-indicator" :style="{ backgroundColor: getGroupColor(selectedGroup.id) }"></div>
        <small>Выбрана группа: <strong>{{ selectedGroup.name }}</strong></small>
      </div>
    </div>
  </div>
</template>

<script>
import { Users, ChevronDown } from 'lucide-vue-next'

export default {
  name: 'GroupSelector',
  components: {
    Users,
    ChevronDown
  },
  props: {
    modelValue: {
      type: Number,
      default: null
    },
    groups: {
      type: Array,
      default: () => []
    },
    label: {
      type: String,
      default: 'Группа'
    },
    placeholder: {
      type: String,
      default: 'Выберите группу...'
    },
    helpText: {
      type: String,
      default: 'Выберите группу для организации анализов'
    },
    optional: {
      type: Boolean,
      default: false
    },
    showCount: {
      type: Boolean,
      default: false
    },
    showInfo: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'change'],
  data() {
    return {
      localValue: this.modelValue
    }
  },
  computed: {
    selectedGroup() {
      return this.groups.find(g => g.id === this.localValue)
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
    onChange() {
      this.$emit('change', this.localValue)
    },
    getGroupCount(groupId) {
      // Этот метод должен быть передан из родительского компонента
      return this.$parent.getGroupAnalysesCount ? this.$parent.getGroupAnalysesCount(groupId) : 0
    },
    getGroupColor(groupId) {
      // Этот метод должен быть передан из родительского компонента
      return this.$parent.getGroupColor ? this.$parent.getGroupColor(groupId) : '#007bff'
    }
  }
}
</script>

<style scoped>
.group-selector {
  margin-bottom: 1rem;
}

.group-selector .form-label {
  color: #495057;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.optional-badge {
  display: inline-block;
  background: #e2e8f0;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
  margin-left: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.group-select-container {
  position: relative;
  display: flex;
  align-items: center;
}

.group-select {
  appearance: none;
  padding-right: 3rem;
  cursor: pointer;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  background: #f8fafc;
  width: 100%;
}

.group-select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  background: white;
  outline: none;
}

.group-select:hover {
  border-color: #cbd5e0;
  background: white;
}

.group-select-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  pointer-events: none;
  transition: color 0.2s ease;
}

.group-select:focus + .group-select-icon {
  color: #667eea;
}

.form-help {
  font-size: 0.8rem;
  color: #718096;
  margin-top: 0.5rem;
  line-height: 1.4;
}

.selected-group-info {
  padding: 0.5rem;
  background: rgba(0, 123, 255, 0.1);
  border-radius: 6px;
  border: 1px solid rgba(0, 123, 255, 0.2);
}

.group-color-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}
</style>
