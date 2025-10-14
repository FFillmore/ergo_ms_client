<template>
    <div class="project-redirect">
        <div class="redirect-loading">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Загрузка...</span>
            </div>
            <p class="mt-2">Перенаправление на страницу проекта...</p>
        </div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiClient } from '@/js/api/manager.js'
import { endpoints } from '@/js/api/endpoints.js'
import { slugify as translitSlugify } from 'transliteration'

const route = useRoute()
const router = useRouter()

onMounted(async () => {
    const projectId = route.params?.id
    
    if (!projectId) {
        console.error('ID проекта не найден в параметрах маршрута')
        router.push('/crm/project-ed/my-projects')
        return
    }
    
    try {
        // Получаем данные проекта по ID
        let projectData = null
        
        try {
            // Сначала пробуем получить через обычный endpoint (для своих проектов)
            const { data } = await apiClient.get(endpoints.project_ed.projects.detail(projectId))
            projectData = data
        } catch (error) {
            try {
                // Если не получилось, пробуем через публичный endpoint (для чужих проектов)
                const { data } = await apiClient.get(endpoints.project_ed.projects.publicView(projectId))
                projectData = data
            } catch (publicError) {
                console.error('Не удалось загрузить проект по ID:', publicError)
                router.push('/crm/project-ed/my-projects')
                return
            }
        }
        
        if (projectData) {
            // Генерируем slug из названия проекта
            const projectName = projectData?.name || projectData?.short_name || 'project'
            const slug = translitSlugify(projectName).toLowerCase()
            
            // Перенаправляем на URL с slug
            const targetUrl = `/crm/project-ed/project/${slug}`
            router.replace(targetUrl)
        } else {
            console.error('Данные проекта не получены')
            router.push('/crm/project-ed/my-projects')
        }
    } catch (error) {
        console.error('Ошибка при перенаправлении проекта:', error)
        router.push('/crm/project-ed/my-projects')
    }
})
</script>

<style scoped lang="scss">
.project-redirect {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    padding: 2rem;
}

.redirect-loading {
    text-align: center;
    color: var(--color-secondary-text);
}

.spinner-border {
    width: 2rem;
    height: 2rem;
    border-width: 0.2em;
}
</style>
