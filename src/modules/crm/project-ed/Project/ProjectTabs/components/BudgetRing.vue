<template>
  <div class="budget-ring">
    <div class="budget-ring-circle">
      <svg class="budget-ring-svg" viewBox="0 0 100 100">
        <!-- Фон кольца -->
        <circle
          cx="50"
          cy="50"
          :r="radius"
          fill="none"
          stroke="#e9ecef"
          stroke-width="8"
        />
        <!-- Прогресс кольца -->
        <circle
          cx="50"
          cy="50"
          :r="radius"
          fill="none"
          :stroke="ringColor"
          stroke-width="8"
          stroke-linecap="round"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="strokeDashoffset"
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div class="budget-ring-content">
        <div class="budget-percentage" :style="{ color: ringColor }">{{ percentage }}%</div>
        <div class="budget-label">{{ label }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  percentage: {
    type: Number,
    required: true,
    validator: (value) => value >= 0 && value <= 100
  },
  label: {
    type: String,
    default: 'Бюджет'
  },
  radius: {
    type: Number,
    default: 45
  }
})

// Цвет кольца в зависимости от процента
const ringColor = computed(() => {
  if (props.percentage >= 50) return '#28a745' // зеленый
  if (props.percentage >= 25) return '#ffc107' // желтый
  return '#dc3545' // красный
})

// Константы для SVG кольца
const circumference = computed(() => 2 * Math.PI * props.radius)

const strokeDashoffset = computed(() => {
  const progress = props.percentage / 100
  return circumference.value - (progress * circumference.value)
})
</script>

<style scoped lang="scss">
.budget-ring {
  flex-shrink: 0;
}

.budget-ring-circle {
  position: relative;
  width: 140px;
  height: 140px;
}

.budget-ring-svg {
  width: 100%;
  height: 100%;
}

.budget-ring-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.budget-percentage {
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1;
}

.budget-label {
  font-size: 0.875rem;
  color: #6c757d;
  margin-top: 0.25rem;
}
</style>
