<template>
    <div class="page-container">
        <HeaderBar />
        <Breadcrumbs :items="breadcrumbItems" class="mt-3" />
        <div class="page-content">
            <div class="d-flex align-items-center justify-content-between">
                <h3 class="mb-0">
                    {{ activeTab === 'categories' ? 'Категории целевых показателей' : 'Целевые показатели' }}
                </h3>
                <div class="d-flex gap-2">
                    <!-- Кнопка для добавления показателя (только на вкладке показателей) -->
                    <button 
                        v-if="activeTab === 'indicators'"
                        class="btn btn-primary d-flex align-items-center" 
                        @click="openCreateModal"
                    >
                        <Plus :size="18" class="me-1" />
                        Добавить показатель
                    </button>
                    <!-- Кнопка для добавления категории (только на вкладке категорий) -->
                    <button 
                        v-if="activeTab === 'categories'"
                        class="btn btn-primary d-flex align-items-center" 
                        @click="openCreateCategoryModal"
                    >
                        <Plus :size="18" class="me-1" />
                        Добавить категорию
                    </button>
                </div>
            </div>

            <!-- Переключатель страниц -->
            <div class="mb-4">
                <div class="btn-group" role="group" aria-label="Переключатели разделов показателей">
                    <button
                        type="button"
                        class="btn btn-sm d-inline-flex align-items-center"
                        :class="[
                            activeTab === 'indicators' ? 'btn-primary project-toggle' : 'btn-outline-primary project-toggle-outline',
                            { active: activeTab === 'indicators' }
                        ]"
                        @click="activeTab = 'indicators'"
                    >
                        <Target class="me-2" :size="16" />
                        <span class="d-inline-flex align-items-center">Показатели</span>
                    </button>
                    <button
                        type="button"
                        class="btn btn-sm d-inline-flex align-items-center"
                        :class="[
                            activeTab === 'categories' ? 'btn-primary project-toggle' : 'btn-outline-primary project-toggle-outline',
                            { active: activeTab === 'categories' }
                        ]"
                        @click="activeTab = 'categories'"
                    >
                        <Layers2 class="me-2" :size="16" />
                        <span class="d-inline-flex align-items-center">Категории показателей</span>
                    </button>
                </div>
            </div>

            <!-- Вкладка "Показатели" -->
            <div v-if="activeTab === 'indicators'">
                <!-- Скелетон/спиннер при загрузке списка показателей -->
                <div v-if="isLoading" class="card p-4 text-center">
                    <div class="d-flex flex-column align-items-center justify-content-center my-2">
                        <div class="spinner-border text-primary mb-3" role="status">
                            <span class="visually-hidden">Загрузка...</span>
                        </div>
                        <h6 class="mb-1">Загрузка показателей...</h6>
                        <p class="text-muted mb-0">Пожалуйста, подождите</p>
                    </div>
                </div>

                <div v-else-if="indicators.length === 0" class="card p-4 text-center">
                    <div class="d-flex flex-column align-items-center justify-content-center my-2">
                        <Target :size="48" class="mb-2 text-muted" />
                        <h5 class="mb-1">Пока нет целевых показателей</h5>
                        <p class="text-muted mb-3">Создайте первый целевой показатель для начала работы.</p>
                        <button class="btn btn-primary" @click="openCreateModal">Создать показатель</button>
                    </div>
                </div>

                <div v-else class="card">
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table table-hover mb-0">
                                <thead class="table-light">
                                    <tr>
                                        <th style="width: 50px;">№</th>
                                        <th style="width: 250px;">Наименование показателя</th>
                                        <th class="text-center" style="width: 100px;">Единица измерения</th>
                                        <th class="text-center" style="width: 120px;">Блок мероприятий</th>
                                        <th class="text-center" style="width: 200px;">Ответственный</th>
                                        <th style="width: 80px;"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr 
                                        v-for="(indicator, index) in indicators" 
                                        :key="indicator.id"
                                        class="clickable-row"
                                        @click="editIndicator(indicator)"
                                    >
                                        <td class="text-muted">{{ index + 1 }}</td>
                                        <td>
                                            <div>{{ indicator.name }}</div>
                                        </td>
                                        <td class="text-center">{{ indicator.unit }}</td>
                                        <td class="text-center">
                                            <div 
                                                v-if="indicator.event_block_short_name"
                                                class="text-truncate"
                                                :title="indicator.event_block_title || indicator.event_block_short_name"
                                            >
                                                {{ indicator.event_block_short_name }}
                                            </div>
                                            <div v-else class="text-muted">Не указан</div>
                                        </td>
                                        <td class="text-center">
                                            <div class="d-inline-flex align-items-center justify-content-center gap-2">
                                                <template v-if="indicator.responsible">
                                                    <img 
                                                        v-if="indicator.responsible_avatar_url"
                                                        :src="indicator.responsible_avatar_url"
                                                        :alt="indicator.responsible_name || 'Аватар'"
                                                        class="rounded-circle avatar-img"
                                                    />
                                                    <DefaultAvatar 
                                                        v-else 
                                                        :size="'small'" 
                                                        :title="indicator.responsible_name || 'Пользователь'" 
                                                    />
                                                </template>
                                                <template v-else>
                                                    <DefaultAvatar :size="'small'" :title="'Не указан'" />
                                                </template>
                                                <span v-if="indicator.responsible_name" class="text-truncate" :title="indicator.responsible_name">{{ indicator.responsible_name }}</span>
                                                <span v-else class="text-muted">Не указан</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="btn-group btn-group-sm row-actions">
                                                <button class="btn btn-outline-danger" @click.stop="openDeleteConfirm(indicator.id)">
                                                    <Trash2 :size="14" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Отдельная таблица для значений по годам -->
                <div v-if="isLoading" class="card mt-3 p-4 text-center">
                    <div class="d-flex flex-column align-items-center justify-content-center my-2">
                        <div class="spinner-border text-primary mb-2" role="status">
                            <span class="visually-hidden">Загрузка...</span>
                        </div>
                        <div class="text-muted">Загрузка значений по годам...</div>
                    </div>
                </div>

                <div v-else-if="indicators.length > 0" class="card mt-3">
                    <div class="card-header">
                        <h6 class="mb-0">Значения показателей по годам</h6>
                    </div>
                    <div class="card-body p-0">
                        <div class="years-table-container">
                            <table class="table table-hover mb-0 years-table">
                                <thead class="table-light sticky-header">
                                    <tr>
                                        <th style="width: 200px;">Показатель</th>
                                        <th v-for="year in years" :key="year" class="year-column">
                                            {{ year }}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="indicator in indicators" :key="`values-${indicator.id}`">
                                        <td class="indicator-name-cell">
                                            <div>{{ indicator.name }}</div>
                                            <small class="text-muted">{{ indicator.unit }}</small>
                                        </td>
                                        <td v-for="year in years" :key="`${indicator.id}-${year}`" class="year-value-cell">
                                            <div v-if="indicator.values_by_year && indicator.values_by_year[year] !== undefined && indicator.values_by_year[year] !== ''">
                                                {{ indicator.values_by_year[year] }}
                                            </div>
                                            <div v-else class="text-muted">-</div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Вкладка "Категории показателей" -->
            <div v-if="activeTab === 'categories'">
                <CategoriesIndicators ref="categoriesComponent" />
            </div>
        </div>

        <!-- Модальное окно создания/редактирования показателя -->
        <div class="modal fade" :class="{ 'show d-block': showModal }" tabindex="-1" v-if="showModal">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            {{ editingIndicator ? 'Редактировать показатель' : 'Добавить показатель' }}
                        </h5>
                        <button type="button" class="btn-close" @click="closeModal"></button>
                    </div>
                    <div class="modal-body p-0">
                        <CreateIndicatorPage 
                            :editing-indicator="editingIndicator"
                            @saved="onIndicatorSaved"
                            @cancelled="closeModal"
                        />
                    </div>
                </div>
            </div>
        </div>
        <div class="modal-backdrop fade" :class="{ 'show': showModal }" v-if="showModal"></div>

        <!-- Модальное окно подтверждения удаления показателя -->
        <div class="modal fade" :class="{ 'show d-block': deleteId !== null }" tabindex="-1" v-if="deleteId !== null">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Подтверждение удаления</h5>
                        <button type="button" class="btn-close" @click="closeDeleteConfirm"></button>
                    </div>
                    <div class="modal-body">
                        Вы уверены, что хотите удалить этот целевой показатель?
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="closeDeleteConfirm">Отмена</button>
                        <button type="button" class="btn btn-danger" @click="confirmDelete">Удалить</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="modal-backdrop fade" :class="{ 'show': deleteId !== null }" v-if="deleteId !== null"></div>

    </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Home, Target, Plus, Edit, Trash2, Wrench, Layers2 } from 'lucide-vue-next'
import HeaderBar from '@/modules/crm/project-ed/components/HeaderBar.vue'
import Breadcrumbs from './components/Breadcrumbs.vue'
import CategoriesIndicators from './components/CategoriesIndicators.vue'
import CreateIndicatorPage from './CreateIndicatorPage.vue'
import { apiClient } from '@/js/api/manager'
import { endpoints } from '@/js/api/endpoints'
import DefaultAvatar from '@/components/DefaultAvatar.vue'
import { getUserAvatar } from '@/js/userAvatar'

// Router для управления URL
const router = useRouter()
const route = useRoute()

// Вычисляемое свойство для breadcrumbs
const breadcrumbItems = computed(() => [
    { label: 'Главная', icon: Home, to: { name: 'ProjectEdMain' } },
    { label: 'Служебная страница', icon: Wrench, to: { name: 'ProjectEdTechnical' } },
    { 
        label: activeTab.value === 'categories' ? 'Категории целевых показателей' : 'Целевые показатели', 
        icon: activeTab.value === 'categories' ? Layers2 : Target 
    }
])

const showModal = ref(false)
const editingIndicator = ref(null)
const activeTab = ref('indicators')
const categoriesComponent = ref(null)

// Функция для обновления URL с параметром tab
const updateUrlWithTab = (tab) => {
    const query = { ...route.query, tab }
    router.replace({ 
        path: route.path, 
        query 
    })
}

// Инициализация активной вкладки из URL
const initializeActiveTab = () => {
    const tabFromUrl = route.query.tab
    if (tabFromUrl === 'categories') {
        activeTab.value = 'categories'
    } else {
        activeTab.value = 'indicators'
        // Обновляем URL для показателей
        if (tabFromUrl !== 'indicators') {
            updateUrlWithTab('indicators')
        }
    }
}

// Годы с 2023 по 2032
const years = ref([2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032])

const indicators = ref([])
const isLoading = ref(false)
async function loadResponsibleAvatar(userId) {
    return getUserAvatar(userId)
}

async function enrichIndicatorsWithAvatars(items) {
    const tasks = []
    for (const it of items) {
        const responsibleId = typeof it.responsible === 'object' ? it.responsible?.id : it.responsible
        if (responsibleId) {
            tasks.push(
                loadResponsibleAvatar(responsibleId).then(url => {
                    it.responsible_avatar_url = url || null
                })
            )
        } else {
            it.responsible_avatar_url = null
        }
    }
    if (tasks.length) {
        await Promise.allSettled(tasks)
    }
}

async function loadIndicators() {
    try {
        isLoading.value = true
        const resp = await apiClient.get(endpoints.project_ed.target_indicators.list)
        indicators.value = Array.isArray(resp?.data) ? resp.data : (resp?.results || [])
        await enrichIndicatorsWithAvatars(indicators.value)
    } catch (e) {
        indicators.value = []
    } finally {
        isLoading.value = false
    }
}

watch(activeTab, (newTab) => {
    updateUrlWithTab(newTab)
})

onMounted(async () => {
    initializeActiveTab()
    await loadIndicators()
})

// Открытие модального окна для создания категории
const openCreateCategoryModal = () => {
    if (categoriesComponent.value) {
        categoriesComponent.value.openCreateCategoryModal()
    }
}

// Открытие модального окна для создания
const openCreateModal = () => {
    editingIndicator.value = null
    showModal.value = true
}

// Открытие модального окна для редактирования
const editIndicator = (indicator) => {
    editingIndicator.value = indicator
    showModal.value = true
}

// Закрытие модального окна
const closeModal = () => {
    showModal.value = false
    editingIndicator.value = null
}

// Обработка сохранения показателя
const onIndicatorSaved = (indicator) => {
    // После сохранения перезагружаем список с сервера (API возвращает нормализованные поля)
    loadIndicators()
    closeModal()
}

// Удаление показателя с подтверждением
const deleteId = ref(null)
function openDeleteConfirm(id) { deleteId.value = id }
function closeDeleteConfirm() { deleteId.value = null }
async function confirmDelete() {
    if (!deleteId.value) return
    indicators.value = indicators.value.filter(i => i.id !== deleteId.value)
    deleteId.value = null
}

</script>

<style scoped lang="scss">
.page-container {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.page-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.modal {
    background-color: rgba(0, 0, 0, 0.5);
}

.modal.show {
    display: block !important;
}

.modal-backdrop.show {
    opacity: 0.5;
}


.table th {
    border-top: none;
    font-weight: 600;
    color: #495057;
}

/* Вертикальное выравнивание по центру для ячеек таблиц */
.table th,
.table td {
    vertical-align: middle;
}

.btn-group-sm > .btn {
    padding: 0.25rem 0.5rem;
}

/* Кликабельные строки в таблице показателей */
.clickable-row {
    cursor: pointer;
}
.clickable-row:hover {
    background-color: var(--color-hover-background, #f8f9fa);
}

/* Кнопка удаления показывается только при наведении */
.row-actions { opacity: 0; transition: opacity .15s ease-in-out; }
tr.clickable-row:hover .row-actions { opacity: 1; }

.avatar-img {
    width: 32px;
    height: 32px;
    object-fit: cover;
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.text-success {
    color: #198754 !important;
}

.text-danger {
    color: #dc3545 !important;
}

.text-muted {
    color: #6c757d !important;
}

/* Синий цвет переключателей независимо от темы */
.project-toggle {
    --bs-btn-bg: #0d6efd;
    --bs-btn-border-color: #0d6efd;
    --bs-btn-hover-bg: #0b5ed7;
    --bs-btn-hover-border-color: #0a58ca;
    --bs-btn-active-bg: #0a58ca;
    --bs-btn-active-border-color: #0a53be;
}

/* Контурная синяя для неактивной кнопки с белым фоном */
.project-toggle-outline {
    --bs-btn-color: #0d6efd;
    --bs-btn-border-color: #0d6efd;
    --bs-btn-bg: #ffffff;
    --bs-btn-hover-color: #0b5ed7;
    --bs-btn-hover-bg: #e7f1ff;
    --bs-btn-hover-border-color: #0b5ed7;
    --bs-btn-active-color: #0a58ca;
    --bs-btn-active-bg: #d6e8ff;
    --bs-btn-active-border-color: #0a58ca;
}

/* Стили для таблицы с годами */
.years-table-container {
    overflow-x: auto;
    max-width: 100%;
    border-radius: 0.375rem;
}

.years-table {
    min-width: 800px; /* Минимальная ширина для корректного отображения */
    width: 100%;
    table-layout: fixed;
}

.sticky-header {
    position: sticky;
    top: 0;
    z-index: 10;
    background: #f8f9fa;
}

.year-column {
    min-width: 90px;
    text-align: center;
    font-size: 0.875rem;
    font-weight: 600;
    color: #495057;
    padding: 0.75rem 0.5rem;
    border-left: 1px solid #dee2e6;
}

.year-value-cell {
    text-align: center;
    padding: 0.5rem;
    border-left: 1px solid #dee2e6;
    min-width: 90px;
    font-size: 0.875rem;
    vertical-align: middle;
}

.indicator-name-cell {
    position: sticky;
    left: 0;
    background: white;
    z-index: 5;
    min-width: 220px;
    max-width: 220px;
}

/* Стили для прокрутки */
.years-table-container::-webkit-scrollbar {
    height: 8px;
}

.years-table-container::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
}

.years-table-container::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
}

.years-table-container::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
}
</style>
