<template>
    <div class="container">
        <HeaderBar />
        <Breadcrumbs :items="breadcrumbItems" class="mt-3" />
        <h2 class="mt-3">{{ projectTitleHeading }}</h2>

        <div v-if="isLoading" class="loading-state mt-3">
            <div class="spinner-border text-primary" role="status" aria-label="Загрузка"></div>
            <div class="loading-text mt-2">Загрузка проекта…</div>
        </div>

        <template v-else>
            <div class="project-navigation mt-2">
                <nav class="nav-tabs-container">
                    <div class="nav-tabs">
                        <button 
                            v-for="tab in visibleTabs" 
                            :key="tab.id" 
                            class="nav-tab"
                            :class="{ active: activeTab === tab.id }"
                            @click="activeTab = tab.id"
                        >
                            <component :is="tab.icon" :size="16" class="tab-icon" />
                            <span class="tab-text">{{ tab.name }}</span>
                            <span v-if="tab.count !== undefined" class="tab-badge">{{ tab.count }}</span>
                        </button>
                    </div>
                </nav>
            </div>
            
            <div class="tab-content mt-3">
                <ProjectOverview 
                  v-if="activeTab === 'overview'" 
                  :project-data="projectData" 
                  :user-role="userRole"
                  :user-info="userInfo"
                  :rector-info="rectorInfo"
                  @project-updated="onProjectUpdated"
                  @project-deleted="onProjectDeleted"
                />
                <ProjectTeam v-else-if="activeTab === 'team'" :project-data="projectData" />
                <ProjectAuditPage v-else-if="activeTab === 'activity' && canSeeActivityTab" :project-data="projectData" />
                <ReportsPage v-else-if="activeTab === 'reports'" :project-data="projectData" />
            </div>
        </template>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import HeaderBar from '@/modules/crm/project-ed/components/HeaderBar.vue'
import Breadcrumbs from '@/modules/crm/project-ed/components/Breadcrumbs.vue'
import { Home, List, FileText, BookOpen, Users, CheckSquare, Activity, FileSpreadsheet } from 'lucide-vue-next'
import { apiClient } from '@/js/api/manager.js'
import { endpoints } from '@/js/api/endpoints.js'
import { slugify as translitSlugify } from 'transliteration'
import { useUserStore } from '@/core/cms/js/userStore.js'
import ProjectOverview from '@/modules/crm/project-ed/Project/ProjectTabs/ProjectOverview.vue'
import ProjectTeam from '@/modules/crm/project-ed/Project/ProjectTabs/ProjectTeam.vue'
import ProjectAuditPage from '@/modules/crm/project-ed/Project/ProjectTabs/ProjectAuditPage.vue'
import ReportsPage from '@/modules/crm/project-ed/ReportsPage.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const projectTitleHeading = ref('Проект')
const projectTitleBreadcrumb = ref('Проект')
const projectData = ref(null)
const isLoading = ref(true)

// Данные пользователя
const userRole = computed(() => userStore.user?.role || null)
const userInfo = computed(() => userStore.user || null)
const rectorInfo = ref(null)

const breadcrumbItems = computed(() => ([
    { label: 'Главная', to: '/crm/project-ed/main', icon: Home },
    { label: 'Мои проекты', to: '/crm/project-ed/my-projects', icon: List },
    { label: projectTitleBreadcrumb.value, icon: FileText }
]))

// Переключатели страниц
const activeTab = ref('overview')
const tabs = ref([
    { id: 'overview', name: 'Обзор', icon: BookOpen },
    { id: 'team', name: 'Команда', icon: Users },
    { id: 'tasks', name: 'Задачи', icon: CheckSquare, count: undefined },
    { id: 'reports', name: 'Отчеты', icon: FileSpreadsheet },
    { id: 'activity', name: 'Активность', icon: Activity, count: undefined },
])

// Право доступа к вкладке "Активность": только для ролей Руководитель, Куратор, Заказчик в рамках проекта
const canSeeActivityTab = computed(() => {
  const currentUserId = userInfo.value?.id
  const pd = projectData.value
  if (!currentUserId || !pd) return false
  return pd.manager_id === currentUserId || pd.curator_id === currentUserId || pd.customer_id === currentUserId
})

// Отфильтрованный список вкладок в зависимости от прав
const visibleTabs = computed(() => {
  return tabs.value.filter((tab) => tab.id !== 'activity' || canSeeActivityTab.value)
})

// Если вкладка "Активность" недоступна, а она активна — переключаем на "Обзор"
watch([canSeeActivityTab, activeTab], ([canSee], currentTab) => {
  if (currentTab === 'activity' && !canSee) {
    activeTab.value = 'overview'
  }
})

// Обработчик события переключения вкладки
function handleTabSwitch(event) {
    const tabId = event.detail?.tabId
    if (tabId && tabs.value.find(tab => tab.id === tabId)) {
        activeTab.value = tabId
    }
}

// Обработчик события обновления проекта
const onProjectUpdated = async () => {
  // Перезагружаем данные проекта
  if (projectData.value?.id) {
    await loadProjectData(projectData.value.id)
  }
}

// Обработчик удаления проекта
function onProjectDeleted(projectId) {
  // Перенаправляем пользователя на страницу списка проектов
  router.push('/crm/project-ed/my-projects')
}

// Загрузка данных проекта
const loadProjectData = async (projectIdToLoad) => {
  try {
    // Получить детальную карточку по id (источник истины)
    let projectDataLoaded = null
    
    try {
      // Сначала пробуем получить через обычный endpoint (для своих проектов)
      const { data } = await apiClient.get(endpoints.project_ed.projects.detail(projectIdToLoad))
      projectDataLoaded = data
    } catch (error) {
      try {
        // Если не получилось, пробуем через публичный endpoint (для чужих проектов)
        const { data } = await apiClient.get(endpoints.project_ed.projects.publicView(projectIdToLoad))
        projectDataLoaded = data
      } catch (publicError) {
        console.error('Failed to load project:', publicError)
        throw publicError
      }
    }
    
    if (projectDataLoaded) {
      projectData.value = projectDataLoaded
      
      // Заголовок страницы: полное название без уточнения
      const headingBase = projectDataLoaded?.name || projectDataLoaded?.short_name || 'Проект'
      projectTitleHeading.value = headingBase
      
      // Хлебные крошки: как раньше, с возможным уточнением
      const crumbBase = projectDataLoaded?.short_name || projectDataLoaded?.name || 'Проект'
      const clarification = projectDataLoaded?.name_clarification ? ` ${projectDataLoaded.name_clarification}` : ''
      projectTitleBreadcrumb.value = `${crumbBase}${clarification}`
    }
  } catch (e) {
    console.error('Ошибка загрузки данных проекта:', e)
    // оставляем дефолтный заголовок при ошибке
  }
}

// Загрузка данных ректора
const loadRectorInfo = async () => {
  try {
    const resp = await apiClient.get('/project_ed/profiles/profiles/leadership/', { position_exact: 'Ректор' })
    const list = Array.isArray(resp.data) ? resp.data : (resp.data?.results || [])
    if (list.length > 0) {
      const rector = list[0]
      rectorInfo.value = {
        name: `${rector.first_name || ''} ${rector.last_name || ''}`.trim() || rector.username || '',
        position: rector.position_name || 'Ректор'
      }
    }
  } catch (error) {
    console.warn('Не удалось загрузить данные ректора:', error)
  }
}

onMounted(async () => {
    // Добавляем слушатель события для переключения вкладок
    window.addEventListener('switch-to-audit-tab', handleTabSwitch)
    
    const slug = route.params?.slug
    const projectId = route.params?.projectId || route.query?.id
    if (!slug && !projectId) return
    
    // Загружаем данные ректора
    await loadRectorInfo()
    
    try {
        let projectIdToLoad = null
        
        if (projectId) {
            // Если передан прямой ID проекта, используем его
            projectIdToLoad = projectId
        } else if (slug) {
            // Если передан slug, ищем в списке проектов
            const resp = await apiClient.get(endpoints.project_ed.projects.list)
            const list = Array.isArray(resp.data) ? resp.data : (resp.data?.results || [])
            const match = list.find((p) => {
                const name = p?.name || p?.short_name || ''
                return translitSlugify(name).toLowerCase() === slug
            })
            projectIdToLoad = match?.id
        }
        
        if (!projectIdToLoad) return
        
        // Загружаем данные проекта
        await loadProjectData(projectIdToLoad)
    } catch (e) {
        console.error('Ошибка загрузки данных проекта:', e)
        // оставляем дефолтный заголовок при ошибке
    } finally {
        isLoading.value = false
    }
})

onBeforeUnmount(() => {
    // Удаляем слушатель события при размонтировании компонента
    window.removeEventListener('switch-to-audit-tab', handleTabSwitch)
})
</script>

<style scoped lang="scss">
/* Навигация с вкладками под заголовком */
.project-navigation {
  margin-bottom: 0.5rem;

  .nav-tabs-container {
    border-bottom: 1.5px solid var(--color-border);
    border-radius: 6px 6px 0 0;

    .nav-tabs {
      display: flex;
      padding: 0 0.5rem;

      .nav-tab {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        border: none;
        background: none;
        color: #586069;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        border-bottom: 2px solid transparent;
        transition: all 0.2s ease;
        position: relative;

        &:hover {
          color: #0366d6; /* как в breadcrumbs */
          background-color: rgba(0, 0, 0, 0.05);
        }

        &.active {
          color: #0366d6; /* голубой цвет как в breadcrumbs */
          border-bottom-color: #0366d6;
          background-color: transparent;
        }

        .tab-icon {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .tab-text {
          white-space: nowrap;
        }

        .tab-badge {
          background-color: #6a737d;
          color: white;
          font-size: 0.75rem;
          padding: 0.125rem 0.375rem;
          border-radius: 10px;
          min-width: 1.25rem;
          text-align: center;
          line-height: 1.25;
        }

        &.active .tab-badge {
          background-color: #0366d6;
        }
      }
    }
  }
}

/* Стили состояния загрузки */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: #6a737d;
}
</style>