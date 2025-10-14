<template>
    <div class="users-list">
        <!-- Заголовок секции -->
        <div v-if="showHeader" class="users-header">
            <Users class="header-icon" :size="16" />
            <span class="header-text">{{ computedHeaderText }}</span>
        </div>
        
        <div class="users-content">
            <div v-if="users.length === 0" class="no-users">
                <div class="no-users-icon">?</div>
                <div class="no-users-text">{{ emptyText }}</div>
            </div>
            
            <div v-else class="users-items" :class="{ 'full-list': showAll }">
                <div 
                    v-for="user in displayedUsers" 
                    :key="user.id"
                    class="user-item clickable"
                    :title="`Перейти к профилю ${formatUserName(user.full_name || user.name)}`"
                    @click="navigateToProfile(user.id)"
                >
                     <UserAvatar
                         size="small"
                         :title="formatUserName(user.full_name || user.name)"
                         :customAvatarUrl="getUserAvatar(user)"
                     />
                    
                    <div class="user-info">
                        <span class="user-name">{{ formatUserName(user.full_name || user.name) }}</span>
                        <!-- Отображаем должность только для исполнителей -->
                        <span v-if="type === 'executors' && user.position" class="user-position">{{ user.position }}</span>
                    </div>
                </div>
                
                <!-- Строка с количеством и случайными аватарками -->
                <div v-if="users.length > 0 && users.length > maxDisplayed" class="more-users-row" @click="openModal">
                    <div class="more-users-avatars">
                        <div 
                            v-for="(user, index) in getRandomUsers(users, 3)" 
                            :key="user.id"
                            class="more-users-avatar"
                        >
                            <UserAvatar
                                size="small"
                                :title="formatUserName(user.full_name || user.name)"
                                :customAvatarUrl="getUserAvatar(user)"
                            />
                        </div>
                    </div>
                    
                    <div class="user-info">
                        <span class="user-name">{{ users.length }} {{ getTotalUsersText() }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Users } from 'lucide-vue-next'
import UserAvatar from './UserAvatar.vue'
import { apiClient } from '@/js/api/manager.js'

const props = defineProps({
    users: {
        type: Array,
        default: () => []
    },
    maxDisplayed: {
        type: Number,
        default: 3 // Максимальное количество отображаемых пользователей
    },
    type: {
        type: String,
        default: 'leaders', // 'leaders' или 'executors'
        validator: (value) => ['leaders', 'executors'].includes(value)
    },
    showAll: {
        type: Boolean,
        default: false // Показывать всех пользователей без ограничений
    },
    showHeader: {
        type: Boolean,
        default: false // Показывать заголовок секции
    },
    headerText: {
        type: String,
        default: null // Текст заголовка (если не указан, генерируется автоматически)
    }
})


const router = useRouter()

// Функция для получения случайных пользователей
const getRandomUsers = (users, count) => {
    if (users.length <= count) return users
    
    const shuffled = [...users].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
}

// Функция для получения URL аватара пользователя
const getUserAvatar = (user) => {
    let avatarUrl = null
    
    // Для исполнителей аватар приходит в поле avatar_url
    if (user.avatar_url) {
        avatarUrl = user.avatar_url
    }
    // Для руководителей может быть другая структура данных
    else if (user.avatar) {
        avatarUrl = user.avatar
    }
    
    if (avatarUrl) {
        // Если URL относительный (начинается с /), преобразуем в абсолютный
        if (avatarUrl.startsWith('/')) {
            // Используем базовый URL из конфигурации API
            const baseUrl = apiClient.getBaseUrl().replace(/\/$/, '') // убираем trailing slash
            return `${baseUrl}${avatarUrl}`
        }
        // Если URL уже абсолютный, возвращаем как есть
        return avatarUrl
    }
    
    return null
}

// Вычисляемые свойства для текстов
const emptyText = computed(() => {
    return props.type === 'leaders' ? 'Руководители не назначены' : 'Исполнители не назначены'
})

// Вычисляемые свойства для отображения пользователей
const displayedUsers = computed(() => {
    if (props.showAll) {
        return props.users
    }
    
    // Если пользователей больше чем maxDisplayed, не показываем отдельных пользователей
    if (props.users.length > props.maxDisplayed) {
        return []
    }
    
    return props.users
})

const remainingUsers = computed(() => {
    return props.showAll ? [] : props.users.slice(props.maxDisplayed)
})

const remainingUsersCount = computed(() => {
    return props.showAll ? 0 : Math.max(0, props.users.length - props.maxDisplayed)
})

const hasMoreUsers = computed(() => {
    return !props.showAll && props.users.length > props.maxDisplayed
})

// Вычисляемое свойство для текста заголовка
const computedHeaderText = computed(() => {
    if (props.headerText) {
        return props.headerText
    }
    
    const count = props.users.length
    if (props.type === 'leaders') {
        if (count === 0) return 'Руководители не назначены'
        if (count === 1) return 'Руководитель проекта'
        if (count >= 2 && count <= 4) return 'Руководители проекта'
        return 'Руководители проекта'
    } else {
        if (count === 0) return 'Исполнители не назначены'
        if (count === 1) return 'Исполнитель проекта'
        if (count >= 2 && count <= 4) return 'Исполнители проекта'
        return 'Исполнители проекта'
    }
})

// Методы для работы с именами
const formatUserName = (name) => {
    if (!name) return 'Не указано'
    
    // Разбиваем имя на части
    const nameParts = name.trim().split(' ').filter(part => part.length > 0)
    
    if (nameParts.length === 0) return 'Не указано'
    
    // Если имя состоит из одного слова, возвращаем как есть
    if (nameParts.length === 1) return nameParts[0]
    
    // Если имя состоит из двух слов, форматируем как Фамилия И.
    if (nameParts.length === 2) {
        return `${nameParts[0]} ${nameParts[1].charAt(0)}.`
    }
    
    // Если имя состоит из трех или более слов, форматируем как Фамилия И.
    const surname = nameParts[0]
    const firstInitial = nameParts[1].charAt(0) + '.'
    
    return `${surname} ${firstInitial}`
}

const getUserInitials = (name) => {
    if (!name) return '?'
    
    const nameParts = name.trim().split(' ').filter(part => part.length > 0)
    
    if (nameParts.length === 0) return '?'
    
    // Берем первые буквы от каждого слова
    const initials = nameParts.map(part => part.charAt(0).toUpperCase()).join('')
    
    // Ограничиваем количество инициалов (максимум 3)
    return initials.substring(0, 3)
}

const getRemainingUsersText = () => {
    const count = remainingUsersCount.value
    if (props.type === 'leaders') {
        if (count === 1) return 'руководитель'
        if (count >= 2 && count <= 4) return 'руководителя'
        return 'руководителей'
    } else {
        if (count === 1) return 'исполнитель'
        if (count >= 2 && count <= 4) return 'исполнителя'
        return 'исполнителей'
    }
}

const getTotalUsersText = () => {
    const count = props.users.length
    if (props.type === 'leaders') {
        if (count === 1) return 'руководитель'
        if (count >= 2 && count <= 4) return 'руководителя'
        return 'руководителей'
    } else {
        if (count === 1) return 'исполнитель'
        if (count >= 2 && count <= 4) return 'исполнителя'
        return 'исполнителей'
    }
}


const emit = defineEmits(['open-modal'])

const openModal = (event) => {
    // Предотвращаем всплытие события
    event.stopPropagation()
    event.preventDefault()
    
    // Эмитим событие для открытия модального окна
    emit('open-modal')
}

const navigateToProfile = (userId) => {
    if (userId) {
        router.push(`/project-ed/profile/${userId}`)
    }
}

</script>

<style scoped lang="scss">
.users-list {
    min-width: 200px;
    max-width: 300px;
}

.users-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: var(--color-primary-background);
    border-bottom: 1px solid var(--color-border);
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-primary-text);
    
    .header-icon {
        flex-shrink: 0;
    }
    
    .header-text {
        flex: 1;
    }
}

.no-users {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
    color: var(--color-secondary-text);
    justify-content: center;
}

.no-users-icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--color-secondary-background);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.875rem;
    font-weight: 600;
    flex-shrink: 0;
}

.no-users-text {
    font-size: 0.875rem;
    color: var(--color-secondary-text);
}

.users-items {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-height: 200px;
    overflow-y: auto;
    
    // Для режима полного списка убираем ограничение по высоте
    &.full-list {
        max-height: none;
    }
}

.user-item {
    display: flex;
    align-items: center;
    border-radius: 0.5rem;
    gap: 0.75rem;
    padding: 0.5rem 1rem;
    transition: background-color 0.2s ease;
    cursor: pointer;
    
    &:hover {
        background: var(--color-hover-background);
    }
    
    &.clickable {
        cursor: pointer;
    }
}


.user-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
}

.user-name {
    font-size: 0.875rem;
    color: var(--color-primary-text);
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.user-position {
    font-size: 0.75rem;
    color: var(--color-secondary-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    
    &.no-position {
        color: var(--color-border);
        font-style: italic;
    }
}

.more-users-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 1rem;
    transition: background-color 0.2s ease;
    cursor: pointer;
    
    &:hover {
        background: var(--color-hover-background);
    }
}

.more-users-avatars {
    display: flex;
    gap: -8px; // Перекрытие аватарок
    flex-shrink: 0;
}

.more-users-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 2px solid var(--color-border);
    overflow: hidden;
    background: var(--color-primary-background);
    margin-left: -8px; // Перекрытие аватарок
    transition: transform 0.2s ease;
    
    &:first-child {
        margin-left: 0;
    }
    
    &:hover {
        transform: scale(1.1);
        z-index: 1;
        position: relative;
    }
}

// Стили для скроллбара
.users-items::-webkit-scrollbar {
    width: 4px;
}

.users-items::-webkit-scrollbar-track {
    background: var(--color-primary-background);
    border-radius: 2px;
}

.users-items::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 2px;
}

.users-items::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
}
</style>
