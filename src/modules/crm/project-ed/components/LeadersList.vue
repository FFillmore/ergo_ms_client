<template>
    <div class="leaders-list">
        <div v-if="leaders.length === 0" class="no-leaders">
            <div class="no-leaders-icon">?</div>
            <div class="no-leaders-text">Не указано</div>
        </div>
        
        <div v-else class="leaders-items">
            <div 
                v-for="leader in displayedLeaders" 
                :key="leader.id"
                class="leader-item clickable"
                :title="`Перейти к профилю ${formatLeaderName(leader.full_name || leader.name)}`"
                @click="navigateToProfile(leader.id)"
            >
                <div class="leader-avatar-container">
                    <img 
                        v-if="getLeaderAvatar(leader)"
                        :src="getLeaderAvatar(leader)" 
                        :alt="getLeaderInitials(leader.full_name || leader.name)" 
                        class="leader-avatar"
                        @error="handleAvatarError"
                    />
                    <DefaultAvatar 
                        v-else
                        size="small"
                        :title="formatLeaderName(leader.full_name || leader.name)"
                    />
                </div>
                
                <div class="leader-info">
                    <span class="leader-name">{{ formatLeaderName(leader.full_name || leader.name) }}</span>
                    <span v-if="leader.position" class="leader-position">{{ leader.position }}</span>
                </div>
            </div>
            
            <!-- Стек аватарок для дополнительных руководителей -->
            <div v-if="hasMoreLeaders" class="avatar-stack" @click="openModal">
                <div class="avatar-stack-container">
                    <div 
                        v-for="(leader, index) in remainingLeaders.slice(0, 4)" 
                        :key="leader.id"
                        class="stacked-avatar"
                        :style="{ zIndex: 4 - index }"
                    >
                        <img 
                            v-if="getLeaderAvatar(leader)"
                            :src="getLeaderAvatar(leader)" 
                            :alt="getLeaderInitials(leader.full_name || leader.name)" 
                            class="stacked-avatar-img"
                            @error="handleAvatarError"
                        />
                        <div 
                            v-else
                            class="stacked-avatar-img stacked-avatar-placeholder"
                        >
                            {{ getLeaderInitials(leader.full_name || leader.name) }}
                        </div>
                    </div>
                    
                    <!-- Счетчик дополнительных руководителей -->
                    <div 
                        v-if="remainingLeadersCount > 4"
                        class="stacked-avatar stacked-avatar-counter"
                        :style="{ zIndex: 0 }"
                    >
                        <span class="counter-text">+{{ remainingLeadersCount - 4 }}</span>
                    </div>
                </div>
                
                <div class="leader-info">
                    <span class="leader-name">еще {{ remainingLeadersCount }} {{ getRemainingLeadersText() }}</span>
                </div>
            </div>
        </div>
        
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Users } from 'lucide-vue-next'
import DefaultAvatar from '@/components/DefaultAvatar.vue'
import { getUserAvatar } from '@/js/userAvatar.js'
import { apiClient } from '@/js/api/manager.js'

const props = defineProps({
    leaders: {
        type: Array,
        default: () => []
    },
    maxDisplayed: {
        type: Number,
        default: 2 // Максимальное количество отображаемых руководителей
    }
})

const router = useRouter()
const avatarErrors = ref(new Set())
const leaderAvatars = ref(new Map()) // Кэш загруженных аватаров

// Функция нормализации URL аватара
const normalizeUrl = (url) => {
    if (!url) return null
    if (typeof url !== 'string') return null
    
    // Если URL уже абсолютный, возвращаем как есть
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
        return url
    }
    
    // Если URL начинается с /, используем его как есть
    if (url.startsWith('/')) {
        return `${apiClient.baseUrl}${url}`
    }
    
    // Иначе добавляем / в начало
    return `${apiClient.baseUrl}/${url}`
}

// Функция получения аватара руководителя
const getLeaderAvatar = (leader) => {
    // Сначала проверяем кэш
    if (leaderAvatars.value.has(leader.id)) {
        return leaderAvatars.value.get(leader.id)
    }
    
    // Если есть avatar_url, нормализуем его
    if (leader.avatar_url) {
        const normalizedUrl = normalizeUrl(leader.avatar_url)
        if (normalizedUrl) {
            leaderAvatars.value.set(leader.id, normalizedUrl)
            return normalizedUrl
        }
    }
    
    return null
}

// Загрузка аватаров для всех руководителей
const loadLeaderAvatars = async () => {
    const tasks = []
    
    for (const leader of props.leaders) {
        if (leader.id && !leaderAvatars.value.has(leader.id)) {
            tasks.push(
                getUserAvatar(leader.id)
                    .then(avatarUrl => {
                        if (avatarUrl) {
                            const normalizedUrl = normalizeUrl(avatarUrl)
                            if (normalizedUrl) {
                                leaderAvatars.value.set(leader.id, normalizedUrl)
                            }
                        }
                    })
                    .catch(error => {
                    })
            )
        }
    }
    
    if (tasks.length > 0) {
        await Promise.allSettled(tasks)
    }
}

// Навигация к профилю пользователя
const navigateToProfile = (userId) => {
    router.push(`/project-ed/profile/${userId}`)
}

// Ограничиваем количество отображаемых руководителей
const displayedLeaders = computed(() => {
    return props.leaders.slice(0, props.maxDisplayed)
})

const hasMoreLeaders = computed(() => {
    return props.leaders.length > props.maxDisplayed
})

const remainingLeadersCount = computed(() => {
    return props.leaders.length - props.maxDisplayed
})

const remainingLeaders = computed(() => {
    return props.leaders.slice(props.maxDisplayed)
})

const getLeadersText = () => {
    const count = props.leaders.length
    if (count === 1) return 'руководитель'
    if (count >= 2 && count <= 4) return 'руководителя'
    return 'руководителей'
}

const getRemainingLeadersText = () => {
    const count = remainingLeadersCount.value
    if (count === 1) return 'руководитель'
    if (count >= 2 && count <= 4) return 'руководителя'
    return 'руководителей'
}

const formatLeaderName = (name) => {
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

const getLeaderInitials = (name) => {
    if (!name) return '?'
    
    const nameParts = name.trim().split(' ').filter(part => part.length > 0)
    
    if (nameParts.length === 0) return '?'
    
    // Берем первые буквы от каждого слова
    const initials = nameParts.map(part => part.charAt(0).toUpperCase()).join('')
    
    // Ограничиваем количество инициалов (максимум 3)
    return initials.substring(0, 3)
}

const handleAvatarError = (event) => {
    const avatarSrc = event.target.src
    avatarErrors.value.add(avatarSrc)
    event.target.style.display = 'none'
}

const emit = defineEmits(['open-modal'])

const openModal = (event) => {
    // Предотвращаем всплытие события
    event.stopPropagation()
    event.preventDefault()
    
    // Эмитим событие для открытия модального окна
    emit('open-modal')
}

// Загружаем аватары при монтировании компонента
onMounted(async () => {
    await loadLeaderAvatars()
})

// Следим за изменением списка руководителей и загружаем новые аватары
watch(() => props.leaders, async (newLeaders) => {
    if (newLeaders && newLeaders.length > 0) {
        await loadLeaderAvatars()
    }
}, { deep: true })
</script>

<style scoped lang="scss">
.leaders-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    min-width: 200px;
}

.no-leaders {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    color: #6c757d;
}

.no-leaders-icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #e9ecef;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.875rem;
    font-weight: 600;
    color: #6c757d;
    flex-shrink: 0;
}

.no-leaders-text {
    font-size: 0.875rem;
    color: #6c757d;
}


.leaders-items {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-height: 200px;
    overflow-y: auto;
    
    // Стилизация скроллбара
    &::-webkit-scrollbar {
        width: 4px;
    }
    
    &::-webkit-scrollbar-track {
        background: #f1f3f4;
        border-radius: 2px;
    }
    
    &::-webkit-scrollbar-thumb {
        background: #c1c8cd;
        border-radius: 2px;
        
        &:hover {
            background: #a8b2ba;
        }
    }
}

.leader-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem;
    border-radius: 6px;
    transition: background-color 0.2s ease;
    
    &:hover {
        background-color: #f8f9fa;
    }
    
    &.clickable {
        cursor: pointer;
        
        &:hover {
            background-color: #e9ecef;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        &:active {
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
        }
    }
}

.leader-avatar-container {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
}

.leader-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #e9ecef;
    background: #f8f9fa;
}

.leader-info {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    min-width: 0;
    flex: 1;
}

.leader-name {
    font-size: 0.875rem;
    font-weight: 500;
    color: #212529;
    line-height: 1.2;
    word-wrap: break-word;
    overflow-wrap: break-word;
    hyphens: auto;
}

.leader-position {
    font-size: 0.75rem;
    color: #6c757d;
    line-height: 1.2;
    word-wrap: break-word;
    overflow-wrap: break-word;
}

.avatar-stack {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem;
    border-radius: 6px;
    background-color: #f8f9fa;
    border: 1px solid #e9ecef;
    margin-top: 0.25rem;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
        background-color: #e9ecef;
        border-color: #dee2e6;
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    &:active {
        transform: translateY(0);
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    }
}

.avatar-stack-container {
    display: flex;
    align-items: center;
    position: relative;
    flex-shrink: 0;
}

.stacked-avatar {
    position: relative;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin-left: -6px;
    
    &:first-child {
        margin-left: 0;
    }
}

.stacked-avatar-img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
}

.stacked-avatar-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.5rem;
    font-weight: 600;
    color: #6c757d;
    background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
}

.stacked-avatar-counter {
    background: #6c757d;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .counter-text {
        color: white;
        font-size: 0.5rem;
        font-weight: 600;
    }
}

// Адаптивность
@media (max-width: 480px) {
    .leaders-list {
        min-width: 160px;
    }
    
    .leader-item {
        gap: 0.5rem;
        padding: 0.375rem;
    }
    
    .leader-avatar-container {
        width: 28px;
        height: 28px;
    }
    
    .leader-avatar {
        width: 28px;
        height: 28px;
    }
    
    .stacked-avatar {
        width: 20px;
        height: 20px;
        margin-left: -4px;
        
        &:first-child {
            margin-left: 0;
        }
    }
    
    .stacked-avatar-placeholder {
        font-size: 0.5rem;
    }
    
    .counter-text {
        font-size: 0.5rem;
    }
    
    .leader-name {
        font-size: 0.8125rem;
    }
    
    .leader-position {
        font-size: 0.6875rem;
    }
}
</style>
