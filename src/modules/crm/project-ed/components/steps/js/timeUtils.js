/**
 * Утилиты для работы с временем
 */

/**
 * Форматирует дату в относительное время (например, "несколько минут назад", "1 час назад")
 * @param {string|Date} date - Дата в ISO формате или объект Date
 * @returns {string} Относительное время на русском языке
 */
export function getRelativeTime(date) {
    if (!date) return ''
    
    const now = new Date()
    const targetDate = new Date(date)
    
    if (isNaN(targetDate.getTime())) return ''
    
    const diffInSeconds = Math.floor((now - targetDate) / 1000)
    
    // Если дата в будущем
    if (diffInSeconds < 0) {
        return 'в будущем'
    }
    
    // Менее минуты
    if (diffInSeconds < 60) {
        return 'только что'
    }
    
    // Менее часа
    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) {
        if (diffInMinutes === 1) {
            return '1 минуту назад'
        } else if (diffInMinutes < 5) {
            return `${diffInMinutes} минуты назад`
        } else {
            return `${diffInMinutes} минут назад`
        }
    }
    
    // Менее дня
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) {
        if (diffInHours === 1) {
            return '1 час назад'
        } else if (diffInHours < 5) {
            return `${diffInHours} часа назад`
        } else {
            return `${diffInHours} часов назад`
        }
    }
    
    // Менее недели
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) {
        if (diffInDays === 1) {
            return '1 день назад'
        } else if (diffInDays < 5) {
            return `${diffInDays} дня назад`
        } else {
            return `${diffInDays} дней назад`
        }
    }
    
    // Менее месяца
    const diffInWeeks = Math.floor(diffInDays / 7)
    if (diffInWeeks < 4) {
        if (diffInWeeks === 1) {
            return '1 неделю назад'
        } else if (diffInWeeks < 5) {
            return `${diffInWeeks} недели назад`
        } else {
            return `${diffInWeeks} недель назад`
        }
    }
    
    // Менее года
    const diffInMonths = Math.floor(diffInDays / 30)
    if (diffInMonths < 12) {
        if (diffInMonths === 1) {
            return '1 месяц назад'
        } else if (diffInMonths < 5) {
            return `${diffInMonths} месяца назад`
        } else {
            return `${diffInMonths} месяцев назад`
        }
    }
    
    // Более года
    const diffInYears = Math.floor(diffInDays / 365)
    if (diffInYears === 1) {
        return '1 год назад'
    } else if (diffInYears < 5) {
        return `${diffInYears} года назад`
    } else {
        return `${diffInYears} лет назад`
    }
}

/**
 * Форматирует дату в полный формат с относительным временем
 * @param {string|Date} date - Дата в ISO формате или объект Date
 * @returns {string} Полный формат даты с относительным временем
 */
export function getFormattedDateWithRelative(date) {
    if (!date) return ''
    
    const targetDate = new Date(date)
    if (isNaN(targetDate.getTime())) return ''
    
    const relativeTime = getRelativeTime(date)
    const fullDate = new Intl.DateTimeFormat('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).format(targetDate)
    
    return `${relativeTime} (${fullDate})`
}
