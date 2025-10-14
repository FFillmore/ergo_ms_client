<template>
    <div>
        <div v-if="!isLoading && categories.length === 0" class="card p-4 text-center">
            <div class="d-flex flex-column align-items-center justify-content-center my-2">
                <Layers2 :size="48" class="mb-2 text-muted" />
                <h5 class="mb-1">Пока нет категорий показателей</h5>
                <p class="text-muted mb-3">Создайте первую категорию для группировки показателей.</p>
                <button class="btn btn-primary" @click="openCreateCategoryModal">Создать категорию</button>
            </div>
        </div>

        <div v-else class="card">
            <div v-if="isLoading" class="card-body text-center p-5">
                <div class="loading-spinner">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Загрузка...</span>
                    </div>
                </div>
                <p class="mt-3 text-muted">Загрузка категорий...</p>
            </div>
            <div v-else class="card-body p-0" :class="{ 'updating-order': isUpdatingOrder }">
                <!-- Оверлей загрузки при обновлении порядка -->
                <div v-if="isUpdatingOrder" class="loading-overlay">
                    <div class="loading-spinner">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Обновление порядка...</span>
                        </div>
                    </div>
                    <p class="mt-2 text-muted">Обновление порядка категорий...</p>
                </div>
                
                <div class="table-responsive">
                    <table class="table table-hover mb-0">
                        <thead class="table-light">
                            <tr>
                                <th style="width: 60px;">№</th>
                                <th>Название категории/подкатегории</th>
                                <th style="width: 100px;">Показатели</th>
                                <th style="width: 50px;"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <template v-for="(category, index) in categories" :key="category.id">
                                <!-- Основная строка категории -->
                                <tr class="category-main-row clickable-row" @click="editCategory(category)">
                                <td class="text-muted">{{ index + 1 }}</td>
                                <td>
                                        <div class="category-name">{{ category.name }}</div>
                                </td>
                                    <td class="text-center">
                                        <div 
                                            class="indicators-count" 
                                            :data-category-id="category.id"
                                            :data-count="getCategoryIndicatorsCount(category)"
                                            data-is-category="true"
                                        >
                                            <BarChart3 :size="16" class="me-1" />
                                            <span class="fw-medium indicators-number">{{ getCategoryIndicatorsCount(category) }}</span>
                                    </div>
                                </td>
                                <td>
                                        <button class="btn btn-outline-danger btn-sm" @click.stop="deleteCategory(category.id)" title="Удалить категорию">
                                            <Trash2 :size="14" />
                                        </button>
                                    </td>
                                </tr>
                                
                                <!-- Строки подкатегорий -->
                                <tr v-for="(subcategory, subIndex) in category.subcategories" :key="`${category.id}-sub-${subIndex}`" class="subcategory-row">
                                    <td class="text-muted">
                                        <span class="subcategory-number">{{ index + 1 }}.{{ subIndex + 1 }}</span>
                                    </td>
                                    <td>
                                        <div class="subcategory-name">
                                            {{ subcategory.name }}
                                        </div>
                                    </td>
                                    <td class="text-center">
                                        <div 
                                            class="indicators-count subcategory-count" 
                                            :data-category-id="category.id"
                                            :data-subcategory="subcategory.name"
                                            :data-count="getSubcategoryIndicatorsCount(category, subcategory)"
                                            data-is-subcategory="true"
                                        >
                                            <BarChart3 :size="14" class="me-1" />
                                            <span class="fw-medium indicators-number">{{ getSubcategoryIndicatorsCount(category, subcategory) }}</span>
                                    </div>
                                </td>
                                    <td></td>
                            </tr>
                            </template>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Модальное окно создания категории -->
        <div class="modal fade" :class="{ 'show d-block': showCategoryModal }" tabindex="-1" v-if="showCategoryModal">
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">{{ editingCategory ? 'Редактировать категорию' : 'Добавить категорию' }}</h5>
                        <button type="button" class="btn-close" @click="closeCategoryModal"></button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="saveCategory">
                            <div class="mb-3">
                                <label class="form-label">Название категории *</label>
                                <input 
                                    type="text" 
                                    class="form-control" 
                                    v-model="categoryFormData.name"
                                    required
                                    placeholder="Введите название категории"
                                >
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Позиция в списке</label>
                                <select 
                                    class="form-select" 
                                    v-model="categoryFormData.order"
                                >
                                    <option 
                                        v-for="option in getPositionOptions()" 
                                        :key="option.value" 
                                        :value="option.value"
                                    >
                                        {{ option.label }}
                                    </option>
                                </select>
                                <div class="form-text">
                                    <span v-if="editingCategory">
                                        Текущая позиция: {{ getCurrentCategoryPosition() }}
                                    </span>
                                    <span v-else>
                                        Категория будет добавлена в конец списка
                                    </span>
                                </div>
                            </div>
                            <div class="mb-3">
                                <div class="form-check">
                                    <input 
                                        class="form-check-input" 
                                        type="checkbox" 
                                        v-model="categoryFormData.hasSubcategories"
                                        id="hasSubcategories"
                                    >
                                    <label class="form-check-label" for="hasSubcategories">
                                        Наличие подкатегорий
                                    </label>
                                </div>
                            </div>
                            <div v-if="categoryFormData.hasSubcategories" class="mb-3">
                                <label class="form-label">Подкатегории</label>
                                <div v-for="(subcategory, index) in categoryFormData.subcategories" :key="index" class="input-group mb-2">
                                    <input 
                                        type="text" 
                                        class="form-control" 
                                        v-model="categoryFormData.subcategories[index]"
                                        :placeholder="`Подкатегория ${index + 1}`"
                                    >
                                    <button 
                                        type="button" 
                                        class="btn btn-outline-danger" 
                                        @click="removeSubcategory(index)"
                                        :disabled="categoryFormData.subcategories.length === 1"
                                    >
                                        <Trash2 :size="14" />
                                    </button>
                                </div>
                                <button 
                                    type="button" 
                                    class="btn btn-outline-primary btn-sm" 
                                    @click="addSubcategory"
                                >
                                    <Plus :size="14" class="me-1" />
                                    Добавить подкатегорию
                                </button>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="closeCategoryModal" :disabled="isLoading">Отмена</button>
                        <button type="button" class="btn btn-primary" @click="saveCategory" :disabled="isLoading">
                            <div v-if="isLoading" class="loading-spinner-sm me-2">
                                <div class="spinner-border spinner-border-sm" role="status">
                                    <span class="visually-hidden">Загрузка...</span>
                                </div>
                            </div>
                            {{ editingCategory ? 'Сохранить изменения' : 'Создать категорию' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="modal-backdrop fade" :class="{ 'show': showCategoryModal }" v-if="showCategoryModal"></div>

        <!-- Модальное окно подтверждения удаления -->
        <div class="modal fade" :class="{ 'show d-block': showDeleteModal }" tabindex="-1" v-if="showDeleteModal">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <Trash2 :size="20" class="me-2 text-danger" />
                            Подтверждение удаления
                        </h5>
                        <button type="button" class="btn-close" @click="closeDeleteModal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="delete-warning">
                            <div class="warning-icon">
                                <AlertTriangle :size="48" class="text-warning" />
                            </div>
                            <div class="warning-content">
                                <h6 class="warning-title">Вы точно уверены, что хотите удалить эту категорию?</h6>
                                <p v-if="categoryToDelete && getCategoryIndicatorsCount(categoryToDelete) > 0" class="warning-text">
                                    Она используется <strong>{{ getCategoryIndicatorsCount(categoryToDelete) }}</strong> 
                                    {{ getCategoryIndicatorsCount(categoryToDelete) === 1 ? 'целевым показателем' : 'целевыми показателями'}}.
                                </p>
                                <p v-else class="warning-text">
                                    Категория не используется ни одним целевым показателем.
                                </p>
                                <div v-if="categoryToDelete && categoryToDelete.subcategories && categoryToDelete.subcategories.length > 0" class="subcategories-info">
                                    <p class="mb-1"><strong>Подкатегории:</strong></p>
                                    <ul class="subcategories-list">
                                        <li v-for="subcategory in categoryToDelete.subcategories" :key="subcategory.id || subcategory" class="subcategory-item">
                                            {{ subcategory.name }}
                                            <span v-if="getSubcategoryIndicatorsCount(categoryToDelete, subcategory) > 0" class="usage-count">
                                                ({{ getSubcategoryIndicatorsCount(categoryToDelete, subcategory) }} 
                                                {{ getSubcategoryIndicatorsCount(categoryToDelete, subcategory) === 1 ? 'показатель' : 'показателей'}})
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="closeDeleteModal" :disabled="isLoading">Отмена</button>
                        <button type="button" class="btn btn-danger" @click="confirmDelete" :disabled="isLoading">
                            <div v-if="isLoading" class="loading-spinner-sm me-2">
                                <div class="spinner-border spinner-border-sm" role="status">
                                    <span class="visually-hidden">Загрузка...</span>
                                </div>
                            </div>
                            <Trash2 v-else :size="16" class="me-1" />
                            Удалить категорию
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="modal-backdrop fade" :class="{ 'show': showDeleteModal }" v-if="showDeleteModal"></div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { Target, Plus, Edit, Trash2, BarChart3, AlertTriangle, Layers2 } from 'lucide-vue-next'
import { useToast } from 'vue-toastification'
import { apiClient } from '@/js/api/manager'
import { endpoints } from '@/js/api/endpoints'

// События для родительского компонента
const emit = defineEmits(['open-create-category-modal'])

// Toast уведомления
const toast = useToast()

// Состояние компонента
const showCategoryModal = ref(false)
const editingCategory = ref(null)
const showDeleteModal = ref(false)
const categoryToDelete = ref(null)
const isLoading = ref(true) // Начинаем с true, чтобы показать загрузку при первом рендере
const isUpdatingOrder = ref(false)
const isInitialLoad = ref(true) // Флаг для первой загрузки

// Ref для popover элементов
const popoverElements = ref([])
const categories = ref([])

// Загрузка категорий
const loadCategories = async () => {
    try {
        isLoading.value = true
        
        const response = await apiClient.get(endpoints.project_ed.categories.list)
        
        if (response.success) {
            categories.value = response.data
        } else {
            throw new Error(response.message || 'Ошибка загрузки категорий')
        }
        
    } catch (error) {
        console.error('Ошибка загрузки категорий:', error)
        toast.error('Ошибка при загрузке категорий: ' + error.message)
        categories.value = []
    } finally {
        isLoading.value = false
        isInitialLoad.value = false
    }
}

// Создание категории
const createCategory = async (categoryData) => {
    try {
        const response = await apiClient.post(endpoints.project_ed.categories.create, categoryData)
        if (response.success) {
            return response.data
        } else {
            throw new Error(response.message || 'Ошибка создания категории')
        }
    } catch (error) {
        console.error('Ошибка создания категории:', error)
        throw error
    }
}

// Обновление категории
const updateCategory = async (id, categoryData) => {
    try {
        const response = await apiClient.put(endpoints.project_ed.categories.update(id), categoryData)
        if (response.success) {
            return response.data
        } else {
            throw new Error(response.message || 'Ошибка обновления категории')
        }
    } catch (error) {
        console.error('Ошибка обновления категории:', error)
        throw error
    }
}

// Удаление категории
const deleteCategoryAPI = async (id) => {
    try {
        const response = await apiClient.delete(endpoints.project_ed.categories.delete(id))
        if (response.success) {
            return response.data
        } else {
            throw new Error(response.message || 'Ошибка удаления категории')
        }
    } catch (error) {
        throw error
    }
}

const categoryFormData = ref({
    name: '',
    order: 0,
    hasSubcategories: false,
    subcategories: ['']
})

// Открытие модального окна для создания категории
const openCreateCategoryModal = () => {
    editingCategory.value = null
    categoryFormData.value = {
        name: '',
        order: categories.value.length,
        hasSubcategories: false,
        subcategories: ['']
    }
    showCategoryModal.value = true
}

// Открытие модального окна для редактирования категории
const editCategory = (category) => {
    editingCategory.value = category
    
    // Находим текущую позицию категории в списке
    const sortedCategories = [...categories.value].sort((a, b) => a.order - b.order)
    const currentIndex = sortedCategories.findIndex(cat => cat.id === category.id)
    
    
    categoryFormData.value = {
        name: category.name,
        order: currentIndex !== -1 ? currentIndex : 0,
        hasSubcategories: category.subcategories && category.subcategories.length > 0,
        subcategories: category.subcategories && category.subcategories.length > 0 
            ? category.subcategories.map(sub => sub.name || sub) 
            : ['']
    }
    showCategoryModal.value = true
}

// Закрытие модального окна категории
const closeCategoryModal = () => {
    showCategoryModal.value = false
    editingCategory.value = null
}

// Добавление строки подкатегории
const addSubcategory = () => {
    categoryFormData.value.subcategories.push('')
}

// Удаление строки подкатегории
const removeSubcategory = (index) => {
    if (categoryFormData.value.subcategories.length > 1) {
        categoryFormData.value.subcategories.splice(index, 1)
    }
}

// Сохранение категории
const saveCategory = async () => {
    if (!categoryFormData.value.name.trim()) {
        toast.error('Название категории обязательно для заполнения')
        return
    }
    
    try {
        isLoading.value = true
    
    const categoryData = {
        name: categoryFormData.value.name.trim(),
        description: '',
        order: categoryFormData.value.order,
        is_active: true,
        subcategories: categoryFormData.value.hasSubcategories 
            ? categoryFormData.value.subcategories.filter(sub => sub.trim() !== '')
            : []
    }
    
    
    if (editingCategory.value) {
        // Редактирование существующей категории
        // Находим текущую позицию в отсортированном списке
        const sortedCategories = [...categories.value].sort((a, b) => a.order - b.order)
        const currentIndex = sortedCategories.findIndex(cat => cat.id === editingCategory.value.id)
        const oldOrder = currentIndex
        const newOrder = categoryFormData.value.order
        
        
        // Если позиция изменилась, обновляем порядок через специальный эндпоинт
        if (oldOrder !== newOrder) {
            // Отправляем индекс как новый порядок (0, 1, 2...)
            await updateCategoryOrder(editingCategory.value.id, oldOrder, newOrder)
            // После обновления порядка перезагружаем список и закрываем модалку
            await loadCategories()
            closeCategoryModal()
            return
        }
        
        // Если позиция не изменилась, обновляем только данные категории
        const updatedCategory = await updateCategory(editingCategory.value.id, categoryData)
        toast.success('Категория успешно обновлена')
    } else {
        // Создание новой категории
        const newCategory = await createCategory(categoryData)
        toast.success('Категория успешно создана')
    }
    
    // Перезагружаем список категорий для получения актуальных данных
    await loadCategories()
    closeCategoryModal()
    } catch (error) {
        toast.error('Ошибка при сохранении категории: ' + error.message)
    } finally {
        isLoading.value = false
    }
}

// Удаление категории
const deleteCategory = (id) => {
    const category = categories.value.find(c => c.id === id)
    if (!category) return
    
    // Если категория не используется, удаляем сразу
    if (getCategoryIndicatorsCount(category) === 0) {
        performDelete(id)
        return
    }
    
    // Если используется, показываем модальное окно подтверждения
    categoryToDelete.value = category
    showDeleteModal.value = true
}

// Выполнение удаления
const performDelete = async (id) => {
    try {
        isLoading.value = true
        await deleteCategoryAPI(id)
        // Перезагружаем список категорий для получения актуальных данных
        await loadCategories()
        toast.success('Категория успешно удалена')
    } catch (error) {
        if (error.message.includes('используется')) {
            toast.error('Категория не может быть удалена: ' + error.message)
        } else {
            toast.error('Ошибка при удалении категории: ' + error.message)
        }
    } finally {
        isLoading.value = false
    }
}

// Подтверждение удаления
const confirmDelete = async () => {
    if (categoryToDelete.value) {
        await performDelete(categoryToDelete.value.id)
        closeDeleteModal()
    }
}

// Закрытие модального окна удаления
const closeDeleteModal = () => {
    showDeleteModal.value = false
    categoryToDelete.value = null
}

// Получение количества показателей для категории
const getCategoryIndicatorsCount = (category) => {
    return category.indicators_count || 0
}

// Получение количества показателей для подкатегории
const getSubcategoryIndicatorsCount = (category, subcategory) => {
    // Если subcategory - это объект, возвращаем его indicators_count
    if (typeof subcategory === 'object' && subcategory !== null) {
        return subcategory.indicators_count || 0
    }
    // Если subcategory - это строка, ищем объект подкатегории
    const subcategoryObj = category.subcategories?.find(sub => sub.name === subcategory)
    return subcategoryObj?.indicators_count || 0
}

// Получение доступных позиций для категории (исключая текущую редактируемую)
const getAvailablePositions = () => {
    if (!editingCategory.value) {
        return categories.value
    }
    return categories.value.filter(cat => cat.id !== editingCategory.value.id)
}

// Получение правильной позиции для отображения
const getPositionOptions = () => {
    const sortedCategories = [...categories.value].sort((a, b) => a.order - b.order)
    const options = []
    
    // Создаем список категорий без редактируемой
    const categoriesWithoutEditing = editingCategory.value 
        ? sortedCategories.filter(cat => cat.id !== editingCategory.value.id)
        : sortedCategories

    // Находим текущую позицию редактируемой категории в списке без неё
    let currentPositionInFilteredList = -1
    if (editingCategory.value) {
        // Находим, на какой позиции была бы редактируемая категория в списке без неё
        const editingCategoryOrder = editingCategory.value.order
        currentPositionInFilteredList = categoriesWithoutEditing.filter(cat => cat.order < editingCategoryOrder).length
    }

    // Генерируем опции для всех возможных позиций
    for (let i = 0; i <= categoriesWithoutEditing.length; i++) {
        let label = ''
        
        if (editingCategory.value) {
            // При редактировании
            if (i === currentPositionInFilteredList) {
                label = `${i + 1}. (Текущая позиция)`
            } else if (i < categoriesWithoutEditing.length) {
                // Если вставляем перед существующей категорией
                const categoryAtThisSpot = categoriesWithoutEditing[i]
                label = `${i + 1}. (Перед "${categoryAtThisSpot.name}")`
            } else {
                // Если вставляем в конец
                label = `${i + 1}. (В конец списка)`
            }
        } else {
            // При создании новой категории
            if (i < categoriesWithoutEditing.length) {
                const categoryAtThisSpot = categoriesWithoutEditing[i]
                label = `${i + 1}. (Перед "${categoryAtThisSpot.name}")`
            } else {
                label = `${i + 1}. (В конец списка)`
            }
        }

        options.push({
            value: i,
            label: label,
        })
    }
    
    return options
}

// Получение текущей позиции редактируемой категории
const getCurrentCategoryPosition = () => {
    if (!editingCategory.value) return 0
    
    // Сортируем категории по порядку
    const sortedCategories = [...categories.value].sort((a, b) => a.order - b.order)
    
    // Находим индекс текущей категории в отсортированном списке
    const currentIndex = sortedCategories.findIndex(cat => cat.id === editingCategory.value.id)
    
    return currentIndex !== -1 ? `Позиция ${currentIndex + 1}` : 'Позиция 1'
}

// Обновление порядка категорий при изменении позиции
const updateCategoryOrder = async (categoryId, oldOrder, newOrder) => {
    try {
        isUpdatingOrder.value = true
        
        // Используем новый эндпоинт для обновления порядка
        const response = await apiClient.patch(endpoints.project_ed.categories.updateOrder(categoryId), {
            order: newOrder
        })
        
        if (response.success) {
            toast.success('Позиция категории успешно изменена')
        } else {
            throw new Error(response.message || 'Ошибка обновления порядка')
        }
    } catch (error) {
        toast.error('Ошибка при изменении позиции: ' + error.message)
        throw error
    } finally {
        isUpdatingOrder.value = false
    }
}

// Функция для получения текста popover'а
const getPopoverText = (count, isSubcategory = false) => {
    if (count === 0) {
        return `Еще ни один целевой показатель не использует эту ${isSubcategory ? 'подкатегорию' : 'категорию'}`
    }
    
    const countText = count === 1 ? 'показатель' : 
                     count < 5 ? 'показателя' : 'показателей'
    
    return `${count} целевых ${countText} указаны в этой ${isSubcategory ? 'подкатегории' : 'категории'}`
}

// Функция для создания popover'а
const createPopover = (element, text) => {
    const popover = document.createElement('div')
    popover.className = 'custom-popover'
    popover.innerHTML = `
        <div class="custom-popover-arrow"></div>
        <div class="custom-popover-content">
            ${text}
        </div>`
    document.body.appendChild(popover)
    popoverElements.value.push(popover)
    
    // Показываем popover при наведении
    element.addEventListener('mouseenter', () => {
        const rect = element.getBoundingClientRect()
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft
        const scrollY = window.pageYOffset || document.documentElement.scrollTop
        
        popover.style.display = 'block'
        
        // Позиционируем popover относительно элемента
        const popoverLeft = rect.left + scrollX + (rect.width / 2) - (popover.offsetWidth / 2)
        const popoverTop = rect.top + scrollY - popover.offsetHeight - 8
        
        popover.style.left = Math.max(10, popoverLeft) + 'px'
        popover.style.top = Math.max(10, popoverTop) + 'px'
    })
    
    // Скрываем popover при уходе курсора
    element.addEventListener('mouseleave', () => {
        popover.style.display = 'none'
    })
    
    // Скрываем popover при уходе с самого popover
    popover.addEventListener('mouseleave', () => {
        popover.style.display = 'none'
    })
    
    // Обработка изменения размера окна
    const handleResize = () => {
        if (popover.style.display === 'block') {
            const rect = element.getBoundingClientRect()
            const scrollX = window.pageXOffset || document.documentElement.scrollLeft
            const scrollY = window.pageYOffset || document.documentElement.scrollTop
            
            const popoverLeft = rect.left + scrollX + (rect.width / 2) - (popover.offsetWidth / 2)
            const popoverTop = rect.top + scrollY - popover.offsetHeight - 8
            
            popover.style.left = Math.max(10, popoverLeft) + 'px'
            popover.style.top = Math.max(10, popoverTop) + 'px'
        }
    }
    
    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleResize)
    
    // Сохраняем обработчики для очистки
    popover._resizeHandler = handleResize
    
    return popover
}

// Инициализация popover'ов
const initializePopovers = () => {
    nextTick(() => {
        // Popover для всех элементов с количеством показателей
        const indicatorElements = document.querySelectorAll('.indicators-count')
        
        indicatorElements.forEach(element => {
            const isCategory = element.getAttribute('data-is-category') === 'true'
            const isSubcategory = element.getAttribute('data-is-subcategory') === 'true'
            const count = parseInt(element.getAttribute('data-count')) || 0
            
            let text = ''
            if (isCategory) {
                text = getPopoverText(count, false)
            } else if (isSubcategory) {
                text = getPopoverText(count, true)
            }
            
            if (text) {
                createPopover(element, text)
            }
        })
    })
}

// Очистка popover'ов
const cleanupPopovers = () => {
    popoverElements.value.forEach(popover => {
        if (popover._resizeHandler) {
            window.removeEventListener('resize', popover._resizeHandler)
            window.removeEventListener('scroll', popover._resizeHandler)
        }
        popover.remove()
    })
    popoverElements.value = []
}

// Следим за изменениями категорий и переинициализируем popover'ы
watch(categories, () => {
    nextTick(() => {
        cleanupPopovers()
        initializePopovers()
    })
}, { deep: true })

// Lifecycle hooks
onMounted(async () => {
    // Небольшая задержка для демонстрации анимации загрузки
    await new Promise(resolve => setTimeout(resolve, 300))
    await loadCategories()
    initializePopovers()
})

onUnmounted(() => {
    cleanupPopovers()
})

// Экспортируем функцию для открытия модального окна
defineExpose({
    openCreateCategoryModal
})
</script>

<style scoped lang="scss">
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
    vertical-align: middle;
}

.table td {
    vertical-align: middle;
}

.btn-group-sm > .btn {
    padding: 0.25rem 0.5rem;
}

.btn-sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
    border-radius: 0.375rem;
}

.badge {
    font-size: 0.75em;
}

.subcategories-container {
    max-width: 300px;
    max-height: 120px;
    overflow-y: auto;
    overflow-x: hidden;
}

.subcategory-item {
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    padding: 4px 8px;
    margin-bottom: 4px;
    font-size: 0.875rem;
    color: #495057;
    word-wrap: break-word;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: help;
    transition: background-color 0.2s ease;
}

.subcategory-item:hover {
    background-color: #e9ecef;
}

.subcategory-item:last-child {
    margin-bottom: 0;
}

.category-main-row {
    background-color: #f8f9fa;
    border-left: 3px solid #0d6efd;
}

.category-main-row:hover {
    background-color: #e9ecef;
}

.clickable-row {
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.clickable-row:hover {
    background-color: #e3f2fd !important;
    border-left-color: #1976d2;
}

.subcategory-row {
    background-color: #ffffff;
    border-left: 3px solid #dee2e6;
}

.subcategory-row:hover {
    background-color: #f8f9fa;
}

.category-name {
    font-weight: 600;
    color: #212529;
    font-size: 0.95rem;
}

.subcategory-name {
    color: #6c757d;
    font-size: 0.9rem;
}

.subcategory-number {
    color: #6c757d;
    font-weight: 500;
    font-size: 0.9rem;
}

.indicators-count {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #0d6efd;
    font-size: 0.9rem;
}

.subcategory-count {
    color: #6c757d;
    font-size: 0.85rem;
}

.indicators-count svg {
    color: inherit;
}

.indicators-number {
    cursor: help;
    transition: text-decoration 0.2s ease;
    
    &:hover {
        text-decoration: underline;
        text-decoration-style: dotted;
        text-underline-offset: 3px;
    }
}

// Стили для кастомного popover
:global(.custom-popover) {
    position: absolute;
    z-index: 9999;
    display: none;
    max-width: 300px;
    padding: 0;
    background: #212529;
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    font-size: 0.875rem;
    line-height: 1.4;
}

:global(.custom-popover-arrow) {
    position: absolute;
    bottom: -6px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid #212529;
}

:global(.custom-popover-content) {
    padding: 12px 16px;
    text-align: center;
}

// Стили для модального окна удаления
.delete-warning {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem 0;
}

.warning-icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    background: #fff3cd;
    border-radius: 50%;
    border: 2px solid #ffc107;
}

.warning-content {
    flex: 1;
    min-width: 0;
}

.warning-title {
    color: #212529;
    font-weight: 600;
    margin-bottom: 1rem;
    font-size: 1.1rem;
}

.warning-text {
    color: #6c757d;
    margin-bottom: 1rem;
    line-height: 1.5;
}

.subcategories-info {
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    padding: 1rem;
    margin-top: 1rem;
}

.subcategories-list {
    margin: 0;
    padding-left: 1.5rem;
    list-style-type: disc;
}

.subcategory-item {
    margin-bottom: 0.5rem;
    color: #495057;
    line-height: 1.4;
    
    &:last-child {
        margin-bottom: 0;
    }
}

.usage-count {
    color: #dc3545;
    font-weight: 500;
    font-size: 0.9em;
}

.table tbody tr {
    height: auto;
    min-height: 48px;
}

.table tbody td {
    padding: 12px 8px;
    line-height: 1.4;
}

.category-main-row td {
    padding: 16px 8px;
}

.subcategory-row td {
    padding: 8px 8px;
}

// Стили для модального окна редактирования
.modal-body .form-text {
    font-size: 0.875rem;
    color: #6c757d;
    margin-top: 0.25rem;
}

.modal-body .form-label {
    font-weight: 600;
    color: #495057;
    margin-bottom: 0.5rem;
}

.modal-body .form-control,
.modal-body .form-select {
    border-radius: 0.375rem;
    border: 1px solid #ced4da;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.modal-body .form-control:focus,
.modal-body .form-select:focus {
    border-color: #86b7fe;
    outline: 0;
    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.modal-body .form-check-input:checked {
    background-color: #0d6efd;
    border-color: #0d6efd;
}

// Стили для анимации загрузки
.loading-spinner {
    display: flex;
    justify-content: center;
    align-items: center;
    animation: pulse 1.5s ease-in-out infinite;
}

.loading-spinner-sm {
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.loading-spinner .spinner-border {
    width: 3rem;
    height: 3rem;
    border-width: 0.3em;
    animation: spin 1s linear infinite;
}

.loading-spinner-sm .spinner-border {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
}

// Дополнительные стили для плавности
.spinner-border {
    border: 0.25em solid currentColor;
    border-right-color: transparent;
    border-radius: 50%;
    display: inline-block;
    vertical-align: -0.125em;
}

.spinner-border-sm {
    width: 1rem;
    height: 1rem;
    border-width: 0.125em;
}

// Оверлей загрузки при обновлении порядка
.loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.9);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 10;
    border-radius: 0.375rem;
}

.updating-order {
    position: relative;
}

// Анимация для плавного появления/исчезновения
.loading-overlay {
    animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}
</style>
