// Утилиты для проверки ролей пользователя относительно проекта

/**
 * Проверяет, является ли пользователь руководителем (автором) проекта
 * @param {Object|null} user - объект текущего пользователя
 * @param {Object|null} projectData - объект проекта
 * @returns {boolean}
 */
function normalizeId(value) {
  if (value == null) return null;
  if (typeof value === 'number' || typeof value === 'string') return String(value);
  if (typeof value === 'object') {
    // Популярные варианты ключей идентификатора
    const keys = ['id', 'user_id', 'pk', 'uuid'];
    for (const key of keys) {
      if (value[key] != null) return String(value[key]);
    }
  }
  return null;
}

function extractManagerId(projectData) {
  if (!projectData) return null;
  // Возможные поля руководителя/автора проекта
  const directKeys = [
    'manager_id', 'author_id', 'owner_id', 'created_by_id', 'leader_id', 'head_id',
    'curator_id' // на случай использования этого поля как руководителя
  ];
  for (const key of directKeys) {
    if (projectData[key] != null) return normalizeId(projectData[key]);
  }

  // Объектные варианты
  const objectKeys = [
    'manager', 'manager_user', 'manager_data',
    'author', 'owner', 'created_by', 'leader', 'head'
  ];
  for (const key of objectKeys) {
    if (projectData[key]) {
      // Пытаемся взять id напрямую
      const direct = normalizeId(projectData[key]);
      if (direct) return direct;
      // Или через вложенного user
      if (projectData[key].user) {
        const nested = normalizeId(projectData[key].user);
        if (nested) return nested;
      }
    }
  }

  return null;
}

export function isProjectManager(user, projectData) {
  if (!user || !projectData) return false;

  const currentUserId = normalizeId(user);
  const managerId = extractManagerId(projectData);

  if (!currentUserId) return false;

  // 1) Прямая проверка по manager_id
  if (managerId && currentUserId === managerId) return true;

  // 2) Проверка по ролевым связям проекта (ProjectRole)
  // Поддерживаем распространённые варианты коллекций с ролями
  const roleCollections = [
    projectData.project_roles,
    projectData.roles,
    projectData.members,
    projectData.participants,
  ].filter(Boolean);

  const managerRoleKeys = new Set([
    'manager', 'owner', 'author', 'leader', 'head', 'project_manager'
  ]);

  for (const collection of roleCollections) {
    if (!Array.isArray(collection)) continue;
    for (const item of collection) {
      const itemUserId = normalizeId(item?.user || item?.user_id || item?.user_data);
      if (!itemUserId || itemUserId !== currentUserId) continue;

      const roleKey = String(item?.role || item?.role_key || item?.role_code || '').toLowerCase();
      if (managerRoleKeys.has(roleKey)) return true;
    }
  }

  return false;
}


