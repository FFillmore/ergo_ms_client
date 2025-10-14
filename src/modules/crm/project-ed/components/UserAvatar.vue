<template>
  <div 
    class="user-avatar"
    :class="[
      `user-avatar--${size}`,
      { 'user-avatar--clickable': clickable }
    ]"
    :title="title"
  >
    <!-- Показываем загруженное изображение если есть -->
    <img 
      v-if="hasCustomAvatar"
      :src="avatarUrl"
      :alt="title"
      class="user-avatar-image"
      @error="onImageError"
    />
    <!-- Показываем стандартный аватар если нет кастомного -->
    <DefaultAvatar 
      v-else
      :size="size"
      :clickable="clickable"
      :title="title"
    />
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useUserStore } from '@/core/cms/js/userStore.js'
import DefaultAvatar from '@/components/DefaultAvatar.vue'

const userStore = useUserStore()

// Инициализируем пользователя при монтировании компонента
onMounted(async () => {
  if (!userStore.isInitialized) {
    await userStore.initializeUser()
  }
})

const props = defineProps({
  size: {
    type: String,
    default: 'medium', // small, medium, large
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  clickable: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Пользователь'
  },
  // Опциональный URL аватара для переопределения
  customAvatarUrl: {
    type: [String, null],
    default: undefined
  }
})

// Используем переданный URL или URL из store
const avatarUrl = computed(() => {
  // Если customAvatarUrl явно передан (даже если null), используем его
  // Если не передан вообще, используем аватар из store
  if (props.customAvatarUrl !== undefined) {
    return props.customAvatarUrl
  }
  return userStore.avatarUrl
})

// Проверяем, есть ли кастомный аватар
const hasCustomAvatar = computed(() => {
  return !!avatarUrl.value
})

// Обработка ошибки загрузки изображения
const onImageError = (event) => {
}
</script>

<style scoped lang="scss">
.user-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
  transition: all 0.2s ease;
  user-select: none;
  
  &--small {
    width: 32px;
    height: 32px;
  }
  
  &--medium {
    width: 40px;
    height: 40px;
  }
  
  &--large {
    width: 120px;
    height: 120px;
  }
  
  &--clickable {
    cursor: pointer;
    
    &:hover {
      transform: scale(1.05);
    }
  }
}

.user-avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  
  .user-avatar--clickable:hover & {
    border-color: rgba(255, 255, 255, 0.4);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
}
</style>
