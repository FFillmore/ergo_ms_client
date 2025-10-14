<template>
    <div class="modal-form-container">
        <div class="p-4 position-relative">
            <div v-if="initLoading" class="init-loading d-flex flex-column align-items-center justify-content-center py-5">
                <div class="spinner-border text-primary mb-3" role="status" aria-label="Загрузка"></div>
                <div class="text-muted">Загрузка данных...</div>
            </div>
            <form v-else @submit.prevent="saveIndicator">
                <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Категория показателя <span class="text-danger">*</span></label>
                                <SelectBox
                                    v-model="formData.categoryId"
                                    :options="categories"
                                    :allLabel="'Выберите категорию'"
                                    :includeAllOption="true"
                                    :castToNumber="true"
                                    :disabled="loading"
                                    @change="onCategoryChange"
                                />
                                <div v-if="errors.categoryId" class="error-message">
                                    {{ errors.categoryId }}
                                </div>
                            </div>

                            <div class="col-md-6 mb-3">
                                <label class="form-label">Наименование политики</label>
                                <SelectBox
                                    v-model="formData.subcategoryId"
                                    :options="subcategories"
                                    :allLabel="'Не указана'"
                                    :includeAllOption="true"
                                    :castToNumber="true"
                                    :disabled="loading"
                                    @change="onSubcategoryChange"
                                />
                            </div>

                            <div class="col-12 mb-3">
                                <label class="form-label">Название показателя <span class="text-danger">*</span></label>
                                <textarea 
                                    class="form-control" 
                                    v-model="formData.name"
                                    required
                                    placeholder="Введите название показателя"
                                    rows="3"
                                    style="resize: vertical; min-height: 60px;"
                                ></textarea>
                                <div v-if="errors.name" class="error-message">
                                    {{ errors.name }}
                                </div>
                            </div>

                            <div class="col-md-4 mb-3">
                                <label class="form-label">Единица измерения <span class="text-danger">*</span></label>
                                <input 
                                    type="text" 
                                    class="form-control" 
                                    v-model="formData.unit"
                                    required
                                    placeholder="шт., %, руб. и т.д."
                                >
                                <div v-if="errors.unit" class="error-message">
                                    {{ errors.unit }}
                                </div>
                            </div>

                            <div class="col-md-4 mb-3">
                                <label class="form-label">Блок мероприятий <span class="text-danger">*</span></label>
                                <SelectBox
                                    v-model="formData.eventBlockId"
                                    :options="eventBlocks"
                                    :valueKey="'id'"
                                    :labelKey="'code'"
                                    :allLabel="'Выберите блок мероприятий'"
                                    :includeAllOption="true"
                                    :castToNumber="true"
                                    :disabled="loading"
                                />
                                <div v-if="errors.eventBlockId" class="error-message">
                                    {{ errors.eventBlockId }}
                                </div>
                            </div>

                            <div class="col-md-4 mb-3">
                                <label class="form-label">Ответственный <span class="text-danger">*</span></label>
                                <div class="responsible-dropdown-wrapper" ref="responsibleDropdownRef">
                                    <div 
                                        class="responsible-select-trigger"
                                        @click="toggleResponsibleDropdown"
                                        :class="{ 'is-open': isResponsibleDropdownOpen }"
                                    >
                                        <div v-if="getSelectedResponsible()" class="responsible-selected">
                                            <template v-if="getSelectedResponsible().avatar_url">
                                                <img 
                                                    :src="getSelectedResponsible().avatar_url"
                                                    :alt="getSelectedResponsible().name"
                                                    class="rounded-circle avatar-img-small"
                                                />
                                            </template>
                                            <DefaultAvatar
                                                v-else
                                                :size="'small'"
                                                :title="getSelectedResponsible().name"
                                            />
                                            <div class="responsible-info">
                                                <div class="responsible-name responsible-name--selected">{{ getSelectedResponsible().name }}</div>
                                            </div>
                                        </div>
                                        <div v-else class="responsible-placeholder">
                                            Выберите ответственного
                                        </div>
                                        <div class="select-arrow" :class="{ 'rotated': isResponsibleDropdownOpen }">
                                            <ChevronDown :size="16" />
                                        </div>
                                    </div>
                                    
                                    <div v-if="isResponsibleDropdownOpen" class="responsible-dropdown-list">
                                        <div 
                                            v-for="person in users" 
                                            :key="person.id" 
                                            class="responsible-dropdown-item"
                                            :class="{ 'selected': person.id === formData.responsibleId }"
                                            @click="selectResponsible(person)"
                                        >
                                            <template v-if="person.avatar_url">
                                                <img 
                                                    :src="person.avatar_url"
                                                    :alt="person.name"
                                                    class="rounded-circle avatar-img-medium"
                                                />
                                            </template>
                                            <DefaultAvatar
                                                v-else
                                                :size="'medium'"
                                                :title="person.name"
                                            />
                                            <div class="responsible-info">
                                                <div class="responsible-name">{{ person.name }}</div>
                                                <div class="responsible-position">{{ person.position }}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div v-if="errors.responsible" class="error-message">
                                    {{ errors.responsible }}
                                </div>
                            </div>
                            
                            <div class="col-12 mb-3">
                                <label class="form-label">Значения показателя по годам <span class="text-danger">*</span></label>
                                <div class="row">
                                    <div 
                                        v-for="year in years" 
                                        :key="year" 
                                        class="col-md-2 col-sm-3 col-4 mb-2"
                                    >
                                        <label class="form-label small">{{ year }} год</label>
                                        <input 
                                            type="number" 
                                            class="form-control form-control-sm" 
                                            v-model="formData.values[year]"
                                            step="0.0001"
                                        :placeholder="year"
                                        :disabled="loading"
                                        >
                                    </div>
                                </div>
                                <div v-if="errors.values" class="error-message">
                                    {{ errors.values }}
                                </div>
                            </div>
                </div>

                <div class="d-flex justify-content-end gap-2 mt-4">
                    <button type="button" class="btn btn-secondary" @click="cancel" :disabled="loading">
                        Отмена
                    </button>
                    <button type="submit" class="btn btn-primary" :disabled="loading">
                        <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                        {{ props.editingIndicator ? 'Сохранить изменения' : 'Создать показатель' }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, defineProps, defineEmits } from 'vue'
import { useToast } from 'vue-toastification'
import { apiClient } from '@/js/api/manager'
import { endpoints } from '@/js/api/endpoints'
import { ChevronDown } from 'lucide-vue-next'
import SelectBox from '@/components/SelectBox.vue'
import DefaultAvatar from '@/components/DefaultAvatar.vue'

const props = defineProps({
    editingIndicator: {
        type: Object,
        default: null
    }
})

const emit = defineEmits(['saved', 'cancelled'])

const toast = useToast()

const loading = ref(false)
const initLoading = ref(true)

// Состояние для выпадающего списка ответственного
const isResponsibleDropdownOpen = ref(false)
const responsibleDropdownRef = ref(null)

// Данные формы
const formData = ref({
    categoryId: '',
    subcategoryId: '',
    name: '',
    unit: '',
    eventBlockId: '',
    responsibleId: '',
    values: {}
})

// Списки данных
const categories = ref([])
const subcategories = ref([])
const eventBlocks = ref([])
const users = ref([])

// Ошибки валидации
const errors = ref({})

// Годы с 2023 по 2032
const years = ref([2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032])

// Инициализация значений по годам
const initializeValues = () => {
    years.value.forEach(year => {
        if (!formData.value.values[year]) {
            formData.value.values[year] = ''
        }
    })
}

// Загрузка категорий
const loadCategories = async () => {
    try {
        const response = await apiClient.get(endpoints.project_ed.categories.list)
        if (response.success) {
            categories.value = response.data
        } else {
            console.error('Ошибка загрузки категорий:', response.message)
            toast.error('Ошибка загрузки категорий')
        }
    } catch (error) {
        console.error('Ошибка загрузки категорий:', error)
        toast.error('Ошибка загрузки категорий')
    }
}

// Загрузка подкатегорий (политик)
const loadSubcategories = async () => {
    try {
        const response = await apiClient.get(endpoints.project_ed.subcategories.list)
        if (response.success) {
            subcategories.value = response.data
        } else {
            console.error('Ошибка загрузки политик:', response.message)
            toast.error('Ошибка загрузки политик')
        }
    } catch (error) {
        console.error('Ошибка загрузки политик:', error)
        toast.error('Ошибка загрузки политик')
    }
}

// Загрузка блоков мероприятий
const loadEventBlocks = async () => {
    try {
        const response = await apiClient.get(endpoints.project_ed.event_blocks.list)
        if (response.success) {
            eventBlocks.value = response.data
            console.log('Загружены блоки мероприятий:', response.data)
        } else {
            console.error('Ошибка загрузки блоков мероприятий:', response.message)
            toast.error('Ошибка загрузки блоков мероприятий')
        }
    } catch (error) {
        console.error('Ошибка загрузки блоков мероприятий:', error)
        toast.error('Ошибка загрузки блоков мероприятий')
    }
}

// Загрузка пользователей с должностью "Проректор"
const loadUsers = async () => {
    try {
        // Получаем пользователей и профили, чтобы собрать avatar_url
        const [usersResp, profilesResp] = await Promise.all([
            apiClient.get('/crm/users/', { position: 'Проректор' }),
            apiClient.get('project_ed/profiles/profiles/', { position: 'Проректор' })
        ])

        const usersData = Array.isArray(usersResp?.data) ? usersResp.data : (usersResp?.data?.results || [])
        const profilesData = Array.isArray(profilesResp?.data) ? profilesResp.data : (profilesResp?.data?.results || [])

        // Ключ по user.id
        const userById = new Map(usersData.map(u => [u.id, u]))

        users.value = profilesData.map(p => {
            const u = userById.get(p.id) || {}
            return {
                id: p.id,
                name: [p.last_name, p.first_name].filter(Boolean).join(' ') || p.username,
                position: p.position_name || 'Должность не указана',
                avatar_url: u.avatar_url || null
            }
        })
    } catch (e) {
        console.error('Ошибка загрузки пользователей-проректоров', e)
        users.value = []
    }
}

// Обработчики изменений
const onCategoryChange = () => {
    // Категория больше не влияет на блоки мероприятий
}

const onSubcategoryChange = () => {
    // Политика больше не влияет на блоки мероприятий
}

// Функции для управления выпадающим списком ответственного
const toggleResponsibleDropdown = () => {
    isResponsibleDropdownOpen.value = !isResponsibleDropdownOpen.value
}

const selectResponsible = (person) => {
    formData.value.responsibleId = person.id
    isResponsibleDropdownOpen.value = false
}

const getSelectedResponsible = () => {
    return users.value.find(person => person.id === formData.value.responsibleId)
}

const closeResponsibleDropdown = () => {
    isResponsibleDropdownOpen.value = false
}

// Глобальный обработчик клика вне выпадающих списков
const handleClickOutside = (event) => {
    if (responsibleDropdownRef.value && !responsibleDropdownRef.value.contains(event.target)) {
        closeResponsibleDropdown()
    }
}

// Сохранение показателя
const saveIndicator = async () => {
    if (!validateForm()) {
        return
    }

    loading.value = true
    
    try {
        const data = {
            name: formData.value.name,
            unit: formData.value.unit,
            category: formData.value.categoryId || null,
            subcategory: formData.value.subcategoryId || null,
            event_block: formData.value.eventBlockId || null,
            responsible: formData.value.responsibleId || null,
            values_by_year: formData.value.values
        }

        const endpoint = props.editingIndicator 
            ? endpoints.project_ed.target_indicators.update(props.editingIndicator.id)
            : endpoints.project_ed.target_indicators.create
        
        const response = props.editingIndicator 
            ? await apiClient.put(endpoint, data)
            : await apiClient.post(endpoint, data)

        if (response.success) {
            // Восстанавливаем прокрутку после успешного сохранения
            document.body.style.overflow = 'auto'
            toast.success(props.editingIndicator ? 'Показатель обновлен' : 'Показатель создан')
            emit('saved', response.data)
        } else {
            toast.error(response.message || 'Ошибка сохранения')
        }
    } catch (error) {
        console.error('Ошибка сохранения:', error)
        toast.error('Ошибка сохранения показателя')
    } finally {
        loading.value = false
    }
}

// Валидация формы
const validateForm = () => {
    errors.value = {}
    
    if (!formData.value.categoryId) {
        errors.value.categoryId = 'Выберите категорию'
    }
    if (!formData.value.name) {
        errors.value.name = 'Введите название показателя'
    }
    if (!formData.value.unit) {
        errors.value.unit = 'Введите единицу измерения'
    }
    if (!formData.value.eventBlockId) {
        errors.value.eventBlockId = 'Выберите блок мероприятий'
    }
    if (!formData.value.responsibleId) {
        errors.value.responsible = 'Выберите ответственного'
    }
    
    // Проверяем, что хотя бы одно значение по годам заполнено
    const hasValues = Object.values(formData.value.values).some(value => value !== '')
    if (!hasValues) {
        errors.value.values = 'Заполните хотя бы одно значение по годам'
    }
    
    return Object.keys(errors.value).length === 0
}

// Отмена
const cancel = () => {
    // Восстанавливаем прокрутку перед закрытием
    document.body.style.overflow = 'auto'
    emit('cancelled')
}

// Загрузка данных для редактирования
const loadIndicatorForEdit = async (indicator) => {
    if (!indicator) return
    
    const getId = (val) => {
        if (val == null || val === '') return ''
        if (typeof val === 'object') {
            return val.id ?? ''
        }
        return val
    }

    formData.value = {
        categoryId: getId(indicator.category),
        subcategoryId: getId(indicator.subcategory),
        name: indicator.name,
        unit: indicator.unit,
        eventBlockId: getId(indicator.event_block),
        responsibleId: getId(indicator.responsible),
        values: indicator.values_by_year || {}
    }
    
    // Блоки мероприятий загружаются независимо при инициализации
}

onMounted(async () => {
    // Запрещаем прокрутку основной страницы
    document.body.style.overflow = 'hidden'
    
    initializeValues()
    try {
        await Promise.all([
            loadCategories(),
            loadSubcategories(),
            loadEventBlocks(),
            loadUsers()
        ])
    } finally {
        initLoading.value = false
    }
    
    // Если это редактирование, загружаем данные показателя
    if (props.editingIndicator) {
        await loadIndicatorForEdit(props.editingIndicator)
    }
    
    // Обработчик клика вне выпадающего списка
    document.addEventListener('click', handleClickOutside)
})

// Восстанавливаем прокрутку при размонтировании компонента
onUnmounted(() => {
    document.body.style.overflow = 'auto'
    // Удаляем обработчик клика вне выпадающего списка
    document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped lang="scss">
.modal-form-container {
    max-height: 80vh;
    overflow-y: auto;
}

.init-loading {
    min-height: 300px;
}

.form-label.small {
    font-size: 0.875rem;
    font-weight: 500;
    margin-bottom: 0.25rem;
}

.spinner-border-sm {
    width: 1rem;
    height: 1rem;
}

// Стили для кастомного выпадающего списка ответственного
.responsible-dropdown-wrapper {
    position: relative;
    width: 100%;
}

.responsible-select-trigger {
    width: 100%;
    padding: 0.375rem 0.75rem; // Стандартный padding Bootstrap для form-control
    border: 1px solid #ced4da; // Стандартная граница Bootstrap
    border-radius: 0.375rem; // Стандартный border-radius Bootstrap
    font-size: 1rem;
    transition: all 0.15s ease-in-out; // Стандартная анимация Bootstrap
    background: var(--color-secondary-background);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 38px; // Стандартная высота Bootstrap form-control
    
    &:hover {
        border-color: #86b7fe;
    }
    
    &:focus {
        outline: 0;
        border-color: #86b7fe;
        box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
    }
    
    &.is-open {
        border-color: #86b7fe;
        box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
    }
}

.responsible-selected {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
    min-width: 0;
}

.responsible-placeholder {
    color: #6c757d;
    flex: 1;
}

.responsible-info {
    flex: 1;
    min-width: 0;
}

.responsible-name {
    font-weight: 500;
    color: #212529;
    font-size: 0.875rem;
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    
    &--selected {
        font-weight: 600;
    }
}


.responsible-dropdown-list {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    background: white;
    border: 2px solid #0d6efd;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    max-height: 300px;
    overflow-y: auto;
}

.responsible-dropdown-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
    border-bottom: 1px solid #e9ecef;
    position: relative;
    
    &:last-child {
        border-bottom: none;
    }
    
    &:hover {
        background-color: #f8f9fa;
    }
    
    &:active {
        background-color: #e9ecef;
    }
    
    &.selected {
        background-color: #e7f3ff;
    }
    
    .responsible-name {
        font-size: 0.95rem;
        line-height: 1.2;
    }
    
    .responsible-position {
        font-size: 0.8rem;
        line-height: 1.2;
        margin-top: 0.125rem;
    }
}

.avatar-img-small {
    width: 32px;
    height: 32px;
    object-fit: cover;
}

.avatar-img-medium {
    width: 40px;
    height: 40px;
    object-fit: cover;
}


.select-arrow {
    transition: transform 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;

    &.rotated {
        transform: rotate(180deg);
    }
}

.error-message {
    color: #dc3545;
    font-size: 0.875rem;
    margin-top: 0.5rem;
    padding: 0.5rem;
    background: #f8d7da;
    border: 1px solid #f5c6cb;
    border-radius: 4px;
}
</style>
