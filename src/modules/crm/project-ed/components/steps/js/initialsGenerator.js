/**
 * Утилита для генерации инициалов из полного имени
 * Использует функции из nameUtils.js для корректной работы с полями отчества
 * Формат: "Фамилия И.О."
 */

import { formatNameWithInitials, getInitials } from '../../../js/nameUtils.js'

/**
 * Генерирует инициалы из полного имени
 * @param {string} fullName - Полное имя в формате "Фамилия Имя Отчество" или "Имя Фамилия"
 * @returns {string} - Инициалы в формате "Фамилия И.О."
 */
export const generateInitials = (fullName) => {
    if (!fullName || fullName === 'Гость') return 'Иванов И.А.'
    
    const nameParts = fullName.trim().split(' ').filter(part => part.length > 0)
    if (nameParts.length < 2) return 'Иванов И.А.'
    
    // Создаем объект пользователя для работы с nameUtils
    let person = {}
    
    if (nameParts.length === 2) {
        // Проверяем, если второе слово содержит точки (уже инициалы)
        if (nameParts[1].includes('.')) {
            // Формат: "Имя И.О." - первое слово это имя, второе уже инициалы фамилии и отчества
            // Нужно переставить на "Фамилия И.О."
            // Пока что возвращаем первое слово как фамилию, а второе как инициалы
            // Это временное решение, пока не узнаем полную структуру данных
            return `${nameParts[0]} ${nameParts[1]}`
        } else {
            // Обычный формат: "Имя Фамилия"
            person.first_name = nameParts[0]
            person.last_name = nameParts[1]
            person.middle_name = ''
        }
    } else if (nameParts.length >= 3) {
        // Проверяем формат: "Имя Отчество Фамилия" или "Фамилия Имя Отчество"
        // Если третье слово заканчивается на -ов, -ев, -ин, -ский и т.д., то это фамилия
        const lastWord = nameParts[nameParts.length - 1].toLowerCase()
        const isLastNameLast = lastWord.endsWith('ов') || lastWord.endsWith('ев') || 
                              lastWord.endsWith('ин') || lastWord.endsWith('ский') ||
                              lastWord.endsWith('ая') || lastWord.endsWith('ий') ||
                              lastWord.length > 5 // Если последнее слово длинное, скорее всего это фамилия
        
        if (isLastNameLast) {
            // Формат: "Имя Отчество Фамилия"
            person.first_name = nameParts[0]
            person.middle_name = nameParts[1]
            person.last_name = nameParts[2]
        } else {
            // Формат: "Фамилия Имя Отчество"
            person.last_name = nameParts[0]
            person.first_name = nameParts[1]
            person.middle_name = nameParts[2]
        }
    }
    
    // Используем функцию из nameUtils для генерации инициалов
    return formatNameWithInitials(person)
}

/**
 * Генерирует наименование проекта в формате: КодМероприятия-Год-Инициалы-Наименование
 * @param {Object} selectedEvent - Выбранное мероприятие
 * @param {Object} userInfo - Информация о пользователе (может быть computed из userStore)
 * @param {number} sequenceNumber - Порядковый номер проекта
 * @returns {string} - Сгенерированное наименование проекта
 */
export const generateProjectName = (selectedEvent, userInfo, sequenceNumber) => {
    if (!selectedEvent) {
        return ''
    }
    
    const currentYear = new Date().getFullYear()
    const eventCode = selectedEvent.code || ''
    const eventTitle = selectedEvent.title || ''
    
    // Генерируем инициалы из информации о пользователе
    let userInitials = 'И.А.' // Значение по умолчанию
    
    if (userInfo) {
        if (userInfo.initials) {
            userInitials = userInfo.initials
        } else if (userInfo.name) {
            userInitials = generateInitials(userInfo.name)
        } else {
            // Если есть отдельные поля имени, используем nameUtils
            const person = {
                first_name: userInfo.first_name,
                last_name: userInfo.last_name,
                middle_name: userInfo.middle_name
            }
            if (person.first_name || person.last_name || person.middle_name) {
                userInitials = formatNameWithInitials(person)
            }
        }
    }
    
    // Добавляем порядковый номер (начинаем с 01)
    const seq = sequenceNumber && sequenceNumber > 0 ? `-${String(sequenceNumber).padStart(2, '0')}` : '-01'
    return `${eventCode}-${currentYear}${seq}-${userInitials}-${eventTitle}`
}

/**
 * Валидирует полное имя
 * @param {string} fullName - Полное имя для валидации
 * @returns {boolean} - true если имя валидно
 */
export const validateFullName = (fullName) => {
    if (!fullName || typeof fullName !== 'string') return false
    
    const nameParts = fullName.trim().split(' ').filter(part => part.length > 0)
    return nameParts.length >= 2 && nameParts.every(part => part.length > 0)
}

/**
 * Генерирует краткое наименование проекта в формате: КодМероприятия-Год-Инициалы
 * @param {Object} selectedEvent - Выбранное мероприятие
 * @param {Object} userInfo - Информация о пользователе (может быть computed из userStore)
 * @param {number} sequenceNumber - Порядковый номер проекта
 * @returns {string} - Сгенерированное краткое наименование проекта
 */
export const generateShortProjectName = (selectedEvent, userInfo, sequenceNumber) => {
    if (!selectedEvent) {
        return ''
    }
    
    const currentYear = new Date().getFullYear()
    const eventCode = selectedEvent.code || ''
    
    // Генерируем инициалы из информации о пользователе
    let userInitials = 'И.А.' // Значение по умолчанию
    
    if (userInfo) {
        if (userInfo.initials) {
            userInitials = userInfo.initials
        } else if (userInfo.name) {
            userInitials = generateInitials(userInfo.name)
        } else {
            // Если есть отдельные поля имени, используем nameUtils
            const person = {
                first_name: userInfo.first_name,
                last_name: userInfo.last_name,
                middle_name: userInfo.middle_name
            }
            if (person.first_name || person.last_name || person.middle_name) {
                userInitials = formatNameWithInitials(person)
            }
        }
    }
    
    // Добавляем порядковый номер (начинаем с 01)
    const seq = sequenceNumber && sequenceNumber > 0 ? `-${String(sequenceNumber).padStart(2, '0')}` : '-01'
    return `${eventCode}-${currentYear}${seq}-${userInitials}`
}

/**
 * Генерирует инициалы из объекта пользователя с отдельными полями имени
 * @param {Object} userInfo - Объект пользователя с полями first_name, last_name, middle_name
 * @returns {string} - Инициалы в формате "Фамилия И.О."
 */
export const generateInitialsFromUser = (userInfo) => {
    if (!userInfo) return 'Иванов И.А.'
    
    const person = {
        first_name: userInfo.first_name,
        last_name: userInfo.last_name,
        middle_name: userInfo.middle_name
    }
    
    return formatNameWithInitials(person)
}

/**
 * Отладочная функция для проверки генерации инициалов
 * @param {string|Object} input - Входные данные (строка или объект)
 * @returns {Object} - Результат с исходными данными и сгенерированными инициалами
 */
export const debugInitialsGeneration = (input) => {
    let result = {
        input: input,
        type: typeof input,
        generated: '',
        error: null
    }
    
    try {
        if (typeof input === 'string') {
            result.generated = generateInitials(input)
        } else if (typeof input === 'object' && input !== null) {
            result.generated = generateInitialsFromUser(input)
            result.personObject = {
                first_name: input.first_name,
                last_name: input.last_name,
                middle_name: input.middle_name
            }
        } else {
            result.error = 'Неподдерживаемый тип данных'
        }
    } catch (error) {
        result.error = error.message
    }
    
    return result
}

/**
 * Получает только инициалы имени и отчества
 * @param {Object} userInfo - Объект пользователя с полями first_name, middle_name
 * @returns {string} - Инициалы в формате "И.О."
 */
export const getUserInitials = (userInfo) => {
    if (!userInfo) return 'И.А.'
    
    const person = {
        first_name: userInfo.first_name,
        middle_name: userInfo.middle_name
    }
    
    return getInitials(person)
}

/**
 * Форматирует имя для отображения
 * @param {string} fullName - Полное имя
 * @returns {string} - Отформатированное имя
 */
export const formatFullName = (fullName) => {
    if (!fullName) return ''
    
    return fullName
        .trim()
        .split(' ')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(' ')
}
