<template>
    <div class="stages-reports-page">
        <div class="stages-container">
            <h3 class="mb-4">Отчёты по этапам</h3>
            <div class="stages-grid">
                <div
                    v-for="stage in stages"
                    :key="stage.id"
                    class="stage-card"
                    :class="{ active: selectedStage?.id === stage.id }"
                    role="button"
                    tabindex="0"
                    @click="selectStage(stage)"
                    @keyup.enter="selectStage(stage)"
                >
                    <div class="stage-content">
                        <div class="stage-number-text">Этап {{ stage.number }}</div>
                        <div class="stage-title">{{ stage.title }}</div>
                    </div>
                </div>
            </div>
            
            <div v-if="selectedStage" class="selected-stage-info">
                <div class="stage-details">
                    <h5 class="mb-4">Этап {{ selectedStage.number }}</h5>
                    
                    <div class="form-group mb-3">
                        <label class="form-label">Наименование этапа</label>
                        <input type="text" class="form-control" :value="selectedStage.title" readonly />
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label class="form-label">Дата начала</label>
                                <div class="input-group">
                                    <input type="text" class="form-control" value="01.10.2025" readonly />
                                    <span class="input-group-text">
                                        <i class="bi bi-question-circle"></i>
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label class="form-label">Дата окончания</label>
                                <div class="input-group">
                                    <input type="text" class="form-control" value="31.12.2025" readonly />
                                    <span class="input-group-text">
                                        <i class="bi bi-question-circle"></i>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group mb-4">
                        <label class="form-label">Планируемые результаты работы</label>
                        <textarea class="form-control" rows="3" readonly>Бла бла</textarea>
                    </div>
                    
                    <div class="budget-section">                      
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label class="form-label">Заработная плата, руб.</label>
                                    <div class="row g-2">
                                        <div class="col-6">
                                            <input type="text" class="form-control" placeholder="Внебюджет" readonly />
                                        </div>
                                        <div class="col-6">
                                            <input type="text" class="form-control" placeholder="Бюджет" readonly />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label class="form-label">Другие расходы, руб.</label>
                                    <div class="row g-2">
                                        <div class="col-6">
                                            <input type="text" class="form-control" placeholder="Внебюджет" readonly />
                                        </div>
                                        <div class="col-6">
                                            <input type="text" class="form-control" placeholder="Бюджет" readonly />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Описание фактически выполненных работ</label>
                        <textarea class="form-control" rows="4" style="resize: vertical;" placeholder="Опишите, какие работы были фактически выполнены по данному этапу"></textarea>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="print-btn">Распечатать</button>
                        <button type="button" class="save-btn">Сохранить</button>
                    </div>
                </div>
            </div>
            
            <div v-else class="no-selection">
                <h5 class="mb-3 text-muted">Выберите этап</h5>
                <div class="text-muted">
                    Выберите этап из списка выше для просмотра подробной информации
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const stages = ref([
    {
        id: 1,
        number: 1,
        title: 'Разработка входной анкеты участников программы повышения квалификации',
        description: 'Разработка входной анкеты участников программы повышения квалификации научно-педагогических работников для реализации образовательного трека сопровождения обучающихся при подготовке и защите ВКР в формате «Стартап как диплом» и анализ ожиданий',
        status: 'Завершён'
    },
    {
        id: 2,
        number: 2,
        title: 'Проведение программы повышения квалификации',
        description: 'Проведение программы повышения квалификации научно-педагогических работников университета для реализации образовательного трека сопровождения обучающихся при подготовке и защите ВКР в формате «Стартап как диплом»',
        status: 'В процессе'
    },
    {
        id: 3,
        number: 3,
        title: 'Разработка анкеты обратной связи и анализ результатов',
        description: 'Разработка анкеты обратной связи участников программы повышения квалификации научно-педагогических работников для реализации образовательного трека сопровождения обучающихся при подготовке и защите ВКР в формате «Стартап как диплом», анализ ответов и подготовка предложений в целях дальнейшего совершенствования программы',
        status: 'Планируется'
    }
])

const selectedStage = ref(null)

function selectStage(stage) {
    selectedStage.value = stage
    console.log('Выбран этап:', stage.title)
    // Здесь будет логика для открытия отчёта по выбранному этапу
}
</script>

<style scoped lang="scss">
.stages-reports-page {
    padding: 1rem 0.5rem 0;
}

.stages-container {
    max-width: 1200px;
    margin: 0 auto;
}

.stages-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.stage-card {
    display: flex;
    align-items: flex-start;
    padding: 1.5rem;
    border: 1px solid rgba(0, 0, 0, 0.15);
    border-radius: 0.75rem;
    background-color: #fff;
    cursor: pointer;
    user-select: none;
    transition: all 0.2s ease;
    position: relative;
    min-height: 80px;

    &:hover {
        background-color: #f8f9fa;
        border-color: #0d6efd;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    &.active {
        background-color: #e7f1ff;
        border-color: #0d6efd;
        box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.15);
    }

    &:focus {
        outline: none;
        background-color: #e7f1ff;
        box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.15);
    }
}

.stage-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
}

.stage-number-text {
    font-size: 0.9rem;
    font-weight: 600;
    color: #0d6efd;
    line-height: 1.2;
}

.stage-title {
    font-size: 1rem;
    font-weight: 600;
    color: #212529;
    margin: 0;
    line-height: 1.3;
}

.selected-stage-info {
    border: 1px solid rgba(0, 0, 0, 0.15);
    border-radius: 0.75rem;
    background-color: #fff;
    padding: 2rem;
    min-height: 300px;
}

.stage-details {
    h5 {
        color: #212529;
        font-weight: 600;
    }
}

.budget-section {
    margin-top: 1.5rem;
}

.budget-section h6 {
    color: #495057;
    font-weight: 600;
}

.form-group {
    margin-bottom: 1rem;
}

.form-label {
    font-weight: 500;
    color: #495057;
    margin-bottom: 0.5rem;
}

.form-control[readonly] {
    background-color: #f8f9fa;
    border-color: #e9ecef;
    color: #6c757d;
}

.input-group-text {
    background-color: #f8f9fa;
    border-color: #e9ecef;
    color: #6c757d;
}

.form-actions {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid #dee2e6;
}

.print-btn, .save-btn {
    padding: 0.75rem 2rem;
    border: none;
    border-radius: 0.5rem;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 140px;
}

.print-btn {
    background-color: #f8f9fa;
    color: #6c757d;
    border: 1px solid #dee2e6;
}

.print-btn:hover {
    background-color: #e9ecef;
    border-color: #adb5bd;
}

.save-btn {
    background-color: #0d6efd;
    color: white;
}

.save-btn:hover {
    background-color: #0b5ed7;
}

.no-selection {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 300px;
    text-align: center;
    border: 1px solid rgba(0, 0, 0, 0.15);
    border-radius: 0.75rem;
    background-color: #fff;
}

// Адаптивность для мобильных устройств
@media (max-width: 768px) {
    .stages-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
    }
    
    .stage-card {
        padding: 1rem;
        min-height: 70px;
    }
    
    .stage-number-text {
        font-size: 0.8rem;
    }
    
    .stage-title {
        font-size: 0.9rem;
    }
    
    
    .selected-stage-info {
        padding: 1.5rem;
        min-height: 250px;
    }
}

@media (max-width: 480px) {
    .stages-reports-page {
        padding: 0.5rem;
    }
    
    .stage-card {
        padding: 0.75rem;
        min-height: 60px;
    }
    
    .stage-number-text {
        font-size: 0.75rem;
    }
    
    .stage-title {
        font-size: 0.85rem;
    }
    
    
    .selected-stage-info {
        padding: 1rem;
        min-height: 200px;
    }
}
</style>