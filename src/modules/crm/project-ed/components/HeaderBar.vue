<template>
    <div class="page-header">
        <div class="header-search">
            <form class="search-form" @submit.prevent>
                <input type="search" class="search-input" placeholder="Поиск" aria-label="Поиск" />
                <button type="submit" class="search-button" aria-label="Найти">
                    <Search :size="18" />
                </button>
            </form>
        </div>
        <div class="header-actions">
            <div class="header-buttons">
                <div 
                    v-if="!isCreatePage" 
                    class="button-create" 
                    role="button" 
                    aria-label="Создать проект"
                    @click="navigateToCreate"
                >
                    <Plus :size="18" />
                    <span>Создать проект</span>
                </div>
            </div>
            <div class="header-profile" ref="profileRef">
                <div class="profile-alerts-container" ref="alertsRef">
                    <div class="profile-alerts" :class="{ active: showNotifications }" @click="toggleNotifications" role="button" aria-label="Уведомления">
                        <Bell :size="18" />
                        <span v-if="unreadNotificationsCount > 0" class="badge-count">{{ unreadNotificationsCount >= 99 ? '99+' : unreadNotificationsCount }}</span>
                    </div>
                    <div class="alerts-menu-wrapper" v-show="showNotifications">
                        <NotificationContainer 
                            :visible="showNotifications" 
                            @close="showNotifications = false"
                            @action="handleNotificationAction"
                        />
                    </div>
                </div>
                <div class="profile-avatar-container">
                    <div class="profile-avatar" role="button" aria-haspopup="dialog" aria-expanded="showProfileMenu ? 'true' : 'false'" @click="toggleProfileMenu">
                        <img v-if="avatarUrl" :src="avatarUrl" alt="Аватар" class="avatar-img" />
                        <UserRound v-else :size="18" />
                    </div>
                    <div class="profile-menu-wrapper" v-show="showProfileMenu">
                        <ProfileMenu :visible="showProfileMenu" @navigate="onMenuNavigate" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { UserRound, Bell, Plus, Search } from 'lucide-vue-next'
import ProfileMenu from './ProfileMenu.vue'
import NotificationContainer from '../Profile/NotificationContainer.vue'
import { useUserStore } from '@/core/cms/js/userStore.js'
import { apiClient } from '@/js/api/manager.js'
import { projectEdEndpoints } from '../js/endpoints.js'

const route = useRoute()
const router = useRouter()

const userStore = useUserStore()

const alertsCount = ref(0)
const showProfileMenu = ref(false)
const showNotifications = ref(false)
const profileRef = ref(null)
const alertsRef = ref(null)

const isCreatePage = computed(() => {
    return route.name === 'ProjectEdCreate'
})

const avatarUrl = computed(() => userStore.avatarUrl)

// Количество непрочитанных уведомлений
const unreadNotificationsCount = ref(0)

const incrementAlerts = () => {
    if (alertsCount.value < 99) {
        alertsCount.value += 1
    }
}

const toggleNotifications = () => {
    showNotifications.value = !showNotifications.value
    if (showNotifications.value) {
        showProfileMenu.value = false
    }
}

const navigateToCreate = () => {
    router.push({ name: 'ProjectEdCreate' })
}

const toggleProfileMenu = () => {
    showProfileMenu.value = !showProfileMenu.value
    if (showProfileMenu.value) {
        showNotifications.value = false
    }
}

const handleNotificationAction = (actionData) => {
    // Обновляем счетчик после действий с уведомлениями
    if (actionData.action === 'read' || actionData.action === 'markAllRead') {
        refreshUnreadCount()
    }
    
    // Здесь можно добавить логику обработки действий уведомлений
    if (actionData.action === 'viewAll') {
        // Переход на страницу всех уведомлений
        // router.push('/notifications')
    }
}

const closeOnOutside = (event) => {
    const profileRoot = profileRef.value
    const alertsRoot = alertsRef.value
    
    if (profileRoot && !profileRoot.contains(event.target)) {
        showProfileMenu.value = false
    }
    
    if (alertsRoot && !alertsRoot.contains(event.target)) {
        showNotifications.value = false
    }
}

const closeOnEsc = (event) => {
    if (event.key === 'Escape') {
        showProfileMenu.value = false
        showNotifications.value = false
    }
}

const onMenuNavigate = (action) => {
    // Навигацию подключим при интеграции реальных страниц
    if (action === 'logout') {
        // TODO: вызвать логаут когда будет готов
    } else if (action === 'profile') {
        // router.push({ name: 'Profile' })
    } else if (action === 'settings') {
        // router.push({ name: 'Settings' })
    }
    showProfileMenu.value = false
}

let pollTimer = null
const refreshUnreadCount = async () => {
    try {
        const res = await apiClient.get(projectEdEndpoints.project_ed.notifications.unreadCount)
        const count = (res?.data?.count ?? res?.data ?? 0)
        unreadNotificationsCount.value = Number.isFinite(count) ? count : 0
    } catch (e) {
        // Тихо игнорируем ошибки загрузки счётчика
    }
}

onMounted(() => {
    document.addEventListener('click', closeOnOutside)
    document.addEventListener('keydown', closeOnEsc)
    // Первичная загрузка счётчика уведомлений
    refreshUnreadCount()
    // Периодическое обновление раз в 30 секунд
    pollTimer = setInterval(refreshUnreadCount, 30000)
})

onBeforeUnmount(() => {
    document.removeEventListener('click', closeOnOutside)
    document.removeEventListener('keydown', closeOnEsc)
    if (pollTimer) clearInterval(pollTimer)
})
</script>

<style scoped lang="scss">
.page-header {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
}
.header-actions {
    display: flex;
    align-items: center;
    justify-content: end;
    gap: .5rem;
}
.header-buttons {
    display: flex;
    align-items: center;
    gap: .5rem;
}
.button-create {
    display: inline-flex;
    align-items: center;
    gap: .5rem;
    padding: .375rem .75rem;
    border-radius: 2rem;
    background-color: var(--color-header-background);
    color: var(--color-primary-text);
    cursor: pointer;
    transition: background-color .15s ease, border-color .15s ease, color .15s ease, box-shadow .15s ease;
}
.button-create:hover {
    background-color: var(--color-hover-background, #f8f9fa);
    border-color: var(--color-border);
}
.header-profile {
    position: relative;
    display: flex;
    align-items: center;
    gap: .5rem;
}
.header-search {
    justify-self: center;
    width: 100%;
    max-width: 450px;
}
.search-form { position: relative; width: 100%; }
.search-input {
    width: 100%;
    height: 38px;
    padding: .375rem 2.25rem .375rem .875rem;
    border: 1px solid var(--color-border);
    border-radius: 9999px;
    background-color: var(--color-primary-background);
    color: var(--color-primary-text);
    outline: none;
    transition: box-shadow .15s ease, border-color .15s ease;
}
.search-input::placeholder { color: var(--color-secondary-text); }
.search-input:focus {
    border-color: var(--bs-primary, #0d6efd);
    box-shadow: 0 0 0 .2rem rgba(13,110,253,.15);
}
.search-button {
    position: absolute;
    top: 50%;
    right: .375rem;
    transform: translateY(-50%);
    width: 34px;
    height: 34px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 50%;
    background: transparent;
    color: var(--color-primary-text);
    cursor: pointer;
    transition: background-color .15s ease, color .15s ease;
}
.search-button:hover { background-color: var(--color-hover-background); }
.profile-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--color-primary-background);
    border: 1px solid var(--color-border);
    overflow: hidden;
}
.avatar-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.profile-alerts-container {
    position: relative;
}

.profile-avatar-container {
    position: relative;
}

.profile-alerts {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: transparent;
    border: 1px solid transparent;
    cursor: pointer;
    transition: background-color .15s ease, border-color .15s ease, color .15s ease;
    position: relative;
}
.profile-alerts:hover { background-color: var(--color-hover-background); }
.profile-alerts.active { background-color: var(--color-hover-background); }
.badge-count {
    position: absolute;
    right: -2px;
    bottom: -2px;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    border-radius: 9999px;
    background-color: var(--bs-danger, #dc3545);
    color: var(--color-primary-text);
    font-size: 10px;
    line-height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
}
.profile-menu-wrapper { 
    position: absolute !important; 
    top: 100% !important; 
    right: 0 !important; 
    margin-top: .5rem; 
}
.alerts-menu-wrapper { 
    position: absolute !important; 
    top: 100% !important; 
    right: 0 !important; 
    margin-top: .5rem; 
}

.alerts-menu-wrapper .notification-container {
    position: relative !important;
    top: auto !important;
    left: auto !important;
    right: auto !important;
    bottom: auto !important;
}
</style>



