<template>
  <div class="page-header">
    <div class="header-content">
      <div class="page-title-section">
        <div class="page-icon">
          <component :is="icon" :size="28" color="white" />
        </div>
        <div class="page-title">
          <h1>{{ title }}</h1>
          <p class="page-subtitle">{{ subtitle }}</p>
        </div>
      </div>
    </div>
    <div v-if="$slots.actions" class="header-actions">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PageHeader',
  props: {
    title: {
      type: String,
      required: true
    },
    subtitle: {
      type: String,
      default: ''
    },
    icon: {
      type: [String, Object, Function],
      required: true
    }
  }
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  background: white;
  padding: 1.5rem;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
}

.page-title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.page-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
  box-shadow: 0 4px 12px rgba(13, 110, 253, 0.3);
}

.page-title h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--bs-heading-color);
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  color: var(--bs-secondary-color);
  margin: 0;
  font-size: 1rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .page-icon {
    width: 48px;
    height: 48px;
  }
  
  .page-title h1 {
    font-size: 1.5rem;
  }
}
</style>
