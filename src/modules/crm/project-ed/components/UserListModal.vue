<template>
    <ModalCenter
        :modal-id="modalId"
        :title="modalTitle"
        :custom-class="'user-list-modal'"
        :dialog-class="'modal-lg'"
        @closemodal="closeModal"
        @click="handleBackdropClick"
        ref="modalRef"
    >
        <div class="user-list-content">
            <div v-if="filteredUsers.length === 0" class="no-users-message">
                <div class="no-users-icon">?</div>
                <div class="no-users-text">{{ emptyText }}</div>
            </div>
            
            <div v-else class="users-grid">
                <div 
                    v-for="user in filteredUsers" 
                    :key="user.id"
                    class="user-card clickable"
                    :title="`Перейти к профилю ${formatUserName(user.full_name || user.name)}`"
                    @click="navigateToProfile(user.id)"
                >
                        <UserAvatar
                            size="large"
                            :title="formatUserName(user.full_name || user.name)"
                            :customAvatarUrl="getUserAvatar(user)"
                        />                    
                    <div class="user-info">
                        <div class="user-name">{{ formatUserName(user.full_name || user.name) }}</div>
                        <div v-if="type === 'executors' && user.position" class="user-position">{{ user.position }}</div>
                    </div>
                </div>
            </div>
        </div>
    </ModalCenter>
</template>

<script setup>
import { computed, ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import ModalCenter from '@/components/ModalCenter.vue'
import UserAvatar from './UserAvatar.vue'
import { apiClient } from '@/js/api/manager.js'
import { endpoints } from '@/js/api/endpoints.js'

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    users: {
        type: Array,
        default: () => []
    },
    type: {
        type: String,
        default: 'leaders', // 'leaders' или 'executors'
        validator: (value) => ['leaders', 'executors'].includes(value)
    },
    modalId: {
        type: String,
        default: 'userListModal'
    },
    hideUsersWithoutPosition: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['close'])
const router = useRouter()
const modalRef = ref(null)

// Управление видимостью модального окна
watch(() => props.visible, (newValue) => {
    if (newValue) {
        nextTick(() => {
            // Показываем модальное окно через Bootstrap API
            const modalElement = document.getElementById(props.modalId)
            if (modalElement) {
                // Проверяем, доступен ли Bootstrap
                if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                    const modal = new bootstrap.Modal(modalElement)
                    modal.show()
                } else {
                    // Fallback: показываем модальное окно через CSS
                    modalElement.classList.add('show')
                    modalElement.style.display = 'block'
                    modalElement.setAttribute('aria-hidden', 'false')
                    
                    // Добавляем backdrop
                    const backdrop = document.createElement('div')
                    backdrop.className = 'modal-backdrop fade show'
                    backdrop.id = `${props.modalId}-backdrop`
                    document.body.appendChild(backdrop)
                }
            }
        })
    } else {
        // Скрываем модальное окно
        const modalElement = document.getElementById(props.modalId)
        if (modalElement) {
            if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                const modal = bootstrap.Modal.getInstance(modalElement)
                if (modal) {
                    modal.hide()
                }
            } else {
                // Fallback: скрываем модальное окно через CSS
                modalElement.classList.remove('show')
                modalElement.style.display = 'none'
                modalElement.setAttribute('aria-hidden', 'true')
                
                // Удаляем backdrop
                const backdrop = document.getElementById(`${props.modalId}-backdrop`)
                if (backdrop) {
                    backdrop.remove()
                }
            }
        }
    }
})

// Вычисляемые свойства
const modalTitle = computed(() => {
    if (props.type === 'leaders') {
        return 'Руководители'
    } else {
        return 'Исполнители'
    }
})

const emptyText = computed(() => {
    return props.type === 'leaders' ? 'Руководители не назначены' : 'Исполнители не назначены'
})

// Фильтрованные пользователи (с учетом опции скрытия пользователей без должностей)
const filteredUsers = computed(() => {
    if (!props.hideUsersWithoutPosition) {
        return props.users
    }
    
    // Скрываем пользователей без должностей только для исполнителей
    if (props.type === 'executors') {
        return props.users.filter(user => user.position && user.position.trim() !== '')
    }
    
    return props.users
})

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

const closeModal = () => {
    emit('close')
}

// Обработчик клика на backdrop
const handleBackdropClick = (event) => {
    if (event.target.classList.contains('modal') || event.target.classList.contains('modal-backdrop')) {
        closeModal()
    }
}

// Обработчик клавиши Escape
const handleKeydown = (event) => {
    if (event.key === 'Escape' && props.visible) {
        closeModal()
    }
}

onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
})

const navigateToProfile = (userId) => {
    if (userId) {
        // Закрываем модальное окно перед переходом
        closeModal()
        router.push(`/project-ed/profile/${userId}`)
    }
}
</script>

<style scoped lang="scss">
// Стили для backdrop
:global(.modal-backdrop) {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1040;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
}

:global(.modal.show) {
    display: block !important;
}

.no-users-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 1.5rem;
    color: var(--color-secondary-text);
    text-align: center;
}

.no-users-icon {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: var(--color-secondary-background);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--color-secondary-text);
    margin-bottom: 1rem;
}

.no-users-text {
    font-size: 1rem;
    color: var(--color-secondary-text);
}

.users-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 1.5rem;
    max-height: 60vh;
    overflow-y: auto;
    padding: 0.25rem;
    
    // Стилизация скроллбара
    &::-webkit-scrollbar {
        width: 6px;
    }
    
    &::-webkit-scrollbar-track {
        background: var(--color-secondary-background);
        border-radius: 3px;
    }
    
    &::-webkit-scrollbar-thumb {
        background: var(--color-border);
        border-radius: 3px;
        
        &:hover {
            background: var(--color-secondary-text);
        }
    }
}

.user-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 1rem;
    gap: 0.5rem;
    border-radius: 12px;
    transition: all 0.2s ease;
    
    &:hover {
        background: var(--color-hover-background);
    }
    
    &.clickable {
        cursor: pointer;
        
        &:hover {
            background: var(--color-hover-background);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        &:active {
            transform: translateY(0);
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        }
    }
}

.user-info {
    width: 100%;
}

.user-name {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-primary-text);
    margin-bottom: 0.25rem;
    line-height: 1.2;
    word-wrap: break-word;
    overflow-wrap: break-word;
    hyphens: auto;
}

.user-position {
    font-size: 0.75rem;
    color: var(--color-secondary-text);
    line-height: 1.2;
    word-wrap: break-word;
    overflow-wrap: break-word;
    
    &.no-position {
        color: var(--color-border);
        font-style: italic;
    }
}

// Адаптивность
@media (max-width: 768px) {
    .users-grid {
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 1rem;
    }
    
    .user-avatar-container {
        width: 64px;
        height: 64px;
    }
    
    .user-name {
        font-size: 0.8125rem;
    }
    
    .user-position {
        font-size: 0.6875rem;
    }
}

@media (max-width: 480px) {
    .users-grid {
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 0.75rem;
    }
    
    .user-avatar-container {
        width: 56px;
        height: 56px;
    }
    
    .user-name {
        font-size: 0.75rem;
    }
    
    .user-position {
        font-size: 0.625rem;
    }
}
</style>
