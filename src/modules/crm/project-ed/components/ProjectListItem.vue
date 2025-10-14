<template>
    <div class="project-item" @click="emitOpen">
        <div class="project-main">
            <div class="project-title-section">
                <h4 class="project-title">{{ project.shortName }} <span v-if="project.nameClarification"> {{ project.nameClarification }}</span></h4>
                <span class="status-badge" :class="getStatusClass(project.status)">
                    {{ project.status }}
                </span>
            </div>

            <p class="project-description">{{ project.name }}</p>

            <div class="project-meta">
                <span 
                    ref="roleElementRef"
                    class="role-badge" 
                    :class="getRoleClass(project.role)"
                >
                    <User class="role-icon" :size="14" />
                    {{ project.role }}
                </span>
                <span class="meta-separator" aria-hidden="true" v-if="project.executors_count > 0">•</span>
                <span 
                    class="executors-count" 
                    v-if="project.executors_count > 0"
                    ref="executorsElementRef"
                    @mouseenter="showExecutorsTooltip"
                    @mouseleave="hideExecutorsTooltip"
                >
                    <Users class="executors-icon" :size="14" />
                    {{ project.executors_count }} {{ getExecutorsWord(project.executors_count) }}
                </span>
                <span class="meta-separator" aria-hidden="true" v-if="projectDateText">•</span>
                <span 
                    ref="dateElementRef"
                    class="meta-date" 
                    v-if="projectDateText"
                >
                    {{ projectDateText }}
                </span>
            </div>
        </div>
        
        <div class="project-actions">
            <Star 
                class="favorite-star" 
                :class="{ 'favorite-active': isFavorite }"
                :size="30"
                @click.stop="toggleFavorite"
            />
        </div>
    </div>

    <!-- Тултип для исполнителей -->
    <SimpleTooltip
        :visible="executorsTooltipVisible"
        :target-element="executorsTooltipTarget"
        @mouseenter="handleExecutorsTooltipMouseEnter"
        @mouseleave="handleExecutorsTooltipMouseLeave"
    >
        <UsersList 
            :users="project.executors || project.performers || []" 
            type="executors"
            :max-displayed="3"
            @open-modal="openExecutorsModal"
        />
    </SimpleTooltip>

    <!-- Модальное окно с полным списком исполнителей -->
    <UserListModal
        :visible="executorsModalVisible"
        :users="modalExecutors"
        type="executors"
        modal-id="executorsModal"
        @close="closeExecutorsModal"
    />
</template>

<script setup>
import { User, Star, Users, X } from 'lucide-vue-next'
import { defineProps, defineEmits, ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { getRelativeTime } from './steps/js/timeUtils.js'
import { initializeDatePopover, cleanupDatePopover, initializePopover, cleanupPopover } from './steps/js/popoverUtils.js'
import SimpleTooltip from './SimpleTooltip.vue'
import UsersList from './UsersList.vue'
import UserListModal from './UserListModal.vue'

const props = defineProps({
    project: {
        type: Object,
        required: true
    }
})

const emit = defineEmits(['open', 'toggle-favorite'])


const isFavorite = ref(false)

// Ref для элемента даты
const dateElementRef = ref(null)
const datePopoverElement = ref(null)

// Ref для элемента роли
const roleElementRef = ref(null)
const rolePopoverElement = ref(null)

// Ref для элемента исполнителей
const executorsElementRef = ref(null)

// Тултип для исполнителей
const executorsTooltipVisible = ref(false)
const executorsTooltipTarget = ref(null)
let executorsHideTimeout = null

// Модальное окно для исполнителей
const executorsModalVisible = ref(false)
const modalExecutors = ref([])

const projectDateText = computed(() => {
    const p = props.project || {}
    const updated = p.updated_at || p.updatedAt || p.modified_at || p.modifiedAt
    const created = p.created_at || p.createdAt || p.created
    const iso = updated || created
    return getRelativeTime(iso)
})

const fullDateTime = computed(() => {
    const p = props.project || {}
    const updated = p.updated_at || p.updatedAt || p.modified_at || p.modifiedAt
    const created = p.created_at || p.createdAt || p.created
    const iso = updated || created
    
    if (!iso) return ''
    
    const date = new Date(iso)
    if (isNaN(date.getTime())) return ''
    
    return new Intl.DateTimeFormat('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        weekday: 'long'
    }).format(date)
})

function emitOpen() {
    emit('open', props.project)
}

function toggleFavorite() {
    isFavorite.value = !isFavorite.value
    emit('toggle-favorite', { project: props.project, isFavorite: isFavorite.value })
}

// Методы для управления модальным окном исполнителей
const openExecutorsModal = () => {
    if (props.project?.executors && Array.isArray(props.project.executors)) {
        modalExecutors.value = [...props.project.executors]
    } else if (props.project?.performers && Array.isArray(props.project.performers)) {
        modalExecutors.value = [...props.project.performers]
    } else {
        modalExecutors.value = []
    }
    executorsModalVisible.value = true
}

const closeExecutorsModal = () => {
    executorsModalVisible.value = false
    modalExecutors.value = []
}

// Инициализация кастомного popup для даты и роли
onMounted(() => {
    nextTick(() => {
        if (dateElementRef.value && fullDateTime.value) {
            datePopoverElement.value = initializeDatePopover(dateElementRef.value, fullDateTime.value)
        }
        
        if (roleElementRef.value) {
            rolePopoverElement.value = initializePopover(roleElementRef.value, 'Ваша роль в проекте', {
                className: 'custom-popover',
                position: 'top',
                offset: 8,
                showArrow: true,
                maxWidth: 200
            })
        }
    })
})

// Очистка при размонтировании компонента
onUnmounted(() => {
    if (datePopoverElement.value) {
        cleanupDatePopover(datePopoverElement.value)
        datePopoverElement.value = null
    }
    
    if (rolePopoverElement.value) {
        cleanupPopover(rolePopoverElement.value)
        rolePopoverElement.value = null
    }
    
    // Очищаем таймер тултипа исполнителей
    if (executorsHideTimeout) {
        clearTimeout(executorsHideTimeout)
        executorsHideTimeout = null
    }
})

function getStatusClass(status) {
    const statusMap = {
        'Черновик': 'badge-warning',
        'На утверждении': 'badge-info',
        'Отклонен': 'badge-danger',
        'В работе': 'badge-success',
        'Завершен': 'badge-secondary'
    }
    return statusMap[status] || 'badge-secondary'
}

function getRoleClass(role) {
    const roleMap = {
        'Руководитель': 'badge-secondary',
        'Куратор': 'badge-warning',
        'Заказчик': 'badge-dark',
        'Исполнитель': 'badge-success'
    }
    return roleMap[role] || 'badge-secondary'
}

function getExecutorsWord(count) {
    if (count === 1) {
        return 'исполнитель'
    } else if (count >= 2 && count <= 4) {
        return 'исполнителя'
    } else {
        return 'исполнителей'
    }
}

// Методы для работы с тултипом исполнителей
const showExecutorsTooltip = (event) => {
    // Не показываем тултип, если исполнителей нет
    const executorsCount = props.project?.executors_count || (props.project?.executors ? props.project.executors.length : 0)
    
    if (executorsCount === 0) {
        return
    }
    
    // Отменяем предыдущий таймер скрытия
    if (executorsHideTimeout) {
        clearTimeout(executorsHideTimeout)
        executorsHideTimeout = null
    }
    
    // Используем currentTarget - это должен быть элемент executors-count
    executorsTooltipTarget.value = event.currentTarget
    executorsTooltipVisible.value = true
}

const hideExecutorsTooltip = () => {
    // Устанавливаем задержку для плавного перехода
    executorsHideTimeout = setTimeout(() => {
        executorsTooltipVisible.value = false
        executorsTooltipTarget.value = null
    }, 150)
}

const handleExecutorsTooltipMouseEnter = () => {
    // Отменяем скрытие тултипа при наведении на него
    if (executorsHideTimeout) {
        clearTimeout(executorsHideTimeout)
        executorsHideTimeout = null
    }
}

const handleExecutorsTooltipMouseLeave = () => {
    // Скрываем тултип при уходе с него
    executorsHideTimeout = setTimeout(() => {
        executorsTooltipVisible.value = false
        executorsTooltipTarget.value = null
    }, 100)
}
</script>

<style scoped lang="scss">
.project-item {
    background: var(--color-primary-background);
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    padding: 1.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;

    &:hover {
        border-color: #0d6efd !important;
        box-shadow: 0 2px 8px rgba(13, 110, 253, 0.1) !important;
    }

    .project-main {
        flex: 1;

        .project-title-section {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 0.5rem;

            .project-title {
                font-size: 1.25rem;
                font-weight: 600;
                color: #0d6efd;
                margin: 0;
                text-decoration: none;

                &:hover {
                    text-decoration: underline;
                }
            }

            .status-badge {
                border: 1px solid transparent;
                border-radius: 1rem;
                padding: 0.25rem 0.5rem;
                font-size: 0.75rem;
                font-weight: 500;
                text-transform: uppercase;
                letter-spacing: 0.025em;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
                &.badge-warning {
                    border-color: #f59e0b;
                    color: #6b4f00;
                    background: linear-gradient(180deg, #fff4d4 0%, #ffe7a3 100%);
                }
                &.badge-info {
                    border-color: #0dcaf0;
                    color: #0b4961;
                    background: linear-gradient(180deg, #d9f6ff 0%, #bfeeff 100%);
                }
                &.badge-danger {
                    border-color: #dc3545;
                    color: #6a1020;
                    background: linear-gradient(180deg, #ffd7dc 0%, #ffb8c0 100%);
                }
                &.badge-success {
                    border-color: #198754;
                    color: #0f4d31;
                    background: linear-gradient(180deg, #d9f4e6 0%, #bdebd6 100%);
                }
                &.badge-secondary {
                    border-color: #6c757d;
                    color: #2f3437;
                    background: linear-gradient(180deg, #e9ecef 0%, #dde2e6 100%);
                }
            }
        }


        .project-description {
            color: #6c757d;
            font-size: 0.875rem;
            line-height: 1.5;
            margin: 0 0 0.5rem 0;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }

        .project-meta {
            display: flex;
            gap: 0.35rem;
            align-items: center;

            .role-badge {
                display: flex;
                color: var(--color-secondary-text);
                font-size: 0.875rem;
                align-items: center;
                gap: 0.25rem;
                cursor: pointer;
                text-underline-offset: 2px;
                transition: all 0.2s ease;

                &:hover {
                    color: var(--color-primary);
                    text-decoration: underline;
                }

                .role-icon {
                    display: flex;
                    align-items: center;
                }
            }

            .executors-count {
                display: flex;
                color: var(--color-secondary-text);
                font-size: 0.875rem;
                align-items: center;
                gap: 0.25rem;
                cursor: pointer;
                text-underline-offset: 2px;
                transition: all 0.2s ease;

                &:hover {
                    color: var(--color-primary);
                    text-decoration: underline;
                }

                .executors-icon {
                    display: flex;
                    align-items: center;
                }
            }

            .meta-separator {
                color: var(--color-secondary-text);
                opacity: 0.6;
                font-size: 0.875rem;
                line-height: 1;
                display: inline-flex;
                align-items: center;
            }

            .meta-date {
                color: var(--color-secondary-text);
                font-size: 0.875rem;
                cursor: pointer;
                text-underline-offset: 2px;
                transition: all 0.2s ease;
                
                &:hover {
                    color: var(--color-primary);
                    text-decoration: underline;
                }
            }
        }
    }

    .project-actions {
        display: flex;
        align-items: center;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    }

    &:hover .project-actions {
        opacity: 1;
        transform: translateX(0);
    }

    .favorite-star {
        color: #6c757d;
        cursor: pointer;
        transition: all 0.2s ease;
        padding: 0.25rem;
        border-radius: 0.25rem;

        &:hover {
            color: #ffc107;
            transform: scale(1.1);
        }

        &.favorite-active {
            color: #ffc107;
        }
    }

    &:has(.favorite-active) {
        border-color: #ffc107;
        box-shadow: 0 2px 8px rgba(255, 193, 7, 0.2);
        
        .project-actions {
            opacity: 1;
            transform: translateX(0);
        }
    }
}

@media (max-width: 768px) {
    .project-item {
        flex-direction: column;
        gap: 1rem;

        .project-actions {
            align-self: flex-start;
        }
    }

    .project-meta {
        flex-direction: column;
        align-items: flex-start !important;
        gap: 0.5rem !important;
    }
}

// Стили для кастомного popup (аналогично BasicProvisions.vue)
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

</style>

