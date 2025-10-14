<template>
  <div class="sp-page-container">
    <HeaderBar />
    <div class="sp-content-container">
      <router-view />
    </div>
  </div>
  
</template>

<script>
import HeaderBar from '@/modules/crm/project-ed/components/HeaderBar.vue'

export default {
  name: 'StrategicProjectsParentLayout',
  components: { HeaderBar }
}
</script>

<style scoped>
.sp-page-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0 2rem;
}

.sp-content-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: auto;
  padding-top: 1rem;
}
</style>