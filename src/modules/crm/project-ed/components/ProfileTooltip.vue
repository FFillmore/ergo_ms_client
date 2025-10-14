<template>
  <div class="profile-tooltip">
    <template v-if="!loading">
      <div class="profile-header">
        <div class="profile-avatar" @click="openProfile">
          <UserAvatar
            :customAvatarUrl="displayAvatarUrl"
            :title="displayFullName || displayUsername || 'Пользователь'"
            size="medium"
          />
        </div>
        <div class="profile-info">
          <div class="profile-name">
            <span class="username user-link" @click="openProfile">{{ displayFullName || 'Пользователь' }}</span>
            <span class="full-name">{{ displayPosition }}</span>
          </div>
        </div>
      </div>

      <div class="profile-details">   
        <div class="detail-item" v-if="displayFaculty">
          <LucideBuilding2 class="detail-icon" :size="14" />
          <span>{{ displayFaculty }}</span>
        </div>
        
        <div class="detail-item" v-if="displayDepartment">
          <LucideGitBranch class="detail-icon" :size="14" />
          <span>{{ displayDepartment }}</span>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="profile-header">
        <div class="profile-avatar">
          <div class="skeleton skeleton-avatar"></div>
        </div>
        <div class="profile-info">
          <div class="profile-name">
            <div class="skeleton skeleton-line skeleton-line-lg"></div>
            <div class="skeleton skeleton-line skeleton-line-sm"></div>
          </div>
        </div>
      </div>
      <div class="profile-details">
        <div class="skeleton skeleton-line"></div>
        <div class="skeleton skeleton-line"></div>
      </div>
    </template>
  </div>
  
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { apiClient } from '@/js/api/manager'
import UserAvatar from './UserAvatar.vue'
import { Building2 as LucideBuilding2, GitBranch as LucideGitBranch } from 'lucide-vue-next'

const props = defineProps({
  userId: {
    type: [Number, String],
    default: null
  },
  username: {
    type: String,
    default: ''
  },
  fullName: {
    type: String,
    default: ''
  },
  position: {
    type: String,
    default: ''
  },
  faculty: {
    type: String,
    default: ''
  },
  department: {
    type: String,
    default: ''
  },
  avatarUrl: {
    type: String,
    default: null
  }
})

const loading = ref(false)
const loadedUser = ref(null)
const router = useRouter()

function openProfile() {
  const userId = loadedUser.value?.id || props.userId
  if (!userId) return
  router.push({ path: `/project-ed/profile/${userId}` })
}

async function fetchUser() {
  const id = props.userId
  const uname = (props.username || '').trim()
  if (!id && !uname) return
  loading.value = true
  try {
    if (id) {
      // Детальный профиль по id
      const resp = await apiClient.get('project_ed/profiles/profiles/' + id + '/')
      loadedUser.value = resp?.data || null
    } else {
      // Поиск по username через search
      const resp = await apiClient.get('project_ed/profiles/profiles/', { search: uname })
      const list = Array.isArray(resp?.data) ? resp.data : (resp?.data?.results || [])
      loadedUser.value = Array.isArray(list) ? (list.find(u => (u.username || '').toLowerCase() === uname.toLowerCase()) || list[0] || null) : null
    }
  } catch (e) {
    loadedUser.value = null
  } finally {
    loading.value = false
  }
}

onMounted(fetchUser)
watch(() => [props.userId, props.username], () => { fetchUser() })

const displayUsername = computed(() => loadedUser.value?.username || props.username)
const displayFullName = computed(() => {
  const u = loadedUser.value || {}
  const parts = [u.last_name, u.first_name, u.middle_name].filter(Boolean)
  return (parts.join(' ') || props.fullName || u.username || '')
})
const displayPosition = computed(() => {
  const u = loadedUser.value || {}
  return u.position_name || u.position || u.job_title || props.position
})
const displayFaculty = computed(() => {
  const u = loadedUser.value || {}
  return u.faculty_name || u.faculty_title || u.faculty || u.institute_name || props.faculty
})
const displayDepartment = computed(() => {
  const u = loadedUser.value || {}
  return u.department_name || u.department_title || u.department || props.department
})
const displayAvatarUrl = computed(() => loadedUser.value?.avatar_url || props.avatarUrl)
</script>

<style scoped lang="scss">
.profile-tooltip {
  display: flex;
  gap: 0.25rem;
  flex-direction: column;
  justify-content: center;
  min-width: 200px;
  max-width: 280px;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 48px; // высота аватара для точного вертикального выравнивания
}

.profile-avatar {
  flex-shrink: 0;
  cursor: pointer;
}

.profile-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
  min-width: 0;
}

.profile-name {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 0; // без доп. отступа, чтобы центрирование по аватару было точным
}

.username {
  font-weight: 600;
  font-size: clamp(0.625rem, 2.5vw, 1rem);
  color: var(--color-primary-text);
  line-height: 1.2;
}

.user-link {
  cursor: pointer;
}
.user-link:hover {
  color: var(--bs-primary);
  text-decoration: none;
}

.full-name {
  font-weight: 400;
  font-size: clamp(0.625rem, 2vw, .875rem);
  color: var(--color-secondary-text);
  line-height: 1.2;
}

.profile-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-item {
  display: flex;
  align-items: center;
  font-size: clamp(0.625rem, 2vw, .875rem);
  color: var(--color-primary-text);
  line-height: 1.2;
  
  .detail-icon {
    color: var(--color-secondary-text);
    width: 14px;
    height: 14px;
    margin-right: 4px;
    flex-shrink: 0;
  }
  
  span {
    flex: 1;
    min-width: 0;
    word-break: break-word;
  }
}

// Скелетоны
.skeleton {
  position: relative;
  overflow: hidden;
  background: #e9ecef; // серый фон
  border-radius: 6px;
}

.skeleton::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0) 100%);
  animation: shimmer 1.2s infinite;
}

.skeleton-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
}

.skeleton-line {
  height: 10px;
  margin: 6px 0;
}

.skeleton-line-lg { height: 14px; }
.skeleton-line-sm { height: 8px; width: 60%; }

@keyframes shimmer {
  100% { transform: translateX(100%); }
}

// Адаптивность для мобильных устройств
@media (max-width: 480px) {
  .profile-tooltip {
    min-width: 180px;
    max-width: 240px;
    gap: 0.5rem;
    padding: 0.5rem;
  }
}
</style>