<template>
  <div 
    class="card"
    :draggable="canManageTasks"
    @dragstart="canManageTasks && $emit('dragstart', $event)"
  >
    <div class="card-color-bar" :style="{ backgroundColor: card.color || '#6366f1' }"></div>
    <div v-if="canManageTasks" class="card-actions">
      <button class="card-action-btn" @click.stop="$emit('edit')" :title="$t('edit')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      </button>
      <button class="card-action-btn danger" @click.stop="$emit('delete')" :title="$t('delete')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
      </button>
    </div>
    <div class="card-title">{{ card.title }}</div>
    <div v-if="card.description" class="card-description">{{ card.description }}</div>
  </div>
</template>

<script>
export default {
  name: 'Card',
  props: {
    card: { type: Object, required: true },
    canManageTasks: { type: Boolean, default: true }
  },
  emits: ['edit', 'delete', 'dragstart']
}
</script>
