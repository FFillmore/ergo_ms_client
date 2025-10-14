<template>
  <div class="analysis-stats">
    <div class="stats-grid">
      <div class="stat-card stat-total">
        <div class="stat-icon">
          <BarChart3 size="20" />
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.total || 0 }}</div>
          <div class="stat-label">Всего</div>
        </div>
        <div class="stat-progress">
          <div class="progress-bar" :style="{ width: '100%' }"></div>
        </div>
      </div>
      
      <div class="stat-card stat-pending">
        <div class="stat-icon">
          <Clock size="20" />
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.pending || 0 }}</div>
          <div class="stat-label">Ожидают</div>
        </div>
        <div class="stat-progress">
          <div class="progress-bar" :style="{ width: getPercentage(stats.pending) + '%' }"></div>
        </div>
      </div>
      
      <div class="stat-card stat-processing">
        <div class="stat-icon">
          <Loader2 size="20" />
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.processing || 0 }}</div>
          <div class="stat-label">Обрабатываются</div>
        </div>
        <div class="stat-progress">
          <div class="progress-bar" :style="{ width: getPercentage(stats.processing) + '%' }"></div>
        </div>
      </div>
      
      <div class="stat-card stat-completed">
        <div class="stat-icon">
          <CheckCircle size="20" />
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.completed || 0 }}</div>
          <div class="stat-label">Завершены</div>
        </div>
        <div class="stat-progress">
          <div class="progress-bar" :style="{ width: getPercentage(stats.completed) + '%' }"></div>
        </div>
      </div>
      
      <div class="stat-card stat-failed">
        <div class="stat-icon">
          <XCircle size="20" />
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.failed || 0 }}</div>
          <div class="stat-label">Ошибки</div>
        </div>
        <div class="stat-progress">
          <div class="progress-bar" :style="{ width: getPercentage(stats.failed) + '%' }"></div>
        </div>
      </div>
      
      <div class="stat-card stat-cancelled">
        <div class="stat-icon">
          <Ban size="20" />
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.cancelled || 0 }}</div>
          <div class="stat-label">Отменены</div>
        </div>
        <div class="stat-progress">
          <div class="progress-bar" :style="{ width: getPercentage(stats.cancelled) + '%' }"></div>
        </div>
      </div>
    </div>
    
    <!-- Детальная статистика (если включена) -->
    <div v-if="showDetails" class="details-section">
      <div class="details-card">
        <div class="details-header">
          <h6 class="details-title">Детальная статистика</h6>
        </div>
        <div class="details-body">
          <div class="details-grid">
            <div class="details-column">
              <h6 class="details-subtitle">По типам анализа:</h6>
              <div class="details-list">
                <div class="details-item">
                  <span class="details-badge bg-primary">Стандартный</span>
                  <span class="details-value">{{ typeStats.standard || 0 }}</span>
                </div>
                <div class="details-item">
                  <span class="details-badge bg-info">Расширенный</span>
                  <span class="details-value">{{ typeStats.advanced || 0 }}</span>
                </div>
                <div class="details-item">
                  <span class="details-badge bg-secondary">Пользовательский</span>
                  <span class="details-value">{{ typeStats.custom || 0 }}</span>
                </div>
              </div>
            </div>
            <div class="details-column">
              <h6 class="details-subtitle">По времени:</h6>
              <div class="details-list">
                <div class="details-item">
                  <Calendar size="16" class="details-icon text-primary" />
                  <span class="details-text">Сегодня: {{ timeStats.today || 0 }}</span>
                </div>
                <div class="details-item">
                  <Calendar size="16" class="details-icon text-info" />
                  <span class="details-text">На этой неделе: {{ timeStats.week || 0 }}</span>
                </div>
                <div class="details-item">
                  <Calendar size="16" class="details-icon text-success" />
                  <span class="details-text">В этом месяце: {{ timeStats.month || 0 }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { BarChart3, Clock, Loader2, CheckCircle, XCircle, Ban, Calendar } from 'lucide-vue-next'

export default {
  name: 'AnalysisStats',
  components: {
    BarChart3,
    Clock,
    Loader2,
    CheckCircle,
    XCircle,
    Ban,
    Calendar
  },
  props: {
    stats: {
      type: Object,
      default: () => ({
        total: 0,
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        cancelled: 0
      })
    },
    showDetails: {
      type: Boolean,
      default: false
    },
    typeStats: {
      type: Object,
      default: () => ({
        standard: 0,
        advanced: 0,
        custom: 0
      })
    },
    timeStats: {
      type: Object,
      default: () => ({
        today: 0,
        week: 0,
        month: 0
      })
    }
  },
  methods: {
    getPercentage(value) {
      if (!this.stats.total || this.stats.total === 0) return 0
      return Math.round((value / this.stats.total) * 100)
    }
  }
}
</script>

<style scoped lang="scss">
.analysis-stats {
  margin-bottom: 2rem;
}

// Сетка статистики
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

// Карточки статистики
.stat-card {
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: var(--card-color);
  }
}

// Цвета карточек
.stat-total {
  --card-color: #6c757d;
}

.stat-pending {
  --card-color: #ffc107;
}

.stat-processing {
  --card-color: #17a2b8;
}

.stat-completed {
  --card-color: #28a745;
}

.stat-failed {
  --card-color: #dc3545;
}

.stat-cancelled {
  --card-color: #6c757d;
}

// Иконки статистики
.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 1rem;
  background: var(--card-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

// Контент статистики
.stat-content {
  margin-bottom: 1rem;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 0.5rem;
  color: var(--bs-heading-color);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--bs-secondary-color);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

// Прогресс-бар
.stat-progress {
  height: 4px;
  background: var(--bs-gray-200);
  border-radius: 2px;
  overflow: hidden;
  
  .progress-bar {
    height: 100%;
    background: var(--card-color);
    border-radius: 2px;
    transition: width 0.3s ease;
  }
}

// Детальная статистика
.details-section {
  margin-top: 2rem;
}

.details-card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.details-header {
  background: var(--bs-light);
  padding: 1.5rem;
  border-bottom: 1px solid var(--bs-border-color);
  
  .details-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--bs-heading-color);
    margin: 0;
  }
}

.details-body {
  padding: 1.5rem;
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.details-column {
  .details-subtitle {
    font-size: 1rem;
    font-weight: 600;
    color: var(--bs-heading-color);
    margin-bottom: 1rem;
  }
}

.details-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.details-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: var(--bs-gray-100);
  border-radius: 8px;
  
  .details-badge {
    font-size: 0.75rem;
    padding: 0.375rem 0.75rem;
    border-radius: 6px;
    font-weight: 500;
  }
  
  .details-value {
    font-weight: 600;
    color: var(--bs-heading-color);
  }
  
  .details-icon {
    margin-right: 0.5rem;
  }
  
  .details-text {
    color: var(--bs-body-color);
    font-weight: 500;
  }
}

// Адаптивность
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
  }
  
  .stat-card {
    padding: 1rem;
  }
  
  .stat-number {
    font-size: 2rem;
  }
  
  .stat-icon {
    width: 40px;
    height: 40px;
  }
  
  .details-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

@media (max-width: 576px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    padding: 1rem;
  }
  
  .stat-number {
    font-size: 1.75rem;
  }
  
  .stat-icon {
    width: 36px;
    height: 36px;
  }
}
</style>
