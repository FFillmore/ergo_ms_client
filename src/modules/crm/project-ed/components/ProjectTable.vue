<template>
    <div class="project-table">
        <div class="table-card">
            <div class="table-header row g-2 align-items-center">
                <div class="col-3 col-lg-3"><div class="th">Краткое наименование проекта</div></div>
                <div class="col-4 col-lg-5"><div class="th">Наименование проекта</div></div>
                <div class="col-3 col-lg-2"><div class="th text-center">Роль в проекте</div></div>
                <div class="col-2 col-lg-2"><div class="th text-center">Статус проекта</div></div>
            </div>

            <div
                v-for="project in items"
                :key="project.id"
                class="table-row row g-2 align-items-stretch"
                :style="{ '--row-bg': statusBg(project.status) }"
                @click="$emit('rowClick', project)"
            >
                <div class="col-3 col-lg-3">
                    <div class="cell short-pill">
                        <slot name="shortName" :project="project">
                            {{ project.shortName }}
                        </slot>
                    </div>
                </div>
                <div class="col-4 col-lg-5">
                    <div class="cell text-truncate" :title="project.name">
                        <slot name="name" :project="project">
                            {{ project.name }}
                        </slot>
                    </div>
                </div>
                <div class="col-3 col-lg-2">
                    <div class="cell text-center">
                        <slot name="role" :project="project">
                            <span class="badge role-badge" :class="roleClass(project.role)">{{ project.role }}</span>
                        </slot>
                    </div>
                </div>
                <div class="col-2 col-lg-2">
                    <div class="cell text-center">
                        <slot name="status" :project="project">
                            <span class="badge status-badge" :class="statusClass(project.status)">{{ project.status }}</span>
                        </slot>
                    </div>
                </div>
            </div>

            <div v-if="!items || items.length === 0" class="empty-hint">
                <slot name="empty">Нет проектов по выбранным фильтрам</slot>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    items: {
        type: Array,
        default: () => [],
    },
})

const statusBg = (status) => {
    switch (status) {
        case 'Черновик': return 'var(--bs-secondary-bg-subtle, #e9ecef)'
        case 'На утверждении': return 'var(--bs-warning-bg-subtle, #fff3cd)'
        case 'Отклонен': return 'var(--bs-danger-bg-subtle, #f8d7da)'
        case 'Завершен': return 'var(--bs-purple-bg-subtle, #e2d9f3)'
        case 'В работе': return 'var(--bs-success-bg-subtle, #d1e7dd)'
        default: return 'var(--bs-secondary-bg-subtle, #e9ecef)'
    }
}

const roleClass = (role) => {
    if (role === 'Руководитель') return 'text-body'
    if (role === 'Исполнитель') return 'text-success-emphasis'
    return 'text-secondary-emphasis'
}

const statusClass = (status) => {
    switch (status) {
        case 'Черновик': return 'text-secondary-emphasis'
        case 'На утверждении': return 'text-warning-emphasis'
        case 'В работе': return 'text-success-emphasis'
        case 'Завершен': return 'text-primary-emphasis'
        case 'Отклонен': return 'text-danger-emphasis'
        default: return 'text-secondary-emphasis'
    }
}
</script>

<style scoped lang="scss">
.table-card {
    border: 1px solid var(--bs-border-color, #dee2e6);
    border-radius: .75rem;
    background-color: var(--color-primary-background);
}
.table-header { padding: .5rem; }
.th {
    width: 100%;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: .5rem .75rem;
    border-radius: .5rem;
    background-color: var(--color-primary-background);
    border: 1px solid var(--bs-border-color, #dee2e6);
    font-weight: 600;
}
.table-row {
    --row-bg: var(--bs-secondary-bg, #f8f9fa);
    padding: .25rem .5rem .75rem .5rem;
    transition: background-color .15s ease;
}
.cell {
    width: 100%;
    height: 44px;
    display: flex;
    align-items: center;
    padding: .5rem .75rem;
    border-radius: .5rem;
    background-color: var(--row-bg);
    border: 1px solid var(--bs-border-color, #dee2e6);
}
.cell.text-center { justify-content: center; text-align: center; }
.short-pill { font-weight: 600; justify-content: center; text-align: center; }
.badge.role-badge,
.badge.status-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 30px;
    min-width: 120px;
    border-radius: .5rem;
    font-weight: 600;
    background-color: transparent !important;
    border: none;
    box-shadow: none;
}
.empty-hint { padding: 1rem; text-align: center; color: var(--color-secondary-text); }
.table-row:hover .cell { background-color: var(--color-hover-background, #f1f3f5); cursor: pointer; }
</style>


