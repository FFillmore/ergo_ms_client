<template>
    <div class="executor-selector">
        <div v-if="selectedExecutors.length > 0" class="selected-executors">
            <div class="executors-grid">
                <div 
                    v-for="executor in selectedExecutors" 
                    :key="executor.id" 
                    class="executor-card"
                >
                    <DefaultAvatar
                        :size="'small'"
                        :title="executor.name"
                    />
                    <div class="executor-info">
                        <div class="executor-name">{{ executor.name }}</div>
                        <div class="executor-position">{{ executor.position }}</div>
                    </div>
                    <button 
                        type="button" 
                        class="remove-executor-btn"
                        @click="removeExecutor(executor.id)"
                    >
                        ×
                    </button>
                </div>
            </div>
        </div>

        <button 
            type="button" 
            class="add-executors-btn"
            @click="toggleSelector"
            :class="{ 'is-open': isOpen }"
        >
            <span class="btn-icon">+</span>
            <span class="btn-text">Добавить исполнителей</span>
        </button>

        <div v-if="isOpen" class="tooltip-overlay" @click="closeSelector"></div>
        
        <div v-if="isOpen" class="executor-tooltip" ref="tooltipRef" @click.stop>
            <div class="tooltip-header">
                <h4 class="tooltip-title">Выберите исполнителей</h4>
                <button 
                    type="button" 
                    class="close-btn"
                    @click="closeSelector"
                >
                    <X :size="20" />
                </button>
            </div>
            
            <div class="search-section">
                <input
                    v-model="searchQuery"
                    type="text"
                    class="search-input"
                    placeholder="Поиск по имени или должности..."
                />
            </div>

            <div class="users-list">
                <div 
                    v-for="user in filteredUsers" 
                    :key="user.id" 
                    class="user-item"
                    :class="{ 'selected': isSelected(user.id) }"
                    @click="toggleUser(user)"
                >
                    <div class="user-avatar">
                        <UserAvatar
                            :size="'small'"
                            :title="user.name"
                            :customAvatarUrl="user.avatarUrl"
                        />
                    </div>
                    <div class="user-info">
                        <div class="user-name">{{ user.name }}</div>
                        <div class="user-position">{{ user.position }}</div>
                    </div>
                    <div class="user-checkbox">
                        <div class="checkbox" :class="{ 'checked': isSelected(user.id) }">
                            <span v-if="isSelected(user.id)" class="checkmark">✓</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="tooltip-actions">
                <button 
                    type="button" 
                    class="cancel-btn"
                    @click="closeSelector"
                >
                    Отмена
                </button>
                <button 
                    type="button" 
                    class="confirm-btn"
                    @click="confirmSelection"
                    :disabled="tempSelectedUsers.length === 0"
                >
                    Добавить ({{ tempSelectedUsers.length }})
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { X } from 'lucide-vue-next'
import UserAvatar from '@/modules/crm/project-ed/components/UserAvatar.vue'
import DefaultAvatar from '@/components/DefaultAvatar.vue'

const props = defineProps({
    modelValue: {
        type: Array,
        default: () => []
    },
    availableUsers: {
        type: Array,
        default: () => []
    }
})

const emit = defineEmits(['update:modelValue'])

// Состояние компонента
const isOpen = ref(false)
const searchQuery = ref('')
const selectedUsers = ref([])
const tempSelectedUsers = ref([]) // Временный выбор в модальном окне
const tooltipRef = ref(null)

// Используем тестовые данные или переданные пользователи
const allUsers = computed(() => props.availableUsers.length > 0 ? props.availableUsers : testUsers.value)

// Отфильтрованные пользователи
const filteredUsers = computed(() => {
    if (!searchQuery.value.trim()) {
        return allUsers.value
    }
    
    const query = searchQuery.value.toLowerCase()
    return allUsers.value.filter(user => 
        user.name.toLowerCase().includes(query) || 
        user.position.toLowerCase().includes(query)
    )
})

// Выбранные исполнители (отображаемые)
const selectedExecutors = computed(() => {
    return selectedUsers.value.map(userId => 
        allUsers.value.find(user => user.id === userId)
    ).filter(Boolean)
})

// Методы
const toggleSelector = () => {
    isOpen.value = !isOpen.value
    if (isOpen.value) {
        searchQuery.value = ''
        // Копируем только тех выбранных исполнителей, которые есть в доступном списке
        tempSelectedUsers.value = selectedUsers.value.filter(userId => 
            allUsers.value.some(user => user.id === userId)
        )
        // Блокируем прокрутку основной страницы
        document.body.style.overflow = 'hidden'
    } else {
        // Разблокируем прокрутку основной страницы
        document.body.style.overflow = ''
    }
}

const closeSelector = () => {
    isOpen.value = false
    searchQuery.value = ''
    // Разблокируем прокрутку основной страницы
    document.body.style.overflow = ''
}


const toggleUser = (user) => {
    const userId = user.id
    const index = tempSelectedUsers.value.indexOf(userId)
    if (index > -1) {
        tempSelectedUsers.value.splice(index, 1)
    } else {
        tempSelectedUsers.value.push(userId)
    }
}

const isSelected = (userId) => {
    return tempSelectedUsers.value.includes(userId)
}

const confirmSelection = () => {
    // Заменяем весь список выбранных исполнителей на временный выбор
    selectedUsers.value = [...tempSelectedUsers.value]
    emit('update:modelValue', [...tempSelectedUsers.value])
    closeSelector()
}

const removeExecutor = (userId) => {
    const index = selectedUsers.value.indexOf(userId)
    if (index > -1) {
        selectedUsers.value.splice(index, 1)
        emit('update:modelValue', [...selectedUsers.value])
    }
}

// Инициализация выбранных пользователей из props
const initializeSelectedUsers = () => {
    selectedUsers.value = [...props.modelValue]
    tempSelectedUsers.value = []
}

// Следим за изменениями modelValue
watch(() => props.modelValue, (newValue) => {
    selectedUsers.value = [...newValue]
    // Если модальное окно открыто, обновляем и временный выбор
    if (isOpen.value) {
        tempSelectedUsers.value = [...newValue]
    }
}, { immediate: true })

// Обработчик клавиши Escape
const handleKeydown = (event) => {
    if (event.key === 'Escape' && isOpen.value) {
        closeSelector()
    }
}

onMounted(() => {
    initializeSelectedUsers()
    document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
    // Убеждаемся, что прокрутка разблокирована при размонтировании компонента
    document.body.style.overflow = ''
})
</script>

<style scoped lang="scss">
.executor-selector {
    position: relative;
    width: 100%;
}

.add-executors-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: #28a745;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;
    width: fit-content;

    &:hover {
        background: #218838;
        transform: translateY(-1px);
    }

    &.is-open {
        background: #218838;
    }
}

.btn-icon {
    font-size: 1.2rem;
    font-weight: bold;
}

.btn-text {
    font-size: 0.95rem;
}

.tooltip-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 9998;
    animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

.executor-tooltip {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: var(--color-primary-background);
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    z-index: 9999;
    width: 500px;
    height: 520px;
    overflow: hidden;
    animation: slideIn 0.3s ease-out;
    display: flex;
    flex-direction: column;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translate(-50%, -60%);
    }
    to {
        opacity: 1;
        transform: translate(-50%, -50%);
    }
}

.tooltip-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--color-border);
    background: var(--color-secondary-background);
    border-radius: 10px 10px 0 0;
}

.tooltip-title {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--color-primary-text);
}

.close-btn {
    background: none;
    border: none;
    color: var(--color-secondary-text);
    cursor: pointer;
    padding: 4px;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s ease;

    &:hover {
        background: var(--color-hover-background);
        color: var(--color-primary-text);
    }
}

.search-section {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--color-border);
}

.search-input {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid var(--color-border);
    border-radius: 8px;
    font-size: 0.95rem;
    transition: all 0.3s ease;

    &:focus {
        outline: none;
        border-color: #0d6efd;
        box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
    }

    &::placeholder {
        color: var(--color-secondary-text);
    }
}

.users-list {
    flex: 1;
    overflow-y: auto;
    padding: 0.5rem 0;
    min-height: 0;
}

.user-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
    border-bottom: 1px solid var(--color-border);

    &:hover {
        background: var(--color-hover-background);
    }

    &.selected {
        background: var(--color-hover-background);
        border-left: 3px solid #0d6efd;
    }

    &:last-child {
        border-bottom: none;
    }
}

.user-avatar {
    flex-shrink: 0;
}

.user-info {
    flex: 1;
    min-width: 0;
}

.user-name {
    font-weight: 500;
    color: var(--color-primary-text);
    font-size: 0.95rem;
    line-height: 1.2;
    margin-bottom: 0.125rem;
}

.user-position {
    font-size: 0.8rem;
    color: var(--color-secondary-text);
    line-height: 1.2;
}

.user-checkbox {
    flex-shrink: 0;
}

.checkbox {
    width: 20px;
    height: 20px;
    border: 2px solid var(--color-border);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    &.checked {
        background: #0d6efd;
        border-color: #0d6efd;
    }
}

.checkmark {
    color: var(--color-primary-text);
    font-size: 0.75rem;
    font-weight: bold;
}

.tooltip-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding: 1rem 1.5rem 1.5rem 1.5rem;
    border-top: 1px solid var(--color-border);
    background: var(--color-secondary-background);
    border-radius: 0 0 12px 12px;
    margin-top: auto;
}

.cancel-btn,
.confirm-btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

.cancel-btn {
    background: var(--color-secondary-background);
    color: var(--color-primary-text);

    &:hover {
        background: var(--color-hover-background);
    }
}

.confirm-btn {
    background: #0d6efd;
    color: white;

    &:hover:not(:disabled) {
        background: #0b5ed7;
    }

    &:disabled {
        background: var(--color-secondary-background);
        border: 1px solid var(--color-border);
        cursor: not-allowed;
        opacity: 0.6;
    }
}

.selected-executors {
    margin-bottom: 1rem;
    padding: 1rem;
    background: var(--color-secondary-background);
    border-radius: 8px;
    border: 1px solid var(--color-border);
}

.executors-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 0.75rem;
}

.executor-card {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    background: var(--color-primary-background);
    border-radius: 6px;
    border: 1px solid var(--color-border);
    position: relative;
}

.executor-info {
    flex: 1;
    min-width: 0;
}

.executor-name {
    font-weight: 500;
    color: var(--color-primary-text);
    font-size: 0.85rem;
    line-height: 1.2;
    margin-bottom: 0.125rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.executor-position {
    font-size: 0.75rem;
    color: var(--color-secondary-text);
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.remove-executor-btn {
    position: absolute;
    top: -6px;
    right: -6px;
    width: 18px;
    height: 18px;
    border: none;
    background: #dc3545;
    color: white;
    border-radius: 50%;
    cursor: pointer;
    font-size: 0.75rem;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    flex-shrink: 0;

    &:hover {
        background: #c82333;
        transform: scale(1.1);
    }
}

// Адаптивность
@media (max-width: 768px) {
    .executor-tooltip {
        left: -1rem;
        right: -1rem;
        min-width: auto;
    }

    .executors-grid {
        grid-template-columns: 1fr;
    }

    .executor-card {
        padding: 0.75rem;
    }
}
</style>
