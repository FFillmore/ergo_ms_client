<template>
  <div class="card collapsible-card mb-3" :class="cardClass">
    <div class="card-header collapsible-header" @click="toggleCollapsed">
      <div class="d-flex align-items-center gap-2">
        <div v-if="icon" class="card-icon">
          <component :is="icon" :size="20" />
        </div>
        <h6 class="mb-0 fw-bold">{{ title }}</h6>
        <span class="badge ms-auto" :class="badgeClass">{{ badgeText }}</span>
        <div class="collapse-icon">
          <ChevronDown :size="16" :class="{ 'rotated': !collapsed }" />
        </div>
      </div>
    </div>
    <div v-show="!collapsed" class="card-body">
      <slot></slot>
    </div>
  </div>
</template>

<script>
import { ChevronDown } from 'lucide-vue-next'

export default {
  name: 'CollapsibleCard',
  components: {
    ChevronDown
  },
  props: {
    title: {
      type: String,
      required: true
    },
    badgeText: {
      type: String,
      required: true
    },
    badgeClass: {
      type: String,
      default: 'bg-primary'
    },
    icon: {
      type: [String, Object, Function],
      required: false,
      default: null
    },
    cardClass: {
      type: String,
      default: ''
    },
    defaultCollapsed: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      collapsed: this.defaultCollapsed
    }
  },
  methods: {
    toggleCollapsed() {
      this.collapsed = !this.collapsed
      this.$emit('toggle', this.collapsed)
    }
  }
}
</script>

<style scoped>
.collapsible-card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  border: none;
}

.collapsible-header {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s ease;
  border-radius: 15px 15px 0 0 !important;
  padding: 1rem 1.5rem;
}

.collapsible-header:hover {
  background-color: rgba(0, 123, 255, 0.1);
}

.card-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.collapse-icon {
  transition: transform 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}

.collapse-icon.rotated {
  transform: rotate(180deg);
}

.collapsible-card .d-flex.align-items-center svg {
  vertical-align: middle;
  display: inline-block;
}

.collapsible-card .card-header .d-flex.align-items-center svg {
  vertical-align: middle;
  display: inline-block;
  margin-top: -1px;
}

.collapsible-card .form-label svg {
  vertical-align: middle;
  display: inline-block;
  margin-top: -1px;
}

.collapsible-card .btn svg {
  vertical-align: middle;
  display: inline-block;
  margin-top: -1px;
}

.collapsible-card .btn.d-inline-flex.align-items-center {
  align-items: center;
}

.collapsible-card .btn.d-inline-flex.align-items-center svg {
  flex-shrink: 0;
  margin-top: 0;
}

.collapsible-card .input-group-text svg {
  vertical-align: middle;
  display: inline-block;
  margin-top: -1px;
}

.collapsible-card .form-text svg {
  vertical-align: middle;
  display: inline-block;
  margin-top: -1px;
}

.collapsible-card .form-text {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.collapsible-card .form-text svg {
  flex-shrink: 0;
  margin-top: 0;
}

@media (max-width: 768px) {
  .collapsible-card .card-body {
    padding: 1rem;
  }
}
</style>
