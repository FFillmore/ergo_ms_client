<template>
    <div class="page-container">
        <HeaderBar />
        <Breadcrumbs :items="breadcrumbItems" class="mt-3" />
        <div class="page-content">
            <h3>Служебная страница</h3>
            <div class="card p-3">
                <div class="d-flex flex-column gap-2">
                    <div>Внутренние служебные функции и ссылки.</div>
                    <div class="d-flex flex-column gap-2">
                        <router-link :to="{ name: 'ProjectEdProgramDevelopment' }" class="btn btn-outline-primary align-self-start">
                            Перейти к программе развития БГТУ
                        </router-link>
                        <router-link :to="{ name: 'ProjectEdTargetIndicators' }" class="btn btn-outline-primary align-self-start">
                            Перейти к целевым показателям
                        </router-link>
                        <router-link :to="{ name: 'ProjectEdSchemas' }" class="btn btn-outline-primary align-self-start">
                            Перейти к таблицам
                        </router-link>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { Home, Wrench } from 'lucide-vue-next'
import HeaderBar from '@/modules/crm/project-ed/components/HeaderBar.vue'
import Breadcrumbs from '@/modules/crm/project-ed/components/Breadcrumbs.vue'

const breadcrumbItems = ref([
    { label: 'Главная', icon: Home, to: { name: 'ProjectEdMain' } },
    { label: 'Служебная страница', icon: Wrench }
])
</script>

<style scoped lang="scss">
.page-container { display: flex; flex-direction: column; height: 100%; }
.page-content { flex: 1; display: flex; flex-direction: column; gap: 1rem; }
</style>