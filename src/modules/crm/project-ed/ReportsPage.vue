<template>
    <div class="reports-page">
        <div v-if="isLoading" class="reports-loading">
            <div class="loading-content">
                <div class="spinner-border text-primary" role="status" aria-label="Загрузка проекта">
                    <span class="visually-hidden">Загрузка...</span>
                </div>
                <p class="loading-text mt-3">Загрузка данных проекта...</p>
            </div>
        </div>

        <div v-else-if="!isProjectApproved" class="reports-placeholder">
            <div class="placeholder-content">
                <div class="placeholder-icon">
                    <Lock :size="64" class="text-muted" />
                </div>
                <h4 class="placeholder-title">Отчёты недоступны</h4>
                <p class="placeholder-description">
                    Отчёты по проекту будут доступны после одобрения экспертной группой.
                    Текущий статус проекта: <strong>{{ projectStatusText }}</strong>
                </p>
            </div>
        </div>

        <div v-else>
            <div class="reports-page-header" :class="{ 'is-collapsed': !!activeTab }">
                <div class="d-flex justify-content-center align-items-center gap-3 flex-wrap">
                    <div
                        class="report-card d-flex flex-column align-items-center justify-content-center text-center"
                        :class="{ active: activeTab === 'monthly' }"
                        role="button"
                        tabindex="0"
                         @click="toggleTab('monthly')"
                         @keyup.enter="toggleTab('monthly')"
                    >
                        <FileSpreadsheet :size="32" class="mb-2" />
                        <div class="report-card-title">Ежемесячные отчёты</div>
                    </div>

                    <div
                        class="report-card d-flex flex-column align-items-center justify-content-center text-center"
                        :class="{ active: activeTab === 'stages' }"
                        role="button"
                        tabindex="0"
                         @click="toggleTab('stages')"
                         @keyup.enter="toggleTab('stages')"
                    >
                        <Flag :size="32" class="mb-2" />
                        <div class="report-card-title">Отчёты по этапам</div>
                    </div>

                    <div
                        class="report-card d-flex flex-column align-items-center justify-content-center text-center"
                        :class="{ active: activeTab === 'final' }"
                        role="button"
                        tabindex="0"
                         @click="toggleTab('final')"
                         @keyup.enter="toggleTab('final')"
                    >
                        <FileCheck :size="32" class="mb-2" />
                        <div class="report-card-title">Итоговый отчёт</div>
                    </div>
                </div>
            </div>
            <div v-if="activeTab" class="page-header-divider"></div>
            <div v-if="activeTab" class="reports-page-content">
                <MonthlyReportsPage v-if="activeTab === 'monthly'" />
                <StagesReportsPage v-else-if="activeTab === 'stages'" />
                <div v-else-if="activeTab === 'final'">
                    <h5 class="mb-3">Итоговый отчёт</h5>
                    <div class="text-muted">Формирование общего итогового отчёта. (Здесь будет содержимое итогового отчёта.)</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { FileSpreadsheet, Flag, FileCheck, Lock } from 'lucide-vue-next'
import MonthlyReportsPage from './reports/MonthlyReportsPage.vue'
import StagesReportsPage from './reports/StagesReportsPage.vue'
import { apiClient } from '@/js/api/manager'

// Props для получения данных проекта из родительского компонента
const props = defineProps({
    projectData: {
        type: Object,
        default: null
    }
})

const route = useRoute()
const activeTab = ref(null)
const localProjectData = ref(null)
const isLoading = ref(true)

// Получаем ID проекта из маршрута
const projectId = computed(() => route.params.id)

// Объединяем данные проекта из props и локальные данные
const currentProjectData = computed(() => {
    return props.projectData || localProjectData.value
})

// Проверяем, одобрен ли проект (статус 'active' или 'completed')
const isProjectApproved = computed(() => {
    if (!currentProjectData.value) return false
    return ['active', 'completed', 'done'].includes(currentProjectData.value.status)
})

// Получаем текстовое представление статуса
const projectStatusText = computed(() => {
    if (!currentProjectData.value) return 'Загрузка...'
    
    const statusMap = {
        'draft': 'Черновик',
        'pending': 'На утверждении',
        'rejected': 'Отклонен',
        'active': 'В работе',
        'completed': 'Завершен',
        'done': 'Завершен'
    }
    
    return statusMap[currentProjectData.value.status] || currentProjectData.value.status
})

// Отслеживаем изменения данных проекта из props
watch(() => props.projectData, (newData) => {
    if (newData) {
        console.log('Данные проекта получены через props:', newData)
        isLoading.value = false
    }
}, { immediate: true })

// Загружаем данные проекта (только если не переданы через props)
async function loadProjectData() {
    // Если данные уже переданы через props, не загружаем их заново
    if (props.projectData) {
        console.log('Данные проекта уже переданы через props, пропускаем загрузку')
        isLoading.value = false
        return
    }
    
    if (!projectId.value) {
        console.warn('ID проекта не найден в маршруте')
        isLoading.value = false
        // Устанавливаем статус по умолчанию
        localProjectData.value = { status: 'pending' }
        return
    }
    
    try {
        isLoading.value = true
        console.log('Загружаем данные проекта с ID:', projectId.value)
        
        const response = await apiClient.get(`project_ed/projects/${projectId.value}/`)
        localProjectData.value = response.data
        
        console.log('Данные проекта загружены:', {
            id: localProjectData.value.id,
            name: localProjectData.value.name || localProjectData.value.title,
            status: localProjectData.value.status
        })
        
    } catch (error) {
        console.error('Ошибка загрузки данных проекта:', error)
        
        // В случае ошибки устанавливаем статус по умолчанию
        localProjectData.value = { 
            status: 'pending',
            name: 'Неизвестный проект',
            id: projectId.value
        }
    } finally {
        isLoading.value = false
    }
}

function toggleTab(tabKey) {
    activeTab.value = activeTab.value === tabKey ? null : tabKey
}

// Загружаем данные при монтировании компонента
onMounted(() => {
    loadProjectData()
})

</script>

<style scoped lang="scss">
.reports-page-header {
    padding: 1rem 0 1.5rem;
}

.report-card {
    width: 140px;
    height: 140px;
    border: 1px solid rgba(0, 0, 0, 0.15);
    border-radius: 0.5rem;
    background-color: #fff;
    transition: all 0.3s ease;
    cursor: pointer;
    user-select: none;

    &:hover {
        box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.08);
        transform: translateY(-2px);
    }

    &.active {
        border-color: #0d6efd;
        box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.15);
    }
}

/* Сжатый горизонтальный вид при выборе вкладки */
.reports-page-header.is-collapsed {
    padding: 0.5rem 0 1rem;
}

.reports-page-header.is-collapsed .report-card {
    height: 56px;
    width: auto;
    padding: 0 0.75rem;
    border-radius: 0.75rem;
    flex-direction: row !important;
    align-items: center;
    text-align: left;
    transform: none; /* убирать подъём при hover для стабильности высоты */
}

.reports-page-header.is-collapsed .report-card:hover {
    transform: none;
}

.reports-page-header.is-collapsed .report-card .mb-2 {
    margin-bottom: 0 !important;
    margin-right: 0.5rem;
}

.report-card-title {
    font-weight: 600;
    line-height: 1.2;
}

.page-header-divider {
    border-bottom: 1px solid #dee2e6;
    padding-bottom: 1rem;
}

.reports-page-content {
    padding: 0 0.5rem 1rem;
}

/* Стили для состояния загрузки */
.reports-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    padding: 2rem;
}

.loading-content {
    text-align: center;
}

.loading-text {
    color: var(--bs-body-color-muted);
    margin: 0;
}

/* Стили для плейсхолдера недоступности отчетов */
.reports-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    padding: 2rem;
}

.placeholder-content {
    text-align: center;
    max-width: 500px;
}

.placeholder-icon {
    margin-bottom: 1.5rem;
}

.placeholder-title {
    color: var(--bs-body-color);
    margin-bottom: 1rem;
    font-weight: 600;
}

.placeholder-description {
    color: var(--bs-body-color-muted);
    margin-bottom: 1.5rem;
    line-height: 1.6;
}

/* Цвета бейджей статуса */
.badge-secondary {
    background-color: var(--bs-secondary);
    color: white;
}

.badge-warning {
    background-color: var(--bs-warning);
    color: var(--bs-dark);
}

.badge-danger {
    background-color: var(--bs-danger);
    color: white;
}

.badge-primary {
    background-color: var(--bs-primary);
    color: white;
}

.badge-success {
    background-color: var(--bs-success);
    color: white;
}
</style>