<template>
    <div class="form-section">
        <div class="participants-grid">
            <div class="form-group">
                <label for="curator" class="form-label required">
                    Куратор проекта
                </label>
                <template v-if="prorectorCandidates && prorectorCandidates.length > 0">
                    <SelectBox
                        class="curator-select"
                        v-model="internalCurator"
                        :options="prorectorCandidates"
                        :valueKey="'id'"
                        :labelKey="'name'"
                        :includeAllOption="false"
                        :disabled="!prorectorCandidates || prorectorCandidates.length === 0"
                        allLabel="Выберите куратора"
                    >
                        <template #selected="{ option, label }">
                            <div class="d-flex align-items-center gap-2 w-100">
                                <UserAvatar
                                    size="medium"
                                    :title="option?.name || label"
                                    :customAvatarUrl="option?.avatar_url || option?.avatar || option?.photo || option?.image || null"
                                />
                                <div class="d-flex flex-column flex-grow-1 overflow-hidden">
                                    <div class="text-truncate">{{ option?.name || label }}</div>
                                    <div class="text-muted text-truncate" v-if="option?.position">{{ option.position }}</div>
                                </div>
                            </div>
                        </template>
                        <template #option="{ option }">
                            <div class="d-flex align-items-center gap-2">
                                <UserAvatar
                                    size="medium"
                                    :title="option.name"
                                    :customAvatarUrl="option?.avatar_url || option?.avatar || option?.photo || option?.image || null"
                                />
                                <div class="d-flex flex-column">
                                    <div>{{ option.name }}</div>
                                    <div class="text-muted" v-if="option.position">{{ option.position }}</div>
                                </div>
                            </div>
                        </template>
                    </SelectBox>
                </template>
                <template v-else>
                    <div class="customer-avatar-container">
                        <DefaultAvatar size="medium" :title="'Нет пользователей'" />
                        <div class="customer-info">
                            <div class="customer-name">—</div>
                            <div class="customer-position">Должность вакантна</div>
                        </div>
                    </div>
                </template>
                <div v-if="errorCurator" class="error-message">
                    {{ errorCurator }}
                </div>
                <div v-if="showComments" class="comment-section">
                    <textarea
                        v-model="internalCommentsCurator"
                        class="comment-input"
                        placeholder="Комментарий эксперта..."
                        rows="2"
                    ></textarea>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label required">
                    Заказчик проекта
                </label>
                <template v-if="customerCandidates && customerCandidates.length > 0">
                    <SelectBox
                        class="curator-select"
                        v-model="selectedCustomerId"
                        :options="customerCandidates"
                        :valueKey="'id'"
                        :labelKey="'name'"
                        :includeAllOption="false"
                        :disabled="!customerCandidates || customerCandidates.length === 0"
                        allLabel="Выберите заказчика"
                    >
                        <template #selected="{ option, label }">
                            <div class="d-flex align-items-center gap-2 w-100">
                                <UserAvatar
                                    size="medium"
                                    :title="option?.name || label"
                                    :customAvatarUrl="option?.avatar_url || option?.avatar || option?.photo || option?.image || null"
                                />
                                <div class="d-flex flex-column flex-grow-1 overflow-hidden">
                                    <div class="text-truncate">{{ option?.name || label }}</div>
                                    <div class="text-muted text-truncate" v-if="option?.position">{{ option.position }}</div>
                                </div>
                            </div>
                        </template>
                        <template #option="{ option }">
                            <div class="d-flex align-items-center gap-2">
                                <UserAvatar
                                    size="medium"
                                    :title="option.name"
                                    :customAvatarUrl="option?.avatar_url || option?.avatar || option?.photo || option?.image || null"
                                />
                                <div class="d-flex flex-column">
                                    <div>{{ option.name }}</div>
                                    <div class="text-muted" v-if="option.position">{{ option.position }}</div>
                                </div>
                            </div>
                        </template>
                    </SelectBox>
                </template>
                <template v-else>
                    <div class="customer-avatar-container">
                        <DefaultAvatar size="medium" :title="'Нет пользователей'" />
                        <div class="customer-info">
                            <div class="customer-name">—</div>
                            <div class="customer-position">Нет пользователей с ролью «Ректор»</div>
                        </div>
                    </div>
                </template>
                <div v-if="showComments" class="comment-section">
                    <textarea
                        v-model="internalCommentsCustomer"
                        class="comment-input"
                        placeholder="Комментарий эксперта..."
                        rows="2"
                    ></textarea>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label required">
                    Руководитель проекта
                </label>
                <div class="manager-display">
                    <div class="manager-avatar-container">
                        <UserAvatar
                            size="medium"
                            :title="managerDisplayName"
                        />
                        <div class="manager-info">
                            <div class="manager-name">{{ managerDisplayName }}</div>
                            <div class="manager-position">{{ userInfo?.position || 'Руководитель проекта' }}</div>
                        </div>
                    </div>
                </div>
                <div v-if="showComments" class="comment-section">
                    <textarea
                        v-model="internalCommentsManager"
                        class="comment-input"
                        placeholder="Комментарий эксперта..."
                        rows="2"
                    ></textarea>
                </div>
            </div>
        </div>
    </div>
    
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import DefaultAvatar from '@/components/DefaultAvatar.vue'
import UserAvatar from '@/modules/crm/project-ed/components/UserAvatar.vue'
import SelectBox from '@/components/SelectBox.vue'
import { apiClient } from '@/js/api/manager.js'

const props = defineProps({
    curator: {
        type: [String, Number, null],
        default: null
    },
    customer: {
        type: String,
        default: ''
    },
    userInfo: {
        type: Object,
        default: null
    },
    showComments: {
        type: Boolean,
        default: false
    },
    errorCurator: {
        type: String,
        default: ''
    },
    commentsCurator: {
        type: String,
        default: ''
    },
    commentsCustomer: {
        type: String,
        default: ''
    },
    commentsManager: {
        type: String,
        default: ''
    }
})

const emit = defineEmits(['update:curator', 'update:customer', 'update:commentsCurator', 'update:commentsCustomer', 'update:commentsManager'])

const internalCurator = ref(props.curator)
const internalCustomer = ref(props.customer)
const internalCommentsCurator = ref(props.commentsCurator)
const internalCommentsCustomer = ref(props.commentsCustomer)
const internalCommentsManager = ref(props.commentsManager)

watch(() => props.curator, (v) => { internalCurator.value = v })
watch(() => props.customer, (v) => { internalCustomer.value = v })
watch(() => props.commentsCurator, (v) => { internalCommentsCurator.value = v })
watch(() => props.commentsCustomer, (v) => { internalCommentsCustomer.value = v })
watch(() => props.commentsManager, (v) => { internalCommentsManager.value = v })

watch(internalCurator, (v) => emit('update:curator', v))
watch(internalCustomer, (v) => emit('update:customer', v))
watch(internalCommentsCurator, (v) => emit('update:commentsCurator', v))
watch(internalCommentsCustomer, (v) => emit('update:commentsCustomer', v))
watch(internalCommentsManager, (v) => emit('update:commentsManager', v))

const customerCandidates = ref([])
const selectedCustomerId = ref(null)
const prorectorCandidates = ref([])

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
            avatar_url: u.avatar_url || u.avatar || u.photo || u.image || null,
        }))

        if (customerCandidates.value.length === 1) {
            const only = customerCandidates.value[0]
            selectedCustomerId.value = only.id
            internalCustomer.value = only.name
        }
    } catch (e) {
        customerCandidates.value = []
    }
}

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
            avatar_url: u.avatar_url || u.avatar || u.photo || u.image || null,
        }))

        if (!prorectorCandidates.value.some(p => String(p.id) === String(internalCurator.value))) {
            internalCurator.value = null
        }
    } catch (e) {
        prorectorCandidates.value = []
        if (internalCurator.value) internalCurator.value = null
    }
}

watch(selectedCustomerId, (newId) => {
    const found = customerCandidates.value.find(p => p.id === newId)
    if (found) {
        internalCustomer.value = found.name
    }
})

onMounted(() => {
    resolveCustomerFromApi()
    resolveCuratorsFromApi()
})

// Отображаемое имя руководителя
const managerDisplayName = computed(() => {
    if (!props.userInfo) return '—'
    
    const firstName = props.userInfo.first_name || ''
    const lastName = props.userInfo.last_name || ''
    const middleName = props.userInfo.middle_name || ''
    
    // Формируем полное имя: Фамилия Имя Отчество
    const fullName = [lastName, firstName, middleName]
        .filter(part => part.trim() !== '')
        .join(' ')
        .trim()
    
    return fullName || props.userInfo.username || '—'
})

</script>

<style scoped lang="scss">
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

.curator-select:deep(.select-trigger) {
    background: var(--color-secondary-background) !important;
    border: 1px solid var(--color-border) !important;
    border-radius: 8px !important;
    min-height: 56px;
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

.error-message {
    color: #dc3545;
    font-size: 0.875rem;
    margin-top: 0.5rem;
    padding: 0.5rem;
    background: #f8d7da;
    border: 1px solid #f5c6cb;
    border-radius: 4px;
}

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
}

</style>


