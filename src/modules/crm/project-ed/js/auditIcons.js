// Карта соответствий типа действия и названию иконки (lucide)
export const AUDIT_ACTION_ICON_MAP = {
  create: 'Plus',
  update: 'Edit',
  delete: 'Trash2',
  add: 'Plus',
  assign: 'UserPlus',
  change: 'Edit',
  default: 'Activity'
}

// Карта соответствий типа действия и цветового класса Bootstrap
export const AUDIT_ACTION_COLOR_MAP = {
  create: 'text-success',
  update: 'text-primary',
  delete: 'text-danger',
  add: 'text-success',
  assign: 'text-warning',
  change: 'text-info',
  default: 'text-secondary'
}

// Определение типа действия на основе текстового описания
export function getAuditActionType(actionDisplay) {
  const src = String(actionDisplay || '').toLowerCase()
  if (src.includes('создание') || src.includes('create') || src.includes('добавление') || src.includes('add')) {
    return 'create'
  }
  if (src.includes('обновление') || src.includes('update') || src.includes('изменение') || src.includes('change')) {
    return 'update'
  }
  if (src.includes('удаление') || src.includes('delete')) {
    return 'delete'
  }
  if (src.includes('назначение') || src.includes('assign')) {
    return 'assign'
  }
  return 'default'
}

// Получение имени иконки для действия
export function getAuditActionIconName(actionDisplay) {
  const actionType = getAuditActionType(actionDisplay)
  return AUDIT_ACTION_ICON_MAP[actionType] || AUDIT_ACTION_ICON_MAP.default
}

// Получение глагола действия на русском языке по исходной строке
export function getAuditActionVerb(actionDisplay) {
  const src = String(actionDisplay || '').toLowerCase()
  const map = new Map([
    ['обновление', 'обновил'],
    ['изменение', 'обновил'],
    ['создание', 'создал'],
    ['удаление', 'удалил'],
    ['добавление', 'добавил'],
    ['назначение', 'назначил'],
    ['update', 'обновил'],
    ['change', 'обновил'],
    ['create', 'создал'],
    ['delete', 'удалил'],
    ['add', 'добавил'],
    ['assign', 'назначил']
  ])
  for (const [key, val] of map.entries()) {
    if (src.includes(key)) return val
  }
  return src || 'выполнил действие'
}


