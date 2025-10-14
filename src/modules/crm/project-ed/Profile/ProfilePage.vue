<template>
  <div>
    <!-- Header Bar -->
    <HeaderBar />
    
    <!-- Breadcrumbs -->
    <Breadcrumbs :items="breadcrumbItems" class="mt-3"/>
    
    <!-- Навигация с вкладками -->
    <div class="profile-navigation">
      <nav class="nav-tabs-container">
        <div class="nav-tabs">
          <button 
            v-for="tab in tabs" 
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

    <!-- Контент вкладок -->
    <div class="tab-content">
      <!-- Обзор -->
      <div v-show="activeTab === 'overview'" class="tab-pane" :class="{ active: activeTab === 'overview' }">
        <div class="row">
      <!-- Левая колонка - информация о пользователе -->
      <div class="col-lg-4 mb-4">
        <div class="card profile-card">
          <div class="card-body text-center">
            <div class="profile-avatar mb-3">
              <img v-if="avatarUrl" :src="avatarUrl" alt="Аватар" class="avatar-img" />
              <DefaultAvatar v-else size="large" class="avatar-placeholder" />
            </div>
            <h4 class="profile-name">{{ userFullName }}</h4>
            <p class="text-muted mb-3">{{ userPosition }}</p>
            <div class="profile-info">
               <div class="info-item">
                 <div class="info-icon">
                     <Contact :size="20" />
                 </div>
                 <div class="info-content">
                   <div class="info-value">{{ userRole }}</div>
                 </div>
               </div>
               <div class="info-item">
                  <div class="info-icon">
                    <GraduationCap :size="20" />
                  </div>
                  <div class="info-content">
                    <div class="info-value">{{ userFaculty }}</div>
                  </div>
                </div>
              <div class="info-item">
                <div class="info-icon">
                  <Building :size="20" />
                </div>
                <div class="info-content">
                  <div class="info-value">{{ userDepartment }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Достижения -->
        <div class="card mt-3">
          <div class="card-header">
            <h6 class="mb-0">Достижения</h6>
          </div>
          <div class="card-body">
            <div v-if="achievements.length > 0" class="achievements-list">
              <div v-for="achievement in achievements" :key="achievement.id" class="achievement-item">
                <div class="achievement-icon">
                  <Trophy :size="20" />
                </div>
                <div class="achievement-content">
                  <div class="achievement-title">{{ achievement.title }}</div>
                  <div class="achievement-description">{{ achievement.description }}</div>
                </div>
              </div>
            </div>
            <div v-else class="text-muted text-center py-3">
              <Trophy :size="24" class="mb-2" />
              <p class="mb-0">Пока нет достижений</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Правая колонка - проекты и активность -->
      <div class="col-lg-8">
        <!-- Мои проекты -->
        <div class="card mb-4">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Мои проекты</h5>
            <router-link to="/crm/project-ed/create" class="btn btn-primary btn-sm">
              <Plus :size="16" class="me-1" />
              Создать проект
            </router-link>
          </div>
          <div class="card-body">
            <div v-if="loading" class="text-center py-4">
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Загрузка...</span>
              </div>
            </div>
            <div v-else-if="projects.length > 0" class="projects-list">
              <div v-for="project in projects" :key="project.id" class="project-item">
                <div class="project-header">
                  <h6 class="project-title">
                    <router-link :to="`/crm/project-ed/project/${project.id}`" class="project-link">
                      {{ project.title }}
                    </router-link>
                  </h6>
                  <span class="project-status" :class="getStatusClass(project.status)">
                    {{ getStatusText(project.status) }}
                  </span>
                </div>
                <p class="project-description">{{ project.description }}</p>
                <div class="project-meta">
                  <span class="project-date">
                    <Calendar :size="14" class="me-1" />
                    {{ formatDate(project.created_at) }}
                  </span>
                  <span class="project-progress">
                    <TrendingUp :size="14" class="me-1" />
                    {{ project.progress }}% выполнено
                  </span>
                </div>
                <div class="project-progress-bar">
                  <div class="progress-bar" :style="{ width: `${project.progress}%` }"></div>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-4">
              <FolderOpen :size="48" class="text-muted mb-3" />
              <p class="text-muted mb-3">У вас пока нет проектов</p>
              <router-link to="/crm/project-ed/create" class="btn btn-primary">
                <Plus :size="16" class="me-1" />
                Создать первый проект
              </router-link>
            </div>
          </div>
        </div>

        <!-- График активности -->
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Активность за последние 30 дней</h5>
          </div>
          <div class="card-body">
            <div class="activity-chart">
              <div class="chart-placeholder">
                <BarChart3 :size="48" class="text-muted mb-3" />
                <p class="text-muted">График активности проектов</p>
                <div class="activity-stats">
                  <div class="activity-stat">
                    <div class="stat-number">{{ activityStats.commits }}</div>
                    <div class="stat-label">Коммитов</div>
                  </div>
                  <div class="activity-stat">
                    <div class="stat-number">{{ activityStats.tasks }}</div>
                    <div class="stat-label">Задач выполнено</div>
                  </div>
                  <div class="activity-stat">
                    <div class="stat-number">{{ activityStats.projects }}</div>
                    <div class="stat-label">Проектов обновлено</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      <!-- Проекты -->
      <div v-show="activeTab === 'projects'" class="tab-pane" :class="{ active: activeTab === 'projects' }">
        <div class="projects-tab-content">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h4>Все проекты</h4>
            <router-link to="/crm/project-ed/create" class="btn btn-primary">
              <Plus :size="16" class="me-1" />
              Создать проект
            </router-link>
          </div>
          
          <div v-if="loading" class="text-center py-4">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Загрузка...</span>
            </div>
          </div>
          <div v-else-if="allProjects.length > 0" class="projects-grid">
            <div v-for="project in allProjects" :key="project.id" class="project-card">
              <div class="project-card-header">
                <h6 class="project-title">
                  <router-link :to="`/crm/project-ed/project/${project.id}`" class="project-link">
                    {{ project.title }}
                  </router-link>
                </h6>
                <span class="project-status" :class="getStatusClass(project.status)">
                  {{ getStatusText(project.status) }}
                </span>
              </div>
              <p class="project-description">{{ project.description }}</p>
              <div class="project-meta">
                <span class="project-date">
                  <Calendar :size="14" class="me-1" />
                  {{ formatDate(project.created_at) }}
                </span>
              </div>
              <div class="project-progress-bar">
                <div class="progress-bar" :style="{ width: `${project.progress}%` }"></div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-4">
            <FolderOpen :size="48" class="text-muted mb-3" />
            <p class="text-muted mb-3">У вас пока нет проектов</p>
            <router-link to="/crm/project-ed/create" class="btn btn-primary">
              <Plus :size="16" class="me-1" />
              Создать первый проект
            </router-link>
          </div>
        </div>
      </div>

      <!-- Задачи -->
      <div v-show="activeTab === 'tasks'" class="tab-pane" :class="{ active: activeTab === 'tasks' }">
        <div class="tasks-tab-content">
          <h4 class="mb-4">Мои задачи</h4>
          <div class="text-center py-4">
            <CheckSquare :size="48" class="text-muted mb-3" />
            <p class="text-muted">Задачи будут отображаться здесь</p>
          </div>
        </div>
      </div>

      <!-- Активность -->
      <div v-show="activeTab === 'activity'" class="tab-pane" :class="{ active: activeTab === 'activity' }">
        <div class="activity-tab-content">
          <h4 class="mb-4">Активность</h4>
          <div class="activity-timeline">
            <div v-for="activity in activities" :key="activity.id" class="activity-item">
              <div class="activity-icon">
                <component :is="activity.icon" :size="16" />
              </div>
              <div class="activity-content">
                <div class="activity-text">{{ activity.text }}</div>
                <div class="activity-date">{{ formatDate(activity.date) }}</div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  UserRound, 
  Trophy, 
  Plus, 
  Calendar, 
  TrendingUp, 
  FolderOpen, 
  BarChart3,
  BookOpen,
  FolderKanban,
  CheckSquare,
  Activity,
  GitCommit,
  GraduationCap,
  Building,
  Contact,
  Briefcase,
  Home,
  Users
} from 'lucide-vue-next'
import { useUserStore } from '@/core/cms/js/userStore.js'
import { apiClient } from '@/js/api/manager.js'
import DefaultAvatar from '@/components/DefaultAvatar.vue'
import Breadcrumbs from '../components/Breadcrumbs.vue'
import HeaderBar from '../components/HeaderBar.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// Получаем userId из параметров маршрута
const userId = computed(() => route.params.userId || userStore.user?.id)

const loading = ref(true)
const projects = ref([])
const allProjects = ref([])
const achievements = ref([])
const activities = ref([])
const activeTab = ref('overview')

// Breadcrumbs
const breadcrumbItems = computed(() => {
  const items = [
    {
      label: 'Главная',
      icon: Home,
      to: { name: 'ProjectEdMain' }
    }
  ]

  // Добавляем имя профиля
  items.push({
    label: userFullName.value,
    icon: UserRound
  })

  return items
})

// Конфигурация вкладок
const tabs = ref([
  {
    id: 'overview',
    name: 'Обзор',
    icon: BookOpen,
    count: undefined
  },
  {
    id: 'projects',
    name: 'Проекты',
    icon: FolderKanban,
    count: 0
  },
  {
    id: 'tasks',
    name: 'Задачи',
    icon: CheckSquare,
    count: 0
  },
  {
    id: 'activity',
    name: 'Активность',
    icon: Activity,
    count: 0
  }
])

// Вычисляемые свойства для информации о пользователе
const userFullName = computed(() => {
  const user = profileUser.value || userStore.user
  if (!user) return 'Гость'

  const firstName = user.first_name?.trim()
  const lastName = user.last_name?.trim()

  const cleanFirst = firstName === ' ' ? '' : firstName
  const cleanLast = lastName === ' ' ? '' : lastName

  if (cleanFirst && cleanLast) return `${cleanFirst} ${cleanLast}`
  if (cleanFirst) return cleanFirst
  if (cleanLast) return cleanLast
  return 'Гость'
})

const isOwnProfile = computed(() => {
  const routeUserId = route.params.userId
  const currentUserId = userStore.user?.id
  // Если нет userId в маршруте — считаем, что это свой профиль
  if (!routeUserId) return true
  return String(routeUserId) === String(currentUserId)
})

const avatarUrl = computed(() => {
  const user = profileUser.value
  if (user) {
    // Пытаемся взять аватар из данных просматриваемого пользователя
    const fromProfile = user.avatar_url || user.avatar || user.photo || user.image
    if (fromProfile && String(fromProfile).trim().length > 0) {
      return fromProfile
    }
  }
  // Если это собственный профиль — можно падать на аватар из стора
  if (isOwnProfile.value) {
    return userStore.avatarUrl || null
  }
  // Для чужого профиля при отсутствии аватара возвращаем null, чтобы показать DefaultAvatar
  return null
})

// Данные пользователя
const profileUser = ref(null)
const userRole = ref('Роль не определена')
const userPosition = ref('Должность не указана')
const userFaculty = ref('Факультет не указан')
const userDepartment = ref('Кафедра не указана')

// Обновляем данные пользователя при получении новых данных
watch(profileUser, (newUser) => {
  if (newUser) {
    userRole.value = newUser.role_name || 'Роль не определена'
    userPosition.value = newUser.position_name || 'Должность не указана'
    userFaculty.value = newUser.faculty_name || 'Факультет не указан'
    userDepartment.value = newUser.department_name || 'Кафедра не указана'
  }
}, { immediate: true })

// Статистика проектов
const stats = ref({
  totalProjects: 0,
  activeProjects: 0,
  completedProjects: 0
})

// Статистика активности
const activityStats = ref({
  commits: 0,
  tasks: 0,
  projects: 0
})

// Загрузка данных пользователя
async function loadUserData() {
  try {
    const currentUserId = userId.value
    if (currentUserId) {
      // Загружаем основные данные пользователя через новый API
      const userResp = await apiClient.get(`/project_ed/profiles/profiles/${currentUserId}/`)
      if (userResp.data) {
        profileUser.value = userResp.data
      }
    }
  } catch (error) {
    console.error('Ошибка загрузки данных пользователя:', error)
    // Если не удалось загрузить по ID, используем текущего пользователя
    profileUser.value = userStore.user
  }
}

// Загрузка роли пользователя
async function loadUserRole() {
  try {
    const currentUserId = userId.value
    if (currentUserId) {
      const resp = await apiClient.get(`/project_ed/user-profiles/?user=${currentUserId}`)
      const data = Array.isArray(resp.data) ? resp.data : (resp.data?.results || [])
      if (data && data.length > 0) {
        const profile = data[0]
        const roleName = profile?.role_name
        userRole.value = roleName && roleName.trim() ? roleName : 'Роль не определена'
        
        // Загружаем информацию о должности, факультете и кафедре
        const position = profile?.position_name
        const faculty = profile?.faculty_name
        const department = profile?.department_name
        
        userPosition.value = position && position.trim() ? position : 'Должность не указана'
        userFaculty.value = faculty && faculty.trim() ? faculty : 'Факультет не указан'
        userDepartment.value = department && department.trim() ? department : 'Кафедра не указана'
      }
    }
  } catch (error) {
    console.error('Ошибка загрузки роли:', error)
  }
}

// Загрузка проектов пользователя
async function loadProjects() {
  try {
    const currentUserId = userId.value
    // Используем новый API endpoint для получения проектов пользователя
    const resp = await apiClient.get(`/project_ed/profiles/profiles/${currentUserId}/projects/`)
    const data = Array.isArray(resp.data) ? resp.data : (resp.data?.results || [])
    
    projects.value = data.slice(0, 5) // Показываем только первые 5 проектов
    allProjects.value = data // Все проекты для вкладки "Проекты"
    
    // Подсчитываем статистику
    stats.value.totalProjects = data.length
    stats.value.activeProjects = data.filter(p => p.status === 'active').length
    stats.value.completedProjects = data.filter(p => p.status === 'completed').length
    
    // Обновляем счетчик вкладки
    tabs.value.find(tab => tab.id === 'projects').count = data.length
  } catch (error) {
    console.error('Ошибка загрузки проектов:', error)
    // Fallback на старый API
    try {
      const resp = await apiClient.get(`/project_ed/projects/?user=${currentUserId}`)
      const data = Array.isArray(resp.data) ? resp.data : (resp.data?.results || [])
      
      projects.value = data.slice(0, 5)
      allProjects.value = data
      
      stats.value.totalProjects = data.length
      stats.value.activeProjects = data.filter(p => p.status === 'active').length
      stats.value.completedProjects = data.filter(p => p.status === 'completed').length
      
      tabs.value.find(tab => tab.id === 'projects').count = data.length
    } catch (fallbackError) {
      console.error('Ошибка загрузки проектов (fallback):', fallbackError)
    }
  }
}

// Загрузка достижений (заглушка)
async function loadAchievements() {
  // В реальном приложении здесь был бы запрос к API
  achievements.value = [
    {
      id: 1,
      title: 'Первый проект',
      description: 'Создал свой первый проект'
    },
    {
      id: 2,
      title: 'Активный участник',
      description: 'Участвует в 5+ проектах'
    }
  ]
}

// Загрузка статистики активности (заглушка)
async function loadActivityStats() {
  // В реальном приложении здесь был бы запрос к API
  activityStats.value = {
    commits: 42,
    tasks: 18,
    projects: 3
  }
}

// Загрузка активности пользователя
async function loadActivities() {
  try {
    const currentUserId = userId.value
    // Используем новый API endpoint для получения активности пользователя
    const resp = await apiClient.get(`/project_ed/profiles/profiles/${currentUserId}/activities/`)
    const data = Array.isArray(resp.data) ? resp.data : (resp.data?.results || [])
    
    // Преобразуем данные активности в формат для отображения
    activities.value = data.map((activity, index) => ({
      id: activity.id || index + 1,
      icon: getActivityIcon(activity.activity_type),
      text: activity.description,
      date: new Date(activity.created_at)
    }))
    
    // Обновляем счетчик активности
    tabs.value.find(tab => tab.id === 'activity').count = activities.value.length
  } catch (error) {
    console.error('Ошибка загрузки активности:', error)
    // Fallback на заглушку
    activities.value = [
      {
        id: 1,
        icon: GitCommit,
        text: 'Создал новый проект "Разработка веб-приложения"',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        id: 2,
        icon: CheckSquare,
        text: 'Завершил задачу "Настройка базы данных"',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        id: 3,
        icon: FolderKanban,
        text: 'Обновил статус проекта "Мобильное приложение"',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      {
        id: 4,
        icon: GitCommit,
        text: 'Добавил новую функциональность в проект',
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      }
    ]
    
    // Обновляем счетчик активности
    tabs.value.find(tab => tab.id === 'activity').count = activities.value.length
  }
}

// Функция для получения иконки по типу активности
function getActivityIcon(activityType) {
  const iconMap = {
    'project_created': GitCommit,
    'project_updated': FolderKanban,
    'profile_updated': UserRound,
    'login': Activity,
    'default': Activity
  }
  return iconMap[activityType] || iconMap.default
}

// Утилиты
function getStatusClass(status) {
  const statusClasses = {
    'active': 'status-active',
    'completed': 'status-completed',
    'paused': 'status-paused',
    'draft': 'status-draft'
  }
  return statusClasses[status] || 'status-default'
}

function getStatusText(status) {
  const statusTexts = {
    'active': 'Активный',
    'completed': 'Завершен',
    'paused': 'Приостановлен',
    'draft': 'Черновик'
  }
  return statusTexts[status] || 'Неизвестно'
}

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Watcher для перезагрузки данных при изменении userId
watch(userId, async (newUserId, oldUserId) => {
  if (newUserId && newUserId !== oldUserId) {
    loading.value = true
    try {
      await Promise.all([
        loadUserData(),
        loadUserRole(),
        loadProjects(),
        loadAchievements(),
        loadActivityStats(),
        loadActivities()
      ])
    } catch (error) {
      console.error('Ошибка перезагрузки данных:', error)
    } finally {
      loading.value = false
    }
  }
})

// Инициализация
onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      loadUserData(),
      loadUserRole(),
      loadProjects(),
      loadAchievements(),
      loadActivityStats(),
      loadActivities()
    ])
  } catch (error) {
    console.error('Ошибка инициализации:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped lang="scss">
// Навигация с вкладками
.profile-navigation {
  margin-bottom: 2rem;
  
  .nav-tabs-container {
    border-bottom: 1.5px solid var(--color-border);
    border-radius: 6px 6px 0 0;
    
    .nav-tabs {
      display: flex;
      padding: 0 1rem;
      
      .nav-tab {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 1rem 1.5rem;
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
          color: #24292e;
          background-color: rgba(0, 0, 0, 0.05);
        }
        
        &.active {
          color: #f85149;
          border-bottom-color: #f85149;
          background-color: transparent;
        }
        
        .tab-icon {
          flex-shrink: 0;
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
          background-color: #f85149;
        }
      }
    }
  }
}

.tab-content {
  .tab-pane {
    animation: fadeIn 0.3s ease-in-out;
    
    &.active {
      display: block !important;
      opacity: 1 !important;
      visibility: visible !important;
    }
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

// Стили для вкладки проектов
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  
  .project-card {
    border: 1px solid #e1e4e8;
    border-radius: 6px;
    padding: 1.5rem;
    background-color: #fff;
    transition: box-shadow 0.2s ease;
    
    &:hover {
      box-shadow: 0 3px 12px rgba(0, 0, 0, 0.15);
    }
    
    .project-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.75rem;
      
      .project-title {
        margin: 0;
        
        .project-link {
          color: #0366d6;
          text-decoration: none;
          font-weight: 600;
          font-size: 1rem;
          
          &:hover {
            text-decoration: underline;
          }
        }
      }
    }
    
    .project-description {
      color: #586069;
      margin-bottom: 1rem;
      font-size: 0.875rem;
      line-height: 1.5;
    }
    
    .project-meta {
      margin-bottom: 0.75rem;
      font-size: 0.75rem;
      color: #586069;
      
      span {
        display: flex;
        align-items: center;
      }
    }
  }
}

// Стили для активности
.activity-timeline {
  .activity-item {
    display: flex;
    align-items: flex-start;
    padding: 1rem 0;
    border-bottom: 1px solid #e1e4e8;
    
    &:last-child {
      border-bottom: none;
    }
    
    .activity-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background-color: #f1f8ff;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #0366d6;
      margin-right: 0.75rem;
      flex-shrink: 0;
    }
    
    .activity-content {
      flex: 1;
      
      .activity-text {
        color: #24292e;
        margin-bottom: 0.25rem;
        font-size: 0.875rem;
      }
      
      .activity-date {
        color: #586069;
        font-size: 0.75rem;
      }
    }
  }
}

.profile-card {
  max-width: clamp(260px, 90vw, 520px);
  margin: 0 auto;
  
  @media (min-width: 576px) {
    max-width: clamp(280px, 75vw, 540px);
  }
  
  @media (min-width: 768px) {
    max-width: clamp(300px, 60vw, 560px);
  }
  
  @media (min-width: 992px) {
    max-width: clamp(320px, 45vw, 580px);
  }
  
  @media (min-width: 1200px) {
    max-width: clamp(340px, 40vw, 600px);
  }
  
  @media (min-width: 1400px) {
    max-width: clamp(360px, 36vw, 620px);
  }
  
  .profile-avatar {
    width: 100%;
    max-width: 95%;
    aspect-ratio: 1 / 1;
    margin: 0 auto;
    position: relative;
    border-radius: 50%;
    overflow: hidden;
    border: 1.5px solid var(--color-border);
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      justify-content: center;
    
    @media (min-width: 576px) {
      max-width: 90%;
    }
    
    @media (min-width: 768px) {
      max-width: 85%;
    }
    
    @media (min-width: 992px) {
      max-width: 80%;
    }
    
    @media (min-width: 1200px) {
      max-width: 100%;
    }
    
    @media (min-width: 1400px) {
      max-width: 100%;
    }
    
    .avatar-img {
      width: 100%;
      height: 100%;
      display: block;
      object-fit: cover;
    }
    
    .avatar-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      color: #6c757d;
    }
    /* Растягиваем DefaultAvatar на всю область аватара */
    .avatar-placeholder.default-avatar {
      width: 100% !important;
      height: 100% !important;
      border-radius: 50% !important;
    }
  }
  
  .profile-name {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  
  .profile-info {
    margin-top: 1.5rem;
    
    .info-item {
      display: flex;
      align-items: center;
      
      &:last-child {
        border-bottom: none;
      }
      
      .info-icon {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--bs-primary);
        margin-right: 0.5rem;
        flex-shrink: 0;
      }
      
      .info-content {
        text-align: left;
        
        .info-value {
          font-size: 0.875rem;
          color: var(--color-primary-text);
        }
      }
    }
  }
}

.achievements-list {
  .achievement-item {
    display: flex;
    align-items: center;
    padding: 0.75rem 0;
    border-bottom: 1px solid #f1f3f4;
    
    &:last-child {
      border-bottom: none;
    }
    
    .achievement-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: #fff3cd;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffc107;
      margin-right: 0.75rem;
    }
    
    .achievement-content {
      .achievement-title {
        font-weight: 600;
        margin-bottom: 0.25rem;
      }
      
      .achievement-description {
        font-size: 0.875rem;
        color: #6c757d;
      }
    }
  }
}

.projects-list {
  .project-item {
    padding: 1rem 0;
    border-bottom: 1px solid #f1f3f4;
    
    &:last-child {
      border-bottom: none;
    }
    
    .project-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.5rem;
      
      .project-title {
        margin: 0;
        
        .project-link {
          color: var(--bs-primary);
          text-decoration: none;
          font-weight: 600;
          
          &:hover {
            text-decoration: underline;
          }
        }
      }
      
      .project-status {
        padding: 0.25rem 0.5rem;
        border-radius: 0.375rem;
        font-size: 0.75rem;
        font-weight: 500;
        
        &.status-active {
          background-color: #d1edff;
          color: #0066cc;
        }
        
        &.status-completed {
          background-color: #d4edda;
          color: #155724;
        }
        
        &.status-paused {
          background-color: #fff3cd;
          color: #856404;
        }
        
        &.status-draft {
          background-color: #f8d7da;
          color: #721c24;
        }
      }
    }
    
    .project-description {
      color: #6c757d;
      margin-bottom: 0.75rem;
      font-size: 0.875rem;
    }
    
    .project-meta {
      display: flex;
      gap: 1rem;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      color: #6c757d;
      
      span {
        display: flex;
        align-items: center;
      }
    }
    
    .project-progress-bar {
      width: 100%;
      height: 4px;
      background-color: #e9ecef;
      border-radius: 2px;
      overflow: hidden;
      
      .progress-bar {
        height: 100%;
        background-color: var(--bs-primary);
        transition: width 0.3s ease;
      }
    }
  }
}

.activity-chart {
  .chart-placeholder {
    text-align: center;
    padding: 2rem;
    
    .activity-stats {
      display: flex;
      justify-content: space-around;
      margin-top: 1.5rem;
      
      .activity-stat {
        text-align: center;
        
        .stat-number {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--bs-primary);
        }
        
        .stat-label {
          font-size: 0.875rem;
          color: #6c757d;
          margin-top: 0.25rem;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .profile-navigation {
    .nav-tabs-container {
      .nav-tabs {
        overflow-x: auto;
        padding: 0 0.5rem;
        
        .nav-tab {
          padding: 0.75rem 1rem;
          font-size: 0.8rem;
          flex-shrink: 0;
          
          .tab-text {
            display: none;
          }
          
          .tab-icon {
            margin: 0;
          }
        }
      }
    }
  }
  
  .projects-grid {
    grid-template-columns: 1fr;
  }
  
  .profile-info {
    .info-item {
      flex-direction: column;
      text-align: center;
      gap: 0.5rem;
      
      .info-icon {
        margin-right: 0;
        margin-bottom: 0.5rem;
      }
      
      .info-content {
        text-align: center;
      }
    }
  }
  
  .activity-stats {
    flex-direction: column;
    gap: 1rem;
  }
  
  .project-header {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 0.5rem;
  }
  
  .project-meta {
    flex-direction: column;
    gap: 0.5rem !important;
  }
}
</style>