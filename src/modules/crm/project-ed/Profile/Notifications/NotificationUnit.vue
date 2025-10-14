<template>
    <div 
        class="notification-item"
        :class="{ 'unread': !notification.is_read }"
        @click="emitRead"
    >
        <div class="notification-icon" :data-type="notification.type">
            <component :is="iconComponent" :size="20" />
        </div>

        <div class="notification-content">
            <div class="notification-header-content">
                <h4 class="notification-subject">{{ notification.title }}</h4>
                <span class="notification-time">{{ formattedTime }}</span>
            </div>
            <p class="notification-message">{{ notification.message }}</p>

            <div v-if="notification.payload?.actions" class="notification-actions-item">
                <button 
                    v-for="action in notification.payload.actions"
                    :key="action.label"
                    class="action-link"
                    @click.stop="emitAction(action)"
                >
                    {{ action.label }}
                </button>
            </div>
        </div>

        <div class="notification-status">
            <div v-if="!notification.is_read" class="unread-indicator"></div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { Bell, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-vue-next'

const emit = defineEmits(['read', 'action'])

const props = defineProps({
    notification: {
        type: Object,
        required: true
    },
    // Необязательный формат даты. По умолчанию локаль ru-RU и относительный вид
    dateOptions: {
        type: Object,
        default: () => ({
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
    }
})

const iconsMap = {
    info: Info,
    warning: AlertTriangle,
    success: CheckCircle,
    error: AlertCircle,
    default: Bell
}

const iconComponent = computed(() => {
    return iconsMap[props.notification?.type] || iconsMap.default
})

const formattedTime = computed(() => {
    const value = props.notification?.created_at
    if (!value) return ''
    try {
        const date = typeof value === 'string' || typeof value === 'number' ? new Date(value) : value
        return new Intl.DateTimeFormat('ru-RU', props.dateOptions).format(date)
    } catch (e) {
        return ''
    }
})

const emitRead = () => {
    emit('read', { id: props.notification?.id })
}

const emitAction = (action) => {
    emit('action', { id: props.notification?.id, action })
}
</script>

<style scoped lang="scss">
.notification-item {
    display: flex;
    align-items: flex-start;
    padding: 10px 12px;
    border-bottom: 1px solid var(--bs-border-color-translucent, rgba(222, 226, 230, 0.5));
    cursor: pointer;
    transition: background-color 0.15s ease;
    
    &:hover {
        background: var(--color-hover-background, #f8f9fa);
    }
    
    &.unread {
        background: rgba(13, 110, 253, 0.05);
        border-left: 3px solid var(--bs-primary, #0d6efd);
    }
    
    &:last-child {
        border-bottom: none;
    }
}

.notification-icon {
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 10px;
    border-radius: 50%;
    background: var(--color-hover-background, #f8f9fa);
}

.notification-content {
    flex: 1;
    min-width: 0;
}

.notification-header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 4px;
}

.notification-subject {
    margin: 0;
    font-size: 13px;
    font-weight: 600;
    color: var(--bs-body-color, #212529);
    line-height: 1.3;
}

.notification-time {
    font-size: 12px;
    color: var(--bs-secondary, #6c757d);
    white-space: nowrap;
    margin-left: 8px;
}

.notification-message {
    margin: 0 0 8px 0;
    font-size: 12px;
    color: var(--bs-body-color, #212529);
    line-height: 1.4;
}

.notification-actions-item {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.action-link {
    padding: 2px 6px;
    border: none;
    background: none;
    color: var(--bs-primary, #0d6efd);
    font-size: 12px;
    cursor: pointer;
    text-decoration: underline;
    transition: color 0.15s ease;
    
    &:hover {
        color: var(--bs-primary-dark, #0a58ca);
    }
}

.notification-status {
    flex-shrink: 0;
    width: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.unread-indicator {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--bs-primary, #0d6efd);
}

// Стили для разных типов уведомлений (акцент фона иконки)
.notification-item.unread .notification-icon {
    &[data-type="info"] { background: rgba(13, 110, 253, 0.1); }
    &[data-type="warning"] { background: rgba(255, 193, 7, 0.1); }
    &[data-type="success"] { background: rgba(25, 135, 84, 0.1); }
    &[data-type="error"] { background: rgba(220, 53, 69, 0.1); }
}
</style>