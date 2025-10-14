<template>
    <div class="page-container">
        <HeaderBar />
        <Breadcrumbs :items="breadcrumbItems" class="mt-3" />
        <div class="page-content">
            <div class="d-flex align-items-center justify-content-between">
                <h3 class="mb-0">Импорт блоков мероприятий</h3>
            </div>

            <div class="row mb-4">
                <div class="col-12 col-lg-8">
                     <div class="card mb-4 upload-card">
                        <div class="card-header">
                            <h5 class="mb-0">Загрузка Excel файла</h5>
                        </div>
                        <div class="card-body">
                            <div 
                                class="upload-area"
                                :class="{ 'is-dragover': isDragOver, 'has-file': selectedFile }"
                                @drop="handleDrop"
                                @dragover="handleDragOver"
                                @dragleave="handleDragLeave"
                                @click="triggerFileInput"
                            >
                                <input
                                    ref="fileInput"
                                    type="file"
                                    accept=".xlsx,.xls"
                                    @change="handleFileSelect"
                                    style="display: none"
                                />
                                
                                <div v-if="!selectedFile" class="upload-placeholder">
                                    <Upload :size="48" class="mb-3" />
                                    <h5>Перетащите Excel файл сюда</h5>
                                    <p class="text-muted mb-3">или нажмите для выбора файла</p>
                                    <button class="btn btn-outline-primary">Выбрать файл</button>
                                </div>
                                
                                <div v-else class="file-selected">
                                    <FileText :size="48" class="mb-3" />
                                    <h5>{{ selectedFile.name }}</h5>
                                    <p class="text-muted mb-3">
                                        Размер: {{ formatFileSize(selectedFile.size) }}
                                    </p>
                                    <div v-if="!importResults" class="d-flex gap-2">
                                        <button class="btn btn-outline-danger btn-sm" @click="removeFile">
                                            Удалить
                                        </button>
                                        <button class="btn btn-outline-primary btn-sm" @click="triggerFileInput">
                                            Заменить
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div class="import-controls mt-4" v-if="selectedFile">
                                <div v-if="isImporting || importResults" class="progress-container">
                                    <div class="progress mb-3" style="height: 40px;">
                                        <div 
                                            class="progress-bar progress-bar-striped" 
                                            :class="{ 'progress-bar-animated': isImporting }"
                                            :style="{ width: importProgress + '%' }"
                                            role="progressbar"
                                            :aria-valuenow="importProgress"
                                            aria-valuemin="0"
                                            aria-valuemax="100"
                                        >
                                            <span class="progress-text">{{ importProgress }}%</span>
                                        </div>
                                    </div>
                                    <div class="text-center text-muted">
                                        <small>{{ importStatus }}</small>
                                    </div>
                                </div>
                                
                                <button 
                                    v-if="!isImporting && !importResults"
                                    class="btn btn-primary btn-lg w-100 import-button"
                                    @click="startImport"
                                >
                                    <div class="d-flex align-items-center justify-content-center">
                                        <Download :size="20" class="me-2" />
                                        Начать импорт
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div v-if="isImporting || importLogs.length > 0" class="card logs-card">
                        <div class="card-header">
                            <h5 class="mb-0">Логи импорта</h5>
                        </div>
                        <div class="card-body p-0">
                            <div class="import-logs-container">
                                <div 
                                    v-for="(log, index) in importLogs" 
                                    :key="index" 
                                    class="import-log-line"
                                    :class="getLogClass(log)"
                                >
                                    <span class="log-timestamp">{{ formatLogTime(log.timestamp) }}</span>
                                    <span class="log-level">{{ log.level }}</span>
                                    <span class="log-message">{{ log.message }}</span>
                                </div>
                                <div v-if="importLogs.length === 0" class="no-logs-message">
                                    Логи импорта появятся здесь...
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-12 col-lg-4">
                    <div class="card instruction-card">
                        <div class="card-header">
                            <h5 class="mb-0">Инструкция</h5>
                        </div>
                        <div class="card-body">
                            <div class="instruction-content">
                                <h6>Формат Excel файла:</h6>
                                <div class="small text-muted">
                                    <p>Excel файл должен содержать таблицу со следующими колонками:</p>
                                </div>

                                <h6 class="mt-4">Структура таблицы:</h6>
                                <div class="small text-muted">
                                    <div class="table-responsive">
                                    <table class="table table-sm table-bordered mb-0">
                                        <thead class="table-light">
                                            <tr>
                                                <th>№ п/п</th>
                                                <th>Наименование мероприятия</th>
                                                <th>Основные результаты</th>
                                                <th>Сроки реализации</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td colspan="4"><strong>Стратегический проект №1 «...»</strong></td>
                                            </tr>
                                            <tr>
                                                <td>П1</td>
                                                <td colspan="3">Стратегический проект №1 «...»</td>
                                            </tr>
                                            <tr>
                                                <td>П1.1</td>
                                                <td>Разработка и освоение технологии...</td>
                                                <td>Разработана конструкция...<br>Разработаны КД и ТД...<br>Разработаны технологии...</td>
                                                <td>2023-2025 гг.</td>
                                            </tr>
                                            <tr>
                                                <td>П1.2</td>
                                                <td>Исследование и разработка...</td>
                                                <td>Результаты экспериментальных исследований...<br>Результаты реверс-инжиниринга...</td>
                                                <td>2023-2032 гг.</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    </div>
                                    
                                    <div class="mt-3">
                                        <p><strong>Правила заполнения:</strong></p>
                                        <ul class="mb-0">
                                            <li><strong>№ п/п:</strong> Порядковый номер мероприятия (пустое для заголовка проекта)</li>
                                            <li><strong>Наименование:</strong> Код и название проекта/мероприятия</li>
                                            <li><strong>Основные результаты:</strong> Список результатов через переносы строк</li>
                                            <li><strong>Сроки реализации:</strong> Период в формате "2023-2025 гг."</li>
                                        </ul>
                                    </div>
                                </div>

                                <div class="mt-4">
                                    <a href="#" class="btn btn-outline-secondary btn-sm">
                                        <Download :size="16" class="me-1" />
                                        Скачать шаблон
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="importResults" class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0">Результаты импорта</h5>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-3">
                                    <div class="text-center">
                                        <div class="h3 text-success">{{ importResults.blocksCreated }}</div>
                                        <div class="text-muted">Блоков создано</div>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="text-center">
                                        <div class="h3 text-primary">{{ importResults.eventsCreated }}</div>
                                        <div class="text-muted">Мероприятий создано</div>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="text-center">
                                        <div class="h3 text-warning">{{ importResults.errors.length }}</div>
                                        <div class="text-muted">Ошибок</div>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="text-center">
                                        <div class="h3 text-info">{{ importResults.warnings.length }}</div>
                                        <div class="text-muted">Предупреждений</div>
                                    </div>
                                </div>
                            </div>

                            <div v-if="importResults.errors.length > 0" class="mt-4">
                                <h6 class="text-danger">Ошибки:</h6>
                                <div class="alert alert-danger">
                                    <ul class="mb-0">
                                        <li v-for="error in importResults.errors" :key="error">
                                            {{ error }}
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div v-if="importResults.warnings.length > 0" class="mt-3">
                                <h6 class="text-warning">Предупреждения:</h6>
                                <div class="alert alert-warning">
                                    <ul class="mb-0">
                                        <li v-for="warning in importResults.warnings" :key="warning">
                                            {{ warning }}
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div class="mt-4">
                                <button class="btn btn-primary" @click="goToProgramDevelopment">
                                    Перейти к блокам мероприятий
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { Home, Wrench, Target, Upload, FileText, Download } from 'lucide-vue-next'
import HeaderBar from '@/modules/crm/project-ed/components/HeaderBar.vue'
import Breadcrumbs from '@/modules/crm/project-ed/components/Breadcrumbs.vue'
import { apiClient } from '@/js/api/manager'
import { endpoints } from '@/js/api/endpoints'

const router = useRouter()
const toast = useToast()

const breadcrumbItems = ref([
    { label: 'Главная', icon: Home, to: { name: 'ProjectEdMain' } },
    { label: 'Служебная страница', icon: Wrench, to: { name: 'ProjectEdTechnical' } },
    { label: 'Программа развития БГТУ', icon: Target, to: { name: 'ProjectEdProgramDevelopment' } },
    { label: 'Импорт данных', icon: Upload }
])

const fileInput = ref(null)
const selectedFile = ref(null)
const isDragOver = ref(false)
const isImporting = ref(false)
const importResults = ref(null)
const importLogs = ref([])
const importProgress = ref(0)
const importStatus = ref('')

// Обработка перетаскивания файла
function handleDragOver(e) {
    e.preventDefault()
    isDragOver.value = true
}

function handleDragLeave(e) {
    e.preventDefault()
    isDragOver.value = false
}

function handleDrop(e) {
    e.preventDefault()
    isDragOver.value = false
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
        const file = files[0]
        if (isValidFile(file)) {
            selectedFile.value = file
            // Очищаем предыдущие результаты и логи при выборе нового файла
            importResults.value = null
            importProgress.value = 0
            importStatus.value = ''
            clearImportLogs()
        }
    }
}

// Обработка выбора файла
function triggerFileInput() {
    fileInput.value?.click()
}

function handleFileSelect(e) {
    const file = e.target.files[0]
    if (file && isValidFile(file)) {
        selectedFile.value = file
        // Очищаем предыдущие результаты и логи при выборе нового файла
        importResults.value = null
        importProgress.value = 0
        importStatus.value = ''
        clearImportLogs()
    }
}

// Валидация файла
function isValidFile(file) {
    const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
    ]
    
    if (!validTypes.includes(file.type)) {
        toast.error('Пожалуйста, выберите Excel файл (.xlsx или .xls)')
        return false
    }
    
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
        toast.error('Размер файла не должен превышать 10MB')
        return false
    }
    
    return true
}

// Удаление файла
function removeFile() {
    selectedFile.value = null
    importResults.value = null
    importProgress.value = 0
    importStatus.value = ''
    clearImportLogs()
    if (fileInput.value) {
        fileInput.value.value = ''
    }
}

// Форматирование размера файла
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Импорт данных
async function startImport() {
    if (!selectedFile.value) return
    
    isImporting.value = true
    importResults.value = null
    clearImportLogs()
    importProgress.value = 0
    importStatus.value = 'Подготовка к импорту...'
    
    addImportLog('info', `Начало импорта файла: ${selectedFile.value.name}`)
    
    try {
        const formData = new FormData()
        formData.append('file', selectedFile.value)
        
        importStatus.value = 'Отправка файла на сервер...'
        importProgress.value = 10
        
        const response = await apiClient.post(
            endpoints.project_ed.import.excel, 
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        )
        
        importStatus.value = 'Обработка логов...'
        importProgress.value = 90
        
        // Добавляем логи из ответа сервера
        if (response.data.logs && response.data.logs.length > 0) {
            response.data.logs.forEach(log => {
                addImportLog(log.level, log.message)
            })
        } else {
            // Fallback для старых ответов без логов
            addImportLog('success', 'Получен ответ от сервера')
            addImportLog('info', `Создано блоков: ${response.data.blocksCreated}, мероприятий: ${response.data.eventsCreated}`)
            
            if (response.data.errors && response.data.errors.length > 0) {
                addImportLog('error', `Найдено ошибок: ${response.data.errors.length}`)
                response.data.errors.forEach(error => {
                    addImportLog('error', error)
                })
            }
            
            if (response.data.warnings && response.data.warnings.length > 0) {
                addImportLog('warn', `Найдено предупреждений: ${response.data.warnings.length}`)
                response.data.warnings.forEach(warning => {
                    addImportLog('warn', warning)
                })
            }
        }
        
        importProgress.value = 100
        importStatus.value = 'Импорт завершен'
        importResults.value = response.data
        toast.success('Импорт завершен успешно')
        
    } catch (error) {
        console.error('Ошибка импорта:', error)
        importProgress.value = 0
        importStatus.value = 'Ошибка импорта'
        
        addImportLog('error', `Ошибка импорта: ${error.message}`)
        
        if (error.response?.data?.error) {
            addImportLog('error', error.response.data.error)
        }
        
        // Добавляем логи ошибки из ответа, если есть
        if (error.response?.data?.logs) {
            error.response.data.logs.forEach(log => {
                addImportLog(log.level, log.message)
            })
        }
        
        toast.error('Ошибка при импорте файла')
        
        // Показываем базовые результаты с ошибкой
        importResults.value = {
            blocksCreated: 0,
            eventsCreated: 0,
            errors: [error.response?.data?.detail || 'Неизвестная ошибка'],
            warnings: []
        }
    } finally {
        isImporting.value = false
        // Не сбрасываем прогресс и статус после завершения - оставляем их видимыми
    }
}

// Переход к странице программы развития
function goToProgramDevelopment() {
    router.push({ name: 'ProjectEdProgramDevelopment' })
}

// Функции для работы с логами импорта
function addImportLog(level, message) {
    const timestamp = new Date()
    importLogs.value.push({
        timestamp,
        level,
        message
    })
    
    // Автоматическая прокрутка к последнему логу
    setTimeout(() => {
        const logsContainer = document.querySelector('.import-logs-container')
        if (logsContainer) {
            logsContainer.scrollTop = logsContainer.scrollHeight
        }
    }, 100)
}

function clearImportLogs() {
    importLogs.value = []
}

function getLogClass(log) {
    return {
        [log.level.toLowerCase()]: true
    }
}

function formatLogTime(timestamp) {
    return timestamp.toLocaleTimeString('ru-RU', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        fractionalSecondDigits: 3
    })
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

// Выравнивание высоты карточек в ряду
.row {
    align-items: stretch;
    
    .col-12, .col-lg-4 {
        display: flex;
        flex-direction: column;
    }
    
    .card {
        height: 100%; // Возвращаем растягивание на всю высоту
        display: flex;
        flex-direction: column;
        
        .card-body {
            flex: 1;
            display: flex;
            flex-direction: column;
        }
        
        // Исключение для контейнера загрузки файла
        &.upload-card {
            height: auto; // Фиксированная высота для контейнера загрузки
            max-height: none; // Убираем ограничение максимальной высоты
            overflow: visible; // Позволяем содержимому выходить за границы
            
            .card-body {
                flex: none; // Отключаем flex для body карточки загрузки
                padding-bottom: 1.5rem; // Добавляем отступ снизу для кнопки
                position: relative;
            }
        }
    }
}

.upload-area {
    border: 2px dashed #dee2e6;
    border-radius: 8px;
    padding: 3rem 2rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    background-color: #f8f9fa;
    
    &:hover {
        border-color: #0d6efd;
        background-color: #f0f8ff;
    }
    
    &.is-dragover {
        border-color: #0d6efd;
        background-color: #e3f2fd;
        transform: scale(1.02);
    }
    
    &.has-file {
        border-color: #198754;
        background-color: #f0fff4;
    }
}

.upload-placeholder {
    color: #6c757d;
}

.file-selected {
    color: #198754;
}

// Стили для контейнера кнопки импорта
.import-controls {
    position: relative;
    z-index: 10;
    
    .import-button {
        position: relative;
        z-index: 11;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        
        &:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }
    }
}

// Стили для полосы прогресса
.progress-container {
    .progress {
        border-radius: 20px;
        overflow: hidden;
        background-color: #e9ecef;
        
        .progress-bar {
            background: linear-gradient(45deg, #0d6efd, #0b5ed7);
            border-radius: 20px; // Закругленные углы для прогресс бара
            transition: width 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            
            .progress-text {
                color: white;
                font-weight: bold;
                font-size: 16px;
                text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
            }
        }
    }
}

.instruction-content {
    font-size: 0.9rem;
    
    ul {
        margin-left: 1rem;
    }
    
    li {
        margin-bottom: 0.5rem;
    }
    
    .table {
        font-size: 0.8rem;
        
        th, td {
            padding: 0.5rem;
            vertical-align: top;
        }
        
        th {
            font-weight: 600;
            background-color: #f8f9fa;
        }
        
        td {
            border-color: #dee2e6;
        }
    }
}

// Стили для контейнера логов
.logs-card {
    height: 100%; // Возвращаем принудительную высоту
    display: flex;
    flex-direction: column;
    
    .card-body {
        flex: 1;
        display: flex;
        flex-direction: column;
    }
}

// Стили для контейнера инструкции
.instruction-card {
    height: 100%; // Возвращаем принудительную высоту
    display: flex;
    flex-direction: column;
    
    .card-body {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow-y: auto;
    }
}

// Стили для логов импорта в консольном стиле
.import-logs-container {
    background-color: #1e1e1e;
    border-radius: 0 0 6px 6px;
    padding: 1rem;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 13px;
    line-height: 1.4;
    height: 100%;
    min-height: 300px;
    max-height: 450px;
    overflow-y: auto;
    color: #d4d4d4;
    flex: 1;
    
    // Улучшенный скроллбар
    &::-webkit-scrollbar {
        width: 12px;
    }
    
    &::-webkit-scrollbar-track {
        background: #2d2d2d;
        border-radius: 6px;
    }
    
    &::-webkit-scrollbar-thumb {
        background: #555;
        border-radius: 6px;
        border: 2px solid #2d2d2d;
        
        &:hover {
            background: #777;
        }
    }
    
    // Плавная прокрутка к последнему элементу
    scroll-behavior: smooth;
}

.import-log-line {
    display: flex;
    align-items: flex-start;
    margin-bottom: 0.25rem;
    word-wrap: break-word;
    
    &:last-child {
        margin-bottom: 0;
    }
}

.log-timestamp {
    color: #6a9955;
    margin-right: 0.75rem;
    flex-shrink: 0;
    font-size: 12px;
}

.log-level {
    margin-right: 0.75rem;
    flex-shrink: 0;
    font-weight: bold;
    min-width: 60px;
    
    &.info {
        color: #569cd6;
    }
    
    &.warn {
        color: #dcdcaa;
    }
    
    &.error {
        color: #f44747;
    }
    
    &.debug {
        color: #9cdcfe;
    }
    
    &.success {
        color: #4ec9b0;
    }
}

.log-message {
    flex: 1;
    color: #d4d4d4;
    
    // Подсветка ключевых слов
    &:contains('Создан блок') {
        color: #4ec9b0;
    }
    
    &:contains('Создано мероприятие') {
        color: #4ec9b0;
    }
    
    &:contains('Ошибка') {
        color: #f44747;
    }
    
    &:contains('Предупреждение') {
        color: #dcdcaa;
    }
}

.no-logs-message {
    color: #6a9955;
    font-style: italic;
    text-align: center;
    padding: 2rem;
    opacity: 0.7;
}

</style>
