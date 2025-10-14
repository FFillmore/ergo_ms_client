<template>
    <transition name="fade-scale">
        <div v-show="visible" class="profile-menu" role="dialog" aria-modal="true">
            <div class="profile-header">
                <div class="avatar">
                    <img v-if="avatarUrl" :src="avatarUrl" alt="Аватар" class="avatar-img" />
                    <UserRound v-else :size="18" />
                </div>
                <div class="user-meta">
                    <div class="user-name">{{ userFullName }}</div>
                    <div class="user-email text-muted">{{ userRole }}</div>
                </div>
            </div>
            <div class="menu-list">
                <button class="menu-item" type="button" @click="goToProfile">
                    <UserRound :size="18" />
                    <span>Мой профиль</span>
                </button>
                <button class="menu-item" type="button" @click="$emit('navigate', 'settings')">
                    <Settings :size="18" />
                    <span>Настройки</span>
                </button>
                <hr v-if="isAdmin" class="dropdown-divider" />
                <button v-if="isAdmin" class="menu-item" type="button" @click="goToServicePage">
                    <Wrench :size="18" />
                    <span>Служебная страница</span>
                </button>
                <hr v-if="isAdmin" class="dropdown-divider" />
                <button class="menu-item text-danger" type="button" @click="goToLogout">
                    <LogOut :size="18" />
                    <span>Выйти</span>
                </button>
            </div>
        </div>
    </transition>
</template>

<script setup>
import { defineProps, defineEmits, computed, ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { UserRound, Settings, LogOut, Wrench } from 'lucide-vue-next'
import { useUserStore } from '@/core/cms/js/userStore.js'
import { formatNameWithInitials } from '../js/nameUtils.js'

import { apiClient } from '@/js/api/manager.js'

defineProps({
    visible: { type: Boolean, default: false }
})

defineEmits(['close', 'navigate'])

const userStore = useUserStore()
const router = useRouter()

const userFullName = computed(() => {
    const user = userStore.user
    if (!user) return 'Гость'
    
    const formattedName = formatNameWithInitials(user)
    return formattedName !== '—' ? formattedName : 'Гость'
})

const userRole = ref('Роль не определена')
const avatarUrl = computed(() => userStore.avatarUrl)

const isAdmin = ref(false)

async function loadRole(userId) {
    let admin = false
    try {
        // Используем новый API endpoint для получения профиля пользователя
        const resp = await apiClient.get(`/project_ed/profiles/profiles/${userId}/`)
        const profile = resp.data
        if (profile) {
            const roleName = profile?.role_name
            userRole.value = roleName && roleName.trim() ? roleName : 'Роль не определена'
            admin = roleName === 'Администратор'
        } else {
            userRole.value = 'Роль не определена'
        }
    } catch (e) {
        userRole.value = 'Роль не определена'
    }
    isAdmin.value = admin
}

onMounted(async () => {
    const uid = userStore.user?.id
    if (uid) {
        await loadRole(uid)
    }
})

watch(() => userStore.user?.id, async (newId, oldId) => {
    if (newId && newId !== oldId) {
        await loadRole(newId)
    }
}, { immediate: false })

function goToProfile() {
    const currentUserId = userStore.user?.id
    router.push(`/project-ed/profile/${currentUserId}`)
}

function goToServicePage() {
    router.push({ name: 'ProjectEdTechnical' })
}

function goToLogout() {
    router.push({ name: 'logout' })
}
</script>

<style scoped lang="scss">
.profile-menu {
    position: absolute;
    top: 0;
    right: 0;
    min-width: 260px;
    border: 1px solid var(--color-border);
    border-radius: .75rem;
    background-color: var(--color-primary-background);
    box-shadow: 0 .5rem 1rem rgba(0,0,0,.15);
    z-index: 1000;
    padding: .5rem;
}
.profile-header {
    display: flex;
    align-items: center;
    gap: .5rem;
    padding: .5rem;
}
.avatar {
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
.user-meta { display: flex; flex-direction: column; }
.user-name { font-weight: 600; }
.user-email { font-size: .875rem; }
.menu-list { display: flex; flex-direction: column; padding: .25rem; }
.menu-item {
    display: inline-flex;
    align-items: center;
    gap: .5rem;
    text-align: left;
    padding: .5rem .75rem;
    border-radius: .5rem;
    border: none;
    background: transparent;
    color: var(--color-primary-text);
    cursor: pointer;
    transition: background-color .15s ease, color .15s ease;
}
.menu-item:hover { background-color: var(--color-hover-background); }

.dropdown-divider {
    height: 0;
    margin: .25rem 0;
    overflow: visible;
    border: 0;
    border-top: 1px solid var(--color-border);
}

.fade-scale-enter-active, .fade-scale-leave-active { transition: all .12s ease; }
.fade-scale-enter-from, .fade-scale-leave-to { opacity: 0; transform: translateY(-4px) scale(.98); }
</style>    