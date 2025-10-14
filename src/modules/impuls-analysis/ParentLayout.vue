<template>
  <div class="impuls-analysis-layout">
    

    <div class="card mb-4">
      <div class="card-body p-3">
        <NavigationButtons :data="navigationButtons" />
      </div>
    </div>

    <RouterView />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { FileText, List, FileCheck } from 'lucide-vue-next'
import NavigationButtons from '@/components/NavigationButtons.vue'

// Навигационные кнопки для модуля импульс-анализа
const navigationButtons = computed(() => [
  {
    icon: FileText,
    title: 'Загрузка файлов',
    link: 'ImpulsAnalysisMain'
  },
  {
    icon: List,
    title: 'Мои анализы',
    link: 'ImpulsAnalysisList'
  },
  {
    icon: FileCheck,
    title: 'Протоколы',
    link: 'ImpulsAnalysisProtocols'
  }
])
</script>

<style lang="scss" scoped>
.impuls-analysis-layout {
  padding: 20px 0;
}
</style>
