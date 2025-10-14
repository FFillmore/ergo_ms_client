<template>
    <div v-if="isOpen" class="modal d-block" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">{{ isEditMode ? 'Редактирование блока мероприятий' : 'Создание блока мероприятий' }}</h5>
                    <button type="button" class="btn-close" aria-label="Close" @click="closeModal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label">Код блока <span class="text-danger">*</span></label>
                        <input v-model="formData.code" type="text" class="form-control" placeholder="МП1" required />
                        <div class="form-text">Введите код блока мероприятий (например: МП1, МП2, и т.д.)</div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Название блока <span class="text-danger">*</span></label>
                        <textarea v-model="formData.title" class="form-control" rows="3" placeholder="Воспитательная деятельность (например)" style="resize: vertical;" required></textarea>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Наименование политики <span class="text-danger">*</span></label>
                        <select v-model="formData.subcategoryId" class="form-select" required>
                            <option v-if="!formData.subcategoryId" value="" disabled>Не указана</option>
                            <option v-for="subcategory in availableSubcategories" :key="subcategory.id" :value="subcategory.id">
                                {{ subcategory.name }}
                            </option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-secondary" @click="closeModal">Отмена</button>
                    <button type="button" class="btn btn-primary" @click="saveBlock">
                        {{ isEditMode ? 'Сохранить' : 'Создать' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
    <div v-if="isOpen" class="modal-backdrop fade show"></div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useToast } from 'vue-toastification'
import { apiClient } from '@/js/api/manager'
import { endpoints } from '@/js/api/endpoints'

const props = defineProps({
    isOpen: {
        type: Boolean,
        default: false
    },
    isEditMode: {
        type: Boolean,
        default: false
    },
    blockData: {
        type: Object,
        default: () => ({})
    }
})

const emit = defineEmits(['close', 'save'])

const toast = useToast()

const formData = ref({
    code: '',
    title: '',
    categoryId: '',
    subcategoryId: ''
})

const allSubcategories = ref([])

// Загрузка всех подкатегорий
const loadSubcategories = async () => {
    try {
        const response = await apiClient.get(endpoints.project_ed.subcategories.list)
        const data = Array.isArray(response?.data) ? response.data : (response?.results || [])
        allSubcategories.value = data
    } catch (error) {
        console.error('Ошибка загрузки подкатегорий:', error)
        toast.error('Ошибка при загрузке подкатегорий: ' + (error.message || ''))
        allSubcategories.value = []
    }
}

// Доступные подкатегории (все)
const availableSubcategories = computed(() => {
    return allSubcategories.value
})

// Функция для восстановления подкатегории
const restoreSubcategory = () => {
    if (props.isEditMode && props.blockData) {
        const savedSubcategoryId = props.blockData.subcategoryId || props.blockData.subcategory || ''
        console.log('Trying to restore subcategory:', savedSubcategoryId)
        console.log('Available subcategories:', availableSubcategories.value)
        
        if (savedSubcategoryId && availableSubcategories.value.some(sub => sub.id === savedSubcategoryId)) {
            console.log('Found matching subcategory, setting it')
            formData.value.subcategoryId = savedSubcategoryId
            return true
        }
    }
    return false
}

// Следим за изменением доступных подкатегорий и восстанавливаем выбор при редактировании
watch(() => availableSubcategories.value, (newSubcategories) => {
    if (newSubcategories.length > 0) {
        nextTick(() => {
            restoreSubcategory()
        })
    }
})

// Инициализация формы при открытии модального окна
watch(() => props.isOpen, (isOpen) => {
    if (isOpen) {
        if (props.isEditMode && props.blockData) {
            // Режим редактирования
            const subcategoryId = props.blockData.subcategoryId || props.blockData.subcategory || ''
            
            console.log('Edit mode - blockData:', props.blockData)
            console.log('Edit mode - subcategoryId:', subcategoryId)
            
            formData.value = {
                code: props.blockData.code || '',
                title: props.blockData.title || '',
                categoryId: '',
                subcategoryId: subcategoryId
            }
            
            console.log('Edit mode - formData after init:', formData.value)
        } else {
            // Режим создания
            formData.value = {
                code: '',
                title: '',
                categoryId: '',
                subcategoryId: ''
            }
        }
    }
})

// Следим за загрузкой подкатегорий и восстанавливаем подкатегорию при редактировании
watch(() => allSubcategories.value.length, (newLength) => {
    if (newLength > 0 && props.isEditMode && props.blockData) {
        console.log('Subcategories loaded, trying to restore subcategory')
        nextTick(() => {
            if (!restoreSubcategory()) {
                // Если не удалось восстановить сразу, пробуем через небольшую задержку
                setTimeout(() => {
                    restoreSubcategory()
                }, 100)
            }
        })
    }
})

// Сохранение блока
const saveBlock = () => {
    if (!formData.value.title.trim() || !formData.value.code.trim() || !formData.value.subcategoryId) {
        toast.warning('Заполните все обязательные поля')
        return
    }

    // Находим выбранную подкатегорию
    const selectedSubcategory = formData.value.subcategoryId
        ? availableSubcategories.value.find(sub => sub.id === formData.value.subcategoryId)
        : null

    const blockData = {
        code: formData.value.code.trim(),
        title: formData.value.title.trim(),
        description: '',
        categoryId: '',
        categoryName: '',
        subcategoryId: formData.value.subcategoryId || null,
        subcategoryName: selectedSubcategory?.name || null,
        ...(props.isEditMode && props.blockData ? { id: props.blockData.id } : {})
    }

    emit('save', blockData)
}

// Закрытие модального окна
const closeModal = () => {
    emit('close')
}

// Загружаем подкатегории при инициализации компонента
onMounted(() => {
    loadSubcategories()
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

.form-text {
    font-size: 0.875rem;
    color: #6c757d;
    margin-top: 0.25rem;
}

.form-label {
    font-weight: 600;
    color: #495057;
    margin-bottom: 0.5rem;
}

.form-control,
.form-select {
    border-radius: 0.375rem;
    border: 1px solid #ced4da;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-control:focus,
.form-select:focus {
    border-color: #86b7fe;
    outline: 0;
    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}
</style>
