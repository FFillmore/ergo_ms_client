import { ref, computed } from 'vue'
import { apiClient } from '@/js/api/manager'
import { projectEdEndpoints } from './endpoints'

export function useNotifications() {
    const notifications = ref([])
    const isLoading = ref(false)
    const error = ref(null)

    // Computed для подсчета непрочитанных уведомлений
    const unreadCount = computed(() => {
        return notifications.value.filter(n => !n.is_read).length
    })

    // Загрузка уведомлений
    const loadNotifications = async () => {
        try {
            isLoading.value = true
            error.value = null
            
            const response = await apiClient.get(projectEdEndpoints.project_ed.notifications.list)
            
            if (response.success) {
                notifications.value = Array.isArray(response.data) ? response.data : (response.data?.results || [])
            } else {
                throw new Error(response.message || 'Ошибка загрузки уведомлений')
            }
        } catch (err) {
            console.error('Ошибка загрузки уведомлений:', err)
            error.value = err.message
            notifications.value = []
        } finally {
            isLoading.value = false
        }
    }

    // Получение количества непрочитанных уведомлений
    const getUnreadCount = async () => {
        try {
            const response = await apiClient.get(projectEdEndpoints.project_ed.notifications.unreadCount)
            
            if (response.success) {
                return response.data.count || 0
            } else {
                throw new Error(response.message || 'Ошибка получения количества уведомлений')
            }
        } catch (err) {
            console.error('Ошибка получения количества уведомлений:', err)
            return 0
        }
    }

    // Отметить уведомление как прочитанное
    const markAsRead = async (notificationId) => {
        try {
            const response = await apiClient.post(
                projectEdEndpoints.project_ed.notifications.markRead(notificationId)
            )
            
            if (response.success) {
                // Обновляем локальное состояние
                const notification = notifications.value.find(n => n.id === notificationId)
                if (notification) {
                    notification.is_read = true
                    notification.read_at = new Date().toISOString()
                }
                return true
            } else {
                throw new Error(response.message || 'Ошибка отметки уведомления как прочитанного')
            }
        } catch (err) {
            console.error('Ошибка отметки уведомления как прочитанного:', err)
            return false
        }
    }

    // Отметить все уведомления как прочитанные
    const markAllAsRead = async () => {
        try {
            const response = await apiClient.post(
                projectEdEndpoints.project_ed.notifications.markAllRead
            )
            
            if (response.success) {
                // Обновляем локальное состояние
                notifications.value.forEach(notification => {
                    notification.is_read = true
                    notification.read_at = new Date().toISOString()
                })
                return response.data.updated || 0
            } else {
                throw new Error(response.message || 'Ошибка отметки всех уведомлений как прочитанных')
            }
        } catch (err) {
            console.error('Ошибка отметки всех уведомлений как прочитанных:', err)
            return 0
        }
    }

    // Форматирование времени
    const formatTime = (dateString) => {
        const date = new Date(dateString)
        const now = new Date()
        const diff = now - date
        const minutes = Math.floor(diff / (1000 * 60))
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        
        if (minutes < 60) {
            return `${minutes} мин назад`
        } else if (hours < 24) {
            return `${hours} ч назад`
        } else {
            return `${days} дн назад`
        }
    }

    // Получение иконки для типа уведомления
    const getNotificationIcon = (type) => {
        const icons = {
            info: 'Info',
            warning: 'AlertTriangle',
            success: 'CheckCircle',
            error: 'AlertCircle'
        }
        return icons[type] || 'Bell'
    }

    return {
        // Состояние
        notifications,
        isLoading,
        error,
        unreadCount,
        
        // Методы
        loadNotifications,
        getUnreadCount,
        markAsRead,
        markAllAsRead,
        formatTime,
        getNotificationIcon
    }
}
