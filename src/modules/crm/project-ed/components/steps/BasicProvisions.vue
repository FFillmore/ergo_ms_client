<template>
    <div class="basic-provisions">
        <div class="step-header">
            <h2 class="step-title">Основные положения</h2>
            <p class="step-description">
                Заполните основную информацию о проекте
            </p>
        </div>

        <div class="form-content">
            <form @submit.prevent="proceed" class="provisions-form">
                <!-- Наименование проекта -->
                <div class="form-section">
                    <div class="form-group">
                        <label for="projectName" class="form-label required">
                            Наименование проекта
                            <HelpCircle 
                                ref="infoIconRef"
                                class="info-icon" 
                                :size="16"
                            />
                        </label>
                        <textarea
                            id="projectName"
                            ref="projectNameTextarea"
                            v-model="localProvisions.projectName"
                            class="form-textarea readonly-input auto-resize"
                            placeholder="Код мероприятия-год-инициалы РП(ФИО) наименование мероприятия"
                            readonly
                            required
                            rows="1"
                            @input="autoResizeTextarea(projectNameTextarea)"
                        ></textarea>
                        <div v-if="errors.projectName" class="error-message">
                            {{ errors.projectName }}
                        </div>
                        <input
                            v-model="localProvisions.projectNameClarification"
                            type="text"
                            class="form-input clarification-field"
                            placeholder="(уточняющее название)"
                        />
                        <!-- Комментарий для экспертов -->
                        <div v-if="showComments" class="comment-section">
                            <textarea
                                v-model="localProvisions.comments.projectName"
                                class="comment-input"
                                placeholder="Комментарий эксперта..."
                                rows="2"
                            ></textarea>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="shortName" class="form-label required">
                            Краткое наименование проекта
                            <HelpCircle 
                                ref="shortNameInfoIconRef"
                                class="info-icon" 
                                :size="16"
                            />
                        </label>
                        <input
                            id="shortName"
                            v-model="localProvisions.shortName"
                            type="text"
                            class="form-input readonly-input"
                            placeholder="Код мероприятия-год-инициалы РП"
                            readonly
                            required
                        />
                        <div v-if="errors.shortName" class="error-message">
                            {{ errors.shortName }}
                        </div>
                        <!-- Комментарий для экспертов -->
                        <div v-if="showComments" class="comment-section">
                            <textarea
                                v-model="localProvisions.comments.shortName"
                                class="comment-input"
                                placeholder="Комментарий эксперта..."
                                rows="2"
                            ></textarea>
                        </div>
                    </div>
                </div>

                <!-- Цель проекта -->
                <div class="form-section">
                    <div class="form-group">
                        <label for="projectGoal" class="form-label required">
                            Цель проекта
                        </label>
                        <textarea
                            id="projectGoal"
                            v-model="localProvisions.projectGoal"
                            class="form-textarea"
                            rows="4"
                            placeholder="Опишите основную цель проекта"
                            required
                        ></textarea>
                        <div v-if="errors.projectGoal" class="error-message">
                            {{ errors.projectGoal }}
                        </div>
                        <!-- Комментарий для экспертов -->
                        <div v-if="showComments" class="comment-section">
                            <textarea
                                v-model="localProvisions.comments.projectGoal"
                                class="comment-input"
                                placeholder="Комментарий эксперта..."
                                rows="2"
                            ></textarea>
                        </div>
                    </div>
                </div>

                <!-- Задачи проекта -->
                <div class="form-section">
                    <div class="form-group">
                        <label class="form-label required">Задачи проекта</label>
                        <div class="tasks-list">
                            <div 
                                v-for="(task, index) in localProvisions.projectTasks" 
                                :key="index" 
                                class="task-item"
                            >
                                <div class="task-number">{{ index + 1 }}</div>
                                <textarea
                                    v-model="localProvisions.projectTasks[index]"
                                    class="form-textarea task-input"
                                    rows="2"
                                    :placeholder="`Задача ${index + 1}`"
                                    required
                                ></textarea>
                                <button 
                                    v-if="localProvisions.projectTasks.length > 1"
                                    type="button" 
                                    class="remove-task-btn"
                                    @click="removeTask(index)"
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                        <button 
                            type="button" 
                            class="add-task-btn"
                            @click="addTask"
                        >
                            + Добавить задачу
                        </button>
                        <div v-if="errors.projectTasks" class="error-message">
                            {{ errors.projectTasks }}
                        </div>
                        <!-- Комментарий для экспертов -->
                        <div v-if="showComments" class="comment-section">
                            <textarea
                                v-model="localProvisions.comments.projectTasks"
                                class="comment-input"
                                placeholder="Комментарий эксперта..."
                                rows="2"
                            ></textarea>
                        </div>
                    </div>
                </div>

                <!-- Даты проекта -->
                <div class="form-section">
                    <div class="dates-row">
                        <div class="form-group date-group">
                            <label class="form-label required">Дата начала проекта</label>
                            <div class="date-picker-wrapper">
                                <input
                                    ref="startDateInput"
                                    v-model="localProvisions.startDate"
                                    type="date"
                                    class="form-input date-picker"
                                    :min="minDate"
                                    required
                                    @change="validateDateRange"
                                    @click="openCalendar('startDateInput')"
                                />
                            </div>
                            <div v-if="errors.startDate" class="error-message">
                                {{ errors.startDate }}
                            </div>
                        </div>

                        <div class="form-group date-group">
                            <label class="form-label required">Дата окончания проекта</label>
                            <div class="date-picker-wrapper">
                                <input
                                    ref="endDateInput"
                                    v-model="localProvisions.endDate"
                                    type="date"
                                    class="form-input date-picker"
                                    :min="localProvisions.startDate"
                                    required
                                    @change="validateDateRange"
                                    @click="openCalendar('endDateInput')"
                                />
                            </div>
                            <div v-if="errors.endDate" class="error-message">
                                {{ errors.endDate }}
                            </div>
                        </div>
                    </div>
                    <!-- Комментарий для экспертов -->
                    <div v-if="showComments" class="comment-section">
                        <textarea
                            v-model="localProvisions.comments.projectDates"
                            class="comment-input"
                            placeholder="Комментарий эксперта..."
                            rows="2"
                        ></textarea>
                    </div>
                </div>

                <!-- Участники проекта -->
                <ParticipantsSection
                    :curator="localProvisions.curator"
                    :customer="localProvisions.customer"
                    :userInfo="props.userInfo"
                    :showComments="showComments"
                    :errorCurator="errors.curator"
                    :commentsCurator="localProvisions.comments.curator"
                    :commentsCustomer="localProvisions.comments.customer"
                    :commentsManager="localProvisions.comments.manager"
                    @update:curator="val => (localProvisions.curator = val)"
                    @update:customer="val => (localProvisions.customer = val)"
                    @update:commentsCurator="val => (localProvisions.comments.curator = val)"
                    @update:commentsCustomer="val => (localProvisions.comments.customer = val)"
                    @update:commentsManager="val => (localProvisions.comments.manager = val)"
                />

                <!-- Исполнители проекта -->
                <div class="form-section">
                    <div class="form-group">
                        <label class="form-label required">Исполнители проекта</label>
                        <ExecutorSelector
                            v-model="localProvisions.executors"
                            :available-users="availablePersons"
                        />
                        <div v-if="errors.executors" class="error-message">
                            {{ errors.executors }}
                        </div>
                        <!-- Комментарий для экспертов -->
                        <div v-if="showComments" class="comment-section">
                            <textarea
                                v-model="localProvisions.comments.executors"
                                class="comment-input"
                                placeholder="Комментарий эксперта..."
                                rows="2"
                            ></textarea>
                        </div>
                    </div>
                </div>

                <!-- Планируемые результаты -->
                <div class="form-section">
                    <div class="form-group">
                        <label class="form-label required">Планируемые результаты проекта</label>
                        <div class="results-list">
                            <div 
                                v-for="(result, index) in localProvisions.plannedResults" 
                                :key="index" 
                                class="result-item"
                            >
                                <div class="result-number">{{ index + 1 }}</div>
                                <textarea
                                    v-model="localProvisions.plannedResults[index]"
                                    class="form-textarea result-input"
                                    rows="2"
                                    :placeholder="`Результат ${index + 1}`"
                                    required
                                ></textarea>
                                <button 
                                    v-if="localProvisions.plannedResults.length > 1"
                                    type="button" 
                                    class="remove-result-btn"
                                    @click="removeResult(index)"
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                        <button 
                            type="button" 
                            class="add-result-btn"
                            @click="addResult"
                        >
                            + Добавить результат
                        </button>
                        <div v-if="errors.plannedResults" class="error-message">
                            {{ errors.plannedResults }}
                        </div>
                        <!-- Комментарий для экспертов -->
                        <div v-if="showComments" class="comment-section">
                            <textarea
                                v-model="localProvisions.comments.plannedResults"
                                class="comment-input"
                                placeholder="Комментарий эксперта..."
                                rows="2"
                            ></textarea>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { generateInitials, generateProjectName, generateShortProjectName } from '@/modules/crm/project-ed/components/steps/js/initialsGenerator.js'
import { HelpCircle } from 'lucide-vue-next'
import ParticipantsSection from '@/modules/crm/project-ed/components/steps/ParticipantsSection.vue'
import ExecutorSelector from '@/modules/crm/project-ed/components/ExecutorSelector.vue'
import { apiClient } from '@/js/api/manager.js'
import { endpoints } from '@/js/api/endpoints.js'

const props = defineProps({
    provisions: {
        type: Object,
        required: true
    },
    userRole: {
        type: String,
        default: null
    },
    selectedEvent: {
        type: Object,
        default: null
    },
    userInfo: {
        type: Object,
        default: null
    },
    rectorInfo: {
        type: Object,
        default: null
    }
})

const emit = defineEmits(['update:provisions'])

// Ref для textarea наименования проекта
const projectNameTextarea = ref(null)

// Ref для date picker'ов
const startDateInput = ref(null)
const endDateInput = ref(null)

// Ref для иконки с popover
const infoIconRef = ref(null)
const shortNameInfoIconRef = ref(null)

// Ref для popover элементов
const popoverElement = ref(null)
const shortNamePopoverElement = ref(null)

// Функция для автоматического изменения высоты textarea
const autoResizeTextarea = (textarea) => {
    if (!textarea) return
    
    // Сбрасываем высоту до минимальной
    textarea.style.height = 'auto'
    
    // Получаем высоту содержимого
    const scrollHeight = textarea.scrollHeight
    
    // Устанавливаем минимальную высоту для одной строки (2.5rem)
    const minHeight = 40 // 2.5rem в пикселях
    
    // Устанавливаем максимальную высоту (8rem)
    const maxHeight = 128 // 8rem в пикселях
    
    // Вычисляем оптимальную высоту
    const optimalHeight = Math.max(scrollHeight, minHeight)
    const finalHeight = Math.min(optimalHeight, maxHeight)
    
    // Устанавливаем высоту
    textarea.style.height = finalHeight + 'px'
}

// Определяем, показывать ли комментарии (для экспертов и администраторов)
const showComments = computed(() => {
    return false // Временно скрыты
    // return ['expert', 'admin', 'supervisor'].includes(props.userRole)
})

// Вычисляем минимальную дату (5 лет назад от текущей даты)
const minDate = computed(() => {
    const today = new Date()
    const fiveYearsAgo = new Date(today.getFullYear() - 5, today.getMonth(), today.getDate())
    return fiveYearsAgo.toISOString().split('T')[0]
})

// Функция для конвертации старого формата дат в новый
const convertToDateString = (dateObj) => {
    if (!dateObj || typeof dateObj !== 'object') return ''
    const { day, month, year } = dateObj
    if (!day || !month || !year) return ''
    
    const date = new Date(year, month - 1, day)
    return date.toISOString().split('T')[0]
}

// Функция для конвертации нового формата в старый (для совместимости)
const convertFromDateString = (dateString) => {
    if (!dateString) return { day: '', month: '', year: '' }
    const date = new Date(dateString)
    return {
        day: date.getDate(),
        month: date.getMonth() + 1,
        year: date.getFullYear()
    }
}

// Функция для получения даты по умолчанию (1 число следующего месяца)
const getDefaultStartDate = () => {
    const today = new Date()
    // Получаем следующий месяц
    const nextMonth = today.getMonth() + 1
    const nextYear = nextMonth > 11 ? today.getFullYear() + 1 : today.getFullYear()
    const actualNextMonth = nextMonth > 11 ? 0 : nextMonth
    
    const firstDayOfNextMonth = new Date(nextYear, actualNextMonth, 1)
    // Используем локальную дату вместо UTC
    const year = firstDayOfNextMonth.getFullYear()
    const month = String(firstDayOfNextMonth.getMonth() + 1).padStart(2, '0')
    const day = String(firstDayOfNextMonth.getDate()).padStart(2, '0')
    const result = `${year}-${month}-${day}`
    
    
    return result
}

// Функция для получения даты окончания по умолчанию (31 декабря текущего года)
const getDefaultEndDate = () => {
    const today = new Date()
    const endOfYear = new Date(today.getFullYear(), 11, 31) // 11 = декабрь (0-индексированный)
    // Используем локальную дату вместо UTC
    const year = endOfYear.getFullYear()
    const month = String(endOfYear.getMonth() + 1).padStart(2, '0')
    const day = String(endOfYear.getDate()).padStart(2, '0')
    const result = `${year}-${month}-${day}`
    
    
    return result
}

// Инициализация данных с учетом новой структуры

const localProvisions = ref({
    // Основные поля
    projectName: props.provisions.projectName || '',
    projectNameClarification: props.provisions.projectNameClarification || '',
    shortName: props.provisions.shortName || '',
    projectGoal: props.provisions.projectGoal || '',
    projectTasks: props.provisions.projectTasks || ['', ''],
    startDate: props.provisions.startDate || convertToDateString(props.provisions.startDate) || '',
    endDate: props.provisions.endDate || convertToDateString(props.provisions.endDate) || '',
    curator: props.provisions.curator || null,
    customer: props.provisions.customer || (props.rectorInfo?.name ?? ''), // Автоматически устанавливаем ректора (если есть)
    customerId: props.provisions.customerId || null,
    manager: props.provisions.manager || (
        props.userInfo
            ? (() => {
                const firstName = props.userInfo.first_name || ''
                const lastName = props.userInfo.last_name || ''
                const middleName = props.userInfo.middle_name || ''
                
                // Формируем полное имя: Фамилия Имя Отчество
                const fullName = [lastName, firstName, middleName]
                    .filter(part => part.trim() !== '')
                    .join(' ')
                    .trim()
                
                return fullName || props.userInfo.username || props.userInfo.name || ''
            })()
            : ''
    ), // Автоматически устанавливаем создателя проекта
    executors: props.provisions.executors || [],
    plannedResults: props.provisions.plannedResults || ['', ''],
    
    
    // Комментарии экспертов
    comments: {
        projectName: props.provisions.comments?.projectName || '',
        shortName: props.provisions.comments?.shortName || '',
        projectGoal: props.provisions.comments?.projectGoal || '',
        projectTasks: props.provisions.comments?.projectTasks || '',
        projectDates: props.provisions.comments?.projectDates || '',
        curator: props.provisions.comments?.curator || '',
        customer: props.provisions.comments?.customer || '',
        manager: props.provisions.comments?.manager || '',
        executors: props.provisions.comments?.executors || '',
        plannedResults: props.provisions.comments?.plannedResults || ''
    }
})


const errors = ref({})

// Список доступных пользователей (для модального выбора исполнителей)
const availablePersons = ref([])

// Загрузка пользователей с должностями и аватарами для модального окна исполнителей
async function fetchAvailableUsersForExecutors() {
    try {
        const resp = await apiClient.get('/project_ed/profiles/profiles/', { page_size: 1000 })
        const norm = (r) => Array.isArray(r?.data) ? r.data : (r?.data?.results || [])
        const list = norm(resp)
        const toName = (u) => {
            const firstName = u.first_name || ''
            const lastName = u.last_name || ''
            const middleName = u.middle_name || ''
            
            // Формируем полное имя: Фамилия Имя Отчество
            const fullName = [lastName, firstName, middleName]
                .filter(part => part.trim() !== '')
                .join(' ')
                .trim()
            
            return fullName || u.username || ''
        }
        
        // Фильтруем пользователей: исключаем создателя проекта и пользователей с должностями "ректор" и "проректор"
        const filteredList = list.filter(u => {
            const position = (u.position_name || u.position || '').toLowerCase()
            const isRector = position.includes('ректор')
            const isProrector = position.includes('проректор')
            const isProjectCreator = u.id === props.userInfo?.id
            
            return !isRector && !isProrector && !isProjectCreator
        })
        
        availablePersons.value = filteredList.map(u => ({
            id: u.id,
            name: toName(u),
            position: u.position_name || u.position || 'Сотрудник',
            avatarUrl: u.avatar_url || u.avatar || null,
        }))
    } catch (e) {
        availablePersons.value = []
    }
}

// Данные пользователей/профилей для определения заказчика
const usersForCustomer = ref([])
const profilesForCustomer = ref([])
const customerInfo = ref({ name: '—', position: 'Должность вакантна' })

// Кандидаты и выбор заказчика
const customerCandidates = ref([])
const selectedCustomerId = ref(null)

// Кандидаты в кураторы (Проректоры)
const prorectorCandidates = ref([])

// Куратор выбирается напрямую через v-model в SelectBox

async function resolveCustomerFromApi() {
    try {
        const resp = await apiClient.get('/project_ed/profiles/profiles/leadership/', { position_exact: 'Ректор' })
        const norm = (r) => Array.isArray(r?.data) ? r.data : (r?.data?.results || [])
        const list = norm(resp)
        const toName = (u) => {
            const firstName = u.first_name || ''
            const lastName = u.last_name || ''
            const middleName = u.middle_name || ''
            
            // Формируем полное имя: Фамилия Имя Отчество
            const fullName = [lastName, firstName, middleName]
                .filter(part => part.trim() !== '')
                .join(' ')
                .trim()
            
            return fullName || u.username || ''
        }
        customerCandidates.value = list.map(u => ({
            id: u.id,
            name: toName(u),
            position: u.position_name || null,
        }))

        if (customerCandidates.value.length === 1) {
            const only = customerCandidates.value[0]
            selectedCustomerId.value = only.id
            customerInfo.value = { name: only.name, position: only.position || 'Ректор' }
            localProvisions.value.customer = only.name
        } else if (customerCandidates.value.length === 0) {
            customerInfo.value = { name: '—', position: 'Нет пользователей с ролью «Ректор»' }
        } else {
            customerInfo.value = { name: '—', position: 'Выберите заказчика' }
        }
    } catch (e) {
        customerInfo.value = { name: '—', position: 'Нет пользователей с ролью «Ректор»' }
    }
}

// Подгружаем из БД пользователей с ролью «Проректор» для селекта куратора
async function resolveCuratorsFromApi() {
    try {
        const resp = await apiClient.get('/project_ed/profiles/profiles/leadership/', { position: 'проректор' })
        const norm = (r) => Array.isArray(r?.data) ? r.data : (r?.data?.results || [])
        const list = norm(resp)
        const toName = (u) => {
            const firstName = u.first_name || ''
            const lastName = u.last_name || ''
            const middleName = u.middle_name || ''
            
            // Формируем полное имя: Фамилия Имя Отчество
            const fullName = [lastName, firstName, middleName]
                .filter(part => part.trim() !== '')
                .join(' ')
                .trim()
            
            return fullName || u.username || ''
        }
        prorectorCandidates.value = list.map(u => ({
            id: u.id,
            name: toName(u),
            position: u.position_name || null,
        }))

        if (!prorectorCandidates.value.some(p => String(p.id) === String(localProvisions.value.curator))) {
            localProvisions.value.curator = null
        }
    } catch (e) {
        prorectorCandidates.value = []
        if (localProvisions.value.curator) localProvisions.value.curator = null
    }
}

// Валидация формы
const isFormValid = computed(() => {
    return localProvisions.value.projectName?.trim() !== '' &&
           localProvisions.value.shortName?.trim() !== '' &&
           localProvisions.value.projectGoal?.trim() !== '' &&
           localProvisions.value.projectTasks.some(task => task?.trim() !== '') &&
           localProvisions.value.startDate !== '' &&
           localProvisions.value.endDate !== '' &&
           localProvisions.value.curator !== null &&
           localProvisions.value.executors && localProvisions.value.executors.length > 0 &&
           localProvisions.value.plannedResults.some(result => result?.trim() !== '')
})

// Методы управления списками
const addTask = () => {
    localProvisions.value.projectTasks.push('')
}

const removeTask = (index) => {
    if (localProvisions.value.projectTasks.length > 1) {
        localProvisions.value.projectTasks.splice(index, 1)
    }
}


const addResult = () => {
    localProvisions.value.plannedResults.push('')
}

const removeResult = (index) => {
    if (localProvisions.value.plannedResults.length > 1) {
        localProvisions.value.plannedResults.splice(index, 1)
    }
}

// Валидация формы
const validateForm = () => {
    errors.value = {}
    
    if (!localProvisions.value.projectName?.trim()) {
        errors.value.projectName = 'Наименование проекта обязательно для заполнения'
    }
    
    if (!localProvisions.value.shortName?.trim()) {
        errors.value.shortName = 'Краткое наименование проекта обязательно для заполнения'
    }
    
    if (!localProvisions.value.projectGoal?.trim()) {
        errors.value.projectGoal = 'Цель проекта обязательна для заполнения'
    }
    
    if (!localProvisions.value.projectTasks.some(task => task?.trim() !== '')) {
        errors.value.projectTasks = 'Необходимо заполнить хотя бы одну задачу проекта'
    }
    
    // Валидация дат
    if (!localProvisions.value.startDate) {
        errors.value.startDate = 'Дата начала проекта обязательна для заполнения'
    } else {
        const startDate = new Date(localProvisions.value.startDate)
        const today = new Date()
        const fiveYearsAgo = new Date(today.getFullYear() - 5, today.getMonth(), today.getDate())
        
        if (startDate < fiveYearsAgo) {
            errors.value.startDate = 'Дата начала не может быть более чем на 5 лет раньше текущей даты'
        }
    }
    
    if (!localProvisions.value.endDate) {
        errors.value.endDate = 'Дата окончания проекта обязательна для заполнения'
    }
    
    // Проверка корректности дат
    if (localProvisions.value.startDate && localProvisions.value.endDate) {
        const start = new Date(localProvisions.value.startDate)
        const end = new Date(localProvisions.value.endDate)
        
        if (start >= end) {
            errors.value.startDate = 'Дата начала должна быть раньше даты окончания'
            errors.value.endDate = 'Дата окончания должна быть позже даты начала'
        }
    }
    
    if (!localProvisions.value.curator || localProvisions.value.curator === null) {
        errors.value.curator = 'Необходимо выбрать куратора проекта'
    }
    
    // Заказчик предустановлен (ректор), валидация не нужна
    
    if (!localProvisions.value.executors || localProvisions.value.executors.length === 0) {
        errors.value.executors = 'Необходимо выбрать хотя бы одного исполнителя'
    }
    
    if (!localProvisions.value.plannedResults.some(result => result?.trim() !== '')) {
        errors.value.plannedResults = 'Необходимо заполнить хотя бы один планируемый результат'
    }
    
    return Object.keys(errors.value).length === 0
}

// Порядковый номер проекта в рамках того же мероприятия и года для текущего руководителя
const sequenceNumber = ref(1) // Инициализируем значением по умолчанию

async function fetchSequenceNumber() {
    try {
        if (!props.selectedEvent || !props.userInfo?.name) {
            sequenceNumber.value = 1
            return
        }
        
        const currentYear = new Date().getFullYear()
        const eventCode = props.selectedEvent.code || ''
        
        // Получаем все проекты текущего пользователя
        const resp = await apiClient.get(endpoints.project_ed.projects.list, { 
            page_size: 1000 // Получаем все проекты для точного подсчета
        })
        
        const data = Array.isArray(resp.data) ? resp.data : (resp.data?.results || [])
        
        
        // Функция для проверки, является ли проект аналогичным (тот же код мероприятия, год и руководитель)
        const isSimilarProject = (project) => {
            // Поскольку API не возвращает event.code напрямую, мы будем сравнивать по event_id
            // Для этого нужно получить ID выбранного мероприятия
            if (props.selectedEvent?.id && project.event_id !== props.selectedEvent.id) {
                return false
            }
            
            // Проверяем год проекта
            let projectYear = currentYear
            if (project.start_date) {
                projectYear = new Date(project.start_date).getFullYear()
            } else if (project.created_at) {
                projectYear = new Date(project.created_at).getFullYear()
            }
            
            if (projectYear !== currentYear) {
                return false
            }
            
            // Проверяем руководителя проекта - сравниваем по owner_id (владелец проекта)
            const currentUserId = props.userInfo?.id
            if (currentUserId && project.owner_id !== currentUserId) {
                return false
            }
            
            return true
        }
        
        // Подсчитываем количество аналогичных проектов
        const similarProjectsCount = data.filter(isSimilarProject).length
        
        // Следующий порядковый номер
        sequenceNumber.value = similarProjectsCount + 1
        
        
    } catch (error) {
        console.error('Ошибка при получении порядкового номера проекта:', error)
        sequenceNumber.value = 1
    }
}

// Функции генерации названий с учетом порядкового номера
const generateProjectNameLocal = () => {
    return generateProjectName(props.selectedEvent, props.userInfo, sequenceNumber.value)
}

const generateShortProjectNameLocal = () => {
    return generateShortProjectName(props.selectedEvent, props.userInfo, sequenceNumber.value)
}

// Функция для валидации диапазона дат
const validateDateRange = () => {
    // Очищаем предыдущие ошибки дат
    if (errors.value.startDate && (errors.value.startDate.includes('Дата начала должна быть раньше') || 
        errors.value.startDate.includes('Дата начала не может быть более чем на 5 лет раньше'))) {
        delete errors.value.startDate
    }
    if (errors.value.endDate && errors.value.endDate.includes('Дата окончания должна быть позже')) {
        delete errors.value.endDate
    }
    
    // Проверяем ограничение на 5 лет для даты начала
    if (localProvisions.value.startDate) {
        const startDate = new Date(localProvisions.value.startDate)
        const today = new Date()
        const fiveYearsAgo = new Date(today.getFullYear() - 5, today.getMonth(), today.getDate())
        
        if (startDate < fiveYearsAgo) {
            errors.value.startDate = 'Дата начала не может быть более чем на 5 лет раньше текущей даты'
            return
        }
    }
    
    // Проверяем диапазон дат
    if (localProvisions.value.startDate && localProvisions.value.endDate) {
        const start = new Date(localProvisions.value.startDate)
        const end = new Date(localProvisions.value.endDate)
        
        if (start >= end) {
            errors.value.startDate = 'Дата начала должна быть раньше даты окончания'
            errors.value.endDate = 'Дата окончания должна быть позже даты начала'
        }
    }
}

// Функция для открытия календаря
const openCalendar = (inputRef) => {
    const input = inputRef === 'startDateInput' ? startDateInput.value : endDateInput.value
    if (input) {
        // Фокусируемся на инпуте и открываем календарь
        input.focus()
        input.showPicker && input.showPicker()
    }
}

// Следим за выбором заказчика в SelectBox
watch(selectedCustomerId, (newId) => {
    const found = customerCandidates.value.find(p => p.id === newId)
    if (found) {
        customerInfo.value = { name: found.name, position: found.position || 'Ректор' }
        localProvisions.value.customer = found.name
        localProvisions.value.customerId = found.id
    }
})

// Следим за изменениями выбранного мероприятия и обновляем наименование проекта
watch(() => props.selectedEvent, async (newEvent) => {
    if (newEvent) {
        // Сначала получаем порядковый номер
        await fetchSequenceNumber()
        
        // Затем обновляем названия с учетом нового порядкового номера
        // НО только если это режим создания нового проекта (нет переданного названия)
        if (!props.provisions.projectName || props.provisions.projectName.trim() === '') {
            await nextTick()
            localProvisions.value.projectName = generateProjectNameLocal()
            localProvisions.value.shortName = generateShortProjectNameLocal()
            
            await nextTick()
            autoResizeTextarea(projectNameTextarea.value)
        }
    }
}, { immediate: true })

// Также следим за изменениями порядкового номера и обновляем названия
watch(sequenceNumber, (newSequenceNumber) => {
    if (newSequenceNumber && props.selectedEvent) {
        // Обновляем названия только если это режим создания нового проекта
        if (!props.provisions.projectName || props.provisions.projectName.trim() === '') {
            localProvisions.value.projectName = generateProjectNameLocal()
            localProvisions.value.shortName = generateShortProjectNameLocal()
            nextTick(() => {
                autoResizeTextarea(projectNameTextarea.value)
            })
        }
    }
})

// Следим за изменениями наименования проекта и автоматически изменяем высоту
watch(() => localProvisions.value.projectName, () => {
    nextTick(() => {
        autoResizeTextarea(projectNameTextarea.value)
    })
})

// Следим за изменениями и обновляем родительский компонент
watch(localProvisions, (newValue) => {
    emit('update:provisions', newValue)
}, { deep: true })

// Следим за изменениями props.provisions
watch(() => props.provisions, (newProvisions) => {
    // Обновляем localProvisions при изменении props
    if (newProvisions.projectName !== localProvisions.value.projectName) {
        localProvisions.value.projectName = newProvisions.projectName || ''
    }
}, { deep: true, immediate: true })

// Инициализация высоты textarea при монтировании компонента
onMounted(() => {
    nextTick(() => {
        autoResizeTextarea(projectNameTextarea.value)
        // Инициализация popover
        initializePopover()
        initializeShortNamePopover()
        
        // Устанавливаем даты по умолчанию, если они пустые
        // Проверяем, есть ли валидные даты
        const hasValidStartDate = localProvisions.value.startDate && 
                                 localProvisions.value.startDate !== '' && 
                                 !isNaN(new Date(localProvisions.value.startDate).getTime())
        
        const hasValidEndDate = localProvisions.value.endDate && 
                               localProvisions.value.endDate !== '' && 
                               !isNaN(new Date(localProvisions.value.endDate).getTime())
        
        if (!hasValidStartDate) {
            localProvisions.value.startDate = getDefaultStartDate()
        }
        if (!hasValidEndDate) {
            localProvisions.value.endDate = getDefaultEndDate()
        }
        
        // Дополнительная проверка через nextTick
        nextTick(() => {
            // Принудительно устанавливаем даты, если они все еще пустые
            if (!localProvisions.value.startDate || localProvisions.value.startDate === '') {
                localProvisions.value.startDate = getDefaultStartDate()
            }
            if (!localProvisions.value.endDate || localProvisions.value.endDate === '') {
                localProvisions.value.endDate = getDefaultEndDate()
            }
        })
    })
    
    // Подтягиваем заказчика и кураторов из реальных данных
    resolveCustomerFromApi()
    resolveCuratorsFromApi()
    fetchAvailableUsersForExecutors()
    
    // Инициализируем порядковый номер проекта и обновляем названия
    if (props.selectedEvent) {
        fetchSequenceNumber().then(() => {
            // Обновляем названия только если это режим создания нового проекта
            if (!props.provisions.projectName || props.provisions.projectName.trim() === '') {
                localProvisions.value.projectName = generateProjectNameLocal()
                localProvisions.value.shortName = generateShortProjectNameLocal()
            }
        })
    }
})

// Синхронизация названия заказчика в локальном состоянии
watch(customerInfo, (val) => {
    if (val && typeof val.name === 'string') {
        localProvisions.value.customer = val.name
    } else {
        localProvisions.value.customer = ''
    }
    if (selectedCustomerId.value) {
        localProvisions.value.customerId = selectedCustomerId.value
    }
}, { immediate: true })

// Функция инициализации popover
const initializePopover = () => {
    if (infoIconRef.value) {
        const iconElement = infoIconRef.value.$el || infoIconRef.value
        if (iconElement) {
            
            // Создаем popover элемент
            const popover = document.createElement('div')
            popover.className = 'custom-popover'
            popover.innerHTML = `
                <div class="custom-popover-arrow"></div>
                <div class="custom-popover-content">
                    Заполняется автоматически на основе выбранного мероприятия
                </div>`
            document.body.appendChild(popover)
            popoverElement.value = popover
            
            // Показываем popover при наведении
            iconElement.addEventListener('mouseenter', () => {
                const rect = iconElement.getBoundingClientRect()
                const scrollX = window.pageXOffset || document.documentElement.scrollLeft
                const scrollY = window.pageYOffset || document.documentElement.scrollTop
                
                popover.style.display = 'block'
                
                // Позиционируем popover относительно иконки
                const popoverLeft = rect.left + scrollX + (rect.width / 2) - (popover.offsetWidth / 2)
                const popoverTop = rect.top + scrollY - popover.offsetHeight - 8
                
                popover.style.left = Math.max(10, popoverLeft) + 'px' // Минимум 10px от края
                popover.style.top = Math.max(10, popoverTop) + 'px'   // Минимум 10px от верха
            })
            
            // Скрываем popover при уходе курсора
            iconElement.addEventListener('mouseleave', () => {
                popover.style.display = 'none'
            })
            
            // Скрываем popover при уходе с самого popover
            popover.addEventListener('mouseleave', () => {
                popover.style.display = 'none'
            })
            
            // Обработка изменения размера окна
            const handleResize = () => {
                if (popover.style.display === 'block') {
                    const rect = iconElement.getBoundingClientRect()
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
        }
    }
}

// Функция инициализации popover для краткого наименования
const initializeShortNamePopover = () => {
    if (shortNameInfoIconRef.value) {
        const iconElement = shortNameInfoIconRef.value.$el || shortNameInfoIconRef.value
        if (iconElement) {
            
            // Создаем popover элемент
            const popover = document.createElement('div')
            popover.className = 'custom-popover'
            popover.innerHTML = `
                <div class="custom-popover-arrow"></div>
                <div class="custom-popover-content">
                    Генерируется автоматически на основе кода мероприятия, года и инициалов
                </div>`
            document.body.appendChild(popover)
            shortNamePopoverElement.value = popover
            
            // Показываем popover при наведении
            iconElement.addEventListener('mouseenter', () => {
                const rect = iconElement.getBoundingClientRect()
                const scrollX = window.pageXOffset || document.documentElement.scrollLeft
                const scrollY = window.pageYOffset || document.documentElement.scrollTop
                
                popover.style.display = 'block'
                
                // Позиционируем popover относительно иконки
                const popoverLeft = rect.left + scrollX + (rect.width / 2) - (popover.offsetWidth / 2)
                const popoverTop = rect.top + scrollY - popover.offsetHeight - 8
                
                popover.style.left = Math.max(10, popoverLeft) + 'px' // Минимум 10px от края
                popover.style.top = Math.max(10, popoverTop) + 'px'   // Минимум 10px от верха
            })
            
            // Скрываем popover при уходе курсора
            iconElement.addEventListener('mouseleave', () => {
                popover.style.display = 'none'
            })
            
            // Скрываем popover при уходе с самого popover
            popover.addEventListener('mouseleave', () => {
                popover.style.display = 'none'
            })
            
            // Обработка изменения размера окна
            const handleResize = () => {
                if (popover.style.display === 'block') {
                    const rect = iconElement.getBoundingClientRect()
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
        }
    }
}

// Очистка при размонтировании компонента
onUnmounted(() => {
    if (popoverElement.value) {
        // Удаляем обработчики событий
        if (popoverElement.value._resizeHandler) {
            window.removeEventListener('resize', popoverElement.value._resizeHandler)
            window.removeEventListener('scroll', popoverElement.value._resizeHandler)
        }
        
        popoverElement.value.remove()
        popoverElement.value = null
    }
    
    if (shortNamePopoverElement.value) {
        // Удаляем обработчики событий
        if (shortNamePopoverElement.value._resizeHandler) {
            window.removeEventListener('resize', shortNamePopoverElement.value._resizeHandler)
            window.removeEventListener('scroll', shortNamePopoverElement.value._resizeHandler)
        }
        
        shortNamePopoverElement.value.remove()
        shortNamePopoverElement.value = null
    }
})

</script>

<style scoped lang="scss">
.basic-provisions {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    max-width: 1200px;
}

.step-header {
    text-align: center;
    margin-bottom: 1rem;
}

.step-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--color-primary-text);
    margin: 0 0 0.5rem 0;
}

.step-description {
    color: var(--color-secondary-text);
    margin: 0;
}

.form-content {
    flex: 1;
}

.provisions-form {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.form-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    background: var(--color-primary-background);
    border-radius: 12px;
    padding: 2rem;
    border: 1px solid var(--color-border);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-group {

    &:last-child {
        margin-bottom: 0;
    }
}

.form-label {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-weight: 600;
    color: var(--color-primary-text);
    margin-bottom: 0.75rem;
    font-size: 0.95rem;

    &.required::after {
        content: ' *';
        color: #dc3545;
    }
}

.info-icon {
    color: var(--color-secondary-text);
    cursor: pointer;
    transition: all 0.2s ease;
    display: inline-block;
    vertical-align: middle;
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
}

.form-input,
.form-textarea,
.form-select {
    width: 100%;
    padding: 0.875rem;
    border: 2px solid var(--color-border);
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.3s ease;
    background: var(--color-secondary-background);

    &:focus {
        outline: none;
        border-color: #0d6efd;
        background: var(--color-primary-background);
        box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
    }

    &::placeholder {
        color: var(--color-secondary-text);
    }
}


.form-textarea {
    resize: vertical;
    min-height: 120px;
    line-height: 1.5;
}

// Стили для дат
.dates-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
}

.date-group {
    .date-picker-wrapper {
        position: relative;
        display: flex;
        align-items: center;
        
        .date-picker {
            width: 100%;
            cursor: pointer;
            font-weight: 500;
            color: var(--color-primary-text);
            padding: 0.875rem;
            border: 2px solid var(--color-border);
            border-radius: 8px;
            font-size: 1rem;
            transition: all 0.3s ease;
            background: var(--color-secondary-background);
            
            &:focus {
                outline: none;
                border-color: #0d6efd;
                background: var(--color-primary-background);
                box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
            }
            
            &:hover {
                border-color: #0d6efd;
                background: var(--color-hover-background);
            }
            
            // Скрываем стандартную иконку календаря браузера
            &::-webkit-calendar-picker-indicator {
                opacity: 0;
                position: absolute;
                right: 0;
                width: 100%;
                height: 100%;
                cursor: pointer;
            }
            
            // Для Firefox
            &::-moz-calendar-picker-indicator {
                opacity: 0;
                position: absolute;
                right: 0;
                width: 100%;
                height: 100%;
                cursor: pointer;
            }
        }
    }
}

// Стили для участников
.participants-grid {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.manager-avatar-container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: var(--color-secondary-background);
    border-radius: 8px;
    border: 1px solid var(--color-border);
}

/* Визуальное выравнивание селекта куратора под блок заказчика */
.curator-select:deep(.select-trigger) {
    background: var(--color-secondary-background) !important;
    border: 1px solid var(--color-border) !important;
    border-radius: 8px !important;
    min-height: 56px; /* как у блока с аватаром */
    padding: 0.5rem 0.75rem;
}
.curator-select:deep(.select-trigger:hover),
.curator-select:deep(.select-trigger:focus) {
    background: var(--color-primary-background) !important;
    box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.08);
}
.curator-select:deep(.dropdown-item) {
    padding: 0.5rem 0.75rem;
}
.curator-select:deep(.value-text) {
    white-space: normal;
}

.manager-info {
    flex: 1;
    min-width: 0;
}

.manager-name {
    color: var(--color-primary-text);
    font-size: 0.95rem;
    line-height: 1.2;
}

.manager-position {
    font-size: 0.8rem;
    color: var(--color-secondary-text);
    margin-top: 0.125rem;
    line-height: 1.2;
}

// Стили для текста в селектах (аналогично manager)
.curator-select:deep(.text-truncate) {
    color: var(--color-primary-text);
    font-size: 0.95rem;
    line-height: 1.2;
}

.curator-select:deep(.text-muted) {
    font-size: 0.8rem;
    color: #6c757d;
    margin-top: 0.125rem;
    line-height: 1.2;
}

// Стили для отображения заказчика проекта
.customer-display {
    margin-bottom: 0.5rem;
}

.customer-avatar-container {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem;
    background: var(--color-secondary-background);
    border-radius: 8px;
    border: 1px solid var(--color-border);
}

.customer-info {
    flex: 1;
    min-width: 0;
}

.customer-name {
    font-weight: 600;
    color: var(--color-primary-text);
    font-size: 0.95rem;
    line-height: 1.2;
}

.customer-position {
    font-size: 0.8rem;
    color: var(--color-secondary-text);
    margin-top: 0.125rem;
    line-height: 1.2;
}

.select-wrapper {
    position: relative;
    
    .select-arrow {
        position: absolute;
        right: 1rem;
        top: 50%;
        transform: translateY(-50%);
        pointer-events: none;
        color: var(--color-secondary-text);
        font-size: 0.875rem;
    }
}

// Стили для кастомного выпадающего списка куратора
.curator-dropdown-wrapper {
    position: relative;
    width: 100%;
}

.curator-select-trigger {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid var(--color-border);
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.3s ease;
    background: var(--color-secondary-background);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 56px; // Высота как у руководителя проекта (40px аватар + 16px отступы)
    
    &:hover {
        border-color: #0d6efd;
        background: var(--color-primary-background);
    }
    
    &.is-open {
        border-color: #0d6efd;
        background: var(--color-primary-background);
        box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
    }
}

.curator-selected {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
    min-width: 0;
}

.curator-placeholder {
    color: var(--color-secondary-text);
    flex: 1;
}

.curator-info {
    flex: 1;
    min-width: 0;
}

.curator-name {
    font-weight: 500;
    color: var(--color-primary-text);
    font-size: 0.95rem;
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    
    &--selected {
        font-weight: 600;
    }
}

.curator-position {
    font-size: 0.8rem;
    color: var(--color-secondary-text);
    margin-top: 0.125rem;
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.curator-dropdown-list {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    background: var(--color-primary-background);
    border: 2px solid #0d6efd;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    max-height: 300px;
    overflow-y: auto;
}

.curator-dropdown-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.875rem;
    cursor: pointer;
    transition: background-color 0.2s ease;
    border-bottom: 1px solid var(--color-border);
    
    &:last-child {
        border-bottom: none;
    }
    
    &:hover {
        background-color: var(--color-hover-background);
    }
    
    &:active {
        background-color: var(--color-hover-background);
    }
}

.form-select {
    appearance: none;
    cursor: pointer;
    padding-right: 3rem;
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

// Стили для списков (задачи, результаты)
.tasks-list,
.results-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1rem;
}

.task-item,
.result-item {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
    background: var(--color-secondary-background);
    border-radius: 8px;
    border: 1px solid var(--color-border);
}

.task-number,
.result-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    background: #0d6efd;
    color: white;
    border-radius: 50%;
    font-weight: 600;
    font-size: 0.875rem;
    flex-shrink: 0;
}

.task-input,
.result-input {
    flex: 1;
    margin: 0;
    min-height: 60px;
}

.remove-task-btn,
.remove-result-btn {
    display: flex;
    justify-content: center;
    align-self: center;
    width: 2rem;
    height: 2rem;
    border: none;
    color: white;
    border-radius: 50%;
    cursor: pointer;
    font-size: 1.2rem;
    font-weight: bold;
    background-color: #e28e96;
    transition: all 0.2s ease;
    flex-shrink: 0;

    &:hover {
        background: #c82333;
        transform: scale(1.05);
    }
}

.add-task-btn,
.add-result-btn {
    padding: 0.75rem 1.5rem;
    background: #28a745;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: fit-content;

    &:hover {
        background: #218838;
        transform: translateY(-1px);
    }
}

// Стили для бюджета
.readonly-input {
    background: var(--color-secondary-background) !important;
    cursor: not-allowed;
    color: var(--color-primary-text);
    resize: none;
    
    &:focus {
        box-shadow: none !important;
    }
}

.auto-resize {
    min-height: 2.5rem; // Минимальная высота для одной строки
    max-height: 8rem; // Максимальная высота для ограничения
    overflow: hidden;
    transition: height 0.1s ease;
    line-height: 1.4;
    padding-top: 0.875rem;
    padding-bottom: 0.875rem;
}

.field-note {
    margin-top: 0.5rem;
    font-size: 0.875rem;
    color: var(--color-secondary-text);
    font-style: italic;
}

.clarification-field {
    margin-top: 0.75rem;
}

// Стили для комментариев экспертов
.comment-section {
    margin-top: 1rem;
    padding: 1rem;
    background: #fff3cd;
    border: 1px solid #ffeaa7;
    border-radius: 8px;
    border-left: 4px solid #ffc107;
}

.comment-input {
    background: white !important;
    border: 1px solid #ffeaa7 !important;
    font-size: 0.875rem;
    
    &:focus {
        border-color: #ffc107 !important;
        box-shadow: 0 0 0 2px rgba(255, 193, 7, 0.2) !important;
    }
    
    &::placeholder {
        color: #856404;
        font-style: italic;
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

// Адаптивность
@media (max-width: 1024px) {
    .dates-row {
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }
}

@media (max-width: 768px) {
    .basic-provisions {
        padding: 1rem;
    }
    
    
    .task-item,
    .result-item {
        flex-direction: column;
        gap: 0.75rem;
    }
    
    .task-number,
    .result-number {
        align-self: flex-start;
    }
    
    .budget-input-wrapper {
        flex-direction: column;
        align-items: flex-start;
        max-width: none;
    }
    
    .curator-dropdown-list {
        max-height: 250px;
    }
    
    .curator-name {
        font-size: 0.9rem;
    }
    
    .curator-position {
        font-size: 0.75rem;
    }
}

@media (max-width: 480px) {
    .form-section {
        padding: 1.5rem;
    }
    
    .date-picker-wrapper {
        width: 100%;
    }
}
</style>
