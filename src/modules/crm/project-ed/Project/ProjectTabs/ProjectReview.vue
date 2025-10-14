<template>
  <div class="container">
    <HeaderBar v-if="accessChecked && isAllowed" />
    <div class="mt-3">
      <Breadcrumbs v-if="accessChecked && isAllowed" :items="breadcrumbItems" class="mb-3" />
      <h2 v-if="accessChecked && isAllowed" class="mb-3">{{ pageTitle }}</h2>
      

      <div v-if="isLoading || !accessChecked" class="loading-state">
        <div class="spinner-border text-primary" role="status" aria-label="Загрузка"></div>
        <div class="loading-text mt-2">Загрузка проекта…</div>
      </div>

      <template v-else>
        <div v-if="!projectData" class="alert alert-warning">
          Проект не найден
        </div>

        <div v-else-if="!isAllowed && accessChecked" class="alert alert-danger">
          Страница доступна только для проектов в статусе «На рассмотрении»
        </div>

        <div v-else class="project-review">
          <div class="card mb-3">
            <div class="card-header fw-semibold">Основная информация</div>
            <div class="card-body">
              <div class="row g-3">
                <div class="col-12 col-md-6">
                  <div class="field"><span class="field-label">Короткое название:</span> <span class="field-value">{{ projectData.short_name || '—' }}</span></div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="field"><span class="field-label">Полное название:</span> <span class="field-value">{{ projectData.name || '—' }}</span></div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="field"><span class="field-label">Уточнение к названию:</span> <span class="field-value">{{ projectData.name_clarification || '—' }}</span></div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="field"><span class="field-label">Цель проекта:</span> <span class="field-value">{{ projectData.goal || '—' }}</span></div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="field"><span class="field-label">Дата начала:</span> <span class="field-value">{{ projectData.start_date || '—' }}</span></div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="field"><span class="field-label">Дата окончания:</span> <span class="field-value">{{ projectData.end_date || '—' }}</span></div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="field"><span class="field-label">Статус:</span> <span class="badge bg-light text-dark">{{ projectData.status }}</span></div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="field"><span class="field-label">Общий бюджет:</span> <span class="field-value">{{ formatMoney(projectData.budget_total) }}</span></div>
                </div>
              </div>
            </div>
          </div>

          <div class="card mb-3">
            <div class="card-header fw-semibold">Участники</div>
            <div class="card-body">
              <div class="row g-3">
                <div class="col-12 col-md-6">
                  <div class="field"><span class="field-label">Руководитель:</span> <span class="field-value">{{ userName(projectData.manager) || '—' }}</span></div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="field"><span class="field-label">Куратор:</span> <span class="field-value">{{ userName(projectData.curator) || '—' }}</span></div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="field"><span class="field-label">Заказчик:</span> <span class="field-value">{{ userName(projectData.customer) || '—' }}</span></div>
                </div>
                <div class="col-12">
                  <div class="field"><span class="field-label">Исполнители:</span>
                    <span class="field-value">{{ (projectData.executors || []).map(e => userName(e.user) || e.user?.username || e.user?.id).join(', ') || '—' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="card mb-3">
            <div class="card-header fw-semibold">Этапы</div>
            <div class="card-body">
              <div v-if="!projectData.stages || projectData.stages.length === 0" class="text-muted">Нет этапов</div>
              <div v-else class="table-responsive">
                <table class="table table-sm align-middle">
                  <thead>
                    <tr>
                      <th>Название</th>
                      <th>Начало</th>
                      <th>Окончание</th>
                      <th>Планируемые результаты</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="s in projectData.stages" :key="s.id">
                      <td>{{ s.name }}</td>
                      <td>{{ s.start_date || '—' }}</td>
                      <td>{{ s.end_date || '—' }}</td>
                      <td>{{ s.planned_results || '—' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div class="card mb-3">
            <div class="card-header fw-semibold">Планируемые результаты</div>
            <div class="card-body">
              <ul class="mb-0">
                <li v-for="r in projectData.planned_results || []" :key="r.id">{{ r.description }}</li>
              </ul>
              <div v-if="!projectData.planned_results || projectData.planned_results.length === 0" class="text-muted">Нет данных</div>
            </div>
          </div>

          <div class="card mb-3">
            <div class="card-header fw-semibold">Задачи</div>
            <div class="card-body">
              <ul class="mb-0">
                <li v-for="t in projectData.tasks || []" :key="t.id">{{ t.description }}</li>
              </ul>
              <div v-if="!projectData.tasks || projectData.tasks.length === 0" class="text-muted">Нет данных</div>
            </div>
          </div>

          <div class="card mb-3">
            <div class="card-header fw-semibold">Целевые показатели</div>
            <div class="card-body">
              <div v-if="!projectData.target_indicators || projectData.target_indicators.length === 0" class="text-muted">Нет данных</div>
              <div v-else class="table-responsive">
                <table class="table table-sm align-middle">
                  <thead>
                    <tr>
                      <th>Название</th>
                      <th>Ед. изм.</th>
                      <th>Базовое</th>
                      <th>План</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="ti in projectData.target_indicators || []" :key="ti.id">
                      <td>{{ ti.name }}</td>
                      <td>{{ ti.unit || '—' }}</td>
                      <td>{{ ti.baseline ?? '—' }}</td>
                      <td>{{ ti.planned ?? '—' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div class="card mb-3">
            <div class="card-header fw-semibold">Бюджет: итоги</div>
            <div class="card-body">
              <div v-if="!(projectData.budget_totals && projectData.budget_totals.length)" class="text-muted">Нет итогов</div>
              <div v-else>
                <div v-for="bt in projectData.budget_totals" :key="bt.id" class="row g-3">
                  <div class="col-12 col-sm-6 col-lg-4"><span class="field-label">Итого с ОМС:</span> <span class="field-value">{{ formatMoney(bt.total_with_insurance) }}</span></div>
                  <div class="col-12 col-sm-6 col-lg-4"><span class="field-label">ЗП (внебюджет):</span> <span class="field-value">{{ formatMoney(bt.salary_off_budget) }}</span></div>
                  <div class="col-12 col-sm-6 col-lg-4"><span class="field-label">ЗП (бюджет):</span> <span class="field-value">{{ formatMoney(bt.salary_budget) }}</span></div>
                  <div class="col-12 col-sm-6 col-lg-4"><span class="field-label">Прочее (внебюджет):</span> <span class="field-value">{{ formatMoney(bt.other_off_budget) }}</span></div>
                  <div class="col-12 col-sm-6 col-lg-4"><span class="field-label">Прочее (бюджет):</span> <span class="field-value">{{ formatMoney(bt.other_budget) }}</span></div>
                </div>
              </div>
            </div>
          </div>

          <div class="card mb-4">
            <div class="card-header fw-semibold">Бюджет: позиции</div>
            <div class="card-body">
              <div v-if="!projectData.budget_items || projectData.budget_items.length === 0" class="text-muted">Нет позиций</div>
              <div v-else class="table-responsive">
                <table class="table table-sm align-middle">
                  <thead>
                    <tr>
                      <th>Этап</th>
                      <th>Статья затрат</th>
                      <th>Источник финансирования</th>
                      <th class="text-end">Сумма</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="bi in projectData.budget_items || []" :key="bi.id">
                      <td>{{ stageName(bi.stage_id) }}</td>
                      <td>{{ bi.cost_article }}</td>
                      <td>{{ bi.funding_source }}</td>
                      <td class="text-end">{{ formatMoney(bi.amount) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiClient } from '@/js/api/manager.js'
import { endpoints } from '@/js/api/endpoints.js'
import { slugify as translitSlugify } from 'transliteration'
import Breadcrumbs from '@/modules/crm/project-ed/components/Breadcrumbs.vue'
import { Home, List, FileText, CheckCircle } from 'lucide-vue-next'
import HeaderBar from '@/modules/crm/project-ed/components/HeaderBar.vue'
import { useUserStore } from '@/core/cms/js/userStore.js'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const pageTitle = ref('Ревью проекта')
const projectTitleBreadcrumb = ref('Проект')
const isLoading = ref(true)
const projectData = ref(null)
const isStatusAllowed = computed(() => (projectData.value?.status || '').toLowerCase() === 'pending')
const isAdmin = ref(false)
const isExpertGroup = ref(false)
const isAssignedExpert = ref(false)
const isAllowed = computed(() => isStatusAllowed.value && (isAdmin.value || isExpertGroup.value || isAssignedExpert.value))
const accessChecked = ref(false)

const projectSlug = computed(() => {
  const name = projectData.value?.name || projectData.value?.short_name || ''
  if (!name) return null
  try {
    return translitSlugify(name).toLowerCase()
  } catch {
    return null
  }
})

const breadcrumbItems = computed(() => ([
  { label: 'Главная', to: '/crm/project-ed/main', icon: Home },
  { label: 'Мои проекты', to: '/crm/project-ed/my-projects', icon: List },
  { label: projectTitleBreadcrumb.value, to: projectSlug.value ? `/crm/project-ed/project/${projectSlug.value}` : undefined, icon: FileText },
  { label: 'Экспертная оценка', icon: CheckCircle }
]))

function formatMoney(value) {
  if (value === null || value === undefined || value === '') return '—'
  const num = Number(value)
  if (Number.isNaN(num)) return String(value)
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 2 }).format(num)
}

function userName(user) {
  if (!user) return ''
  const first = (user.first_name || '').trim()
  const last = (user.last_name || '').trim()
  const full = `${first} ${last}`.trim()
  return full || user.username || ''
}

function stageName(stageId) {
  if (!stageId || !projectData.value?.stages) return '—'
  const st = projectData.value.stages.find(s => s.id === stageId)
  return st?.name || `Этап #${stageId}`
}

async function loadProjectBySlug(slug) {
  // Найдём проект по слагу через список доступных пользователю проектов
  const resp = await apiClient.get(endpoints.project_ed.projects.list)
  const list = Array.isArray(resp.data) ? resp.data : (resp.data?.results || [])
  const match = list.find((p) => {
    const name = p?.name || p?.short_name || ''
    return translitSlugify(name).toLowerCase() === slug
  })
  if (!match) return null

  try {
    const { data } = await apiClient.get(endpoints.project_ed.projects.detail(match.id))
    return data
  } catch (error) {
    // fallback: public_view для чужих проектов
    const { data } = await apiClient.get(endpoints.project_ed.projects.publicView(match.id))
    return data
  }
}

onMounted(async () => {
  try {
    const raw = route.params?.slug || ''
    const slug = decodeURIComponent(String(raw)).toLowerCase()
    const qsId = route.query?.id ? String(route.query.id) : null
    if (!slug && !qsId) return

    let data = null
    if (qsId) {
      // Сначала пробуем по id (детальная/публичная)
      try {
        const resp = await apiClient.get(endpoints.project_ed.projects.detail(qsId))
        data = resp.data
      } catch {
        const resp = await apiClient.get(endpoints.project_ed.projects.publicView(qsId))
        data = resp.data
      }
    }
    if (!data && slug) {
      data = await loadProjectBySlug(slug)
    }
    projectData.value = data
    if (data?.name || data?.short_name) {
      pageTitle.value = `Ревью: ${data.name || data.short_name}`
    }
    if (data) {
      const crumbBase = data.short_name || data.name || 'Проект'
      const clarification = data.name_clarification ? ` ${data.name_clarification}` : ''
      projectTitleBreadcrumb.value = `${crumbBase}${clarification}`
    }

    // Проверка прав: администратор или эксперт из текущего ревью
    try {
      if (!userStore.isInitialized) {
        try { await userStore.initializeUser() } catch { /* ignore */ }
      }
      const uid = userStore.user?.id
      if (uid) {
        // Роль пользователя
        try {
          const resp = await apiClient.get(`/project_ed/profiles/profiles/${uid}/`)
          const d = resp.data || {}
          const roleName = d.role_name || d.profile?.role_name
          isAdmin.value = roleName === 'Администратор'
          isExpertGroup.value = roleName === 'Экспертная группа'
        } catch {
          isAdmin.value = false
          isExpertGroup.value = false
        }

        // Назначен как эксперт конкретного ревью
        try {
          const experts = projectData.value?.current_review?.assigned_experts || []
          isAssignedExpert.value = experts.some(e => e?.expert === uid || e?.user_id === uid)
        } catch {
          isAssignedExpert.value = false
        }
      }
    } catch { /* ignore */ }

    // Если доступ запрещен — перенаправляем на карточку проекта
    if (!isAllowed.value && projectSlug.value) {
      router.replace(`/crm/project-ed/project/${projectSlug.value}`)
      return
    }
    accessChecked.value = true
  } catch (e) {
    console.error('Не удалось загрузить проект для ревью:', e)
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped lang="scss">
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: #6a737d;
}

.field {
  .field-label {
    color: var(--color-secondary-text);
    margin-right: 0.25rem;
  }
  .field-value {
    color: var(--color-primary-text);
    font-weight: 500;
  }
}

.table {
  th, td { white-space: nowrap; }
}

@media (max-width: 768px) {
  .table { font-size: 0.875rem; }
}
</style>