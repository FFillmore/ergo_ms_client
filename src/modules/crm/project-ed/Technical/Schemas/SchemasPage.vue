<template>
    <div class="page-container">
        <HeaderBar />
        <Breadcrumbs :items="breadcrumbItems" class="mt-3" />
        <div class="page-content">
            <h1 class="mb-2">{{ pageTitle }}</h1>
            
            <ul class="nav nav-tabs tabs-underline mb-3">
                <li class="nav-item">
                    <button class="nav-link" :class="{ active: activeTab === 'users' }" @click="switchTab('users')">
                        Пользователи
                    </button>
                </li>
                <li class="nav-item">
                    <button class="nav-link" :class="{ active: activeTab === 'faculties' }" @click="switchTab('faculties')">
                        Факультеты
                    </button>
                </li>
                <li class="nav-item">
                    <button class="nav-link" :class="{ active: activeTab === 'departments' }" @click="switchTab('departments')">
                        Кафедры
                    </button>
                </li>
                <li class="nav-item">
                    <button class="nav-link" :class="{ active: activeTab === 'positions' }" @click="switchTab('positions')">
                        Должности
                    </button>
                </li>
            </ul>

            <template v-if="activeTab === 'users'">
                <UsersListPage />
            </template>
            <template v-else-if="activeTab === 'faculties'">
                <FacultiesPage />
            </template>
            <template v-else-if="activeTab === 'departments'">
                <DepartmentsPage />
            </template>
            <template v-else-if="activeTab === 'positions'">
                <PositionsStatsPage />
            </template>
        </div>
    </div>
    
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Home, Users, Wrench, Building2, Briefcase, GraduationCap } from 'lucide-vue-next'
import HeaderBar from '@/modules/crm/project-ed/components/HeaderBar.vue'
import Breadcrumbs from '@/modules/crm/project-ed/components/Breadcrumbs.vue'
import UsersListPage from '@/modules/crm/project-ed/Technical/Schemas/UsersListPage.vue'
import FacultiesPage from '@/modules/crm/project-ed/Technical/Schemas/FacultiesPage.vue'
import DepartmentsPage from '@/modules/crm/project-ed/Technical/Schemas/DepartmentsPage.vue'
import PositionsStatsPage from '@/modules/crm/project-ed/Technical/Schemas/PositionsStatsPage.vue'

const route = useRoute()
const router = useRouter()
const activeTab = ref('users')

const pageTitle = computed(() => {
    switch (activeTab.value) {
        case 'users':
            return 'Список пользователей'
        case 'faculties':
            return 'Список факультетов'
        case 'departments':
            return 'Список кафедр'
        case 'positions':
            return 'Список должностей'
        default:
            return 'Список пользователей'
    }
})

const breadcrumbItems = computed(() => {
    const baseItems = [
        { label: 'Главная', icon: Home, to: { name: 'ProjectEdMain' } },
        { label: 'Служебная страница', icon: Wrench, to: { name: 'ProjectEdTechnical' } }
    ]
    
    switch (activeTab.value) {
        case 'users':
            return [...baseItems, { label: 'Список пользователей', icon: Users }]
        case 'faculties':
            return [...baseItems, { label: 'Список факультетов', icon: GraduationCap }]
        case 'departments':
            return [...baseItems, { label: 'Список кафедр', icon: Building2 }]
        case 'positions':
            return [...baseItems, { label: 'Список должностей', icon: Briefcase }]
        default:
            return [...baseItems, { label: 'Список пользователей', icon: Users }]
    }
})

function switchTab(tab) {
    activeTab.value = tab
    const query = { ...route.query, tab }
    router.push({ query })
}

if (route.query.tab && ['users', 'faculties', 'departments', 'positions'].includes(route.query.tab)) {
    activeTab.value = route.query.tab
} else if (route.query.tab === 'positions') {
    activeTab.value = 'positions'
}
</script>

<style scoped lang="scss">
.page-container { display: flex; flex-direction: column; height: 100%; }
.page-content { flex: 1; display: flex; flex-direction: column; }
.tabs-underline { border-bottom: 1px solid var(--bs-border-color); }
.tabs-underline .nav-link {
  border: none !important;
  background: transparent !important;
  margin-bottom: -1px;
  padding-bottom: 0.5rem;
  color: #0d6efd !important;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.15s ease;
  cursor: pointer;
}
.tabs-underline .nav-link:hover { 
  color: #0a58ca !important;
}
.tabs-underline .nav-link.active {
  border: none !important;
  color: #0d6efd !important;
  background: transparent !important;
  border-bottom: 3px solid #0d6efd !important;
  font-weight: 600;
}
</style>


