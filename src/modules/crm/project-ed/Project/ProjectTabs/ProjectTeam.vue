<template>
    <div class="project-team">
        <!-- Заголовок и статистика -->
        <div class="team-header mb-4">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h4 class="mb-1">Команда проекта</h4>
                    <p class="text-muted mb-0">
                        {{ teamStats.total }} участников 
                        <span v-if="teamStats.executors > 0" class="ms-2">
                            ({{ teamStats.executors }} исполнителей)
                        </span>
                    </p>
                </div>
                <button class="btn btn-outline-primary" @click="refreshTeam">
                    <RefreshCw :size="16" class="me-1" />
                    Обновить
                </button>
            </div>
        </div>

        <!-- Состояние загрузки -->
        <div v-if="isLoading" class="loading-state">
            <div class="spinner-border text-primary" role="status" aria-label="Загрузка"></div>
            <div class="loading-text mt-2">Загрузка участников команды…</div>
        </div>

        <!-- Основной контент -->
        <template v-else>
            <!-- Фильтры и поиск -->
            <div class="team-filters mb-4">
                <div class="row g-3">
                    <div class="col-md-6">
                        <div class="input-group">
                            <span class="input-group-text bg-white">
                                <Search :size="16" />
                            </span>
                            <input
                                v-model="searchTerm"
                                type="text"
                                class="form-control"
                                placeholder="Поиск по имени или роли"
                            />
                        </div>
                    </div>
                    <div class="col-md-3">
                        <select v-model="roleFilter" class="form-select">
                            <option value="">Все роли</option>
                            <option value="owner">Владелец</option>
                            <option value="manager">Руководитель</option>
                            <option value="curator">Куратор</option>
                            <option value="customer">Заказчик</option>
                            <option value="executor">Исполнитель</option>
                            <option value="participant">Участник</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <select v-model="facultyFilter" class="form-select">
                            <option value="">Все факультеты</option>
                            <option v-for="faculty in faculties" :key="faculty.id" :value="faculty.id">
                                {{ faculty.name }}
                            </option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Сетка участников -->
            <div class="team-grid">
                <div 
                    v-for="member in filteredMembers" 
                    :key="member.id"
                    class="team-member-card"
                >
                    <div class="member-avatar-container">
                        <img 
                            v-if="member.avatar_url"
                            :src="member.avatar_url" 
                            :alt="getMemberDisplayName(member)" 
                            class="member-avatar"
                            @error="handleAvatarError"
                        />
                        <DefaultAvatar 
                            v-else
                            size="large"
                            :title="getMemberDisplayName(member)"
                        />
                    </div>
                    
                    <div class="member-info">
                        <h6 class="member-name">{{ getMemberDisplayName(member) }}</h6>
                        <div class="member-role">
                            <span :class="getRoleClass(member.role)" class="role-badge">
                                {{ getRoleDisplayName(member.role, member) }}
                            </span>
                        </div>
                        <div v-if="member.position_name || member.position" class="member-position">
                            {{ member.position_name || member.position }}
                        </div>
                        <div v-if="member.faculty_name || member.faculty" class="member-faculty">
                            {{ member.faculty_name || member.faculty }}
                        </div>
                        <div v-if="member.department_name || member.department" class="member-department">
                            {{ member.department_name || member.department }}
                        </div>
                    </div>

                    <div class="member-actions">
                        <button 
                            class="btn btn-sm btn-outline-secondary"
                            @click="viewProfile(member)"
                            title="Просмотр профиля"
                        >
                            <User :size="14" />
                        </button>
                        <button 
                            v-if="canRemoveMember(member)"
                            class="btn btn-sm btn-outline-danger"
                            @click="removeMember(member)"
                            title="Исключить из команды"
                        >
                            <UserMinus :size="14" />
                        </button>
                        <span 
                            v-else
                            class="btn btn-sm btn-outline-secondary disabled"
                            title="Нельзя исключить из команды"
                        >
                            <Lock :size="14" />
                        </span>
                    </div>
                </div>
            </div>

            <!-- Пустое состояние -->
            <div v-if="filteredMembers.length === 0" class="empty-state">
                <div class="empty-icon">
                    <Users :size="48" />
                </div>
                <div class="empty-text">
                    <h5>Участники не найдены</h5>
                    <p class="text-muted">
                        {{ searchTerm || roleFilter || facultyFilter 
                            ? 'Попробуйте изменить параметры поиска' 
                            : 'В проекте пока нет участников' 
                        }}
                    </p>
                </div>
            </div>
        </template>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Users, Search, RefreshCw, User, UserMinus, Lock } from 'lucide-vue-next'
import DefaultAvatar from '@/components/DefaultAvatar.vue'
import { apiClient } from '@/js/api/manager.js'
import { endpoints } from '@/js/api/endpoints.js'

const props = defineProps({
    projectData: {
        type: Object,
        default: null
    }
})

// Реактивные данные
const isLoading = ref(false)
const searchTerm = ref('')
const roleFilter = ref('')
const facultyFilter = ref('')
const teamMembers = ref([])
const faculties = ref([])

// Вычисляемые свойства
const teamStats = computed(() => ({
    total: teamMembers.value.length,
    owners: teamMembers.value.filter(m => m.role === 'owner').length,
    managers: teamMembers.value.filter(m => m.role === 'manager').length,
    curators: teamMembers.value.filter(m => m.role === 'curator').length,
    customers: teamMembers.value.filter(m => m.role === 'customer').length,
    executors: teamMembers.value.filter(m => m.role === 'executor').length,
    participants: teamMembers.value.filter(m => m.role === 'participant').length
}))

const filteredMembers = computed(() => {
    let filtered = teamMembers.value

    // Поиск по имени или роли
    if (searchTerm.value) {
        const search = searchTerm.value.toLowerCase()
        filtered = filtered.filter(member => 
            getMemberDisplayName(member).toLowerCase().includes(search) ||
            getRoleDisplayName(member.role, member).toLowerCase().includes(search) ||
            (member.position_name && member.position_name.toLowerCase().includes(search)) ||
            (member.position && member.position.toLowerCase().includes(search)) ||
            (member.faculty_name && member.faculty_name.toLowerCase().includes(search)) ||
            (member.department_name && member.department_name.toLowerCase().includes(search))
        )
    }

    // Фильтр по роли
    if (roleFilter.value) {
        filtered = filtered.filter(member => member.role === roleFilter.value)
    }

    // Фильтр по факультету
    if (facultyFilter.value) {
        filtered = filtered.filter(member => {
            // Проверяем faculty_ref или faculty_id
            const facultyId = member.faculty_ref || member.faculty_id
            return facultyId === parseInt(facultyFilter.value)
        })
    }

    return filtered
})

// Методы
const getMemberDisplayName = (member) => {
    if (member.first_name && member.last_name) {
        return `${member.first_name} ${member.last_name}`
    }
    return member.username || 'Пользователь'
}

const getRoleDisplayName = (role, member = null) => {
    // Если есть кастомная роль из проекта
    if (member?.project_role) {
        return member.project_role
    }
    if (member?.executor_role && member.role === 'executor') {
        return member.executor_role
    }
    
    const roleNames = {
        'owner': 'Владелец',
        'manager': 'Руководитель',
        'curator': 'Куратор', 
        'customer': 'Заказчик',
        'executor': 'Исполнитель',
        'participant': 'Участник'
    }
    return roleNames[role] || role
}

const getRoleClass = (role) => {
    const roleClasses = {
        'owner': 'bg-success text-white',
        'manager': 'bg-danger text-white',
        'curator': 'bg-warning text-dark',
        'customer': 'bg-info text-white', 
        'executor': 'bg-secondary text-white',
        'participant': 'bg-light text-dark'
    }
    return roleClasses[role] || 'bg-light text-dark'
}

const handleAvatarError = (event) => {
    event.target.style.display = 'none'
}

const canRemoveMember = (member) => {
    // Логика определения возможности удаления участника
    // Нельзя удалить владельца, руководителя, куратора и заказчика
    const canRemove = member.role !== 'owner' && 
                     member.role !== 'manager' && 
                     member.role !== 'curator' && 
                     member.role !== 'customer'
    
    console.log(`ProjectTeam: canRemoveMember(${member.role}):`, canRemove)
    return canRemove
}

const viewProfile = (member) => {
    // Переход к профилю пользователя
    console.log('View profile:', member)
}

const removeMember = (member) => {
    // Удаление участника из команды
    console.log('Remove member:', member)
}

const refreshTeam = async () => {
    await loadTeamMembers()
}

const loadTeamMembers = async () => {
    if (!props.projectData) return
    
    isLoading.value = true
    try {
        // Загружаем участников команды проекта
        await loadProjectTeamMembers()
        
        // Извлекаем уникальные факультеты из загруженных пользователей
        extractFacultiesFromMembers()
        
    } catch (error) {
        console.error('Ошибка загрузки участников команды:', error)
        // Показываем сообщение об ошибке пользователю
        teamMembers.value = []
        faculties.value = []
    } finally {
        isLoading.value = false
    }
}

const loadProjectTeamMembers = async () => {
    if (!props.projectData?.id) {
        console.log('ProjectTeam: Нет данных проекта или ID проекта')
        return
    }
    
    console.log('ProjectTeam: Загружаем участников для проекта:', props.projectData.id)
    console.log('ProjectTeam: Данные проекта:', props.projectData)
    console.log('ProjectTeam: Доступные поля:', Object.keys(props.projectData))
    console.log('ProjectTeam: owner_id:', props.projectData.owner_id)
    console.log('ProjectTeam: manager_id:', props.projectData.manager_id)
    console.log('ProjectTeam: curator_id:', props.projectData.curator_id)
    console.log('ProjectTeam: customer_id:', props.projectData.customer_id)
    console.log('ProjectTeam: performers:', props.projectData.performers)
    console.log('ProjectTeam: roles:', props.projectData.roles)
    
    try {
        // Собираем всех участников проекта из разных источников
        const members = []
        
        // 1. Владелец проекта (owner)
        if (props.projectData.owner_id) {
            console.log('ProjectTeam: Найден владелец ID:', props.projectData.owner_id)
            const ownerData = await getUserData(props.projectData.owner_id)
            console.log('ProjectTeam: Данные владельца:', ownerData)
            if (ownerData) {
                members.push({
                    ...ownerData,
                    role: 'owner',
                    role_type: 'owner'
                })
            }
        } else {
            console.log('ProjectTeam: Владелец не найден')
        }
        
        // 2. Руководитель проекта (manager)
        if (props.projectData.manager_id && props.projectData.manager_id !== props.projectData.owner_id) {
            console.log('ProjectTeam: Найден руководитель ID:', props.projectData.manager_id)
            const managerData = await getUserData(props.projectData.manager_id)
            console.log('ProjectTeam: Данные руководителя:', managerData)
            if (managerData) {
                members.push({
                    ...managerData,
                    role: 'manager',
                    role_type: 'manager'
                })
            }
        }
        
        // 3. Куратор проекта (curator)
        if (props.projectData.curator_id && props.projectData.curator_id !== props.projectData.owner_id) {
            console.log('ProjectTeam: Найден куратор ID:', props.projectData.curator_id)
            const curatorData = await getUserData(props.projectData.curator_id)
            console.log('ProjectTeam: Данные куратора:', curatorData)
            if (curatorData) {
                members.push({
                    ...curatorData,
                    role: 'curator',
                    role_type: 'curator'
                })
            }
        }
        
        // 4. Заказчик проекта (customer)
        if (props.projectData.customer_id && props.projectData.customer_id !== props.projectData.owner_id) {
            console.log('ProjectTeam: Найден заказчик ID:', props.projectData.customer_id)
            const customerData = await getUserData(props.projectData.customer_id)
            console.log('ProjectTeam: Данные заказчика:', customerData)
            if (customerData) {
                members.push({
                    ...customerData,
                    role: 'customer',
                    role_type: 'customer'
                })
            }
        }
        
        // 5. Исполнители проекта (performers)
        if (props.projectData.performers && Array.isArray(props.projectData.performers)) {
            console.log('ProjectTeam: Найдены исполнители:', props.projectData.performers)
            console.log('ProjectTeam: Количество исполнителей:', props.projectData.performers.length)
            
            for (const performer of props.projectData.performers) {
                console.log('ProjectTeam: Обрабатываем исполнителя:', performer)
                
                // Проверяем разные возможные структуры данных
                let performerUserId = null
                if (performer.user) {
                    performerUserId = typeof performer.user === 'object' ? performer.user.id : performer.user
                } else if (performer.user_id) {
                    performerUserId = performer.user_id
                } else if (typeof performer === 'number') {
                    performerUserId = performer
                } else if (performer.id) {
                    performerUserId = performer.id
                }
                
                console.log('ProjectTeam: ID исполнителя для загрузки:', performerUserId)
                
                if (performerUserId) {
                    // Проверяем, что исполнитель еще не добавлен
                    const existingMember = members.find(m => m.id === performerUserId)
                    if (!existingMember) {
                        const performerData = await getUserData(performerUserId)
                        console.log('ProjectTeam: Данные исполнителя:', performerData)
                        if (performerData) {
                            members.push({
                                ...performerData,
                                role: 'executor',
                                role_type: 'executor',
                                executor_role: performer.role || performer.executor_role || 'Исполнитель'
                            })
                        }
                    } else {
                        console.log('ProjectTeam: Исполнитель уже добавлен, пропускаем')
                    }
                } else {
                    console.log('ProjectTeam: Не удалось определить ID исполнителя')
                }
            }
        } else {
            console.log('ProjectTeam: Исполнители не найдены или не являются массивом')
        }
        
        // 6. Роли пользователей в проекте (roles)
        if (props.projectData.roles && Array.isArray(props.projectData.roles)) {
            console.log('ProjectTeam: Найдены роли:', props.projectData.roles)
            for (const role of props.projectData.roles) {
                const userId = typeof role.user === 'object' ? role.user.id : role.user
                console.log('ProjectTeam: Обрабатываем роль для пользователя ID:', userId)
                // Проверяем, что пользователь еще не добавлен
                const existingMember = members.find(m => m.id === userId)
                if (!existingMember) {
                    const userData = await getUserData(userId)
                    console.log('ProjectTeam: Данные пользователя с ролью:', userData)
                    if (userData) {
                        members.push({
                            ...userData,
                            role: role.role?.name || 'participant',
                            role_type: 'participant',
                            project_role: role.role?.name || 'Участник'
                        })
                    }
                } else {
                    console.log('ProjectTeam: Пользователь уже добавлен, пропускаем')
                }
            }
        }
        
        console.log('ProjectTeam: Всего загружено участников:', members.length)
        console.log('ProjectTeam: Список участников:', members)
        teamMembers.value = members
        
    } catch (error) {
        console.error('Ошибка загрузки участников проекта:', error)
        throw error
    }
}

const getUserData = async (userId) => {
    if (!userId) {
        console.log('ProjectTeam: getUserData вызван без userId')
        return null
    }
    
    console.log('ProjectTeam: Загружаем данные пользователя:', userId)
    try {
        const endpoint = endpoints.project_ed.profiles.detail(userId)
        console.log('ProjectTeam: Запрос к эндпоинту:', endpoint)
        const response = await apiClient.get(endpoint)
        console.log('ProjectTeam: Ответ API:', response.data)
        return response.data
    } catch (error) {
        console.error(`Ошибка загрузки данных пользователя ${userId}:`, error)
        return null
    }
}

const extractFacultiesFromMembers = () => {
    // Извлекаем уникальные факультеты из загруженных участников команды
    const facultyMap = new Map()
    
    teamMembers.value.forEach(member => {
        const facultyId = member.faculty_ref || member.faculty_id
        const facultyName = member.faculty_name || member.faculty
        
        if (facultyId && facultyName && !facultyMap.has(facultyId)) {
            facultyMap.set(facultyId, {
                id: facultyId,
                name: facultyName,
                short_name: member.faculty_short_name || facultyName
            })
        }
    })
    
    faculties.value = Array.from(facultyMap.values()).sort((a, b) => a.name.localeCompare(b.name))
}

// Хуки жизненного цикла
onMounted(() => {
    loadTeamMembers()
})

// Отслеживаем изменения в данных проекта
watch(() => props.projectData, (newProjectData) => {
    if (newProjectData) {
        loadTeamMembers()
    }
}, { deep: true })
</script>

<style scoped lang="scss">
.project-team {
    padding: 1rem 0;
}

.team-header {
    border-bottom: 1px solid var(--bs-border-color);
    padding-bottom: 1rem;
}

.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    color: var(--bs-secondary);
}

.team-filters {
    background: var(--bs-light);
    padding: 1rem;
    border-radius: 0.5rem;
    border: 1px solid var(--bs-border-color);
}

.team-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.team-member-card {
    background: white;
    border: 1px solid var(--bs-border-color);
    border-radius: 0.75rem;
    padding: 1.5rem;
    transition: all 0.2s ease;
    position: relative;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        border-color: var(--bs-primary);
    }
}

.member-avatar-container {
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
}

.member-avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid var(--bs-light);
}

.member-info {
    text-align: center;
    margin-bottom: 1rem;
}

.member-name {
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: var(--bs-dark);
}

.member-role {
    margin-bottom: 0.5rem;
}

.role-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    font-size: 0.75rem;
    font-weight: 500;
}

.member-position,
.member-faculty,
.member-department {
    font-size: 0.875rem;
    color: var(--bs-secondary);
    margin-bottom: 0.25rem;
}

.member-actions {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    padding-top: 1rem;
    border-top: 1px solid var(--bs-border-color);
    
    .disabled {
        cursor: not-allowed;
        opacity: 0.6;
        pointer-events: none;
    }
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    text-align: center;
    color: var(--bs-secondary);
}

.empty-icon {
    margin-bottom: 1rem;
    opacity: 0.5;
}

.empty-text h5 {
    color: var(--bs-dark);
    margin-bottom: 0.5rem;
}

// Адаптивность для мобильных устройств
@media (max-width: 768px) {
    .team-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
    }
    
    .team-filters .row {
        flex-direction: column;
    }
    
    .team-filters .col-md-6,
    .team-filters .col-md-3 {
        max-width: 100%;
        margin-bottom: 1rem;
    }
}
</style>