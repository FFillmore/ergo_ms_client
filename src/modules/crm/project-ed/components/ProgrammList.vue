<template>
    <div class="programm-list">
        <EventList
            v-if="selectedTab === 'events'"
            :items="events"
            :years-range="[2023, 2032]"
            :projects="projects"
            :categories="categories"
            :force-demo="true"
        />
        <TargetIndicatorsList
            v-else-if="selectedTab === 'kpis'"
            :items="targetIndicators"
            :years-range="[2023, 2032]"
            :projects="projects"
            :categories="categories"
        />
        <div v-else class="placeholder card p-4 text-center">
            Раздел в разработке
        </div>
    </div>
</template>

<script setup>
import EventList from './EventList.vue'
import TargetIndicatorsList from './TargetIndicatorsList.vue'

defineProps({
    selectedTab: { type: String, default: 'events' },
})

// Временные мок-данные для отображения
const projects = [
    { id: 1, name: 'Стратегический проект 1' },
    { id: 2, name: 'Стратегический проект 2' },
]

const categories = ['А', 'Б']

// Мок-данные: одна строка МП3 с длинным контейнером
const events = [
    {
        id: 'MP3',
        code: 'МП3',
        projectId: 1,
        blockCode: 'МП3',
        block: 'МП3',
        name: 'Создание условий для воспитания у обучающихся активной гражданской позиции и ответственности, основанных на традиционных культурных, духовных и нравственных ценностях общества',
        results: '',
        values: { 2025: null, 2032: null },
        leaders: [],
    },
]

// временные данные для целевых показателей (структура как у events)
const targetIndicators = [
    {
        id: 101,
        projectId: 1,
        category: 'А',
        kpiName: 'Индекс цитируемости',
        unit: 'ед.',
        block: 'Публикации',
        values: { 2023: 1.2, 2024: 1.5, 2025: 1.7 },
    },
    {
        id: 102,
        projectId: 2,
        category: 'Б',
        kpiName: 'Доля трудоустройства выпускников',
        unit: '%',
        block: 'Карьера',
        values: { 2023: 70, 2024: 75, 2025: 80 },
    },
]
</script>

<style scoped>
.placeholder { background-color: var(--color-primary-background); }
</style>


