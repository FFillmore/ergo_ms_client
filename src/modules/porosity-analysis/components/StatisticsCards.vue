<template>
  <div class="statistics-cards">
    <div class="row g-4 mb-4">
      <div class="col-xl-3 col-md-6">
        <div class="statistics-card card-primary">
          <div class="card-content">
            <div class="card-icon">
              <BarChart3 :size="24" />
            </div>
            <div class="card-info">
              <h6 class="card-subtitle">Всего анализов</h6>
              <h3 class="card-value">{{ totalAnalyses }}</h3>
              <div class="card-progress">
                <div class="progress">
                  <div class="progress-bar bg-primary" style="width: 100%"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-xl-3 col-md-6" v-for="(count, key) in statsByStatus" :key="key">
        <div class="statistics-card" :class="getStatusCardClass(key)">
          <div class="card-content">
            <div class="card-icon">
              <component :is="getStatusIcon(key)" :size="24" />
            </div>
            <div class="card-info">
              <h6 class="card-subtitle">{{ getStatusLabel(key) }}</h6>
              <h3 class="card-value">{{ count }}</h3>
              <div class="card-progress">
                <div class="progress">
                  <div class="progress-bar" :class="getStatusProgressClass(key)" :style="`width: ${getPercentage(count)}%`"></div>
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
import { BarChart3, Clock, Loader2, CheckCircle, AlertTriangle } from 'lucide-vue-next'

export default {
  name: 'StatisticsCards',
  components: {
    BarChart3,
    Clock,
    Loader2,
    CheckCircle,
    AlertTriangle
  },
  props: {
    stats: {
      type: Object,
      default: () => ({
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0
      })
    }
  },
  computed: {
    totalAnalyses() {
      return (this.stats.pending || 0) + (this.stats.processing || 0) + (this.stats.completed || 0) + (this.stats.failed || 0)
    },
    statsByStatus() {
      return {
        pending: this.stats.pending,
        processing: this.stats.processing,
        completed: this.stats.completed,
        failed: this.stats.failed
      }
    },
    getStatusCardClass() {
      return (status) => {
        const classes = { 
          pending: 'card-secondary', 
          processing: 'card-warning', 
          completed: 'card-success', 
          failed: 'card-danger' 
        }
        return classes[status] || 'card-secondary'
      }
    },
    getStatusProgressClass() {
      return (status) => {
        const classes = { 
          pending: 'bg-secondary', 
          processing: 'bg-warning', 
          completed: 'bg-success', 
          failed: 'bg-danger' 
        }
        return classes[status] || 'bg-secondary'
      }
    },
    getStatusIcon() {
      return (status) => {
        const icons = { 
          pending: Clock, 
          processing: Loader2, 
          completed: CheckCircle, 
          failed: AlertTriangle 
        }
        return icons[status] || Clock
      }
    },
    getStatusLabel() {
      return (status) => {
        const labels = { 
          pending: 'Ожидает', 
          processing: 'Обрабатывается', 
          completed: 'Завершен', 
          failed: 'Ошибка' 
        }
        return labels[status] || status
      }
    },
    getPercentage() {
      return (value) => {
        const total = this.totalAnalyses
        if (!total) return 0
        return Math.round((value / total) * 100)
      }
    }
  }
}
</script>

<style scoped>
.statistics-cards {
  margin-bottom: 2rem;
}

.statistics-card { 
  background: white; 
  border-radius: 15px; 
  padding: 1.5rem; 
  box-shadow: 0 5px 20px rgba(0,0,0,0.08); 
  transition: all .3s ease; 
  position: relative; 
  overflow: hidden; 
}

.statistics-card::before { 
  content: ''; 
  position: absolute; 
  top: 0; 
  left: 0; 
  width: 100%; 
  height: 5px; 
}

.statistics-card.card-primary::before { 
  background: linear-gradient(90deg, #007bff 0%, #0056b3 100%); 
}

.statistics-card.card-warning::before { 
  background: linear-gradient(90deg, #ffc107 0%, #e0a800 100%); 
}

.statistics-card.card-success::before { 
  background: linear-gradient(90deg, #28a745 0%, #1e7e34 100%); 
}

.statistics-card.card-danger::before { 
  background: linear-gradient(90deg, #dc3545 0%, #c82333 100%); 
}

.statistics-card.card-secondary::before { 
  background: linear-gradient(90deg, #6c757d 0%, #5a6268 100%); 
}

.card-content { 
  display: flex; 
  align-items: center; 
  gap: 1.5rem; 
}

.card-icon { 
  width: 60px; 
  height: 60px; 
  border-radius: 12px; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  color: #fff; 
}

.card-primary .card-icon { 
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); 
}

.card-warning .card-icon { 
  background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%); 
}

.card-success .card-icon { 
  background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%); 
}

.card-danger .card-icon { 
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); 
}

.card-secondary .card-icon { 
  background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%); 
}

.card-info { 
  flex: 1; 
}

.card-subtitle { 
  color: #6c757d; 
  font-size: .875rem; 
  font-weight: 500; 
  margin-bottom: .5rem; 
}

.card-value { 
  font-size: 2rem; 
  font-weight: 700; 
  margin: 0; 
  color: #2d3436; 
}

.card-progress { 
  margin-top: .5rem; 
}

.card-progress .progress { 
  height: 5px; 
  background-color: #e9ecef; 
  border-radius: 5px; 
}
</style>
