<template>
  <span class="status-badge" :class="statusClass">
    <component :is="statusIcon" :size="12" class="me-1" />
    {{ statusText }}
  </span>
</template>

<script>
import { Clock, Loader2, CheckCircle, AlertTriangle } from 'lucide-vue-next'
import { getStatusText, getStatusClass } from '../js/utils.js'

export default {
  name: 'StatusBadge',
  components: {
    Clock,
    Loader2,
    CheckCircle,
    AlertTriangle
  },
  props: {
    status: {
      type: String,
      required: true
    },
    size: {
      type: String,
      default: 'sm' // sm, md, lg
    }
  },
  computed: {
    statusText() {
      return getStatusText(this.status)
    },
    statusClass() {
      const baseClass = getStatusClass(this.status)
      return `${baseClass} status-badge-${this.size}`
    },
    statusIcon() {
      const iconMap = {
        'pending': Clock,
        'processing': Loader2,
        'completed': CheckCircle,
        'failed': AlertTriangle
      }
      return iconMap[this.status] || Clock
    }
  }
}
</script>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  font-weight: 500;
  border-radius: 20px;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.status-badge-sm {
  padding: 0.125rem 0.5rem;
  font-size: 0.7rem;
}

.status-badge-md {
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
}

.status-badge-lg {
  padding: 0.375rem 1rem;
  font-size: 0.8rem;
}

.status-pending {
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.status-processing {
  background-color: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

.status-completed {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-failed {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.status-badge svg {
  flex-shrink: 0;
}
</style>
