<template>
  <div class="review-comment-item">
    <div class="review-comment-header">
      <span class="review-comment-author">{{ comment.author }}</span>
      <span class="review-comment-date">{{ formattedDate }}</span>
    </div>
    <div class="review-comment-text">{{ comment.text }}</div>
    <div class="review-comment-type" v-if="comment.type">
      <span class="badge" :class="badgeClass">
        {{ badgeLabel }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  comment: {
    type: Object,
    required: true
  }
})

const formattedDate = computed(() => {
  if (!props.comment?.date) return ''
  const date = new Date(props.comment.date)
  return date.toLocaleDateString('ru-RU')
})

const badgeClass = computed(() => {
  const type = props.comment?.type
  const classes = {
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
    info: 'bg-info'
  }
  return classes[type] || 'bg-secondary'
})

const badgeLabel = computed(() => {
  const type = props.comment?.type
  const labels = {
    success: 'Положительно',
    warning: 'Замечание',
    danger: 'Критично',
    info: 'Информация'
  }
  return labels[type] || 'Замечание'
})
</script>

<style scoped lang="scss">
.review-comment-item {
  padding: 0.75rem;
  background: var(--color-secondary-background);
  border-radius: 6px;
  border-left: 3px solid var(--color-border);
}

.review-comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.review-comment-author {
  font-weight: 500;
  color: var(--color-primary-text);
}

.review-comment-date {
  font-size: 0.75rem;
  color: var(--color-secondary-text);
}

.review-comment-text {
  margin-bottom: 0.5rem;
  color: var(--color-primary-text);
  line-height: 1.4;
}

.review-comment-type {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .review-comment-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>