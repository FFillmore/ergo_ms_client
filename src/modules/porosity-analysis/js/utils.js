/**
 * Утилиты для модуля анализа пористости
 */

/**
 * Форматирование размера файла
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Б'
  const k = 1024
  const sizes = ['Б', 'КБ', 'МБ', 'ГБ']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

/**
 * Получение текста статуса
 */
export function getStatusText(status) {
  const statusMap = {
    'pending': 'Ожидает',
    'processing': 'Обрабатывается',
    'completed': 'Завершен',
    'failed': 'Ошибка'
  }
  return statusMap[status] || status
}

/**
 * Получение класса для статуса
 */
export function getStatusClass(status) {
  const classMap = {
    'pending': 'status-pending',
    'processing': 'status-processing',
    'completed': 'status-completed',
    'failed': 'status-failed'
  }
  return classMap[status] || 'status-pending'
}

/**
 * Получение цвета для статуса
 */
export function getStatusColor(status) {
  const colorMap = {
    'pending': '#ffc107',
    'processing': '#17a2b8',
    'completed': '#28a745',
    'failed': '#dc3545'
  }
  return colorMap[status] || '#ffc107'
}

/**
 * Парсинг номеров анализов из строки
 */
export function parseAnalysisNumbers(input) {
  if (!input || !input.trim()) return []
  
  const numbers = []
  const parts = input.split(/[,\s]+/).filter(part => part.trim())
  
  for (const part of parts) {
    if (part.includes('-')) {
      // Диапазон
      const [start, end] = part.split('-').map(n => parseInt(n.trim()))
      if (!isNaN(start) && !isNaN(end) && start <= end) {
        for (let i = start; i <= end; i++) {
          numbers.push(i)
        }
      }
    } else {
      // Отдельное число
      const num = parseInt(part.trim())
      if (!isNaN(num)) {
        numbers.push(num)
      }
    }
  }
  
  return [...new Set(numbers)].sort((a, b) => a - b)
}

/**
 * Валидация email
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Генерация уникального ID
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * Дебаунс функция
 */
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Форматирование даты
 */
export function formatDate(date, options = {}) {
  const defaultOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }
  
  return new Intl.DateTimeFormat('ru-RU', { ...defaultOptions, ...options }).format(new Date(date))
}

/**
 * Копирование в буфер обмена
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Ошибка копирования в буфер обмена:', err)
    return false
  }
}

/**
 * Проверка поддержки drag & drop
 */
export function isDragDropSupported() {
  const div = document.createElement('div')
  return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 
         'FormData' in window && 'FileReader' in window
}

/**
 * Создание URL для скачивания файла
 */
export function createDownloadUrl(analysisId, filePath, baseUrl = '') {
  const encodedPath = encodeURIComponent(filePath)
  return `${baseUrl}/api/porosity_analysis/analyses/${analysisId}/download_file/?file=${encodedPath}`
}

/**
 * Получение расширения файла
 */
export function getFileExtension(filename) {
  return filename.split('.').pop().toLowerCase()
}

/**
 * Проверка типа изображения
 */
export function isImageFile(filename) {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp']
  const extension = getFileExtension(filename)
  return imageExtensions.includes(extension)
}

/**
 * Создание превью изображения
 */
export function createImagePreview(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Сжатие изображения
 */
export function compressImage(file, maxWidth = 800, quality = 0.8) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
      canvas.width = img.width * ratio
      canvas.height = img.height * ratio
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      
      canvas.toBlob(resolve, file.type, quality)
    }
    
    img.src = URL.createObjectURL(file)
  })
}
