<template>
  <div class="form-section">
    <div class="section-header">
      <h3 class="section-title">{{ title }}</h3>
      <p class="section-subtitle">{{ subtitle }}</p>
    </div>
    <div class="section-content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FormSection',
  props: {
    title: {
      type: String,
      required: true
    },
    subtitle: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>
.form-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section-header {
  margin-bottom: 1rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 0.5rem 0;
}

.section-subtitle {
  font-size: 0.9rem;
  color: #718096;
  margin: 0;
  line-height: 1.4;
}

.section-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
</style>
