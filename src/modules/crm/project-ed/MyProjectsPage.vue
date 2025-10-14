<template>
    <div class="projects-page">
        <div class="container">
        <div class="row">
            <div class="col-12">
                <Breadcrumbs :items="breadcrumbItems" />
            </div>
        </div>

            <h3 class="page-title">Мои проекты</h3>

            <div class="filters-section">
                <div class="row">
                    <div class="col-md-6 col-lg-4">
                    <label class="form-label">Краткое наименование проекта</label>
                    <input
                        v-model="filters.shortName"
                        type="text"
                        class="form-control"
                        placeholder="Начните ввод..."
                    />
                </div>
                    <div class="col-md-3 col-lg-2">
                    <label class="form-label">Роль в проекте</label>
                    <select v-model="filters.role" class="form-select">
                        <option value="">Все</option>
                        <option v-for="r in roles" :key="r" :value="r">{{ r }}</option>
                    </select>
                </div>
                    <div class="col-md-3 col-lg-2">
                    <label class="form-label">Статус проекта</label>
                    <select v-model="filters.status" class="form-select">
                        <option value="">Все</option>
                        <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
                    </select>
                    </div>
                </div>
            </div>
        </div>

        <div class="container">
            <div v-if="isLoading" class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Загрузка...</span>
                </div>
                <p class="mt-2">Загрузка проектов...</p>
            </div>
            
            <div v-else-if="filteredProjects.length === 0" class="text-center py-4">
                <p class="text-muted">Проекты не найдены</p>
            </div>
            
            <div v-else class="projects-list">
                <ProjectListItem
                    v-for="project in filteredProjects"
                    :key="project.id"
                    :project="project"
                    @open="onProjectClick"
                />
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { Home, List } from 'lucide-vue-next'
import { useToast } from 'vue-toastification'
import Breadcrumbs from '@/modules/crm/project-ed/components/Breadcrumbs.vue'
import ProjectListItem from '@/modules/crm/project-ed/components/ProjectListItem.vue'
import { apiClient } from '@/js/api/manager.js'
import { endpoints } from '@/js/api/endpoints.js'
import { useUserStore } from '@/core/cms/js/userStore.js'

const toast = useToast()
const userStore = useUserStore()

const roles = ['Руководитель', 'Куратор', 'Заказчик', 'Исполнитель']
const statuses = ['Черновик', 'На утверждении', 'Отклонен', 'В работе', 'Завершен']

const filters = ref({ shortName: '', role: '', status: '' })
const projects = ref([])
const isLoading = ref(false)

// Настройка breadcrumbs
const breadcrumbItems = ref([
    {
        label: 'Главная',
        to: '/crm/project-ed',
        icon: Home
    },
    {
        label: 'Мои проекты',
        icon: List
    }
])

const filteredProjects = computed(() => {
    const name = filters.value.shortName.trim().toLowerCase()
    const role = filters.value.role
    const status = filters.value.status

    return projects.value.filter(p => {
        const byName = !name || p.shortName?.toLowerCase().includes(name)
        const byRole = !role || p.role === role
        const byStatus = !status || p.status === status
        return byName && byRole && byStatus
    })
})

import { useRouter } from 'vue-router'
import { slugify as translitSlugify } from 'transliteration'
const router = useRouter()

const onProjectClick = (project) => {
    const slug = translitSlugify(project.name || project.shortName || 'project').toLowerCase()
    router.push({ name: 'ProjectEdProjectDetail', params: { slug } })
}

// Стили применяются в компоненте ProjectListItem

// Загрузка проектов пользователя
async function loadProjects() {
    isLoading.value = true
    try {
        const response = await apiClient.get(endpoints.project_ed.projects.list)
        const data = Array.isArray(response.data) ? response.data : (response.data?.results || [])
        
        // Преобразуем данные API в формат, ожидаемый компонентом
        const mappedProjects = data.map(project => ({
            id: project.id,
            shortName: project.short_name,
            nameClarification: project.name_clarification,
            name: project.name,
            role: project.user_role || getProjectRole(project), // Оставляем только проекты с ролью
            status: getProjectStatus(project.status),
            executors_count: project.executors_count || 0, // Добавляем количество исполнителей
            executors: project.performers || [], // Добавляем данные об исполнителях
            created_at: project.created_at,
            updated_at: project.updated_at
        }))
        
        // Проверяем на дубликаты по ID
        const uniqueProjects = []
        const seenIds = new Set()
        
        for (const project of mappedProjects) {
            if (!seenIds.has(project.id)) {
                seenIds.add(project.id)
                uniqueProjects.push(project)
            }
        }
        
        // Оставляем только проекты, в которых у пользователя есть роль
        projects.value = uniqueProjects.filter(p => !!p.role)
    } catch (error) {
        toast.error('Ошибка при загрузке проектов: ' + (error.response?.data?.detail || error.message))
        projects.value = []
    } finally {
        isLoading.value = false
    }
}

// Определение роли пользователя в проекте
function getProjectRole(project) {
    const currentUserId = userStore.user?.id
    
    if (!currentUserId) {
        return ''
    }
    
    // Если пользователь - руководитель проекта
    if (project.manager === currentUserId || project.manager_id === currentUserId) {
        return 'Руководитель'
    }
    
    // Если пользователь - владелец проекта (считаем руководителем)
    if (project.owner === currentUserId || project.owner_id === currentUserId) {
        return 'Руководитель'
    }
    
    // Если пользователь - куратор проекта
    if (project.curator === currentUserId || project.curator_id === currentUserId) {
        return 'Куратор'
    }
    
    // Если пользователь - заказчик проекта
    if (project.customer === currentUserId || project.customer_id === currentUserId) {
        return 'Заказчик'
    }
    
    // Если пользователь - исполнитель проекта (по списку исполнителей, если есть)
    try {
        const execs = project.executors || project.performers || []
        if (Array.isArray(execs)) {
            const has = execs.some(e => (
                e === currentUserId || e?.id === currentUserId || e?.user_id === currentUserId || e?.user?.id === currentUserId
            ))
            if (has) return 'Исполнитель'
        }
    } catch {}

    // Нет роли в проекте
    return ''
}

// Преобразование статуса проекта в читаемый вид
function getProjectStatus(status) {
    const statusMap = {
        'draft': 'Черновик',
        'pending': 'На утверждении',
        'rejected': 'Отклонен',
        'active': 'В работе',
        'completed': 'Завершен'
    }
    return statusMap[status] || status
}

// Загружаем проекты при монтировании компонента
onMounted(async () => {
    // Инициализируем пользователя если еще не инициализирован
    if (!userStore.isInitialized) {
        await userStore.initializeUser()
    }
    loadProjects()
})
</script>

<style scoped lang="scss">
.projects-page {
    padding: 1rem 0;
}

.page-title {
    margin: 1rem 0;
    color: var(--color-primary-text);
}

.filters-section {
    background-color: rgba(var(--bs-info-rgb, 13, 202, 240), .075);
    border-radius: 1rem;
    padding: 1.5rem;
    margin-bottom: 2rem;
}

.projects-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}
</style>