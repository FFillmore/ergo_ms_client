<template>
  <div class="audit-card" :class="{ 'expanded': isExpanded, 'non-expandable': !expandable }">
    <!-- Основная карточка -->
    <div class="audit-card-header" @click="expandable ? toggleExpanded() : null">
      <div class="audit-card-content">
        <!-- Иконки слева -->
        <div class="audit-icons">
          <div class="action-icon">
            <component :is="ActionIconComp" :size="16" :class="actionIconClass" />
          </div>
          <div class="user-avatar">
            <img 
              v-if="avatarSrc" 
              :src="avatarSrc" 
              alt="avatar" 
              class="avatar-img" 
              @error="onAvatarError" 
              @load="onAvatarLoad"
            />
            <div v-else-if="isLoadingAvatar" class="avatar-loading">
              <div class="spinner-border spinner-border-sm" role="status">
                <span class="visually-hidden">Загрузка...</span>
              </div>
            </div>
            <DefaultAvatar v-else size="small" />
          </div>
        </div>
        
        <!-- Основной контент -->
        <div class="audit-main-content">
          <div class="audit-action-text">
            <span class="author-name">{{ authorName }}</span>
            <span class="action-verb">{{ actionVerb }}</span>
            <template v-if="isProjectStage">
              <span>этап </span>
              <span class="highlight">«{{ stageDisplayName || 'project_stage' }}»</span>
            </template>
            <template v-else-if="hasField">
              <span>раздел </span><span class="highlight">{{ sectionName }}</span>
            </template>
            <template v-else-if="modelTypeLower">
              <span>{{ modelTypeLower }}</span>
            </template>
          </div>
          <div class="audit-timestamp" :title="fullDateTooltip">{{ relativeTime }}</div>
        </div>
        
        <!-- Иконка раскрытия -->
        <div v-if="expandable" class="expand-icon" :class="{ 'expanded': isExpanded }">
          <ChevronDown :size="16" />
        </div>
      </div>
    </div>
    
    <!-- Раскрывающийся контент -->
    <div v-if="expandable" class="audit-card-details" v-show="isExpanded">
      <div class="details-content">
        <div class="details-list">
          <div class="detail-item" v-if="description">
            <span class="detail-number">01</span>
            <span class="detail-text">{{ description }}</span>
          </div>
          <div class="detail-item" v-if="hasField">
            <span class="detail-number">02</span>
            <span class="detail-text">Изменен раздел</span>
            <div class="detail-subitem">{{ sectionName }}</div>
          </div>
          <div class="detail-item" v-if="hasValueChanges">
            <span class="detail-number">03</span>
            <span class="detail-text">Изменения значений</span>
            <div class="detail-subitem">
              <div class="value-change" v-for="(change, fieldName) in valueChanges" :key="fieldName">
                <div class="field-change">
                  <span class="field-name">{{ formatFieldName(fieldName) }}:</span>
                  <span class="old-value">{{ formatValue(change.old) }}</span>
                  <span class="arrow">→</span>
                  <span class="new-value">{{ formatValue(change.new) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import DefaultAvatar from '@/components/DefaultAvatar.vue'
import { getIcon } from '@/config/icons-mapping'
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import { getUserAvatar, getCachedUserAvatar } from '@/js/userAvatar'
import { apiClient } from '@/js/api/manager'
import { getRelativeTime, getFormattedDateWithRelative } from '@/modules/crm/project-ed/components/steps/js/timeUtils.js'
import { getAuditActionType, getAuditActionIconName, AUDIT_ACTION_COLOR_MAP, getAuditActionVerb } from '@/modules/crm/project-ed/js/auditIcons.js'

const props = defineProps({
  timestamp: {
    type: String,
    required: true
  },
  actionDisplay: {
    type: String,
    required: true
  },
  modelTypeDisplay: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    default: null
  },
  userId: {
    type: [String, Number],
    default: null
  },
  avatarUrl: {
    type: String,
    default: null
  },
  fieldName: {
    type: String,
    default: null
  },
  oldValue: {
    type: String,
    default: null
  },
  newValue: {
    type: [String, Object],
    default: null
  },
  description: {
    type: String,
    default: null
  },
  iconName: {
    type: String,
    default: 'Square'
  },
  expandable: {
    type: Boolean,
    default: true
  }
})

const ActionIconComp = computed(() => {
  const actionIconName = getAuditActionIconName(props.actionDisplay)
  return getIcon(actionIconName) || getIcon('Activity')
})

const avatarSrc = ref(normalizeUrl(props.avatarUrl) || null)
const isLoadingAvatar = ref(false)
const isExpanded = ref(false)

async function ensureAvatarLoaded() {
  console.log(`AuditUnit: ensureAvatarLoaded вызвана для пользователя ${props.userId}, avatarUrl: ${props.avatarUrl}`)
  
  if (props.avatarUrl) {
    avatarSrc.value = normalizeUrl(props.avatarUrl)
    console.log(`AuditUnit: Используем переданный avatarUrl: ${avatarSrc.value}`)
    return
  }
  
  // Если нет avatarUrl, но есть userId, попробуем загрузить аватар
  if (!avatarSrc.value && props.userId) {
    console.log(`AuditUnit: Загружаем аватар для пользователя ${props.userId}`)
    isLoadingAvatar.value = true
    try {
      const url = await getUserAvatar(props.userId)
      console.log(`AuditUnit: Получен URL аватара для пользователя ${props.userId}:`, url)
      if (url) {
        avatarSrc.value = normalizeUrl(url)
        console.log(`AuditUnit: Нормализованный URL: ${avatarSrc.value}`)
      }
    } catch (error) {
      console.warn(`Ошибка загрузки аватара для пользователя ${props.userId}:`, error)
    } finally {
      isLoadingAvatar.value = false
    }
  }
}


watch(() => [props.userId, props.avatarUrl], () => {
  avatarSrc.value = normalizeUrl(props.avatarUrl) || null
  ensureAvatarLoaded()
})

function normalizeUrl(url) {
  if (!url) return null
  if (typeof url !== 'string') return null
  
  // Если URL уже абсолютный, возвращаем как есть
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url
  }
  
  // Если URL начинается с /, используем его как есть
  if (url.startsWith('/')) {
    return `${apiClient.baseUrl}${url}`
  }
  
  // Иначе добавляем / в начало
  return `${apiClient.baseUrl}/${url}`
}

function onAvatarError() {
  avatarSrc.value = null
  isLoadingAvatar.value = false
}

function onAvatarLoad() {
  isLoadingAvatar.value = false
}

// Реактивная переменная для принудительного обновления времени
const timeUpdateTrigger = ref(0)

const relativeTime = computed(() => {
  // Зависимость от timeUpdateTrigger для обновления каждую минуту
  timeUpdateTrigger.value
  return getRelativeTime(props.timestamp)
})

const fullDateTooltip = computed(() => {
  // Зависимость от timeUpdateTrigger для обновления каждую минуту
  timeUpdateTrigger.value
  return getFormattedDateWithRelative(props.timestamp)
})

// Интервал для обновления времени каждую минуту
let timeUpdateInterval = null

onMounted(() => {
  ensureAvatarLoaded()
  // Обновляем время каждую минуту (60000 мс)
  timeUpdateInterval = setInterval(() => {
    timeUpdateTrigger.value++
  }, 60000)
})

onUnmounted(() => {
  // Очищаем интервал при размонтировании компонента
  if (timeUpdateInterval) {
    clearInterval(timeUpdateInterval)
    timeUpdateInterval = null
  }
})

const authorName = computed(() => (props.userName && props.userName.trim()) ? props.userName.trim() : 'Система')
const actionVerb = computed(() => getAuditActionVerb(props.actionDisplay))
const hasField = computed(() => !!(props.fieldName && props.fieldName.trim()))
const sectionName = computed(() => hasField.value ? translateSectionName(props.fieldName) : '')
const modelTypeLower = computed(() => props.modelTypeDisplay ? props.modelTypeDisplay.toLocaleLowerCase('ru-RU') : '')

const actionIconClass = computed(() => 'text-secondary')

function translateSectionName(value) {
  if (!value) return ''
  const key = String(value).trim().toLowerCase()
  const map = {
    'additional_info': 'Дополнительная информация',
    'budget_items': 'Бюджет проекта',
    'project_stage': 'Календарное планирование'
  }
  return map[key] || value
}

// Специальная обработка для событий создания раздела календарного планирования (project_stage)
const isProjectStage = computed(() => String(props.fieldName || '').trim().toLowerCase() === 'project_stage')

function toObjectSafe(value) {
  if (!value) return null
  if (typeof value === 'object') return value
  if (typeof value === 'string') {
    const str = value.trim()
    if (!str) return null
    try {
      const parsed = JSON.parse(str)
      if (parsed && typeof parsed === 'object') return parsed
    } catch (e) {
      // ignore, fallback to string
    }
    return { value: str }
  }
  return { value: String(value) }
}

function extractDisplayName(obj) {
  if (!obj) return ''
  // Пытаемся найти осмысленное поле названия этапа/раздела
  const candidates = ['name', 'title', 'display', 'stage_name', 'section', 'section_name', 'label']
  for (const key of candidates) {
    if (obj[key]) return String(obj[key])
  }
  if (obj.value) return String(obj.value)
  return ''
}

function sanitizeStageName(raw) {
  if (!raw) return ''
  let s = String(raw).trim()
  // убираем внешние кавычки, если остались
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith('«') && s.endsWith('»'))) {
    s = s.slice(1, -1).trim()
  }
  // если строка содержит конструкцию "... <глагол> этап <имя>", извлекаем только <имя>
  const actionPattern = /(создал|добавил|удалил|обновил|назначил)\s*этап\s*(.+)/i
  const m = s.match(actionPattern)
  if (m && m[2]) {
    s = m[2].trim()
  }
  // финальная зачистка кавычек после вырезания
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith('«') && s.endsWith('»'))) {
    s = s.slice(1, -1).trim()
  }
  return s
}

const stageDisplayName = computed(() => {
  // Источник 1: newValue (часто содержит созданный объект/название)
  const obj = toObjectSafe(props.newValue)
  const fromNewValue = sanitizeStageName(extractDisplayName(obj))
  if (fromNewValue) return fromNewValue
  // Источник 2: description (если там текстом есть имя)
  const desc = String(props.description || '').trim()
  if (!desc) return ''
  // Пытаемся выцепить имя в кавычках
  const m = desc.match(/[«"]([^»"]+)[»"]/)
  if (m && m[1]) return sanitizeStageName(m[1])
  return sanitizeStageName(desc)
})

// Функции для управления раскрытием
function toggleExpanded() {
  isExpanded.value = !isExpanded.value
}

// Computed свойства для обработки изменений значений
const hasValueChanges = computed(() => {
  return Object.keys(valueChanges.value).length > 0
})

const valueChanges = computed(() => {
  const changes = {}
  
  if (!props.oldValue || !props.newValue) {
    return changes
  }
  
  const oldObj = toObjectSafe(props.oldValue)
  const newObj = toObjectSafe(props.newValue)
  
  if (!oldObj || !newObj) {
    return changes
  }
  
  // Сравниваем объекты и находим изменения
  const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)])
  
  for (const key of allKeys) {
    const oldVal = oldObj[key]
    const newVal = newObj[key]
    
    // Сравниваем значения (игнорируем null/undefined)
    if (oldVal !== newVal && !(oldVal == null && newVal == null)) {
      changes[key] = {
        old: oldVal,
        new: newVal
      }
    }
  }
  
  return changes
})

// Функция форматирования значений для отображения в деталях
function formatValue(value) {
  if (value == null) return '—'
  if (typeof value === 'boolean') return value ? 'Да' : 'Нет'
  if (typeof value === 'object') {
    // Для объектов пытаемся найти осмысленное поле для отображения
    const displayFields = ['name', 'title', 'display', 'value', 'label']
    for (const field of displayFields) {
      if (value[field] != null) {
        return String(value[field])
      }
    }
    // Если не нашли осмысленное поле, показываем JSON в одну строку
    return JSON.stringify(value).replace(/\n/g, ' ')
  }
  return String(value)
}

// Функция форматирования названий полей
function formatFieldName(fieldName) {
  const fieldMap = {
    'name': 'Название',
    'title': 'Заголовок',
    'description': 'Описание',
    'status': 'Статус',
    'priority': 'Приоритет',
    'value': 'Значение',
    'amount': 'Сумма',
    'date': 'Дата',
    'start_date': 'Дата начала',
    'end_date': 'Дата окончания',
    'deadline': 'Срок',
    'budget': 'Бюджет',
    'cost': 'Стоимость',
    'price': 'Цена',
    'quantity': 'Количество',
    'count': 'Количество',
    'type': 'Тип',
    'category': 'Категория',
    'tag': 'Тег',
    'tags': 'Теги',
    'comment': 'Комментарий',
    'note': 'Заметка',
    'notes': 'Заметки'
  }
  
  return fieldMap[fieldName] || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

// Определение глагола действия перенесено в общий модуль

// Локальные функции выбора типа действия/иконки перенесены в общий модуль
</script>

<style scoped lang="scss">
@import '@/scss/variables';
@import '@/scss/colors';

.audit-card {
  background-color: var(--color-primary-background);
  border-radius: $radius-small;
  margin-bottom: 8px;
  border: 1px solid var(--color-border);
  transition: all $transition;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background-color: var(--color-hover-background);
    border-color: var(--color-border);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  }
  
  &.expanded {
    background-color: var(--color-hover-background);
    border-color: $primary;
  }
  
  &.non-expandable {
    cursor: default;
    
    &:hover {
      background-color: var(--color-hover-background);
      border-color: var(--color-border);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
  }
}

.audit-card-header {
  padding: 12px 16px;
}

.audit-card-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.audit-icons {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.action-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: var(--color-secondary-text);
}

.user-avatar {
  position: relative;
  width: 36px;
  height: 36px;
  
  .avatar-img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }
  
  .avatar-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background-color: var(--color-secondary-background);
    border-radius: 50%;
    
    .spinner-border-sm {
      width: 12px;
      height: 12px;
      border-width: 1px;
    }
  }
}

.audit-main-content {
  flex: 1;
  min-width: 0;
}

.audit-action-text {
  color: var(--color-primary-text);
  font-size: $font-size-small;
  line-height: 1.4;
  
  .author-name {
    font-weight: 600;
    color: $dark;
  }
  
  .action-verb {
    color: var(--color-primary-text);
    margin: 0 4px;
  }
  
  .highlight {
    color: var(--color-primary-text);
    font-weight: 600;
  }
}

.audit-timestamp {
  color: var(--color-secondary-text);
  font-size: $font-size-micro;
  margin-top: 2px;
}

.expand-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: var(--color-secondary-text);
  transition: transform $transition;
  flex-shrink: 0;
  
  &.expanded {
    transform: rotate(180deg);
  }
}

.audit-card-details {
  border-top: 1px solid #e9ecef;
  background-color: #f8f9fa;
  border-radius: 0 0 $radius-small $radius-small;
  animation: slideDown 0.2s ease;
}

.details-content {
  padding: 12px 16px 16px 16px;
}

.details-list {
  .detail-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 8px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .detail-number {
    color: $warning;
    font-weight: $font-weight-bold;
    font-size: $font-size-small;
    flex-shrink: 0;
    min-width: 20px;
  }
  
  .detail-text {
    color: $dark;
    font-size: $font-size-small;
    line-height: 1.4;
  }
  
  .detail-subitem {
    margin-left: 28px;
    margin-top: 4px;
    color: $secondary;
    font-size: $font-size-micro;
    
    .value-change {
      margin-bottom: 8px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .field-change {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
        
        .field-name {
          font-weight: 500;
          color: var(--color-primary-text);
          font-size: $font-size-micro;
          min-width: fit-content;
        }
        
        .old-value {
          color: $danger;
          font-size: $font-size-micro;
          background-color: rgba($danger, 0.1);
          padding: 2px 6px;
          border-radius: 4px;
          text-decoration: line-through;
        }
        
        .arrow {
          color: $secondary;
          font-size: $font-size-micro;
          font-weight: bold;
        }
        
        .new-value {
          color: $success;
          font-size: $font-size-micro;
          background-color: rgba($success, 0.1);
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 500;
        }
      }
    }
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// Адаптивность для мобильных устройств
@media (max-width: 768px) {
  .audit-card-header {
    padding: 10px 12px;
  }
  
  .audit-card-content {
    gap: 8px;
  }
  
  .audit-action-text {
    font-size: $font-size-micro;
  }
  
  .details-content {
    padding: 10px 12px 12px 12px;
  }
}
</style>
