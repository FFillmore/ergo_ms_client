/**
 * Константы для модуля анализа пористости
 */

// Статусы анализов
export const ANALYSIS_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed'
}

// Лейблы статусов
export const STATUS_LABELS = {
  [ANALYSIS_STATUS.PENDING]: 'Ожидает',
  [ANALYSIS_STATUS.PROCESSING]: 'Обрабатывается',
  [ANALYSIS_STATUS.COMPLETED]: 'Завершен',
  [ANALYSIS_STATUS.FAILED]: 'Ошибка'
}

// Цвета статусов
export const STATUS_COLORS = {
  [ANALYSIS_STATUS.PENDING]: '#ffc107',
  [ANALYSIS_STATUS.PROCESSING]: '#17a2b8',
  [ANALYSIS_STATUS.COMPLETED]: '#28a745',
  [ANALYSIS_STATUS.FAILED]: '#dc3545'
}

// Классы статусов
export const STATUS_CLASSES = {
  [ANALYSIS_STATUS.PENDING]: 'status-pending',
  [ANALYSIS_STATUS.PROCESSING]: 'status-processing',
  [ANALYSIS_STATUS.COMPLETED]: 'status-completed',
  [ANALYSIS_STATUS.FAILED]: 'status-failed'
}

// Типы отчетов
export const REPORT_TYPES = {
  DOCX: 'docx',
  PDF: 'pdf'
}

// Лейблы типов отчетов
export const REPORT_TYPE_LABELS = {
  [REPORT_TYPES.DOCX]: 'DOCX',
  [REPORT_TYPES.PDF]: 'PDF'
}

// Настройки пагинации
export const PAGINATION_OPTIONS = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZES: [5, 10, 20, 50],
  MAX_VISIBLE_PAGES: 5
}

// Настройки сортировки
export const SORTING_OPTIONS = [
  { value: '-created_at', label: 'По дате создания ↓' },
  { value: 'created_at', label: 'По дате создания ↑' },
  { value: '-start_time', label: 'По дате запуска ↓' },
  { value: 'start_time', label: 'По дате запуска ↑' },
  { value: 'name', label: 'По названию ↑' },
  { value: '-name', label: 'По названию ↓' },
  { value: 'group', label: 'По группе ↑' },
  { value: '-group', label: 'По группе ↓' },
  { value: 'status', label: 'По статусу ↑' },
  { value: '-status', label: 'По статусу ↓' }
]

// Фильтры статусов
export const STATUS_FILTERS = [
  { value: 'all', label: 'Все' },
  { value: ANALYSIS_STATUS.PENDING, label: STATUS_LABELS[ANALYSIS_STATUS.PENDING] },
  { value: ANALYSIS_STATUS.PROCESSING, label: STATUS_LABELS[ANALYSIS_STATUS.PROCESSING] },
  { value: ANALYSIS_STATUS.COMPLETED, label: STATUS_LABELS[ANALYSIS_STATUS.COMPLETED] },
  { value: ANALYSIS_STATUS.FAILED, label: STATUS_LABELS[ANALYSIS_STATUS.FAILED] }
]

// Настройки файлов
export const FILE_SETTINGS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_EXTENSIONS: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'],
  MIME_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp']
}

// Настройки загрузки
export const UPLOAD_SETTINGS = {
  CONCURRENCY_LIMIT: 8,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
}

// Настройки UI
export const UI_SETTINGS = {
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 5000
}

// Сообщения
export const MESSAGES = {
  SUCCESS: {
    ANALYSIS_CREATED: 'Анализ создан успешно',
    ANALYSIS_DELETED: 'Анализ удален',
    ANALYSIS_RESTARTED: 'Анализ перезапущен',
    GROUP_CREATED: 'Группа создана',
    GROUP_UPDATED: 'Группа обновлена',
    GROUP_DELETED: 'Группа удалена',
    REPORT_DOWNLOADED: 'Отчет скачан',
    ARCHIVE_DOWNLOADED: 'Архив скачан'
  },
  ERROR: {
    ANALYSIS_CREATE_FAILED: 'Ошибка создания анализа',
    ANALYSIS_DELETE_FAILED: 'Ошибка удаления анализа',
    ANALYSIS_RESTART_FAILED: 'Ошибка перезапуска анализа',
    GROUP_CREATE_FAILED: 'Ошибка создания группы',
    GROUP_UPDATE_FAILED: 'Ошибка обновления группы',
    GROUP_DELETE_FAILED: 'Ошибка удаления группы',
    REPORT_DOWNLOAD_FAILED: 'Ошибка скачивания отчета',
    ARCHIVE_DOWNLOAD_FAILED: 'Ошибка скачивания архива',
    LOAD_DATA_FAILED: 'Ошибка загрузки данных',
    INVALID_FILE_TYPE: 'Неподдерживаемый тип файла',
    FILE_TOO_LARGE: 'Файл слишком большой',
    NETWORK_ERROR: 'Ошибка сети'
  },
  CONFIRM: {
    DELETE_ANALYSIS: 'Вы уверены, что хотите удалить этот анализ? Это действие нельзя отменить.',
    DELETE_GROUP: 'Вы уверены, что хотите удалить группу? Все анализы в этой группе будут перемещены в "Без группы".',
    BULK_DELETE: 'Вы уверены, что хотите удалить выбранные анализы? Это действие нельзя отменить.'
  }
}

// Валидация
export const VALIDATION_RULES = {
  ANALYSIS_NAME: {
    MAX_LENGTH: 255,
    MIN_LENGTH: 1
  },
  ANALYSIS_DESCRIPTION: {
    MAX_LENGTH: 1000
  },
  GROUP_NAME: {
    MAX_LENGTH: 100,
    MIN_LENGTH: 1
  },
  SCALE_VALUE: {
    MIN: 0.01,
    MAX: 10000
  },
  PIXELS_PER_MICRON: {
    MIN: 0.01,
    MAX: 1000
  }
}

// API эндпоинты
export const API_ENDPOINTS = {
  ANALYSES: 'porosity_analysis/analyses/',
  GROUPS: 'porosity_analysis/groups/',
  STATISTICS: 'porosity_analysis/analyses/statistics/',
  UPLOAD_CONFIG: 'porosity_analysis/groups/upload_config/'
}

// Локальное хранилище
export const STORAGE_KEYS = {
  SELECTED_ANALYSES: 'porosity_analysis_selected',
  FILTERS: 'porosity_analysis_filters',
  PAGINATION: 'porosity_analysis_pagination',
  COLLAPSED_SECTIONS: 'porosity_analysis_collapsed'
}

// События
export const EVENTS = {
  ANALYSIS_CREATED: 'analysis:created',
  ANALYSIS_UPDATED: 'analysis:updated',
  ANALYSIS_DELETED: 'analysis:deleted',
  GROUP_CREATED: 'group:created',
  GROUP_UPDATED: 'group:updated',
  GROUP_DELETED: 'group:deleted',
  SELECTION_CHANGED: 'selection:changed',
  FILTERS_CHANGED: 'filters:changed'
}
