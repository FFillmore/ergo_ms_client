<template>
    <div class="additional-info">
        <div class="step-header">
            <h2 class="step-title">Дополнительная информация</h2>
            <p class="step-description">
                Укажите дополнительную информацию о проекте
            </p>
        </div>

        <div class="form-content">
            <form class="info-form">
                <div class="form-section">              
                    <div class="form-group">
                        <textarea
                            id="additionalInfo"
                            v-model="localInfo.additionalInfo"
                            class="form-textarea"
                            rows="8"
                            placeholder="Введите любую дополнительную информацию о проекте..."
                        ></textarea>
                    </div>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
    info: {
        type: Object,
        required: true
    }
})

const emit = defineEmits(['update:info'])

// Локальные данные
const localInfo = ref({
    additionalInfo: props.info.additionalInfo || ''
})

// Следим за изменениями и обновляем родительский компонент
watch(localInfo, (newValue) => {
    emit('update:info', newValue)
}, { deep: true })
</script>

<style scoped lang="scss">
.additional-info {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.step-header {
    text-align: center;
    margin-bottom: 1rem;
}

.step-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #212529;
    margin: 0 0 0.5rem 0;
}

.step-description {
    color: #6c757d;
    margin: 0;
}

.form-content {
    flex: 1;
}

.info-form {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.form-section {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 1.5rem;
    border: 1px solid #dee2e6;
}

.form-group {
    display: flex;
    flex-direction: column;
    margin-bottom: 1.5rem;

    &:last-child {
        margin-bottom: 0;
    }
}

.form-textarea {
    padding: 0.75rem;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    resize: vertical;
    min-height: 200px;

    &:focus {
        outline: none;
        border-color: #0d6efd;
        box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
    }

    &::placeholder {
        color: #6c757d;
    }
}
</style>
