<template>
    <div class="project-dashboard">
    <div class="project-dashboard__header">
        <h6 class="mb-0">Дашборды проекта</h6>
    </div>
    <div class="project-dashboard__body">
    <p class="text-muted small mb-3">
      <i class="bi bi-info-circle me-1"></i>
      Кольцо показывает доступный бюджет (100% = весь бюджет доступен, 0% = бюджет полностью потрачен)
    </p>
    
    <!-- Кольцо бюджета -->
    <div class="budget-ring-container">
      <BudgetRing 
        :percentage="budgetPercentage"
        label="Бюджет"
      />
      
      <div class="budget-info">
        <div class="budget-item">
          <span class="budget-item-label">Потрачено:</span>
          <span class="budget-item-value budget-spent">{{ formatCurrency(budgetSpent) }}</span>
        </div>
        <div class="budget-item">
          <span class="budget-item-label">Остаток:</span>
          <span class="budget-item-value budget-remaining">{{ formatCurrency(budgetRemaining) }}</span>
        </div>
        <div class="budget-item">
          <span class="budget-item-label">Общий бюджет:</span>
          <span class="budget-item-value budget-total">{{ formatCurrency(budgetTotal) }}</span>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import BudgetRing from './BudgetRing.vue'

const props = defineProps({
  projectData: {
    type: Object,
    default: null
  }
})

// Вычисляемые значения для кольца бюджета
const budgetTotal = computed(() => {
  // Основной бюджет проекта
  return props.projectData?.budget_total || props.projectData?.budget || 0
})


// Фактически потраченная сумма (пока всегда 0, так как нет системы учета реальных трат)
const budgetSpent = computed(() => {
  // TODO: Здесь должна быть логика получения реальных трат из системы учета расходов
  // Пока что для новых проектов траты = 0
  return 0
})

const budgetRemaining = computed(() => {
  return Math.max(0, budgetTotal.value - budgetSpent.value)
})

const budgetPercentage = computed(() => {
  if (budgetTotal.value === 0) return 0
  // Если ничего не потрачено, показываем 100% (весь бюджет доступен)
  if (budgetSpent.value === 0) return 100
  return Math.min(100, Math.round((budgetSpent.value / budgetTotal.value) * 100))
})

// Функция форматирования валюты
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}
</script>

<style scoped lang="scss">
.project-dashboard {
  background: var(--color-primary-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
}

.project-dashboard__header {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-secondary-background);
}

.project-dashboard__body {
  padding: 0.75rem 1rem;
}

.budget-ring-container {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.budget-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.budget-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--color-border);
  
  &:last-child {
    border-bottom: none;
    font-weight: 600;
  }
}

.budget-item-label {
  color: var(--color-secondary-text);
  font-size: 0.875rem;
}

.budget-item-value {
  font-weight: 500;
  
  &.budget-spent {
    color: #dc3545;
  }
  
  &.budget-remaining {
    color: #28a745;
  }
  
  &.budget-total {
    color: var(--color-secondary-text);
  }
}

// Адаптивность
@media (max-width: 768px) {
  .budget-ring-container {
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .budget-info {
    width: 100%;
  }
}
</style>
