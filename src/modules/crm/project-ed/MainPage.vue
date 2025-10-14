<template>
    <div class="page-container">
        <Breadcrumbs :items="breadcrumbItems" />
        <div class="page-content">
            <div class="content-projects-on-apply" v-if="canViewProjectsOnApply && hasProjectsOnApply">
                <h3>Проекты на утверждении</h3>
                <ProjectsOnApply :projects="projects" />
            </div>

            <div class="content-projects" v-if="hasMyProjects">
                <h3>
                    <router-link :to="{ name: 'ProjectEdMyProjects' }" class="h3-link">Мои проекты</router-link>
                </h3>
                <MyProjectsList :projects="projects" />
            </div>
            
            <div class="content-programm">
                <div class="programm-header" style="display: flex; flex-direction: column; gap: 1rem;">
                    <div class="header-h3">
                        <h3>Программа развития БГТУ</h3>
                    </div>
                    <div class="header-buttons">
                        <button
                            type="button"
                            class="button-action"
                            :class="{ active: selectedProgramTab === 'events' }"
                            :aria-pressed="selectedProgramTab === 'events'"
                            aria-label="Перечень мероприятий"
                            @click="selectedProgramTab = 'events'"
                        >
                            Перечень мероприятий
                        </button>
                        <button type="button" class="button-action" :class="{ active: selectedProgramTab === 'kpis' }"
                            :aria-pressed="selectedProgramTab === 'kpis'" aria-label="Перечень целевых показателей"
                            @click="selectedProgramTab = 'kpis'">Перечень целевых показателей</button>
                    </div>
                    <div class="programm-content">
                        <ProgrammList :selected-tab="selectedProgramTab" />
                    </div>
                </div>
                
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Home } from 'lucide-vue-next'
import MyProjectsList from './MainPage/components/MyProjectsList.vue'
import ProjectsOnApply from './MainPage/components/ProjectsOnApply.vue'
import ProgrammList from './components/ProgrammList.vue'
import Breadcrumbs from './components/Breadcrumbs.vue'
import { apiClient } from '@/js/api/manager'
import { projectEdEndpoints } from './js/endpoints.js'
import { useUserStore } from '@/core/cms/js/userStore.js'

// Программа развития: выбранная вкладка
const selectedProgramTab = ref('events')

// Состояние загрузки проектов
const projects = ref([])
const isLoadingProjects = ref(false)
const projectsError = ref('')

// Состояние роли пользователя
const userStore = useUserStore()
const userRole = ref('')
const isLoadingRole = ref(false)

// Вычисляемое свойство для определения наличия проектов
const hasMyProjects = computed(() => projects.value.length > 0)

// Вычисляемое свойство для определения наличия проектов на утверждении
const hasProjectsOnApply = computed(() => {
    return projects.value.some(project => project.status === 'На утверждении')
})

// Вычисляемое свойство для проверки прав на просмотр проектов на утверждении
const canViewProjectsOnApply = computed(() => {
    const role = userRole.value
    return role === 'Администратор' || role === 'Экспертная группа'
})

// Настройка breadcrumbs для главной страницы
const breadcrumbItems = ref([
    {
        label: 'Главная',
        icon: Home
    }
])

// Функция для преобразования статуса проекта
const getProjectStatus = (status) => {
    const statusMap = {
        'draft': 'Черновик',
        'pending': 'На утверждении',
        'rejected': 'Отклонен',
        'active': 'В работе',
        'done': 'Завершен'
    }
    return statusMap[status] || status
}

// Функция для получения роли в проекте
const getProjectRole = (project) => {
    if (project.user_role) {
        return project.user_role
    }
    return 'Участник'
}

// Загрузка роли пользователя
async function loadUserRole() {
    if (!userStore.user?.id) return
    
    isLoadingRole.value = true
    try {
        const response = await apiClient.get(`/project_ed/profiles/profiles/${userStore.user.id}/`)
        const profile = response.data
        
        if (profile?.role_name) {
            userRole.value = profile.role_name
        } else {
            userRole.value = 'Пользователь'
        }
    } catch (err) {
        userRole.value = 'Пользователь'
    } finally {
        isLoadingRole.value = false
    }
}

// Загрузка проектов
async function loadProjects() {
    isLoadingProjects.value = true
    projectsError.value = ''
    
    try {
        const response = await apiClient.get(projectEdEndpoints.project_ed.projects.list)
        const data = Array.isArray(response.data) ? response.data : (response.data?.results || [])
        
        // Преобразуем данные API в нужный формат
        const mappedProjects = data.map(project => ({
            id: project.id,
            shortName: project.short_name,
            name: project.name,
            role: getProjectRole(project),
            status: getProjectStatus(project.status),
            executors_count: project.executors_count || 0,
            created_at: project.created_at,
            updated_at: project.updated_at
        }))
        
        projects.value = mappedProjects
    } catch (err) {
        projectsError.value = 'Не удалось загрузить проекты'
        projects.value = []
    } finally {
        isLoadingProjects.value = false
    }
}

// Загружаем данные при монтировании
onMounted(async () => {
    // Сначала инициализируем пользователя, если не инициализирован
    if (!userStore.isInitialized) {
        await userStore.initializeUser()
    }
    
    // Загружаем роль пользователя и проекты параллельно
    await Promise.all([
        loadUserRole(),
        loadProjects()
    ])
})
</script>

<style scoped lang="scss">
.page-container {
    display: flex;
    flex-direction: column;
    height: 100%;
}
.page-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2rem;
}
.h3-link {
    text-decoration: none;
    color: inherit;
    display: inline;
}
.h3-link h3:hover {
    text-decoration: none;
    cursor: pointer;
}
.header-buttons {
    display: flex;
    align-items: center;
    gap: .5rem;
}
.button-action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: .5rem;
    padding: .375rem .75rem;
    border-radius: .5rem;
    background-color: var(--color-header-background);
    color: var(--bs-body-color, #212529);
    border: 1px solid transparent;
    cursor: pointer;
    transition: background-color .15s ease, border-color .15s ease, color .15s ease, box-shadow .15s ease;
}
.button-action:hover {
    background-color: var(--color-hover-background, #f8f9fa);
    border-color: var(--bs-border-color, #ced4da);
}
.button-action.active {
    background-color: var(--bs-body-color, #212529);
    color: #fff;
}
</style>