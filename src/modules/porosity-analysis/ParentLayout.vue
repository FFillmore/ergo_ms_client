<template>
  <div class="porosity-analysis-layout">
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
import { Microscope, List } from 'lucide-vue-next'
import NavigationButtons from '@/components/NavigationButtons.vue'

const navigationButtons = computed(() => [
  {
    icon: Microscope,
    title: 'Создание анализа',
    link: 'PorosityAnalysisMain'
  },
  {
    icon: List,
    title: 'Мои анализы',
    link: 'PorosityAnalysisList'
  }
])
</script>

<style scoped>
.porosity-analysis-layout {
  padding: 20px 0;
}
</style>