<template>
    <div class="project-create-page">
        <Breadcrumbs :items="breadcrumbItems" />

        <div class="page-header">
            <h1 class="page-title">Создание проекта</h1>
        </div>

        <div class="page-content">
            <div class="container">
                <ProjectCreateForm
                    @project-created="handleProjectCreated"
                />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Home, Plus, List } from 'lucide-vue-next'
import Breadcrumbs from '@/modules/crm/project-ed/components/Breadcrumbs.vue'
import ProjectCreateForm from '@/modules/crm/project-ed/components/ProjectCreateForm.vue'

const router = useRouter()

const breadcrumbItems = ref([
    {
        label: 'Главная',
        to: '/crm/project-ed',
        icon: Home
    },
    {
        label: 'Мои проекты',
        to: '/crm/project-ed/my-projects',
        icon: List
    },
    {
        label: 'Создание проекта',
        icon: Plus
    }
])

const handleProjectCreated = (projectData) => {
    
    if (projectData?.id) {
        // Используем новый маршрут с ID, который автоматически перенаправит на slug
        router.push(`/crm/project-ed/project/id/${projectData.id}`)
    } else {
        console.error('ID проекта не найден в ответе сервера')
    }
}

</script>

<style scoped lang="scss">
.project-create-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}


.page-header {
    border-bottom: 1px solid var(--color-border);
    padding-bottom: 1rem;
}

.page-title {
    margin: 0;
    font-size: 1.75rem;
    font-weight: 600;
    color: var(--color-primary-text);
}

.page-content {
    flex: 1;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
}

</style>