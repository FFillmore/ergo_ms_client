/**
 * Утилиты для работы с именами пользователей
 */

/**
 * Форматирует имя пользователя в формат "Фамилия И.О." с инициалами
 * @param {Object} person - Объект пользователя с полями first_name, last_name, middle_name
 * @returns {string} Отформатированное имя с инициалами
 */
export function formatNameWithInitials(person) {
    if (!person) return '—'
    
    const lastName = person.last_name || ''
    const firstName = person.first_name || ''
    // Отчество может быть в person.middle_name или в person.adp_profile.middle_name
    const middleName = person.middle_name || person.adp_profile?.middle_name || ''
    
    // Если есть отдельные поля имени, формируем инициалы
    if (lastName || firstName || middleName) {
        let result = lastName.trim()
        
        if (firstName && firstName.trim()) {
            result += ` ${firstName.trim().charAt(0).toUpperCase()}.`
        }
        
        if (middleName && middleName.trim()) {
            result += ` ${middleName.trim().charAt(0).toUpperCase()}.`
        }
        
        return result.trim() || '—'
    }
    
    // Fallback на full_name или username
    return person.full_name || person.username || '—'
}

/**
 * Форматирует имя пользователя в полном формате "Фамилия Имя Отчество"
 * @param {Object} person - Объект пользователя с полями first_name, last_name, middle_name
 * @returns {string} Полное имя пользователя
 */
export function formatFullName(person) {
    if (!person) return '—'
    
    const lastName = person.last_name || ''
    const firstName = person.first_name || ''
    // Отчество может быть в person.middle_name или в person.adp_profile.middle_name
    const middleName = person.middle_name || person.adp_profile?.middle_name || ''
    
    // Если есть отдельные поля имени, формируем полное имя
    if (lastName || firstName || middleName) {
        const parts = [lastName.trim(), firstName.trim(), middleName.trim()].filter(Boolean)
        return parts.join(' ') || '—'
    }
    
    // Fallback на full_name или username
    return person.full_name || person.username || '—'
}

/**
 * Получает инициалы пользователя в формате "И.О."
 * @param {Object} person - Объект пользователя с полями first_name, middle_name
 * @returns {string} Инициалы имени и отчества
 */
export function getInitials(person) {
    if (!person) return ''
    
    const firstName = person.first_name || ''
    // Отчество может быть в person.middle_name или в person.adp_profile.middle_name
    const middleName = person.middle_name || person.adp_profile?.middle_name || ''
    
    let result = ''
    
    if (firstName && firstName.trim()) {
        result += firstName.trim().charAt(0).toUpperCase() + '.'
    }
    
    if (middleName && middleName.trim()) {
        result += middleName.trim().charAt(0).toUpperCase() + '.'
    }
    
    return result
}

/**
 * Получает короткое имя пользователя (только фамилия и инициалы)
 * @param {Object} person - Объект пользователя с полями first_name, last_name, middle_name
 * @returns {string} Короткое имя в формате "Фамилия И.О."
 */
export function getShortName(person) {
    if (!person) return '—'
    
    const lastName = person.last_name || ''
    const initials = getInitials(person)
    
    if (lastName && lastName.trim()) {
        return initials ? `${lastName.trim()} ${initials}` : lastName.trim()
    }
    
    return person.full_name || person.username || '—'
}
